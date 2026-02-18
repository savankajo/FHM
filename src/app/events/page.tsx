import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── Calendar Icon ─────────────────────────────────────────────
function CalendarIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

// ── Location Icon ─────────────────────────────────────────────
function LocationIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

// ── Event banner gradients ────────────────────────────────────
const EVENT_GRADIENTS = [
    'linear-gradient(135deg, #2a0e04 0%, #7a3010 50%, #C7511F 100%)',
    'linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #2563eb 100%)',
    'linear-gradient(135deg, #0a2010 0%, #1a5c30 50%, #16a34a 100%)',
    'linear-gradient(135deg, #1a0830 0%, #5b21b6 50%, #7c3aed 100%)',
    'linear-gradient(135deg, #2a1a04 0%, #7a5010 50%, #d97706 100%)',
];

const EVENT_EMOJIS = ['⛪', '🙏', '✝️', '🎵', '📖', '🌟', '❤️'];

export default async function EventsPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="events-page">
                <div className="page-header">
                    <h1 className="page-title">Events</h1>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <p>Please sign in to view events.</p>
                    <Link href="/login" style={{ marginTop: '16px', display: 'inline-block' }}>
                        <button className="btn btn-primary btn-sm">Sign In</button>
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch events the user can see
    const userTeams = await prisma.team.findMany({
        where: { members: { some: { id: session.userId } } },
        select: { id: true }
    });
    const userTeamIds = userTeams.map(t => t.id);

    const events = await prisma.event.findMany({
        where: {
            OR: [
                { teamScope: null },
                { teams: { some: { id: { in: userTeamIds } } } }
            ]
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="events-page">

            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Events</h1>
                {session.role === 'ADMIN' && (
                    <Link href="/admin/events">
                        <button className="btn btn-primary btn-sm">+ New</button>
                    </Link>
                )}
            </div>

            {/* Upcoming label */}
            <div style={{ padding: '0 20px 14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Upcoming Events
                </span>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <p>No upcoming events at the moment.<br />Check back soon!</p>
                </div>
            ) : (
                <div className="events-list">
                    {events.map((event, idx) => {
                        const locs = event.locations as any[];
                        const firstDate = locs && locs[0] ? new Date(locs[0].startTime) : null;
                        const locationName = locs?.length > 1
                            ? `${locs.length} Locations`
                            : locs?.[0]?.name || null;

                        const gradient = EVENT_GRADIENTS[idx % EVENT_GRADIENTS.length];
                        const emoji = EVENT_EMOJIS[idx % EVENT_EMOJIS.length];

                        return (
                            <Link key={event.id} href={`/events/${event.id}`} className="event-card">
                                {/* Banner */}
                                <div className="event-card-banner" style={{ background: gradient }}>
                                    <span className="event-card-banner-icon">{emoji}</span>

                                    {/* Date chip */}
                                    {firstDate && (
                                        <div className="event-card-date-chip">
                                            <span className="event-date-month">
                                                {firstDate.toLocaleString('default', { month: 'short' }).toUpperCase()}
                                            </span>
                                            <span className="event-date-day">{firstDate.getDate()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="event-card-body">
                                    <div className="event-card-title">{event.title}</div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        {firstDate && (
                                            <div className="event-card-meta">
                                                <CalendarIcon />
                                                {firstDate.toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                                {locs?.[0]?.startTime && (
                                                    <> · {new Date(locs[0].startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</>
                                                )}
                                            </div>
                                        )}
                                        {locationName && (
                                            <div className="event-card-meta">
                                                <LocationIcon />
                                                {locationName}
                                            </div>
                                        )}
                                    </div>

                                    {event.description && (
                                        <div className="event-card-desc">{event.description}</div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* View Calendar CTA */}
            <div className="events-cta-wrap">
                <button className="btn btn-primary btn-full">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="3" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    View Calendar
                </button>
            </div>

        </div>
    );
}
