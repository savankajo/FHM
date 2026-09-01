import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'fhm_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function jwtSecret() {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be configured in production.');
    return 'local-development-only-secret';
}

export async function hashPassword(password: string): Promise<string> {
    return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
}

function shouldUseSecureCookie(request?: Request) {
    if (request) {
        const forwardedProto = request.headers.get('x-forwarded-proto');
        const protocol = forwardedProto || new URL(request.url).protocol.replace(':', '');
        return protocol === 'https';
    }

    return process.env.NODE_ENV === 'production';
}

function sessionCookieOptions(request?: Request) {
    return {
        httpOnly: true,
        secure: shouldUseSecureCookie(request),
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
    } as const;
}

export function createSessionToken(userId: string, role: string) {
    return sign({ userId, role }, jwtSecret(), { expiresIn: '7d' });
}

export function setSessionCookie(response: NextResponse, token: string, request?: Request) {
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions(request));
}

export async function createSession(userId: string, role: string, request?: Request) {
    const token = createSessionToken(userId, role);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, sessionCookieOptions(request));
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const payload = verify(token, jwtSecret()) as { userId: string; role: string };
        const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, role: true, accountStatus: true, suspendedUntil: true } });
        if (!user || user.accountStatus === 'BANNED') return null;
        if (user.accountStatus === 'SUSPENDED') {
            if (!user.suspendedUntil || user.suspendedUntil > new Date()) return null;
            await prisma.user.update({ where: { id: user.id }, data: { accountStatus: 'ACTIVE', suspendedUntil: null } });
        }
        return { userId: user.id, role: user.role };
    } catch (error) {
        return null;
    }
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}
