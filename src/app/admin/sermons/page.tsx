import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteSermonButton from './delete-button';
import { getSermonCollection } from '@/lib/media-metadata';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const collectionLabels = {
    saturday: 'Saturday Sermon',
    tuesday: 'Tuesday Meeting',
    thursday: 'Thursday Meeting',
};

export default async function AdminSermonsPage() {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'media', 'edit')) redirect('/admin');
    const sermons = await prisma.sermon.findMany({ orderBy: { date: 'desc' } });

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
                        <h1 className="page-title">Manage Sermons</h1>
                        <p className="page-kicker">{sermons.length} sermon recordings</p>
                    </div>
                </div>
                <Link href="/admin/sermons/new" className="admin-list-create">+ New Sermon</Link>
            </div>

            <div className="admin-list-stack">
                {sermons.length === 0 ? (
                    <div className="admin-empty-state">
                        <h2>No sermons yet</h2>
                        <p>Add the first sermon recording.</p>
                    </div>
                ) : (
                    sermons.map(sermon => (
                        <div key={sermon.id} className="admin-list-card">
                            <div className="admin-list-card-main">
                                <h2>{sermon.title}</h2>
                                <p>
                                    {collectionLabels[getSermonCollection(sermon.notes)]}
                                    {' · '}
                                    {new Date(sermon.date).toLocaleDateString()}
                                    {' · '}
                                    {Array.isArray(sermon.audienceTeamIds) && sermon.audienceTeamIds.length > 0 ? 'Selected teams' : 'Everyone'}
                                </p>
                            </div>
                            <div className="admin-list-actions">
                                <Link href={`/admin/sermons/edit/${sermon.id}`} className="admin-list-action-link">Edit</Link>
                                <DeleteSermonButton id={sermon.id} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
