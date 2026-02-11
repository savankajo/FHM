import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    try {
        const team = await prisma.team.create({
            data: {
                name: body.name,
                description: body.description
            }
        });

        return NextResponse.json({ team });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
