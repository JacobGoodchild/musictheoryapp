import { STICKERS } from './stickers.js';
// Versioned save stored in localStorage. Every access is wrapped in try/catch
// so private windows or blocked storage never break the app.

export const SAVE_KEY = 'g5theory.save';
export const SAVE_VERSION = 4;

export function freshSave() {
  return {
    version: SAVE_VERSION,
    profile: { name: '', createdAt: Date.now() },
    settings: { theme: 'system', sound: true, volume: 0.7, reducedMotion: 'system', level: 'beginner' },
    coins: 0,
    dupeNotes: 0,
    totalCoinsEarned: 0,
    streak: { count: 0, best: 0, lastDay: null },
    lessons: {},
    topics: {},
    qSeen: {},
    mistakes: {},
    mocks: [],
    cards: {},
    avatar: { owned: [], equipped: {} },
    stickers: { owned: {}, bagsOpened: 0, sinceEpic: 0, seed: 0 },
    promos: [],
    last: null,
    daily: { day: null, done: false, best: 0 },
    badges: {},
    coinLog: {},
    mockRun: null,
  };
}

/**
 * Bring any older save up to the current version. Each step only adds or
 * renames fields, so progress is never lost.
 */
// Old (v3) sticker ids, by rarity, in catalogue order.
const OLD_STICKERS = {
  common: ['crotchet', 'quaver', 'minim', 'semibreve', 'semiquaver', 'treble-clef', 'bass-clef', 'sharp', 'flat', 'natural', 'crotchet-rest', 'quaver-rest', 'minim-rest', 'forte', 'piano', 'mezzo-forte', 'staccato', 'accent', 'fermata', 'repeat', 'common-time', 'time-34', 'crescendo', 'tie', 'breath'],
  rare: ['demisemiquaver', 'breve', 'double-sharp', 'double-flat', 'fortissimo', 'pianissimo', 'sforzando', 'alla-breve', 'marcato', 'tenuto', 'staccatissimo', 'segno', 'coda', 'semibreve-rest', 'time-68', 'pedal'],
  epic: ['trill', 'turn', 'upper-mordent', 'lower-mordent', 'quintuplet', 'sextuplet', 'triplet', 'time-58', 'arpeggio', 'dal-segno'],
  legendary: ['alto-clef', 'time-78', 'rinforzando', 'niente', 'golden-crotchet', 'acciaccatura'],
  mythic: ['tenor-clef', 'rainbow-treble', 'cosmic-semibreve'],
};
const OLD_STICKER_MAP = Object.fromEntries(Object.entries(OLD_STICKERS).flatMap(([rarity, ids]) => {
  const now = STICKERS.filter((x) => x.rarity === rarity);
  return ids.map((id, i) => [id, now[i % now.length].id]);
}));

export function migrate(data) {
  if (!data || typeof data !== 'object') return freshSave();
  let s = { ...data };
  const v = Number(s.version) || 1;
  if (v < 2) {
    // v1 kept coins under `wallet` and lessons as an array of ids.
    if (s.wallet && typeof s.wallet.coins === 'number') s.coins = s.wallet.coins;
    delete s.wallet;
    if (Array.isArray(s.lessons)) {
      const obj = {};
      for (const id of s.lessons) obj[id] = { done: true, at: 0 };
      s.lessons = obj;
    }
  }
  if (v < 3) {
    // v3 added the sticker album, dupe notes and the daily challenge.
    s.stickers = s.stickers || { owned: {}, bagsOpened: 0, sinceEpic: 0, seed: 0 };
    s.dupeNotes = s.dupeNotes || 0;
    s.daily = s.daily || { day: null, done: false, best: 0 };
  }
  if (v < 4 && s.stickers && s.stickers.owned) {
    // v4 replaced the music-symbol stickers with kawaii food stickers. Each old
    // sticker becomes the food sticker in the same place in its rarity, so the
    // collection (and its counts) carries over exactly.
    const owned = {};
    for (const [oldId, n] of Object.entries(s.stickers.owned)) {
      const newId = OLD_STICKER_MAP[oldId] || oldId;
      owned[newId] = (owned[newId] || 0) + n;
    }
    s.stickers = { ...s.stickers, owned };
  }
  // Fill in anything missing with defaults (deep for plain objects one level down).
  const base = freshSave();
  for (const [k, def] of Object.entries(base)) {
    if (s[k] === undefined || s[k] === null && def !== null) s[k] = def;
    else if (def && typeof def === 'object' && !Array.isArray(def) && typeof s[k] === 'object' && !Array.isArray(s[k])) {
      s[k] = { ...def, ...s[k] };
    }
  }
  s.version = SAVE_VERSION;
  if (typeof s.profile.name !== 'string') s.profile.name = '';
  s.profile.name = cleanName(s.profile.name);
  return s;
}

export function cleanName(name) {
  return String(name || '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 24);
}

export function loadSave(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    return migrate(JSON.parse(raw));
  } catch {
    return freshSave();
  }
}

export function writeSave(save, storage = globalThis.localStorage) {
  try {
    storage?.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function exportSave(save) {
  return JSON.stringify({ app: 'grade5-theory', exportedAt: new Date().toISOString(), save }, null, 2);
}

export function importSave(text) {
  const parsed = JSON.parse(text);
  const data = parsed && parsed.app === 'grade5-theory' ? parsed.save : parsed;
  if (!data || typeof data !== 'object' || !('version' in data)) throw new Error('This file does not look like a Grade 5 Theory save.');
  return migrate(data);
}
