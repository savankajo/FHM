import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DeletePodcastButton from './delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminPodcastsPage() {
    const podcasts = await prisma.podcastEpisode.findMany({ orderBy: { publishedAt: 'desc' } });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Manage Podcasts</h1>
                <Link href="/admin/podcasts/new"><Button>+ New Episode</Button></Link>
            </div>

            <div className="flex flex-col gap-4">
                {podcasts.map(pod => (
                    <div key={pod.id} className="card flex justify-between items-center bg-white p-4 rounded shadow">
                        <div>
                            <h3 className="font-bold">{pod.title}</h3>
                            <p className="text-sm text-gray-500">{new Date(pod.publishedAt).toLocaleDateString()}</p>
                        </div>
                        <DeletePodcastButton id={pod.id} />
                    </div>
                ))}
            </div>
        </div>
    );
}
