import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVerseSelectionText, formatVerseRanges, normalizeVerseNumbers, toggleVerseNumber } from './verse-selection.ts';

test('normalizes consecutive and non-consecutive verses in biblical order', () => {
    assert.deepEqual(normalizeVerseNumbers([8, 2, 3, 2, 7, -1]), [2, 3, 7, 8]);
    assert.equal(formatVerseRanges([8, 2, 3, 7]), '2–3, 7–8');
});

test('toggles individual verses without disturbing the other selections', () => {
    assert.deepEqual(toggleVerseNumber([2, 4], 3), [2, 3, 4]);
    assert.deepEqual(toggleVerseNumber([2, 3, 4], 3), [2, 4]);
});

test('builds ordered copy and share text with a compact reference', () => {
    assert.equal(
        buildVerseSelectionText('John 3', 'NIV', [
            { number: 18, text: 'Verse eighteen.' },
            { number: 16, text: 'Verse sixteen.' },
            { number: 17, text: 'Verse seventeen.' },
            { number: 21, text: 'Verse twenty-one.' },
        ]),
        'John 3:16–18, 21 (NIV)\n\n16 Verse sixteen.\n17 Verse seventeen.\n18 Verse eighteen.\n21 Verse twenty-one.'
    );
});
