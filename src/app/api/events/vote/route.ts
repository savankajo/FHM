import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { eventId, status, selectedLocationIndex } = await request.json();

    const event = await prisma.event.findFirst({
        where: session.role === 'ADMIN' ? { id: eventId } : {
            id: eventId,
            OR: [
                { teamScope: null },
                { teams: { some: { members: { some: { id: session.userId } } } } }
            ]
        },
        select: { id: true }
    });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    try {
        const vote = await prisma.eventVote.upsert({
            where: {
                eventId_userId: {
                    eventId,
                    userId: session.userId,
                },
            },
            update: {
                status,
                selectedLocationIndex,
            },
            create: {
                eventId,
                userId: session.userId,
                status,
                selectedLocationIndex,
            },
        });

        return NextResponse.json({ success: true, vote });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}
