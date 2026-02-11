import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';
const COOKIE_NAME = 'fhm_token';

export async function hashPassword(password: string): Promise<string> {
    return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
}

export async function createSession(userId: string, role: string) {
    const token = sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });

    cookies().set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
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
