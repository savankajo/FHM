import { NextRequest, NextResponse } from 'next/server';
import { bibleApi, BIBLE_VERSIONS, isBibleVersion } from '@/lib/bible-api';
import avd from '@/data/avd.json';

export async function GET(request: NextRequest) {
  try {
    const version = request.nextUrl.searchParams.get('version') || '';
    const chapter = request.nextUrl.searchParams.get('chapter') || '';
    if (!isBibleVersion(version) || !/^[A-Z0-9]+\.\d+$/.test(chapter)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    if (version === 'AVD') {
      const [bookId] = chapter.split('.');
      const data = avd.books.find(book => book.id === bookId)?.chapters.find(item => item.id === chapter);
      if (!data) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      return NextResponse.json({ data });
    }
    const query = '?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=true&fums-version=3';
    const result = await bibleApi(`/bibles/${BIBLE_VERSIONS[version].id}/chapters/${chapter}${query}`);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Bible service unavailable' }, { status: 503 });
  }
}
