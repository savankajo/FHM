import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    try {
        const service = await prisma.service.create({
            data: {
                title: body.title,
                date: new Date(body.date),
                description: body.description,
                maxVolunteers: body.maxVolunteers ? parseInt(body.maxVolunteers) : null,
                teamId: body.teamId
            }
        });

        return NextResponse.json({ service });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}
