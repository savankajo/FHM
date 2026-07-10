import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { action, messageId, userId, reason = 'Offensive or inappropriate content' } = await request.json();
  if (action === 'report' && messageId) {
    await prisma.chatReport.upsert({ where: { reporterId_messageId: { reporterId: session.userId, messageId } }, update: { reason }, create: { reporterId: session.userId, messageId, reason } });
    return NextResponse.json({ success: true });
  }
  if (action === 'block' && userId && userId !== session.userId) {
    await prisma.userBlock.upsert({ where: { blockerId_blockedId: { blockerId: session.userId, blockedId: userId } }, update: {}, create: { blockerId: session.userId, blockedId: userId } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
