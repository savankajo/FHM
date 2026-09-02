import test from 'node:test';
import assert from 'node:assert/strict';
import { bibleAnnotationOwner, buildBiblePassageHref, previousBibleStage } from './bible-annotations.ts';

test('reverses Bible navigation exactly one stage at a time', () => {
    assert.equal(previousBibleStage('verse'), 'chapter');
    assert.equal(previousBibleStage('chapter'), 'book');
    assert.equal(previousBibleStage('book'), 'bible');
    assert.equal(previousBibleStage('bible'), null);
});

test('builds a deep link to the exact ordered verse selection', () => {
    assert.equal(
        buildBiblePassageHref({ version: 'NIV', chapterId: 'JHN.3', verses: [16, 18, 21], returnTo: '/profile/bible-notes' }),
        '/bible?version=NIV&chapter=JHN.3&verses=16%2C18%2C21&returnTo=%2Fprofile%2Fbible-notes',
    );
});

test('requires and preserves an explicit signed-in owner scope', () => {
    assert.deepEqual(bibleAnnotationOwner(' user-a '), { userId: 'user-a' });
    assert.notDeepEqual(bibleAnnotationOwner('user-a'), bibleAnnotationOwner('user-b'));
    assert.throws(() => bibleAnnotationOwner('  '), /owner is required/);
});
