// Section 4 (intervals) and Section 5 (chords) lessons.
import { intervalMusic, intervalAudio, chordsMusic, chordAudio, scaleMusic, grandChordsMusic, grandChordsAudio } from './helpers.js';
import { parse, toString, name } from '../../theory/pitch.js';
import { transpose, intervalName, between } from '../../theory/interval.js';
import { key, keyName } from '../../theory/keys.js';
import { triad, voiceChord } from '../../theory/chords.js';

const ivRow = (low, list, clef = 'treble') => list.map(([n, q]) => ({ music: intervalMusic(low, n, q, clef, true), caption: intervalName({ number: n, quality: q }), audio: intervalAudio(low, n, q) }));
const tri = (t, m, d) => triad(key(t, m), d).map((p) => name(p)).join('–');

export const INTERVAL_LESSONS = [
  {
    id: 'intervals-basics', section: 4, refresh: true, glyph: '⇕', title: 'Interval numbers and qualities',
    summary: 'Count the letters, then check the quality against the major scale.',
    blocks: [
      { type: 'intro', text: 'An interval is the distance between two notes. Name it in two steps: the **number**, then the **quality**.' },
      { type: 'text', text: ['**Number**: count the letter names from the lower note to the upper, **including both**. C up to G = C D E F G = a **5th**. Accidentals don\'t change the number.', '**Quality**: imagine the **major scale of the lower note**. If the top note is in that scale, the interval is **major** (2nd, 3rd, 6th, 7th) or **perfect** (unison, 4th, 5th, octave).'] },
      { type: 'musicRow', items: ivRow('C4', [[2, 'M'], [3, 'M'], [4, 'P'], [5, 'P'], [6, 'M'], [7, 'M'], [8, 'P']]) },
      { type: 'text', text: 'Make a major interval **one semitone smaller** and it becomes **minor**.' },
      { type: 'musicRow', items: ivRow('C4', [[2, 'm'], [3, 'm'], [6, 'm'], [7, 'm']]) },
      { type: 'worked', title: 'Name the interval from E up to C', steps: [
        { text: 'Number: E F G A B C = 6 letters → a **6th**.', music: intervalMusic('E4', 6, 'm', 'treble') },
        { text: 'E major scale: E F♯ G♯ A B **C♯** D♯. Its 6th is C♯.' },
        { text: 'Our top note is C♮, a semitone lower than C♯ → **minor 6th**.' },
      ] },
      { type: 'keypoints', items: ['Count both notes when finding the number.', 'Perfect: 1, 4, 5, 8. Major/minor: 2, 3, 6, 7.', 'Always measure from the **lower** note.'] },
      { type: 'mistakes', items: ['Counting the steps between notes instead of the letters (gives one too few).', 'Measuring the quality from the top note\'s scale.'] },
      { type: 'memorise', items: ['Major 3rd = 4 semitones, minor 3rd = 3, perfect 5th = 7, perfect 4th = 5.'] },
    ],
    check: { topics: ['i-name'], count: 5, difficulty: 1 },
  },
  {
    id: 'intervals-aug-dim', section: 4, glyph: '±', title: 'Augmented and diminished intervals',
    summary: 'One semitone bigger than major or perfect, or smaller than minor or perfect.',
    blocks: [
      { type: 'intro', text: 'Stretch or squash intervals further and you get **augmented** (bigger) and **diminished** (smaller) intervals.' },
      { type: 'table', head: ['', 'Smaller ←', '', '→ Bigger'], rows: [['2nds, 3rds, 6ths, 7ths', 'diminished ← minor', '← major', '→ augmented'], ['unisons, 4ths, 5ths, octaves', 'diminished', '← perfect', '→ augmented']] },
      { type: 'musicRow', items: [['F4', 4, 'A'], ['B3', 5, 'd'], ['C4', 3, 'A'], ['C#4', 3, 'd'], ['C4', 6, 'A'], ['C#4', 6, 'd'], ['C4', 7, 'A'], ['C4', 8, 'd'], ['C4', 8, 'A']].map(([lo, n, q]) => ivRow(lo, [[n, q]])[0]) },
      { type: 'text', text: 'At Grade 5 these chromatic intervals are new: **augmented and diminished 3rds and 6ths, the augmented 7th, and augmented and diminished octaves.** The diatonic ones (augmented 2nd and 4th, diminished 5th and 7th, augmented 5th, diminished 4th) come from Grade 4.' },
      { type: 'worked', title: 'Name the interval from D♭ up to B♮', steps: [
        { text: 'Letters D E F G A B: a **6th**.', music: intervalMusic('Db4', 6, 'A', 'treble') },
        { text: `D♭ major scale: ${['Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4', 'C5'].map((s) => name(parse(s))).join(' ')}. Its 6th is B♭ (a major 6th).` },
        { text: 'B♮ is a semitone **bigger** than B♭ → **augmented 6th**.' },
      ] },
      { type: 'keypoints', items: ['Augmented = a semitone bigger than major or perfect.', 'Diminished = a semitone smaller than minor or perfect.', 'The letter count decides the number, even if it sounds like another interval.'] },
      { type: 'mistakes', items: ['Calling C–F♯ a diminished 5th (it is an augmented 4th: C D E F = 4 letters).'] },
      { type: 'memorise', items: ['Augmented 4th and diminished 5th both span 6 semitones (a tritone), but are spelled differently.'] },
    ],
    check: { topics: ['i-name', 'i-write'], count: 6 },
  },
  {
    id: 'intervals-compound', section: 4, isNew: true, glyph: '↕', title: 'Compound intervals',
    summary: 'Intervals bigger than an octave: 9ths to 15ths.',
    blocks: [
      { type: 'intro', text: 'A **compound interval** is more than an octave. Take away the octave (7 letters) to find its simple version: a 10th is a **compound 3rd**, a 12th is a **compound 5th**.' },
      { type: 'table', head: ['Compound', 'Also called'], rows: [['9th', 'compound 2nd'], ['10th', 'compound 3rd'], ['11th', 'compound 4th'], ['12th', 'compound 5th'], ['13th', 'compound 6th'], ['14th', 'compound 7th'], ['15th', 'compound octave (double octave)']] },
      { type: 'musicRow', items: [
        { music: intervalMusic('C4', 10, 'M', 'treble'), caption: 'compound major 3rd (major 10th)', audio: intervalAudio('C4', 10, 'M') },
        { music: intervalMusic('G2', 12, 'P', 'bass'), caption: 'compound perfect 5th (perfect 12th)', audio: intervalAudio('G2', 12, 'P') },
        { music: intervalMusic('A3', 14, 'm', 'treble'), caption: 'compound minor 7th (minor 14th)', audio: intervalAudio('A3', 14, 'm') },
      ] },
      { type: 'worked', title: 'Name the interval from B♭3 up to D5', steps: [
        { text: 'Count letters: B♭ C D E F G A B C D = **10** → a 10th, or compound 3rd.', music: intervalMusic('Bb3', 10, 'M', 'treble') },
        { text: 'Ignore the octave: B♭ up to D is a major 3rd (D is in B♭ major).' },
        { text: `So it is a **${intervalName(between(parse('Bb3'), parse('D5')))}** (also called a ${intervalName(between(parse('Bb3'), parse('D5')), { style: 'full' })}).` },
      ] },
      { type: 'keypoints', items: ['Subtract 7 from the number to get the simple interval (10 → 3).', 'The quality stays the same.', 'Either name is fine: "compound major 3rd" or "major 10th".'] },
      { type: 'mistakes', items: ['Subtracting 8 instead of 7 (a 10th is a compound 3rd, not a 2nd).'] },
      { type: 'memorise', items: ['9 → 2, 10 → 3, 11 → 4, 12 → 5, 13 → 6, 14 → 7, 15 → 8.'] },
    ],
    check: { topics: ['i-name', 'i-write'], count: 6, difficulty: 3 },
  },
];

