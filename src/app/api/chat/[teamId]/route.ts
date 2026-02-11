import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
    const messages = await prisma.chatMessage.findMany({
        where: {
            teamId,
            expiresAt: { gt: new Date() } // Only future expiration
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

    if (!text || !text.trim()) {
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
