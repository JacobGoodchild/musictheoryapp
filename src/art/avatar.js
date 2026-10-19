// Original avatar art (SVG strings, app-authored). A cute round character built
// from layers: background, body + outfit, head + skin, hair, face, hat, accessory.

export const SLOTS = [
  { id: 'background', name: 'Background' },
  { id: 'skin', name: 'Skin' },
  { id: 'hair', name: 'Hair' },
  { id: 'hairColour', name: 'Hair colour' },
  { id: 'outfit', name: 'Outfit' },
  { id: 'face', name: 'Face' },
  { id: 'hat', name: 'Hat' },
  { id: 'accessory', name: 'Accessory' },
];

// Prices are tuned by the economy test (docs/economy.md); PRICE_SCALE shifts them all.
export const PRICE_SCALE = 0.45;
const I = (id, slot, name, price, data = {}) => ({ id, slot, name, price: Math.round((price * PRICE_SCALE) / 5) * 5, ...data });

export const ITEMS = [
  // Skin tones: all free (everyone should look like themselves from day one).
  ...[['#f9d7c0', 'Light'], ['#eabf9b', 'Fair'], ['#c99272', 'Medium'], ['#a86f4c', 'Tan'], ['#7b4a2e', 'Deep'], ['#5a3420', 'Rich']].map(([c, n], i) => I(`skin-${i + 1}`, 'skin', n, 0, { colour: c })),
  // Hair colours
  I('hc-brown', 'hairColour', 'Brown', 0, { colour: '#5b3a24' }),
  I('hc-black', 'hairColour', 'Black', 0, { colour: '#1f1a1a' }),
  I('hc-blonde', 'hairColour', 'Blonde', 0, { colour: '#e2b85c' }),
  I('hc-ginger', 'hairColour', 'Ginger', 40, { colour: '#c4612b' }),
  I('hc-pink', 'hairColour', 'Candy pink', 120, { colour: '#f27aa8' }),
  I('hc-blue', 'hairColour', 'Ocean blue', 120, { colour: '#4a86e8' }),
  I('hc-purple', 'hairColour', 'Violet', 150, { colour: '#8f5be0' }),
  I('hc-mint', 'hairColour', 'Mint', 150, { colour: '#4fc7a3' }),
  I('hc-silver', 'hairColour', 'Silver', 220, { colour: '#c9ccd6' }),
  I('hc-rainbow', 'hairColour', 'Rainbow', 520, { colour: 'url(#rainbow)' }),
  // Hair styles
  I('hair-short', 'hair', 'Short', 0),
  I('hair-bob', 'hair', 'Bob', 0),
  I('hair-long', 'hair', 'Long', 60),
  I('hair-ponytail', 'hair', 'Ponytail', 90),
  I('hair-buns', 'hair', 'Space buns', 160),
  I('hair-curly', 'hair', 'Curls', 160),
  I('hair-spiky', 'hair', 'Spiky', 140),
  I('hair-braids', 'hair', 'Braids', 220),
  // Outfits
  I('tee-blue', 'outfit', 'Blue tee', 0, { colour: '#5b8def' }),
  I('tee-green', 'outfit', 'Green tee', 50, { colour: '#3aa76d' }),
  I('hoodie', 'outfit', 'Cosy hoodie', 140, { colour: '#8a4fd8', hoodie: true }),
  I('jumper-stripes', 'outfit', 'Stripy jumper', 180, { colour: '#e85d75', stripes: '#fff3' }),
  I('dungarees', 'outfit', 'Dungarees', 220, { colour: '#f5f0e6', overlay: '#4a7bd0' }),
  I('concert-black', 'outfit', 'Concert blacks', 260, { colour: '#22222c', collar: '#fff' }),
  I('piano-jacket', 'outfit', 'Piano-key jacket', 380, { colour: '#1d1d24', keys: true }),
  I('star-cape', 'outfit', 'Star cape', 480, { colour: '#2a2266', cape: '#f5c542' }),
  I('maestro-tails', 'outfit', 'Maestro tails', 650, { colour: '#14141a', collar: '#fff', bow: '#e8457c' }),
  // Faces
  I('smile', 'face', 'Smile', 0),
  I('grin', 'face', 'Big grin', 40),
  I('wink', 'face', 'Wink', 80),
  I('starry', 'face', 'Star eyes', 160),
  I('cool', 'face', 'Cool', 120),
  // Hats
  I('hat-none', 'hat', 'No hat', 0),
  I('beanie', 'hat', 'Beanie', 80, { colour: '#3aa76d' }),
  I('cap', 'hat', 'Cap', 90, { colour: '#e85d75' }),
  I('beret', 'hat', 'Beret', 150, { colour: '#c0392b' }),
  I('flower-crown', 'hat', 'Flower crown', 200),
  I('headphones', 'hat', 'Headphones', 240, { colour: '#5b5bd6' }),
  I('wizard', 'hat', 'Wizard hat', 360, { colour: '#4b3ab0' }),
  I('crown', 'hat', 'Golden crown', 600),
  // Accessories
  I('acc-none', 'accessory', 'None', 0),
  I('glasses', 'accessory', 'Round glasses', 70),
  I('star-glasses', 'accessory', 'Star glasses', 180),
  I('bow-tie', 'accessory', 'Bow tie', 100, { colour: '#e8457c' }),
  I('scarf', 'accessory', 'Scarf', 130, { colour: '#f08c3a' }),
  I('note-badge', 'accessory', 'Quaver badge', 160),
  I('baton', 'accessory', 'Conductor\'s baton', 280),
  I('violin', 'accessory', 'Tiny violin', 420),
  // Backgrounds
  I('bg-mint', 'background', 'Mint', 0, { a: '#c9f2e3', b: '#9fe3cb' }),
  I('bg-sky', 'background', 'Sky', 0, { a: '#cfe6ff', b: '#9cc8ff' }),
  I('bg-peach', 'background', 'Peach', 50, { a: '#ffe0cc', b: '#ffbf99' }),
  I('bg-lilac', 'background', 'Lilac', 50, { a: '#eadcff', b: '#cbb0ff' }),
  I('bg-stave', 'background', 'Stave paper', 150, { a: '#fffdf5', b: '#f3ecd6', stave: true }),
  I('bg-sunset', 'background', 'Sunset', 220, { a: '#ffb36b', b: '#e85d9a' }),
  I('bg-night', 'background', 'Starry night', 300, { a: '#28205e', b: '#0d0b2b', stars: true }),
  I('bg-concert', 'background', 'Concert hall', 450, { a: '#7a1f2b', b: '#3d0f16', curtain: true }),
];

