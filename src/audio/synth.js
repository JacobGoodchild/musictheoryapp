// Web Audio piano-like synth. No samples, no network.
import { midi, P } from '../theory/pitch.js';

let ctx = null;
let master = null;
let settings = { sound: true, volume: 0.7 };

export function setAudioSettings(s) {
  settings = { ...settings, ...s };
  if (master) master.gain.value = settings.volume;
}

function audio() {
  if (!ctx) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = settings.volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Each playback goes through its own bus, so pressing "Hear it" again stops
// the previous sound instead of playing on top of it.
let bus = null;
export function stopAll() {
  if (!ctx || !bus) return;
  const old = bus;
  old.gain.setValueAtTime(old.gain.value, ctx.currentTime);
  old.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
  setTimeout(() => old.disconnect(), 200);
  bus = null;
}
function currentBus() {
  if (!bus) { bus = ctx.createGain(); bus.connect(master); }
  return bus;
}

/** Play one note (MIDI number) at time t for dur seconds. */
function tone(m, t, dur, vel = 0.5) {
  const c = ctx;
  const f = freq(m);
  const out = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(9000, f * 9), t);
  filter.frequency.exponentialRampToValueAtTime(Math.max(300, f * 2), t + dur);
  out.connect(filter).connect(currentBus());
  // Brightness and decay depend a little on pitch, like a real piano.
  const decay = Math.max(0.6, 2.6 - (m - 48) * 0.025);
  const partials = [[1, 1], [2, 0.45], [3, 0.22], [4, 0.12], [5, 0.06], [6, 0.03]];
  for (const [mult, amp] of partials) {
    const o = c.createOscillator();
    o.type = mult === 1 ? 'triangle' : 'sine';
    o.frequency.value = f * mult * (1 + (mult - 1) * 0.0007);
    const g = c.createGain();
    const a = vel * amp * 0.32;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(a, t + 0.006);
    g.gain.exponentialRampToValueAtTime(a * 0.35, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(dur + 0.4, decay / mult + 0.3));
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 1.2);
  }
  // Soft release at the note end.
  out.gain.setValueAtTime(1, t + dur);
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.35);
}

const toMidi = (x) => (typeof x === 'number' ? x : midi(P(x)));

/**
 * Play a list of events. Each event: { notes: ['C4','E4'] | 'C4', beats: 1 }.
 * tempo in crotchet beats per minute.
 */
export function playSequence(events, { tempo = 80 } = {}) {
  if (!settings.sound) return 0;
  const c = audio();
  if (!c) return 0;
  stopAll();
  const beat = 60 / tempo;
  let t = c.currentTime + 0.05;
  for (const ev of events) {
    const notes = ev.notes === null || ev.notes === undefined ? [] : Array.isArray(ev.notes) ? ev.notes : [ev.notes];
    const d = (ev.beats || 1) * beat;
    for (const n of notes) tone(toMidi(n), t, d * 0.95, ev.vel || 0.55);
    t += d;
  }
  return t - c.currentTime;
}

/** Play overlapping notes: items [{ at, dur, notes }] with times in crotchet beats. */
export function playTimeline(items, { tempo = 84 } = {}) {
  if (!settings.sound) return 0;
  const c = audio();
  if (!c) return 0;
  stopAll();
  const beat = 60 / tempo;
  const t0 = c.currentTime + 0.05;
  let end = 0;
  for (const it of items) {
    for (const n of it.notes) tone(toMidi(n), t0 + it.at * beat, it.dur * beat * 0.95, it.notes.length > 2 ? 0.4 : 0.55);
    end = Math.max(end, (it.at + it.dur) * beat);
  }
  return end;
}

export const playChord = (notes, beats = 2) => playSequence([{ notes, beats }]);
export const playMelodic = (notes, beats = 1, tempo = 90) => playSequence(notes.map((n) => ({ notes: n, beats })), { tempo });

/** Play an interval: melodically then together. */
export function playInterval(a, b) {
  return playSequence([{ notes: a, beats: 1 }, { notes: b, beats: 1 }, { notes: [a, b], beats: 2 }], { tempo: 84 });
}

/** Questions and lessons describe sounds as data: { kind, ... }. */
export function playQuestionAudio(spec) {
  if (!spec) return 0;
  switch (spec.kind) {
    case 'interval': return playInterval(spec.notes[0], spec.notes[1]);
    case 'chord': return playChord(spec.notes, spec.beats || 2);
    case 'melody': return playMelodic(spec.notes, spec.beats || 1, spec.tempo || 90);
    case 'sequence': return playSequence(spec.events, { tempo: spec.tempo || 80 });
    case 'timeline': return playTimeline(spec.items, { tempo: spec.tempo || 84 });
    default: return 0;
  }
}

export function sfx(kind) {
  if (!settings.sound) return;
  const c = audio();
  if (!c) return;
  const t = c.currentTime + 0.02;
  if (kind === 'correct') { tone(76, t, 0.12, 0.25); tone(83, t + 0.09, 0.25, 0.25); }
  else if (kind === 'wrong') { tone(52, t, 0.18, 0.2); tone(51, t + 0.12, 0.25, 0.18); }
  else if (kind === 'coin') { tone(88, t, 0.08, 0.18); tone(93, t + 0.07, 0.2, 0.18); }
  else if (kind === 'reveal') { [72, 76, 79, 84].forEach((m, i) => tone(m, t + i * 0.08, 0.35, 0.25)); }
}
