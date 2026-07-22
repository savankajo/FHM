import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminMediaAccessPage({ searchParams }: { searchParams?: { q?: string } }) {
    const q = (searchParams?.q || '').trim();
    const [sermons, podcasts] = await Promise.all([
        prisma.sermon.findMany({ orderBy: { date: 'desc' }, take: 300 }),
        prisma.podcastEpisode.findMany({ orderBy: { publishedAt: 'desc' }, take: 300 }),
    ]);
    const query = q.toLowerCase();
    const rows = [
        ...sermons.map(item => ({ id: item.id, type: 'Sermon', title: item.title, restricted: Array.isArray(item.audienceTeamIds) && item.audienceTeamIds.length > 0, href: `/admin/sermons/edit/${item.id}` })),
        ...podcasts.map(item => ({ id: item.id, type: 'Podcast', title: item.title, restricted: Array.isArray(item.audienceTeamIds) && item.audienceTeamIds.length > 0, href: `/admin/podcasts/edit/${item.id}` })),
    ].filter(item => item.title.toLowerCase().includes(query));

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Media Access</h1>
                        <p className="page-kicker">Edit who can see media items</p>
                    </div>
                </div>
            </div>
            <form className="media-search-wrap" action="/admin/media-access">
                <input className="media-search-input" type="search" name="q" defaultValue={q} placeholder="Search sermon or podcast" />
            </form>
            <div className="admin-list-stack">
                {rows.map(item => (
                    <Link key={`${item.type}-${item.id}`} href={item.href} className="admin-list-card admin-list-card-link">
                        <div className="admin-list-card-main">
                            <h2>{item.title}</h2>
                            <p>{item.type} - {item.restricted ? 'Selected teams/groups' : 'Everyone'}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
