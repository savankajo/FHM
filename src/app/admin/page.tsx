import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    const ADMIN_LINKS = [
        { label: 'Manage Sermons', href: '/admin/sermons', icon: '🎤' },
        { label: 'Manage Podcasts', href: '/admin/podcasts', icon: '🎧' },
        { label: 'Manage Teams & Services', href: '/admin/teams', icon: '🛡️' },
        { label: 'Manage Events', href: '/admin/events', icon: '📅' },
        { label: 'Manage Users', href: '/admin/users', icon: '👥' },
        { label: 'Manage Live Link', href: '/admin/live', icon: '🔴' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="max-w-[980px] mx-auto px-7 py-8">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 mb-2 block">← Home</Link>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
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

                {/* Admin Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ADMIN_LINKS.map(link => (
                        <Link key={link.href} href={link.href} className="block no-underline">
                            <div className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[140px]">
                                <span className="text-4xl">{link.icon}</span>
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
