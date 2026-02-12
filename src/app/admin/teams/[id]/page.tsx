import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AddServiceForm from './add-service-form';
import MemberManager from './member-manager';

export const dynamic = 'force-dynamic';

export default async function AdminTeamDetailsPage({ params }: { params: { id: string } }) {
    const team = await prisma.team.findUnique({
        where: { id: params.id },
        include: {
            services: {
                orderBy: { date: 'asc' },
                include: { _count: { select: { volunteers: true } } }
            },
            members: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' }
    });

    if (!team) return <div>Team not found</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/admin/teams" className="text-sm text-gray-500 mb-2 block">← Back to Teams</Link>
                    <h1 className="text-xl font-bold">Manage: {team.name}</h1>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Members Section */}
                    <section>
                        <h2 className="font-bold mb-4">Team Members</h2>
                        <MemberManager teamId={team.id} members={team.members} allUsers={allUsers} />
                    </section>

                    <section>
                        <h2 className="font-bold mb-4">Scheduled Services</h2>
                        {team.services.length === 0 ? (
                            <p className="text-gray-500">No services scheduled.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {team.services.map(service => (
                                    <div key={service.id} className="card p-3 bg-white shadow-sm">
                                        <div className="font-bold">{service.title}</div>
                                        <div className="text-sm">
                                            {new Date(service.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {service._count.volunteers} / {service.maxVolunteers || '∞'} Volunteers
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div>
                    <h2 className="font-bold mb-4">Add Upcoming Service</h2>
                    <div className="card p-4 bg-white shadow">
                        <AddServiceForm teamId={team.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
