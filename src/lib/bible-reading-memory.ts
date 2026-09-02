import { isBibleVersion } from './bible-api.ts';
import type { BibleVersion } from './bible-api.ts';

export const BIBLE_READING_MEMORY_KEY = 'fhm-bible-last-reading-v1';

export type BibleReadingMemory = {
  version: BibleVersion;
  bookId: string;
  chapterId: string;
  verse: number;
};

export function parseBibleReadingMemory(value: string | null): BibleReadingMemory | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<BibleReadingMemory>;
    if (
      typeof parsed.version !== 'string' ||
      !isBibleVersion(parsed.version) ||
      typeof parsed.bookId !== 'string' ||
      !parsed.bookId.trim() ||
      typeof parsed.chapterId !== 'string' ||
      !parsed.chapterId.trim() ||
      !Number.isInteger(parsed.verse) ||
      Number(parsed.verse) < 1
    ) return null;

    return {
      version: parsed.version,
      bookId: parsed.bookId,
      chapterId: parsed.chapterId,
      verse: Number(parsed.verse),
    };
  } catch {
    return null;
  }
}

export function serializeBibleReadingMemory(memory: BibleReadingMemory) {
  return JSON.stringify(memory);
}
