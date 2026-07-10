import { NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.$transaction(async tx => {
    // Events require a creator, so remove events owned by this account first.
    await tx.event.deleteMany({ where: { createdByUserId: session.userId } });
    await tx.user.delete({ where: { id: session.userId } });
  });
  await destroySession();
  return NextResponse.json({ success: true });
}
