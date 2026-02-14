import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    const [recentSermons, recentPodcasts] = await Promise.all([
        prisma.sermon.findMany({ orderBy: { date: 'desc' }, take: 3 }),
        prisma.podcastEpisode.findMany({ orderBy: { publishedAt: 'desc' }, take: 3 })
    ]);

    return (
        <div className="min-h-screen bg-white">
            {/* Topbar */}
            <header className="flex items-center justify-between px-7 py-[18px] border-b border-gray-200 bg-white">
                <div className="text-[28px] font-extrabold tracking-tight text-gray-900">
                    FHM Church
                </div>
                <div className="flex items-center gap-3.5">
                    <span className="text-gray-500 font-semibold">Hi, Admin</span>
                    <form action={logout}>
                        <button className="px-3.5 py-2.5 rounded-full border border-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-50 transition-colors">
                            Sign out
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-[980px] mx-auto p-7">
                {/* Page Title */}
                <div className="flex items-center justify-center gap-2.5 my-7 text-gray-500">
                    <span className="text-xl">🛠️</span>
                    <h1 className="text-base font-bold m-0 uppercase tracking-wide">Admin Dashboard</h1>
                </div>

                {/* Sermons Section */}
                <section className="py-1.5">
                    <div className="flex items-baseline justify-between gap-4 mb-2.5">
                        <h2 className="m-0 text-[28px] tracking-tight text-gray-900 font-semibold">Latest Sermons</h2>
                        <Link href="/admin/sermons" className="text-gray-500 text-sm font-bold no-underline hover:text-gray-900 hover:underline">
                            View all
                        </Link>
                    </div>

                    <ul className="m-0 p-0 list-none border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        {recentSermons.length === 0 ? (
                            <li className="p-4 text-center text-gray-500 text-sm">No sermons found.</li>
                        ) : (
                            recentSermons.map((sermon, i) => (
                                <li key={sermon.id} className={`p-[14px] px-4 bg-white ${i !== 0 ? 'border-t border-gray-200' : ''}`}>
                                    <Link href={`/admin/sermons/edit/${sermon.id}`} className="text-gray-900 font-bold no-underline hover:underline block leading-tight">
                                        {sermon.title}
                                    </Link>
                                    <span className="text-xs text-gray-400 mt-1 block">{new Date(sermon.date).toLocaleDateString()} • {sermon.speaker}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </section>

                <hr className="border-0 border-t border-gray-200 my-[22px]" />

                {/* Podcasts Section */}
                <section className="py-1.5">
                    <div className="flex items-baseline justify-between gap-4 mb-2.5">
                        <h2 className="m-0 text-[28px] tracking-tight text-gray-900 font-semibold">Podcasts</h2>
                        <Link href="/admin/podcasts" className="text-gray-500 text-sm font-bold no-underline hover:text-gray-900 hover:underline">
                            View all
                        </Link>
                    </div>

                    <ul className="m-0 p-0 list-none border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        {recentPodcasts.length === 0 ? (
                            <li className="p-4 text-center text-gray-500 text-sm">No podcasts found.</li>
                        ) : (
                            recentPodcasts.map((podcast, i) => (
                                <li key={podcast.id} className={`p-[14px] px-4 bg-white ${i !== 0 ? 'border-t border-gray-200' : ''}`}>
                                    <div className="block">
                                        <span className="text-gray-900 font-bold leading-tight">{podcast.title}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1 block">{new Date(podcast.publishedAt).toLocaleDateString()}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </section>

                <hr className="border-0 border-t border-gray-200 my-[22px]" />

                {/* Articles Section (Placeholder) */}
                <section className="py-1.5 opacity-50 pointer-events-none">
                    <div className="flex items-baseline justify-between gap-4 mb-2.5">
                        <h2 className="m-0 text-[28px] tracking-tight text-gray-900 font-semibold">Articles</h2>
                        <span className="text-gray-400 text-sm font-bold">Coming Soon</span>
                    </div>

                    <ul className="m-0 p-0 list-none border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <li className="p-[14px] px-4 bg-white">
                            <span className="text-gray-400 font-bold block leading-tight">(No articles yet)</span>
                        </li>
                    </ul>
                </section>

                <div className="mt-12 grid grid-cols-2 gap-4">
                    <Link href="/admin/teams">
                        <div className="p-4 border rounded-lg hover:bg-gray-50 text-center font-bold text-gray-700">Manage Teams</div>
                    </Link>
                    <Link href="/admin/users">
                        <div className="p-4 border rounded-lg hover:bg-gray-50 text-center font-bold text-gray-700">Manage Users</div>
                    </Link>
                </div>

            </main>
        </div>
    );
}
