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
            <h1 className="text-3xl font-bold mb-6">Sermons</h1>

            {sermons.length === 0 ? (
                <p className="text-gray-500">No sermons found.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sermons.map((sermon) => (
                        <div key={sermon.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                            <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                                {sermon.videoUrl ? (
                                    <iframe
                                        src={sermon.videoUrl.replace('watch?v=', 'embed/')}
                                        className="w-full h-full absolute inset-0"
                                        allowFullScreen
                                    />
                                ) : (
                                    <span className="text-4xl">🎬</span>
                                )}
                            </div>
                            <div className="p-4">
                                <h2 className="font-bold text-xl mb-2">{sermon.title}</h2>
                                <div className="text-sm text-gray-500 mb-4">
                                    <span>{sermon.speaker}</span>
                                    <span className="mx-2">•</span>
                                    <span>{formatDate(sermon.date)}</span>
                                </div>
                                {sermon.description && (
                                    <p className="text-gray-700 text-sm line-clamp-3 mb-4">{sermon.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
