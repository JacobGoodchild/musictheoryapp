// The supermarket: a long shop to walk through. The girl pushes her trolley
// with her pets trotting behind, past the fruit and veg stall, the bakery
// counter, the meals fridge, the pick 'n' mix wall, the ice-cream freezer,
// the toy aisle, the book corner, the clothes rail and the pet shop, to the
// checkout. Click the floor (or use ← →) to walk; click anything on display
// to pop it in the trolley. Hanging signs and shelf ends move at different
// speeds as you walk, so the shop has depth.
import { createPet } from './pet-rig.js';
import { createGirl } from './girl-rig.js';
import { itemArt } from './item-art.js';
import { sfx } from '../audio/synth.js';

const NS = 'http://www.w3.org/2000/svg';
const f1 = (n) => Math.round(n * 10) / 10;
const VW = 800, VH = 340, FLOOR = 250, WALK_Y = 322;
const GK = 0.5, PK = 0.5;
const L = '#4a3040';
const ink = `stroke="${L}" stroke-width="2.5" stroke-linejoin="round"`;

function E(parent, tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (parent) parent.appendChild(e);
  return e;
}
function markup(parent, str) {
  const doc = new DOMParser().parseFromString(`<svg xmlns="${NS}">${str}</svg>`, 'image/svg+xml');
  for (const n of [...doc.documentElement.childNodes]) parent.appendChild(document.importNode(n, true));
  return parent;
}
const reducedMotion = () => document.documentElement.dataset.reducedMotion === 'true'
  || (document.documentElement.dataset.reducedMotion !== 'false' && matchMedia('(prefers-reduced-motion: reduce)').matches);

/** The departments along the shop, left to right. aisle = which MARKET aisle they sell. */
export const DEPARTMENTS = [
  { id: 'fruit', name: 'Fruit & Veg', x0: 260, x1: 760, kind: 'crates', colour: '#7fcf6a' },
  { id: 'bakery', name: 'Bakery', x0: 800, x1: 1260, kind: 'counter', colour: '#f2b257' },
  { id: 'meals', name: 'Meals', x0: 1300, x1: 1640, kind: 'fridge', colour: '#6fb8ff' },
  { id: 'sweets', name: "Pick 'n' Mix", x0: 1680, x1: 2060, kind: 'jars', colour: '#ff8fb8' },
  { id: 'icecream', name: 'Frozen & Drinks', x0: 2100, x1: 2560, kind: 'freezer', colour: '#7fd8ff' },
  { id: 'mytoys', name: 'Toys', x0: 2600, x1: 2980, kind: 'pegboard', colour: '#ffb05c' },
  { id: 'books', name: 'Books', x0: 3020, x1: 3300, kind: 'bookcase', colour: '#b28cff' },
  { id: 'clothes', name: 'Clothes', x0: 3340, x1: 3820, kind: 'rail', colour: '#ff7bb0' },
  { id: 'pets', name: 'Pet Food', x0: 3860, x1: 4160, kind: 'shelves', colour: '#c98a52' },
  { id: 'toys', name: 'Pet Toys & Home', x0: 4200, x1: 4600, kind: 'shelves', colour: '#9fd0ff' },
];
const TILL_X = 4800, WORLD = 5050;

