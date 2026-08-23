import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canManage } from '@/lib/permissions';
import DeleteTeamButton from './[id]/delete-team-button';
import { audienceIds } from '@/lib/audience';

export const dynamic = 'force-dynamic';

export default async function AdminTeamsPage() {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'teams', 'edit')) redirect('/');
    const teams = await prisma.team.findMany({
        include: { _count: { select: { members: true } } },
        orderBy: { name: 'asc' },
    });
    const [sermons, podcasts, articles, events] = await Promise.all([
        prisma.sermon.findMany({ select: { audienceTeamIds: true } }),
        prisma.podcastEpisode.findMany({ select: { audienceTeamIds: true } }),
        prisma.article.findMany({ select: { audienceTeamIds: true } }),
        prisma.event.findMany({ select: { teamId: true, teams: { select: { id: true } } } }),
    ]);
    const impactFor = (teamId: string) => ({
        sermons: sermons.filter(item => audienceIds(item.audienceTeamIds).includes(teamId)).length,
        podcasts: podcasts.filter(item => audienceIds(item.audienceTeamIds).includes(teamId)).length,
        articles: articles.filter(item => audienceIds(item.audienceTeamIds).includes(teamId)).length,
        events: events.filter(event => event.teamId === teamId || event.teams.some(team => team.id === teamId)).length,
    });

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin Dashboard">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Manage Teams</h1>
                        <p className="page-kicker">{teams.length} teams and service groups</p>
                    </div>
                </div>
                <Link href="/admin/teams/new" className="admin-list-create">+ New Team</Link>
            </div>

            <div className="admin-list-stack">
                {teams.length === 0 ? (
                    <div className="admin-empty-state">
                        <h2>No teams yet</h2>
                        <p>Create the first team or service group.</p>
                    </div>
                ) : (
                    teams.map(team => (
                        <div key={team.id} className="admin-list-card admin-team-list-row">
                            <Link href={`/admin/teams/${team.id}`} className="admin-team-row-link">
                                <div className="admin-list-card-main">
                                    <h2>{team.name}</h2>
                                    <p>{team._count.members} members</p>
                                </div>
                                <span className="admin-list-chevron" aria-hidden="true">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </span>
                            </Link>
                            <DeleteTeamButton teamId={team.id} teamName={team.name} impact={impactFor(team.id)} compact />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
