import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSermonCollection } from '@/lib/media-metadata';
import MediaAccessClient, { MediaAccessItem } from './media-access-client';

export const dynamic = 'force-dynamic';

const collectionLabels = {
    saturday: 'Saturday Sermon / عظة السبت',
    tuesday: 'Tuesday Meeting / اجتماع الثلاثاء',
    thursday: 'Thursday Meeting / اجتماع الخميس',
};

export default async function AdminMediaAccessPage() {
    const sermons = await prisma.sermon.findMany({
        orderBy: { date: 'desc' },
        take: 600,
    });

    const items: MediaAccessItem[] = sermons.map(sermon => {
        const collection = getSermonCollection(sermon.notes);

        return {
            id: sermon.id,
            title: sermon.title,
            collection,
            collectionLabel: collectionLabels[collection],
            dateLabel: new Date(sermon.date).toLocaleDateString(),
            accessLabel: Array.isArray(sermon.audienceTeamIds) && sermon.audienceTeamIds.length > 0
                ? 'Selected teams/groups'
                : 'Everyone',
            editHref: `/admin/sermons/edit/${sermon.id}`,
        };
    });

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Media Access</h1>
                        <p className="page-kicker">Edit access for sermon collections</p>
                    </div>
                </div>
            </div>

            <MediaAccessClient items={items} />
        </div>
    );
}
