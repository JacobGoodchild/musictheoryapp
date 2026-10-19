// Blind-bag stickers: catalogue, odds, pity rule, duplicates → notes.
import { rng } from '../questions/util.js';

export const RARITIES = [
  { id: 'common', name: 'Common', odds: 55, dupeNotes: 15, swapCost: 25, colour: '#7d8597' },
  { id: 'rare', name: 'Rare', odds: 27, dupeNotes: 25, swapCost: 50, colour: '#2f8fd8' },
  { id: 'epic', name: 'Epic', odds: 12, dupeNotes: 50, swapCost: 90, colour: '#8a4fd8' },
  { id: 'legendary', name: 'Legendary', odds: 5, dupeNotes: 100, swapCost: 160, colour: '#e0a100' },
  { id: 'mythic', name: 'Mythic', odds: 1, dupeNotes: 250, swapCost: 280, colour: '#e8457c' },
];
export const rarityById = (id) => RARITIES.find((r) => r.id === id);
export const PITY = 10; // guaranteed Epic or better at least every 10 bags

// Each sticker: a SMuFL glyph (drawn with the Bravura music font) on an original
// die-cut sticker design. `face` adds a cute face; `hue` sets the colours.
const S = (id, name, rarity, glyph, hue, extra = {}) => ({ id, name, rarity, glyph, hue, ...extra });
export const STICKERS = [
  // Common (25)
  S('crotchet', 'Crotchet', 'common', 0xE1D5, 210, { face: true }),
  S('quaver', 'Quaver', 'common', 0xE1D7, 190, { face: true }),
  S('minim', 'Minim', 'common', 0xE1D3, 160),
  S('semibreve', 'Semibreve', 'common', 0xE1D2, 140, { face: true }),
  S('semiquaver', 'Semiquaver', 'common', 0xE1D9, 230),
  S('treble-clef', 'Treble Clef', 'common', 0xE050, 260),
  S('bass-clef', 'Bass Clef', 'common', 0xE062, 280),
  S('sharp', 'Sharp', 'common', 0xE262, 10),
  S('flat', 'Flat', 'common', 0xE260, 30, { face: true }),
  S('natural', 'Natural', 'common', 0xE261, 50),
  S('crotchet-rest', 'Crotchet Rest', 'common', 0xE4E5, 300),
  S('quaver-rest', 'Quaver Rest', 'common', 0xE4E6, 320),
  S('minim-rest', 'Minim Rest', 'common', 0xE4E4, 340),
  S('forte', 'Forte', 'common', 0xE522, 0),
  S('piano', 'Piano', 'common', 0xE520, 200),
  S('mezzo-forte', 'Mezzo Forte', 'common', [0xE521, 0xE522], 20),
  S('staccato', 'Staccato', 'common', 0xE4A2, 100),
  S('accent', 'Accent', 'common', 0xE4A0, 120),
  S('fermata', 'Pause', 'common', 0xE4C0, 180, { face: true }),
  S('repeat', 'Repeat Sign', 'common', 0xE040, 240),
  S('common-time', 'Common Time', 'common', 0xE08A, 70),
  S('time-34', 'Three Four', 'common', [0xE083, 0xE084], 90, { stack: true }),
  S('crescendo', 'Crescendo', 'common', 0xE53E, 150),
  S('tie', 'Beamed Quavers', 'common', 0xE1F0, 170),
  S('breath', 'Breath Mark', 'common', 0xE4CE, 60),
  // Rare (16)
  S('demisemiquaver', 'Demisemiquaver', 'rare', 0xE1DB, 215, { face: true }),
  S('breve', 'Breve', 'rare', 0xE0A0, 45),
  S('double-sharp', 'Double Sharp', 'rare', 0xE263, 5),
  S('double-flat', 'Double Flat', 'rare', 0xE264, 35),
  S('fortissimo', 'Fortissimo', 'rare', [0xE522, 0xE522], 355),
  S('pianissimo', 'Pianissimo', 'rare', [0xE520, 0xE520], 195),
  S('sforzando', 'Sforzando', 'rare', [0xE524, 0xE522, 0xE525], 15),
  S('alla-breve', 'Alla Breve', 'rare', 0xE08B, 75),
  S('marcato', 'Strong Accent', 'rare', 0xE4AC, 125),
  S('tenuto', 'Tenuto', 'rare', 0xE4A4, 105),
  S('staccatissimo', 'Staccatissimo', 'rare', 0xE4A8, 85),
  S('segno', 'Segno', 'rare', 0xE047, 275, { face: true }),
  S('coda', 'Coda', 'rare', 0xE048, 295),
  S('semibreve-rest', 'Semibreve Rest', 'rare', 0xE4E3, 335),
  S('time-68', 'Six Eight', 'rare', [0xE086, 0xE088], 95, { stack: true }),
  S('pedal', 'Pedal Mark', 'rare', 0xE650, 250),
  // Epic (10)
  S('trill', 'Trill', 'epic', 0xE566, 285, { face: true }),
  S('turn', 'Turn', 'epic', 0xE567, 175),
  S('upper-mordent', 'Upper Mordent', 'epic', 0xE56C, 135),
  S('lower-mordent', 'Lower Mordent', 'epic', 0xE56D, 155),
  S('quintuplet', 'Quintuplet', 'epic', 0xE885, 225, { label: '5' }),
  S('sextuplet', 'Sextuplet', 'epic', 0xE886, 245, { label: '6' }),
  S('triplet', 'Triplet', 'epic', 0xE883, 265, { label: '3' }),
  S('time-58', 'Five Eight', 'epic', [0xE085, 0xE088], 345, { stack: true }),
  S('arpeggio', 'Arpeggio', 'epic', 0xEAA9, 205),
  S('dal-segno', 'Dal Segno', 'epic', 0xE045, 25),
  // Legendary (6)
  S('alto-clef', 'Alto Clef', 'legendary', 0xE05C, 40, { face: true }),
  S('time-78', 'Seven Eight', 'legendary', [0xE087, 0xE088], 310, { stack: true }),
  S('rinforzando', 'Rinforzando', 'legendary', [0xE52C, 0xE525], 0),
  S('niente', 'A Niente', 'legendary', 0xE526, 220),
  S('golden-crotchet', 'Golden Crotchet', 'legendary', 0xE1D5, 48, { face: true, gold: true }),
  S('acciaccatura', 'Acciaccatura', 'legendary', 0xE560, 170),
  // Mythic (3)
  S('tenor-clef', 'Tenor Clef', 'mythic', 0xE05C, 330, { face: true, mythic: true }),
  S('rainbow-treble', 'Rainbow Treble Clef', 'mythic', 0xE050, 0, { rainbow: true }),
  S('cosmic-semibreve', 'Cosmic Semibreve', 'mythic', 0xE1D2, 250, { cosmic: true, face: true }),
];

