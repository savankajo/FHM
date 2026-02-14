import { prisma } from '@/lib/prisma';
import { formatDate, getYouTubeEmbedUrl, ensureAbsoluteUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SermonDetailPage({ params }: { params: { id: string } }) {
    const sermon = await prisma.sermon.findUnique({
        where: { id: params.id },
    });

    if (!sermon) notFound();

    return (
        <div className="max-w-[980px] mx-auto px-7 py-8">
            <Link href="/sermons" className="text-sm text-gray-400 hover:text-gray-700 mb-8 block">
                ← Back to Sermons
            </Link>

            {/* Title + Speaker/Date */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                {sermon.title}
            </h1>
            <div className="text-gray-500 mb-8 flex gap-2 text-sm">
                <span>{sermon.speaker}</span>
                <span>•</span>
                <span>{formatDate(sermon.date)}</span>
            </div>

            {/* Action Row — title on left, button far right */}
            {sermon.type === 'VIDEO' && sermon.videoUrl && (
                <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
                    <span className="font-semibold text-base text-gray-900 truncate flex-1">
                        {sermon.title}
                    </span>
                    <a href={ensureAbsoluteUrl(sermon.videoUrl)} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <span className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer">
                            Watch on YouTube ↗
                        </span>
                    </a>
                </div>
            )}

            {sermon.type === 'PDF' && sermon.fileUrl && (
                <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
                    <span className="font-semibold text-base text-gray-900 truncate flex-1">
                        {sermon.title}
                    </span>
                    <a href={ensureAbsoluteUrl(sermon.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <span className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors cursor-pointer">
                            Read PDF ↗
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
