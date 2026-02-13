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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/sermons" className="text-sm text-gray-500 hover:text-primary mb-4 block">← Back to Sermons</Link>

            <h1 className="text-3xl font-bold mb-2">{sermon.title}</h1>
            <div className="text-gray-500 mb-6 flex gap-2 text-sm">
                <span>{sermon.speaker}</span>
                <span>•</span>
                <span>{formatDate(sermon.date)}</span>
            </div>

            {/* Clean row layout for action button */}
            {sermon.videoUrl && (
                <div className="mt-8 border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="font-semibold text-lg text-gray-900">{sermon.title}</span>
                    <a href={ensureAbsoluteUrl(sermon.videoUrl)} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white min-w-[160px] font-medium text-base">
                            Watch on YouTube ↗
                        </Button>
                    </a>
                </div>
            )}


        </div>
    );
}
