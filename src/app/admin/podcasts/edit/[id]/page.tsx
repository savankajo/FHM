import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PodcastForm from '../../podcast-form';

export const dynamic = 'force-dynamic';

export default async function EditPodcastPage({ params }: { params: { id: string } }) {
    const podcast = await prisma.podcastEpisode.findUnique({
        where: { id: params.id },
    });

    if (!podcast) notFound();

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin/media-edit" className="page-back-btn" aria-label="Back to Edit Media">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Edit Podcast Episode</h1>
                        <p className="page-kicker">Edit details and access</p>
                    </div>
                </div>
            </div>
            <PodcastForm initialData={podcast} />
        </div>
    );
}
