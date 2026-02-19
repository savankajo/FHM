import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AddServiceForm from './add-service-form';
import MemberManager from './member-manager';

export const dynamic = 'force-dynamic';

export default async function AdminTeamDetailsPage({ params }: { params: { id: string } }) {
    const team = await prisma.team.findUnique({
        where: { id: params.id },
        include: {
            services: {
                orderBy: { date: 'asc' },
                include: { _count: { select: { volunteers: true } } }
            },
            members: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' }
    });

    if (!team) return <div>Team not found</div>;

    return (
        <div className="atm-page">
            {/* ── Page Header ────────────────────────────────── */}
            <div className="atm-header">
                <Link href="/admin/teams" className="atm-back-btn" aria-label="Back to Teams">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </Link>
                <div className="atm-header-text">
                    <h1 className="atm-title">Manage: {team.name}</h1>
                    <p className="atm-subtitle">Team Members &amp; Services</p>
                </div>
            </div>

            {/* ── Two-column layout ───────────────────────────── */}
            <div className="atm-body">
                {/* LEFT COLUMN: Members + Scheduled Services */}
                <div className="atm-col-left">
                    {/* Team Members Card */}
                    <section className="atm-section">
                        <h2 className="atm-section-title">Team Members</h2>
                        <MemberManager teamId={team.id} members={team.members} allUsers={allUsers} />
                    </section>

                    {/* Scheduled Services */}
                    <section className="atm-section">
                        <h2 className="atm-section-title">Scheduled Services</h2>
                        {team.services.length === 0 ? (
                            <div className="atm-empty">
                                <span className="atm-empty-icon">📅</span>
                                <p>No services scheduled yet.</p>
                            </div>
                        ) : (
                            <div className="atm-services-list">
                                {team.services.map(service => (
                                    <div key={service.id} className="atm-service-card">
                                        <div className="atm-service-card-top">
                                            <div>
                                                <div className="atm-service-day">
                                                    {new Date(service.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                                </div>
                                                <div className="atm-service-title-text">{service.title}</div>
                                            </div>
                                            <div className="atm-volunteer-badge">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                                </svg>
                                                {service._count.volunteers} / {service.maxVolunteers || '∞'}
                                            </div>
                                        </div>
                                        <div className="atm-service-datetime">
                                            {new Date(service.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: Add Upcoming Service */}
                <div className="atm-col-right">
                    <section className="atm-section">
                        <h2 className="atm-section-title">Add Upcoming Service</h2>
                        <div className="atm-card">
                            <AddServiceForm teamId={team.id} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
