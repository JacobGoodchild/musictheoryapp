// Original avatar art (SVG strings, app-authored). A cute kawaii-style girl built
// from layers: background, back hair, outfit, head + skin, face, front hair,
// hair accessory, accessory, headwear.

export const SLOTS = [
  { id: 'hair', name: 'Hairstyle' },
  { id: 'hairColour', name: 'Hair colour' },
  { id: 'hairAcc', name: 'Hair bits' },
  { id: 'eyes', name: 'Eye colour' },
  { id: 'outfit', name: 'Outfit' },
  { id: 'face', name: 'Face' },
  { id: 'accessory', name: 'Accessory' },
  { id: 'hat', name: 'Headwear' },
  { id: 'background', name: 'Background' },
  { id: 'skin', name: 'Skin' },
];

// Prices are tuned by the economy test (docs/economy.md); PRICE_SCALE shifts them all.
export const PRICE_SCALE = 0.48;
const I = (id, slot, name, price, data = {}) => ({ id, slot, name, price: Math.round((price * PRICE_SCALE) / 5) * 5, ...data });

export const ITEMS = [
  // Skin tones: all free (everyone should look like themselves from day one).
  ...[['#f9d7c0', 'Light'], ['#eabf9b', 'Fair'], ['#c99272', 'Medium'], ['#a86f4c', 'Tan'], ['#7b4a2e', 'Deep'], ['#5a3420', 'Rich']].map(([c, n], i) => I(`skin-${i + 1}`, 'skin', n, 0, { colour: c })),
  // Hair colours: natural shades free, fun colours to unlock.
  I('hc-brown', 'hairColour', 'Brown', 0, { colour: '#6b4128' }),
  I('hc-chestnut', 'hairColour', 'Chestnut', 0, { colour: '#8a4b2a' }),
  I('hc-darkbrown', 'hairColour', 'Dark brown', 0, { colour: '#3f2617' }),
  I('hc-lightbrown', 'hairColour', 'Light brown', 0, { colour: '#a87a52' }),
  I('hc-black', 'hairColour', 'Black', 0, { colour: '#1f1a1a' }),
  I('hc-blonde', 'hairColour', 'Blonde', 0, { colour: '#e2b85c' }),
  I('hc-auburn', 'hairColour', 'Auburn', 40, { colour: '#9c3b22' }),
  I('hc-ginger', 'hairColour', 'Ginger', 40, { colour: '#c4612b' }),
  I('hc-pink', 'hairColour', 'Candy pink', 120, { colour: '#f27aa8' }),
  I('hc-peach', 'hairColour', 'Peach', 120, { colour: '#f6a57f' }),
  I('hc-lilac', 'hairColour', 'Lilac', 150, { colour: '#b48ee8' }),
  I('hc-blue', 'hairColour', 'Ocean blue', 150, { colour: '#4a86e8' }),
  I('hc-mint', 'hairColour', 'Mint', 150, { colour: '#4fc7a3' }),
  I('hc-silver', 'hairColour', 'Silver', 220, { colour: '#c9ccd6' }),
  I('hc-rainbow', 'hairColour', 'Rainbow', 520, { colour: 'url(#rainbow§)' }),
  // Hairstyles (18)
  I('hair-long', 'hair', 'Long and straight', 0),
  I('hair-bob', 'hair', 'Bob with fringe', 0),
  I('hair-ponytail', 'hair', 'Ponytail', 0),
  I('hair-pigtails', 'hair', 'Pigtails', 0),
  I('hair-wavy', 'hair', 'Long waves', 60),
  I('hair-shoulder', 'hair', 'Shoulder length', 60),
  I('hair-pixie', 'hair', 'Pixie cut', 80),
  I('hair-highpony', 'hair', 'High ponytail', 100),
  I('hair-topbun', 'hair', 'Top bun', 100),
  I('hair-braids', 'hair', 'Two braids', 140),
  I('hair-sidebraid', 'hair', 'Side braid', 140),
  I('hair-buns', 'hair', 'Space buns', 160),
  I('hair-twintails', 'hair', 'Twin tails', 180),
  I('hair-halfup', 'hair', 'Half-up bun', 180),
  I('hair-curly', 'hair', 'Long curls', 200),
  I('hair-shortcurls', 'hair', 'Short curls', 160),
  I('hair-puffs', 'hair', 'Curly puffs', 220),
  I('hair-wavybob', 'hair', 'Wavy bob', 120),
  // More long styles
  I('hair-curtain', 'hair', 'Long with curtain bangs', 0),
  I('hair-layered', 'hair', 'Long layers', 40),
  I('hair-sideswept', 'hair', 'Side-swept long', 60),
  I('hair-lob', 'hair', 'Long bob', 60),
  I('hair-wavyfringe', 'hair', 'Waves with a fringe', 80),
  I('hair-lowpony', 'hair', 'Low ponytail', 80),
  I('hair-sidepony', 'hair', 'Side ponytail', 120),
  I('hair-hime', 'hair', 'Straight with side locks', 120),
  I('hair-minibuns', 'hair', 'Long with mini buns', 160),
  I('hair-princess', 'hair', 'Princess curls', 200),
  I('hair-crownbraid', 'hair', 'Braided crown', 220),
  I('hair-mermaid', 'hair', 'Mermaid waves', 260),
  // Eye colours (natural ones free)
  ...[['brown', 'Brown', '#6b4128'], ['darkbrown', 'Dark brown', '#3a2414'], ['hazel', 'Hazel', '#8a6a2a'], ['green', 'Green', '#3f9a5a'], ['blue', 'Blue', '#3f7fd0'], ['grey', 'Grey', '#7a8a96']].map(([id, n, c]) => I(`eye-${id}`, 'eyes', n, 0, { colour: c })),
  I('eye-amber', 'eyes', 'Amber', 60, { colour: '#d08a1c' }),
  I('eye-teal', 'eyes', 'Teal', 100, { colour: '#1aa6a0' }),
  I('eye-violet', 'eyes', 'Violet', 120, { colour: '#8a5be0' }),
  I('eye-pink', 'eyes', 'Pink', 140, { colour: '#f0609a' }),
  I('eye-gold', 'eyes', 'Gold sparkle', 220, { colour: '#e0a800', sparkle: true }),
  // Hair accessories
  I('ha-none', 'hairAcc', 'None', 0),
  I('ha-bow-pink', 'hairAcc', 'Pink bow', 50, { colour: '#ff7eb6' }),
  I('ha-bow-red', 'hairAcc', 'Red bow', 50, { colour: '#e8455a' }),
  I('ha-bigbow', 'hairAcc', 'Big lilac bow', 140, { colour: '#b48ee8', big: true }),
  I('ha-hearts', 'hairAcc', 'Heart clips', 80),
  I('ha-stars', 'hairAcc', 'Star clips', 80),
  I('ha-flower', 'hairAcc', 'Flower clip', 90),
  I('ha-headband', 'hairAcc', 'Headband', 70, { colour: '#4fc7a3' }),
  I('ha-pearls', 'hairAcc', 'Pearl clips', 120),
  I('ha-strawberry', 'hairAcc', 'Strawberry clip', 140),
  I('ha-butterfly', 'hairAcc', 'Butterfly clip', 160),
  // Outfits
  I('tee-pink', 'outfit', 'Pink tee', 0, { colour: '#ff8fb8' }),
  I('tee-lilac', 'outfit', 'Lilac tee', 0, { colour: '#b9a2f0' }),
  I('tee-blue', 'outfit', 'Blue tee', 0, { colour: '#6f9df2' }),
  I('dress-yellow', 'outfit', 'Sunny dress', 80, { colour: '#ffd36e', dress: true }),
  I('pinafore', 'outfit', 'Pinafore', 120, { colour: '#fff4ea', overlay: '#e8607a' }),
  I('cardigan', 'outfit', 'Cosy cardigan', 120, { colour: '#fff', cardigan: '#7fcfb4' }),
  I('hoodie', 'outfit', 'Cosy hoodie', 140, { colour: '#a77ce8', hoodie: true }),
  I('jumper-stripes', 'outfit', 'Stripy jumper', 160, { colour: '#ff9aa8', stripes: '#ffffff88' }),
  I('dungarees', 'outfit', 'Dungarees', 180, { colour: '#fde7f0', overlay: '#6f9df2' }),
  I('sailor', 'outfit', 'Sailor top', 200, { colour: '#fff', collar2: '#3b5bb8' }),
  I('strawberry-dress', 'outfit', 'Strawberry dress', 260, { colour: '#ff6f86', dress: true, dots: '#fff7' }),
  I('tutu', 'outfit', 'Sparkly tutu', 300, { colour: '#ffb6d5', dress: true, tutu: true }),
  I('concert-dress', 'outfit', 'Concert dress', 340, { colour: '#2a2440', dress: true, sparkle: true }),
  I('star-cape', 'outfit', 'Star cape', 420, { colour: '#3a2f80', cape: '#f5c542' }),
  // Faces
  I('smile', 'face', 'Smile', 0),
  I('happy', 'face', 'Happy eyes', 0),
  I('grin', 'face', 'Big grin', 40),
  I('wink', 'face', 'Wink', 60),
  I('cat', 'face', 'Kitty smile', 80),
  I('tongue', 'face', 'Cheeky', 80),
  I('starry', 'face', 'Star eyes', 140),
  I('hearts', 'face', 'Heart eyes', 160),
  // Accessories
  I('acc-none', 'accessory', 'None', 0),
  I('freckles', 'accessory', 'Freckles', 0),
  I('glasses', 'accessory', 'Round glasses', 60),
  I('heart-glasses', 'accessory', 'Heart glasses', 140),
  I('star-glasses', 'accessory', 'Star glasses', 140),
  I('earrings', 'accessory', 'Pearl earrings', 90),
  I('necklace', 'accessory', 'Heart necklace', 110),
  I('choker', 'accessory', 'Bow choker', 100, { colour: '#e8607a' }),
  I('scarf', 'accessory', 'Stripy scarf', 130, { colour: '#ff9e5e' }),
  I('sparkles', 'accessory', 'Cheek sparkles', 120),
  I('note-badge', 'accessory', 'Music note badge', 160),
  // Headwear
  I('hat-none', 'hat', 'Nothing', 0),
  I('bunny', 'hat', 'Bunny ears', 120),
  I('cat-ears', 'hat', 'Cat ears', 120, { colour: '#6b4128' }),
  I('beanie', 'hat', 'Pompom beanie', 90, { colour: '#ff8fb8' }),
  I('beret', 'hat', 'Beret', 120, { colour: '#c0392b' }),
  I('bucket', 'hat', 'Bucket hat', 140, { colour: '#ffd36e' }),
  I('flower-crown', 'hat', 'Flower crown', 180),
  I('headphones', 'hat', 'Headphones', 200, { colour: '#a77ce8' }),
  I('tiara', 'hat', 'Tiara', 260),
  I('witch', 'hat', 'Witch hat', 300, { colour: '#4b3ab0' }),
  I('crown', 'hat', 'Golden crown', 480),
  // Backgrounds
  I('bg-mint', 'background', 'Mint', 0, { a: '#c9f2e3', b: '#9fe3cb' }),
  I('bg-pink', 'background', 'Bubblegum', 0, { a: '#ffe0ee', b: '#ffbcd9' }),
  I('bg-sky', 'background', 'Sky', 0, { a: '#cfe6ff', b: '#9cc8ff' }),
  I('bg-peach', 'background', 'Peach', 40, { a: '#ffe0cc', b: '#ffbf99' }),
  I('bg-lilac', 'background', 'Lilac', 40, { a: '#eadcff', b: '#cbb0ff' }),
  I('bg-dots', 'background', 'Polka dots', 100, { a: '#fff1f6', b: '#ffd6e7', dots: '#ff9cc4' }),
  I('bg-hearts', 'background', 'Hearts', 140, { a: '#ffe9f1', b: '#ffc6dc', hearts: true }),
  I('bg-clouds', 'background', 'Clouds', 140, { a: '#bfe3ff', b: '#e8f5ff', clouds: true }),
  I('bg-candy', 'background', 'Candy stripes', 180, { a: '#fff', b: '#fff', candy: true }),
  I('bg-sunset', 'background', 'Sunset', 200, { a: '#ffb36b', b: '#e85d9a' }),
  I('bg-night', 'background', 'Starry night', 260, { a: '#28205e', b: '#0d0b2b', stars: true }),
  I('bg-rainbow', 'background', 'Rainbow', 360, { a: '#fff7fb', b: '#e9f6ff', rainbow: true }),
];

