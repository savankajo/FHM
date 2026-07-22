import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';

export async function POST(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'events', 'add')) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    try {
        const event = await prisma.event.create({
            data: {
                title: body.title,
                description: body.description,
                votingDeadline: body.votingDeadline,
                locations: body.locations,
                createdByUserId: session!.userId,
                teamScope: body.audienceTeamIds?.length ? 'RESTRICTED' : null,
                teams: body.audienceTeamIds?.length ? { connect: body.audienceTeamIds.map((id: string) => ({ id })) } : undefined
            }
        });

        return NextResponse.json({ event });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
