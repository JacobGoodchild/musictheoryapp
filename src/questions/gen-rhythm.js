// Section 1: Rhythm.
import * as R from '../theory/rhythm.js';
import { mcq, trueFalse } from './util.js';

const SEC = 1;
const DUR = { breve: '1/2', semibreve: 'w', minim: 'h', crotchet: 'q', quaver: '8', semiquaver: '16', demisemiquaver: '32' };
const ID_OF = Object.fromEntries(Object.entries(DUR).map(([k, v]) => [v, k]));

// Beat patterns, as [durCode, dots] lists. Each sums to one beat.
const PATTERNS = {
  // simple beats
  h: [[['h', 0]], [['q', 0], ['q', 0]], [['q', 1], ['8', 0]], [['8', 0], ['8', 0], ['q', 0]], [['q', 0], ['8', 0], ['8', 0]]],
  q: [[['q', 0]], [['8', 0], ['8', 0]], [['8', 1], ['16', 0]], [['16', 0], ['16', 0], ['16', 0], ['16', 0]], [['8', 0], ['16', 0], ['16', 0]], [['16', 0], ['16', 0], ['8', 0]], [['16', 0], ['8', 1]]],
  8: [[['8', 0]], [['16', 0], ['16', 0]], [['16', 1], ['32', 0]], [['32', 0], ['32', 0], ['32', 0], ['32', 0]]],
  // compound beats (dotted)
  'q.': [[['q', 1]], [['q', 0], ['8', 0]], [['8', 0], ['8', 0], ['8', 0]], [['8', 1], ['16', 0], ['8', 0]], [['8', 0], ['q', 0]], [['16', 0], ['16', 0], ['8', 0], ['8', 0]]],
  'h.': [[['h', 1]], [['h', 0], ['q', 0]], [['q', 0], ['q', 0], ['q', 0]], [['q', 1], ['8', 0], ['q', 0]]],
  '8.': [[['8', 1]], [['8', 0], ['16', 0]], [['16', 0], ['16', 0], ['16', 0]]],
};
const MELODY = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'D5', 'C5', 'B4', 'A4'];

function beatKeyFor(ts) {
  const { top, bottom } = R.parseTime(ts);
  const c = R.classifyTime(ts);
  const code = { 2: 'h', 4: 'q', 8: '8', 16: '16' }[bottom];
  if (c.kind === 'compound') return { 4: 'h.', 8: 'q.', 16: '8.' }[bottom];
  return code;
}

/** Build one full bar for a time signature, beamed beat by beat. */
export function buildBar(r, ts, { pitchStart = 0, restChance = 0, irregularGroups = null } = {}) {
  const { top, bottom } = R.parseTime(ts);
  const c = R.classifyTime(ts);
  const notes = [];
  let mi = pitchStart;
  let beamId = 0;
  const push = (list, beam) => {
    for (const [d, dots] of list) {
      const isRest = restChance && r.chance(restChance);
      notes.push(isRest ? { rest: true, dur: d, dots } : { keys: MELODY[mi++ % MELODY.length], dur: d, dots, beam: ['8', '16', '32'].includes(d) ? beam : undefined });
    }
  };
  if (c.kind === 'irregular') {
    // e.g. 5/8 = 3+2 quavers; 7/4 = 2+2+3 crotchets.
    const groups = irregularGroups || r.pick(R.IRREGULAR_GROUPINGS[top]);
    const unit = { 4: 'q', 8: '8' }[bottom];
    for (const g of groups) {
      beamId++;
      if (unit === '8') {
        const opts = g === 3 ? [[['8', 0], ['8', 0], ['8', 0]], [['q', 0], ['8', 0]], [['8', 0], ['16', 0], ['16', 0], ['8', 0]]] : [[['8', 0], ['8', 0]], [['16', 0], ['16', 0], ['8', 0]]];
        push(r.pick(opts.slice(0, g === 3 ? 3 : 2)), beamId);
      } else {
        const opts = g === 3 ? [[['q', 0], ['q', 0], ['q', 0]], [['h', 1]], [['h', 0], ['q', 0]]] : [[['q', 0], ['q', 0]], [['h', 0]], [['8', 0], ['8', 0], ['q', 0]]];
        push(r.pick(opts), beamId);
      }
    }
    return { notes, groups };
  }
  const beats = c.beats;
  const bk = beatKeyFor(ts);
  for (let b = 0; b < beats; b++) {
    beamId++;
    // Occasionally a longer note covering two beats (on beats 1 or 3 in quadruple).
    if (c.kind === 'simple' && beats >= 2 && b % 2 === 0 && b + 1 < beats && r.chance(0.2)) {
      const two = { h: 'w', q: 'h', 8: 'q' }[bk];
      if (two) { push([[two, 0]], beamId); b++; continue; }
    }
    push(r.pick(PATTERNS[bk]), beamId);
  }
  void bottom;
  return { notes };
}

