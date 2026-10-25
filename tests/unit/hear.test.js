// Every practice question with music can be heard: the audio built from the
// stave has sensible notes and timings (no NaN, nothing negative).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { musicToAudio } from '../../src/audio/from-music.js';

const bank = [1, 2, 3, 4, 5, 6, 7].flatMap((s) => JSON.parse(fs.readFileSync(new URL(`../../data/questions/section-${s}.json`, import.meta.url))));

test('music in every bank question turns into playable audio', () => {
  let withMusic = 0, playable = 0;
  for (const q of bank) {
    for (const spec of [q.music, ...(q.options || []).map((o) => o.music)].filter(Boolean)) {
      withMusic++;
      const a = musicToAudio(spec);
      const hasNotes = JSON.stringify(spec).includes('"keys"');
      if (!hasNotes) continue; // e.g. a key signature on its own
      assert.ok(a, `${q.id}: music with notes gave no audio`);
      playable++;
      for (const it of a.items) {
        assert.ok(Number.isFinite(it.at) && it.at >= 0 && Number.isFinite(it.dur) && it.dur > 0, `${q.id}: bad timing`);
        assert.ok(it.notes.length > 0);
      }
    }
  }
  assert.ok(playable > 1500, `only ${playable} of ${withMusic} staves playable`);
});

test('a grand stave plays both hands together', () => {
  const a = musicToAudio({ grand: true, upper: [{ notes: [{ keys: ['E4', 'G4', 'C5'], dur: 'w' }] }], lower: [{ notes: [{ keys: ['C3'], dur: 'w' }] }], free: true });
  assert.equal(a.items.length, 2);
  assert.equal(a.items[0].at, a.items[1].at);
});
