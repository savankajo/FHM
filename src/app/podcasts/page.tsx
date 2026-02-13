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
                            <div className="border-b border-gray-200 py-6 px-2 hover:bg-gray-50 transition-colors flex flex-row items-center justify-between gap-4">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h2 className="font-semibold text-lg text-gray-900 truncate">{pod.title}</h2>
                                </div>
                                <div className="flex-shrink-0">
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm">
                                        View Details →
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
