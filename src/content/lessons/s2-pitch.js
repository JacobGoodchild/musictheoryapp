// Section 2 lessons: Pitch.
import { parse, toString, name } from '../../theory/pitch.js';
import { toWritten, toConcert } from '../../theory/transpose.js';
import { scale, key } from '../../theory/keys.js';

const w = (keys, extra = {}) => ({ keys, dur: 'w', ...extra });
const lab = (k) => ({ keys: k, dur: 'w', label: name(parse(k)) });
const melody = (clef, fifths, list, durs) => ({ clef, key: fifths, time: '4/4', measures: [{ notes: list.slice(0, 4).map((p, i) => ({ keys: typeof p === 'string' ? p : toString(p), dur: durs[i] })) }, { notes: list.slice(4).map((p, i) => ({ keys: typeof p === 'string' ? p : toString(p), dur: durs[i + 4] })) }], scale: 1 });

// A short melody in F major at concert pitch, and its written parts (computed).
const CONCERT = ['F4', 'A4', 'C5', 'Bb4', 'A4', 'G4', 'F4'].map(parse);
const DURS = ['q', 'q', 'q', 'q', 'h', 'q', 'q'];
const inst = (i) => CONCERT.map((p) => toWritten(p, i));

export const PITCH_LESSONS = [
  {
    id: 'pitch-treble-bass', section: 2, refresh: true, glyph: '𝄞', title: 'Treble and bass clefs',
    summary: 'Reading notes on the lines, spaces and ledger lines.',
    blocks: [
      { type: 'intro', text: 'A clef fixes one note on the stave; every other note follows from it. The **treble clef** curls round **G** (2nd line). The **bass clef**\'s two dots sit either side of **F** (4th line).' },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', free: true, notes: ['E4', 'G4', 'B4', 'D5', 'F5'].map(lab) }, caption: 'Treble lines: E G B D F' },
        { music: { clef: 'treble', free: true, notes: ['F4', 'A4', 'C5', 'E5'].map(lab) }, caption: 'Treble spaces: F A C E' },
      ] },
      { type: 'musicRow', items: [
        { music: { clef: 'bass', free: true, notes: ['G2', 'B2', 'D3', 'F3', 'A3'].map(lab) }, caption: 'Bass lines: G B D F A' },
        { music: { clef: 'bass', free: true, notes: ['A2', 'C3', 'E3', 'G3'].map(lab) }, caption: 'Bass spaces: A C E G' },
      ] },
      { type: 'text', text: '**Ledger lines** extend the stave. **Middle C** is one ledger line **below** the treble stave and one ledger line **above** the bass stave: the same pitch.' },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', free: true, notes: [w('C4', { label: 'middle C' }), w('A3', { label: 'A' }), w('A5', { label: 'A' }), w('C6', { label: 'C' })] }, caption: 'Ledger lines in the treble clef' },
        { music: { clef: 'bass', free: true, notes: [w('C4', { label: 'middle C' }), w('E4', { label: 'E' }), w('E2', { label: 'E' }), w('C2', { label: 'C' })] }, caption: 'Ledger lines in the bass clef' },
      ] },
      { type: 'keypoints', items: ['Treble lines E G B D F, spaces F A C E.', 'Bass lines G B D F A, spaces A C E G.', 'Middle C: 1 ledger line below treble = 1 ledger line above bass.'] },
      { type: 'mistakes', items: ['Reading bass clef as if it were treble (every note comes out two letters too low: the bottom line G would be read as E).'] },
      { type: 'memorise', items: ['Treble lines: **E**very **G**ood **B**oy **D**eserves **F**ootball. Spaces spell FACE.', 'Bass lines: **G**ood **B**oys **D**eserve **F**un **A**lways. Spaces: **A**ll **C**ows **E**at **G**rass.'] },
    ],
    check: { topics: ['p-clefs'], count: 5, difficulty: 1 },
  },
  {
    id: 'pitch-alto', section: 2, refresh: true, glyph: '𝄡', title: 'The alto clef',
    summary: 'Middle C on the middle line: the viola\'s clef.',
    blocks: [
      { type: 'intro', text: 'The **alto clef** is a C clef: the point where its two curves meet marks **middle C**, on the **middle (3rd) line**. The viola reads it.' },
      { type: 'musicRow', items: [
        { music: { clef: 'alto', free: true, notes: ['F3', 'A3', 'C4', 'E4', 'G4'].map(lab) }, caption: 'Alto lines: F A C E G' },
        { music: { clef: 'alto', free: true, notes: ['G3', 'B3', 'D4', 'F4'].map(lab) }, caption: 'Alto spaces: G B D F' },
      ] },
      { type: 'worked', title: 'Name this alto-clef note', steps: [
        { text: 'Find middle C on the 3rd line.', music: { clef: 'alto', free: true, notes: [w('C4', { label: 'C' }), w('E4', { label: '?' })] } },
        { text: 'The note is on the next line up, two letters higher: C → D → **E**.' },
      ] },
      { type: 'keypoints', items: ['Alto clef: middle C on the 3rd line.', 'Lines F A C E G; spaces G B D F.'] },
      { type: 'mistakes', items: ['Confusing alto and tenor clefs: they look alike but sit on different lines.'] },
      { type: 'memorise', items: ['Alto: C in the **middle**.'] },
    ],
    check: { topics: ['p-clefs'], count: 5, difficulty: 2 },
  },
  {
    id: 'pitch-tenor', section: 2, isNew: true, glyph: '𝄡', title: 'The tenor clef',
    summary: 'Middle C on the 4th line: used by cello, bassoon and trombone for high notes.',
    blocks: [
      { type: 'intro', text: 'The **tenor clef** is the same C-clef sign as the alto, but placed so that **middle C is on the 4th line**. Cellos, bassoons and trombones use it for their higher notes.' },
      { type: 'musicRow', items: [
        { music: { clef: 'tenor', free: true, notes: ['D3', 'F3', 'A3', 'C4', 'E4'].map(lab) }, caption: 'Tenor lines: D F A C E' },
        { music: { clef: 'tenor', free: true, notes: ['E3', 'G3', 'B3', 'D4'].map(lab) }, caption: 'Tenor spaces: E G B D' },
      ] },
      { type: 'musicRow', items: [
        { music: { clef: 'alto', free: true, notes: [w('C4', { label: 'middle C' })] }, caption: 'Alto: C on the 3rd line' },
        { music: { clef: 'tenor', free: true, notes: [w('C4', { label: 'middle C' })] }, caption: 'Tenor: C on the 4th line' },
      ] },
      { type: 'worked', title: 'Name this tenor-clef note', steps: [
        { text: 'Look where the clef\'s curves meet: that line (the 4th) is middle C.', music: { clef: 'tenor', free: true, notes: [w('C4', { label: 'C' }), w('A3', { label: '?' })] } },
        { text: 'The note is on the line below (the 3rd line): two letters lower, C → B → **A**.' },
      ] },
      { type: 'worked', title: 'Same pitch, different clef', steps: [
        { text: 'Write G3 (the G below middle C) in the tenor clef.' },
        { text: 'Middle C is on the 4th line. G is four letters below C (C, B, A, G): 4th line → 3rd space → 3rd line → 2nd space.' },
        { text: 'So G3 sits in the **2nd space** of the tenor clef.', music: { clef: 'tenor', free: true, notes: [w('C4', { label: 'C' }), w('G3', { label: 'G' })] } },
      ] },
      { type: 'keypoints', items: ['Tenor clef: middle C on the 4th line.', 'Lines D F A C E; spaces E G B D.', 'A note on any line or space of the tenor clef is a 3rd lower than on the same line or space of the alto clef.'] },
      { type: 'mistakes', items: ['Reading tenor as alto (every note comes out a 3rd too high).', 'Forgetting to check which line the C clef is centred on.'] },
      { type: 'memorise', items: ['Tenor: C on line **4** ("tenor is taller").'] },
    ],
    check: { topics: ['p-clefs'], count: 6, difficulty: 3 },
  },
  {
    id: 'pitch-accidentals', section: 2, refresh: true, glyph: '♯', title: 'Accidentals and enharmonic equivalents',
    summary: 'Sharps, flats, naturals, double sharps and double flats.',
    blocks: [
      { type: 'intro', text: 'Accidentals raise or lower a note. They last until the end of the bar (for notes on the same line or space).' },
      { type: 'music', music: { clef: 'treble', free: true, scale: 1.15, notes: [w('F#4', { label: 'sharp' }), w('Bb4', { label: 'flat' }), w('B4', { label: 'natural', showAcc: [true] }), w('Fx4', { label: 'double sharp' }), w('Bbb4', { label: 'double flat' })] }, caption: 'Sharp ↑ semitone · flat ↓ semitone · natural cancels · double sharp ↑ two semitones · double flat ↓ two' },
      { type: 'text', text: '**Enharmonic equivalents** are the same pitch with different names, like F♯ and G♭, or F𝄪 and G.' },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', free: true, notes: [w('F#4', { label: 'F♯' }), w('Gb4', { label: 'G♭' })] }, caption: 'Same key on the piano', audio: { kind: 'melody', notes: ['F#4', 'Gb4'] } },
        { music: { clef: 'treble', free: true, notes: [w('Fx4', { label: 'F𝄪' }), w('G4', { label: 'G' })] }, caption: 'F double sharp = G' },
        { music: { clef: 'treble', free: true, notes: [w('B#3', { label: 'B♯' }), w('C4', { label: 'C' })] }, caption: 'B sharp = C' },
      ] },
      { type: 'keypoints', items: ['An accidental lasts for the rest of the bar, on that line or space.', 'Double sharp 𝄪 raises by a tone; double flat 𝄫 lowers by a tone.', 'E♯ = F, B♯ = C, F♭ = E, C♭ = B.'] },
      { type: 'mistakes', items: ['Forgetting that E–F and B–C are only a semitone apart, so E♯ is F, not F♯.'] },
      { type: 'memorise', items: ['Every note has up to three names, e.g. C = B♯ = D𝄫.'] },
    ],
    check: { topics: ['p-enharmonic'], count: 5 },
  },
  {
    id: 'pitch-octave-transpose', section: 2, glyph: '⇅', title: 'Transposing at the octave between clefs',
    summary: 'Rewrite a melody in another clef, at the same pitch or an octave apart.',
    blocks: [
      { type: 'intro', text: 'You may be asked to rewrite a melody in a **different clef**, either at the **same pitch** or **an octave higher or lower**. The note names stay the same; only their position on the stave changes.' },
      { type: 'worked', title: 'Treble clef → bass clef, an octave lower', steps: [
        { text: 'Here is a melody in the treble clef.', music: melody('treble', null, ['C5', 'D5', 'E5', 'G5', 'F5', 'E5', 'C5'].map(parse), DURS) },
        { text: 'An octave lower, the first note C5 becomes C4 (middle C), which is one ledger line **above** the bass stave.' },
        { text: 'Write every note an octave lower in the bass clef, keeping the rhythm and any accidentals.', music: melody('bass', null, ['C4', 'D4', 'E4', 'G4', 'F4', 'E4', 'C4'].map(parse), DURS) },
      ] },
      { type: 'worked', title: 'Bass clef → alto clef, at the same pitch', steps: [
        { text: 'A bass-clef melody:', music: melody('bass', -1, ['F3', 'A3', 'G3', 'Bb3', 'A3', 'G3', 'F3'].map(parse), DURS) },
        { text: 'The same pitches in the alto clef. Keep the key signature (now drawn for the alto clef). F3 is the bottom line of the alto stave.', music: melody('alto', -1, ['F3', 'A3', 'G3', 'Bb3', 'A3', 'G3', 'F3'].map(parse), DURS) },
      ] },
      { type: 'tip', text: 'Use middle C as your landmark: below treble, above bass, middle line of alto, 4th line of tenor.' },
      { type: 'keypoints', items: ['Same note names, new positions.', 'Copy the key signature and every accidental.', 'An octave = 8 notes (7 steps) up or down.'] },
      { type: 'mistakes', items: ['Copying the shapes (same lines and spaces) instead of the pitches.', 'Moving by the wrong number of octaves.'] },
      { type: 'memorise', items: ['Middle C: treble ledger below · bass ledger above · alto line 3 · tenor line 4.'] },
    ],
    check: { topics: ['p-transpose-clef', 'p-clefs'], count: 6 },
  },
  {
    id: 'pitch-instruments', section: 2, isNew: true, glyph: '🎺', title: 'Transposing instruments: B♭, A and F',
    summary: 'Concert pitch and written pitch for clarinet, trumpet, horn and cor anglais.',
    blocks: [
      { type: 'intro', text: 'Some instruments read notes that **sound lower** than written. To play together, their parts are written higher than concert pitch (the real sounding pitch).' },
      { type: 'table', head: ['Instrument', 'Sounds', 'Written part is'], rows: [['in B♭ (clarinet, trumpet)', 'a major 2nd lower', 'a major 2nd higher'], ['in A (clarinet)', 'a minor 3rd lower', 'a minor 3rd higher'], ['in F (horn, cor anglais)', 'a perfect 5th lower', 'a perfect 5th higher']] },
      { type: 'text', text: 'The exam always tells you the interval. Just decide which **direction** to go: **written → concert = down**; **concert → written = up**.' },
      { type: 'worked', title: 'Writing a melody for clarinet in B♭', steps: [
        { text: 'Concert pitch, in F major:', music: melody('treble', -1, CONCERT, DURS), audio: { kind: 'melody', notes: CONCERT.map((p) => toString(p)), beats: 1 } },
        { text: 'The clarinet sounds a major 2nd lower, so its part goes **up a major 2nd**. F major becomes **G major** (key signature moves too).' },
        { text: 'Every note up a major 2nd: F → G, A → B, C → D, B♭ → C …', music: melody('treble', 1, inst('Bb'), DURS) },
      ] },
      { type: 'worked', title: 'Horn in F to concert pitch', steps: [
        { text: 'This is a horn part (written):', music: melody('treble', 0, inst('F'), DURS) },
        { text: 'The horn sounds a perfect 5th lower, so go **down a perfect 5th**. C major becomes **F major**.' },
        { text: `Concert pitch: ${inst('F').map((p) => name(toConcert(p, 'F'))).join(' ')} — the original melody.`, music: melody('treble', -1, inst('F').map((p) => toConcert(p, 'F')), DURS) },
      ] },
      { type: 'worked', title: 'Clarinet in A', steps: [
        { text: 'Concert F major written for clarinet in A goes **up a minor 3rd**: F major → **A♭ major** (4 flats).', music: melody('treble', -4, inst('A'), DURS) },
      ] },
      { type: 'keypoints', items: ['B♭: M2. A: m3. F: P5.', 'Written → concert: down. Concert → written: up.', 'Transpose the key signature too (or add accidentals if there is none).'] },
      { type: 'mistakes', items: ['Going the wrong way (up instead of down).', 'Using a major 3rd for clarinet in A (it is a **minor** 3rd).', 'Forgetting to change the key signature.'] },
      { type: 'memorise', items: ['Instrument in X: when it plays a written C, you hear X.', 'B♭ = M2, A = m3, F = P5.'] },
    ],
    check: { topics: ['p-instruments'], count: 6 },
  },
];

void scale; void key;
