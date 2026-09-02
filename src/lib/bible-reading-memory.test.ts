import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBibleReadingMemory, serializeBibleReadingMemory } from './bible-reading-memory.ts';

test('round-trips the last Bible reading position', () => {
  const reading = { version: 'AVD' as const, bookId: 'GEN', chapterId: 'GEN.12', verse: 7 };
  assert.deepEqual(parseBibleReadingMemory(serializeBibleReadingMemory(reading)), reading);
});

test('ignores incomplete or invalid saved Bible positions', () => {
  assert.equal(parseBibleReadingMemory(null), null);
  assert.equal(parseBibleReadingMemory('{not-json'), null);
  assert.equal(parseBibleReadingMemory(JSON.stringify({ version: 'UNKNOWN', bookId: 'GEN', chapterId: 'GEN.1', verse: 1 })), null);
  assert.equal(parseBibleReadingMemory(JSON.stringify({ version: 'AVD', bookId: 'GEN', chapterId: 'GEN.1', verse: 0 })), null);
});
