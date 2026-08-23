export const BIBLE_VERSIONS = {
  NIV: { id: '78a9f6124f344018-01', name: 'New International Version' },
  AMP: { id: 'a81b73293d3080c9-01', name: 'Amplified Bible' },
  MSG: { id: '6f11a7de016f942e-01', name: 'The Message' },
  AVD: { id: 'AVD', name: 'Arabic Van Dyck' },
} as const;

export type BibleVersion = keyof typeof BIBLE_VERSIONS;

export function isBibleVersion(value: string): value is BibleVersion {
  return value in BIBLE_VERSIONS;
}

export async function bibleApi(path: string) {
  const key = process.env.API_BIBLE_KEY;
  if (!key) throw new Error('API_BIBLE_KEY is not configured');
  const response = await fetch(`https://rest.api.bible/v1${path}`, {
    headers: { 'api-key': key }, cache: 'no-store',
  });
  if (!response.ok) throw new Error(`API.Bible returned ${response.status}`);
  return response.json();
}
