import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const TOPICS = ['media', 'events', 'teams', 'live', 'users'];
const ACTIONS = ['add', 'edit', 'remove'];

export async function PUT(request: Request) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();
    const userId = String(body.userId || '');
    const role = body.role;
    const permissions = body.permissions || {};

    if (!userId) return NextResponse.json({ error: 'User required' }, { status: 400 });
    if (!['ADMIN', 'LEADER', 'MEMBER'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    const cleanPermissions = Object.fromEntries(
        TOPICS.map(topic => [
            topic,
            Array.isArray(permissions[topic])
                ? permissions[topic].filter((action: string) => ACTIONS.includes(action))
                : [],
        ])
    );

    const user = await prisma.user.update({
        where: { id: userId },
        data: { role, permissions: cleanPermissions },
        select: { id: true, role: true, permissions: true },
    });

    return NextResponse.json({ user });
}
