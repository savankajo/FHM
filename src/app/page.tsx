import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sermon, PodcastEpisode } from '@prisma/client';

async function getSermons(): Promise<Sermon[]> {
  return await prisma.sermon.findMany({
    orderBy: { date: 'desc' },
    take: 3,
  });
}

async function getPodcasts(): Promise<PodcastEpisode[]> {
  return await prisma.podcastEpisode.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 3,
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

        {session ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm hover:underline">Welcome, {session.name || 'Member'}</Link>
            <form action={async () => {
              'use server';
              const { logout } = await import('@/app/actions/auth');
              await logout();
            }}>
              <Button variant="outline" className="h-8 text-xs">Sign Out</Button>
            </form>
          </div>
        ) : (
          <p>Welcome, Guest</p>
        )}

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
              <Link key={sermon.id} href={`/sermons/${sermon.id}`} className="block no-underline">
                <div className="card sermon-card hover:shadow-lg transition-shadow">
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
              </Link>
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
              <Link key={pod.id} href={`/podcasts/${pod.id}`} className="block no-underline">
                <div className="card podcast-card hover:shadow-lg transition-shadow">
                  <div className="card-content">
                    <h3>{pod.title}</h3>
                    <p className="meta">{formatDate(pod.publishedAt)}</p>
                    <Button variant="outline" className="mt-2 text-xs">Listen</Button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>


    </div>
  );
}
