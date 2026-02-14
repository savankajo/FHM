import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Users can no longer join teams on their own
    // Only admins can add members through the admin panel
    return NextResponse.json(
        { error: 'You cannot join teams directly. Please contact an admin to be added to a team.' },
        { status: 403 }
    );
}
