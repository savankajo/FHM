import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canSeeAudience } from '@/lib/audience';
import { ensureAbsoluteUrl } from '@/lib/utils';
import { getSermonCollection, getYoutubePlaylistId, getYoutubePlaylistName } from '@/lib/media-metadata';

export const dynamic = 'force-dynamic';

export default async function SaturdayPlaylistVideosPage({ params, searchParams }: { params: { playlistId: string }; searchParams?: { q?: string } }) {
    const playlistId = decodeURIComponent(params.playlistId);
    const query = (searchParams?.q || '').trim().toLowerCase();
    const session = await getSession();
    const isAdmin = session?.role === 'ADMIN';
    const teams = session ? await prisma.team.findMany({ where: { members: { some: { id: session.userId } } }, select: { id: true } }) : [];
    const teamIds = teams.map(team => team.id);
    const allPlaylistSermons = (await prisma.sermon.findMany({ orderBy: { date: 'desc' }, take: 300 }))
        .filter(item => canSeeAudience(item.audienceTeamIds, teamIds, isAdmin))
        .filter(item => getSermonCollection(item.notes) === 'saturday')
        .filter(item => getYoutubePlaylistId(item.notes) === playlistId);

    if (allPlaylistSermons.length === 0) notFound();
    const playlistName = getYoutubePlaylistName(allPlaylistSermons[0].notes);
    const sermons = allPlaylistSermons.filter(sermon => sermon.title.toLowerCase().includes(query));

    return (
        <div className="media-page">
            <header className="page-header">
                <Link href="/sermons-and-podcasts/saturday" className="page-back-btn" aria-label="Back to Saturday Sermon playlists">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1 className="page-title">{playlistName}</h1>
                    <p className="page-kicker">{sermons.length} YouTube video{sermons.length === 1 ? '' : 's'}</p>
                </div>
            </header>

            <form className="media-search-wrap" action={`/sermons-and-podcasts/saturday/${encodeURIComponent(playlistId)}`}>
                <input
                    className="media-search-input"
                    type="search"
                    name="q"
                    defaultValue={searchParams?.q || ''}
                    placeholder="Search videos"
                    aria-label="Search videos in this playlist"
                />
            </form>

            <div className="media-list">
                {sermons.map(sermon => (
                    <a key={sermon.id} href={ensureAbsoluteUrl(sermon.videoUrl || `/sermons/${sermon.id}`)} target="_blank" rel="noopener noreferrer" className="media-list-card">
                        <div
                            className="media-list-thumb"
                            style={sermon.thumbnailUrl ? { backgroundImage: `url(${sermon.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                        />
                        <div className="media-list-info">
                            <div className="media-list-title media-list-title-wrap" dir="auto">{sermon.title}</div>
                            <div className="media-list-meta">{new Date(sermon.date).toLocaleDateString()}</div>
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
            {sermons.length === 0 && (
                <div className="empty-state media-empty-state">
                    <div className="empty-state-icon">Search</div>
                    <h2>No Videos Found</h2>
                    <p>Try another English or Arabic search term.</p>
                </div>
            )}
        </div>
    );
}
