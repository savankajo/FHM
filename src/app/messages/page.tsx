import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MessagesHub from './messages-hub';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [teams, requests, conversations] = await Promise.all([
    prisma.team.findMany({
      where: session.role === 'ADMIN' ? undefined : { members: { some: { id: session.userId } } },
      select: { id: true, name: true, description: true, _count: { select: { members: true } } }, orderBy: { name: 'asc' },
    }),
    prisma.friendRequest.findMany({
      where: { status: 'ACCEPTED', OR: [{ requesterId: session.userId }, { recipientId: session.userId }] },
      include: { requester: { select: { id: true, name: true } }, recipient: { select: { id: true, name: true } } },
    }),
    prisma.directConversation.findMany({
      where: { OR: [{ participantLowId: session.userId }, { participantHighId: session.userId }] },
      select: { participantLowId: true, participantHighId: true, messages: { select: { text: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
    }),
  ]);
  const lastMessageByFriend = new Map(conversations.map(conversation => [conversation.participantLowId === session.userId ? conversation.participantHighId : conversation.participantLowId, conversation.messages[0]]));
  const contacts = requests.map(request => request.requesterId === session.userId ? request.recipient : request.requester).map(friend => ({
    ...friend, preview: lastMessageByFriend.get(friend.id)?.text || null, updatedAt: lastMessageByFriend.get(friend.id)?.createdAt.toISOString() || null,
  })).sort((left, right) => (right.updatedAt || '').localeCompare(left.updatedAt || ''));
  const incoming = await prisma.friendRequest.findMany({
    where: { recipientId: session.userId, status: 'PENDING' },
    select: { id: true, requester: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' },
  });

  return <MessagesHub contacts={contacts} teams={teams.map(team => ({ id: team.id, name: team.name, description: team.description, memberCount: team._count.members }))} incoming={incoming.map(item => ({ id: item.id, user: item.requester }))} />;
}
