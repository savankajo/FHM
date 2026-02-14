import { prisma } from '@/lib/prisma';
import SermonForm from '../../sermon-form';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditSermonPage({ params }: { params: { id: string } }) {
    const sermon = await prisma.sermon.findUnique({
        where: { id: params.id }
    });

    if (!sermon) notFound();

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Edit Sermon</h1>
            <SermonForm initialData={sermon} />
        </div>
    );
}
