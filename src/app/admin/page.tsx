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

            <style jsx>{`
        .header { margin-bottom: 2rem; }
        .back-link { display: block; margin-bottom: 1rem; color: var(--muted-foreground); }
        h1 { color: var(--primary); margin: 0; }
        
        .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
        .admin-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 2rem; aspect-ratio: 1; transition: transform 0.1s; cursor: pointer; text-align: center; }
        .admin-card:hover { border-color: var(--primary); }
        .admin-card:active { transform: scale(0.98); }
        .icon { font-size: 2.5rem; }
        .label { font-weight: bold; }
      `}</style>
        </div>
    );
}
