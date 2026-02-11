import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { eventId, status, selectedLocationIndex } = await request.json();

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
