import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';

export const dynamic = 'force-dynamic';

export default async function PodcastsPage({
    searchParams,
}: {
    searchParams?: { query?: string };
}) {
    const query = searchParams?.query || '';

    const podcasts = await prisma.podcastEpisode.findMany({
        where: query
            ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            }
            : undefined,
        orderBy: { publishedAt: 'desc' },
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Podcasts</h1>

            <SearchBar placeholder="Search podcasts by title or description..." />

            {podcasts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No episodes found.</p>
            ) : (
                <div className="space-y-4">
                    {podcasts.map((pod) => (
                        <Link key={pod.id} href={`/podcasts/${pod.id}`} className="block group">
                            <div className="border rounded-lg p-6 bg-white shadow-sm group-hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start hover:border-primary/50">
                                <div className="flex-1">
                                    <h2 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{pod.title}</h2>
                                    <p className="text-sm text-gray-500 mb-2">{formatDate(pod.publishedAt)}</p>
                                    {/* Description truncated for list, full details on click */}
                                    {pod.description && (
                                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{pod.description}</p>
                                    )}
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <Button variant="outline" size="sm" className="pointer-events-none group-hover:bg-primary group-hover:text-white">View Details</Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
