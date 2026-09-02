import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeChatMessages, parseChatPayload, resolveChatInput, serializeChatPayload } from './chat-message.ts';

test('accepts non-empty text and recognizes legacy voice payloads for preserved evidence', () => {
    assert.deepEqual(resolveChatInput({ text: '  Hello team  ' }), { kind: 'text', text: 'Hello team' });
    assert.equal(resolveChatInput({ text: '   ' }).kind, 'empty');

    const voice = { kind: 'voice' as const, audio: 'data:audio/mp4;base64,AAAA', duration: 4 };
    const resolved = resolveChatInput({ text: '', payload: voice });
    assert.equal(resolved.kind, 'payload');
    if (resolved.kind === 'payload') assert.deepEqual(resolved.payload, voice);
});

test('preserves compatibility with serialized rich messages', () => {
    const poll = { kind: 'poll' as const, question: 'When?', options: [{ id: '1', label: 'Today', voterIds: [] }] };
    const serialized = serializeChatPayload(poll);
    assert.deepEqual(parseChatPayload(serialized), poll);
    assert.equal(resolveChatInput({ text: serialized }).kind, 'payload');
});

test('merges optimistic and refreshed messages without duplicate ids', () => {
    const first = { id: '1', createdAt: '2026-09-02T01:00:00.000Z', text: 'first' };
    const second = { id: '2', createdAt: '2026-09-02T01:01:00.000Z', text: 'second' };
    const refreshed = { ...first, text: 'published' };
    assert.deepEqual(mergeChatMessages([first], [second, refreshed]), [refreshed, second]);
});
