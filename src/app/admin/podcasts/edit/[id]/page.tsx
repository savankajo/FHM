import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PodcastForm from '../../podcast-form';

export const dynamic = 'force-dynamic';

export default async function EditPodcastPage({ params }: { params: { id: string } }) {
    const podcast = await prisma.podcastEpisode.findUnique({
        where: { id: params.id },
    });

    if (!podcast) notFound();

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Edit Podcast Episode</h1>
            <PodcastForm initialData={podcast} />
        </div>
    );
}
