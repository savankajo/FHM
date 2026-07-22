import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canSeeAudience } from '@/lib/audience';
import { getSermonCollection, getYoutubePlaylistId, getYoutubePlaylistName } from '@/lib/media-metadata';

export const dynamic = 'force-dynamic';

export default async function SaturdayPlaylistsPage({ searchParams }: { searchParams?: { q?: string } }) {
    const query = (searchParams?.q || '').trim().toLowerCase();
    const session = await getSession();
    const isAdmin = session?.role === 'ADMIN';
    const teams = session ? await prisma.team.findMany({ where: { members: { some: { id: session.userId } } }, select: { id: true } }) : [];
    const teamIds = teams.map(team => team.id);
    const sermons = (await prisma.sermon.findMany({ orderBy: { date: 'desc' }, take: 300 }))
        .filter(item => canSeeAudience(item.audienceTeamIds, teamIds, isAdmin))
        .filter(item => getSermonCollection(item.notes) === 'saturday');

    const playlists = Array.from(sermons.reduce((map, sermon) => {
        const id = getYoutubePlaylistId(sermon.notes);
        const name = getYoutubePlaylistName(sermon.notes);
        const current = map.get(id) || { id, name, count: 0, latestDate: sermon.date };
        current.count += 1;
        if (sermon.date > current.latestDate) current.latestDate = sermon.date;
        map.set(id, current);
        return map;
    }, new Map<string, { id: string; name: string; count: number; latestDate: Date }>()).values())
        .filter(playlist => playlist.name.toLowerCase().includes(query));

    return (
        <div className="media-page">
            <header className="page-header">
                <Link href="/sermons-and-podcasts" className="page-back-btn" aria-label="Back to Media">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1 className="page-title">Saturday Sermon</h1>
                    <p className="page-kicker">YouTube playlists</p>
                </div>
            </header>

            <form className="media-search-wrap" action="/sermons-and-podcasts/saturday">
                <input
                    className="media-search-input"
                    type="search"
                    name="q"
                    defaultValue={searchParams?.q || ''}
                    placeholder="Search playlists"
                    aria-label="Search Saturday Sermon playlists"
                />
            </form>

            <div className="media-list">
                {playlists.map(playlist => (
                    <Link key={playlist.id} href={`/sermons-and-podcasts/saturday/${encodeURIComponent(playlist.id)}`} className="media-list-card media-collection-card">
                        <div className="media-collection-mark orange">List</div>
                        <div className="media-list-info">
                            <div className="media-list-title media-list-title-wrap" dir="auto">{playlist.name}</div>
                            <div className="media-list-meta">{playlist.count} video{playlist.count === 1 ? '' : 's'}</div>
                        </div>
                        <div className="media-list-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
            {playlists.length === 0 && (
                <div className="empty-state media-empty-state">
                    <div className="empty-state-icon">Search</div>
                    <h2>No Playlists Found</h2>
                    <p>Try another English or Arabic search term.</p>
                </div>
            )}
        </div>
    );
}
