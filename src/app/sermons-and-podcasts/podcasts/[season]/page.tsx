import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canSeeAudience } from '@/lib/audience';
import { ensureAbsoluteUrl } from '@/lib/utils';
import { getPodcastSeason, PodcastSeason } from '@/lib/media-metadata';

export const dynamic = 'force-dynamic';

const seasonTitles: Record<PodcastSeason, string> = {
    'season-1': 'Coffee With the Shepherd',
    'season-2': 'Season 2',
};

export default async function PodcastSeasonPage({ params }: { params: { season: string } }) {
    if (params.season !== 'season-1' && params.season !== 'season-2') notFound();
    const season = params.season as PodcastSeason;
    const session = await getSession();
    const isAdmin = session?.role === 'ADMIN';
    const teams = session ? await prisma.team.findMany({ where: { members: { some: { id: session.userId } } }, select: { id: true } }) : [];
    const teamIds = teams.map(team => team.id);
    const podcasts = (await prisma.podcastEpisode.findMany({ orderBy: { publishedAt: 'desc' }, take: 300 }))
        .filter(item => canSeeAudience(item.audienceTeamIds, teamIds, isAdmin))
        .filter(item => getPodcastSeason(item.description) === season);

    if (podcasts.length === 0 && season === 'season-1') notFound();

    return (
        <div className="media-page">
            <header className="page-header">
                <Link href="/sermons-and-podcasts" className="page-back-btn" aria-label="Back to Media">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1 className="page-title">{seasonTitles[season]}</h1>
                    <p className="page-kicker">{podcasts.length} episode{podcasts.length === 1 ? '' : 's'}</p>
                </div>
            </header>

            {podcasts.length === 0 ? (
                <div className="empty-state media-empty-state">
                    <div className="empty-state-icon">Soon</div>
                    <h2>Coming Soon</h2>
                    <p>No episodes have been uploaded for this season yet.</p>
                </div>
            ) : (
                <div className="media-list">
                    {podcasts.map(podcast => (
                        <a key={podcast.id} href={ensureAbsoluteUrl(podcast.audioUrl)} target="_blank" rel="noopener noreferrer" className="media-list-card">
                            <div
                                className="media-list-thumb"
                                style={podcast.thumbnailUrl ? { backgroundImage: `url(${podcast.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(135deg, #2b183f, #8a4a21)' }}
                            />
                            <div className="media-list-info">
                                <div className="media-list-title">{podcast.title}</div>
                                <div className="media-list-meta">{new Date(podcast.publishedAt).toLocaleDateString()}</div>
                            </div>
                            <div className="media-list-arrow">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 17 17 7" />
                                    <path d="M8 7h9v9" />
                                </svg>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
