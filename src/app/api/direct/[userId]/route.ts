import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canDirectMessage, conversationParticipants } from '@/lib/friendship';
import { getUgcAccess, moderateAndRecordText } from '@/lib/safety-service';
import { notifyDirectMessage } from '@/lib/notifications';

async function accessFor(userId: string, otherUserId: string) {
  const other = await prisma.user.findFirst({ where: { id: otherUserId, accountStatus: 'ACTIVE' }, select: { id: true, name: true } });
  if (!other || !await canDirectMessage(userId, otherUserId)) return null;
  return other;
}

async function conversationFor(userId: string, otherUserId: string) {
  const participants = conversationParticipants(userId, otherUserId);
  return prisma.directConversation.upsert({
    where: { participantLowId_participantHighId: participants },
    create: participants,
    update: {},
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { userId } = await params;
  const other = await accessFor(session.userId, userId);
  if (!other) return NextResponse.json({ error: 'Only accepted friends can message each other.' }, { status: 403 });
  const conversation = await conversationFor(session.userId, userId);
  const messages = await prisma.directMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true } } },
    take: 100,
  });
  return NextResponse.json({ conversationId: conversation.id, other, messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ugc = await getUgcAccess(session.userId);
  if (!ugc.allowed) return NextResponse.json({ error: ugc.error }, { status: ugc.status });
  const { userId } = await params;
  const other = await accessFor(session.userId, userId);
  if (!other) return NextResponse.json({ error: 'Only accepted friends can message each other.' }, { status: 403 });
  const { text } = await request.json();
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 1000) return NextResponse.json({ error: 'Messages must be between 1 and 1,000 characters.' }, { status: 422 });
  const moderation = await moderateAndRecordText({ text: text.trim(), surface: 'direct_message', userId: session.userId });
  if (!moderation.allowed) return NextResponse.json({ error: 'This message does not meet our Community Guidelines. Please revise it before sending.' }, { status: 422 });
  const conversation = await conversationFor(session.userId, userId);
  const message = await prisma.directMessage.create({
    data: { conversationId: conversation.id, userId: session.userId, text: text.trim() },
    include: { user: { select: { id: true, name: true } } },
  });
  try { await notifyDirectMessage({ messageId: message.id, recipientId: userId, senderId: session.userId, senderName: message.user.name, text: message.text }); } catch (error) { console.error('Direct-message notification failed:', error); }
  return NextResponse.json({ message }, { status: 201 });
}
