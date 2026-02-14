import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DeleteEventButton from './delete-event-button';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
    const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            votes: { select: { status: true } }
        }
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/admin" className="text-sm text-gray-500 hover:text-primary mb-2 block">← Back to Admin</Link>
                    <h1 className="text-3xl font-bold">Manage Events</h1>
                </div>
                <Link href="/admin/events/new"><Button>+ New Event</Button></Link>
            </div>

            <div className="flex flex-col gap-4">
                {events.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No events yet. Create your first event!</p>
                ) : (
                    events.map(event => {
                        const locations = event.locations as any[];
                        const firstLocation = locations?.[0];
                        const yesCount = event.votes.filter(v => v.status === 'YES').length;
                        const maybeCount = event.votes.filter(v => v.status === 'MAYBE').length;
                        const noCount = event.votes.filter(v => v.status === 'NO').length;

                        return (
                            <div key={event.id} className="card bg-white p-6 rounded-lg shadow border border-gray-200">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>

                                        {firstLocation && (
                                            <div className="text-sm text-gray-500 mb-2">
                                                📍 {firstLocation.name}
                                                {locations.length > 1 && ` (+${locations.length - 1} more)`}
                                            </div>
                                        )}

                                        {firstLocation?.startTime && (
                                            <div className="text-sm text-gray-500 mb-3">
                                                📅 {new Date(firstLocation.startTime).toLocaleDateString()} at {new Date(firstLocation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}

                                        {event.votingDeadline && (
                                            <div className="text-sm text-orange-600 mb-3">
                                                ⏰ Voting deadline: {new Date(event.votingDeadline).toLocaleDateString()}
                                            </div>
                                        )}

                                        <div className="flex gap-4 text-sm">
                                            <span className="text-green-600 font-semibold">✓ {yesCount} Yes</span>
                                            <span className="text-yellow-600 font-semibold">? {maybeCount} Maybe</span>
                                            <span className="text-red-600 font-semibold">✗ {noCount} No</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Link href={`/events/${event.id}`}>
                                            <Button size="sm" variant="outline">View</Button>
                                        </Link>
                                        <Link href={`/admin/events/edit/${event.id}`}>
                                            <Button size="sm" variant="outline">Edit</Button>
                                        </Link>
                                        <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
