import { prisma } from '@/lib/prisma';
import { formatDate, ensureAbsoluteUrl } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SermonDetailPage({ params }: { params: { id: string } }) {
    const sermon = await prisma.sermon.findUnique({
        where: { id: params.id },
    });

    if (!sermon) notFound();

    return (
        <div className="content-shell">
            <header className="page-header">
                <Link href="/sermons-and-podcasts" className="page-back-btn" aria-label="Back to Media">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1 className="page-title">Sermon</h1>
                    <p className="page-kicker">Media details</p>
                </div>
            </header>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                {sermon.title}
            </h2>
            <div className="text-gray-500 mb-8 flex gap-2 text-sm">
                <span>{sermon.speaker}</span>
                <span>-</span>
                <span>{formatDate(sermon.date)}</span>
            </div>

            {sermon.type === 'VIDEO' && sermon.videoUrl && (
                <div className="content-panel p-5 flex items-center justify-between gap-4">
                    <span className="font-semibold text-base text-gray-900 truncate flex-1">
                        {sermon.title}
                    </span>
                    <a href={ensureAbsoluteUrl(sermon.videoUrl)} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <span className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-black text-sm font-bold shadow-sm transition-colors cursor-pointer">
                            Watch on YouTube
                        </span>
                    </a>
                </div>
            )}

            {sermon.type === 'PDF' && sermon.fileUrl && (
                <div className="content-panel p-5 flex items-center justify-between gap-4">
                    <span className="font-semibold text-base text-gray-900 truncate flex-1">
                        {sermon.title}
                    </span>
                    <a href={ensureAbsoluteUrl(sermon.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <span className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer">
                            Read PDF
                        </span>
                    </a>
                </div>
            )}

            {sermon.notes && (
                <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                    <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{sermon.notes}</p>
                </div>
            )}
        </div>
    );
}
