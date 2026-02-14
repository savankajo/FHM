import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/ui/global-search';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
    searchParams,
}: {
    searchParams?: { q?: string };
}) {
    const query = searchParams?.q || '';

    if (!query) {
        return (
            <div className="container p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Search</h1>
                <GlobalSearch />
            </div>
        );
    }

    const [sermons, podcasts] = await Promise.all([
        prisma.sermon.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { speaker: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 10
        }),
        prisma.podcastEpisode.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 10
        })
    ]);

    const results = [
        ...sermons.map(s => ({ ...s, type: 'sermon', url: `/sermons/${s.id}` })),
        ...podcasts.map(p => ({ ...p, type: 'podcast', url: `/podcasts/${p.id}`, speaker: 'Podcast' }))
    ].sort((a, b) => {
        // @ts-ignore
        return new Date(b.date || b.publishedAt).getTime() - new Date(a.date || a.publishedAt).getTime();
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Search Results for "{query}"</h1>
                <GlobalSearch />
            </div>

            {results.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No results found.</p>
            ) : (
                <div className="space-y-4">
                    {results.map((item) => (
                        <Link key={item.id} href={item.url} className="block group">
                            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                                {item.type}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {/* @ts-ignore */}
                                                {formatDate(item.date || item.publishedAt)}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.speaker && item.speaker !== 'Podcast' ? item.speaker : ''}
                                        </p>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-orange-500 text-2xl">
                                        →
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
