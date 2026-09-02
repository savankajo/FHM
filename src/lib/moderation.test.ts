import test from 'node:test';
import assert from 'node:assert/strict';
import { moderateText, validateVoiceDataUrl } from './moderation.ts';
import { CURRENT_TERMS_VERSION, hasAcceptedCurrentTerms } from './terms.ts';

test('allows ordinary church-team conversation', () => {
  assert.equal(moderateText('Can you arrive at 6:30 to help with setup?').allowed, true);
  assert.equal(moderateText('شكراً لخدمتكم اليوم').allowed, true);
});

test('rejects threats before publication', () => {
  const result = moderateText('I will k.i.l.l you');
  assert.equal(result.allowed, false);
  assert.ok(result.categories.includes('threats'));
});

test('normalizes common punctuation, spacing, repetition, and leetspeak evasions', () => {
  assert.equal(moderateText('k i l l   y o u').allowed, false);
  assert.equal(moderateText('p0rn').allowed, false);
  assert.equal(moderateText('you should diiiie').allowed, false);
  assert.equal(moderateText('f.u.c.k you').allowed, false);
});

test('rejects common abusive English and Arabic phrases', () => {
  for (const text of ['fuck you', 'go fuck yourself', 'you are an idiot', 'يا غبي']) {
    const result = moderateText(text);
    assert.equal(result.allowed, false, `expected rejection for ${text}`);
    assert.ok(result.categories.includes('abuse'));
  }
});

test('does not return private content in moderation result', () => {
  const input = 'Can you pray for me?';
  const result = moderateText(input);
  assert.equal('text' in result, false);
  assert.equal(result.contentHash.length, 64);
  assert.notEqual(result.contentHash, input);
});

test('validates declared audio type against file signature and size', () => {
  const mp4 = Buffer.alloc(32);
  mp4.write('ftyp', 4, 'ascii');
  assert.equal(validateVoiceDataUrl(`data:audio/mp4;base64,${mp4.toString('base64')}`).valid, true);
  assert.equal(validateVoiceDataUrl(`data:audio/mp4;codecs=mp4a.40.2;base64,${mp4.toString('base64')}`).valid, true);
  assert.equal(validateVoiceDataUrl(`data:audio/x-m4a;codecs="mp4a.40.2";base64,${mp4.toString('base64')}`).valid, true);
  assert.equal(validateVoiceDataUrl(`data:audio/mp4; codecs = "mp4a.40.2"; base64,${mp4.toString('base64')}`).valid, true);
  const webm = Buffer.alloc(32);
  webm[0] = 0x1a; webm[1] = 0x45; webm[2] = 0xdf; webm[3] = 0xa3;
  assert.equal(validateVoiceDataUrl(`data:audio/webm;codecs=opus;base64,${webm.toString('base64')}`).valid, true);
  const disguised = Buffer.from('not an audio file but long enough');
  assert.equal(validateVoiceDataUrl(`data:audio/mp4;base64,${disguised.toString('base64')}`).valid, false);
  assert.equal(validateVoiceDataUrl('data:application/javascript;base64,YWxlcnQoMSk=').valid, false);
  assert.equal(validateVoiceDataUrl(`data:audio/webm;charset=utf-8;base64,${webm.toString('base64')}`).valid, false);
  assert.equal(validateVoiceDataUrl('data:audio/webm;codecs=opus;base64,%%%').valid, false);
});

test('requires the exact current terms version', () => {
  assert.equal(hasAcceptedCurrentTerms(CURRENT_TERMS_VERSION), true);
  assert.equal(hasAcceptedCurrentTerms('2026-01-01'), false);
  assert.equal(hasAcceptedCurrentTerms(null), false);
});
