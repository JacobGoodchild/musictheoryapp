// Blind-bag stickers: catalogue, odds, pity rule, duplicates → notes.
import { rng } from '../questions/util.js';

export const RARITIES = [
  { id: 'common', name: 'Common', odds: 54.7, dupeNotes: 15, swapCost: 25, colour: '#7d8597' },
  { id: 'rare', name: 'Rare', odds: 27, dupeNotes: 25, swapCost: 50, colour: '#2f8fd8' },
  { id: 'epic', name: 'Epic', odds: 12, dupeNotes: 50, swapCost: 90, colour: '#8a4fd8' },
  { id: 'legendary', name: 'Legendary', odds: 5, dupeNotes: 100, swapCost: 160, colour: '#e0a100' },
  { id: 'mythic', name: 'Mythic', odds: 1, dupeNotes: 250, swapCost: 280, colour: '#e8457c' },
  // Ultra Mythic: very rare, holographic, and can only come from a bag (never swapped for notes).
  { id: 'ultra', name: 'Ultra Mythic', odds: 0.3, dupeNotes: 500, swapCost: null, colour: '#9b5cff' },
];
export const rarityById = (id) => RARITIES.find((r) => r.id === id);
export const PITY = 10; // guaranteed Epic or better at least every 10 bags

// Each sticker is a cute kawaii food or sweet (original SVG art in src/art/food.js).
const S = (id, name, rarity, set = 'food') => ({ id, name, rarity, art: id, set });
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
  S('kiwi', 'Kiwi', 'common'), S('pineapple', 'Pineapple', 'common'), S('corn', 'Sweetcorn', 'common'),
  S('tomato', 'Tomato', 'common'), S('broccoli', 'Broccoli', 'common'), S('blueberries', 'Blueberries', 'common'),
  S('coconut', 'Coconut', 'common'), S('pretzel', 'Pretzel', 'common'), S('popcorn', 'Popcorn', 'common'),
  S('wrapped-sweet', 'Wrapped Sweet', 'common'), S('gummy-bear', 'Gummy Bear', 'common'), S('marshmallow', 'Marshmallow', 'common'),
  S('jam-jar', 'Jam Jar', 'common'), S('tea-bag', 'Cup of Tea', 'common'), S('lemonade', 'Lemonade', 'common'),
  // Rare (16)
  S('pancakes', 'Pancake Stack', 'rare'), S('waffle', 'Waffle', 'rare'), S('sushi', 'Sushi', 'rare'),
  S('onigiri', 'Onigiri', 'rare'), S('macaron', 'Macaron', 'rare'), S('ice-cream', 'Ice Cream Cone', 'rare'),
  S('pudding', 'Pudding', 'rare'), S('cake-slice', 'Cake Slice', 'rare'), S('cotton-candy', 'Candyfloss', 'rare'),
  S('bubble-tea', 'Bubble Tea', 'rare'), S('burger', 'Burger', 'rare'), S('fries', 'Chips', 'rare'),
  S('pizza', 'Pizza Slice', 'rare'), S('chocolate', 'Chocolate Bar', 'rare'), S('honey', 'Honey Pot', 'rare'),
  S('hot-choc', 'Hot Chocolate', 'rare'),
  S('ramen', 'Ramen', 'rare'), S('dumpling', 'Dumpling', 'rare'), S('taco', 'Taco', 'rare'),
  S('hot-dog', 'Hot Dog', 'rare'), S('sandwich', 'Sandwich', 'rare'), S('cinnamon-roll', 'Cinnamon Roll', 'rare'),
  S('swiss-roll', 'Swiss Roll', 'rare'), S('ice-cream-sandwich', 'Ice Cream Sandwich', 'rare'), S('smoothie', 'Strawberry Smoothie', 'rare'),
  S('mochi-ice-cream', 'Mochi Friends', 'rare'), S('cream-puff', 'Cream Puff', 'rare'),
  // Epic (10)
  S('sundae', 'Sundae', 'epic'), S('birthday-cake', 'Birthday Cake', 'epic'), S('dango', 'Dango', 'epic'),
  S('strawberry-milk', 'Strawberry Milk', 'epic'), S('jelly', 'Wobbly Jelly', 'epic'), S('rainbow-donut', 'Rainbow Donut', 'epic'),
  S('gingerbread', 'Gingerbread Friend', 'epic'), S('boba-star', 'Starry Boba', 'epic'), S('fruit-tart', 'Fruit Tart', 'epic'),
  S('pumpkin', 'Pumpkin', 'epic'),
  S('bento', 'Bento Box', 'epic'), S('macaron-tower', 'Macaron Tower', 'epic'), S('sweet-jar', 'Sweet Jar', 'epic'),
  S('gingerbread-house', 'Gingerbread House', 'epic'), S('bunny-pancakes', 'Bunny Pancakes', 'epic'), S('parfait', 'Parfait', 'epic'),
  S('cherry-pie', 'Cherry Pie', 'epic'), S('picnic-basket', 'Picnic Basket', 'epic'),
  // Legendary (6)
  S('golden-apple', 'Golden Apple', 'legendary'), S('galaxy-donut', 'Galaxy Donut', 'legendary'),
  S('unicorn-ice-cream', 'Unicorn Ice Cream', 'legendary'), S('crown-cupcake', 'Royal Cupcake', 'legendary'),
  S('rainbow-lollipop', 'Rainbow Lollipop', 'legendary'), S('sparkle-strawberry', 'Sparkle Strawberry', 'legendary'),
  S('rainbow-cake-slice', 'Rainbow Cake', 'legendary'), S('crystal-candy', 'Crystal Candy', 'legendary'),
  S('golden-croissant', 'Golden Croissant', 'legendary'), S('starry-macaron', 'Starry Macaron', 'legendary'),
  // Mythic (3)
  S('cosmic-cake', 'Cosmic Cake', 'mythic'), S('rainbow-dragonfruit', 'Rainbow Dragon Fruit', 'mythic'),
  S('golden-teapot', 'Golden Teapot', 'mythic'), S('unicorn-cake', 'Unicorn Cake', 'mythic'), S('galaxy-boba', 'Galaxy Boba', 'mythic'),
];

