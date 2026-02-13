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
        { label: 'Manage Live Link', href: '/admin/live', icon: '🔴' },
    ];

    return (
        <div className="p-4 max-w-lg mx-auto pb-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 block">← Home</Link>
                    <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
                </div>
                <form action={async () => {
                    'use server';
                    const { logout } = await import('@/app/actions/auth');
                    await logout();
                }}>
                    <Button variant="destructive" size="sm">Log Out</Button>
                </form>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {ADMIN_LINKS.map(link => (
                    <Link key={link.href} href={link.href} className="block">
                        <div className="bg-white border hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-sm h-full aspect-square">
                            <span className="text-4xl">{link.icon}</span>
                            <span className="font-semibold text-gray-800 text-sm">{link.label}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                <p><strong>Note:</strong> You have full access to manage content. Changes are live immediately.</p>
            </div>
        </div>
    );
}
