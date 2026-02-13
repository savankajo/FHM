import { prisma } from '@/lib/prisma';
import { formatDate, getYouTubeEmbedUrl, ensureAbsoluteUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PodcastDetailPage({ params }: { params: { id: string } }) {
    const podcast = await prisma.podcastEpisode.findUnique({
        where: { id: params.id },
    });

    if (!podcast) notFound();

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Link href="/podcasts" className="text-sm text-gray-500 hover:text-primary mb-4 block">← Back to Podcasts</Link>

            <h1 className="text-3xl font-bold mb-2">{podcast.title}</h1>
            <div className="text-gray-500 mb-6 text-sm">
                <span>{formatDate(podcast.publishedAt)}</span>
            </div>

            {/* Clean row layout for action button */}
            {podcast.audioUrl && (
                <div className="mt-8 border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="font-semibold text-lg text-gray-900">{podcast.title}</span>
                    <a href={ensureAbsoluteUrl(podcast.audioUrl)} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white min-w-[160px] font-medium text-base">
                            {getYouTubeEmbedUrl(podcast.audioUrl) ? 'Watch on YouTube ↗' : 'Listen / Download ⬇'}
                        </Button>
                    </a>
                </div>
            )}


        </div>
    );
}
