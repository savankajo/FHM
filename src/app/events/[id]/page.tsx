import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import VoteButtons from './vote-buttons';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// ── Back Arrow ────────────────────────────────────────────────
function BackArrow({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="page-back-btn" aria-label={`Back to ${label}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
        </Link>
    );
}

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) notFound();

    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: {
            teams: { select: { id: true } },
            votes: {
                include: { user: { select: { id: true, name: true } } }
            }
        }
    });

    if (!event) notFound();
    if (session.role !== 'ADMIN' && event.teamScope) {
        const allowed = await prisma.team.findFirst({ where: { id: { in: event.teams.map(team => team.id) }, members: { some: { id: session.userId } } }, select: { id: true } });
        if (!allowed) notFound();
    }

    const myVote = event.votes.find(v => v.userId === session.userId);
    const locations = event.locations as any[];

    const yesVotes = event.votes.filter(v => v.status === 'YES');
    const maybeVotes = event.votes.filter(v => v.status === 'MAYBE');

    return (
        <div className="event-detail-page">

            {/* ── Page Header ───────────────────────────────── */}
            <div className="page-header">
                <BackArrow href="/events" label="All Events" />
                <h1 className="page-title" style={{ flex: 1 }}>Event Details</h1>
            </div>

            {/* ── Event Title ───────────────────────────────── */}
            <div className="event-detail-hero">
                <h2 className="event-detail-title">{event.title}</h2>
                {event.description && (
                    <p className="event-detail-desc">{event.description}</p>
                )}
            </div>

            {/* ── When & Where ──────────────────────────────── */}
            {locations && locations.length > 0 && (
                <div className="detail-section">
                    <div className="detail-section-label">When &amp; Where</div>
                    <div className="detail-card">
                        {locations.map((loc, idx) => (
                            <div key={idx} className={`loc-row${idx > 0 ? ' loc-row-divider' : ''}`}>
                                {/* Location Name */}
                                <div className="loc-row-item">
                                    <div className="loc-icon-wrap orange">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="loc-name">{loc.name}</div>
                                        {loc.address && <div className="loc-addr">{loc.address}</div>}
                                    </div>
                                </div>

                                {/* Time */}
                                {loc.startTime && (
                                    <div className="loc-row-item">
                                        <div className="loc-icon-wrap blue">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                        </div>
                                        <div className="loc-time">
                                            {new Date(loc.startTime).toLocaleString([], {
                                                weekday: 'short', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                            {loc.endTime && (
                                                <> – {new Date(loc.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* View Map */}
                                {loc.mapUrl && (
                                    <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="view-map-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                        </svg>
                                        View Map
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Attendance ────────────────────────────────── */}
            <div className="detail-section">
                <div className="detail-section-label">Will you attend?</div>
                {event.votingDeadline && new Date() > new Date(event.votingDeadline) ? (
                    <div className="detail-card" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', padding: '20px' }}>
                        Voting has closed.
                    </div>
                ) : (
                    <VoteButtons
                        eventId={event.id}
                        currentStatus={myVote?.status}
                        currentLocIndex={myVote?.selectedLocationIndex}
                        locations={locations}
                        eventTitle={event.title}
                        votingDeadline={event.votingDeadline}
                    />
                )}
            </div>

            {/* ── Who's Going ───────────────────────────────── */}
            <div className="detail-section">
                <div className="detail-section-label">
                    Who's Going
                    <span className="going-count">{yesVotes.length}</span>
                </div>

                {yesVotes.length === 0 ? (
                    <div className="detail-card" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', padding: '20px' }}>
                        Be the first to say YES! 🙌
                    </div>
                ) : (
                    <div className="attendee-list">
                        {yesVotes.map(vote => {
                            const initials = vote.user.name
                                ? vote.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                : '?';
                            return (
                                <div key={vote.id} className="attendee-card">
                                    <div className="attendee-avatar">{initials}</div>
                                    <div className="attendee-info">
                                        <div className="attendee-name">{vote.user.name}</div>
                                        <div className="attendee-status">Going ✓</div>
                                    </div>
                                    <div className="attendee-arrow">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Maybe section */}
                {maybeVotes.length > 0 && (
                    <div className="maybe-section">
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Maybe ({maybeVotes.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {maybeVotes.map(vote => (
                                <span key={vote.id} className="maybe-chip">{vote.user.name}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
