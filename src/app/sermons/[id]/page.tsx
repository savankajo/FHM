import { prisma } from '@/lib/prisma';
import { formatDate, getYouTubeEmbedUrl } from '@/lib/utils';
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

            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-4">
                {sermon.videoUrl && getYouTubeEmbedUrl(sermon.videoUrl) ? (
                    <iframe
                        src={getYouTubeEmbedUrl(sermon.videoUrl)!}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                        <p>Video unavailable or invalid URL</p>
                    </div>
                )}
            </div>

            {sermon.videoUrl && (
                <div className="mb-8 flex justify-center">
                    <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2">
                            Watch on YouTube ↗
                        </Button>
                    </a>
                </div>
            )}

            <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-2">Notes</h3>
                <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-6 rounded-lg border">
                    {sermon.notes || 'No notes available for this sermon.'}
                </div>
            </div>
        </div>
    );
}
