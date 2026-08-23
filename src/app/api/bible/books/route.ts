import { NextRequest, NextResponse } from 'next/server';
import { bibleApi, BIBLE_VERSIONS, isBibleVersion } from '@/lib/bible-api';
import avd from '@/data/avd.json';

export async function GET(request: NextRequest) {
  try {
    const version = request.nextUrl.searchParams.get('version') || '';
    if (!isBibleVersion(version)) return NextResponse.json({ error: 'Invalid Bible version' }, { status: 400 });
    if (version === 'AVD') return NextResponse.json({ data: avd.books.map(book => ({ id: book.id, name: book.name, nameLong: book.nameLong, chapters: book.chapters.map(chapter => ({ id: chapter.id, number: chapter.number })) })) });
    const result = await bibleApi(`/bibles/${BIBLE_VERSIONS[version].id}/books?include-chapters=true`);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Bible service unavailable' }, { status: 503 });
  }
}
