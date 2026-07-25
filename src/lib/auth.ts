import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';
const COOKIE_NAME = 'fhm_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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
    return sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function setSessionCookie(response: NextResponse, token: string, request?: Request) {
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions(request));
}

export async function createSession(userId: string, role: string, request?: Request) {
    const token = createSessionToken(userId, role);

    cookies().set(COOKIE_NAME, token, sessionCookieOptions(request));
}

export async function getSession() {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const payload = verify(token, JWT_SECRET) as { userId: string; role: string };
        return payload;
    } catch (error) {
        return null;
    }
}

export async function destroySession() {
    cookies().delete(COOKIE_NAME);
}
