import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';

export async function GET() {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'teams', 'edit') && !await canManage(session?.userId, session?.role, 'media', 'edit') && !await canManage(session?.userId, session?.role, 'events', 'edit')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const teams = await prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    return NextResponse.json({ teams });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'teams', 'add')) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    try {
        const team = await prisma.team.create({
            data: {
                name: body.name,
                description: body.description
            }
        });

        return NextResponse.json({ team });
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
