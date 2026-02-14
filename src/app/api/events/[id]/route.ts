import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();

        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, votingDeadline, locations } = body;

        const updatedEvent = await prisma.event.update({
            where: { id: params.id },
            data: {
                title,
                description,
                votingDeadline: votingDeadline ? new Date(votingDeadline) : null,
                locations: locations || []
            }
        });

        return NextResponse.json(updatedEvent);
    } catch (error) {
        console.error('Update event error:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();

        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete all votes first (cascade)
        await prisma.eventVote.deleteMany({
            where: { eventId: params.id }
        });

        // Delete the event
        await prisma.event.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete event error:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
