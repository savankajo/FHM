import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VerseOfTheDayCard from '@/components/home/verse-of-day';
import PastorSection from '@/components/home/pastor-section';
import { DEFAULT_PASTORS, PASTOR_PROFILE_IDS } from '@/data/pastors';
import { getUserPermissions } from '@/lib/permissions';
import { canSeeAudience } from '@/lib/audience';

export const dynamic = 'force-dynamic';

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export default async function HomePage() {
  const session = await getSession();
  const isAdmin = session?.role === 'ADMIN';
  const [permissionResult, teams, liveLink, nextEvent, sermonCandidates, podcastCandidates, pastorProfiles] = await Promise.all([
    getUserPermissions(session?.userId, session?.role),
    session ? prisma.team.findMany({
      where: { members: { some: { id: session.userId } } },
      select: { id: true }
    }) : Promise.resolve([]),
    prisma.liveLink.findFirst({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.event.findFirst({
      where: {
        startTime: { gte: new Date() },
        ...(isAdmin ? {} : {
          OR: [
            { visibility: 'PUBLIC' as const },
            { teamScope: null },
            ...(session ? [
              { teams: { some: { members: { some: { id: session.userId } } } } },
              { invitations: { some: { userId: session.userId } } }
            ] : [])
          ]
        })
      },
      orderBy: { startTime: 'asc' },
      select: { id: true, title: true, startTime: true, location: true }
    }),
    prisma.sermon.findMany({
      orderBy: { date: 'desc' },
      take: 20,
      select: { id: true, title: true, speaker: true, date: true, videoUrl: true, thumbnailUrl: true, audienceTeamIds: true }
    }),
    prisma.podcastEpisode.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: { id: true, title: true, publishedAt: true, thumbnailUrl: true, audienceTeamIds: true }
    }),
    prisma.pastorProfile.findMany({
      where: { id: { in: [...PASTOR_PROFILE_IDS] } },
      orderBy: { sortOrder: 'asc' },
      take: 2,
      select: { id: true, name: true, role: true, initials: true, imageUrl: true, sortOrder: true }
    }),
  ]);
  const { canOpenAdmin } = permissionResult;
  const teamIds = teams.map(team => team.id);
  // User has no avatarUrl in schema — prompt if logged in

  // Fetch Recent Sermons & Podcasts for "Recently Uploaded"
  const recentSermons = sermonCandidates.filter(item => canSeeAudience(item.audienceTeamIds, teamIds, isAdmin)).slice(0, 2);

  const recentPodcasts = podcastCandidates.filter(item => canSeeAudience(item.audienceTeamIds, teamIds, isAdmin)).slice(0, 1);
  const pastors = pastorProfiles.length === 2 ? pastorProfiles : DEFAULT_PASTORS;

  const uploads = [
    ...recentSermons.map(s => ({
      ...s,
      type: 'sermon',
      url: `/sermons/${s.id}`,
      thumbnailUrl: s.thumbnailUrl ?? null,
      uploadedAt: s.date
    })),
    ...recentPodcasts.map(p => ({
      ...p,
      type: 'podcast',
      url: `/podcasts/${p.id}`,
      speaker: 'Podcast',
      thumbnailUrl: p.thumbnailUrl ?? null,
      uploadedAt: p.publishedAt
    }))
  ].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()).slice(0, 3);

  return (
    <div className="home-page-container">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="home-header">
        <div className="home-logo-area">
          <Image
            src="/logo.png"
            alt="Father's Heart Church Logo"
            className="home-logo-img"
            width={48}
            height={48}
            priority
          />
          <div>
            <div className="home-church-name">Father's Heart</div>
            <div className="home-church-sub">Church</div>
          </div>
        </div>

        <div className="home-header-actions">
          {canOpenAdmin && (
            <Link href="/admin" className="admin-badge">{isAdmin ? 'Admin' : 'Manage'}</Link>
          )}
          {/* Profile button — shows "Add Photo" prompt if logged in & no avatar */}
          <Link href="/profile" prefetch={false} className="home-avatar-btn" aria-label="Profile">
            <div className="home-avatar-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
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
              <div className="hero-card-subtitle">Saturday 1:00 PM</div>
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

      {/* ── Verse of the Day ─────────────────────────────── */}
      <VerseOfTheDayCard />

      <PastorSection pastors={pastors} />

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

        <Link href="/bible" className="action-item">
          <div className="action-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 6h8" />
              <path d="M8 10h6" />
            </svg>
          </div>
          <span className="action-label">Bible</span>
        </Link>
      </div>

      <section className="visit-strip" aria-label="Plan your visit">
        <div className="visit-strip-copy">
          <span className="visit-strip-kicker">Plan your visit</span>
          <h2 className="visit-strip-title">Join us this Saturday at 1:00 PM</h2>
          <p className="visit-strip-text">10167 148 Street, Surrey, BC</p>
        </div>
        <div className="visit-strip-actions">
          <a
            href="https://maps.app.goo.gl/CK4iVbRy25KjZS8m9"
            target="_blank"
            rel="noopener noreferrer"
            className="visit-strip-link"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Directions
          </a>
          <Link href="/support" className="visit-strip-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
            Ask a question
          </Link>
        </div>
      </section>

      {nextEvent && nextEvent.startTime && (
        <section className="next-event-strip" aria-labelledby="next-event-title">
          <div className="next-event-date">
            <span>{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(nextEvent.startTime)}</span>
            <strong>{new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(nextEvent.startTime)}</strong>
          </div>
          <div className="next-event-copy">
            <span className="visit-strip-kicker">Next up</span>
            <h2 id="next-event-title" className="next-event-title">{nextEvent.title}</h2>
            <p className="next-event-meta">
              {formatEventDate(nextEvent.startTime)}
              {nextEvent.location ? ` · ${nextEvent.location}` : ''}
            </p>
          </div>
          <Link href={`/events/${nextEvent.id}`} className="next-event-link" aria-label={`View ${nextEvent.title}`}>
            <span>Details</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </section>
      )}

      {/* ── Recently Uploaded ────────────────────────────── */}
      <section className="recent-section">
        <div className="section-header">
          <span className="section-title">Recently Uploaded</span>
          <Link href="/sermons-and-podcasts" className="section-link">
            <span>See all</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        {uploads.length > 0 ? (
          <div className="recent-scroll-wrap">
            {uploads.map((item, i) => (
              <Link href={item.url} key={i} className="recent-card">
                <div
                  className="recent-card-thumb"
                  style={item.thumbnailUrl ? {
                    backgroundImage: `url(${item.thumbnailUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {
                    background: item.type === 'sermon'
                      ? 'linear-gradient(135deg, #3a1a08, #C7511F)'
                      : 'linear-gradient(135deg, #1a0830, #7c3aed)'
                  }}
                >
                  {!item.thumbnailUrl && (
                    <span className="recent-card-thumb-icon">
                      {item.type === 'sermon' ? '🎥' : '🎧'}
                    </span>
                  )}
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

      {/* Bottom padding for nav */}
      <div style={{ height: '24px' }} />
    </div>
  );
}
