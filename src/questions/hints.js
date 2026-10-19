// Optional hints for practice questions, in three levels:
//   1. a nudge: a plain-English tip for the topic plus definitions of any
//      tricky words in the question;
//   2. a big giveaway: rules out half of the wrong options (or reveals part of
//      the answer for other question types);
//   3. almost the answer: the worked solution with the final answer hidden,
//      and (for multiple choice) only two options left.
// Hints are built from the question's own data, so they always match it.
import { parse, name } from '../theory/pitch.js';
import { keyFromFifths, keyName } from '../theory/keys.js';
import { triad, chordContains } from '../theory/chords.js';

const TOPIC_TIPS = {
  'r-values': 'Think of note lengths as fractions: a semibreve is 4 crotchet beats, a minim 2, a crotchet 1, a quaver ½, a semiquaver ¼. A dot adds half the note\'s value again.',
  'r-time': 'The top number says how many beats are in a bar; the bottom number says what kind of beat (4 = crotchet, 8 = quaver, 2 = minim). If the top number is 6, 9 or 12, it is compound time: the beats are dotted notes.',
  'r-rests': 'Fill the bar beat by beat, from left to right. Each new beat starts with its own rest, and a rest should not hide the middle of a 4/4 bar (beats 2–3).',
  'r-barlines': 'Count the beats in each bar using the time signature. When you reach a full bar, that is where the bar line goes.',
  'r-tuplets': 'A tuplet squeezes notes into a different space: a triplet is 3 notes in the time of 2, a duplet is 2 in the time of 3.',
  'r-convert': 'Simple time has plain beats (like crotchets); compound time has dotted beats (like dotted crotchets). To halve note values, each note becomes the next shorter one (minim → crotchet).',
  'p-clefs': 'Find a note you know first. Treble clef: the bottom line is E. Bass clef: the top line is A. Alto clef: the middle line is middle C. Tenor clef: the second line from the top is middle C.',
  'p-enharmonic': 'Enharmonic notes sound the same but have different letter names, like F♯ and G♭. Count semitones (the next key on a piano, black or white).',
  'p-transpose-clef': 'The notes must sound the same, just written in a different clef (and octave if asked). Work out each note\'s name and octave first, then find it in the new clef.',
  'p-instruments': 'A transposing instrument does not sound the note that is written. B♭ instruments sound a major 2nd (one tone) lower, A instruments a minor 3rd lower, and F instruments a perfect 5th lower. To get concert pitch go DOWN; to write the part go UP.',
  'k-signatures': 'Sharps always come in the order F C G D A E B; flats in the order B E A D G C F. For a major key with sharps, the key is one semitone above the last sharp. For flats, the key is the second-to-last flat.',
  'k-relative': 'Every major key has a relative minor that shares its key signature. The relative minor starts 3 semitones (a minor 3rd) below the major key note.',
  'k-degrees': 'Number the notes of the scale from 1 (the tonic). 1 tonic, 2 supertonic, 3 mediant, 4 subdominant, 5 dominant, 6 submediant, 7 leading note.',
  'k-scales': 'A major scale goes tone, tone, semitone, tone, tone, tone, semitone. A harmonic minor raises the 7th note; a melodic minor raises the 6th and 7th going up and uses the normal ones coming down.',
  'k-chromatic': 'A chromatic scale moves by semitones, using every note. Each letter name is used once or twice, never three times in a row.',
  'k-key-of-melody': 'Look at the key signature first, then look for accidentals: a raised 7th (leading note) points to the minor key. The last note is often the key note too.',
  'i-name': 'Interval = number + quality. Count the letter names from the bottom note to the top note, counting both. Then imagine the major scale of the bottom note to find the quality.',
  'i-write': 'Count up (or down) the letter names first to find the right letter, then fix the sharp or flat so the size is right, using the major scale of the bottom note.',
  'c-chords': 'A chord here is three notes stacked in 3rds: the root, the 3rd and the 5th. Find which chord it is first, then look only at the lowest note: root = a, 3rd = b, 5th = c.',
  'c-cadences': 'A cadence is the two chords at the end of a phrase. Perfect = V then I (finished). Plagal = IV then I (an "Amen"). Imperfect = anything then V (sounds unfinished).',
  't-terms': 'Many terms describe speed (tempo), loudness (dynamics) or mood. Use the Memorise flashcards to learn them in small groups.',
  't-signs': 'Picture what the sign looks like and what the player does: dots = short, lines = held, accents = stronger.',
  't-ornaments': 'An ornament decorates a note. Trill = fast alternating with the note above. Turn = above, note, below, note. Upper mordent = note, note above, note. Lower mordent = note, note below, note. Acciaccatura = a quick crushed note; appoggiatura = a leaning note that takes time.',
  't-instruments': 'Think about the four orchestra families: strings (bowed or plucked), woodwind (blowing across or through reeds), brass (buzzing lips) and percussion (struck or shaken).',
  'x-context': 'Read the question carefully and find exactly which bar or notes it is asking about. Then use what you know: the key signature, the clef and the time signature.',
};

