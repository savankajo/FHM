import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BIBLE_VERSIONS } from '@/lib/bible-api';
import { normalizeVerseNumbers } from '@/app/bible/verse-selection';
import { Prisma } from '@prisma/client';
import { bibleAnnotationOwner } from '@/lib/bible-annotations';

const HIGHLIGHT_COLORS = new Set(['yellow', 'green', 'blue', 'pink']);

function readReference(body: Record<string, unknown>) {
    const version = typeof body.version === 'string' ? body.version : '';
    const bookId = typeof body.bookId === 'string' ? body.bookId.trim() : '';
    const chapterId = typeof body.chapterId === 'string' ? body.chapterId.trim() : '';
    const chapterReference = typeof body.chapterReference === 'string' ? body.chapterReference.trim() : '';
    const verses = normalizeVerseNumbers(Array.isArray(body.verses) ? body.verses.map(Number) : []);
    if (!(version in BIBLE_VERSIONS) || !bookId || bookId.length > 100 || !chapterId || chapterId.length > 160 || chapterReference.length > 160 || verses.length === 0 || verses.length > 100) {
        return null;
    }
    return { version, bookId, chapterId, chapterReference: chapterReference || chapterId, verses, verseKey: verses.join(',') };
}

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Sign in to sync private Bible notes.' }, { status: 401 });
    const owner = bibleAnnotationOwner(session.userId);

    const [highlights, notes] = await Promise.all([
        prisma.bibleHighlight.findMany({ where: owner, orderBy: { updatedAt: 'desc' } }),
        prisma.bibleNote.findMany({ where: owner, orderBy: { updatedAt: 'desc' } }),
    ]);
    return NextResponse.json({ highlights, notes });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Sign in to save private Bible notes.' }, { status: 401 });
    const owner = bibleAnnotationOwner(session.userId);

    const body = await request.json() as Record<string, unknown>;

    if (body.type === 'legacy-import') {
        const entries = Array.isArray(body.entries) ? body.entries.slice(0, 300) : [];
        const operations: Prisma.PrismaPromise<unknown>[] = [];
        for (const rawEntry of entries) {
            if (!rawEntry || typeof rawEntry !== 'object') continue;
            const entry = rawEntry as { key?: unknown; color?: unknown; note?: unknown };
            if (typeof entry.key !== 'string') continue;
            const match = entry.key.match(/^([^:]+):(.+):(\d+)$/);
            if (!match || !(match[1] in BIBLE_VERSIONS)) continue;
            const [, version, chapterId, verseValue] = match;
            const verse = Number(verseValue);
            if (!chapterId || chapterId.length > 160 || !Number.isInteger(verse) || verse < 1) continue;
            const bookId = chapterId.split('.')[0] || chapterId;
            if (typeof entry.color === 'string' && HIGHLIGHT_COLORS.has(entry.color)) {
                operations.push(prisma.bibleHighlight.upsert({
                    where: { userId_version_chapterId_verse: { userId: owner.userId, version, chapterId, verse } },
                    create: { userId: owner.userId, version, bookId, chapterId, chapterReference: chapterId, verse, color: entry.color },
                    update: {},
                }));
            }
            const note = typeof entry.note === 'string' ? entry.note.trim() : '';
            if (note && note.length <= 2000) {
                operations.push(prisma.bibleNote.upsert({
                    where: { userId_version_chapterId_verseKey: { userId: owner.userId, version, chapterId, verseKey: String(verse) } },
                    create: { userId: owner.userId, version, bookId, chapterId, chapterReference: chapterId, verseKey: String(verse), verses: [verse], note },
                    update: {},
                }));
            }
        }
        if (operations.length) await prisma.$transaction(operations);
        return NextResponse.json({ imported: operations.length });
    }

    const reference = readReference(body);
    if (!reference) return NextResponse.json({ error: 'Choose one or more valid verses first.' }, { status: 422 });

    if (body.type === 'highlight') {
        const color = typeof body.color === 'string' ? body.color : '';
        if (color && !HIGHLIGHT_COLORS.has(color)) return NextResponse.json({ error: 'Choose a supported highlight color.' }, { status: 422 });
        if (!color) {
            await prisma.bibleHighlight.deleteMany({
                where: { ...owner, version: reference.version, chapterId: reference.chapterId, verse: { in: reference.verses } },
            });
        } else {
            await prisma.$transaction(reference.verses.map(verse => prisma.bibleHighlight.upsert({
                where: { userId_version_chapterId_verse: { userId: owner.userId, version: reference.version, chapterId: reference.chapterId, verse } },
                create: { userId: owner.userId, version: reference.version, bookId: reference.bookId, chapterId: reference.chapterId, chapterReference: reference.chapterReference, verse, color },
                update: { bookId: reference.bookId, chapterReference: reference.chapterReference, color },
            })));
        }
        const highlights = await prisma.bibleHighlight.findMany({ where: owner, orderBy: { updatedAt: 'desc' } });
        return NextResponse.json({ highlights });
    }

    if (body.type === 'note') {
        const note = typeof body.note === 'string' ? body.note.trim() : '';
        if (!note || note.length > 2000) return NextResponse.json({ error: 'A private note must be between 1 and 2,000 characters.' }, { status: 422 });
        const saved = await prisma.bibleNote.upsert({
            where: { userId_version_chapterId_verseKey: { userId: owner.userId, version: reference.version, chapterId: reference.chapterId, verseKey: reference.verseKey } },
            create: { userId: owner.userId, ...reference, note },
            update: { bookId: reference.bookId, chapterReference: reference.chapterReference, verses: reference.verses, note },
        });
        return NextResponse.json({ note: saved });
    }

    return NextResponse.json({ error: 'Unsupported Bible annotation action.' }, { status: 400 });
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const owner = bibleAnnotationOwner(session.userId);
    const body = await request.json() as { id?: unknown };
    if (typeof body.id !== 'string' || !body.id) return NextResponse.json({ error: 'Note id required.' }, { status: 422 });
    const result = await prisma.bibleNote.deleteMany({ where: { id: body.id, ...owner } });
    if (!result.count) return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    return NextResponse.json({ deleted: true });
}
