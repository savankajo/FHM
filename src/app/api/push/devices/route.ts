import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function validApnsToken(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{32,256}$/i.test(value);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await request.json();
  if (!validApnsToken(token)) return NextResponse.json({ error: 'Invalid device token' }, { status: 400 });

  await prisma.pushDevice.upsert({
    where: { token },
    update: { userId: session.userId, platform: 'ios', lastSeenAt: new Date(), disabledAt: null },
    create: { token, userId: session.userId, platform: 'ios' },
  });
  return NextResponse.json({ registered: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await request.json().catch(() => ({ token: null }));
  if (!validApnsToken(token)) return NextResponse.json({ removed: false });

  await prisma.pushDevice.deleteMany({ where: { token, userId: session.userId } });
  return NextResponse.json({ removed: true });
}