export const itemById = (id) => ITEMS.find((i) => i.id === id);
export const DEFAULT_EQUIPPED = { background: 'bg-pink', skin: 'skin-2', hair: 'hair-long', hairColour: 'hc-brown', hairAcc: 'ha-none', eyes: 'eye-brown', outfit: 'tee-pink', face: 'smile', hat: 'hat-none', accessory: 'acc-none' };
export const FREE_ITEMS = ITEMS.filter((i) => i.price === 0).map((i) => i.id);

// ---- Hair ------------------------------------------------------------------
// Each style has a back part (behind the body and head) and a front part
// (fringe/top, drawn over the head).
const FRINGE = 'M57 92C57 60 77 42 100 42S143 60 143 92Q137 79 130 74Q100 84 70 74Q63 79 57 92Z';
const SIDE = 'M57 94C55 60 76 41 101 41S145 60 143 94Q140 80 132 72Q116 66 104 70Q84 84 62 84Q59 88 57 94Z';
const MIDDLE = 'M57 98C55 60 76 41 100 41S145 60 143 98Q140 72 100 61Q60 72 57 98Z';
const PARTING = '<path d="M100 43Q99.4 52 100 59" fill="none" stroke="#0003" stroke-width="1.6" stroke-linecap="round"/>';
const PIXIE = 'M55 104C50 60 76 39 100 39S150 60 145 104Q143 86 136 78Q114 70 92 80Q74 86 62 80Q57 92 55 104Z';
const LONG_BACK = 'M54 92C50 58 74 38 100 38S150 58 146 92L152 172Q100 186 48 172Z';
const curls = (pts, r, c) => `<g fill="${c}">${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
const braid = (x0, y0, x1, y1, n, c) => `<g fill="${c}" stroke="#0002" stroke-width="1.5">${Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return `<ellipse cx="${x0 + (x1 - x0) * t}" cy="${y0 + (y1 - y0) * t}" rx="${8 - t * 2}" ry="7"/>`; }).join('')}</g>`;
// A braid that follows the curve of the head, ear to ear over the top.
const crownBraid = (c) => `<g fill="${c}" stroke="#0002" stroke-width="1.5">${Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (1.12 + (0.76 * i) / 10); return `<ellipse cx="${(100 + Math.cos(a) * 41).toFixed(1)}" cy="${(92 + Math.sin(a) * 41).toFixed(1)}" rx="7" ry="5.5" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${(100 + Math.cos(a) * 41).toFixed(1)} ${(92 + Math.sin(a) * 41).toFixed(1)})"/>`; }).join('')}</g>`;
const tie = (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#ff7eb6"/>`;

