export type BibleStage = 'bible' | 'book' | 'chapter' | 'verse';

const PREVIOUS_BIBLE_STAGE: Record<Exclude<BibleStage, 'bible'>, BibleStage> = {
    book: 'bible',
    chapter: 'book',
    verse: 'chapter',
};

export function previousBibleStage(stage: BibleStage): BibleStage | null {
    return stage === 'bible' ? null : PREVIOUS_BIBLE_STAGE[stage];
}

export function bibleAnnotationOwner(userId: string): { userId: string } {
    const cleanUserId = userId.trim();
    if (!cleanUserId) throw new Error('A signed-in annotation owner is required.');
    return { userId: cleanUserId };
}

export function buildBiblePassageHref(input: { version: string; chapterId: string; verses: number[]; returnTo?: string }): string {
    const query = new URLSearchParams({
        version: input.version,
        chapter: input.chapterId,
        verses: input.verses.join(','),
    });
    if (input.returnTo) query.set('returnTo', input.returnTo);
    return `/bible?${query.toString()}`;
}
