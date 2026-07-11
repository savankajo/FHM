import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function ChatHero({ signedIn }: { signedIn: boolean }) {
    return (
        <div className="chat-hero">
            <div className="chat-hero-overlay" />
            <div className="chat-hero-content">
                <div className="chat-hero-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
                    </svg>
                </div>
                <h1 className="chat-hero-title">Team Chats</h1>
                <p className="chat-hero-sub">
                    {signedIn ? 'Private conversations for the teams you belong to.' : 'Sign in to open your team conversations.'}
                </p>
            </div>
        </div>
    );
}

export default async function ChatIndexPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="chat-page">
                <ChatHero signedIn={false} />
                <div className="chat-empty">
                    <p>Please sign in to view your chats.</p>
                    <Link href="/login" className="chat-empty-link">Sign In</Link>
                </div>
            </div>
        );
    }

    const myTeams = await prisma.team.findMany({
        where: {
            members: { some: { id: session.userId } }
        },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="chat-page">
            <ChatHero signedIn />

            <div className="chat-section-head">
                <div>
                    <div className="chat-section-label">Your Chats</div>
                    <p>{myTeams.length === 1 ? '1 active team chat' : `${myTeams.length} active team chats`}</p>
                </div>
                <span className="chat-section-chip">Members only</span>
            </div>

            {myTeams.length === 0 ? (
                <div className="chat-empty">
                    <p>You haven't joined any teams yet.</p>
                    <Link href="/teams" className="chat-empty-link">View Teams</Link>
                </div>
            ) : (
                <div className="chat-list">
                    {myTeams.map(team => (
                        <Link key={team.id} href={`/chat/${team.id}`} className="chat-card">
                            <div className="chat-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
                                    <path d="M8 10h8M8 14h5" />
                                </svg>
                            </div>
                            <div className="chat-card-body">
                                <div className="chat-card-title-row">
                                    <h2>{team.name}</h2>
                                    <span>Open</span>
                                </div>
                                <p>Messages are visible only to this team.</p>
                            </div>
                            <div className="chat-card-arrow" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
