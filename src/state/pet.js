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
  // Meals
  { id: 'pizza', name: 'Pizza', aisle: 'meals', kind: 'food', price: 5, hunger: 30, fun: 8 },
  { id: 'burger', name: 'Burger', aisle: 'meals', kind: 'food', price: 5, hunger: 30, fun: 6 },
  { id: 'sushi', name: 'Sushi', aisle: 'meals', kind: 'food', price: 5, hunger: 25, fun: 6 },
  { id: 'ramen', name: 'Ramen', aisle: 'meals', kind: 'food', price: 5, hunger: 30, fun: 5 },
  { id: 'pancakes', name: 'Pancakes', aisle: 'meals', kind: 'food', price: 4, hunger: 25, fun: 8 },
  { id: 'sandwich', name: 'Sandwich', aisle: 'meals', kind: 'food', price: 3, hunger: 25, fun: 3 },
  { id: 'dumpling', name: 'Dumplings', aisle: 'meals', kind: 'food', price: 4, hunger: 25, fun: 5 },
  { id: 'onigiri', name: 'Rice ball', aisle: 'meals', kind: 'food', price: 3, hunger: 20, fun: 4 },
  // Sweets
  { id: 'lollipop', name: 'Lollipop', aisle: 'sweets', kind: 'food', price: 2, hunger: 4, fun: 10 },
  { id: 'wrapped-sweet', name: 'Wrapped sweet', aisle: 'sweets', kind: 'food', price: 1, hunger: 3, fun: 6 },
  { id: 'gummy-bear', name: 'Gummy bear', aisle: 'sweets', kind: 'food', price: 2, hunger: 4, fun: 8 },
  { id: 'marshmallow', name: 'Marshmallow', aisle: 'sweets', kind: 'food', price: 2, hunger: 4, fun: 8 },
  { id: 'chocolate', name: 'Chocolate bar', aisle: 'sweets', kind: 'food', price: 3, hunger: 6, fun: 12 },
  { id: 'cotton-candy', name: 'Candy floss', aisle: 'sweets', kind: 'food', price: 3, hunger: 4, fun: 12 },
  { id: 'jelly', name: 'Jelly', aisle: 'sweets', kind: 'food', price: 3, hunger: 6, fun: 10 },
  { id: 'rainbow-lollipop', name: 'Rainbow lolly', aisle: 'sweets', kind: 'food', price: 4, hunger: 4, fun: 16 },
  // Ice cream and drinks
  { id: 'ice-lolly', name: 'Ice lolly', aisle: 'icecream', kind: 'food', price: 2, hunger: 5, fun: 10 },
  { id: 'sundae', name: 'Sundae', aisle: 'icecream', kind: 'food', price: 5, hunger: 10, fun: 16 },
  { id: 'ice-cream-sandwich', name: 'Ice cream sandwich', aisle: 'icecream', kind: 'food', price: 3, hunger: 8, fun: 12 },
  { id: 'mochi-ice-cream', name: 'Mochi ice cream', aisle: 'icecream', kind: 'food', price: 4, hunger: 8, fun: 14 },
  { id: 'unicorn-ice-cream', name: 'Unicorn ice cream', aisle: 'icecream', kind: 'food', price: 6, hunger: 10, fun: 20 },
  { id: 'juice-box', name: 'Juice box', aisle: 'icecream', kind: 'food', price: 2, hunger: 5, fun: 4 },
  { id: 'lemonade', name: 'Lemonade', aisle: 'icecream', kind: 'food', price: 2, hunger: 5, fun: 5 },
  { id: 'bubble-tea', name: 'Bubble tea', aisle: 'icecream', kind: 'food', price: 4, hunger: 8, fun: 12 },
  { id: 'hot-choc', name: 'Hot chocolate', aisle: 'icecream', kind: 'food', price: 3, hunger: 8, fun: 10 },
  // Toys for her (they live in her house; click one to play with it)
  { id: 'my-teddy', name: 'Teddy bear', aisle: 'mytoys', kind: 'mytoy', price: 8 },
  { id: 'my-crayons', name: 'Colouring set', aisle: 'mytoys', kind: 'mytoy', price: 6 },
  { id: 'my-yoyo', name: 'Yo-yo', aisle: 'mytoys', kind: 'mytoy', price: 4 },
  { id: 'my-skipping', name: 'Skipping rope', aisle: 'mytoys', kind: 'mytoy', price: 4 },
  { id: 'my-bubbles', name: 'Bubble wand', aisle: 'mytoys', kind: 'mytoy', price: 3 },
  { id: 'my-ukulele', name: 'Ukulele', aisle: 'mytoys', kind: 'mytoy', price: 12 },
  { id: 'my-unicorn-plush', name: 'Unicorn plushie', aisle: 'mytoys', kind: 'mytoy', price: 10 },
  { id: 'my-kite', name: 'Kite', aisle: 'mytoys', kind: 'mytoy', price: 6 },
  // Books (read them on the armchair, kitchen chair or bed)
  { id: 'book-percy', name: 'Percy Jackson', aisle: 'books', kind: 'book', price: 6, cover: '#2f5fb3' },
  { id: 'book-hp', name: 'Harry Potter', aisle: 'books', kind: 'book', price: 6, cover: '#8e2a3a' },
  { id: 'book-ranger', name: "Ranger's Apprentice", aisle: 'books', kind: 'book', price: 6, cover: '#3f7a3a' },
  { id: 'book-tomgates', name: 'Tom Gates', aisle: 'books', kind: 'book', price: 5, cover: '#f2c230' },
  { id: 'book-wimpy', name: 'Diary of a Wimpy Kid', aisle: 'books', kind: 'book', price: 5, cover: '#d9443a' },
  { id: 'book-music', name: 'Music Theory Fun', aisle: 'books', kind: 'book', price: 3, cover: '#7b5bd6' },
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
  { id: 'bakery', name: 'Bakery' },
  { id: 'meals', name: 'Meals' },
  { id: 'sweets', name: 'Sweets' },
  { id: 'icecream', name: 'Ice cream and drinks' },
  { id: 'mytoys', name: 'Toys for me' },
  { id: 'books', name: 'Books' },
  { id: 'pets', name: 'Pet food' },
  { id: 'toys', name: 'Pet toys and home' },
];
export const marketItem = (id) => MARKET.find((m) => m.id === id);
export const isOneOff = (item) => ['toy', 'decor', 'mytoy', 'book'].includes(item.kind);

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
  return { owned: [], active: null, home: [], names: {}, inventory: {}, toys: [], needs: {}, out: {}, gift: null };
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
    if (isOneOff(marketItem(id))) {
      s.pet.toys.push(id);
      if (storable(id)) { s.pet.out = s.pet.out || {}; const room = id.startsWith('my-') ? 'bedroom' : 'living'; if ((s.pet.out[room] || []).length < ROOM_LIMIT) s.pet.out[room] = [...(s.pet.out[room] || []), id]; }
    }
    else s.pet.inventory[id] = (s.pet.inventory[id] || 0) + n;
  }
  return true;
}

