import { NextRequest, NextResponse } from 'next/server';
import { bibleApi, BIBLE_VERSIONS, isBibleVersion } from '@/lib/bible-api';

export async function GET(request: NextRequest) {
  try {
    const version = request.nextUrl.searchParams.get('version') || '';
    if (!isBibleVersion(version)) return NextResponse.json({ error: 'Invalid Bible version' }, { status: 400 });
    const bibleId = BIBLE_VERSIONS[version].id;
    const result = await bibleApi(`/bibles/${bibleId}/books?include-chapters=true`);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Bible service unavailable' }, { status: 503 });
  }
}
