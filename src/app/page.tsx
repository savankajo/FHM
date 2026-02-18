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
  ].sort(() => -1).slice(0, 3);

  return (
    <div className="home-page-container">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="home-header">
        <div className="home-logo-area">
          <img
            src="/logo.png"
            alt="Father's Heart Church Logo"
            className="home-logo-img"
          />
          <div>
            <div className="home-church-name">Father's Heart</div>
            <div className="home-church-sub">Church</div>
          </div>
        </div>

        <div className="home-header-actions">
          {isAdmin && (
            <Link href="/admin" className="admin-badge">Admin</Link>
          )}
          <Link href="/profile" className="header-icon-btn" aria-label="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Hero Card (Live Service) ─────────────────────── */}
      <div className="hero-card-wrap">
        <div className="hero-card">
          <div className="hero-card-bg" />
          <div className="hero-card-overlay" />
          <div className="hero-card-content">
            <div className="hero-card-text">
              <div className="hero-live-badge">
                <span className="hero-live-dot" />
                Live Service
              </div>
              <div className="hero-card-title">Live Service</div>
              <div className="hero-card-subtitle">Saturday 4:00 PM</div>
            </div>

            {liveLink ? (
              <a
                href={liveLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-join-btn"
              >
                Join Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            ) : (
              <span className="hero-join-btn" style={{ opacity: 0.6, cursor: 'default' }}>
                Join Now
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────── */}
      <div className="quick-actions-grid">
        <Link href="/sermons-and-podcasts" className="action-item">
          <div className="action-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <polygon points="10,9 16,12 10,15" fill="currentColor" />
            </svg>
          </div>
          <span className="action-label">Media</span>
        </Link>

        <Link href="/bible" className="action-item">
          <div className="action-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <line x1="12" y1="7" x2="12" y2="13" />
              <line x1="9" y1="10" x2="15" y2="10" />
            </svg>
          </div>
          <span className="action-label">Bible</span>
        </Link>

        <a
          href="https://maps.app.goo.gl/CK4iVbRy25KjZS8m9"
          target="_blank"
          rel="noopener noreferrer"
          className="action-item"
        >
          <div className="action-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span className="action-label">Location</span>
        </a>

        <Link href="/events" className="action-item">
          <div className="action-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="3" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <circle cx="8" cy="15" r="1" fill="currentColor" />
              <circle cx="12" cy="15" r="1" fill="currentColor" />
            </svg>
          </div>
          <span className="action-label">Events</span>
        </Link>
      </div>

      {/* ── Recently Uploaded ────────────────────────────── */}
      <section className="recent-section">
        <div className="section-header">
          <span className="section-title">Recently Uploaded</span>
          <Link href="/sermons-and-podcasts" className="section-link">See all →</Link>
        </div>

        {uploads.length > 0 ? (
          <div className="recent-scroll-wrap">
            {uploads.map((item, i) => (
              <Link href={item.url} key={i} className="recent-card">
                <div className="recent-card-thumb" style={{
                  background: item.type === 'sermon'
                    ? 'linear-gradient(135deg, #3a1a08, #C7511F)'
                    : 'linear-gradient(135deg, #1a0830, #7c3aed)'
                }}>
                  <span className="recent-card-thumb-icon">
                    {item.type === 'sermon' ? '🎥' : '🎧'}
                  </span>
                  <div className="recent-card-play">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>
                <div className="recent-card-info">
                  <div className="recent-card-title">{item.title}</div>
                  <div className="recent-card-meta">{item.speaker}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '32px 20px' }}>
            <div className="empty-state-icon">🎵</div>
            <p>No recent uploads yet.<br />Check back soon!</p>
          </div>
        )}
      </section>

    </div>
  );
}