export function noteDuration(n) {
  let d = R.dotted(ID_OF[n.dur], n.dots || 0);
  if (n.tuplet) d = R.mul(d, R.frac(n.tuplet.occupied, n.tuplet.num));
  return d;
}

export const barTotal = (notes) => R.sum(notes.map(noteDuration));

const TS_LABEL = (ts) => ts;

// ---------------------------------------------------------------------------

export function genEquivalence(r, diff) {
  const smalls = diff === 1 ? ['quaver', 'semiquaver'] : ['quaver', 'semiquaver', 'demisemiquaver'];
  const bigs = diff === 1 ? [['minim', 0], ['semibreve', 0], ['crotchet', 1], ['minim', 1]] : [['breve', 0], ['minim', 1], ['crotchet', 1], ['minim', 2], ['crotchet', 2], ['semibreve', 1], ['quaver', 1]];
  for (let tries = 0; tries < 50; tries++) {
    const small = r.pick(smalls);
    const [big, dots] = r.pick(bigs);
    const ratio = R.div(R.dotted(big, dots), R.valueById(small).value);
    if (ratio.d !== 1 || ratio.n < 2 || ratio.n > 64) continue;
    const bigName = R.valueName(big, dots);
    const restWord = r.chance(0.3);
    return {
      section: SEC, topic: 'r-values', difficulty: diff,
      prompt: `How many ${small}${restWord ? ' rests' : 's'} are equal in length to one ${bigName}${restWord ? ' rest' : ''}?`,
      type: 'number', numbers: [{ answer: ratio.n }],
      explanation: `A ${bigName} lasts ${describe(R.dotted(big, dots))}. A ${small} lasts ${describe(R.valueById(small).value)}, so ${ratio.n} of them fit into one ${bigName}.${dots ? ` (A dot adds half the note's value again${dots === 2 ? '; a second dot adds half of that' : ''}.)` : ''}`,
    };
  }
  throw new Error('equivalence');
}

function describe(fr) {
  // In crotchet beats, the most intuitive unit.
  const beats = R.mul(fr, R.frac(4));
  if (beats.d === 1) return `${beats.n} crotchet beat${beats.n === 1 ? '' : 's'}`;
  if (beats.d === 2) return `${beats.n / 2} crotchet beats`.replace('.5', '½');
  const q = R.mul(fr, R.frac(32));
  return `${q.n / q.d} demisemiquavers`;
}

export function genTimeDescribe(r, diff) {
  const pool = diff === 1 ? [...R.SIMPLE.slice(0, 6), '6/8', '9/8', '12/8'] : R.ALL_TIMES;
  const ts = r.pick(pool);
  const c = R.classifyTime(ts);
  const label = c.kind === 'irregular' ? 'irregular' : c.label;
  const all = ['simple duple', 'simple triple', 'simple quadruple', 'compound duple', 'compound triple', 'compound quadruple', 'irregular'];
  const why = (l) => {
    if (l === 'irregular') return 'Irregular time signatures have 5 or 7 beats in a bar.';
    const [kind, count] = l.split(' ');
    return `${kind === 'simple' ? 'Simple time has plain (undotted) beats; the top number is 2, 3 or 4.' : 'Compound time has dotted beats; the top number is 6, 9 or 12.'} ${count === 'duple' ? 'Duple = 2 beats.' : count === 'triple' ? 'Triple = 3 beats.' : 'Quadruple = 4 beats.'}`;
  };
  const { notes } = buildBar(r, ts);
  return mcq(r, {
    section: SEC, topic: 'r-time', difficulty: diff,
    prompt: `Describe the time signature of this bar.`,
    music: { clef: 'treble', time: ts, measures: [{ notes }] },
    explanation: explainTime(ts),
  }, { label }, all.filter((l) => l !== label).map((l) => ({ label: l, why: why(l) })));
}

export function explainTime(ts) {
  const { top, bottom } = R.parseTime(ts);
  const c = R.classifyTime(ts);
  const unit = { 2: 'minim', 4: 'crotchet', 8: 'quaver', 16: 'semiquaver' }[bottom];
  if (c.kind === 'simple') return `${ts} is ${c.label}: ${top} ${unit} beats in a bar.`;
  if (c.kind === 'compound') {
    const dotted = R.noteForDuration(R.frac(3, bottom));
    return `${ts} is ${c.label}: ${c.beats} dotted ${dotted.id} beats in a bar (${top} ${unit}s grouped in threes).`;
  }
  return `${ts} is an irregular time signature: ${top} ${unit}s in a bar, usually grouped as ${R.IRREGULAR_GROUPINGS[top].map((g) => g.join('+')).join(' or ')}.`;
}

const SAME_LENGTH_PAIRS = [['3/4', '6/8'], ['3/2', '6/4'], ['3/8', '6/16']];

export function genWhichTime(r, diff) {
  const pool = diff === 1 ? ['2/4', '3/4', '4/4', '6/8', '9/8', '3/8'] : diff === 2 ? ['2/4', '3/4', '4/4', '6/8', '9/8', '12/8', '3/8', '2/2', '3/2', '6/4', '5/4', '5/8', '7/8'] : R.ALL_TIMES;
  const ts = r.pick(pool);
  const { notes } = buildBar(r, ts);
  const len = R.barLength(ts);
  const pair = SAME_LENGTH_PAIRS.find((p) => p.includes(ts));
  const distract = R.ALL_TIMES.filter((t) => t !== ts && (!R.eq(R.barLength(t), len) || (pair && pair.includes(t))));
  // A pair distractor makes the question about grouping, not just counting.
  const pairD = pair ? pair.find((t) => t !== ts) : null;
  const ds = distract.map((t) => ({ label: TS_LABEL(t), why: R.eq(R.barLength(t), len) ? `${t} has the same total length, but the notes would be grouped differently (${explainGroup(t)}).` : `${t} needs ${describe(R.barLength(t))} in a bar; this bar has ${describe(len)}.` }));
  const q = mcq(r, {
    section: SEC, topic: 'r-time', difficulty: diff + (pairD ? 1 : 0) > 3 ? 3 : diff,
    prompt: 'Which time signature fits this bar?',
    music: { clef: 'treble', measures: [{ notes }], endBar: 'single' },
    explanation: `The bar adds up to ${describe(len)}${pairD ? `, and the notes are grouped ${explainGroup(ts)}` : ''}. ${explainTime(ts)}`,
  }, { label: ts }, pairD ? [ds.find((d) => d.label === pairD), ...r.sample(ds.filter((d) => d.label !== pairD), 2)] : ds);
  return q;
}

function explainGroup(ts) {
  const c = R.classifyTime(ts);
  const { bottom } = R.parseTime(ts);
  const unit = { 2: 'minim', 4: 'crotchet', 8: 'quaver', 16: 'semiquaver' }[bottom];
  if (c.kind === 'compound') return `in dotted beats (threes of ${unit}s)`;
  if (c.kind === 'simple') return `in ${unit} beats`;
  return 'in irregular groups';
}

export function genRests(r, diff) {
  const pool = diff === 1 ? ['2/4', '3/4', '4/4'] : diff === 2 ? ['2/4', '3/4', '4/4', '6/8', '3/8', '2/2'] : ['4/4', '6/8', '9/8', '3/2', '2/2', '6/4', '3/8'];
  for (let tries = 0; tries < 40; tries++) {
    const ts = r.pick(pool);
    const bar = R.barLength(ts);
    const c = R.classifyTime(ts);
    // In compound time only whole dotted beats are left to fill: conventions for
    // part-beat rests in compound time vary between books, so we avoid them.
    const unit = c.kind === 'compound' ? R.frac(3, R.parseTime(ts).bottom) : R.frac(1, R.parseTime(ts).bottom * (r.chance(0.5) ? 2 : 1));
    // Notes at the start of the bar, then rests to fill.
    const nUnits = c.kind === 'compound' ? r.int(1, c.beats - 1) : r.int(1, Math.max(1, R.toNum(R.div(bar, unit)) - 2));
    const start = R.mul(unit, R.frac(nUnits));
    if (!R.lt(start, bar)) continue;
    const lead = splitIntoNotes(start, ts);
    if (!lead) continue;
    let rests;
    try { rests = R.restsToFill(ts, start, R.sub(bar, start)); } catch { continue; }
    const toNotes = (rs) => rs.map((x) => ({ rest: true, dur: DUR[x.id], dots: x.dots }));
    const correctBar = [...lead, ...toNotes(rests)];
    // Distractors: change one rest's value (wrong total), or merge two rests (wrong grouping).
    const wrongs = [];
    for (let i = 0; i < rests.length; i++) {
      for (const delta of [-1, 1]) {
        const order = R.VALUES.map((v) => v.id);
        const j = order.indexOf(rests[i].id) + delta;
        if (j < 1 || j >= order.length) continue;
        const alt = rests.slice(); alt[i] = { id: order[j], dots: rests[i].dots };
        wrongs.push({ rests: alt, why: 'The rests do not add up to the right length for the bar.' });
      }
    }
    // Grouping error: one rest that covers the whole gap where the convention needs several.
    const gapNote = R.noteForDuration(R.sub(bar, start));
    if (gapNote && rests.length > 1 && c.kind === 'simple') {
      wrongs.push({ rests: [{ id: gapNote.id, dots: gapNote.dots }], why: groupingWhy(ts, start) });
    }
    if (wrongs.length < 2) continue;
    const music = (ns) => ({ clef: 'treble', time: ts, measures: [{ notes: ns }], scale: 1.1 });
    return mcq(r, {
      section: SEC, topic: 'r-rests', difficulty: diff,
      prompt: `Which bar of ${ts} is completed with the correct rest${rests.length > 1 ? 's' : ''}?`,
      explanation: `After the notes there is ${describe(R.sub(bar, start))} left. ${restRuleText(ts)} So the rests are: ${rests.map((x) => R.valueName(x.id, x.dots, true)).join(', ')}.`,
    }, { label: '', music: music(correctBar), key: JSON.stringify(rests), aria: 'bar with rests' },
    wrongs.map((w) => ({ label: '', music: music([...lead, ...toNotes(w.rests)]), key: JSON.stringify(w.rests), why: w.why, aria: 'bar with rests' })), 3);
  }
  throw new Error('rests');
}

function groupingWhy(ts, start) {
  const c = R.classifyTime(ts);
  if (c.kind === 'compound') return 'In compound time each dotted beat should get its own rest, and a part-beat is completed before the next beat starts.';
  return 'The total is right, but rests should complete each beat (or half bar) separately rather than one rest crossing the beat.';
}

function restRuleText(ts) {
  const c = R.classifyTime(ts);
  if (c.kind === 'compound') return 'In compound time, complete the part of the beat first, then use one dotted rest for each whole dotted beat.';
  if (ts === '4/4' || ts === '4/2') return 'Complete the part beat first, then whole beats; a minim rest can only start on beat 1 or beat 3 in this time.';
  return 'Complete the part beat first, then give each whole beat its own rest.';
}

/** Split a length (from the start of the bar) into simple note values that respect beats. */
function splitIntoNotes(len, ts) {
  const out = [];
  let pos = R.frac(0);
  let mi = 0;
  const c = R.classifyTime(ts);
  const beat = c.kind === 'compound' ? R.frac(3, R.parseTime(ts).bottom) : R.frac(1, R.parseTime(ts).bottom);
  while (R.lt(pos, len)) {
    const remaining = R.sub(len, pos);
    // Use a whole beat if possible, else the biggest value that fits.
    let chosen = null;
    if (!R.lt(remaining, beat)) chosen = R.noteForDuration(beat);
    if (!chosen) for (const v of R.VALUES) if (!R.lt(remaining, v.value)) { chosen = { id: v.id, dots: 0 }; break; }
    if (!chosen) return null;
    out.push({ keys: MELODY[mi++ % MELODY.length], dur: DUR[chosen.id], dots: chosen.dots });
    pos = R.add(pos, R.dotted(chosen.id, chosen.dots));
  }
  return out;
}

export function genTuplet(r, diff) {
  const opts = diff === 1 ? ['triplet'] : diff === 2 ? ['triplet', 'duplet', 'quintuplet', 'sextuplet'] : ['duplet', 'quintuplet', 'sextuplet'];
  const type = r.pick(opts);
  const t = R.TUPLETS[type];
  const unit = type === 'duplet' ? r.pick(['8', 'q']) : type === 'triplet' ? r.pick(['8', 'q', '16']) : r.pick(['16', '8']);
  const unitName = ID_OF[unit];
  // Show a bar containing the tuplet, in a time signature where it makes sense.
  const tupletTotal = R.mul(R.valueById(unitName).value, R.frac(t.inTimeOf));
  const ts = type === 'duplet' ? (unit === '8' ? '6/8' : '6/4') : (R.eq(tupletTotal, R.frac(1, 4)) ? '2/4' : R.eq(tupletTotal, R.frac(1, 2)) ? '4/4' : R.eq(tupletTotal, R.frac(1, 8)) ? '2/8' : '2/4');
  const bar = R.barLength(ts);
  const tup = Array.from({ length: t.count }, (_, i) => ({ keys: MELODY[i % MELODY.length], dur: unit, tuplet: { id: 1, num: t.count, occupied: t.inTimeOf }, beam: ['8', '16', '32'].includes(unit) ? 99 : undefined }));
  const rest = splitIntoNotes(R.sub(bar, tupletTotal), ts) || [];
  const notes = [...tup, ...rest.map((n, i) => ({ ...n, keys: MELODY[(i + 4) % MELODY.length] }))];
  if (r.chance(0.5)) {
    return {
      section: SEC, topic: 'r-tuplets', difficulty: diff,
      prompt: `The group marked ${t.count} is ${type === 'triplet' ? 'a' : 'a'} ${type}. It lasts the same time as how many ordinary ${unitName}s?`,
      music: { clef: 'treble', time: ts, measures: [{ notes }] },
      type: 'number', numbers: [{ answer: t.inTimeOf }],
      explanation: `A ${type} means ${t.count} notes played in the time of ${t.inTimeOf} of the same kind. So these ${t.count} ${unitName}s last as long as ${t.inTimeOf} ordinary ${unitName}s (${describe(tupletTotal)}).`,
    };
  }
  const names = Object.keys(R.TUPLETS);
  return mcq(r, {
    section: SEC, topic: 'r-tuplets', difficulty: diff,
    prompt: 'What is the name of the group of notes marked with a number in this bar?',
    music: { clef: 'treble', time: ts, measures: [{ notes }] },
    explanation: `${t.count} notes in the time of ${t.inTimeOf} is a ${type}.`,
  }, { label: type }, names.filter((n) => n !== type).map((n) => ({ label: n, why: `A ${n} is ${R.TUPLETS[n].count} notes in the time of ${R.TUPLETS[n].inTimeOf}.` })));
}

export function genConvert(r, diff) {
  const kind = r.pick(diff === 1 ? ['triplets'] : ['triplets', 'duplets', 'halve', 'double']);
  if (kind === 'triplets') {
    const ts = r.pick(['2/4', '3/4', '4/4', '2/2', '3/8', '3/2']);
    const ans = R.simpleToCompound(ts);
    const unit = { 2: 'crotchet', 4: 'quaver', 8: 'semiquaver' }[R.parseTime(ts).bottom];
    const distract = [R.parseTime(ts).top * 3 + '/' + R.parseTime(ts).bottom, R.parseTime(ts).top * 2 + '/' + R.parseTime(ts).bottom * 2, ans.split('/')[0] + '/' + R.parseTime(ts).bottom * 4, ts];
    return mcq(r, {
      section: SEC, topic: 'r-convert', difficulty: diff,
      prompt: `A melody in ${ts} uses ${unit} triplets on every beat. It is rewritten without any triplets, keeping the same rhythm. Which time signature should be used?`,
      explanation: `Each beat is divided into three, which is how compound time works. ${ts} has ${R.parseTime(ts).top} beats, so the new time signature has ${R.parseTime(ts).top} dotted beats: ${ans}. ${explainTime(ans)}`,
    }, { label: ans }, distract.filter((d) => d !== ans).map((d) => ({ label: d })));
  }
  if (kind === 'duplets') {
    const ts = r.pick(['6/8', '9/8', '12/8', '6/4', '6/16']);
    const ans = R.compoundToSimple(ts);
    const distract = [R.parseTime(ts).top / 3 + '/' + R.parseTime(ts).bottom, R.parseTime(ts).top / 3 * 2 + '/' + R.parseTime(ts).bottom, ts, R.parseTime(ts).top / 3 + '/' + R.parseTime(ts).bottom * 2];
    return mcq(r, {
      section: SEC, topic: 'r-convert', difficulty: diff,
      prompt: `A melody in ${ts} uses duplets on every beat. It is rewritten in simple time without duplets, keeping the same rhythm. Which time signature should be used?`,
      explanation: `Each dotted beat is split into two, which is how simple time works. ${ts} has ${R.parseTime(ts).top / 3} beats, so the simple version has ${R.parseTime(ts).top / 3} plain beats: ${ans}.`,
    }, { label: ans }, distract.filter((d) => d !== ans).map((d) => ({ label: d })));
  }
  const ts = r.pick(kind === 'halve' ? ['3/4', '2/4', '4/4', '6/8', '9/8', '3/2', '2/2', '6/4', '5/4', '7/4'] : ['3/8', '2/4', '6/8', '3/4', '6/16', '5/8', '9/16', '4/8']);
  const { top, bottom } = R.parseTime(ts);
  const ans = `${top}/${kind === 'halve' ? bottom * 2 : bottom / 2}`;
  const distract = [`${top}/${kind === 'halve' ? bottom / 2 : bottom * 2}`, `${top * 2}/${bottom}`, `${top / 1}/${bottom}`, `${Math.max(1, top / 2)}/${bottom}`].filter((d) => /^\d+\/(2|4|8|16)$/.test(d));
  return mcq(r, {
    section: SEC, topic: 'r-convert', difficulty: diff,
    prompt: `A melody in ${ts} is rewritten with all the note values ${kind === 'halve' ? 'halved' : 'doubled'} (so it sounds the same). Which time signature should it have?`,
    explanation: `${kind === 'halve' ? 'Halving' : 'Doubling'} every note value ${kind === 'halve' ? 'halves' : 'doubles'} the beat unit, so the bottom number ${kind === 'halve' ? 'doubles' : 'halves'} while the top number stays the same: ${ans}.`,
  }, { label: ans }, distract.filter((d) => d !== ans).map((d) => ({ label: d })));
}

export function genRhythmFacts(r, diff) {
  const ts = r.pick(diff === 1 ? ['2/4', '3/4', '4/4', '6/8'] : R.ALL_TIMES.filter((t) => !t.endsWith('/16')));
  const { notes } = buildBar(r, ts);
  const c = R.classifyTime(ts);
  const counts = {};
  for (const n of notes) if (!n.rest) counts[n.dur + (n.dots ? '.' : '')] = (counts[n.dur + (n.dots ? '.' : '')] || 0) + 1;
  const hasDotted = notes.some((n) => n.dots);
  const hasSemi = notes.some((n) => n.dur === '16');
  const st = [
    { text: `This bar is in ${c.kind === 'irregular' ? 'simple' : c.kind === 'simple' ? 'compound' : 'simple'} time.`, answer: false },
    { text: `This bar is in ${c.kind} time.`, answer: true },
    { text: 'The bar contains a dotted note.', answer: hasDotted },
    { text: 'The bar contains at least one semiquaver.', answer: hasSemi },
    { text: `The time signature means ${R.parseTime(ts).top} ${{ 2: 'minim', 4: 'crotchet', 8: 'quaver', 16: 'semiquaver' }[R.parseTime(ts).bottom]}s in a bar.`, answer: true },
    { text: `The bar lasts as long as ${R.toNum(R.mul(R.barLength(ts), R.frac(8))) + 1} quavers.`, answer: false },
    { text: `The bar lasts as long as ${R.toNum(R.mul(R.barLength(ts), R.frac(8)))} quavers.`, answer: true },
  ];
  if (c.kind === 'compound') st.push({ text: `There are ${c.beats} dotted beats in each bar.`, answer: true }, { text: `There are ${R.parseTime(ts).top} beats in each bar.`, answer: false });
  if (c.kind === 'simple') st.push({ text: `There are ${c.beats} beats in each bar.`, answer: true });
  return trueFalse(r, {
    section: SEC, topic: 'r-time', difficulty: diff,
    prompt: 'Look at this bar. Are these statements true or false?',
    music: { clef: 'treble', time: ts, measures: [{ notes }] },
    explanation: explainTime(ts),
  }, st.filter((s) => !s.text.includes('NaN')), 4);
}

export function genIrregular(r, diff) {
  const ts = r.pick(R.IRREGULAR);
  const groups = r.pick(R.IRREGULAR_GROUPINGS[R.parseTime(ts).top]);
  const { notes } = buildBar(r, ts, { irregularGroups: groups });
  const len = R.barLength(ts);
  const others = R.ALL_TIMES.filter((t) => t !== ts && !R.eq(R.barLength(t), len));
  return mcq(r, {
    section: SEC, topic: 'r-time', difficulty: Math.max(2, diff),
    prompt: `This bar is grouped ${groups.join(' + ')}. Which time signature fits it?`,
    music: { clef: 'treble', measures: [{ notes }], endBar: 'single' },
    explanation: `The bar adds up to ${R.parseTime(ts).top} ${{ 4: 'crotchet', 8: 'quaver' }[R.parseTime(ts).bottom]}s, grouped ${groups.join('+')}. ${explainTime(ts)}`,
  }, { label: ts }, [...others.filter((t) => R.parseTime(t).bottom === R.parseTime(ts).bottom), ...others].map((t) => ({ label: t })));
}

export const RHYTHM_TOPICS = [
  { id: 'r-values', section: 1, title: 'Note and rest values', gens: [genEquivalence] },
  { id: 'r-time', section: 1, title: 'Time signatures', gens: [genTimeDescribe, genWhichTime, genRhythmFacts, genIrregular] },
  { id: 'r-rests', section: 1, title: 'Completing bars with rests', gens: [genRests] },
  { id: 'r-tuplets', section: 1, title: 'Triplets, duplets and other tuplets', gens: [genTuplet] },
  { id: 'r-convert', section: 1, title: 'Simple ↔ compound, halving and doubling', gens: [genConvert] },
];
