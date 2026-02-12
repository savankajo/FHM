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
                                    <div className="team-icon">🛡️</div>
                                    <div>
                                        <h3 className="font-bold">{team.name}</h3>
                                        <p className="text-sm text-muted-foreground">{team._count.members} Members</p>
                                    </div>
                                    <div className="ml-auto pointer">➡️</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="section-title">Explore Teams</h2>
                {otherTeams.length === 0 ? (
                    <p className="text-muted-foreground">No other teams available.</p>
                ) : (
                    <div className="card-list">
                        {otherTeams.map(team => (
                            <div key={team.id} className="card team-card">
                                <div className="team-icon">👥</div>
                                <div className="flex-1">
                                    <h3 className="font-bold">{team.name}</h3>
                                    <p className="text-sm text-muted-foreground">{team.description || 'No description'}</p>
                                </div>
                                {/* <JoinButton teamId={team.id} /> REMOVED: Admin only access */}
                                <span className="text-xs text-muted-foreground">Contact Admin to Join</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>


        </div>
    );
}