// Collectable sets beyond food (art in src/art/collect.js).
const NEW_SETS = {
  animals: [['a-kitty', 'Kitty', 'common'], ['a-puppy', 'Puppy', 'common'], ['a-bear', 'Teddy Bear', 'common'], ['a-bunny', 'Bunny', 'common'], ['a-fox', 'Fox', 'common'], ['a-panda', 'Panda', 'common'], ['a-frog', 'Frog', 'common'], ['a-pig', 'Piglet', 'common'], ['a-mouse', 'Mouse', 'common'], ['a-hamster', 'Hamster', 'common'],
    ['a-koala', 'Koala', 'rare'], ['a-owl', 'Owl', 'rare'], ['a-penguin', 'Penguin', 'rare'], ['a-sheep', 'Lamb', 'rare'], ['a-cow', 'Cow', 'rare'], ['a-raccoon', 'Raccoon', 'rare'],
    ['a-tiger', 'Tiger Cub', 'epic'], ['a-lion', 'Lion Cub', 'epic'], ['a-axolotl', 'Axolotl', 'legendary']],
  sea: [['s-fish-blue', 'Blue Fish', 'common'], ['s-fish-pink', 'Pink Fish', 'common'], ['s-starfish', 'Starfish', 'common'], ['s-shell', 'Seashell', 'common'], ['s-crab', 'Crab', 'common'], ['s-clownfish', 'Clownfish', 'common'],
    ['s-jellyfish', 'Jellyfish', 'rare'], ['s-turtle', 'Sea Turtle', 'rare'], ['s-puffer', 'Pufferfish', 'rare'], ['s-octopus', 'Octopus', 'epic'], ['s-seahorse', 'Seahorse', 'epic'], ['s-whale', 'Whale', 'legendary'], ['s-dolphin', 'Dolphin', 'epic']],
  space: [['p-star', 'Star', 'common'], ['p-moon', 'Moon', 'common'], ['p-sun', 'Sunshine', 'common'], ['p-earth', 'Earth', 'common'], ['p-saturn', 'Ringed Planet', 'rare'], ['p-purple-planet', 'Purple Planet', 'rare'],
    ['p-rocket', 'Rocket', 'rare'], ['p-comet', 'Comet', 'rare'], ['p-alien', 'Alien Friend', 'epic'], ['p-ufo', 'UFO', 'epic'], ['p-astro', 'Astronaut', 'legendary'], ['p-galaxy', 'Galaxy', 'mythic']],
  nature: [['n-daisy', 'Daisy', 'common'], ['n-tulip', 'Tulip', 'common'], ['n-leaf', 'Leaf', 'common'], ['n-cloud', 'Cloud', 'common'], ['n-clover', 'Lucky Clover', 'common'], ['n-mushroom', 'Toadstool', 'common'],
    ['n-sunflower', 'Sunflower', 'rare'], ['n-rose', 'Rose', 'rare'], ['n-cactus', 'Cactus', 'rare'], ['n-blossom', 'Cherry Blossom', 'rare'], ['n-lotus', 'Lotus', 'epic'], ['n-rainbow', 'Rainbow', 'epic']],
  music: [['m-crotchet', 'Crotchet', 'common'], ['m-drum', 'Drum', 'common'], ['m-maracas', 'Maracas', 'common'], ['m-flute', 'Flute', 'common'], ['m-xylophone', 'Xylophone', 'common'],
    ['m-trumpet', 'Trumpet', 'rare'], ['m-guitar', 'Guitar', 'rare'], ['m-violin', 'Violin', 'rare'], ['m-piano', 'Piano', 'epic'], ['m-sax', 'Saxophone', 'epic'], ['m-harp', 'Harp', 'legendary'], ['m-treble', 'Quaver Twins', 'legendary']],
  spooky: [['h-pumpkin', 'Jack-o’-lantern', 'common'], ['h-ghost', 'Little Ghost', 'common'], ['h-bat', 'Bat', 'common'], ['h-candy-corn', 'Candy Corn', 'common'], ['h-candy-bucket', 'Trick or Treat', 'common'],
    ['h-witch-hat', 'Witch Hat', 'rare'], ['h-black-cat', 'Black Cat', 'rare'], ['h-spider', 'Spider', 'rare'], ['h-mummy', 'Mummy', 'epic'], ['h-cauldron', 'Cauldron', 'epic'], ['h-lantern', 'Lantern', 'legendary'], ['h-haunted-house', 'Haunted House', 'mythic']],
  treasure: [['t-coin', 'Gold Coin', 'common'], ['t-pearl', 'Pearl', 'rare'], ['t-ring', 'Ring', 'rare'], ['t-crystal', 'Crystal', 'epic'], ['t-diamond', 'Diamond', 'epic'], ['t-wand', 'Magic Wand', 'legendary'], ['t-crown', 'Crown', 'legendary'], ['t-chest', 'Treasure Chest', 'legendary']],
  rides: [['v-car', 'Car', 'common'], ['v-bus', 'Bus', 'common'], ['v-bike', 'Bicycle', 'common'], ['v-boat', 'Sailing Boat', 'rare'], ['v-train', 'Train', 'rare'], ['v-balloon', 'Hot Air Balloon', 'epic']],
  ultra: [['u-holo-unicorn', 'Holo Unicorn', 'ultra'], ['u-galaxy-dragon', 'Galaxy Dragon', 'ultra'], ['u-crystal-clef', 'Crystal Quavers', 'ultra'], ['u-rainbow-phoenix', 'Rainbow Phoenix', 'ultra'], ['u-diamond-kitty', 'Diamond Kitty', 'ultra']],
};
for (const [set, list] of Object.entries(NEW_SETS)) for (const [id, name, rarity] of list) STICKERS.push(S(id, name, rarity, set));

