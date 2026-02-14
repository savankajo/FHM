import { prisma } from '@/lib/prisma';
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
        <div className="max-w-[980px] mx-auto px-7 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Podcasts</h1>

            <SearchBar placeholder="Search podcasts by title or description..." />

            {podcasts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No episodes found.</p>
            ) : (
                <ul className="m-0 p-0 list-none border border-gray-200 rounded-xl overflow-hidden mt-6">
                    {podcasts.map((pod, i) => (
                        <li
                            key={pod.id}
                            className={`bg-white ${i !== 0 ? 'border-t border-gray-200' : ''}`}
                        >
                            <Link
                                href={`/podcasts/${pod.id}`}
                                className="flex items-center justify-between px-5 py-4 no-underline hover:bg-gray-50 transition-colors gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    <span className="text-gray-900 font-bold text-base block truncate">
                                        {pod.title}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1 block">
                                        {new Date(pod.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold shadow-sm">
                                        Listen →
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
