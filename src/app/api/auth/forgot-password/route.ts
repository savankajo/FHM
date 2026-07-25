import { randomBytes, createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPasswordResetEmailConfigured, sendPasswordResetEmail } from '@/lib/email';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

function hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

function getAppUrl(request: Request) {
    return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        if (!isPasswordResetEmailConfigured()) {
            console.error('Forgot password email is not configured.');
            return NextResponse.json({ error: 'Password reset email is not configured' }, { status: 503 });
        }

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true },
        });

        if (user) {
            await prisma.passwordResetToken.updateMany({
                where: { userId: user.id, usedAt: null },
                data: { usedAt: new Date() },
            });

            const token = randomBytes(32).toString('hex');
            const tokenHash = hashResetToken(token);
            const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

            await prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt,
                },
            });

            const resetUrl = `${getAppUrl(request)}/reset-password?token=${token}`;
            await sendPasswordResetEmail(user.email, resetUrl);
        }

        return NextResponse.json({
            message: 'If an account exists for that email, a reset link has been sent.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