// ---------------------------------------------------------------- fixtures (drawn in world coordinates)
function fixture(d) {
  const { x0, x1 } = d, w = x1 - x0, cx = (x0 + x1) / 2;
  switch (d.kind) {
    case 'crates':
      return `<rect x="${x0}" y="150" width="${w}" height="100" fill="#f6e6d4"/>${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${x0 + 10 + i * (w - 20) / 5} 0)"><path d="M0 172l${(w - 20) / 5 - 8} 0 -8 30H8z" fill="#c98a52" ${ink}/><path d="M0 214l${(w - 20) / 5 - 8} 0 -6 34H6z" fill="#b57840" ${ink}/><path d="M6 186h${(w - 20) / 5 - 20}M8 230h${(w - 20) / 5 - 24}" stroke="#a8703f" stroke-width="2"/></g>`).join('')}
        <path d="M${x0} 150h${w}l-14-26h${-(w - 28)}z" fill="#7fcf6a" ${ink}/><path d="M${x0 + 30} 124v-6M${x1 - 30} 124v-6" stroke="${L}" stroke-width="3"/>`;
    case 'counter':
      return `<rect x="${x0}" y="120" width="${w}" height="12" rx="4" fill="#fff" ${ink}/><rect x="${x0}" y="132" width="${w}" height="80" fill="#e8f4ff" fill-opacity=".55" ${ink}/><path d="M${x0} 172h${w}" stroke="#fff" stroke-width="3"/>
        <rect x="${x0}" y="212" width="${w}" height="40" fill="#ffd8b0" ${ink}/>${Array.from({ length: Math.floor(w / 46) }, (_, i) => `<circle cx="${x0 + 23 + i * 46}" cy="232" r="9" fill="#fff" opacity=".6"/>`).join('')}
        <path d="M${x0 + 10} 120q${w / 4} -24 ${w / 2 - 10} 0q${w / 4} -24 ${w / 2 - 10} 0" fill="#ff9ec4" ${ink}/>`;
    case 'fridge':
      return `<rect x="${x0}" y="60" width="${w}" height="190" rx="8" fill="#dfeffd" ${ink}/>${[0, 1, 2].map((i) => `<rect x="${x0 + 8 + i * (w - 16) / 3}" y="70" width="${(w - 16) / 3 - 6}" height="170" rx="6" fill="#bfe6ff" fill-opacity=".45" stroke="#9fc4e8" stroke-width="3"/><rect x="${x0 + 8 + (i + 1) * (w - 16) / 3 - 14}" y="130" width="4" height="40" rx="2" fill="#9fb1d0"/>`).join('')}
        ${[120, 172, 224].map((y) => `<path d="M${x0 + 10} ${y}h${w - 20}" stroke="#c9d6e8" stroke-width="4"/>`).join('')}`;
    case 'jars':
      return `<rect x="${x0}" y="80" width="${w}" height="170" rx="8" fill="#ffe6f0" ${ink}/>${[0, 1, 2].map((r) => `<path d="M${x0 + 8} ${132 + r * 52}h${w - 16}" stroke="#e8b0c8" stroke-width="5"/>`).join('')}
        <circle cx="${x1 - 20}" cy="70" r="22" fill="#ff7bb0" ${ink}/><path d="M${x1 - 20} 92v40" stroke="#fff" stroke-width="5"/>`;
    case 'freezer':
      return `<rect x="${x0}" y="150" width="${w * 0.58}" height="100" rx="8" fill="#fff" ${ink}/><rect x="${x0 + 8}" y="136" width="${w * 0.58 - 16}" height="20" rx="6" fill="#bfe6ff" fill-opacity=".7" ${ink}/>
        <path d="M${x0 + 30} 140l30 12M${x0 + 120} 140l30 12M${x0 + 200} 140l20 8" stroke="#fff" stroke-width="4" opacity=".8"/>
        <rect x="${x0 + w * 0.62}" y="60" width="${w * 0.38}" height="190" rx="8" fill="#e6f6ff" ${ink}/><rect x="${x0 + w * 0.62 + 8}" y="70" width="${w * 0.38 - 16}" height="170" rx="6" fill="#bfe6ff" fill-opacity=".45" stroke="#9fc4e8" stroke-width="3"/>
        ${[120, 172, 224].map((y) => `<path d="M${x0 + w * 0.62 + 10} ${y}h${w * 0.38 - 20}" stroke="#c9d6e8" stroke-width="4"/>`).join('')}`;
    case 'pegboard':
      return `<rect x="${x0}" y="60" width="${w}" height="190" rx="6" fill="#ffe0b8" ${ink}/>${Array.from({ length: 60 }, (_, i) => `<circle cx="${x0 + 16 + (i % 12) * (w - 32) / 11}" cy="${74 + Math.floor(i / 12) * 34}" r="2" fill="#d9a575"/>`).join('')}`;
    case 'bookcase':
      return `<rect x="${x0}" y="60" width="${w}" height="190" rx="6" fill="#c98a52" ${ink}/>${[124, 188, 248].map((y) => `<rect x="${x0 + 6}" y="${y}" width="${w - 12}" height="6" fill="#a8703f"/>`).join('')}
        <ellipse cx="${x1 - 40}" cy="300" rx="40" ry="22" fill="#b28cff" ${ink}/>`;
    case 'rail':
      return `<path d="M${x0 + 10} 250V100M${x1 - 10} 250V100M${x0} 100h${w}" stroke="${L}" stroke-width="8" stroke-linecap="round"/><path d="M${x0 + 10} 250V100M${x1 - 10} 250V100M${x0} 100h${w}" stroke="#c9c3d6" stroke-width="4" stroke-linecap="round"/>
        <rect x="${x0 + w * 0.7}" y="150" width="${w * 0.25}" height="100" rx="6" fill="#fff" fill-opacity=".6" ${ink}/><ellipse cx="${x0 + w * 0.82}" cy="200" rx="${w * 0.08}" ry="36" fill="#e8f4ff" ${ink}/>`;
    default: // shelves
      return `<rect x="${x0}" y="60" width="${w}" height="190" rx="6" fill="#f6e6d4" ${ink}/>${[124, 188, 248].map((y) => `<rect x="${x0 + 4}" y="${y}" width="${w - 8}" height="7" rx="3" fill="#d9c4b0" ${ink}/>`).join('')}`;
  }
}
// Where the items sit on each fixture.
function slots(d, n) {
  const { x0, x1, kind } = d, w = x1 - x0;
  const out = [];
  const grid = (cols, rows, y0, dy, sx = 0) => { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: x0 + 24 + sx + (c + 0.5) * ((w - 48 - sx) / cols), y: y0 + r * dy }); };
  if (kind === 'crates') grid(8, 2, 186, 44);
  else if (kind === 'counter') grid(Math.ceil(n / 2), 2, 156, 44);
  else if (kind === 'freezer') { for (let i = 0; i < 6; i++) out.push({ x: x0 + 30 + i * (w * 0.58 - 60) / 5, y: 186 }); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) out.push({ x: x0 + w * 0.62 + 30 + c * (w * 0.38 - 60), y: 110 + r * 52 }); }
  else if (kind === 'rail') { for (let i = 0; i < n; i++) out.push({ x: x0 + 30 + (i % Math.ceil(n / 2)) * ((w * 0.66) / Math.ceil(n / 2)), y: i < n / 2 ? 140 : 214 }); }
  else if (kind === 'pegboard') grid(Math.ceil(n / 3), 3, 110, 58);
  else grid(Math.ceil(n / 3), 3, 110, 64);
  return out;
}

const SIGN = (x, name, colour) => `<g transform="translate(${x} 0)"><path d="M-70 0v14M70 0v14" stroke="#9a90a8" stroke-width="2"/><rect x="-80" y="14" width="160" height="30" rx="8" fill="${colour}" ${ink}/><text x="0" y="35" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#fff">${name.replace(/'/g, '&#39;')}</text></g>`;

