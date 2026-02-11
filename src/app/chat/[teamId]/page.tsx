import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import ChatRoom from './chat-room';

export const dynamic = 'force-dynamic';

export default async function ChatPage({ params }: { params: { teamId: string } }) {
    const session = await getSession();
    if (!session) return <p>Unauthorized</p>;

    const team = await prisma.team.findUnique({
        where: { id: params.teamId },
        select: { id: true, name: true }
    });

    if (!team) return <p>Team not found</p>;

    // Verify membership
    const isMember = await prisma.team.findFirst({
        where: {
            id: params.teamId,
            members: { some: { id: session.userId } }
        }
    });

    if (!isMember && session.role !== 'ADMIN') return <p>Access Denied</p>;

    return (
        <div className="chat-page">
            <div className="chat-header">
                <Link href="/chat" className="back-btn">←</Link>
                <h1>{team.name}</h1>
            </div>

            <ChatRoom teamId={team.id} userId={session.userId} userName={session.name} />

            <style jsx>{`
        .chat-page { 
          display: flex; 
          flex-direction: column; 
          height: calc(100vh - 80px); /* Adjust for bottom nav + padding */
          margin: -1rem; /* Break out of container padding */
          background: var(--background);
        }
        .chat-header {
          padding: 1rem;
          background: var(--background);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: bold;
          font-size: 1.1rem;
          color: var(--foreground);
        }
        .back-btn { font-size: 1.5rem; line-height: 1; }
        h1 { margin: 0; font-size: 1.1rem; }
      `}</style>
        </div>
    );
}
