import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

function hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (typeof token !== 'string' || !token) {
            return NextResponse.json({ error: 'Reset link is invalid' }, { status: 400 });
        }

        if (typeof password !== 'string' || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const tokenHash = hashResetToken(token);
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        });

        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Reset link is invalid or expired' }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: await hashPassword(password) },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
        ]);

        return NextResponse.json({ message: 'Password has been reset. You can sign in now.' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