function hairParts(style, c) {
  const P = (d) => `<path d="${d}" fill="${c}"/>`;
  switch (style) {
    case 'hair-bob': return { back: P('M54 92C50 58 74 38 100 38S150 58 146 92L148 130Q138 138 128 132L72 132Q62 138 52 130Z'), front: P(FRINGE) };
    case 'hair-wavybob': return { back: P('M54 92C50 58 74 38 100 38S150 58 146 92C150 104 144 114 150 126Q140 140 128 132Q100 138 72 132Q60 140 50 126C56 114 50 104 54 92Z'), front: P(SIDE) };
    case 'hair-shoulder': return { back: P('M54 92C50 58 74 38 100 38S150 58 146 92L150 150Q100 160 50 150Z'), front: P(MIDDLE) + PARTING };
    case 'hair-wavy': return { back: P('M54 92C50 58 74 38 100 38S150 58 146 92C152 110 144 124 152 140S146 166 154 176Q100 190 46 176C54 166 44 154 48 140S48 110 54 92Z'), front: P(SIDE) };
    case 'hair-pixie': return { back: '', front: P(PIXIE) };
    case 'hair-ponytail': return { back: P('M136 70C170 64 176 108 160 146C156 124 150 102 134 90Z'), front: P(FRINGE) + tie(138, 72) };
    case 'hair-highpony': return { back: P('M108 40C150 16 176 60 162 116C152 88 138 66 112 54Z'), front: P(SIDE) + tie(112, 42) };
    case 'hair-pigtails': return { back: P('M56 96C52 60 76 40 100 40S148 60 144 96L140 112L60 112Z') + P('M62 96C38 100 30 138 40 166C48 148 54 128 68 116Z') + P('M138 96C162 100 170 138 160 166C152 148 146 128 132 116Z') + tie(56, 98) + tie(144, 98), mid: '', front: P(MIDDLE) + PARTING };
    case 'hair-twintails': return { back: P('M66 58C34 50 22 104 32 148C42 120 50 94 72 76Z') + P('M134 58C166 50 178 104 168 148C158 120 150 94 128 76Z'), front: P(FRINGE) + tie(68, 60) + tie(132, 60) };
    case 'hair-topbun': return { back: '', front: `<circle cx="100" cy="36" r="17" fill="${c}"/>` + P(MIDDLE) + PARTING };
    case 'hair-buns': return { back: '', front: `<circle cx="64" cy="50" r="17" fill="${c}"/><circle cx="136" cy="50" r="17" fill="${c}"/>` + P(MIDDLE) + PARTING };
    case 'hair-halfup': return { back: P(LONG_BACK), front: `<circle cx="100" cy="38" r="12" fill="${c}"/>` + P(SIDE) };
    case 'hair-braids': return { back: P('M56 96C52 60 76 40 100 40S148 60 144 96L140 112L60 112Z'), mid: braid(66, 108, 62, 166, 7, c) + braid(134, 108, 138, 166, 7, c) + tie(62, 172) + tie(138, 172), front: P(MIDDLE) + PARTING };
    case 'hair-sidebraid': return { back: P('M56 96C52 60 76 40 100 40S148 60 144 96L140 112L60 112Z'), mid: braid(68, 110, 74, 174, 8, c) + tie(74, 180), front: P(SIDE) };
    case 'hair-curly': return { back: curls([[56, 78], [52, 100], [54, 122], [56, 144], [62, 166], [144, 78], [148, 100], [146, 122], [144, 144], [138, 166], [100, 170], [80, 172], [120, 172]], 15, c) + P(LONG_BACK), front: curls([[66, 66], [80, 52], [100, 46], [120, 52], [134, 66]], 14, c) + P(FRINGE) };
    case 'hair-shortcurls': return { back: curls([[58, 84], [56, 106], [60, 124], [142, 84], [144, 106], [140, 124]], 13, c), front: curls([[62, 72], [72, 56], [90, 46], [110, 46], [128, 56], [138, 72]], 14, c) + P(PIXIE) };
    case 'hair-puffs': return { back: '', front: curls([[50, 48], [62, 36], [72, 50], [56, 60]], 15, c) + curls([[150, 48], [138, 36], [128, 50], [144, 60]], 15, c) + P(MIDDLE) + PARTING };
    case 'hair-curtain': return { back: P(LONG_BACK), front: P('M57 98C55 60 76 41 100 41S145 60 143 98Q138 80 120 74Q106 72 100 62Q94 72 80 74Q62 80 57 98Z') };
    case 'hair-layered': return { back: P('M54 92C50 58 74 38 100 38S150 58 146 92L150 166Q142 174 134 166Q126 176 118 168Q110 178 100 170Q90 178 82 168Q74 176 66 166Q58 174 50 166Z'), front: P(FRINGE) };
    case 'hair-sideswept': return { back: P(LONG_BACK), front: P(SIDE) };
    case 'hair-lob': return { back: P('M54 92C50 58 74 38 100 38S150 58 146 92L150 146Q100 156 50 146Z'), front: P(SIDE) };
    case 'hair-wavyfringe': return { back: P('M54 92C50 58 74 38 100 38S150 58 146 92C152 110 144 124 152 140S146 166 154 176Q100 190 46 176C54 166 44 154 48 140S48 110 54 92Z'), front: P(FRINGE) };
    case 'hair-lowpony': return { back: P('M56 96C52 60 76 40 100 40S148 60 144 96L140 112L60 112Z'), mid: P('M128 112C150 116 156 138 150 158C146 170 140 178 134 184C138 164 138 142 124 124Z') + tie(130, 116), front: P(MIDDLE) + PARTING };
    case 'hair-sidepony': return { back: P('M70 64C34 66 22 116 32 160C40 130 50 104 74 86Z') + tie(64, 70), front: P(SIDE) };
    case 'hair-hime': return { back: P(LONG_BACK), front: P(FRINGE) + P('M56 84Q53 112 58 138Q65 133 69 124Q66 104 69 84Z') + P('M144 84Q147 112 142 138Q135 133 131 124Q134 104 131 84Z') };
    case 'hair-minibuns': return { back: P(LONG_BACK), front: `<circle cx="70" cy="44" r="11" fill="${c}"/><circle cx="130" cy="44" r="11" fill="${c}"/>` + P(FRINGE) };
    case 'hair-princess': return { back: P(LONG_BACK) + curls([[49, 146], [48, 158], [52, 169], [62, 176], [138, 176], [148, 169], [152, 158], [151, 146]], 9, c), front: P(SIDE) };
    case 'hair-crownbraid': return { back: P(LONG_BACK), front: P(MIDDLE) + PARTING + crownBraid(c) };
    case 'hair-mermaid': return { back: P('M54 92C50 58 74 38 100 38S150 58 146 92C154 112 142 128 154 146S144 176 158 198H42C56 176 46 162 46 146S46 112 54 92Z'), front: P(MIDDLE) + PARTING };
    default: return { back: P(LONG_BACK), front: P(FRINGE) }; // hair-long
  }
}

