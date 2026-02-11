import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { teamId } = await request.json();

    try {
        // Simplified: Auto-join for now to facilitate testing features
        await prisma.team.update({
            where: { id: teamId },
            data: {
                members: {
                    connect: { id: session.userId }
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }
}
