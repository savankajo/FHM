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

            <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                    {/* Display title again or just the link, user asked for "name of the episodes and beside it watch on Youtube" */}
                    {/* Since title is already at the top, we can just show the link clearly */}

                    {podcast.audioUrl && (
                        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                            <span className="font-medium text-lg text-gray-800">{podcast.title}</span>
                            <a href={ensureAbsoluteUrl(podcast.audioUrl)} target="_blank" rel="noopener noreferrer">
                                <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white min-w-[140px]">
                                    {getYouTubeEmbedUrl(podcast.audioUrl) ? 'Watch on YouTube ↗' : 'Listen / Download ⬇'}
                                </Button>
                            </a>
                        </div>
                    )}

                    {!podcast.audioUrl && (
                        <p className="text-center text-gray-500 italic">No media link available</p>
                    )}
                </div>
            </div>


        </div>
    );
}
