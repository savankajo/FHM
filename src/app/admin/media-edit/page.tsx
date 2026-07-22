import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import MediaEditClient, { MediaEditItem } from './media-edit-client';

export const dynamic = 'force-dynamic';

export default async function AdminMediaEditPage() {
    const [sermons, podcasts] = await Promise.all([
        prisma.sermon.findMany({ orderBy: { date: 'desc' }, take: 600 }),
        prisma.podcastEpisode.findMany({ orderBy: { publishedAt: 'desc' }, take: 300 }),
    ]);

    const items: MediaEditItem[] = [
        ...sermons.map(item => ({
            id: item.id,
            type: 'sermon' as const,
            typeLabel: 'Sermon',
            title: item.title,
            accessLabel: Array.isArray(item.audienceTeamIds) && item.audienceTeamIds.length > 0 ? 'Selected teams/groups' : 'Everyone',
            editHref: `/admin/sermons/edit/${item.id}`,
        })),
        ...podcasts.map(item => ({
            id: item.id,
            type: 'podcast' as const,
            typeLabel: 'Podcast',
            title: item.title,
            accessLabel: Array.isArray(item.audienceTeamIds) && item.audienceTeamIds.length > 0 ? 'Selected teams/groups' : 'Everyone',
            editHref: `/admin/podcasts/edit/${item.id}`,
        })),
    ];

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Edit Media</h1>
                        <p className="page-kicker">Choose what to edit, then search</p>
                    </div>
                </div>
            </div>

            <MediaEditClient items={items} />
        </div>
    );
}
