import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sermon, PodcastEpisode } from '@prisma/client';
import { AppHeader } from '@/components/layout/app-header';

async function getSermons(): Promise<Sermon[]> {
    return await prisma.sermon.findMany({
        orderBy: { date: 'desc' },
        take: 5,
    });
}

async function getPodcasts(): Promise<PodcastEpisode[]> {
    return await prisma.podcastEpisode.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 5,
    });
}

export const dynamic = 'force-dynamic';

export default async function SermonsAndPodcastsPage() {
    const session = await getSession();
    const sermons = await getSermons();
    const podcasts = await getPodcasts();
    const isAdmin = session?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-white">
            <AppHeader />

            <main className="max-w-[980px] mx-auto px-7 py-8">

                {/* Admin link */}
                {isAdmin && (
                    <div className="mb-6">
                        <Link href="/admin">
                            <Button variant="ghost" className="w-full border-dashed border-2">
                                🔧 Admin Dashboard
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Live Stream Banner */}
                <LiveLinkSection />

                {/* ── Sermons ────────────────────────── */}
                <section className="py-2">
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                        <h2 className="m-0 text-2xl font-semibold tracking-tight text-gray-900">
                            Latest Sermons
                        </h2>
                        <Link
                            href="/sermons"
                            className="text-gray-500 text-sm font-bold no-underline hover:text-gray-900 hover:underline"
                        >
                            View all →
                        </Link>
                    </div>

                    <ul className="m-0 p-0 list-none border border-gray-200 rounded-xl overflow-hidden">
                        {sermons.length === 0 ? (
                            <li className="p-5 text-center text-gray-400 text-sm bg-white">
                                No sermons available.
                            </li>
                        ) : (
                            sermons.map((sermon, i) => (
                                <li
                                    key={sermon.id}
                                    className={`bg-white ${i !== 0 ? 'border-t border-gray-200' : ''}`}
                                >
                                    <Link
                                        href={`/sermons/${sermon.id}`}
                                        className="block px-5 py-4 text-gray-900 font-bold no-underline hover:bg-gray-50 transition-colors leading-snug"
                                    >
                                        {sermon.title}
                                        <span className="block text-xs text-gray-400 font-normal mt-1">
                                            {new Date(sermon.date).toLocaleDateString()} • {sermon.speaker}
                                        </span>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </section>

                <hr className="border-0 border-t border-gray-200 my-6" />

                {/* ── Podcasts ───────────────────────── */}
                <section className="py-2">
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                        <h2 className="m-0 text-2xl font-semibold tracking-tight text-gray-900">
                            Podcasts
                        </h2>
                        <Link
                            href="/podcasts"
                            className="text-gray-500 text-sm font-bold no-underline hover:text-gray-900 hover:underline"
                        >
                            View all →
                        </Link>
                    </div>

                    <ul className="m-0 p-0 list-none border border-gray-200 rounded-xl overflow-hidden">
                        {podcasts.length === 0 ? (
                            <li className="p-5 text-center text-gray-400 text-sm bg-white">
                                No episodes available.
                            </li>
                        ) : (
                            podcasts.map((pod, i) => (
                                <li
                                    key={pod.id}
                                    className={`bg-white ${i !== 0 ? 'border-t border-gray-200' : ''}`}
                                >
                                    <Link
                                        href={`/podcasts/${pod.id}`}
                                        className="block px-5 py-4 text-gray-900 font-bold no-underline hover:bg-gray-50 transition-colors leading-snug"
                                    >
                                        {pod.title}
                                        <span className="block text-xs text-gray-400 font-normal mt-1">
                                            {new Date(pod.publishedAt).toLocaleDateString()}
                                        </span>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </section>

                <hr className="border-0 border-t border-gray-200 my-6" />

                {/* ── Articles (placeholder) ────────── */}
                <section className="py-2 opacity-50">
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                        <h2 className="m-0 text-2xl font-semibold tracking-tight text-gray-900">
                            Articles
                        </h2>
                        <span className="text-gray-400 text-sm font-bold">Coming Soon</span>
                    </div>

                    <ul className="m-0 p-0 list-none border border-gray-200 rounded-xl overflow-hidden">
                        <li className="px-5 py-4 bg-white">
                            <span className="text-gray-400 font-bold leading-snug">(No articles yet)</span>
                        </li>
                    </ul>
                </section>

            </main>
        </div>
    );
}

async function LiveLinkSection() {
    try {
        const liveLink = await prisma.liveLink.findFirst({
            where: {
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!liveLink) return null;

        return (
            <section className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <div>
                            <h3 className="font-bold text-red-800 text-lg">We are Live!</h3>
                            <p className="text-red-600 text-sm">Join us for our live service happening now.</p>
                        </div>
                    </div>
                    <a href={liveLink.url} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-md">
                            Watch Live Stream ↗
                        </Button>
                    </a>
                </div>
            </section>
        );
    } catch (error) {
        console.error("Failed to fetch Live Link:", error);
        return null;
    }
}
