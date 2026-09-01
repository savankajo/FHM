import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CURRENT_TERMS_VERSION } from '@/lib/terms';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { accepted, version } = await request.json();
  if (accepted !== true || version !== CURRENT_TERMS_VERSION) {
    return NextResponse.json({ error: 'Explicit acceptance of the current Terms of Use is required.' }, { status: 400 });
  }

  const acceptedAt = new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id: session.userId }, data: { termsAcceptedVersion: CURRENT_TERMS_VERSION, termsAcceptedAt: acceptedAt } }),
    prisma.termsAcceptance.upsert({
      where: { userId_version: { userId: session.userId, version: CURRENT_TERMS_VERSION } },
      update: { acceptedAt, method: 'authenticated_gate' },
      create: { userId: session.userId, version: CURRENT_TERMS_VERSION, acceptedAt, method: 'authenticated_gate' },
    }),
  ]);
  return NextResponse.json({ accepted: true, version: CURRENT_TERMS_VERSION, acceptedAt });
}