export const SETS = [
  { id: 'food', name: 'Yummy food', bonus: 300 }, { id: 'animals', name: 'Animal friends', bonus: 150 }, { id: 'sea', name: 'Under the sea', bonus: 120 },
  { id: 'space', name: 'Outer space', bonus: 120 }, { id: 'nature', name: 'Garden', bonus: 120 }, { id: 'music', name: 'Music friends', bonus: 120 },
  { id: 'spooky', name: 'Spooky', bonus: 120 }, { id: 'treasure', name: 'Treasure', bonus: 120 }, { id: 'rides', name: 'Let’s go!', bonus: 80 }, { id: 'ultra', name: 'Ultra Mythics', bonus: 500 },
];
export function setProgress(owned, setId) {
  const all = STICKERS.filter((s) => s.set === setId);
  return { have: all.filter((s) => owned[s.id]).length, total: all.length };
}

export const stickerById = (id) => STICKERS.find((s) => s.id === id);

/** Roll a rarity using the shown odds, forcing Epic+ when pity is due. */
export function rollRarity(r, sinceEpic) {
  if (sinceEpic >= PITY - 1) {
    const pool = RARITIES.filter((x) => ['epic', 'legendary', 'mythic', 'ultra'].includes(x.id));
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
  state.sinceEpic = ['epic', 'legendary', 'mythic', 'ultra'].includes(rarity) ? 0 : state.sinceEpic + 1;
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
