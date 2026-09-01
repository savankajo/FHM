import { prisma } from '@/lib/prisma';
import { formatDate, getYouTubeEmbedUrl, ensureAbsoluteUrl } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { canSeeAudience } from '@/lib/audience';

export const dynamic = 'force-dynamic';

export default async function PodcastDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    const podcast = await prisma.podcastEpisode.findUnique({
        where: { id },
    });

    if (!podcast) notFound();
    const teams = session ? await prisma.team.findMany({ where: { members: { some: { id: session.userId } } }, select: { id: true } }) : [];
    if (!canSeeAudience(podcast.audienceTeamIds, teams.map(team => team.id), session?.role === 'ADMIN')) notFound();
    const mediaUrl = ensureAbsoluteUrl(podcast.audioUrl);
    const embedUrl = mediaUrl ? getYouTubeEmbedUrl(mediaUrl) : null;

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
                <div className="content-panel mt-8 overflow-hidden">
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title={podcast.title}
                            className="w-full aspect-video border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    ) : (
                        <div className="p-5"><audio src={mediaUrl} controls preload="metadata" className="w-full" /></div>
                    )}
                    <div className="p-4">
                        <a href={mediaUrl} className="text-sm font-semibold text-orange-700 underline">Open media directly</a>
                    </div>
                </div>
            )}
        </div>
    );
}