function trolleyArt() {
  return `<g>
    <path d="M-62-96h112l-10 54H-52z" fill="#e8f4ff" fill-opacity=".7" stroke="#7c8fb0" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-50-82h96M-46-66h88M-30-96l4 54M-6-96v54M18-96l-2 54M38-96l-4 54" stroke="#9fb1d0" stroke-width="2.4"/>
    <path d="M-62-96l-14-18h-14" fill="none" stroke="#7c8fb0" stroke-width="6" stroke-linecap="round"/>
    <path d="M-52-42l-4 26h96l4-26" fill="none" stroke="#7c8fb0" stroke-width="5"/>
    <circle cx="-46" cy="-10" r="9" fill="#5a6a88" stroke="${L}" stroke-width="2.5"/><circle cx="30" cy="-10" r="9" fill="#5a6a88" stroke="${L}" stroke-width="2.5"/>
    <rect x="-96" y="-120" width="18" height="10" rx="5" fill="#ff7b8a" stroke="${L}" stroke-width="2"/>
  </g>`;
}
function tillArt() {
  return `<g>
    <path d="M-120 0v-70h240V0z" fill="#9fd0ff" ${ink}/>
    <rect x="-126" y="-80" width="252" height="12" rx="5" fill="#fff" ${ink}/>
    <rect x="-116" y="-66" width="150" height="10" rx="5" fill="#5a6a88"/><path d="M-110-61h140" stroke="#8a9ab8" stroke-width="2" stroke-dasharray="6 6"/>
    <g transform="translate(70 -80)"><rect x="-26" y="-40" width="52" height="40" rx="6" fill="#ff8fb8" ${ink}/><rect x="-18" y="-34" width="36" height="13" rx="3" fill="#e9fff1" stroke="${L}" stroke-width="2"/><text class="till-total" x="0" y="-24" text-anchor="middle" font-size="10" font-weight="800" font-family="system-ui, sans-serif" fill="#2a6a3a">0</text></g>
    <path class="till-beam" d="M40-80l20-30" stroke="#ff3355" stroke-width="3" opacity="0"/>
    <text x="0" y="-26" text-anchor="middle" font-size="16" font-weight="800" font-family="system-ui, sans-serif" fill="#fff">CHECKOUT</text>
  </g>`;
}

