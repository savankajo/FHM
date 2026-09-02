import Script from 'next/script';
import BibleReader from './reader';
import { getSession } from '@/lib/auth';
import { BIBLE_VERSIONS, BibleVersion } from '@/lib/bible-api';
import { normalizeVerseNumbers } from './verse-selection';

export const dynamic = 'force-dynamic';

export default async function BiblePage({ searchParams }: { searchParams: Promise<{ version?: string; chapter?: string; verses?: string; returnTo?: string }> }) {
  const [session, query] = await Promise.all([getSession(), searchParams]);
  const initialVersion = query.version && query.version in BIBLE_VERSIONS ? query.version as BibleVersion : 'AVD';
  const initialVerses = normalizeVerseNumbers((query.verses || '').split(',').map(Number));
  const returnTo = query.returnTo?.startsWith('/') && !query.returnTo.startsWith('//') ? query.returnTo : '/';
  return <><Script src="https://pkg.api.bible/fumsV3.min.js" strategy="afterInteractive" /><BibleReader signedIn={Boolean(session)} initialVersion={initialVersion} initialChapterId={query.chapter || ''} initialVerses={initialVerses} returnTo={returnTo} /></>;
}
