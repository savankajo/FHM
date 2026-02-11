import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    try {
        const event = await prisma.event.create({
            data: {
                title: body.title,
                description: body.description,
                votingDeadline: body.votingDeadline,
                locations: body.locations,
                createdByUserId: session.userId,
                // teamScope: null // Defaulting to global for now
            }
        });

        return NextResponse.json({ event });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
