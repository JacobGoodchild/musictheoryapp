// Pet care and the supermarket: what's for sale, the pet's needs (hunger,
// fun, energy), feeding, and paying at the till. Pure functions on the save,
// so they can be tested in Node.
import { PETS, petById } from './pets-data.js';

// Everything is cheap on purpose: the supermarket is for fun, not a grind.
// kind: food (people food the pets love too), petfood, toy (throwable), decor.
export const MARKET = [
  // Fruit and veg
  { id: 'apple', name: 'Apple', aisle: 'fruit', kind: 'food', price: 2, hunger: 15, fun: 2 },
  { id: 'banana', name: 'Banana', aisle: 'fruit', kind: 'food', price: 2, hunger: 15, fun: 2 },
  { id: 'strawberry', name: 'Strawberry', aisle: 'fruit', kind: 'food', price: 2, hunger: 12, fun: 4 },
  { id: 'blueberries', name: 'Blueberries', aisle: 'fruit', kind: 'food', price: 2, hunger: 12, fun: 3 },
  { id: 'watermelon', name: 'Watermelon', aisle: 'fruit', kind: 'food', price: 3, hunger: 20, fun: 4 },
  { id: 'carrot', name: 'Carrot', aisle: 'fruit', kind: 'food', price: 2, hunger: 15, fun: 2 },
  { id: 'broccoli', name: 'Broccoli', aisle: 'fruit', kind: 'food', price: 2, hunger: 15, fun: 1 },
  { id: 'corn', name: 'Sweetcorn', aisle: 'fruit', kind: 'food', price: 2, hunger: 15, fun: 2 },
  // Bakery and sweets
  { id: 'croissant', name: 'Croissant', aisle: 'bakery', kind: 'food', price: 3, hunger: 20, fun: 4 },
  { id: 'cookie', name: 'Cookie', aisle: 'bakery', kind: 'food', price: 3, hunger: 10, fun: 8 },
  { id: 'donut', name: 'Doughnut', aisle: 'bakery', kind: 'food', price: 4, hunger: 12, fun: 10 },
  { id: 'cupcake', name: 'Cupcake', aisle: 'bakery', kind: 'food', price: 4, hunger: 12, fun: 10 },
  { id: 'cake-slice', name: 'Cake slice', aisle: 'bakery', kind: 'food', price: 5, hunger: 15, fun: 12 },
  { id: 'macaron', name: 'Macaron', aisle: 'bakery', kind: 'food', price: 4, hunger: 8, fun: 10 },
  { id: 'ice-cream', name: 'Ice cream', aisle: 'bakery', kind: 'food', price: 4, hunger: 10, fun: 12 },
  { id: 'birthday-cake', name: 'Party cake', aisle: 'bakery', kind: 'food', price: 8, hunger: 30, fun: 25 },
  { id: 'milk', name: 'Milk', aisle: 'bakery', kind: 'food', price: 2, hunger: 10, fun: 3 },
  { id: 'cheese', name: 'Cheese', aisle: 'bakery', kind: 'food', price: 3, hunger: 15, fun: 4 },
  // Pet corner: food
  { id: 'pf-fish', name: 'Fishy dinner', aisle: 'pets', kind: 'petfood', price: 3, hunger: 30, fun: 4 },
  { id: 'pf-kibble', name: 'Crunchy kibble', aisle: 'pets', kind: 'petfood', price: 3, hunger: 30, fun: 3 },
  { id: 'pf-bone', name: 'Bone biscuit', aisle: 'pets', kind: 'petfood', price: 3, hunger: 20, fun: 8 },
  { id: 'pf-seeds', name: 'Seed mix', aisle: 'pets', kind: 'petfood', price: 2, hunger: 25, fun: 3 },
  { id: 'pf-bamboo', name: 'Fresh bamboo', aisle: 'pets', kind: 'petfood', price: 3, hunger: 30, fun: 4 },
  { id: 'pf-rainbow', name: 'Rainbow treat', aisle: 'pets', kind: 'petfood', price: 4, hunger: 20, fun: 15 },
  // Pet corner: toys and home
  { id: 'toy-star-ball', name: 'Star ball', aisle: 'toys', kind: 'toy', price: 6 },
  { id: 'toy-yarn', name: 'Ball of wool', aisle: 'toys', kind: 'toy', price: 5 },
  { id: 'toy-mouse', name: 'Toy mouse', aisle: 'toys', kind: 'toy', price: 5 },
  { id: 'toy-duck', name: 'Rubber duck', aisle: 'toys', kind: 'toy', price: 6 },
  { id: 'toy-bone', name: 'Chew bone', aisle: 'toys', kind: 'toy', price: 5 },
  { id: 'toy-beach-ball', name: 'Beach ball', aisle: 'toys', kind: 'toy', price: 8 },
  { id: 'decor-bed', name: 'Heart bed', aisle: 'toys', kind: 'decor', price: 10 },
  { id: 'decor-lights', name: 'Fairy lights', aisle: 'toys', kind: 'decor', price: 10 },
  { id: 'decor-rug', name: 'Rainbow rug', aisle: 'toys', kind: 'decor', price: 10 },
  { id: 'decor-plant', name: 'Pot plant', aisle: 'toys', kind: 'decor', price: 6 },
  { id: 'decor-poster', name: 'Music poster', aisle: 'toys', kind: 'decor', price: 6 },
];
export const AISLES = [
  { id: 'fruit', name: 'Fruit and veg' },
  { id: 'bakery', name: 'Bakery and treats' },
  { id: 'pets', name: 'Pet food' },
  { id: 'toys', name: 'Toys and home' },
];
export const marketItem = (id) => MARKET.find((m) => m.id === id);
export const isOneOff = (item) => item.kind === 'toy' || item.kind === 'decor';

