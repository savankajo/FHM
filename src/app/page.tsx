import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

async function getSermons() {
    return await prisma.sermon.findMany({
        orderBy: { date: 'desc' },
        take: 5,
    });
}

async function getPodcasts() {
    return await prisma.podcastEpisode.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 5,
    });
}

export const dynamic = 'force-dynamic'; // Ensure we don't cache static builds too hard for this demo

export default async function HomePage() {
    const session = await getSession();
    const sermons = await getSermons();
    const podcasts = await getPodcasts();

    // Use a proper type check or just string comparison for role
    // In `src/lib/auth.ts` I defined role as string in payload, but schema says enum. 
    // It comes back as string from JWT.
    const isAdmin = session?.role === 'ADMIN';

    return (
        <div className="home-page">
            <header className="home-header">
                <h1>FHM Church</h1>
                <p>Welcome, {session?.userId ? 'Member' : 'Guest'}</p>

                {!session && (
                    <div className="guest-actions">
                        <Link href="/login"><Button variant="outline">Sign In</Button></Link>
                    </div>
                )}
            </header>

            {/* Admin Controls Placeholder */}
            {isAdmin && (
                <div className="admin-panel-link">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full border-dashed border-2">
                            🔧 Admin Dashboard
                        </Button>
                    </Link>
                </div>
            )}

            {/* Live Stream Banner (Mock for now, normally check if any sermon isLive) */}
            {sermons.some(s => s.isLive) && (
                <div className="live-banner">
                    <span className="live-indicator">● LIVE</span>
                    <span>Sunday Service is streaming now!</span>
                    <Button size="sm" className="ml-auto">Watch</Button>
                </div>
            )}

            <section className="section">
                <div className="section-header">
                    <h2>Latest Sermons</h2>
                    <Link href="/sermons" className="view-all">View All</Link>
                </div>

                <div className="card-list">
                    {sermons.length === 0 ? (
                        <p className="empty-state">No sermons available.</p>
                    ) : (
                        sermons.map((sermon) => (
                            <div key={sermon.id} className="card sermon-card">
                                {sermon.videoUrl && (
                                    <div className="video-thumbnail">
                                        {/* Placeholder for fetching thumbnail or just an icon */}
                                        <div className="play-icon">▶</div>
                                    </div>
                                )}
                                <div className="card-content">
                                    <h3>{sermon.title}</h3>
                                    <p className="meta">{sermon.speaker} • {formatDate(sermon.date)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="section">
                <div className="section-header">
                    <h2>Podcasts</h2>
                    <Link href="/podcasts" className="view-all">View All</Link>
                </div>

                <div className="card-list">
                    {podcasts.length === 0 ? (
                        <p className="empty-state">No episodes available.</p>
                    ) : (
                        podcasts.map((pod) => (
                            <div key={pod.id} className="card podcast-card">
                                <div className="card-content">
                                    <h3>{pod.title}</h3>
                                    <p className="meta">{formatDate(pod.publishedAt)}</p>
                                    <Button variant="outline" className="mt-2 text-xs">Listen</Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <style jsx>{`
        .home-page {
          padding-bottom: 2rem;
        }
        .home-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .home-header h1 {
          font-size: 1.5rem;
          color: var(--primary);
          margin: 0;
        }
        .guest-actions {
          display: flex;
          gap: 0.5rem;
        }
        .admin-panel-link {
          margin-bottom: 2rem;
        }
        .live-banner {
          background-color: #fee2e2;
          color: #ef4444;
          padding: 1rem;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          font-weight: bold;
        }
        .live-indicator {
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .section {
          margin-bottom: 2.5rem;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1rem;
        }
        .section-header h2 {
          font-size: 1.25rem;
          margin: 0;
        }
        .view-all {
          font-size: 0.875rem;
          color: var(--primary);
        }
        
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .sermon-card {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .video-thumbnail {
          width: 80px;
          height: 60px;
          background-color: var(--muted);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-content h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }
        .meta {
          margin: 0;
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }
        .empty-state {
          color: var(--muted-foreground);
          font-style: italic;
          text-align: center;
          padding: 2rem;
          background: var(--muted);
          border-radius: var(--radius);
        }
      `}</style>
        </div>
    );
}