const bow = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0L-16-9Q-20 0-16 9Z" fill="${c}"/><path d="M0 0L16-9Q20 0 16 9Z" fill="${c}"/><circle r="4.5" fill="${c}" stroke="#0002"/></g>`;
const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 4C-6-2-10 2-8 6S0 12 0 14C0 12 6 10 8 6S6-2 0 4Z" fill="${c}"/>`;
const star = (x, y, r, c, stroke = '#0000') => { const p = []; for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2; const rr = i % 2 ? r * 0.45 : r; p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`); } return `<polygon points="${p.join(' ')}" fill="${c}" stroke="${stroke}" stroke-width="1"/>`; };

function hairAccSVG(a) {
  switch (a.id) {
    case 'ha-bow-pink': case 'ha-bow-red': return bow(128, 54, 0.9, a.colour);
    case 'ha-bigbow': return bow(100, 38, 1.5, a.colour);
    case 'ha-hearts': return heart(72, 60, 0.9, '#ff6f9c') + heart(84, 54, 0.9, '#ff6f9c');
    case 'ha-stars': return star(74, 64, 6, '#ffd84d', '#d9a400') + star(86, 56, 6, '#ffd84d', '#d9a400');
    case 'ha-flower': return `<g transform="translate(130 60)">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="5" ry="8" transform="rotate(${r}) translate(0 -7)" fill="#ffb3cf"/>`).join('')}<circle r="4.5" fill="#ffd84d"/></g>`;
    case 'ha-headband': return `<path d="M60 76C64 48 82 38 100 38S136 48 140 76" stroke="${a.colour}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case 'ha-pearls': return [70, 78, 86].map((x, i) => `<circle cx="${x}" cy="${66 - i * 4}" r="3.5" fill="#fffaf0" stroke="#d8cfc0"/>`).join('');
    case 'ha-strawberry': return '<g transform="translate(130 60)"><path d="M0-6C-10-6-10 4-6 8S0 14 0 14S6 12 6 8S10-6 0-6Z" fill="#ff4f6d"/><path d="M-6-6L0-12L6-6L0-3Z" fill="#4caf50"/><circle cx="-3" cy="2" r="1" fill="#fff"/><circle cx="3" cy="4" r="1" fill="#fff"/><circle cx="0" cy="8" r="1" fill="#fff"/></g>';
    case 'ha-butterfly': return '<g transform="translate(130 58)"><ellipse cx="-7" cy="-4" rx="7" ry="6" fill="#7fc8ff"/><ellipse cx="7" cy="-4" rx="7" ry="6" fill="#7fc8ff"/><ellipse cx="-5" cy="5" rx="5" ry="4" fill="#b48ee8"/><ellipse cx="5" cy="5" rx="5" ry="4" fill="#b48ee8"/><rect x="-1.2" y="-8" width="2.4" height="16" rx="1.2" fill="#3b2f50"/></g>';
    default: return '';
  }
}

// ---- Face --------------------------------------------------------------------
function faceSVG(face, eyeItem = { colour: '#6b4128' }) {
  // Coloured iris, dark pupil, two highlights and lashes.
  const iris = (x) => `<ellipse cx="${x}" cy="98" rx="5.2" ry="6.6" fill="${eyeItem.colour}" stroke="#2a2230" stroke-width="1.4"/><ellipse cx="${x}" cy="99" rx="2.6" ry="3.4" fill="#2a2230"/><circle cx="${x + 1.9}" cy="95.4" r="1.9" fill="#fff"/><circle cx="${x - 1.6}" cy="101.4" r=".9" fill="#fff"/>${eyeItem.sparkle ? `<circle cx="${x - 2}" cy="96" r=".9" fill="#fff8c0"/>` : ''}`;
  const eye = (x) => `${iris(x)}<path d="M${x - 6} 93l-3-3M${x - 4} 91l-2-3.5" stroke="#2a2230" stroke-width="1.6" stroke-linecap="round"/>`;
  const eyeR = (x) => `${iris(x)}<path d="M${x + 6} 93l3-3M${x + 4} 91l2-3.5" stroke="#2a2230" stroke-width="1.6" stroke-linecap="round"/>`;
  const closed = (x) => `<path d="M${x - 6} 99q6-7 12 0" stroke="#2a2230" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const cheeks = '<ellipse cx="76" cy="110" rx="7" ry="4.5" fill="#ff8fa3" opacity=".55"/><ellipse cx="124" cy="110" rx="7" ry="4.5" fill="#ff8fa3" opacity=".55"/>';
  const smile = '<path d="M93 111q7 6 14 0" stroke="#2a2230" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  switch (face) {
    case 'happy': return closed(86) + closed(114) + cheeks + '<path d="M92 109q8 8 16 0z" fill="#d9465f"/>';
    case 'grin': return eye(86) + eyeR(114) + cheeks + '<path d="M90 108q10 12 20 0z" fill="#7a2a3a"/><path d="M93 109q7 4 14 0" fill="#fff"/>';
    case 'wink': return eye(86) + closed(114) + cheeks + smile;
    case 'cat': return eye(86) + eyeR(114) + cheeks + '<path d="M92 109q4 4 8 0q4 4 8 0" stroke="#2a2230" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    case 'tongue': return closed(86) + eyeR(114) + cheeks + '<path d="M92 108q8 8 16 0" stroke="#2a2230" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M98 112q2 7 6 0z" fill="#ff6f86"/>';
    case 'starry': return star(86, 98, 7, '#ffd84d', '#c58a00') + star(114, 98, 7, '#ffd84d', '#c58a00') + cheeks + smile;
    case 'hearts': return heart(86, 92, 0.85, '#ff4f7d') + heart(114, 92, 0.85, '#ff4f7d') + cheeks + smile;
    default: return eye(86) + eyeR(114) + cheeks + smile;
  }
}

