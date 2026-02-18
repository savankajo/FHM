import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProfileActions from './profile-actions';

export const dynamic = 'force-dynamic';

// ── Chevron Icon ──────────────────────────────────────────────
function ChevronRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true, phone: true }
    });

    if (!user) redirect('/login');

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email[0].toUpperCase();

    return (
        <div className="profile-page">

            {/* ── Profile Hero ─────────────────────────────────── */}
            <div className="profile-hero">
                <div className="profile-avatar-wrap">
                    <div className="profile-avatar">
                        <span style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>{initials}</span>
                    </div>
                </div>
                <div className="profile-name">{user.name || 'Church Member'}</div>
                <div className="profile-email">{user.email}</div>
                <div className="profile-role-badge">{session.role}</div>
            </div>

            {/* ── Menu Card ────────────────────────────────────── */}
            <div className="profile-card">

                <Link href="/profile/favorites" className="profile-menu-item">
                    <div className="profile-menu-icon orange">❤️</div>
                    <span className="profile-menu-label">My Favorites</span>
                    <span className="profile-menu-arrow"><ChevronRight /></span>
                </Link>

                <Link href="/events" className="profile-menu-item">
                    <div className="profile-menu-icon blue">📅</div>
                    <span className="profile-menu-label">Event Registrations</span>
                    <span className="profile-menu-arrow"><ChevronRight /></span>
                </Link>

                <Link href="/bible" className="profile-menu-item">
                    <div className="profile-menu-icon green">📖</div>
                    <span className="profile-menu-label">Bible Reading Plan</span>
                    <span className="profile-menu-arrow"><ChevronRight /></span>
                </Link>

                <Link href="/profile/settings" className="profile-menu-item">
                    <div className="profile-menu-icon purple">⚙️</div>
                    <span className="profile-menu-label">Settings</span>
                    <span className="profile-menu-arrow"><ChevronRight /></span>
                </Link>

                {/* Logout — needs server action */}
                <ProfileActions />

            </div>

            {/* ── Edit Profile Form ─────────────────────────────── */}
            <div style={{ padding: '0 20px 8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    Edit Profile
                </div>
            </div>

            <div className="profile-form-section">
                <ProfileFormWrapper user={user} />
            </div>

        </div>
    );
}

// ── Profile Form Wrapper ──────────────────────────────────────
import ProfileForm from './profile-form';

function ProfileFormWrapper({ user }: { user: { name: string | null; email: string; phone: string | null } }) {
    return <ProfileForm user={user} />;
}
