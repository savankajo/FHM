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
                            <div className="border-b border-gray-200 py-4 px-2 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                    {/* User requested "write only the title and make it onl line" - Flex row with Button */}
                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                        <h2 className="font-semibold text-lg text-gray-900 truncate">{sermon.title}</h2>
                                        <span className="text-xs text-gray-500 whitespace-nowrap hidden md:inline-block">• {formatDate(sermon.date)}</span>
                                    </div>
                                    <div className="md:hidden text-xs text-gray-500 mt-1">
                                        {formatDate(sermon.date)}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-medium">
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