// ---- Outfit ------------------------------------------------------------------
function outfitSVG(o) {
  const c = o.colour;
  let s = o.dress
    ? `<path d="M40 200C46 168 70 144 100 144S154 168 160 200Z" fill="${c}"/>`
    : `<path d="M50 200c0-38 22-58 50-58s50 20 50 58z" fill="${c}"/>`;
  if (o.cape) s = `<path d="M38 200c4-40 26-62 62-62s58 22 62 62z" fill="${o.cape}"/>` + `<path d="M50 200c0-38 22-58 50-58s50 20 50 58z" fill="${c}"/>` + star(80, 176, 6, '#f5c542') + star(120, 186, 4.5, '#f5c542');
  if (o.tutu) s += '<path d="M44 186q8-8 14 0q8-8 14 0q8-8 14 0q8-8 14 0q8-8 14 0q8-8 14 0q8-8 14 0v14H44z" fill="#ffd6e8"/>' + [60, 84, 110, 136].map((x, i) => star(x, 168 + (i % 2) * 6, 3, '#fff')).join('');
  if (o.dots) s += [[70, 170], [96, 160], [120, 174], [84, 188], [134, 190], [60, 192]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${o.dots}"/>`).join('');
  if (o.sparkle) s += [[72, 176], [104, 166], [128, 184], [88, 192]].map(([x, y]) => star(x, y, 3.5, '#f5d27a')).join('') + '<path d="M84 146q16 10 32 0" stroke="#f5d27a" stroke-width="2" fill="none"/>';
  if (o.hoodie) s += '<path d="M76 146q24 18 48 0" stroke="#0002" stroke-width="6" fill="none"/><path d="M96 160v18M104 160v18" stroke="#fff9" stroke-width="2"/>';
  if (o.stripes) s += `<clipPath id="body§"><path d="M50 200c0-38 22-58 50-58s50 20 50 58z"/></clipPath><g clip-path="url(#body§)">${[160, 174, 188].map((y) => `<path d="M40 ${y}h120" stroke="${o.stripes}" stroke-width="6"/>`).join('')}</g>`;
  if (o.overlay) s += `<path d="M68 200v-34h64v34z" fill="${o.overlay}"/><path d="M76 166l-6-20M124 166l6-20" stroke="${o.overlay}" stroke-width="6"/><circle cx="80" cy="170" r="3" fill="#ffd84d"/><circle cx="120" cy="170" r="3" fill="#ffd84d"/>` + heart(100, 176, 0.9, '#fff8');
  if (o.cardigan) s += `<path d="M50 200c0-38 22-58 50-58l-12 58z" fill="${o.cardigan}"/><path d="M150 200c0-38-22-58-50-58l12 58z" fill="${o.cardigan}"/>` + [166, 180, 194].map((y) => `<circle cx="${112 - (y - 160) / 9}" cy="${y}" r="2.5" fill="#fff"/>`).join('');
  if (o.collar2) s += `<path d="M78 146l22 22 22-22 8 10-30 22-30-22z" fill="${o.collar2}"/><path d="M95 170l5 8 5-8z" fill="#e8455a"/>`;
  return s;
}

// ---- Accessories -----------------------------------------------------------
function accSVG(a) {
  switch (a.id) {
    case 'freckles': return [[78, 106], [82, 109], [74, 109], [122, 106], [118, 109], [126, 109]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#a0603a"/>`).join('');
    case 'glasses': return '<circle cx="86" cy="98" r="11" fill="#fff3" stroke="#2a2230" stroke-width="2.6"/><circle cx="114" cy="98" r="11" fill="#fff3" stroke="#2a2230" stroke-width="2.6"/><path d="M97 98h6" stroke="#2a2230" stroke-width="2.6"/>';
    case 'heart-glasses': return heart(86, 88, 1.45, '#ff5c8acc') + heart(114, 88, 1.45, '#ff5c8acc') + '<path d="M96 96h8" stroke="#d63c6a" stroke-width="2.4"/>';
    case 'star-glasses': return star(86, 98, 12, '#ffb3d4cc', '#e05595') + star(114, 98, 12, '#ffb3d4cc', '#e05595');
    case 'earrings': return '<circle cx="58" cy="112" r="3.5" fill="#fffaf0" stroke="#d8cfc0"/><circle cx="142" cy="112" r="3.5" fill="#fffaf0" stroke="#d8cfc0"/>';
    case 'necklace': return '<path d="M84 146q16 14 32 0" stroke="#f5c542" stroke-width="1.6" fill="none"/>' + heart(100, 152, 0.7, '#ff4f7d');
    case 'choker': return `<path d="M88 140h24" stroke="${a.colour}" stroke-width="4"/>` + bow(100, 141, 0.45, a.colour);
    case 'scarf': return `<path d="M72 144q28 14 56 0v10q-28 14-56 0z" fill="${a.colour}"/><path d="M116 152l6 28h-12l-2-24z" fill="${a.colour}"/><path d="M80 150q20 10 40 0" stroke="#fff8" stroke-width="2" fill="none"/>`;
    case 'sparkles': return star(70, 104, 4, '#ffd84d') + star(130, 104, 4, '#ffd84d') + star(64, 96, 2.5, '#fff');
    case 'note-badge': return '<circle cx="124" cy="172" r="10" fill="#fff" stroke="#f5c542" stroke-width="3"/><text x="124" y="178" text-anchor="middle" font-family="Bravura" font-size="20" fill="#2a2230"></text>';
    default: return '';
  }
}

// ---- Headwear --------------------------------------------------------------
function hatSVG(h) {
  switch (h.id) {
    case 'bunny': return '<g><ellipse cx="80" cy="30" rx="10" ry="26" fill="#fff" stroke="#e8dce4" stroke-width="2" transform="rotate(-12 80 30)"/><ellipse cx="80" cy="32" rx="5" ry="18" fill="#ffc2d6" transform="rotate(-12 80 32)"/><ellipse cx="120" cy="30" rx="10" ry="26" fill="#fff" stroke="#e8dce4" stroke-width="2" transform="rotate(12 120 30)"/><ellipse cx="120" cy="32" rx="5" ry="18" fill="#ffc2d6" transform="rotate(12 120 32)"/></g>';
    case 'cat-ears': return `<path d="M62 62l6-30 22 18z" fill="${h.colour}"/><path d="M68 54l3-14 10 8z" fill="#ffc2d6"/><path d="M138 62l-6-30-22 18z" fill="${h.colour}"/><path d="M132 54l-3-14-10 8z" fill="#ffc2d6"/>`;
    case 'beanie': return `<path d="M58 80c0-28 18-44 42-44s42 16 42 44z" fill="${h.colour}"/><rect x="56" y="74" width="88" height="12" rx="6" fill="#0002"/><circle cx="100" cy="34" r="9" fill="#fff"/>`;
    case 'beret': return `<ellipse cx="96" cy="56" rx="46" ry="16" fill="${h.colour}" transform="rotate(-10 96 56)"/><rect x="96" y="36" width="4" height="8" fill="${h.colour}"/>`;
    case 'bucket': return `<path d="M66 68l6-26h56l6 26z" fill="${h.colour}"/><path d="M48 72q52-14 104 0q-52 10-104 0z" fill="${h.colour}" stroke="#0001"/>` + [80, 100, 120].map((x) => `<circle cx="${x}" cy="56" r="3" fill="#fff8"/>`).join('');
    case 'flower-crown': return [64, 80, 100, 120, 136].map((x, i) => `<circle cx="${x}" cy="${58 + Math.abs(2 - i) * 2}" r="7" fill="${['#ff8fa3', '#ffd93d', '#b45cff', '#6bcb77', '#4d96ff'][i]}"/><circle cx="${x}" cy="${58 + Math.abs(2 - i) * 2}" r="2.5" fill="#fff"/>`).join('');
    case 'headphones': return `<path d="M56 98c0-36 20-56 44-56s44 20 44 56" stroke="${h.colour}" stroke-width="8" fill="none"/><rect x="46" y="88" width="16" height="28" rx="7" fill="${h.colour}"/><rect x="138" y="88" width="16" height="28" rx="7" fill="${h.colour}"/>` + heart(54, 96, 0.5, '#fff') + heart(146, 96, 0.5, '#fff');
    case 'tiara': return '<path d="M72 56l8-14 10 10 10-16 10 16 10-10 8 14q-28-6-56 0z" fill="#e9eef7" stroke="#b9c3d6" stroke-width="1.5"/><circle cx="100" cy="42" r="3.5" fill="#ff7eb6"/><circle cx="80" cy="48" r="2.5" fill="#7fc8ff"/><circle cx="120" cy="48" r="2.5" fill="#7fc8ff"/>';
    case 'witch': return `<path d="M62 70l40-62 36 62z" fill="${h.colour}"/><ellipse cx="100" cy="70" rx="52" ry="9" fill="${h.colour}"/><rect x="66" y="60" width="68" height="7" fill="#b48ee8"/>` + star(102, 34, 6, '#f5c542');
    case 'crown': return '<path d="M66 64l8-26 14 16 12-22 12 22 14-16 8 26z" fill="#f5c542" stroke="#c58a00" stroke-width="2"/><circle cx="100" cy="52" r="4" fill="#e8457c"/><circle cx="80" cy="56" r="3" fill="#4d96ff"/><circle cx="120" cy="56" r="3" fill="#6bcb77"/>';
    default: return '';
  }
}

function bgSVG(b) {
  let s = `<defs><linearGradient id="bg§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b.a}"/><stop offset="1" stop-color="${b.b}"/></linearGradient><linearGradient id="rainbow§" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".33" stop-color="#ffd93d"/><stop offset=".66" stop-color="#4d96ff"/><stop offset="1" stop-color="#b45cff"/></linearGradient></defs><rect width="200" height="200" fill="url(#bg§)"/>`;
  if (b.dots) s += [[20, 24], [60, 14], [176, 30], [16, 90], [184, 100], [30, 160], [172, 168], [140, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${b.dots}" opacity=".6"/>`).join('');
  if (b.hearts) s += [[22, 26], [174, 30], [18, 120], [180, 128], [40, 176], [160, 182]].map(([x, y]) => heart(x, y, 1.2, '#ff8fb8aa')).join('');
  if (b.clouds) s += '<g fill="#fff" opacity=".9"><ellipse cx="34" cy="40" rx="22" ry="10"/><ellipse cx="48" cy="34" rx="14" ry="10"/><ellipse cx="166" cy="60" rx="22" ry="10"/><ellipse cx="152" cy="54" rx="14" ry="10"/><ellipse cx="30" cy="150" rx="20" ry="9"/></g>';
  if (b.candy) s += Array.from({ length: 12 }, (_, i) => `<path d="M${-40 + i * 24} 200L${40 + i * 24} 0" stroke="${['#ffb3cf', '#bfe8ff', '#fff2a8'][i % 3]}" stroke-width="12"/>`).join('');
  if (b.rainbow) s += ['#ff8a8a', '#ffc97a', '#fff08a', '#9fe6a0', '#8ac6ff', '#c3a3ff'].map((c, i) => `<path d="M${10 + i * 8} 200A${90 - i * 8} ${90 - i * 8} 0 0 1 ${190 - i * 8} 200" stroke="${c}" stroke-width="8" fill="none"/>`).join('');
  if (b.stars) s += [[20, 30], [170, 24], [40, 70], [160, 80], [100, 18], [180, 140], [16, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('');
  return s;
}

/** Full avatar SVG string for an equipped set (missing or retired items use defaults). */
let renderCount = 0;
export function avatarSVG(equipped = {}, { size = 160, label = 'Your avatar' } = {}) {
  // Gradient/clip ids must be unique per drawing, or many avatars on one page share the first one's colours.
  const uid = `av${++renderCount}`;
  const e = { ...DEFAULT_EQUIPPED, ...equipped };
  const get = (slot) => {
    const it = itemById(e[slot]);
    return it && it.slot === slot ? it : itemById(DEFAULT_EQUIPPED[slot]);
  };
  const skin = get('skin').colour;
  const hc = get('hairColour').colour;
  const hair = hairParts(get('hair').id, hc);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${label}">${bgSVG(get('background'))}${hair.back}${outfitSVG(get('outfit'))}${hair.mid || ''}<rect x="90" y="128" width="20" height="18" rx="6" fill="${skin}"/><circle cx="100" cy="96" r="42" fill="${skin}"/><ellipse cx="58" cy="100" rx="6" ry="9" fill="${skin}"/><ellipse cx="142" cy="100" rx="6" ry="9" fill="${skin}"/>${faceSVG(get('face').id, get('eyes'))}${hair.front}<path d="M76 56q12-10 30-11" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".22"/>${hairAccSVG(get('hairAcc'))}${accSVG(get('accessory'))}${hatSVG(get('hat'))}</svg>`.replace(/§/g, uid);
}
