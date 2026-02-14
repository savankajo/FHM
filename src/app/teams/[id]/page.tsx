import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import VolunteerButton from './volunteer-button';
import DeleteServiceButton from './delete-service-button';

export const dynamic = 'force-dynamic';

export default async function TeamDetailsPage({ params }: { params: { id: string } }) {
    // Verify session
    const session = await getSession();
    if (!session) return <p>Unauthorized</p>;

    // Prepare service filter: Admins see all, others see only future + today
    const serviceWhere = session.role === 'ADMIN'
        ? {}
        : { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } };

    // Fetch team with relations
    const team = await prisma.team.findUnique({
        where: { id: params.id },
        include: {
            services: {
                where: serviceWhere,
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
                                        {service.volunteers.length > 0 && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p className="font-semibold text-xs text-gray-400 uppercase">Volunteers:</p>
                                                <ul className="list-disc list-inside">
                                                    {service.volunteers.map(v => (
                                                        <li key={v.id}>{v.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="action flex gap-2">
                                        {session.role === 'ADMIN' && (
                                            <DeleteServiceButton serviceId={service.id} teamId={team.id} />
                                        )}
                                        <VolunteerButton
                                            serviceId={service.id}
                                            isVolunteering={isVolunteering}
                                            disabled={spotsLeft === 0 && !isVolunteering}
                                            serviceTitle={service.title}
                                            serviceDate={service.date}
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


        </div>
    );
}
