import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeletePodcastButton from './delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminPodcastsPage() {
    const podcasts = await prisma.podcastEpisode.findMany({ orderBy: { publishedAt: 'desc' } });

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
                        <h1 className="page-title">Manage Podcasts</h1>
                        <p className="page-kicker">{podcasts.length} podcast episodes</p>
                    </div>
                </div>
                <Link href="/admin/podcasts/new" className="admin-list-create">+ New Episode</Link>
            </div>

            <div className="admin-list-stack">
                {podcasts.length === 0 ? (
                    <div className="admin-empty-state">
                        <h2>No podcast episodes yet</h2>
                        <p>Add the first podcast episode.</p>
                    </div>
                ) : (
                    podcasts.map(pod => (
                        <div key={pod.id} className="admin-list-card">
                            <div className="admin-list-card-main">
                                <h2>{pod.title}</h2>
                                <p>{new Date(pod.publishedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="admin-list-actions">
                                <DeletePodcastButton id={pod.id} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