/**
 * opts: { pets: [species], equipped, items: (deptId) => [market items], owned: (id) => bool, onPick(item) }
 */
export function createMarketScene(opts) {
  const reduced = reducedMotion();
  const svgEl = E(null, 'svg', { viewBox: `0 0 ${VW} ${VH}`, class: 'market-svg', role: 'group', 'aria-label': 'The supermarket. Click the floor or use the arrow keys to walk; click anything on the shelves to buy it.', tabindex: 0 });
  markup(svgEl, `<defs><pattern id="mtiles" width="48" height="24" patternUnits="userSpaceOnUse"><rect width="48" height="24" fill="#fff"/><rect width="24" height="12" fill="#ffe9f1"/><rect x="24" y="12" width="24" height="12" fill="#ffe9f1"/></pattern>
    <linearGradient id="mwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7e8"/><stop offset="1" stop-color="#ffeedd"/></linearGradient></defs>`);
  const back = E(svgEl, 'g'); // far wall (slow parallax)
  const world = E(svgEl, 'g'); // shop floor and fixtures
  const floorG = E(world, 'g');
  const actors = E(world, 'g');
  const signs = E(svgEl, 'g'); // hanging signs
  const front = E(svgEl, 'g', { 'pointer-events': 'none' }); // near shelf ends (fast parallax)
  const fx = E(svgEl, 'g', { 'pointer-events': 'none' });

  // Far wall: windows into the back of the shop and aisle openings receding into the distance.
  markup(back, `<rect x="-200" y="0" width="${WORLD * 0.6 + 600}" height="${FLOOR}" fill="url(#mwall)"/>`
    + Array.from({ length: 30 }, (_, i) => `<g transform="translate(${i * 110} 0)"><path d="M20 ${FLOOR}V110h50v${FLOOR - 110}" fill="#efe2d0"/><path d="M28 ${FLOOR}V118h34v${FLOOR - 118}" fill="#e6d4be"/>${[130, 160, 190, 220].map((y) => `<path d="M30 ${y}h30" stroke="#d6bfa4" stroke-width="4"/>`).join('')}</g>`).join(''));
  // Floor with tiles in perspective.
 markup(floorG, `<rect x="-100" y="${FLOOR}" width="${WORLD + 200}" height="${VH - FLOOR}" fill="url(#mtiles)"/><path d="M-100 ${FLOOR}h${WORLD + 200}" stroke="#e9d5c2" stroke-width="3"/>
    <g transform="translate(120 ${FLOOR})"><rect x="-90" y="-210" width="180" height="210" rx="6" fill="#bfe6ff" fill-opacity=".6" ${ink}/><path d="M0-210V0" ${ink}/><rect x="-70" y="-20" width="140" height="30" rx="6" fill="#ff9ec4" ${ink}/><text x="0" y="-180" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#4a3040">WELCOME!</text></g>`);
  const fixturesG = E(world, 'g');
  world.insertBefore(fixturesG, actors);
  for (const d of DEPARTMENTS) markup(fixturesG, fixture(d));
  // Checkout.
  const till = E(world, 'g', { transform: `translate(${TILL_X} ${FLOOR + 6}) scale(.9)` });
  world.insertBefore(till, actors);
  markup(till, tillArt());
  const tillTotal = till.querySelector('.till-total');
  const beam = till.querySelector('.till-beam');
  // Hanging signs and near shelf ends.
  markup(signs, DEPARTMENTS.map((d) => SIGN((d.x0 + d.x1) / 2, d.name, d.colour)).join('') + SIGN(TILL_X, 'Checkout', '#7b5bd6'));
  // Near the camera: low baskets and potted plants slide past faster than the shop (depth).
  markup(front, Array.from({ length: 16 }, (_, i) => i % 2
    ? `<g transform="translate(${300 + i * 380} 0)"><path d="M-34 312h68l-8 40h-52z" fill="#ffb86b" ${ink}/><path d="M-34 312h68" stroke="#e8964a" stroke-width="5"/>${[-18, 0, 18].map((x) => `<circle cx="${x}" cy="306" r="9" fill="${['#ff7b8a', '#ffe066', '#7fd88f'][(i + x) % 3 === 0 ? 0 : Math.abs(x) % 3]}" ${ink}/>`).join('')}</g>`
    : `<g transform="translate(${300 + i * 380} 0)"><path d="M-6 300q-24-30-8-56q14 24 8 56M4 300q4-40 30-48q-2 34-30 48" fill="#7fcf6a" ${ink}/><path d="M-22 300h44l-6 44h-32z" fill="#f2a46b" ${ink}/></g>`).join(''));

  // Shop assistants.
  const staff = [
    { x: 1030, equipped: { outfit: 'tee-blue', hair: 'hair-curly', hairColour: 'hc-black', skin: 'skin-4', hat: 'hat-none' }, dept: 'bakery', lines: ['Fresh cakes today!', 'Try a cream puff!'] },
    { x: TILL_X + 160, equipped: { outfit: 'tee-lilac', hair: 'hair-wavy', hairColour: 'hc-red', skin: 'skin-1' }, dept: 'till', lines: ['Hello there!', 'Ready to pay?'] },
  ];
  for (const s of staff) {
    const rig = createGirl(s.equipped);
    const g = E(world, 'g', { transform: `translate(${s.x} ${s.dept === 'till' ? FLOOR - 4 : FLOOR - 6}) scale(.42)` });
    world.insertBefore(g, actors);
    g.appendChild(rig.el);
    rig.pose({ pose: 'stand' });
    s.rig = rig; s.g = g;
  }

  // Items on display.
  const itemEls = new Map();
  function stock() {
    for (const el of itemEls.values()) el.remove();
    itemEls.clear();
    for (const d of DEPARTMENTS) {
      const list = opts.items(d.id);
      const pos = slots(d, list.length);
      list.forEach((item, i) => {
        const p = pos[i]; if (!p) return;
        const owned = opts.owned(item.id);
        const g = E(fixturesG, 'g', { transform: `translate(${f1(p.x)} ${f1(p.y)})`, 'data-shelf-item': item.id, role: 'button', tabindex: owned ? -1 : 0, 'aria-label': `${item.name}, ${item.price} coins${owned ? ' (you have it)' : ''}`, class: `shelf-item${owned ? ' owned' : ''}` });
        E(g, 'rect', { x: -23, y: -42, width: 46, height: 56, fill: 'transparent' });
        const art = E(g, 'g', { transform: 'translate(-21 -40) scale(.35)' });
        markup(art, itemArt(item.id));
        E(g, 'rect', { x: -15, y: 0, width: 30, height: 13, rx: 4, fill: owned ? '#c9c3d6' : '#fff', stroke: L, 'stroke-width': 1.5 });
        const t = E(g, 'text', { x: 0, y: 10, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 800, 'font-family': 'system-ui, sans-serif', fill: L });
        t.textContent = owned ? 'Got it' : `${item.price}c`;
        const pick = () => { if (!owned) { walkTo(p.x - 70, () => reach(item, g)); } };
        g.addEventListener('click', (e) => { e.stopPropagation(); pick(); });
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        itemEls.set(item.id, g);
      });
    }
  }

  // The girl, her trolley and her pets.
  const girlRig = createGirl(opts.equipped);
  const girlG = E(actors, 'g'); girlG.appendChild(girlRig.el);
  const trolley = E(actors, 'g');
  const load = E(trolley, 'g');
  markup(trolley, trolleyArt());
  const pets = (opts.pets || []).slice(0, 4).map((sp, i) => { const rig = createPet(sp); const g = E(actors, 'g'); actors.insertBefore(g, girlG); g.appendChild(rig.el); return { rig, g, x: -140 - i * 60, phase: i, tail: i }; });
  const st = { x: -40, target: 220, phase: 0, mode: 'walk', t: 0, hop: 0, cam: 0, after: null, dir: 1, reachT: 0 };
  if (reduced) { st.x = 220; st.mode = 'idle'; }

  function walkTo(x, after = null) {
    st.target = Math.max(60, Math.min(WORLD - 120, x)); st.mode = 'walk'; st.after = after;
  }
  function reach(item, g) {
    st.reachT = 0.6; sfx('pop');
    // Fly a copy of the item into the trolley.
    const r0 = g.getCTM(), r1 = load.getCTM();
    if (!reduced && r0 && r1) {
      const fly = E(fx, 'g');
      markup(fly, `<g transform="translate(-21 -40) scale(.35)">${itemArt(item.id)}</g>`);
      const sx = r0.e, sy = r0.f, tx = r1.e, ty = r1.f - 30;
      const t0 = performance.now();
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / 500);
        const x = sx + (tx - sx) * k, y = sy + (ty - sy) * k - Math.sin(k * Math.PI) * 60;
        const vb = svgEl.viewBox.baseVal, m = svgEl.getScreenCTM();
        void vb; void m;
        fly.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${f1(1 - k * 0.5)})`);
        if (k < 1 && fly.isConnected) requestAnimationFrame(tick); else fly.remove();
      };
      tick();
    }
    opts.onPick(item);
  }
  function setTrolley(ids) {
    while (load.firstChild) load.firstChild.remove();
    ids.slice(-10).forEach((id, i) => {
      const g = E(load, 'g', { transform: `translate(${-44 + (i % 5) * 20} ${-104 - Math.floor(i / 5) * 18}) scale(.26)` });
      markup(g, `<g transform="translate(-60 -60)">${itemArt(id)}</g>`);
    });
    st.hop = 1;
  }
  function say(text, x, y) {
    const g = E(fx, 'g');
    const w = Math.max(44, text.length * 7.4 + 22);
    E(g, 'rect', { x: -w / 2, y: -34, width: w, height: 28, rx: 14, fill: '#fff', stroke: L, 'stroke-width': 2.2 });
    E(g, 'path', { d: 'M-6 -7l4 9 6-9', fill: '#fff', stroke: L, 'stroke-width': 2.2 });
    const t = E(g, 'text', { x: 0, y: -15, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: L, 'font-family': 'system-ui, sans-serif' });
    t.textContent = text;
    g.dataset.x = x; g.dataset.y = y; g.dataset.t = performance.now();
  }
  /** Walk to the checkout, beep each item, ka-ching, and get a balloon. */
  function checkout(ids, total) {
    return new Promise((resolve) => {
      walkTo(TILL_X - 220, async () => {
        say('Hello! Let me scan those.', TILL_X + 160, FLOOR - 110);
        for (let i = 0; i < ids.length; i++) {
          if (!svgEl.isConnected) break;
          beam.setAttribute('opacity', 1); sfx('beep');
          tillTotal.textContent = String(Math.round(((i + 1) / ids.length) * total));
          await new Promise((r) => setTimeout(r, reduced ? 60 : 220));
          beam.setAttribute('opacity', 0);
          await new Promise((r) => setTimeout(r, reduced ? 20 : 80));
        }
        sfx('kaching');
        say('Thank you! Have a balloon!', TILL_X + 160, FLOOR - 110);
        st.balloon = true;
        setTimeout(resolve, reduced ? 100 : 900);
      });
      if (reduced) { st.x = st.target; }
    });
  }

  // Controls: click the floor to walk, arrow keys to walk.
  svgEl.addEventListener('click', (ev) => {
    const m = svgEl.getScreenCTM(); if (!m) return;
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
    if (p.y > FLOOR - 10) walkTo(p.x + st.cam);
  });
  svgEl.addEventListener('keydown', (ev) => {
    if (ev.target !== svgEl) return;
    if (ev.key === 'ArrowRight') { ev.preventDefault(); walkTo(st.x + 160); }
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); walkTo(st.x - 160); }
  });

  let last = 0, raf = 0, seen = false;
  function frame(ts) {
    if (!svgEl.isConnected) { if (seen) return; raf = requestAnimationFrame(frame); return; }
    seen = true;
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts; st.t += dt;
    const walking = st.mode === 'walk' && Math.abs(st.target - st.x) > 2;
    if (walking) { const d = Math.sign(st.target - st.x); st.dir = d; const gap = Math.abs(st.target - st.x); st.x += d * Math.min(gap, (170 + gap * 1.4) * dt); st.phase += dt * (8 + Math.min(8, gap / 200)); }
    else if (st.mode === 'walk') { st.mode = 'idle'; const a = st.after; st.after = null; if (a) a(); }
    st.hop = Math.max(0, st.hop - dt * 2.5);
    st.reachT = Math.max(0, st.reachT - dt);
    // Camera follows (smoothly), keeping the girl about a third of the way in.
    const want = Math.max(0, Math.min(WORLD - VW, st.x - VW * 0.38));
    st.cam += (want - st.cam) * Math.min(1, dt * (reduced ? 30 : 4));
    world.setAttribute('transform', `translate(${f1(-st.cam)} 0)`);
    back.setAttribute('transform', `translate(${f1(-st.cam * 0.55)} 0)`);
    signs.setAttribute('transform', `translate(${f1(-st.cam * 1.05)} 0)`);
    front.setAttribute('transform', `translate(${f1(-st.cam * 1.35)} 0)`);
    svgEl.dataset.x = f1(st.x);
    // Girl pushes the trolley (or reaches for something).
    girlRig.pose({ pose: st.reachT > 0 ? 'wave' : walking ? 'push' : 'hold', phase: walking ? st.phase : st.t * 2, dir: st.dir });
    girlRig.setFace(st.reachT > 0 ? 'happy' : null);
    girlG.setAttribute('transform', `translate(${f1(st.x)} ${WALK_Y}) scale(${GK})`);
    trolley.setAttribute('transform', `translate(${f1(st.x + st.dir * 76)} ${WALK_Y - 2 - Math.sin(st.hop * Math.PI) * 5}) scale(${f1(st.dir * 0.52)} .52)`);
    if (st.balloon) {
      if (!st.balloonG) { st.balloonG = E(actors, 'g'); markup(st.balloonG, `<path d="M0 0q-6 30 0 60" stroke="${L}" stroke-width="1.5" fill="none"/><ellipse cx="0" cy="-18" rx="16" ry="20" fill="#ff7bb0" ${ink}/><path d="M-6-28q4-6 10-4" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`); }
      st.balloonG.setAttribute('transform', `translate(${f1(st.x + 30)} ${WALK_Y - 150 + Math.sin(st.t * 2) * 4})`);
    }
    // Pets trot behind her.
    pets.forEach((pe, i) => {
      const goal = st.x - st.dir * (90 + i * 55);
      const gap = goal - pe.x;
      const moving = Math.abs(gap) > 6;
      if (moving) { pe.x += Math.sign(gap) * Math.min(Math.abs(gap), (200 + Math.abs(gap) * 1.6) * dt); pe.phase += dt * 11; }
      pe.tail += dt * 2.4;
      pe.rig.pose(moving ? { view: 'move', theta: gap > 0 ? 0 : Math.PI, phase: pe.phase, stride: 1, tailPhase: pe.tail } : { view: 'sit', eyes: st.hop > 0.3 ? 'happy' : 'open', tailPhase: pe.tail, squash: Math.sin(st.hop * Math.PI) * 0.8 });
      pe.g.setAttribute('transform', `translate(${f1(pe.x)} ${WALK_Y + 4}) scale(${PK})`);
    });
    // Speech bubbles (fade after 2.5 s).
    for (const b of [...fx.querySelectorAll('g[data-t]')]) {
      const age = (performance.now() - Number(b.dataset.t)) / 1000;
      b.setAttribute('transform', `translate(${f1(Number(b.dataset.x) - st.cam)} ${b.dataset.y})`);
      b.setAttribute('opacity', age > 2.2 ? Math.max(0, (2.6 - age) / 0.4) : 1);
      if (age > 2.6) b.remove();
    }
    raf = requestAnimationFrame(frame);
  }
  stock();
  raf = requestAnimationFrame(frame);
  setTimeout(() => { if (svgEl.isConnected) say('Welcome to the shop!', 120, 150); }, 600);

  return {
    el: svgEl, setTrolley, checkout, restock: stock,
    goTo: (deptId) => { const d = DEPARTMENTS.find((x) => x.id === deptId); if (d) walkTo(d.x0 + 40); else if (deptId === 'till') walkTo(TILL_X - 220); },
    stop: () => cancelAnimationFrame(raf),
  };
}
