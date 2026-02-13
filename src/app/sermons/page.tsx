import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';

export const dynamic = 'force-dynamic';

export default async function SermonsPage({
    searchParams,
}: {
    searchParams?: { query?: string };
}) {
    const query = searchParams?.query || '';

    const sermons = await prisma.sermon.findMany({
        where: query
            ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { speaker: { contains: query, mode: 'insensitive' } },
                ],
            }
            : undefined,
        orderBy: { date: 'desc' },
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Sermons</h1>

            <SearchBar placeholder="Search sermons by title or speaker..." />

            {sermons.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sermons found.</p>
            ) : (
                <div className="space-y-4">
                    {sermons.map((sermon) => (
                        <Link key={sermon.id} href={`/sermons/${sermon.id}`} className="block group">
                            <div className="border rounded-lg p-6 bg-white shadow-sm group-hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start hover:border-primary/50">
                                <div className="flex-1">
                                    <h2 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{sermon.title}</h2>
                                    <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                                        <span>{sermon.speaker}</span>
                                        <span>•</span>
                                        <span>{formatDate(sermon.date)}</span>
                                    </div>
                                    {/* Description/Notes are available on detail page */}
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <Button variant="outline" size="sm" className="pointer-events-none group-hover:bg-primary group-hover:text-white">
                                        View Details
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
