import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
    const events = await prisma.event.findMany({ orderBy: { createdAt: 'desc' } });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Manage Events</h1>
                <Link href="/admin/events/new"><Button>+ New Event</Button></Link>
            </div>

            <div className="flex flex-col gap-4">
                {events.map(event => (
                    <div key={event.id} className="card bg-white p-4 rounded shadow">
                        <h3 className="font-bold">{event.title}</h3>
                        <p className="text-sm text-gray-500">
                            {(event.locations as any[])?.length || 0} Locations
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