export const stickerById = (id) => STICKERS.find((s) => s.id === id);

/** Roll a rarity using the shown odds, forcing Epic+ when pity is due. */
export function rollRarity(r, sinceEpic) {
  if (sinceEpic >= PITY - 1) {
    const pool = RARITIES.filter((x) => ['epic', 'legendary', 'mythic'].includes(x.id));
    return r.weighted(pool.map((x) => [x.id, x.odds]));
  }
  return r.weighted(RARITIES.map((x) => [x.id, x.odds]));
}

/**
 * Open one bag (mutates the sticker state). Returns { sticker, duplicate, notes }.
 * state: { owned: {id: count}, bagsOpened, sinceEpic, seed }
 */
export function openBag(state, notesWallet = null) {
  const r = rng((state.seed * 7919 + state.bagsOpened * 104729 + 12345) >>> 0);
  const rarity = rollRarity(r, state.sinceEpic);
  const pool = STICKERS.filter((s) => s.rarity === rarity);
  const sticker = r.pick(pool);
  state.bagsOpened += 1;
  state.sinceEpic = ['epic', 'legendary', 'mythic'].includes(rarity) ? 0 : state.sinceEpic + 1;
  const duplicate = (state.owned[sticker.id] || 0) > 0;
  state.owned[sticker.id] = (state.owned[sticker.id] || 0) + 1;
  const notes = duplicate ? rarityById(rarity).dupeNotes : 0;
  if (notesWallet) notesWallet.add(notes);
  return { sticker, rarity, duplicate, notes };
}

export function collectionStats(owned) {
  const byRarity = RARITIES.map((ra) => {
    const all = STICKERS.filter((s) => s.rarity === ra.id);
    return { ...ra, total: all.length, have: all.filter((s) => owned[s.id]).length };
  });
  return { byRarity, have: STICKERS.filter((s) => owned[s.id]).length, total: STICKERS.length };
}