export function petName(p, petId) {
  return (p.names && p.names[petId]) || petById(petId)?.name || 'Pet';
}

export { PETS, petById };

// ---------------------------------------------------------------- storage: what is out in each room
export const ROOM_IDS = ['living', 'kitchen', 'bedroom', 'garden'];
export const ROOM_LIMIT = 6; // things out in one room at once (books live on the shelf)
export const storable = (id) => /^(toy-|decor-|my-)/.test(id);

/** Every stored or placed thing she owns, and where it is ('living', … or 'storage'). */
export function whereIs(p, id) {
  for (const r of ROOM_IDS) if ((p.out?.[r] || []).includes(id)) return r;
  return 'storage';
}
export function putOut(s, id, room) {
  const p = s.pet;
  p.out = p.out || {};
  for (const r of ROOM_IDS) p.out[r] = (p.out[r] || []).filter((x) => x !== id);
  if (room === 'storage') return true;
  if ((p.out[room] || []).length >= ROOM_LIMIT) return false;
  p.out[room] = [...(p.out[room] || []), id];
  return true;
}

// ---------------------------------------------------------------- daily surprise gift
export const dayKeyOf = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const giftReady = (p, d = new Date()) => p.gift !== dayKeyOf(d);
const GIFT_TREATS = ['cupcake', 'cookie', 'donut', 'ice-lolly', 'lollipop', 'pf-fish', 'pf-bone', 'pf-seeds', 'macaron', 'strawberry'];
/** Open today's gift: some coins or a couple of treats. Returns a message, or null if already opened. */
export function openGift(s, r = Math.random, d = new Date()) {
  if (!giftReady(s.pet, d)) return null;
  s.pet.gift = dayKeyOf(d);
  if (r() < 0.5) {
    const coins = 15 + Math.floor(r() * 26);
    s.coins += coins;
    return { coins, message: `${coins} coins!` };
  }
  const a = GIFT_TREATS[Math.floor(r() * GIFT_TREATS.length)], b = GIFT_TREATS[Math.floor(r() * GIFT_TREATS.length)];
  s.pet.inventory = s.pet.inventory || {};
  for (const id of [a, b]) s.pet.inventory[id] = (s.pet.inventory[id] || 0) + 1;
  return { items: [a, b], message: `${marketItem(a).name} and ${marketItem(b).name.toLowerCase()}!` };
}

/** How many questions she has answered correctly (pets learn tricks from this). */
export function totalCorrect(s) {
  return Object.values(s.topics || {}).reduce((t, x) => t + (x.correct || 0), 0);
}