// Plain-English definitions of words that come up in questions.
const GLOSSARY = [
  [/\bcadence/i, 'A **cadence** is the pair of chords at the end of a musical phrase, like a full stop or comma in a sentence.'],
  [/\bperfect cadence|\bplagal|\bimperfect cadence/i, 'Perfect cadence = V–I. Plagal cadence = IV–I. Imperfect cadence = ends on V.'],
  [/\binterval/i, 'An **interval** is the distance between two notes, e.g. a "major 3rd".'],
  [/\bcompound/i, 'A **compound interval** is bigger than an octave (e.g. a 10th = an octave + a 3rd). **Compound time** has dotted beats (6/8, 9/8, 12/8).'],
  [/\binversion|position\b|\bIb\b|\bIc\b/i, '**Root position (a)** has the root at the bottom; **1st inversion (b)** has the 3rd at the bottom; **2nd inversion (c)** has the 5th at the bottom.'],
  [/\bchord\b/i, 'A **chord** (triad) is three notes a 3rd apart, e.g. C–E–G. Roman numerals say which scale note it is built on: I on the tonic, II on the supertonic, IV on the subdominant, V on the dominant.'],
  [/\bleading note/i, 'The **leading note** is the 7th note of the scale, a semitone below the tonic. In a minor key it is raised with an accidental.'],
  [/\btonic\b/i, 'The **tonic** is the key note: the first note of the scale.'],
  [/\bdominant\b/i, 'The **dominant** is the 5th note of the scale.'],
  [/\bsubdominant/i, 'The **subdominant** is the 4th note of the scale.'],
  [/\bsupertonic/i, 'The **supertonic** is the 2nd note of the scale.'],
  [/\bmediant\b/i, 'The **mediant** is the 3rd note of the scale (the **submediant** is the 6th).'],
  [/\brelative\b/i, '**Relative** major and minor keys share the same key signature, e.g. C major and A minor.'],
  [/\bkey signature/i, 'The **key signature** is the group of sharps or flats at the start of each line. They apply to every note with that letter, in every octave.'],
  [/\bconcert pitch|sounds? (a|an) /i, '**Concert pitch** is the note you actually hear. A transposing instrument\'s written note is different from the sound.'],
  [/\benharmonic/i, '**Enharmonic** notes sound the same but are spelt differently, like C♯ and D♭.'],
  [/\bchromatic/i, 'A **chromatic** scale uses every semitone (all the white and black keys).'],
  [/\bharmonic minor/i, 'The **harmonic minor** raises the 7th note by a semitone, going up and coming down.'],
  [/\bmelodic minor/i, 'The **melodic minor** raises the 6th and 7th going up, and lowers them back again coming down.'],
  [/\btriplet|\bduplet|\bquintuplet|\bsextuplet|\btuplet/i, 'A **triplet** fits 3 notes into the time of 2. A **duplet** fits 2 into the time of 3. Quintuplet = 5, sextuplet = 6.'],
  [/\bsimple (duple|triple|quadruple|time)/i, '**Simple time** has undotted beats; **duple** = 2 beats, **triple** = 3 beats, **quadruple** = 4 beats in a bar.'],
  [/\birregular/i, '**Irregular time** has 5 or 7 beats in a bar (like 5/4 or 7/8), grouped in 2s and 3s.'],
  [/\bornament|\btrill|\bmordent|\bturn\b|acciaccatura|appoggiatura/i, 'An **ornament** is a small decoration added to a note, shown with a sign (like tr for a trill).'],
  [/\btenor clef/i, 'In the **tenor clef**, middle C is on the 2nd line from the top.'],
  [/\balto clef/i, 'In the **alto clef**, middle C is on the middle line.'],
  [/\btranspos/i, '**Transposing** means moving all the notes up or down by the same amount.'],
  [/\bsemitone|\btone\b/i, 'A **semitone** is the smallest step (next key on a piano). A **tone** is two semitones.'],
  [/\bdegree\b|technical name/i, 'Each scale note has a **technical name**: tonic, supertonic, mediant, subdominant, dominant, submediant, leading note.'],
];

