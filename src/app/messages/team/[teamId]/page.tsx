import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ChatRoom from '@/app/chat/[teamId]/chat-room';

export const dynamic = 'force-dynamic';

export default async function TeamMessagePage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');
  const team = await prisma.team.findFirst({ where: session.role === 'ADMIN' ? { id: teamId } : { id: teamId, members: { some: { id: session.userId } } }, select: { id: true, name: true } });
  if (!team) redirect('/messages');
  const currentUser = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } });
  return <div className="chat-room-page"><div className="chat-header"><Link href="/messages" className="page-back-btn" aria-label="Back to Messages">‹</Link><div><h1>{team.name}</h1><p className="page-kicker">Team conversation · Assigned members only</p></div></div><ChatRoom teamId={team.id} userId={session.userId} userName={currentUser?.name || 'User'} /></div>;
}
