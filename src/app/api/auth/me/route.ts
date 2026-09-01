import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CURRENT_TERMS_VERSION } from '@/lib/terms';

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            termsAcceptedVersion: true,
            termsAcceptedAt: true,
        },
    });

    return NextResponse.json({ user: user ? { ...user, termsAccepted: user.termsAcceptedVersion === CURRENT_TERMS_VERSION, termsVersion: CURRENT_TERMS_VERSION } : null });
}
