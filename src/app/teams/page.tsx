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
                                <JoinButton teamId={team.id} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <style jsx>{`
        .teams-page {
          padding-bottom: 2rem;
        }
        .page-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--primary);
        }
        .section-title {
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
          border-bottom: 2px solid var(--border);
          padding-bottom: 0.25rem;
        }
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .team-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.1s;
          cursor: pointer;
        }
        .team-card:active {
          transform: scale(0.98);
        }
        .team-icon {
          font-size: 1.5rem;
          background: var(--muted);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .pointer {
          cursor: pointer;
        }
      `}</style>
        </div>
    );
}
