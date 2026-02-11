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

    // Fetch current user for name
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true }
    });

    return (
        <div className="chat-room-page">
            <div className="chat-header">
                <Link href="/chat" className="back-btn">←</Link>
                <h1>{team.name}</h1>
            </div>

            <ChatRoom teamId={team.id} userId={session.userId} userName={currentUser?.name || 'User'} />


        </div>
    );
}
