import { prisma } from '@/lib/prisma';
import { formatDate, getYouTubeEmbedUrl, ensureAbsoluteUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PodcastDetailPage({ params }: { params: { id: string } }) {
    const podcast = await prisma.podcastEpisode.findUnique({
        where: { id: params.id },
    });

    if (!podcast) notFound();

    return (
        <div className="content-shell">
            <header className="page-header">
                <Link href="/sermons-and-podcasts" className="page-back-btn" aria-label="Back to Media">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1 className="page-title">Podcast</h1>
                    <p className="page-kicker">Episode details</p>
                </div>
            </header>

            <h2 className="text-3xl font-bold mb-2">{podcast.title}</h2>
            <div className="text-gray-500 mb-6 text-sm">
                <span>{formatDate(podcast.publishedAt)}</span>
            </div>

            {podcast.audioUrl && (
                <div className="content-panel mt-8 p-5 flex flex-row items-center justify-between gap-4">
                    <span className="font-semibold text-lg text-gray-900 flex-1">{podcast.title}</span>
                    <a href={ensureAbsoluteUrl(podcast.audioUrl)} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-black min-w-[160px] font-medium text-base">
                            {getYouTubeEmbedUrl(podcast.audioUrl) ? 'Watch on YouTube' : 'Listen / Download'}
                        </Button>
                    </a>
                </div>
            )}
        </div>
    );
}
