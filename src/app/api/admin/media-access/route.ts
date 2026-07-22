import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getSermonCollection, SermonCollection } from '@/lib/media-metadata';
import { canManage } from '@/lib/permissions';

const COLLECTIONS: SermonCollection[] = ['saturday', 'tuesday', 'thursday'];

export async function PUT(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'media', 'edit')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const collection = body.collection as SermonCollection;
    const audienceTeamIds = Array.isArray(body.audienceTeamIds) ? body.audienceTeamIds.map(String) : [];

    if (!COLLECTIONS.includes(collection)) {
        return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const sermons = await prisma.sermon.findMany({ select: { id: true, notes: true } });
    const targetIds = sermons
        .filter(sermon => getSermonCollection(sermon.notes) === collection)
        .map(sermon => sermon.id);

    await Promise.all(targetIds.map(id => prisma.sermon.update({
        where: { id },
        data: { audienceTeamIds },
    })));

    return NextResponse.json({ success: true, updated: targetIds.length });
}
