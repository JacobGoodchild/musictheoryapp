// Promo codes. Only a hash of each code is stored here, so codes are not
// readable in the site's source. Each code works once per save.
import { addCoins } from './rewards.js';

export function codeHash(code) {
  let x = 2166136261;
  for (const c of String(code).trim().toUpperCase()) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619) >>> 0; }
  return x.toString(36);
}

export const PROMOS = [
  { id: 'launch-1', hash: 'p27red', coins: 100, notes: 100 },
];

/** Try a code. Returns { ok, message }; on success the reward is added to state s. */
export function redeemPromo(s, code) {
  if (!String(code || '').trim()) return { ok: false, message: 'Type a code first.' };
  const promo = PROMOS.find((p) => p.hash === codeHash(code));
  if (!promo) return { ok: false, message: 'That code doesn\'t work. Check the spelling and try again.' };
  s.promos = s.promos || [];
  if (s.promos.includes(promo.id)) return { ok: false, message: 'You\'ve already used that code.' };
  s.promos.push(promo.id);
  addCoins(s, promo.coins, 'promo');
  s.dupeNotes = (s.dupeNotes || 0) + promo.notes;
  return { ok: true, message: `Code accepted! +${promo.coins} coins and +${promo.notes} notes.`, promo };
}
