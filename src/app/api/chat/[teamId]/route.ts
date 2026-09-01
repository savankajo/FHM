import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateVoiceDataUrl, hashModeratedContent } from '@/lib/moderation';
import { getUgcAccess, moderateAndRecordText } from '@/lib/safety-service';
import { Prisma } from '@prisma/client';

const CHAT_PREFIX = '__FHM_CHAT__';
type PollPayload = { kind: 'poll'; question: string; options: Array<{ id: string; label: string; voterIds: string[] }> };
type VoicePayload = { kind: 'voice'; audio: string; duration: number };

async function canAccessTeam(teamId: string, userId: string, role: string) {
  if (role === 'ADMIN') return true;
  return Boolean(await prisma.team.findFirst({ where: { id: teamId, members: { some: { id: userId } } }, select: { id: true } }));
}

async function validateAndModerateMessage(text: unknown, userId: string) {
  if (typeof text !== 'string' || !text.trim()) return { valid: false as const, error: 'Message required.' };
  if (!text.startsWith(CHAT_PREFIX)) {
    const cleanText = text.trim();
    if (cleanText.length > 1000) return { valid: false as const, error: 'Messages must be 1,000 characters or fewer.' };
    const result = await moderateAndRecordText({ text: cleanText, surface: 'team_chat_text', userId });
    if (!result.allowed) return { valid: false as const, error: 'This message does not meet our Community Guidelines. Please revise it before posting.' };
    return { valid: true as const, text: cleanText, contentType: 'TEXT' as const, moderationStatus: 'PUBLISHED' as const };
  }

  try {
    const payload = JSON.parse(text.slice(CHAT_PREFIX.length)) as PollPayload | VoicePayload;
    if (payload.kind === 'voice') {
      const duration = Number(payload.duration);
      if (!Number.isFinite(duration) || duration <= 0 || duration > 30) return { valid: false as const, error: 'Voice messages must be 30 seconds or shorter.' };
      const audio = validateVoiceDataUrl(payload.audio);
      if (!audio.valid) return { valid: false as const, error: audio.error };
      return { valid: true as const, text, contentType: 'VOICE' as const, moderationStatus: 'PENDING' as const };
    }
    if (payload.kind !== 'poll' || typeof payload.question !== 'string' || !Array.isArray(payload.options)) throw new Error('Invalid rich message');
    const question = payload.question.trim();
    if (!question || question.length > 160 || payload.options.length < 2 || payload.options.length > 6) throw new Error('Invalid poll');
    const options = payload.options.map(option => ({ id: String(option.id || ''), label: String(option.label || '').trim(), voterIds: [] as string[] }));
    if (options.some(option => !option.id || !option.label || option.label.length > 80)) throw new Error('Invalid poll');
    for (const value of [question, ...options.map(option => option.label)]) {
      const result = await moderateAndRecordText({ text: value, surface: 'team_chat_poll', userId });
      if (!result.allowed) return { valid: false as const, error: 'This poll does not meet our Community Guidelines. Please revise it before posting.' };
    }
    return { valid: true as const, text: CHAT_PREFIX + JSON.stringify({ kind: 'poll', question, options }), contentType: 'POLL' as const, moderationStatus: 'PUBLISHED' as const };
  } catch {
    return { valid: false as const, error: 'This message format is not supported.' };
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const access = await getUgcAccess(session.userId);
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!await canAccessTeam(teamId, session.userId, session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const blocks = await prisma.userBlock.findMany({ where: { blockerId: session.userId }, select: { blockedId: true } });
  const messages = await prisma.chatMessage.findMany({
    where: {
      teamId,
      expiresAt: { gt: new Date() },
      userId: { notIn: blocks.map(block => block.blockedId) },
      OR: [{ moderationStatus: 'PUBLISHED' }, { moderationStatus: 'PENDING', userId: session.userId }],
    },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true } } },
    take: 50,
  });
  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const access = await getUgcAccess(session.userId);
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!await canAccessTeam(teamId, session.userId, session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { text } = await request.json();
    const validated = await validateAndModerateMessage(text, session.userId);
    if (!validated.valid) return NextResponse.json({ error: validated.error }, { status: 422 });
    if (validated.moderationStatus === 'PENDING') {
      const alreadyPending = await prisma.chatMessage.findFirst({ where: { userId: session.userId, contentType: 'VOICE', moderationStatus: 'PENDING' }, select: { id: true } });
      if (alreadyPending) return NextResponse.json({ error: 'Your previous voice message is still being reviewed. Please wait before submitting another.' }, { status: 409 });
    }

    const message = await prisma.$transaction(async tx => {
      const created = await tx.chatMessage.create({
        data: {
          text: validated.text,
          teamId,
          userId: session.userId,
          contentType: validated.contentType,
          moderationStatus: validated.moderationStatus,
          moderationReason: validated.moderationStatus === 'PENDING' ? 'Awaiting authorized moderator review before publication.' : null,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
        include: { user: { select: { id: true, name: true } } },
      });
      if (validated.moderationStatus === 'PENDING') {
        await tx.contentModerationEvent.create({ data: { userId: session.userId, messageId: created.id, surface: 'team_chat_voice', outcome: 'MANUAL_REVIEW', categories: [], contentHash: hashModeratedContent(created.id) } });
      }
      return created;
    });
    return NextResponse.json({ message, pendingModeration: validated.moderationStatus === 'PENDING' }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Your previous voice message is still being reviewed. Please wait before submitting another.' }, { status: 409 });
    }
    console.error('Chat moderation failed closed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Safety review is temporarily unavailable. Your message was not posted. Please try again later.' }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const access = await getUgcAccess(session.userId);
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!await canAccessTeam(teamId, session.userId, session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { messageId, optionId } = await request.json();
  const message = await prisma.chatMessage.findFirst({ where: { id: messageId, teamId, expiresAt: { gt: new Date() }, moderationStatus: 'PUBLISHED', contentType: 'POLL' } });
  if (!message?.text.startsWith(CHAT_PREFIX)) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
  try {
    const poll = JSON.parse(message.text.slice(CHAT_PREFIX.length)) as PollPayload;
    if (poll.kind !== 'poll' || !poll.options.some(option => option.id === optionId)) throw new Error('Invalid poll');
    poll.options = poll.options.map(option => ({ ...option, voterIds: option.voterIds.filter(id => id !== session.userId) }));
    poll.options.find(option => option.id === optionId)!.voterIds.push(session.userId);
    const updated = await prisma.chatMessage.update({ where: { id: message.id }, data: { text: CHAT_PREFIX + JSON.stringify(poll) }, include: { user: { select: { id: true, name: true } } } });
    return NextResponse.json({ message: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid poll' }, { status: 400 });
  }
}
