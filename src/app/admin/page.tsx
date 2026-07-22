import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission, PermissionAction, PermissionTopic } from '@/lib/permissions';
import { redirect } from 'next/navigation';

type AdminItem = {
    label: string;
    href: string;
    topic?: PermissionTopic;
    action?: PermissionAction;
    adminOnly?: boolean;
    disabled?: boolean;
};

const ADMIN_SECTIONS: Array<{ title: string; items: AdminItem[] }> = [
    {
        title: 'Media',
        items: [
            { label: 'Media Access', href: '/admin/media-access', topic: 'media', action: 'edit' },
            { label: 'Adding Sermon', href: '/admin/sermons/new', topic: 'media', action: 'add' },
            { label: 'Adding Podcast', href: '/admin/podcasts/new', topic: 'media', action: 'add' },
            { label: 'Adding Articles', href: '', disabled: true },
            { label: 'Editing Sermon, Podcast or Articles', href: '/admin/media-edit', topic: 'media', action: 'edit' },
        ],
    },
    {
        title: 'Teams',
        items: [
            { label: 'Editing Teams', href: '/admin/teams', topic: 'teams', action: 'edit' },
            { label: 'Adding Teams or Groups', href: '/admin/teams/new', topic: 'teams', action: 'add' },
        ],
    },
    {
        title: 'Events',
        items: [
            { label: 'Adding Event', href: '/admin/events/new', topic: 'events', action: 'add' },
            { label: 'Editing Event', href: '/admin/events', topic: 'events', action: 'edit' },
        ],
    },
    {
        title: 'Manage Live',
        items: [
            { label: 'Adding Live', href: '/admin/live', topic: 'live', action: 'add' },
        ],
    },
    {
        title: 'Safety & Users',
        items: [
            { label: 'Manage Users', href: '/admin/users', adminOnly: true },
            { label: 'Review Safety Reports', href: '/admin/reports', adminOnly: true },
        ],
    },
];

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session) redirect('/');
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { permissions: true } });
    const isAdmin = session.role === 'ADMIN';
    const canOpen = (item: AdminItem) => {
        if (item.disabled) return true;
        if (isAdmin) return true;
        if (item.adminOnly) return false;
        return !!item.topic && !!item.action && hasPermission(user?.permissions, item.topic, item.action);
    };
    const sections = ADMIN_SECTIONS.map(section => ({
        ...section,
        items: section.items.filter(canOpen),
    })).filter(section => section.items.length > 0);
    if (!sections.length) redirect('/');

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[980px] mx-auto px-7 py-8">
                <div className="admin-topbar">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="page-back-btn" aria-label="Back to Home">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{isAdmin ? 'Admin Dashboard' : 'Manage Tools'}</h1>
                            <p className="page-kicker">Manage church content</p>
                        </div>
                    </div>
                    <form action={async () => {
                        'use server';
                        const { logout } = await import('@/app/actions/auth');
                        await logout();
                    }}>
                        <button className="px-5 py-2.5 rounded-lg border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors">
                            Log Out
                        </button>
                    </form>
                </div>

                <div className="grid gap-6">
                    {sections.map(section => (
                        <section key={section.title} className="settings-card" style={{ padding: 18 }}>
                            <h2 className="settings-section-title" style={{ marginBottom: 14 }}>{section.title}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {section.items.map(item => item.disabled ? (
                                    <div key={item.label} className="admin-list-card" style={{ opacity: 0.55 }}>
                                        <div className="admin-list-card-main">
                                            <h2>{item.label}</h2>
                                            <p>Coming soon</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Link key={item.label} href={item.href} className="admin-list-card admin-list-card-link">
                                        <div className="admin-list-card-main">
                                            <h2>{item.label}</h2>
                                            <p>Open</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
