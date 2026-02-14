import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    try {
        const sermon = await prisma.sermon.create({
            data: {
                title: body.title,
                speaker: body.speaker,
                date: new Date(body.date),
                type: body.type, // 'VIDEO' or 'PDF'
                videoUrl: body.videoUrl || null,
                fileUrl: body.fileUrl || null,
                notes: body.notes
            }
        });

        return NextResponse.json({ sermon });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.sermon.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();

    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const sermon = await prisma.sermon.update({
            where: { id: body.id },
            data: {
                title: body.title,
                speaker: body.speaker,
                date: new Date(body.date),
                type: body.type,
                videoUrl: body.videoUrl || null,
                fileUrl: body.fileUrl || null,
                notes: body.notes
            }
        });

        return NextResponse.json({ sermon });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
