import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import ChatRoom from './chat-room';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ChatPage({ params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    const session = await getSession();
    if (!session) redirect('/teams?signin=required');

    const team = await prisma.team.findFirst({
        where: session.role === 'ADMIN' ? { id: teamId } : { id: teamId, members: { some: { id: session.userId } } },
        select: { id: true, name: true }
    });

    if (!team) redirect('/teams?notice=not-assigned');

    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true }
    });

    return (
        <div className="chat-room-page">
            <div className="chat-header">
                <Link href="/teams" className="page-back-btn" aria-label="Back to Teams">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1>{team.name}</h1>
                    <p className="page-kicker">Team chat · Back to Teams</p>
                </div>
            </div>

            <ChatRoom teamId={team.id} userId={session.userId} userName={currentUser?.name || 'User'} />
        </div>
    );
}
