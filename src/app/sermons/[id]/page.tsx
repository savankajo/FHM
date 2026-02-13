import { prisma } from '@/lib/prisma';
import { formatDate, getYouTubeEmbedUrl, ensureAbsoluteUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SermonDetailPage({ params }: { params: { id: string } }) {
    const sermon = await prisma.sermon.findUnique({
        where: { id: params.id },
    });

    if (!sermon) notFound();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/sermons" className="text-sm text-gray-500 hover:text-primary mb-4 block">← Back to Sermons</Link>

            <h1 className="text-3xl font-bold mb-2">{sermon.title}</h1>
            <div className="text-gray-500 mb-6 flex gap-2 text-sm">
                <span>{sermon.speaker}</span>
                <span>•</span>
                <span>{formatDate(sermon.date)}</span>
            </div>

            {/* Video player removed as per request */}
            <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                    {sermon.videoUrl ? (
                        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                            <span className="font-medium text-lg text-gray-800">{sermon.title}</span>
                            <a href={ensureAbsoluteUrl(sermon.videoUrl)} target="_blank" rel="noopener noreferrer">
                                <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white min-w-[140px]">
                                    Watch on YouTube ↗
                                </Button>
                            </a>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 italic">No video link available</p>
                    )}
                </div>
            </div>


        </div>
    );
}
