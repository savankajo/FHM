import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { CURRENT_TERMS_VERSION } from '@/lib/terms';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let { email, password, termsAccepted, termsVersion } = body;
        if (email) email = email.toLowerCase();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing email or password' },
                { status: 400 }
            );
        }
        if (termsAccepted !== true || termsVersion !== CURRENT_TERMS_VERSION) {
            return NextResponse.json({ error: 'You must explicitly accept the current Terms of Use before signing in.' }, { status: 428 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (user.accountStatus === 'BANNED') {
            return NextResponse.json({ error: 'This account is no longer permitted to access FHM Church.' }, { status: 403 });
        }
        if (user.accountStatus === 'SUSPENDED' && (!user.suspendedUntil || user.suspendedUntil > new Date())) {
            return NextResponse.json({ error: 'This account is temporarily suspended. Contact support if you need help.' }, { status: 403 });
        }

        const acceptedAt = new Date();
        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { termsAcceptedVersion: CURRENT_TERMS_VERSION, termsAcceptedAt: acceptedAt, ...(user.accountStatus === 'SUSPENDED' ? { accountStatus: 'ACTIVE', suspendedUntil: null } : {}) } }),
            prisma.termsAcceptance.upsert({
                where: { userId_version: { userId: user.id, version: CURRENT_TERMS_VERSION } },
                update: { acceptedAt, method: 'pre_auth_login' },
                create: { userId: user.id, version: CURRENT_TERMS_VERSION, acceptedAt, method: 'pre_auth_login' },
            }),
        ]);

        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                termsAccepted: true,
                termsVersion: CURRENT_TERMS_VERSION,
            },
        });

        setSessionCookie(response, createSessionToken(user.id, user.role), request);
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
