import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="p-4 text-center">
                <p>Please sign in to view events.</p>
                <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
            </div>
        );
    }

    // Fetch events:
    // 1. Events with teamScope = null (Public/All)
    // 2. Events where teamScope matches one of user's team IDs
    const userTeams = await prisma.team.findMany({
        where: { members: { some: { id: session.userId } } },
        select: { id: true }
    });
    const userTeamIds = userTeams.map(t => t.id);

    const events = await prisma.event.findMany({
        where: {
            OR: [
                { teamScope: null }, // Global events (using null for "ALL" logic if schema allowed null, schema was String? so null is fine)
                { teams: { some: { id: { in: userTeamIds } } } } // If relation based
                // Since my schema defined "teams" relation, I should use that relation for scoping.
                // Schema: teams Team[] @relation("TeamEvents")
                // So an event can be linked to multiple teams.
            ]
        },
        orderBy: { createdAt: 'desc' }, // Should be date based but Event model has locations array with times... let's sort by creation for now or nearest date if possible. 
        // Complexity: extracting nearest date from JSON is hard in SQL/Prisma.
        // I'll stick to creation or just fetch all and sort in JS if needed, but 'desc' created is fine for MVP.
    });

    return (
        <div className="events-page">
            <div className="header">
                <h1 className="page-title">Events</h1>
                {session.role === 'ADMIN' && (
                    <Button size="sm" variant="outline">+ New Event</Button>
                )}
            </div>

            <div className="card-list">
                {events.length === 0 ? (
                    <p className="text-muted-foreground text-center">No upcoming events.</p>
                ) : (
                    events.map(event => {
                        // Need to parse locations to display date range
                        const locs = event.locations as any[]; // quick cast
                        const firstDate = locs && locs[0] ? new Date(locs[0].startTime) : null;

                        return (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <div className="card event-card">
                                    <div className="date-box">
                                        {firstDate ? (
                                            <>
                                                <span className="month">{firstDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                                <span className="day">{firstDate.getDate()}</span>
                                            </>
                                        ) : (
                                            <span className="month">TBA</span>
                                        )}
                                    </div>
                                    <div className="content">
                                        <h3 className="font-bold">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {locs?.length > 1 ? `${locs.length} Locations` : locs?.[0]?.name || 'No location'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>


        </div>
    );
}
