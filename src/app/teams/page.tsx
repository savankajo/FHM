import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── Team metadata (icons + descriptions) ─────────────────────
const TEAM_META: Record<string, { emoji: string; desc: string; gradient: string }> = {
    default: {
        emoji: '👥',
        desc: 'Connect and serve together in ministry.',
        gradient: 'linear-gradient(135deg, #3a1a08, #C7511F)',
    },
};

function getTeamMeta(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes('worship') || lower.includes('music') || lower.includes('praise')) {
        return {
            emoji: '🎵',
            desc: 'Join the Music Ministry and lead worship.',
            gradient: 'linear-gradient(135deg, #2a0e04, #C7511F)',
        };
    }
    if (lower.includes('youth') || lower.includes('young') || lower.includes('teen')) {
        return {
            emoji: '⚡',
            desc: 'Empowering the next generation for Christ.',
            gradient: 'linear-gradient(135deg, #0a1628, #2563eb)',
        };
    }
    if (lower.includes('prayer') || lower.includes('intercession')) {
        return {
            emoji: '🙏',
            desc: 'Intercessory Prayer — standing in the gap.',
            gradient: 'linear-gradient(135deg, #1a0830, #7c3aed)',
        };
    }
    if (lower.includes('children') || lower.includes('kids') || lower.includes('sunday school')) {
        return {
            emoji: '🌟',
            desc: 'Nurturing children in faith and love.',
            gradient: 'linear-gradient(135deg, #0a2010, #16a34a)',
        };
    }
    if (lower.includes('media') || lower.includes('tech') || lower.includes('av')) {
        return {
            emoji: '📹',
            desc: 'Serving through technology and media.',
            gradient: 'linear-gradient(135deg, #0a1a2a, #0284c7)',
        };
    }
    if (lower.includes('usher') || lower.includes('hospitality') || lower.includes('welcome')) {
        return {
            emoji: '🤝',
            desc: 'Creating a welcoming atmosphere for all.',
            gradient: 'linear-gradient(135deg, #2a1a04, #d97706)',
        };
    }
    return TEAM_META.default;
}

// ── Chevron Icon ──────────────────────────────────────────────
function ChevronRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

export default async function TeamsPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="teams-page">
                <div className="teams-hero">
                    <div className="teams-hero-overlay" />
                    <div className="teams-hero-content">
                        <div className="teams-hero-title">Our Ministry Teams</div>
                        <div className="teams-hero-sub">Serving together in faith</div>
                    </div>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <p>Please sign in to view teams.</p>
                    <Link href="/login" style={{ marginTop: '16px', display: 'inline-block' }}>
                        <button className="btn btn-primary btn-sm">Sign In</button>
                    </Link>
                </div>
            </div>
        );
    }

    const myTeams = await prisma.team.findMany({
        where: {
            members: { some: { id: session.userId } }
        },
        include: { _count: { select: { members: true } } }
    });

    return (
        <div className="teams-page">

            {/* Hero Banner */}
            <div className="teams-hero">
                <div className="teams-hero-overlay" />
                <div className="teams-hero-content">
                    <div className="teams-hero-title">Our Ministry Teams</div>
                    <div className="teams-hero-sub">Serving together in faith and love</div>
                </div>
            </div>

            {/* Section Label */}
            <div style={{ padding: '0 20px 14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    My Teams
                </span>
            </div>

            {/* Teams List */}
            {myTeams.length === 0 ? (
                <div className="teams-empty">
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
                    <p>You are not in any teams yet.</p>
                    <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Contact an admin to be added to a ministry team.
                    </p>
                </div>
            ) : (
                <div className="teams-list">
                    {myTeams.map(team => {
                        const meta = getTeamMeta(team.name);
                        return (
                            <Link key={team.id} href={`/teams/${team.id}`} className="team-card">
                                {/* Team Image / Icon */}
                                <div className="team-card-image" style={{ background: meta.gradient }}>
                                    <span style={{ fontSize: '32px' }}>{meta.emoji}</span>
                                </div>

                                {/* Team Info */}
                                <div className="team-card-body">
                                    <div className="team-card-name">{team.name}</div>
                                    <div className="team-card-desc">{meta.desc}</div>
                                    <div className="team-card-meta">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="9" cy="7" r="3" />
                                            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                                            <circle cx="17" cy="7" r="2.5" />
                                            <path d="M21 21v-1.5a3.5 3.5 0 0 0-2-3.2" />
                                        </svg>
                                        {team._count.members} {team._count.members === 1 ? 'Member' : 'Members'}
                                        <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>· Open Chat →</span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="team-card-arrow">
                                    <ChevronRight />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
