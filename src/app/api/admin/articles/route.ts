import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';
import { notifyNewMedia } from '@/lib/notifications';

export async function POST(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'media', 'add')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    try {
        const article = await prisma.article.create({
            data: {
                title: body.title,
                author: body.author,
                summary: body.summary || null,
                body: body.body || null,
                publishedAt: new Date(body.publishedAt),
                imageUrl: body.imageUrl || null,
                linkUrl: body.linkUrl || null,
                audienceTeamIds: body.audienceTeamIds || [],
            },
        });

        try {
            await notifyNewMedia({ id: article.id, kind: 'article', title: article.title, audienceTeamIds: article.audienceTeamIds });
        } catch (notificationError) {
            console.error('Article notification failed:', notificationError);
        }

        return NextResponse.json({ article });
    } catch {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'media', 'edit')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const article = await prisma.article.update({
            where: { id: body.id },
            data: {
                title: body.title,
                author: body.author,
                summary: body.summary || null,
                body: body.body || null,
                publishedAt: new Date(body.publishedAt),
                imageUrl: body.imageUrl || null,
                linkUrl: body.linkUrl || null,
                audienceTeamIds: body.audienceTeamIds || [],
            },
        });

        return NextResponse.json({ article });
    } catch {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'media', 'remove')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.article.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
