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
    ];

    return (
        <div className="admin-dashboard">
            <div className="header">
                <Link href="/" className="back-link">← Home</Link>
                <h1>Admin Dashboard</h1>
            </div>

            <div className="grid">
                {ADMIN_LINKS.map(link => (
                    <Link key={link.href} href={link.href}>
                        <div className="card admin-card">
                            <span className="icon">{link.icon}</span>
                            <span className="label">{link.label}</span>
                        </div>
                    </Link>
                ))}
            </div>


        </div>
    );
}
