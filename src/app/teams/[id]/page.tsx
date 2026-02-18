import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import VolunteerButton from './volunteer-button';
import DeleteServiceButton from './delete-service-button';

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

export default async function TeamDetailsPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return <p>Unauthorized</p>;

    const serviceWhere = session.role === 'ADMIN'
        ? {}
        : { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } };

    const team = await prisma.team.findUnique({
        where: { id: params.id },
        include: {
            services: {
                where: serviceWhere,
                orderBy: { date: 'asc' },
                include: { volunteers: true }
            },
            members: { take: 5 }
        }
    });

    if (!team) return <p>Team not found</p>;

    const isMember = await prisma.team.findFirst({
        where: {
            id: params.id,
            members: { some: { id: session.userId } }
        }
    });

    if (!isMember && session.role !== 'ADMIN') {
        return (
            <div className="team-detail-page">
                <div className="page-header">
                    <BackArrow href="/teams" label="Teams" />
                    <h1 className="page-title">Access Denied</h1>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">🔒</div>
                    <p>You must be a member of this team to view details.</p>
                    <Link href="/teams" style={{ marginTop: '16px', display: 'inline-block' }}>
                        <button className="btn btn-primary btn-sm">Go Back</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="team-detail-page">

            {/* ── Page Header ───────────────────────────────── */}
            <div className="page-header">
                <BackArrow href="/teams" label="Teams" />
                <div style={{ flex: 1 }}>
                    <h1 className="page-title" style={{ marginBottom: '2px' }}>{team.name}</h1>
                    {team.description && (
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{team.description}</p>
                    )}
                </div>
                {session.role === 'ADMIN' && (
                    <Link href={`/admin/teams/${team.id}`}>
                        <button className="btn btn-outline btn-sm">Manage</button>
                    </Link>
                )}
            </div>

            {/* ── Upcoming Services ─────────────────────────── */}
            <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Upcoming Services
                </span>
                {session.role === 'ADMIN' && (
                    <Link href={`/admin/teams/${team.id}`}>
                        <button className="btn btn-primary btn-sm">+ Add Service</button>
                    </Link>
                )}
            </div>

            {team.services.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <p>No upcoming services scheduled.<br />Check back soon!</p>
                </div>
            ) : (
                <div className="service-list">
                    {team.services.map(service => {
                        const isVolunteering = service.volunteers.some(v => v.id === session.userId);
                        const spotsLeft = service.maxVolunteers
                            ? service.maxVolunteers - service.volunteers.length
                            : null;
                        const serviceDate = new Date(service.date);

                        return (
                            <div key={service.id} className="service-card">
                                {/* Left: Date + Info */}
                                <div className="service-card-left">
                                    <div className="service-date-badge">
                                        <span className="service-date-month">
                                            {serviceDate.toLocaleString('default', { month: 'short' }).toUpperCase()}
                                        </span>
                                        <span className="service-date-day">{serviceDate.getDate()}</span>
                                    </div>
                                    <div className="service-info">
                                        <div className="service-day-name">
                                            {serviceDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                        </div>
                                        <div className="service-title">{service.title}</div>
                                        <div className="service-time">
                                            {serviceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {spotsLeft !== null && (
                                            <div className={`service-spots${spotsLeft === 0 ? ' full' : ''}`}>
                                                {spotsLeft === 0 ? 'Fully booked' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                                            </div>
                                        )}
                                        {/* Volunteer list */}
                                        {service.volunteers.length > 0 && (
                                            <div className="service-volunteers">
                                                {service.volunteers.map(v => (
                                                    <span key={v.id} className="volunteer-chip">{v.name?.split(' ')[0]}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="service-card-right">
                                    {session.role === 'ADMIN' && (
                                        <DeleteServiceButton serviceId={service.id} teamId={team.id} />
                                    )}
                                    <VolunteerButton
                                        serviceId={service.id}
                                        isVolunteering={isVolunteering}
                                        disabled={spotsLeft === 0 && !isVolunteering}
                                        serviceTitle={service.title}
                                        serviceDate={service.date}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Team Chat Button ──────────────────────────── */}
            <div className="team-chat-btn-wrap">
                <Link href={`/chat/${team.id}`} className="team-chat-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Open Team Chat
                </Link>
            </div>

        </div>
    );
}
