import test from 'node:test';
import assert from 'node:assert/strict';
import { Vlc, findVlc } from '../src/vlc.js';

test('findVlc returns a detected path or fallback binary name', () => {
  const bin = findVlc();
  assert.equal(typeof bin, 'string');
  assert.ok(bin.length > 0);
});

test('Vlc instance initializes with default properties', () => {
  const vlc = new Vlc();
  assert.ok(vlc.bin);
  assert.equal(vlc.proc, null);
  assert.equal(vlc.buffer, '');
  assert.deepEqual(vlc.pending, []);
  assert.equal(typeof vlc.start, 'function');
  assert.equal(typeof vlc.send, 'function');
  assert.equal(typeof vlc.play, 'function');
  assert.equal(typeof vlc.pause, 'function');
  assert.equal(typeof vlc.quit, 'function');
});