export const CHORD_LESSONS = [
  {
    id: 'chords-triads', section: 5, glyph: '♫', title: 'Chords I, II, IV and V',
    summary: 'Triads on the tonic, supertonic, subdominant and dominant.',
    blocks: [
      { type: 'intro', text: 'A **triad** is three notes stacked in 3rds: a root, a 3rd and a 5th. At Grade 5 you need the triads on degrees **I** (tonic), **II** (supertonic), **IV** (subdominant) and **V** (dominant) in every key.' },
      { type: 'music', music: chordsMusic('G', 'major', [[1, 'a'], [2, 'a'], [4, 'a'], [5, 'a']]), caption: `G major: I = ${tri('G', 'major', 1)}, II = ${tri('G', 'major', 2)}, IV = ${tri('G', 'major', 4)}, V = ${tri('G', 'major', 5)}`, audio: { kind: 'sequence', tempo: 70, events: [1, 2, 4, 5].map((d) => ({ notes: voiceChord(key('G'), d, 'a', 4).map((p) => toString(p)), beats: 1.5 })) } },
      { type: 'text', text: 'In **minor keys**, chords use the **harmonic minor**, so the leading note is raised. That makes **V major** and **II diminished**.' },
      { type: 'music', music: chordsMusic('D', 'minor', [[1, 'a'], [2, 'a'], [4, 'a'], [5, 'a']]), caption: `D minor: I = ${tri('D', 'minor', 1)}, II = ${tri('D', 'minor', 2)} (diminished), IV = ${tri('D', 'minor', 4)}, V = ${tri('D', 'minor', 5)} (major, with C♯)` },
      { type: 'keypoints', items: ['Major keys: I, IV, V major; II minor.', 'Minor keys: I and IV minor; V major (raised leading note); II diminished.', 'ABRSM uses capital Roman numerals for all of them.'] },
      { type: 'mistakes', items: ['Forgetting the raised leading note in chord V of a minor key.'] },
      { type: 'memorise', items: ['V in a minor key always contains the leading note (e.g. G♯ in A minor).'] },
    ],
    check: { topics: ['c-chords'], count: 5, difficulty: 1 },
  },
  {
    id: 'chords-inversions', section: 5, isNew: true, glyph: 'b', title: 'Inversions: a, b and c',
    summary: 'Which note is in the bass decides the inversion.',
    blocks: [
      { type: 'intro', text: 'The **lowest note** of a chord decides its position. The other notes can be in any order above it.' },
      { type: 'table', head: ['Symbol', 'Name', 'Lowest note'], rows: [['a', 'root position', 'the root'], ['b', '1st inversion', 'the 3rd'], ['c', '2nd inversion', 'the 5th']] },
      { type: 'music', music: chordsMusic('F', 'major', [[1, 'a'], [1, 'b'], [1, 'c'], [5, 'a'], [5, 'b'], [5, 'c']]), caption: 'F major: Ia, Ib, Ic and Va, Vb, Vc', audio: chordAudio('F', 'major', 1, 'b') },
      { type: 'worked', title: 'Identify this chord in B♭ major', steps: [
        { text: 'Notes (bottom to top): D, F, B♭.', music: chordsMusic('Bb', 'major', [[1, 'b']]) },
        { text: `Which triad has these notes? I = ${tri('Bb', 'major', 1)}. ✓` },
        { text: 'The lowest note is D, the **3rd** of the chord → **1st inversion**: **Ib**.' },
      ] },
      { type: 'text', text: 'Chords are often written in **four parts on two staves**: one note on the bass stave and three on the treble stave, with one letter doubled. Collect the letter names from **both** staves to find the chord, then look at the **bass stave** for the lowest note.' },
      { type: 'musicRow', items: [
        { music: grandChordsMusic('Bb', 'major', [[1, 'a']]), caption: 'B♭ major: Ia (B♭ in the bass)', audio: grandChordsAudio('Bb', 'major', [[1, 'a']]) },
        { music: grandChordsMusic('Bb', 'major', [[1, 'b']]), caption: 'B♭ major: Ib (D in the bass)', audio: grandChordsAudio('Bb', 'major', [[1, 'b']]) },
        { music: grandChordsMusic('Bb', 'major', [[1, 'c']]), caption: 'B♭ major: Ic (F in the bass)', audio: grandChordsAudio('Bb', 'major', [[1, 'c']]) },
      ] },
      { type: 'keypoints', items: ['a = root in the bass, b = 3rd in the bass, c = 5th in the bass.', 'First find which chord it is, then look only at the lowest note.'] },
      { type: 'mistakes', items: ['Looking at the top note instead of the lowest.', 'Mixing up IVc and Ia (both have the tonic in the bass): check the other notes.'] },
      { type: 'memorise', items: ['"b = 3rd in the bass, c = 5th in the bass".'] },
    ],
    check: { topics: ['c-chords'], count: 6 },
  },
  {
    id: 'chords-cadences', section: 5, isNew: true, glyph: '𝄐', title: 'Cadences',
    summary: 'Perfect, plagal and imperfect cadences in C, G, D and F major.',
    blocks: [
      { type: 'intro', text: 'A **cadence** is the pair of chords at the end of a phrase, like punctuation in a sentence.' },
      { type: 'table', head: ['Cadence', 'Chords', 'Sounds'], rows: [['perfect', 'V – I', 'finished, like a full stop'], ['plagal', 'IV – I', 'finished, softer ("Amen")'], ['imperfect', 'I, II or IV – V', 'unfinished, like a comma']] },
      { type: 'musicRow', items: [
        { music: chordsMusic('C', 'major', [[5, 'a'], [1, 'a']], 'bass', 2), caption: 'Perfect (V–I) in C', audio: { kind: 'sequence', tempo: 66, events: [{ notes: voiceChord(key('C'), 5, 'a', 2).map((p) => toString(p)), beats: 2 }, { notes: voiceChord(key('C'), 1, 'a', 2).map((p) => toString(p)), beats: 3 }] } },
        { music: chordsMusic('C', 'major', [[4, 'a'], [1, 'a']], 'bass', 2), caption: 'Plagal (IV–I) in C', audio: { kind: 'sequence', tempo: 66, events: [{ notes: voiceChord(key('C'), 4, 'a', 2).map((p) => toString(p)), beats: 2 }, { notes: voiceChord(key('C'), 1, 'a', 2).map((p) => toString(p)), beats: 3 }] } },
        { music: chordsMusic('C', 'major', [[2, 'a'], [5, 'a']], 'bass', 2), caption: 'Imperfect (II–V) in C', audio: { kind: 'sequence', tempo: 66, events: [{ notes: voiceChord(key('C'), 2, 'a', 2).map((p) => toString(p)), beats: 2 }, { notes: voiceChord(key('C'), 5, 'a', 2).map((p) => toString(p)), beats: 3 }] } },
      ] },
      { type: 'text', text: 'On many papers cadences are written in **four parts on two staves**. The cadence is the same: work out each chord from all its notes, then name the pair.' },
      { type: 'musicRow', items: [
        { music: grandChordsMusic('G', 'major', [[5, 'a'], [1, 'a']]), caption: 'Perfect (V–I) in G', audio: grandChordsAudio('G', 'major', [[5, 'a'], [1, 'a']]) },
        { music: grandChordsMusic('G', 'major', [[4, 'a'], [1, 'a']]), caption: 'Plagal (IV–I) in G', audio: grandChordsAudio('G', 'major', [[4, 'a'], [1, 'a']]) },
        { music: grandChordsMusic('G', 'major', [[1, 'a'], [5, 'a']]), caption: 'Imperfect (I–V) in G', audio: grandChordsAudio('G', 'major', [[1, 'a'], [5, 'a']]) },
      ] },
      { type: 'table', head: ['Key', 'I', 'II', 'IV', 'V'], rows: ['C', 'G', 'D', 'F'].map((t) => [keyName(key(t)), tri(t, 'major', 1), tri(t, 'major', 2), tri(t, 'major', 4), tri(t, 'major', 5)]) },
      { type: 'keypoints', items: ['Perfect = V–I. Plagal = IV–I. Imperfect = ends on V.', 'At Grade 5 cadences are only in C, G, D and F major.'] },
      { type: 'mistakes', items: ['Calling V–I imperfect because it "sounds" unfinished: look at the chords.'] },
      { type: 'memorise', items: ['**P**erfect and **P**lagal both end on I; **I**mperfect ends on V.'] },
    ],
    check: { topics: ['c-cadences'], count: 5, difficulty: 1 },
  },
  {
    id: 'chords-melody', section: 5, isNew: true, glyph: '🎹', title: 'Choosing chords for a melody',
    summary: 'Pick I, II, IV or V at cadence points.',
    blocks: [
      { type: 'intro', text: 'In the exam you choose chords (I, II, IV or V) for melody notes at **cadence points**. Each chord must **contain its melody note**, and the pair must make a sensible cadence.' },
      { type: 'worked', title: 'Final cadence in D major: melody E → D', steps: [
        { text: `Chords containing E: II (${tri('D', 'major', 2)}) and V (${tri('D', 'major', 5)}). Chords containing D: I (${tri('D', 'major', 1)}) and IV (${tri('D', 'major', 4)}).` },
        { text: 'The music ends, so we want a perfect (V–I) or plagal (IV–I) cadence. E fits V; D fits I.' },
        { text: '**V – I**: a perfect cadence. (II–I is not a cadence.)', music: { clef: 'treble', key: 2, free: true, notes: [{ keys: 'E5', dur: 'h', text: 'V' }, { keys: 'D5', dur: 'w', text: 'I' }] } },
      ] },
      { type: 'worked', title: 'Mid-phrase in F major: melody F → E', steps: [
        { text: `E belongs to chord V (${tri('F', 'major', 5)}): an imperfect cadence ends on V.` },
        { text: `F belongs to I (${tri('F', 'major', 1)}) and IV (${tri('F', 'major', 4)}), but not II (${tri('F', 'major', 2)}).` },
        { text: 'So I–V or IV–V would both be correct here.' },
      ] },
      { type: 'tip', text: 'Write out I, II, IV and V for the key before you start, then tick which chords contain each melody note.' },
      { type: 'keypoints', items: ['The chord must contain the melody note.', 'End of piece: V–I or IV–I.', 'Middle of a piece: often ends on V (imperfect).'] },
      { type: 'mistakes', items: ['Choosing a chord that doesn\'t contain the melody note.'] },
      { type: 'memorise', items: ['In C: I = C E G, II = D F A, IV = F A C, V = G B D.'] },
    ],
    check: { topics: ['c-cadences'], count: 5 },
  },
];

void scaleMusic; void transpose;
