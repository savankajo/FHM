import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EditEventForm from './edit-event-form';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }: { params: { id: string } }) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    const event = await prisma.event.findUnique({
        where: { id: params.id }
    });

    if (!event) {
        return <p>Event not found</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
            <EditEventForm event={event} />
        </div>
    );
}
