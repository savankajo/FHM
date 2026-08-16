import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';

export async function POST(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'events', 'add')) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    try {
        const firstLocation = body.locations?.[0];
        const event = await prisma.event.create({
            data: {
                title: body.title,
                description: body.description,
                votingDeadline: body.votingDeadline,
                locations: body.locations,
                startTime: firstLocation?.startTime ? new Date(firstLocation.startTime) : null,
                endTime: firstLocation?.endTime ? new Date(firstLocation.endTime) : null,
                location: firstLocation?.name || firstLocation?.address || null,
                visibility: body.audienceTeamIds?.length ? 'TEAM' : 'PUBLIC',
                teamId: body.audienceTeamIds?.length === 1 ? body.audienceTeamIds[0] : null,
                isRecurring: Boolean(body.isRecurring),
                recurrenceRule: body.recurrenceRule || null,
                createdByUserId: session!.userId,
                teamScope: body.audienceTeamIds?.length ? 'RESTRICTED' : null,
                teams: body.audienceTeamIds?.length ? { connect: body.audienceTeamIds.map((id: string) => ({ id })) } : undefined
            }
        });

        if (body.audienceTeamIds?.length) {
            const members = await prisma.user.findMany({ where: { teams: { some: { id: { in: body.audienceTeamIds } } } }, select: { id: true, notificationPreferences: true, teams: { where: { id: { in: body.audienceTeamIds } }, select: { id: true } } } });
            await prisma.invitation.createMany({ data: members.flatMap(member => member.teams.map(team => ({ eventId: event.id, teamId: team.id, userId: member.id }))), skipDuplicates: true });
            const recipients = members.filter(member => (member.notificationPreferences as { invitations?: boolean } | null)?.invitations !== false);
            if (recipients.length) await prisma.notification.createMany({ data: recipients.map(member => ({ userId: member.id, eventId: event.id, type: 'INVITATION', title: `Invitation: ${event.title}`, body: 'Your team has a new event. Open it to review the details and register.', href: `/events/${event.id}` })) });
        }

        return NextResponse.json({ event });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
