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
        <div className="chat-page">
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


        </div>
    );
}
