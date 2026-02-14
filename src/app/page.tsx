import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  const isAdmin = session?.role === 'ADMIN';

  // Fetch Live Link (Find latest active one)
  const liveLink = await prisma.liveLink.findFirst({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch Recent Sermons & Podcasts
  const recentSermons = await prisma.sermon.findMany({
    orderBy: { date: 'desc' },
    take: 2,
    select: { id: true, title: true, speaker: true, videoUrl: true }
  });

  const recentPodcasts = await prisma.podcastEpisode.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 1,
    select: { id: true, title: true, publishedAt: true }
  });

  const uploads = [
    ...recentSermons.map(s => ({ ...s, type: 'sermon', url: `/sermons/${s.id}` })),
    ...recentPodcasts.map(p => ({ ...p, type: 'podcast', url: `/podcasts/${p.id}`, speaker: 'Podcast' }))
  ].sort(() => -1).slice(0, 3); // Simple sort/slice

  return (
    <div className="home-page-container">
      {/* Orange Hero Section */}
      <section className="hero-section">
        <header className="home-header">
          <h1 className="home-title">
            Father's Heart Church <span className="add-btn">+</span>
          </h1>
          <div className="header-actions">
            {isAdmin && (
              <Link href="/admin" className="admin-link">
                Admin
              </Link>
            )}
            <Link href="/profile" className="profile-btn">
              👤
            </Link>
          </div>
        </header>

        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search"
              className="search-input"
            />
          </div>
        </div>
      </section>

      {/* Featured / Live Card */}
      <section className="featured-section">
        <div className="live-card">
          <div className="live-card-image">
            {/* Placeholder Image or specific one if live */}
            <div className="play-button-overlay">
              {liveLink ? (
                <a href={liveLink.url} target="_blank" rel="noopener noreferrer" className="text-primary">▶</a>
              ) : (
                <span className="text-gray-300">▶</span>
              )}
            </div>
          </div>
          <div className="live-card-content">
            <div className="live-status">
              {liveLink ? (
                <>
                  <span className="live-indicator text-red-500 animate-pulse">●</span>
                  <a href={liveLink.url} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">
                    Join Live Meeting Now
                  </a>
                </>
              ) : (
                <span className="text-gray-500">Live Meeting</span>
              )}
            </div>
            <h3>Saturday 04:00 pm</h3>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-grid">
        <Link href="/sermons-and-podcasts" className="action-item">
          <div className="action-icon-circle">📺</div>
          <span className="action-label">Videos</span>
        </Link>
        <Link href="/bible" className="action-item">
          <div className="action-icon-circle">📖</div>
          <span className="action-label">Bible</span>
        </Link>
        <a href="https://maps.app.goo.gl/CK4iVbRy25KjZS8m9" target="_blank" rel="noopener noreferrer" className="action-item">
          <div className="action-icon-circle">📍</div>
          <span className="action-label">Location</span>
        </a>
      </section>

      {/* Recently Uploaded */}
      <section className="recent-section">
        <div className="section-header">
          <span className="section-title-highlight">Recently Uploaded</span>
        </div>

        <div className="recent-list">
          {uploads.length > 0 ? (
            uploads.map((item, i) => (
              <Link href={item.url} key={i} className="recent-item">
                <div className="recent-thumbnail bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {item.type === 'sermon' ? '🎥' : '🎧'}
                </div>
                <div className="recent-info">
                  <span className="recent-title truncate">{item.title}</span>
                  <span className="recent-meta">{item.speaker}</span>
                </div>
                <div className="play-icon-small">▶</div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic text-center py-4">No recent uploads found.</p>
          )}
        </div>
      </section>
    </div>
  )
}