/** Each pet's favourite foods: extra fun and a shower of hearts. */
export const FAVOURITES = {
  'pet-kitten': ['pf-fish', 'milk', 'cheese'],
  'pet-puppy': ['pf-bone', 'pf-kibble', 'cheese'],
  'pet-bunny': ['carrot', 'broccoli', 'strawberry'],
  'pet-chick': ['pf-seeds', 'corn', 'blueberries'],
  'pet-hamster': ['pf-seeds', 'corn', 'blueberries', 'apple'],
  'pet-panda': ['pf-bamboo', 'apple', 'banana'],
  'pet-unicorn': ['pf-rainbow', 'cupcake', 'strawberry', 'macaron'],
};

export const NEED_KEYS = ['hunger', 'fun', 'energy'];
// Per hour away. Needs never drop below FLOOR, so nobody comes back to a sad pet.
export const RATES = { hunger: -3, fun: -2.5, energy: 8 };
export const FLOOR = 10;
const clamp = (v) => Math.max(0, Math.min(100, v));

export function freshPet() {
  return { owned: [], active: null, names: {}, inventory: {}, toys: [], needs: {} };
}

/** The current needs of a pet, after time away. Does not change the save. */
export function needsNow(p, petId, now = Date.now()) {
  const n = (p.needs && p.needs[petId]) || { hunger: 70, fun: 70, energy: 90, at: now };
  const hours = Math.max(0, (now - (n.at || now)) / 3.6e6);
  const out = { at: now };
  for (const k of NEED_KEYS) {
    const v = n[k] ?? 70;
    const next = v + RATES[k] * hours;
    out[k] = Math.round(RATES[k] < 0 ? Math.max(Math.min(v, FLOOR), next) : clamp(next));
  }
  return out;
}

/** Change a pet's needs by a delta (e.g. {fun: +5}), saving the time too. */
export function changeNeeds(s, petId, delta, now = Date.now()) {
  if (!petId) return null;
  s.pet.needs = s.pet.needs || {};
  const n = needsNow(s.pet, petId, now);
  for (const k of NEED_KEYS) if (delta[k]) n[k] = Math.round(clamp(n[k] + delta[k]));
  s.pet.needs[petId] = n;
  return n;
}

/** Take one food out of the cupboard. Returns the food item, or null. */
export function takeFood(s, itemId) {
  const item = marketItem(itemId);
  const inv = s.pet.inventory || {};
  if (!item || isOneOff(item) || !(inv[itemId] > 0)) return null;
  inv[itemId] -= 1;
  if (inv[itemId] <= 0) delete inv[itemId];
  return item;
}

/** What eating a food does for this pet. */
export function foodEffect(item, petId) {
  const fav = (FAVOURITES[petId] || []).includes(item.id);
  return { hunger: item.hunger || 0, fun: (item.fun || 0) + (fav ? 10 : 0), favourite: fav };
}

/** Total of a trolley: { itemId: count }. */
export function trolleyTotal(trolley) {
  return Object.entries(trolley).reduce((t, [id, n]) => t + (marketItem(id)?.price || 0) * n, 0);
}

/**
 * Pay at the till: takes the coins and puts the shopping away (food in the
 * cupboard, toys and decorations in the house). Returns false (and changes
 * nothing) if there isn't enough money or the trolley is empty/invalid.
 */
export function checkout(s, trolley) {
  const lines = Object.entries(trolley).filter(([id, n]) => marketItem(id) && n > 0);
  if (!lines.length) return false;
  for (const [id, n] of lines) if (isOneOff(marketItem(id)) && (n > 1 || (s.pet.toys || []).includes(id))) return false;
  const total = trolleyTotal(Object.fromEntries(lines));
  if (s.coins < total) return false;
  s.coins -= total;
  s.pet.inventory = s.pet.inventory || {};
  s.pet.toys = s.pet.toys || [];
  for (const [id, n] of lines) {
    if (isOneOff(marketItem(id))) s.pet.toys.push(id);
    else s.pet.inventory[id] = (s.pet.inventory[id] || 0) + n;
  }
  return true;
}

export function petName(p, petId) {
  return (p.names && p.names[petId]) || petById(petId)?.name || 'Pet';
}

export { PETS, petById };
