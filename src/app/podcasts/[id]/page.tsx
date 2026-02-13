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
                <div className="mb-4">
                    {/* Check if audioUrl is actually a YouTube video */}
                    {podcast.audioUrl && getYouTubeEmbedUrl(podcast.audioUrl) ? (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-4">
                            <iframe
                                src={getYouTubeEmbedUrl(podcast.audioUrl)!}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        </div>
                    ) : podcast.audioUrl ? (
                        <audio controls className="w-full">
                            <source src={podcast.audioUrl} />
                            Your browser does not support the audio element.
                        </audio>
                    ) : (
                        <p className="text-center text-gray-500 italic">No media available</p>
                    )}
                </div>

                {podcast.audioUrl && getYouTubeEmbedUrl(podcast.audioUrl) ? (
                    <p className="text-sm text-center text-gray-500">Watch this episode</p>
                ) : (
                    <p className="text-sm text-center text-gray-500">Listen to this episode</p>
                )}

                {podcast.audioUrl && (
                    <div className="mt-4 flex justify-center">
                        <a href={ensureAbsoluteUrl(podcast.audioUrl)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                                {getYouTubeEmbedUrl(podcast.audioUrl) ? 'Watch on YouTube ↗' : 'Download / Listen Direct ⬇'}
                            </Button>
                        </a>
                    </div>
                )}
            </div>

            <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <div className="whitespace-pre-wrap text-gray-700">
                    {podcast.description || 'No description available.'}
                </div>
            </div>
        </div>
    );
}
