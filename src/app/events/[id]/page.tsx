import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import VoteButtons from './vote-buttons';

export const dynamic = 'force-dynamic';

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return <p>Unauthorized</p>;

    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: {
            votes: {
                include: { user: { select: { id: true, name: true } } }
            }
        }
    });

    if (!event) return <p>Event not found</p>;

    const myVote = event.votes.find(v => v.userId === session.userId);
    const locations = event.locations as any[];

    // Calculate stats
    const yesVotes = event.votes.filter(v => v.status === 'YES');
    const maybeVotes = event.votes.filter(v => v.status === 'MAYBE');

    return (
        <div className="event-details">
            <Link href="/events" className="back-link">← All Events</Link>

            <h1 className="title">{event.title}</h1>
            <p className="desc">{event.description}</p>

            <div className="locations-section">
                <h3>When & Where</h3>
                <div className="loc-list">
                    {locations && locations.map((loc, idx) => (
                        <div key={idx} className="loc-item">
                            <div className="loc-icon">📍</div>
                            <div>
                                <strong>{loc.name}</strong>
                                <p className="loc-addr">{loc.address}</p>
                                <p className="loc-time">
                                    {new Date(loc.startTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {new Date(loc.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {loc.mapUrl && <a href={loc.mapUrl} target="_blank" className="map-link">View Map</a>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="voting-section">
                <h3>Will you attend?</h3>
                {event.votingDeadline && new Date() > new Date(event.votingDeadline) ? (
                    <p className="deadline-msg">Voting has closed.</p>
                ) : (
                    <VoteButtons
                        eventId={event.id}
                        currentStatus={myVote?.status}
                        currentLocIndex={myVote?.selectedLocationIndex}
                        locations={locations}
                        eventTitle={event.title}
                        votingDeadline={event.votingDeadline}
                    />
                )}
            </div>

            <div className="attendees-section">
                <h3>Who's Going ({yesVotes.length})</h3>
                <div className="attendee-list">
                    {yesVotes.map(vote => (
                        <div key={vote.id} className="attendee">
                            👤 {vote.user.name}
                        </div>
                    ))}
                    {yesVotes.length === 0 && <p className="text-muted">Be the first to say YES!</p>}
                </div>

                {maybeVotes.length > 0 && (
                    <div className="maybe-list">
                        <h4>Maybe ({maybeVotes.length})</h4>
                        {maybeVotes.map(vote => <span key={vote.id} className="maybe-name">{vote.user.name}, </span>)}
                    </div>
                )}
            </div>


        </div>
    );
}
