import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SermonForm from '../../sermon-form';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditSermonPage({ params }: { params: { id: string } }) {
    const sermon = await prisma.sermon.findUnique({
        where: { id: params.id }
    });

    if (!sermon) notFound();

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin/media-access" className="page-back-btn" aria-label="Back to Media Access">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Edit Sermon</h1>
                        <p className="page-kicker">Edit details and access</p>
                    </div>
                </div>
            </div>
            <SermonForm initialData={sermon} />
        </div>
    );
}
