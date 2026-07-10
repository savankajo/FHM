import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminTeamsPage() {
    const session = await getSession();
    if (session?.role !== 'ADMIN') redirect('/');
    const teams = await prisma.team.findMany({
        include: { _count: { select: { members: true } } },
        orderBy: { name: 'asc' },
    });

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
                        <h1 className="page-title">Manage Teams</h1>
                        <p className="page-kicker">{teams.length} teams and service groups</p>
                    </div>
                </div>
                <Link href="/admin/teams/new" className="admin-list-create">+ New Team</Link>
            </div>

            <div className="admin-list-stack">
                {teams.length === 0 ? (
                    <div className="admin-empty-state">
                        <h2>No teams yet</h2>
                        <p>Create the first team or service group.</p>
                    </div>
                ) : (
                    teams.map(team => (
                        <Link key={team.id} href={`/admin/teams/${team.id}`} className="admin-list-card admin-list-card-link">
                            <div className="admin-list-card-main">
                                <h2>{team.name}</h2>
                                <p>{team._count.members} members</p>
                            </div>
                            <span className="admin-list-chevron" aria-hidden="true">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
