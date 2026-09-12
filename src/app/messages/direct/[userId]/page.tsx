import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canDirectMessage } from '@/lib/friendship';
import DirectRoom from './direct-room';

export const dynamic = 'force-dynamic';

export default async function DirectMessagePage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession(); if (!session) redirect('/login');
  const { userId } = await params;
  const friend = await prisma.user.findFirst({ where: { id: userId, accountStatus: 'ACTIVE' }, select: { id: true, name: true } });
  if (!friend || !await canDirectMessage(session.userId, userId)) redirect('/messages');
  return <div className="chat-room-page"><div className="chat-header"><Link href="/messages" className="page-back-btn" aria-label="Back to Messages">‹</Link><div><h1>{friend.name}</h1><p className="page-kicker">Private conversation · Friends only</p></div></div><DirectRoom userId={session.userId} otherUserId={friend.id} /></div>;
}
