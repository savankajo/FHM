import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function PodcastsPage() {
    const podcasts = await prisma.podcastEpisode.findMany({
        orderBy: { publishedAt: 'desc' },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Podcasts</h1>

            {podcasts.length === 0 ? (
                <p className="text-gray-500">No episodes found.</p>
            ) : (
                <div className="space-y-4">
                    {podcasts.map((pod) => (
                        <div key={pod.id} className="border rounded-lg p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <h2 className="font-bold text-xl mb-2">{pod.title}</h2>
                                <p className="text-sm text-gray-500 mb-2">{formatDate(pod.publishedAt)}</p>
                                {pod.description && (
                                    <p className="text-gray-700 text-sm mb-4">{pod.description}</p>
                                )}
                                {pod.audioUrl && (
                                    <audio controls className="w-full mt-2">
                                        <source src={pod.audioUrl} />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
