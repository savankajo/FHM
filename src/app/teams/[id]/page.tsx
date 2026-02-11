import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import VolunteerButton from './volunteer-button';

export const dynamic = 'force-dynamic';

export default async function TeamDetailsPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return <p>Unauthorized</p>;

    // Fetch team with relations
    const team = await prisma.team.findUnique({
        where: { id: params.id },
        include: {
            services: {
                where: { date: { gte: new Date() } }, // Only future services
                orderBy: { date: 'asc' },
                include: { volunteers: true }
            },
            members: { take: 5 } // Preview members
        }
    });

    if (!team) return <p>Team not found</p>;

    // Check if user is member
    const isMember = await prisma.team.findFirst({
        where: {
            id: params.id,
            members: { some: { id: session.userId } }
        }
    });

    if (!isMember && session.role !== 'ADMIN') {
        return (
            <div className="p-4">
                <p>You must be a member of this team to view details.</p>
                <Link href="/teams"><Button className="mt-4">Go Back</Button></Link>
            </div>
        );
    }

    return (
        <div className="team-details">
            <div className="header">
                <Link href="/teams" className="back-link">← Teams</Link>
                <h1>{team.name}</h1>
                <p className="desc">{team.description}</p>
            </div>

            <section className="mb-8">
                <div className="section-header">
                    <h2>Upcoming Services</h2>
                    {session.role === 'ADMIN' && <Button size="sm" variant="outline">+ Add</Button>}
                </div>

                {team.services.length === 0 ? (
                    <p className="text-muted">No upcoming services scheduled.</p>
                ) : (
                    <div className="service-list">
                        {team.services.map(service => {
                            const isVolunteering = service.volunteers.some(v => v.id === session.userId);
                            const spotsLeft = service.maxVolunteers
                                ? service.maxVolunteers - service.volunteers.length
                                : null;

                            return (
                                <div key={service.id} className="card service-card">
                                    <div className="date-badge">
                                        <span className="month">{new Date(service.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                        <span className="day">{new Date(service.date).getDate()}</span>
                                    </div>
                                    <div className="service-info">
                                        <h3>{service.title}</h3>
                                        <p className="time">{new Date(service.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        {spotsLeft !== null && (
                                            <p className="spots">{spotsLeft} spots left</p>
                                        )}
                                    </div>
                                    <div className="action">
                                        <VolunteerButton
                                            serviceId={service.id}
                                            isVolunteering={isVolunteering}
                                            disabled={spotsLeft === 0 && !isVolunteering}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <div className="chat-link-container">
                <Link href={`/chat/${team.id}`}>
                    <Button fullWidth>💬 Open Team Chat</Button>
                </Link>
            </div>

            <style jsx>{`
        .team-details { padding-bottom: 2rem; }
        .header { margin-bottom: 2rem; }
        .back-link { color: var(--muted-foreground); font-size: 0.875rem; display: block; margin-bottom: 0.5rem; }
        .header h1 { font-size: 1.75rem; color: var(--primary); margin: 0; }
        .desc { color: var(--muted-foreground); margin-top: 0.5rem; }
        
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .section-header h2 { font-size: 1.25rem; margin: 0; }
        
        .service-list { display: flex; flex-direction: column; gap: 1rem; }
        .service-card { display: flex; gap: 1rem; align-items: center; }
        
        .date-badge {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #ffeccf; color: var(--primary);
          padding: 0.5rem; border-radius: 8px; font-weight: bold; width: 50px;
        }
        .date-badge .month { font-size: 0.7rem; }
        .date-badge .day { font-size: 1.2rem; line-height: 1; }
        
        .service-info { flex: 1; }
        .service-info h3 { margin: 0; font-size: 1rem; }
        .time { font-size: 0.875rem; color: var(--muted-foreground); margin: 0; }
        .spots { font-size: 0.75rem; color: green; margin: 2px 0 0 0; }
        
        .chat-link-container { margin-top: 2rem; }
      `}</style>
        </div>
    );
}
