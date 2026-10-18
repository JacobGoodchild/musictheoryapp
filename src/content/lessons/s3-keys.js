// Section 3 lessons: Keys and scales.
import { scaleMusic, keySigMusic } from './helpers.js';
import { parse, toString, name } from '../../theory/pitch.js';
import { GRADE5_MAJOR, GRADE5_MINOR, signature, scale, key, keyName, relative, DEGREE_NAMES, chromaticScale } from '../../theory/keys.js';

const sigList = (k) => signature(k).map((s) => name({ letter: s.letter, acc: s.acc, octave: 4 })).join(' ') || '—';
const majorRows = GRADE5_MAJOR.slice().sort((a, b) => Math.abs(a.fifths) - Math.abs(b.fifths) || a.fifths - b.fifths).map((k) => [keyName(k), `${Math.abs(k.fifths)} ${k.fifths >= 0 ? '♯' : '♭'}`, sigList(k), keyName(relative(k))]);
const scaleAudio = (tonic, type) => {
  const t = parse(tonic);
  const up = scale(t, type);
  const down = type === 'melodic-up' ? scale(t, 'melodic-down') : up.slice().reverse();
  return { kind: 'melody', notes: [...up, ...down.slice(1)].map((p) => toString(p)), beats: 0.5, tempo: 96 };
};

