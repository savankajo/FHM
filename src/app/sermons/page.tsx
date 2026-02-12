import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SermonsPage() {
    const sermons = await prisma.sermon.findMany({
        orderBy: { date: 'desc' },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Sermons</h1>

            {sermons.length === 0 ? (
                <p className="text-gray-500">No sermons found.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sermons.map((sermon) => (
                        <Link key={sermon.id} href={`/sermons/${sermon.id}`} className="block group">
                            <div className="border rounded-lg overflow-hidden shadow-sm group-hover:shadow-lg transition-all bg-white h-full flex flex-col transform group-hover:-translate-y-1">
                                <div className="aspect-video bg-gray-100 flex items-center justify-center relative group-hover:opacity-90 transition-opacity">
                                    {sermon.videoUrl ? (
                                        <iframe
                                            src={sermon.videoUrl.replace('watch?v=', 'embed/')}
                                            className="w-full h-full pointer-events-none" // Disable interaction in list view
                                            tabIndex={-1}
                                        />
                                    ) : (
                                        <span className="text-4xl">🎬</span>
                                    )}
                                    {/* Overlay for Clickability */}
                                    <div className="absolute inset-0 bg-transparent"></div>
                                </div>
                                <div className="p-4 flex-1">
                                    <h2 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{sermon.title}</h2>
                                    <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                        <span>{sermon.speaker}</span>
                                        <span>•</span>
                                        <span>{formatDate(sermon.date)}</span>
                                    </div>
                                    {sermon.notes && (
                                        <p className="text-gray-700 text-sm line-clamp-3 mb-4">{sermon.notes}</p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