const plain = (s) => String(s || '').replace(/\*\*/g, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Hide every mention of the answer in a piece of text. */
export function maskAnswer(text, needles) {
  let out = String(text || '');
  for (const n of needles.filter((x) => x && String(x).trim().length)) {
    const s = String(n).trim();
    const re = new RegExp(`(^|[^\\w♯♭𝄪𝄫])${esc(s)}(?![\\w♯♭𝄪𝄫])`, 'gi');
    out = out.replace(re, (m, pre) => `${pre}▢▢▢`);
  }
  return out;
}

/** Up to two glossary definitions for words in the question. */
function definitionsFor(q, tip) {
  const text = `${q.prompt || ''} ${(q.options || []).map((o) => o.label || '').join(' ')}`;
  const out = [];
  for (const [re, def] of GLOSSARY) {
    // Skip a definition the topic tip already covers.
    const term = (/\*\*(.+?)\*\*/.exec(def) || [null, def.split(' ').slice(0, 2).join(' ')])[1].toLowerCase();
    if (re.test(text) && !re.test(tip) && !tip.toLowerCase().includes(term) && out.length < 2) out.push(def);
  }
  return out;
}

const letters = (idx) => idx.map((i) => String.fromCharCode(65 + i)).join(' and ');

/** Deterministic choice of wrong options to rule out (so a hint is the same each time). */
function wrongOrder(q) {
  const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
  const seed = String(q.id || q.prompt).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return wrong.sort((a, b) => ((a * 7919 + seed) % 97) - ((b * 7919 + seed) % 97));
}

/**
 * The three hints for a question. Each is { text, eliminate?: [option indexes],
 * reveal?: { statements?: [i], boxes?: [i] } }.
 */
export function hintsFor(q) {
  const tip = TOPIC_TIPS[q.topic] || 'Read the question slowly and underline the important words.';
  const defs = definitionsFor(q, tip);
  const h1 = { text: [tip, ...defs].join('\n') };
  let h2, h3;
  const explanation = plain(q.explanation);
  switch (q.type) {
    case 'mcq': {
      const order = wrongOrder(q);
      const half = order.slice(0, Math.ceil(order.length / 2));
      const allButOne = order.slice(0, order.length - 1);
      const why = half.map((i) => q.whyWrong?.[i]).filter(Boolean)[0];
      h2 = { text: `Option${half.length > 1 ? 's' : ''} ${letters(half)} ${half.length > 1 ? 'are' : 'is'} wrong.${why ? ` (${letters([half.find((i) => q.whyWrong?.[i])])}: ${plain(why)})` : ''}`, eliminate: half };
      const label = q.options[q.answer].label;
      h3 = { text: `${maskAnswer(explanation, [label])}\nIt is one of the two options left.`, eliminate: allButOne };
      break;
    }
    case 'truefalse': {
      const n = q.statements.length;
      const first = Array.from({ length: Math.ceil(n / 2) }, (_, i) => i);
      const most = Array.from({ length: n - 1 }, (_, i) => i);
      const say = (idx) => idx.map((i) => `“${q.statements[i].text}” is ${q.statements[i].answer ? 'TRUE' : 'FALSE'}.`).join('\n');
      h2 = { text: say(first), reveal: { statements: first } };
      h3 = { text: `${say(most)}\nNow check the last statement yourself.${explanation ? `\n${explanation}` : ''}`, reveal: { statements: most } };
      break;
    }
    case 'place': {
      const ans = q.place.accept[0];
      const letter = ans[0].toUpperCase();
      const accWord = /bb|𝄫/.test(ans) ? 'a double flat' : /x|##|𝄪/.test(ans) ? 'a double sharp' : /#/.test(ans) ? 'a sharp' : /b/.test(ans.slice(1)) ? 'a flat' : 'no sharp or flat';
      h2 = { text: `The answer is some kind of **${letter}**. Find where ${letter} sits in the ${q.place.clef} clef.` };
      const sigNote = q.place.fifths ? ' Remember the key signature: if it already gives the right sharp or flat, choose "None".' : '';
      h3 = { text: `${maskAnswer(explanation, [ans, ans.replace(/\d+$/, ''), q.place.answerText])}\nThe note is a ${letter} with ${accWord} (before thinking about the key signature).${sigNote}${q.place.anyOctave ? ' Any octave is fine.' : ''}` };
      break;
    }
    case 'number': {
      const a = q.numbers.map((n) => n.answer);
      h2 = { text: q.numbers.length === 1 ? `The answer is between ${Math.max(0, a[0] - 2)} and ${a[0] + 2}.` : `The first answer is ${a[0]}.` };
      h3 = { text: `${maskAnswer(explanation, a.map(String))}${q.numbers.length === 1 ? `\nThe answer is ${a[0] - 1}, ${a[0]} or ${a[0] + 1}.` : ''}` };
      break;
    }
    case 'dropdown': {
      const combo = q.acceptCombos ? q.acceptCombos[0] : q.dropdowns.map((d) => d.answer);
      const label = (i) => q.dropdowns[i].label || `Box ${i + 1}`;
      // Cadence chords: say which chords contain each melody note (computed from the music brain).
      const cad = q.check?.kind === 'cadence-chords' ? (() => {
        const k = keyFromFifths(q.check.fifths, 'major');
        const R = { 1: 'I', 2: 'II', 4: 'IV', 5: 'V' };
        return q.check.notes.map((n) => { const p = parse(n); return `${name(p)} is in ${[1, 2, 4, 5].filter((d) => chordContains(k, d, p)).map((d) => `${R[d]} (${triad(k, d).map((x) => name(x)).join('–')})`).join(' and ')}`; }).map((t, i) => `Note ${i + 1}: ${t}.`).concat(`(Key: ${keyName(k)}.)`);
      })() : null;
      h2 = { text: `${label(0)}: **${combo[0]}**.${cad ? `\n${cad[0]}` : ''}`, reveal: { boxes: [0] } };
      const most = combo.map((_, i) => i).slice(0, combo.length - 1);
      const lastTip = q.topic === 'c-cadences' ? 'For the last box, which chord contains that melody note and finishes the cadence?' : 'Now work out the last box.';
      h3 = { text: `${most.map((i) => `${label(i)}: ${combo[i]}`).join(', ')}.\n${cad ? `${cad.slice(1).join('\n')}\n` : ''}${lastTip}`, reveal: { boxes: most } };
      break;
    }
    default:
      h2 = { text: 'Look again at the question.' };
      h3 = { text: maskAnswer(explanation, []) };
  }
  return [h1, h2, h3];
}
