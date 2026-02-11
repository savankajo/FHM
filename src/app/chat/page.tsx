import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ChatIndexPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="p-4 text-center">
                <p>Please sign in to view your chats.</p>
                <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
            </div>
        );
    }

    // Get user's teams
    const myTeams = await prisma.team.findMany({
        where: {
            members: { some: { id: session.userId } }
        },
        select: { id: true, name: true }
    });

    return (
        <div>
            <h1 className="page-title">Team Chats</h1>
            <p className="subtitle">Select a team to start chatting.</p>

            {myTeams.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't joined any teams yet.</p>
                    <Link href="/teams"><Button variant="outline" className="mt-4">Browse Teams</Button></Link>
                </div>
            ) : (
                <div className="card-list">
                    {myTeams.map(team => (
                        <Link key={team.id} href={`/chat/${team.id}`}>
                            <div className="card chat-card">
                                <div className="chat-icon">💬</div>
                                <div className="chat-info">
                                    <h3 className="font-bold">{team.name}</h3>
                                    <p className="text-sm text-muted-foreground">Tap to open chat room</p>
                                </div>
                                <div className="arrow">➡️</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <style jsx>{`
        .page-title { font-size: 1.5rem; color: var(--primary); margin: 0; }
        .subtitle { color: var(--muted-foreground); margin-bottom: 2rem; }
        
        .card-list { display: flex; flex-direction: column; gap: 1rem; }
        .chat-card { display: flex; align-items: center; gap: 1rem; transition: transform 0.1s; cursor: pointer; }
        .chat-card:active { transform: scale(0.98); }
        
        .chat-icon { font-size: 1.5rem; background: var(--muted); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .chat-info { flex: 1; }
        .empty-state { text-align: center; padding: 2rem; background: var(--muted); border-radius: var(--radius); }
      `}</style>
        </div>
    );
}