export const KEYS_LESSONS = [
  {
    id: 'keys-major', section: 3, refresh: true, glyph: '♯', title: 'Major keys and key signatures',
    summary: 'All 13 major keys up to six sharps and six flats, and the circle of fifths.',
    blocks: [
      { type: 'intro', text: 'A **key signature** lists the sharps or flats used in a key, so you don\'t need to write them every time. At Grade 5 you need every major and minor key with up to **six sharps or six flats**.' },
      { type: 'text', text: ['Sharps are always added in the order **F C G D A E B**. Flats are the same backwards: **B E A D G C F**.', 'Each new sharp key is a **perfect 5th higher** (G, D, A, E, B, F♯). Each new flat key is a **perfect 5th lower** (F, B♭, E♭, A♭, D♭, G♭). This is the **circle of fifths**.'] },
      { type: 'musicRow', items: [
        { music: keySigMusic('F#', 'major'), caption: 'F♯ major: 6 sharps' },
        { music: keySigMusic('Gb', 'major'), caption: 'G♭ major: 6 flats' },
      ] },
      { type: 'table', head: ['Major key', 'Signature', 'Accidentals', 'Relative minor'], rows: majorRows },
      { type: 'tip', text: 'Sharp keys: the **last sharp is the leading note**, so the key is a semitone above it (last sharp C♯ → D major). Flat keys: the **second-to-last flat** is the key (B♭ E♭ A♭ → E♭ major).' },
      { type: 'keypoints', items: ['Order of sharps: F C G D A E B. Order of flats: B E A D G C F.', 'F♯ major (6♯) and G♭ major (6♭) are enharmonic: they sound the same.'] },
      { type: 'mistakes', items: ['Writing the sharps or flats in the wrong order.', 'Forgetting F major has one flat (B♭).'] },
      { type: 'memorise', items: ['Sharps: **F**ather **C**harles **G**oes **D**own **A**nd **E**nds **B**attle.', 'Flats: **B**attle **E**nds **A**nd **D**own **G**oes **C**harles\' **F**ather.'] },
    ],
    check: { topics: ['k-signatures'], count: 6, difficulty: 1 },
  },
  {
    id: 'keys-minor', section: 3, refresh: true, glyph: '♭', title: 'Minor keys and relative keys',
    summary: 'Every major key has a relative minor sharing its key signature.',
    blocks: [
      { type: 'intro', text: 'Each major key has a **relative minor** with the **same key signature**. The relative minor starts on the **6th note** of the major scale (or **three semitones below** the major tonic).' },
      { type: 'musicRow', items: [
        { music: scaleMusic('C4', 'major', 'treble', { labels: true }), caption: 'C major: the 6th note is A…' },
        { music: scaleMusic('A3', 'natural', 'treble', { labels: true }), caption: '…so A minor is the relative minor (same notes, no sharps or flats in the key signature).' },
      ] },
      { type: 'table', head: ['Minor key', 'Signature', 'Relative major'], rows: GRADE5_MINOR.slice().sort((a, b) => Math.abs(a.fifths) - Math.abs(b.fifths) || a.fifths - b.fifths).map((k) => [keyName(k), `${Math.abs(k.fifths)} ${k.fifths >= 0 ? '♯' : '♭'} (${sigList(k)})`, keyName(relative(k))]) },
      { type: 'keypoints', items: ['Relative keys share a key signature.', 'Relative minor = down 3 semitones (a minor 3rd) from the major tonic.', 'Relative major = up 3 semitones from the minor tonic.'] },
      { type: 'mistakes', items: ['Confusing **relative** minor (same key signature) with **tonic** minor (same starting note): C major → A minor is relative; C major → C minor is not.'] },
      { type: 'memorise', items: ['The new Grade 5 minor keys: **D♯ minor** (6♯) and **E♭ minor** (6♭).'] },
    ],
    check: { topics: ['k-relative'], count: 5 },
  },
  {
    id: 'keys-clefs', section: 3, isNew: true, glyph: '𝄡', title: 'Key signatures in all four clefs',
    summary: 'Where each sharp and flat goes in treble, bass, alto and tenor clefs.',
    blocks: [
      { type: 'intro', text: 'The **order** of sharps and flats never changes, but their **positions** depend on the clef. The pattern is the same shape in treble, bass and alto clefs; the **tenor clef sharps** are the odd ones out.' },
      { type: 'musicRow', items: [
        { music: keySigMusic('C#', 'minor', 'treble'), caption: 'Treble' },
        { music: keySigMusic('C#', 'minor', 'bass'), caption: 'Bass' },
        { music: keySigMusic('C#', 'minor', 'alto'), caption: 'Alto' },
        { music: keySigMusic('C#', 'minor', 'tenor'), caption: 'Tenor: the sharps start low' },
      ] },
      { type: 'text', text: 'Above: **C♯ minor** (4 sharps: F♯ C♯ G♯ D♯) in each clef. In the tenor clef the first sharp (F♯) goes on the **2nd line**, not at the top, so the pattern does not poke above the stave.' },
      { type: 'musicRow', items: [
        { music: keySigMusic('Eb', 'minor', 'treble'), caption: 'Treble' },
        { music: keySigMusic('Eb', 'minor', 'bass'), caption: 'Bass' },
        { music: keySigMusic('Eb', 'minor', 'alto'), caption: 'Alto' },
        { music: keySigMusic('Eb', 'minor', 'tenor'), caption: 'Tenor' },
      ] },
      { type: 'text', text: '**E♭ minor** (6 flats: B♭ E♭ A♭ D♭ G♭ C♭). Flats keep the same zig-zag in every clef.' },
      { type: 'worked', title: 'Checking a tenor-clef key signature', steps: [
        { text: 'Key: B major, 5 sharps (F♯ C♯ G♯ D♯ A♯).' },
        { text: 'In the tenor clef: F♯ on the 2nd line, C♯ on the 4th line, G♯ in the 2nd space, D♯ in the 4th space, A♯ on the middle line.', music: keySigMusic('B', 'major', 'tenor') },
        { text: 'Check each one by naming the line or space: tenor lines are D F A C E, spaces E G B D.' },
      ] },
      { type: 'keypoints', items: ['Same order in every clef; only the positions move.', 'Tenor clef sharps begin on the 2nd line (F♯) and zig-zag up a 4th, down a 5th.', 'Each sharp or flat must sit exactly on its own line or space.'] },
      { type: 'mistakes', items: ['Using the alto-clef sharp pattern in the tenor clef.', 'Putting a sharp in the right letter but the wrong octave.'] },
      { type: 'memorise', items: ['Tenor sharps: F (line 2), C (line 4), G (space 2), D (space 4), A (line 3), E (line 5).'] },
    ],
    check: { topics: ['k-signatures'], count: 6, difficulty: 3 },
  },
  {
    id: 'keys-major-scales', section: 3, refresh: true, glyph: '🎼', title: 'Major scales and degree names',
    summary: 'Tone–tone–semitone, and the technical names tonic to leading note.',
    blocks: [
      { type: 'intro', text: 'Every major scale has the same pattern: **tone, tone, semitone, tone, tone, tone, semitone**. The semitones fall between degrees **3–4** and **7–8**.' },
      { type: 'music', music: scaleMusic('D4', 'major', 'treble', { labels: DEGREE_NAMES.concat('tonic') }), caption: 'D major with the technical names of each degree', audio: scaleAudio('D4', 'major') },
      { type: 'table', head: ['Degree', 'Name'], rows: DEGREE_NAMES.map((d, i) => [String(i + 1), d]) },
      { type: 'musicRow', items: [
        { music: scaleMusic('E3', 'major', 'bass', { withKey: true }), caption: 'E major, bass clef, with key signature' },
        { music: scaleMusic('Ab3', 'major', 'alto'), caption: 'A♭ major, alto clef, with accidentals' },
      ] },
      { type: 'keypoints', items: ['T T S T T T S.', 'Technical names: tonic, supertonic, mediant, subdominant, dominant, submediant, leading note.', 'You can write a scale with a key signature or with accidentals: check which the question wants.'] },
      { type: 'mistakes', items: ['Using two letters the same (e.g. F and F♯) in one major scale: each letter appears once.'] },
      { type: 'memorise', items: ['Dominant = 5th, subdominant = 4th, submediant = 6th, leading note = 7th.'] },
    ],
    check: { topics: ['k-degrees', 'k-scales'], count: 6 },
  },
  {
    id: 'keys-minor-scales', section: 3, refresh: true, glyph: '🎶', title: 'Harmonic and melodic minor scales',
    summary: 'Raised 7th (harmonic) and raised 6th + 7th going up (melodic).',
    blocks: [
      { type: 'intro', text: 'Minor scales use the notes of the key signature, with changes near the top. The **harmonic minor** raises the **7th** going up and down. The **melodic minor** raises the **6th and 7th going up**, then uses the key signature (natural minor) coming down.' },
      { type: 'music', music: scaleMusic('A3', 'harmonic', 'treble', { labels: true }), caption: 'A harmonic minor: G♯ is the raised 7th (leading note). Note the wide step F–G♯ (an augmented 2nd).', audio: scaleAudio('A3', 'harmonic') },
      { type: 'music', music: scaleMusic('A3', 'melodic', 'treble', { dur: 'q' }), caption: 'A melodic minor: F♯ and G♯ going up; G and F natural coming down.', audio: { kind: 'melody', notes: scaleMusic('A3', 'melodic').notes.map((x) => x.keys), beats: 0.5, tempo: 96 } },
      { type: 'worked', title: 'F♯ harmonic minor', steps: [
        { text: 'Key signature: 3 sharps (F♯ C♯ G♯), shared with A major.' },
        { text: 'Raise the 7th (E) by a semitone: E becomes **E♯** (not F!), because each letter appears once.' },
        { text: `Result: ${scale(parse('F#4'), 'harmonic').map((p) => name(p)).join(' ')}`, music: scaleMusic('F#4', 'harmonic', 'treble', { withKey: true }) },
      ] },
      { type: 'worked', title: 'D♯ melodic minor (new at Grade 5)', steps: [
        { text: 'Key signature: 6 sharps (F♯ C♯ G♯ D♯ A♯ E♯).' },
        { text: 'Going up, raise the 6th (B → B♯) and 7th (C♯ → C𝄪). Coming down, return to B and C♯.', music: scaleMusic('D#4', 'melodic', 'treble', { dur: 'q' }) },
      ] },
      { type: 'keypoints', items: ['Harmonic minor: raise the 7th (both directions).', 'Melodic minor: raise the 6th and 7th going up only.', 'Raising a sharp note needs a double sharp (e.g. C♯ → C𝄪).'] },
      { type: 'mistakes', items: ['Raising the 7th by changing the letter (writing F instead of E♯).', 'Keeping the raised notes when the melodic minor comes down.'] },
      { type: 'memorise', items: ['The raised 7th is the leading note: a semitone below the tonic.'] },
    ],
    check: { topics: ['k-scales'], count: 6 },
  },
  {
    id: 'keys-chromatic', section: 3, refresh: true, glyph: '🎹', title: 'Chromatic scales',
    summary: 'Every semitone, with the letter-name rules.',
    blocks: [
      { type: 'intro', text: 'A **chromatic scale** moves up or down by **semitones**: 12 steps from the tonic to the octave.' },
      { type: 'music', music: { clef: 'treble', free: true, scale: 0.95, notes: chromaticScale(parse('C4')).map((p) => ({ keys: toString(p), dur: 'q' })) }, caption: 'A chromatic scale from C, written with the common "harmonic" spelling: tonic and dominant once, every other letter twice.', audio: { kind: 'melody', notes: chromaticScale(parse('C4')).map((p) => toString(p)), beats: 0.5, tempo: 100 } },
      { type: 'text', text: ['Rules: start and end on the **same note**; move by **semitones**; each step either **repeats the letter** (C → C♯) or moves to the **next letter** (C♯ → D).', 'No letter may be used **more than twice in a row**, and no letter may be skipped.'] },
      { type: 'keypoints', items: ['12 semitones, 13 notes including both tonics.', 'Never three of the same letter in a row; never skip a letter.'] },
      { type: 'mistakes', items: ['Writing C, C♯, C𝄪 (three Cs in a row).', 'Jumping from A♯ to C (skipping B).'] },
      { type: 'memorise', items: ['Same letter at most twice in a row.'] },
    ],
    check: { topics: ['k-chromatic'], count: 5 },
  },
  {
    id: 'keys-melody', section: 3, glyph: '🔑', title: 'Finding the key of a melody',
    summary: 'Use the key signature, accidentals and the last note.',
    blocks: [
      { type: 'intro', text: 'A key signature fits two keys: a major and its relative minor. To choose, look for clues.' },
      { type: 'text', text: ['**Accidentals**: a raised 7th (leading note) of the relative minor points to the minor key. In a melody with one sharp, a D♯ suggests **E minor**.', '**First and last notes**: melodies often start and end on notes of the tonic chord, especially the tonic itself.'] },
      { type: 'worked', title: 'Major or minor?', steps: [
        { text: 'One sharp: G major or E minor.', music: { clef: 'treble', key: 1, time: '3/4', measures: [{ notes: [{ keys: 'E4', dur: 'q' }, { keys: 'G4', dur: 'q' }, { keys: 'B4', dur: 'q' }] }, { notes: [{ keys: 'C5', dur: 'q' }, { keys: 'A4', dur: 'q' }, { keys: 'D#4', dur: 'q' }] }, { notes: [{ keys: 'E4', dur: 'h', dots: 1 }] }] } },
        { text: 'There is a **D♯**: the raised 7th of E minor. The melody starts and ends on **E**.' },
        { text: 'So it is in **E minor**.' },
      ] },
      { type: 'keypoints', items: ['Key signature → two possible keys.', 'Raised leading note → minor key.', 'Check the last note.'] },
      { type: 'mistakes', items: ['Choosing the major key just because there are no flats or sharps in the key signature.'] },
      { type: 'memorise', items: ['Minor key leading note = a semitone below its tonic, written with an accidental.'] },
    ],
    check: { topics: ['k-key-of-melody'], count: 5 },
  },
];

void key; void GRADE5_MAJOR;
