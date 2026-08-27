export type SelectedVerse = { number: number; text: string };

export function normalizeVerseNumbers(values: number[]): number[] {
    return Array.from(new Set(values.filter(value => Number.isInteger(value) && value > 0))).sort((a, b) => a - b);
}

export function toggleVerseNumber(values: number[], verse: number): number[] {
    const normalized = normalizeVerseNumbers(values);
    return normalized.includes(verse)
        ? normalized.filter(value => value !== verse)
        : normalizeVerseNumbers([...normalized, verse]);
}

export function formatVerseRanges(values: number[]): string {
    const verses = normalizeVerseNumbers(values);
    if (verses.length === 0) return '';

    const ranges: string[] = [];
    let start = verses[0];
    let end = verses[0];

    for (const verse of verses.slice(1)) {
        if (verse === end + 1) {
            end = verse;
            continue;
        }
        ranges.push(start === end ? String(start) : `${start}–${end}`);
        start = verse;
        end = verse;
    }

    ranges.push(start === end ? String(start) : `${start}–${end}`);
    return ranges.join(', ');
}

export function buildVerseSelectionText(reference: string, version: string, selected: SelectedVerse[]): string {
    const ordered = [...selected]
        .filter(item => Number.isInteger(item.number) && item.number > 0)
        .sort((a, b) => a.number - b.number);
    const range = formatVerseRanges(ordered.map(item => item.number));
    const heading = `${reference}:${range} (${version})`;
    return [heading, '', ...ordered.map(item => `${item.number} ${item.text.trim()}`)].join('\n').trim();
}