export const itemById = (id) => ITEMS.find((i) => i.id === id);
export const DEFAULT_EQUIPPED = { background: 'bg-mint', skin: 'skin-2', hair: 'hair-short', hairColour: 'hc-brown', outfit: 'tee-blue', face: 'smile', hat: 'hat-none', accessory: 'acc-none' };
export const FREE_ITEMS = ITEMS.filter((i) => i.price === 0).map((i) => i.id);

function hairSVG(style, c) {
  switch (style) {
    case 'hair-bob': return `<path d="M58 92c-4-34 18-54 42-54s46 20 42 54c-2 14-6 26-10 30l-4-34c-14 6-42 6-56 0l-4 34c-4-4-8-16-10-30z" fill="${c}"/>`;
    case 'hair-long': return `<path d="M56 96c-6-38 16-58 44-58s50 20 44 58l2 54c-10 4-20 2-26-2l-2-56c-12 4-40 4-52 0l-2 56c-6 4-16 6-26 2z" fill="${c}"/>`;
    case 'hair-ponytail': return `<path d="M60 88c0-30 18-48 40-48s40 18 40 48c-12-10-28-14-40-14s-28 4-40 14z" fill="${c}"/><path d="M138 70c18 4 22 30 12 50-4-12-8-22-16-28z" fill="${c}"/>`;
    case 'hair-buns': return `<circle cx="66" cy="50" r="16" fill="${c}"/><circle cx="134" cy="50" r="16" fill="${c}"/><path d="M60 88c0-30 18-46 40-46s40 16 40 46c-12-8-28-12-40-12s-28 4-40 12z" fill="${c}"/>`;
    case 'hair-curly': return `<g fill="${c}">${[[64, 74], [74, 56], [92, 46], [110, 46], [128, 56], [138, 74], [60, 92], [140, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15"/>`).join('')}</g>`;
    case 'hair-spiky': return `<path d="M60 86l-2-26 14 10 6-24 12 18 10-24 10 24 12-18 6 24 14-10-2 26c-12-8-28-12-40-12s-28 4-40 12z" fill="${c}"/>`;
    case 'hair-braids': return `<path d="M60 88c0-30 18-48 40-48s40 18 40 48c-12-10-28-14-40-14s-28 4-40 14z" fill="${c}"/><g fill="${c}">${[0, 1, 2, 3].map((i) => `<circle cx="58" cy="${100 + i * 13}" r="7"/><circle cx="142" cy="${100 + i * 13}" r="7"/>`).join('')}</g>`;
    default: return `<path d="M60 88c0-30 18-48 40-48s40 18 40 48c-10-12-26-18-40-18s-30 6-40 18z" fill="${c}"/>`;
  }
}

function faceSVG(face) {
  const eye = (x) => `<ellipse cx="${x}" cy="96" rx="4.5" ry="6" fill="#2a2230"/><circle cx="${x + 1.5}" cy="93.5" r="1.6" fill="#fff"/>`;
  const cheeks = '<circle cx="76" cy="108" r="6" fill="#ff8fa3" opacity=".45"/><circle cx="124" cy="108" r="6" fill="#ff8fa3" opacity=".45"/>';
  switch (face) {
    case 'grin': return eye(86) + eye(114) + cheeks + '<path d="M86 110q14 14 28 0z" fill="#7a2a3a"/><path d="M89 111q11 5 22 0" fill="#fff"/>';
    case 'wink': return eye(86) + '<path d="M108 96q6-5 12 0" stroke="#2a2230" stroke-width="3" fill="none" stroke-linecap="round"/>' + cheeks + '<path d="M90 110q10 8 20 0" stroke="#2a2230" stroke-width="3" fill="none" stroke-linecap="round"/>';
    case 'starry': return '<path d="M86 88l2.5 5.5 6 .8-4.4 4.2 1 6-5.1-2.8-5.1 2.8 1-6-4.4-4.2 6-.8z" fill="#f5c542" stroke="#c58a00"/><path d="M114 88l2.5 5.5 6 .8-4.4 4.2 1 6-5.1-2.8-5.1 2.8 1-6-4.4-4.2 6-.8z" fill="#f5c542" stroke="#c58a00"/>' + cheeks + '<path d="M90 110q10 9 20 0" stroke="#2a2230" stroke-width="3" fill="none" stroke-linecap="round"/>';
    case 'cool': return '<rect x="74" y="88" width="22" height="13" rx="5" fill="#1d1d24"/><rect x="104" y="88" width="22" height="13" rx="5" fill="#1d1d24"/><path d="M96 93h8" stroke="#1d1d24" stroke-width="3"/>' + '<path d="M92 112q8 4 16-1" stroke="#2a2230" stroke-width="3" fill="none" stroke-linecap="round"/>';
    default: return eye(86) + eye(114) + cheeks + '<path d="M90 110q10 8 20 0" stroke="#2a2230" stroke-width="3" fill="none" stroke-linecap="round"/>';
  }
}

function outfitSVG(o) {
  const c = o.colour;
  let s = `<path d="M50 200c0-38 22-58 50-58s50 20 50 58z" fill="${c}"/>`;
  if (o.cape) s = `<path d="M38 200c4-40 26-62 62-62s58 22 62 62z" fill="${o.cape}"/>` + s + '<g fill="#f5c542"><path d="M80 170l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z"/><path d="M118 182l1.5 3.5 3.5.7-2.8 2.4.8 3.6-3-1.9-3 1.9.8-3.6-2.8-2.4 3.5-.7z"/></g>';
  if (o.hoodie) s += `<path d="M76 146q24 18 48 0" stroke="#0002" stroke-width="6" fill="none"/><path d="M96 160v18M104 160v18" stroke="#fff8" stroke-width="2"/>`;
  if (o.stripes) s += [160, 174, 188].map((y) => `<path d="M${54 + (y - 160) / 6} ${y}h${92 - (y - 160) / 3}" stroke="${o.stripes}" stroke-width="6"/>`).join('');
  if (o.overlay) s += `<path d="M70 200v-36h60v36z" fill="${o.overlay}"/><path d="M76 164l-6-20M124 164l6-20" stroke="${o.overlay}" stroke-width="6"/><circle cx="80" cy="168" r="3" fill="#f5c542"/><circle cx="120" cy="168" r="3" fill="#f5c542"/>`;
  if (o.collar) s += `<path d="M86 144l14 16 14-16" fill="${o.collar}"/>`;
  if (o.bow) s += `<path d="M90 156l10 5 10-5v10l-10-5-10 5z" fill="${o.bow}"/>`;
  if (o.keys) s += Array.from({ length: 9 }, (_, i) => `<rect x="${58 + i * 9.5}" y="182" width="8.5" height="18" fill="#fff"/>${i % 7 !== 2 && i % 7 !== 6 && i < 8 ? `<rect x="${64 + i * 9.5}" y="182" width="5" height="11" fill="#111"/>` : ''}`).join('');
  return s;
}

function hatSVG(h) {
  switch (h.id) {
    case 'beanie': return `<path d="M58 80c0-28 18-44 42-44s42 16 42 44z" fill="${h.colour}"/><rect x="56" y="74" width="88" height="12" rx="6" fill="#0002"/><circle cx="100" cy="34" r="8" fill="#fff"/>`;
    case 'cap': return `<path d="M60 76c0-24 18-38 40-38s40 14 40 38z" fill="${h.colour}"/><path d="M98 74h58q-4 8-18 8h-40z" fill="${h.colour}" opacity=".85"/>`;
    case 'beret': return `<ellipse cx="96" cy="58" rx="46" ry="16" fill="${h.colour}" transform="rotate(-10 96 58)"/><rect x="96" y="38" width="4" height="8" fill="${h.colour}"/>`;
    case 'flower-crown': return [64, 80, 100, 120, 136].map((x, i) => `<circle cx="${x}" cy="${62 - Math.abs(2 - i) * -2}" r="7" fill="${['#ff8fa3', '#ffd93d', '#b45cff', '#6bcb77', '#4d96ff'][i]}"/><circle cx="${x}" cy="${62 - Math.abs(2 - i) * -2}" r="2.5" fill="#fff"/>`).join('');
    case 'headphones': return `<path d="M56 98c0-36 20-56 44-56s44 20 44 56" stroke="${h.colour}" stroke-width="8" fill="none"/><rect x="46" y="88" width="16" height="28" rx="7" fill="${h.colour}"/><rect x="138" y="88" width="16" height="28" rx="7" fill="${h.colour}"/>`;
    case 'wizard': return `<path d="M62 70l40-62 36 62z" fill="${h.colour}"/><ellipse cx="100" cy="70" rx="50" ry="9" fill="${h.colour}"/><path d="M100 30l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#f5c542"/>`;
    case 'crown': return '<path d="M66 64l8-26 14 16 12-22 12 22 14-16 8 26z" fill="#f5c542" stroke="#c58a00" stroke-width="2"/><circle cx="100" cy="52" r="4" fill="#e8457c"/><circle cx="80" cy="56" r="3" fill="#4d96ff"/><circle cx="120" cy="56" r="3" fill="#6bcb77"/>';
    default: return '';
  }
}

function accSVG(a) {
  switch (a.id) {
    case 'glasses': return '<circle cx="86" cy="96" r="11" fill="none" stroke="#2a2230" stroke-width="3"/><circle cx="114" cy="96" r="11" fill="none" stroke="#2a2230" stroke-width="3"/><path d="M97 96h6" stroke="#2a2230" stroke-width="3"/>';
    case 'star-glasses': return '<path d="M86 82l4 8 9 1.3-6.5 6.3 1.5 9-8-4.2-8 4.2 1.5-9-6.5-6.3 9-1.3z" fill="#ff6fb1" opacity=".85"/><path d="M114 82l4 8 9 1.3-6.5 6.3 1.5 9-8-4.2-8 4.2 1.5-9-6.5-6.3 9-1.3z" fill="#ff6fb1" opacity=".85"/>';
    case 'bow-tie': return `<path d="M88 150l12 6 12-6v14l-12-6-12 6z" fill="${a.colour}"/><circle cx="100" cy="157" r="3" fill="#0003"/>`;
    case 'scarf': return `<path d="M72 144q28 14 56 0v10q-28 14-56 0z" fill="${a.colour}"/><path d="M116 152l6 28h-12l-2-24z" fill="${a.colour}"/>`;
    case 'note-badge': return '<circle cx="124" cy="172" r="10" fill="#fff" stroke="#f5c542" stroke-width="3"/><text x="124" y="178" text-anchor="middle" font-family="Bravura" font-size="20" fill="#2a2230"></text>';
    case 'baton': return '<path d="M150 186l26-40" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="186" r="5" fill="#8b5a2b"/>';
    case 'violin': return '<g transform="translate(150 166) rotate(-30)"><ellipse cx="0" cy="8" rx="11" ry="15" fill="#b5651d"/><rect x="-3" y="-26" width="6" height="22" fill="#5a3420"/><path d="M0 -4v26" stroke="#f5deb3" stroke-width="1"/></g>';
    default: return '';
  }
}

function bgSVG(b) {
  let s = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b.a}"/><stop offset="1" stop-color="${b.b}"/></linearGradient><linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".33" stop-color="#ffd93d"/><stop offset=".66" stop-color="#4d96ff"/><stop offset="1" stop-color="#b45cff"/></linearGradient></defs><rect width="200" height="200" fill="url(#bg)"/>`;
  if (b.stave) s += [40, 52, 64, 76, 88].map((y) => `<path d="M0 ${y}h200" stroke="#c9b98f" stroke-width="1.2"/>`).join('');
  if (b.stars) s += [[20, 30], [170, 24], [40, 70], [160, 80], [100, 18], [180, 140], [16, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('');
  if (b.curtain) s += '<path d="M0 0h40c-6 60-6 140 0 200H0z" fill="#a8293a"/><path d="M200 0h-40c6 60 6 140 0 200h40z" fill="#a8293a"/><path d="M0 0h200v16H0z" fill="#e0a100"/>';
  return s;
}

/** Full avatar SVG string for an equipped set (missing slots use defaults). */
export function avatarSVG(equipped = {}, { size = 160, label = 'Your avatar' } = {}) {
  const e = { ...DEFAULT_EQUIPPED, ...equipped };
  const get = (slot) => itemById(e[slot]) || itemById(DEFAULT_EQUIPPED[slot]);
  const skin = get('skin').colour;
  const hc = get('hairColour').colour;
  const hairBack = ['hair-long', 'hair-braids'].includes(e.hair) ? hairSVG(e.hair, hc) : '';
  const hairFront = ['hair-long', 'hair-braids'].includes(e.hair) ? `<path d="M60 88c0-30 18-48 40-48s40 18 40 48c-12-10-28-14-40-14s-28 4-40 14z" fill="${hc}"/>` : hairSVG(e.hair, hc);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${label}">${bgSVG(get('background'))}${hairBack}${outfitSVG(get('outfit'))}<rect x="90" y="128" width="20" height="18" rx="6" fill="${skin}"/><circle cx="100" cy="96" r="42" fill="${skin}"/><ellipse cx="58" cy="100" rx="6" ry="9" fill="${skin}"/><ellipse cx="142" cy="100" rx="6" ry="9" fill="${skin}"/>${hairFront}${faceSVG(e.face)}${accSVG(get('accessory'))}${hatSVG(get('hat'))}</svg>`;
}
