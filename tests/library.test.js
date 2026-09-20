import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fmtTime, scanLibrary } from '../src/library.js';

test('fmtTime formats durations correctly', () => {
  assert.equal(fmtTime(0), '0:00');
  assert.equal(fmtTime(5), '0:05');
  assert.equal(fmtTime(59), '0:59');
  assert.equal(fmtTime(60), '1:00');
  assert.equal(fmtTime(75), '1:15');
  assert.equal(fmtTime(3605), '60:05');
  assert.equal(fmtTime(null), '0:00');
  assert.equal(fmtTime(-10), '0:00');
});

test('scanLibrary detects sample tracks in ./music directory', () => {
  const tracks = scanLibrary('./music');
  assert.ok(tracks.length >= 2, 'Should find at least 2 sample audio files');
  const titles = tracks.map((t) => t.title);
  assert.ok(titles.includes('sample-one'));
  assert.ok(titles.includes('sample-two'));
  for (const track of tracks) {
    assert.ok(track.path);
    assert.ok(track.title);
  }
});

test('scanLibrary returns empty array for non-existent directory', () => {
  const tracks = scanLibrary('./non_existent_directory_xyz');
  assert.deepEqual(tracks, []);
});

test('scanLibrary scans recursively and ignores hidden and non-audio files', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'music-scan-test-'));
  try {
    const subDir = join(tempDir, 'subfolder');
    mkdirSync(subDir);

    // Audio files
    writeFileSync(join(tempDir, 'song-b.mp3'), 'audio-data');
    writeFileSync(join(subDir, 'song-a.wav'), 'audio-data');
    writeFileSync(join(tempDir, 'song-c.flac'), 'audio-data');

    // Non-audio and hidden files
    writeFileSync(join(tempDir, 'notes.txt'), 'text');
    writeFileSync(join(tempDir, '.hidden.mp3'), 'hidden');
    writeFileSync(join(subDir, 'cover.jpg'), 'image');

    const result = scanLibrary(tempDir);
    assert.equal(result.length, 3);
    // Should be sorted alphabetically by title: song-a, song-b, song-c
    assert.equal(result[0].title, 'song-a');
    assert.equal(result[1].title, 'song-b');
    assert.equal(result[2].title, 'song-c');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
