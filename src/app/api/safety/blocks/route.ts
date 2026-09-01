import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, reason: true, createdAt: true, blocked: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ blocks });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { userId } = await request.json();
  if (typeof userId !== 'string' || userId === session.userId) return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
  await prisma.userBlock.deleteMany({ where: { blockerId: session.userId, blockedId: userId } });
  return NextResponse.json({ success: true });
}
