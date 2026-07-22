import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!await canManage(session?.userId, session?.role, 'events', 'edit')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, votingDeadline, locations, audienceTeamIds = [] } = body;

        const updatedEvent = await prisma.event.update({
            where: { id: params.id },
            data: {
                title,
                description,
                votingDeadline: votingDeadline ? new Date(votingDeadline) : null,
                locations: locations || [],
                teamScope: audienceTeamIds.length ? 'RESTRICTED' : null,
                teams: { set: audienceTeamIds.map((id: string) => ({ id })) }
            }
        });

        return NextResponse.json(updatedEvent);
    } catch (error) {
        console.error('Update event error:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!await canManage(session?.userId, session?.role, 'events', 'remove')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.eventVote.deleteMany({ where: { eventId: params.id } });
        await prisma.event.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete event error:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
