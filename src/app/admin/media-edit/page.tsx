import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminMediaEditPage({ searchParams }: { searchParams?: { q?: string; type?: string } }) {
    const q = (searchParams?.q || '').trim();
    const type = searchParams?.type || 'all';
    const [sermons, podcasts] = await Promise.all([
        prisma.sermon.findMany({ orderBy: { date: 'desc' }, take: 300 }),
        prisma.podcastEpisode.findMany({ orderBy: { publishedAt: 'desc' }, take: 300 }),
    ]);
    const query = q.toLowerCase();
    const rows = [
        ...(type === 'all' || type === 'sermon' ? sermons.map(item => ({ id: item.id, type: 'Sermon', title: item.title, href: `/admin/sermons/edit/${item.id}` })) : []),
        ...(type === 'all' || type === 'podcast' ? podcasts.map(item => ({ id: item.id, type: 'Podcast', title: item.title, href: `/admin/podcasts/edit/${item.id}` })) : []),
    ].filter(item => item.title.toLowerCase().includes(query));

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Edit Media</h1>
                        <p className="page-kicker">Choose what to edit, then search</p>
                    </div>
                </div>
            </div>
            <form className="media-search-wrap" action="/admin/media-edit" style={{ display: 'grid', gap: 10 }}>
                <select className="media-search-input" name="type" defaultValue={type}>
                    <option value="all">Sermons and Podcasts</option>
                    <option value="sermon">Sermons</option>
                    <option value="podcast">Podcasts</option>
                    <option value="article" disabled>Articles coming soon</option>
                </select>
                <input className="media-search-input" type="search" name="q" defaultValue={q} placeholder="Search by title" />
                <button className="btn btn-primary btn-sm" type="submit">Search</button>
            </form>
            <div className="admin-list-stack">
                {rows.map(item => (
                    <Link key={`${item.type}-${item.id}`} href={item.href} className="admin-list-card admin-list-card-link">
                        <div className="admin-list-card-main">
                            <h2>{item.title}</h2>
                            <p>{item.type} - edit details and access</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
