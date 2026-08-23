import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';
import { audienceIds } from '@/lib/audience';

export async function GET() {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'teams', 'edit') && !await canManage(session?.userId, session?.role, 'media', 'edit') && !await canManage(session?.userId, session?.role, 'events', 'edit')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const teams = await prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    return NextResponse.json({ teams });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'teams', 'add')) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    try {
        const team = await prisma.team.create({
            data: {
                name: body.name,
                description: body.description
            }
        });

        return NextResponse.json({ team });
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'teams', 'edit')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const teamId = new URL(request.url).searchParams.get('id');
    if (!teamId) return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });

    try {
        await prisma.$transaction(async tx => {
            const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true } });
            if (!team) throw new Error('TEAM_NOT_FOUND');

            const [sermons, podcasts, articles, events] = await Promise.all([
                tx.sermon.findMany({ select: { id: true, audienceTeamIds: true } }),
                tx.podcastEpisode.findMany({ select: { id: true, audienceTeamIds: true } }),
                tx.article.findMany({ select: { id: true, audienceTeamIds: true } }),
                tx.event.findMany({
                    where: { OR: [{ teamId }, { teams: { some: { id: teamId } } }] },
                    select: { id: true, teamId: true, teams: { select: { id: true } } },
                }),
            ]);

            const stripAudience = (value: unknown) => audienceIds(value).filter(id => id !== teamId);
            await Promise.all([
                ...sermons.filter(item => audienceIds(item.audienceTeamIds).includes(teamId))
                    .map(item => tx.sermon.update({ where: { id: item.id }, data: { audienceTeamIds: stripAudience(item.audienceTeamIds) } })),
                ...podcasts.filter(item => audienceIds(item.audienceTeamIds).includes(teamId))
                    .map(item => tx.podcastEpisode.update({ where: { id: item.id }, data: { audienceTeamIds: stripAudience(item.audienceTeamIds) } })),
                ...articles.filter(item => audienceIds(item.audienceTeamIds).includes(teamId))
                    .map(item => tx.article.update({ where: { id: item.id }, data: { audienceTeamIds: stripAudience(item.audienceTeamIds) } })),
                ...events.map(event => {
                    const remainingTeams = event.teams.filter(team => team.id !== teamId);
                    return tx.event.update({
                        where: { id: event.id },
                        data: {
                            teams: { disconnect: { id: teamId } },
                            teamId: event.teamId === teamId ? null : event.teamId,
                            ...(remainingTeams.length === 0 ? { visibility: 'PUBLIC', teamScope: null } : {}),
                        },
                    });
                }),
            ]);

            await tx.chatMessage.deleteMany({ where: { teamId } });
            await tx.service.deleteMany({ where: { teamId } });
            await tx.team.delete({ where: { id: teamId } });
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === 'TEAM_NOT_FOUND') {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }
        console.error('Failed to delete team', error);
        return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
}
