// Bonus listening practice (not part of the real exam). Sounds come from the brain.
import { pitch, toString, parse } from '../theory/pitch.js';
import { transpose, intervalName } from '../theory/interval.js';
import { voiceChord, triad } from '../theory/chords.js';
import { key, scale, melodicMinor, GRADE5_MAJOR } from '../theory/keys.js';
import { mcq } from './util.js';

const SIMPLE = [[2, 'm'], [2, 'M'], [3, 'm'], [3, 'M'], [4, 'P'], [5, 'P'], [6, 'm'], [6, 'M'], [7, 'm'], [7, 'M'], [8, 'P']];

export function listeningQuestion(r) {
  const kind = r.pick(['interval', 'interval', 'cadence', 'triad', 'scale']);
  const base = { section: 4, topic: 'listening', difficulty: 2, listening: true };
  if (kind === 'interval') {
    const low = pitch(r.pick(['C', 'D', 'E', 'F', 'G', 'A']), 0, 4);
    const pool = r.sample(SIMPLE, 4);
    const [n, q] = pool[0];
    const high = transpose(low, n, q, 'up');
    return { ...mcq(r, { ...base, section: 4, prompt: 'Listen. Which interval do you hear? (melodic, then together)', audio: { kind: 'interval', notes: [toString(low), toString(high)] }, explanation: `It was a ${intervalName({ number: n, quality: q })}: ${low.letter} up to ${high.letter}${['', '♭', '', '♯'][high.acc + 1] || ''}.` },
      { label: intervalName({ number: n, quality: q }) }, pool.slice(1).map(([n2, q2]) => ({ label: intervalName({ number: n2, quality: q2 }) }))), id: `listen-${Math.floor(r() * 1e9)}` };
  }
  if (kind === 'cadence') {
    const k = key(r.pick(['C', 'G', 'D', 'F']));
    const type = r.pick(['perfect', 'plagal', 'imperfect']);
    const pair = type === 'perfect' ? [5, 1] : type === 'plagal' ? [4, 1] : r.pick([[1, 5], [2, 5], [4, 5]]);
    const pre = [voiceChord(k, 1, 'a', 3), voiceChord(k, 4, 'a', 3)];
    const ch = pair.map((d) => voiceChord(k, d, 'a', 3));
    const events = [...pre, ...ch].map((v, i) => ({ notes: v.map((p) => toString(p)), beats: i === 3 ? 3 : 1.5 }));
    return { ...mcq(r, { ...base, section: 5, prompt: 'Listen to the four chords. What kind of cadence ends the phrase?', audio: { kind: 'sequence', events, tempo: 76 }, explanation: { perfect: 'V–I: sounds finished, like a full stop.', plagal: 'IV–I: a softer finish, the "Amen" cadence.', imperfect: 'Ending on V: sounds unfinished, like a comma.' }[type] },
      { label: `${type} cadence` }, ['perfect', 'plagal', 'imperfect'].filter((t) => t !== type).map((t) => ({ label: `${t} cadence` })), 3), id: `listen-${Math.floor(r() * 1e9)}` };
  }
  if (kind === 'triad') {
    const k = r.pick(GRADE5_MAJOR.slice(3, 10));
    const minor = r.chance(0.5);
    const kk = minor ? key(['A', 'E', 'D', 'G', 'C', 'B', 'F'][r.int(0, 6)], 'minor') : k;
    const notes = voiceChord(kk, 1, 'a', 4).map((p) => toString(p));
    return { ...mcq(r, { ...base, section: 3, prompt: 'Listen. Is this chord major or minor?', audio: { kind: 'chord', notes }, explanation: minor ? 'Minor chords have a minor 3rd at the bottom: they often sound darker or sadder.' : 'Major chords have a major 3rd at the bottom: they often sound brighter.' },
      { label: minor ? 'minor' : 'major' }, [{ label: minor ? 'major' : 'minor' }], 2), id: `listen-${Math.floor(r() * 1e9)}` };
  }
  const t = parse(r.pick(['A3', 'D4', 'E4', 'G3', 'C4']));
  const type = r.pick(['major', 'harmonic', 'melodic']);
  const notes = type === 'major' ? [...scale(t, 'major'), ...scale(t, 'major').reverse().slice(1)] : type === 'harmonic' ? [...scale(t, 'harmonic'), ...scale(t, 'harmonic').reverse().slice(1)] : melodicMinor(t);
  const labels = { major: 'major scale', harmonic: 'harmonic minor scale', melodic: 'melodic minor scale' };
  return { ...mcq(r, { ...base, section: 3, prompt: 'Listen to the scale (up and down). Which scale is it?', audio: { kind: 'melody', notes: notes.map((p) => toString(p)), beats: 0.5, tempo: 100 }, explanation: { major: 'The major scale sounds bright, with semitones between notes 3–4 and 7–8.', harmonic: 'The harmonic minor has a wide step (augmented 2nd) between the 6th and 7th notes — a distinctive "exotic" sound.', melodic: 'The melodic minor raises the 6th and 7th going up, then uses the natural minor coming down.' }[type] },
    { label: labels[type] }, Object.entries(labels).filter(([k]) => k !== type).map(([, l]) => ({ label: l })), 3), id: `listen-${Math.floor(r() * 1e9)}` };
}
