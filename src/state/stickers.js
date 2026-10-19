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

// Each sticker is a cute kawaii food or sweet (original SVG art in src/art/food.js).
const S = (id, name, rarity) => ({ id, name, rarity, art: id });
export const STICKERS = [
  // Common (25)
  S('strawberry', 'Strawberry', 'common'), S('apple', 'Apple', 'common'), S('banana', 'Banana', 'common'),
  S('carrot', 'Carrot', 'common'), S('pear', 'Pear', 'common'), S('watermelon', 'Watermelon', 'common'),
  S('lemon', 'Lemon', 'common'), S('cherries', 'Cherries', 'common'), S('grapes', 'Grapes', 'common'),
  S('avocado', 'Avocado', 'common'), S('cookie', 'Cookie', 'common'), S('donut', 'Pink Donut', 'common'),
  S('cupcake', 'Cupcake', 'common'), S('ice-lolly', 'Ice Lolly', 'common'), S('lollipop', 'Lollipop', 'common'),
  S('muffin', 'Blueberry Muffin', 'common'), S('croissant', 'Croissant', 'common'), S('toast', 'Toast', 'common'),
  S('egg', 'Fried Egg', 'common'), S('milk', 'Milk Carton', 'common'), S('juice-box', 'Juice Box', 'common'),
  S('cheese', 'Cheese', 'common'), S('orange', 'Orange', 'common'), S('mushroom', 'Mushroom', 'common'),
  S('peach', 'Peach', 'common'),
  // Rare (16)
  S('pancakes', 'Pancake Stack', 'rare'), S('waffle', 'Waffle', 'rare'), S('sushi', 'Sushi', 'rare'),
  S('onigiri', 'Onigiri', 'rare'), S('macaron', 'Macaron', 'rare'), S('ice-cream', 'Ice Cream Cone', 'rare'),
  S('pudding', 'Pudding', 'rare'), S('cake-slice', 'Cake Slice', 'rare'), S('cotton-candy', 'Candyfloss', 'rare'),
  S('bubble-tea', 'Bubble Tea', 'rare'), S('burger', 'Burger', 'rare'), S('fries', 'Chips', 'rare'),
  S('pizza', 'Pizza Slice', 'rare'), S('chocolate', 'Chocolate Bar', 'rare'), S('honey', 'Honey Pot', 'rare'),
  S('hot-choc', 'Hot Chocolate', 'rare'),
  // Epic (10)
  S('sundae', 'Sundae', 'epic'), S('birthday-cake', 'Birthday Cake', 'epic'), S('dango', 'Dango', 'epic'),
  S('strawberry-milk', 'Strawberry Milk', 'epic'), S('jelly', 'Wobbly Jelly', 'epic'), S('rainbow-donut', 'Rainbow Donut', 'epic'),
  S('gingerbread', 'Gingerbread Friend', 'epic'), S('boba-star', 'Starry Boba', 'epic'), S('fruit-tart', 'Fruit Tart', 'epic'),
  S('pumpkin', 'Pumpkin', 'epic'),
  // Legendary (6)
  S('golden-apple', 'Golden Apple', 'legendary'), S('galaxy-donut', 'Galaxy Donut', 'legendary'),
  S('unicorn-ice-cream', 'Unicorn Ice Cream', 'legendary'), S('crown-cupcake', 'Royal Cupcake', 'legendary'),
  S('rainbow-lollipop', 'Rainbow Lollipop', 'legendary'), S('sparkle-strawberry', 'Sparkle Strawberry', 'legendary'),
  // Mythic (3)
  S('cosmic-cake', 'Cosmic Cake', 'mythic'), S('rainbow-dragonfruit', 'Rainbow Dragon Fruit', 'mythic'),
  S('golden-teapot', 'Golden Teapot', 'mythic'),
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
