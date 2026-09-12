import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { usersHaveBlockedEachOther } from '@/lib/friendship';

const person = { select: { id: true, name: true } } as const;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [requests, people] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { OR: [{ requesterId: session.userId }, { recipientId: session.userId }] },
      orderBy: { createdAt: 'desc' },
      include: { requester: person, recipient: person },
    }),
    prisma.user.findMany({
      where: {
        id: { not: session.userId },
        accountStatus: 'ACTIVE',
        blocksMade: { none: { blockedId: session.userId } },
        blocksReceived: { none: { blockerId: session.userId } },
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 100,
    }),
  ]);

  const friends = requests.filter(request => request.status === 'ACCEPTED').map(request =>
    request.requesterId === session.userId ? request.recipient : request.requester,
  );
  const incoming = requests.filter(request => request.status === 'PENDING' && request.recipientId === session.userId)
    .map(request => ({ id: request.id, user: request.requester }));
  const outgoing = requests.filter(request => request.status === 'PENDING' && request.requesterId === session.userId)
    .map(request => request.recipientId);
  const relatedUserIds = new Set(requests.flatMap(request => [request.requesterId, request.recipientId]));

  return NextResponse.json({
    friends,
    incoming,
    people: people.filter(user => !relatedUserIds.has(user.id)),
    outgoing,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { recipientId } = await request.json();
  if (typeof recipientId !== 'string' || recipientId === session.userId) return NextResponse.json({ error: 'Choose another user.' }, { status: 400 });

  const recipient = await prisma.user.findFirst({ where: { id: recipientId, accountStatus: 'ACTIVE' }, select: { id: true } });
  if (!recipient) return NextResponse.json({ error: 'This user is not available.' }, { status: 404 });
  if (await usersHaveBlockedEachOther(session.userId, recipientId)) return NextResponse.json({ error: 'This user is not available.' }, { status: 403 });

  const existing = await prisma.friendRequest.findFirst({
    where: { OR: [{ requesterId: session.userId, recipientId }, { requesterId: recipientId, recipientId: session.userId }] },
  });
  if (existing?.status === 'ACCEPTED') return NextResponse.json({ error: 'You are already friends.' }, { status: 409 });
  if (existing?.status === 'PENDING') return NextResponse.json({ error: existing.requesterId === session.userId ? 'Friend request already sent.' : 'This user has already sent you a request. Accept it below.' }, { status: 409 });

  if (existing?.requesterId === session.userId) {
    await prisma.friendRequest.update({ where: { id: existing.id }, data: { status: 'PENDING', respondedAt: null } });
  } else {
    await prisma.friendRequest.create({ data: { requesterId: session.userId, recipientId } });
  }
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { requestId, decision } = await request.json();
  if (typeof requestId !== 'string' || !['accept', 'decline'].includes(decision)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const pending = await prisma.friendRequest.findFirst({ where: { id: requestId, recipientId: session.userId, status: 'PENDING' } });
  if (!pending) return NextResponse.json({ error: 'Friend request not found.' }, { status: 404 });
  if (decision === 'accept' && await usersHaveBlockedEachOther(session.userId, pending.requesterId)) return NextResponse.json({ error: 'This request can no longer be accepted.' }, { status: 403 });
  await prisma.friendRequest.update({ where: { id: pending.id }, data: { status: decision === 'accept' ? 'ACCEPTED' : 'DECLINED', respondedAt: new Date() } });
  return NextResponse.json({ success: true });
}
