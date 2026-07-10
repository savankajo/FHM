import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    const ADMIN_LINKS = [
        { label: 'Manage Sermons', href: '/admin/sermons', icon: 'Media' },
        { label: 'Manage Podcasts', href: '/admin/podcasts', icon: 'Audio' },
        { label: 'Manage Teams & Services', href: '/admin/teams', icon: 'Team' },
        { label: 'Manage Events', href: '/admin/events', icon: 'Event' },
        { label: 'Manage Users', href: '/admin/users', icon: 'Users' },
        { label: 'Manage Live Link', href: '/admin/live', icon: 'Live' },
        { label: 'Review Safety Reports', href: '/admin/reports', icon: 'Safety' },
    ];

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
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ADMIN_LINKS.map(link => (
                        <Link key={link.href} href={link.href} className="block no-underline">
                            <div className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[140px]">
                                <span className="text-sm font-bold tracking-wide text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-3 py-1">
                                    {link.icon}
                                </span>
                                <span className="font-bold text-gray-800 text-base">{link.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 p-5 bg-yellow-50 rounded-xl border border-yellow-200 text-sm text-yellow-800">
                    <p><strong>Note:</strong> You have full access to manage content. Changes are live immediately.</p>
                </div>
            </div>
        </div>
    );
}
