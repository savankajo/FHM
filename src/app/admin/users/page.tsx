import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import UsersManager, { AdminUserRow } from './users-manager';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/');

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { teams: { select: { name: true } } }
    });

    const rows: AdminUserRow[] = users.map(user => ({
        id: user.id,
        name: user.name || 'No name',
        email: user.email,
        role: user.role,
        teams: user.teams.map(team => team.name),
        permissions: user.permissions && typeof user.permissions === 'object' ? user.permissions : {},
    }));

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin Dashboard">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Manage Users</h1>
                        <p className="page-kicker">{rows.length} users</p>
                    </div>
                </div>
            </div>

            <UsersManager users={rows} />
        </div>
    );
}
