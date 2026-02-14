import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import JoinButton from './join-button';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="p-4 text-center">
                <p>Please sign in to view teams.</p>
                <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
            </div>
        );
    }

    // Get user's teams
    const myTeams = await prisma.team.findMany({
        where: {
            members: { some: { id: session.userId } }
        },
        include: { _count: { select: { members: true } } }
    });

    // Get all teams (excluding ones user is already in)
    const otherTeams = await prisma.team.findMany({
        where: {
            NOT: { members: { some: { id: session.userId } } }
        },
        include: { _count: { select: { members: true } } }
    });

    return (
        <div className="teams-page">
            <h1 className="page-title">Teams</h1>

            <section className="mb-8">
                <h2 className="section-title">My Teams</h2>
                {myTeams.length === 0 ? (
                    <p className="text-muted-foreground">You are not in any teams yet.</p>
                ) : (
                    <div className="card-list">
                        {myTeams.map(team => (
                            <Link key={team.id} href={`/teams/${team.id}`}>
                                <div className="card team-card">
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold bg-orange-100 text-orange-800 px-3 py-1 rounded-md inline-block">{team.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{team._count.members} Members</p>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors">
                                            <span className="mr-2">💬</span>
                                            <span>Press to chat</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>


        </div>
    );
}
