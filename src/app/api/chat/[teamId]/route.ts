import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const CHAT_PREFIX = '__FHM_CHAT__';
type PollPayload = { kind: 'poll'; question: string; options: Array<{ id: string; label: string; voterIds: string[] }> };

function validMessage(text: unknown) {
    if (typeof text !== 'string' || !text.trim()) return false;
    if (!text.startsWith(CHAT_PREFIX)) return text.trim().length <= 1000;
    try {
        const payload = JSON.parse(text.slice(CHAT_PREFIX.length));
        if (payload.kind === 'voice') return typeof payload.audio === 'string' && /^data:audio\/[\w.+-]+;base64,/.test(payload.audio) && payload.audio.length <= 700_000 && Number(payload.duration) > 0 && Number(payload.duration) <= 31;
        return payload.kind === 'poll' && typeof payload.question === 'string' && payload.question.trim().length <= 160 && Array.isArray(payload.options) && payload.options.length >= 2 && payload.options.length <= 6 && payload.options.every((option: { id?: unknown; label?: unknown; voterIds?: unknown }) => typeof option.id === 'string' && typeof option.label === 'string' && option.label.trim().length > 0 && option.label.length <= 80 && Array.isArray(option.voterIds));
    } catch { return false; }
}

// GET /api/chat/[teamId] - Get messages
export async function GET(
    request: Request,
    { params }: { params: { teamId: string } }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { teamId } = params;

    // Check membership
    const isMember = await prisma.team.findFirst({
        where: {
            id: teamId,
            members: { some: { id: session.userId } }
        }
    });

    if (!isMember && session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch messages that haven't expired
    const blocks = await prisma.userBlock.findMany({ where: { blockerId: session.userId }, select: { blockedId: true } });
    const messages = await prisma.chatMessage.findMany({
        where: {
            teamId,
            expiresAt: { gt: new Date() },
            userId: { notIn: blocks.map(block => block.blockedId) }
        },
        orderBy: { createdAt: 'asc' },
        include: {
            user: { select: { id: true, name: true } }
        },
        take: 50 // Limit to last 50
    });

    return NextResponse.json({ messages });
}

// POST /api/chat/[teamId] - Send message
export async function POST(
    request: Request,
    { params }: { params: { teamId: string } }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { teamId } = params;
    const { text } = await request.json();

    if (!validMessage(text)) {
        return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Check membership
    const isMember = await prisma.team.findFirst({
        where: {
            id: teamId,
            members: { some: { id: session.userId } }
        }
    });

    if (!isMember && session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Set expiration to 48 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const message = await prisma.chatMessage.create({
        data: {
            text,
            teamId,
            userId: session.userId,
            expiresAt
        },
        include: {
            user: { select: { id: true, name: true } }
        }
    });

    return NextResponse.json({ message });
}

export async function PATCH(request: Request, { params }: { params: { teamId: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const membership = await prisma.team.findFirst({ where: { id: params.teamId, members: { some: { id: session.userId } } }, select: { id: true } });
    if (!membership && session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { messageId, optionId } = await request.json();
    const message = await prisma.chatMessage.findFirst({ where: { id: messageId, teamId: params.teamId, expiresAt: { gt: new Date() } } });
    if (!message?.text.startsWith(CHAT_PREFIX)) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    try {
        const poll = JSON.parse(message.text.slice(CHAT_PREFIX.length)) as PollPayload;
        if (poll.kind !== 'poll' || !poll.options.some(option => option.id === optionId)) throw new Error('Invalid poll');
        poll.options = poll.options.map(option => ({ ...option, voterIds: option.voterIds.filter(id => id !== session.userId) }));
        const selected = poll.options.find(option => option.id === optionId)!;
        selected.voterIds.push(session.userId);
        const updated = await prisma.chatMessage.update({ where: { id: message.id }, data: { text: CHAT_PREFIX + JSON.stringify(poll) }, include: { user: { select: { id: true, name: true } } } });
        return NextResponse.json({ message: updated });
    } catch { return NextResponse.json({ error: 'Invalid poll' }, { status: 400 }); }
}
