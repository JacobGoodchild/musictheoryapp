// The house: rooms where the player's avatar and all her pets live together.
// Every pet has the same brain (no "main" pet). Throw a toy and they all
// race for it; one catches it and brings it back while the others cheer and
// tag along. Commands (feed, cuddle, bedtime, tricks) go to every pet. The
// girl walks where you click, eats with real bites, reads, plays the piano,
// strokes the pets, and talks in speech bubbles with changing expressions.
//
// One SVG, 800×450. The floor has depth: z = 0 at the back wall, 1 at the
// front; things further back are higher up and smaller, and drawn first.
import { createPet } from './pet-rig.js';
import { createGirl } from './girl-rig.js';
import * as P from './props.js';
import { itemArt } from './item-art.js';
import { sfx, playSequence } from '../audio/synth.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 800, FLOOR_TOP = 292, FLOOR_DEPTH = 140;
const U = 0.6; // drawing units → pixels at the front of the room
const CHAIR = 1.15, PROP = 1.5, GIRL = 0.88; // relative sizes
const floorY = (z) => FLOOR_TOP + z * FLOOR_DEPTH;
const depth = (z) => U * (0.74 + 0.36 * z);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const f1 = (n) => Math.round(n * 10) / 10;

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

export const ROOMS = [['living', 'Living room'], ['kitchen', 'Kitchen'], ['bedroom', 'Bedroom'], ['garden', 'Garden']];

/** Halloween decorations from 24 October to 2 November. */
export const isHalloween = (d = new Date()) => (d.getMonth() === 9 && d.getDate() >= 24) || (d.getMonth() === 10 && d.getDate() <= 2);

// Personalities make each pet act a little differently.
const PERSONALITY = {
  'pet-kitten': { play: 0.75, nap: 0.55, speed: 1 },
  'pet-puppy': { play: 1, nap: 0.3, speed: 1.1 },
  'pet-bunny': { play: 0.65, nap: 0.45, speed: 1 },
  'pet-hamster': { play: 0.85, nap: 0.45, speed: 1.05 },
  'pet-chick': { play: 0.6, nap: 0.5, speed: 0.9 },
  'pet-panda': { play: 0.45, nap: 0.85, speed: 0.75 },
  'pet-unicorn': { play: 0.85, nap: 0.35, speed: 1.15 },
};
const PET_WORD = { 'pet-kitten': 'kitty', 'pet-puppy': 'puppy', 'pet-bunny': 'bunny', 'pet-hamster': 'hammy', 'pet-chick': 'chick', 'pet-panda': 'panda', 'pet-unicorn': 'unicorn' };
export const TRICKS = [
  { id: 'sit', name: 'Sit pretty', at: 0 },
  { id: 'spin', name: 'Spin', at: 20 },
  { id: 'jump', name: 'Big jump', at: 50 },
  { id: 'roll', name: 'Roll over', at: 90 },
  { id: 'dance', name: 'Dance', at: 140 },
  { id: 'wave', name: 'High five', at: 200 },
];
const TUNES = [
  [[72, 1], [72, 1], [79, 1], [79, 1], [81, 1], [81, 1], [79, 2], [77, 1], [77, 1], [76, 1], [76, 1], [74, 1], [74, 1], [72, 2]],
  [[76, 1], [74, 1], [72, 1], [74, 1], [76, 1], [76, 1], [76, 2], [74, 1], [74, 1], [74, 2], [76, 1], [79, 1], [79, 2]],
  [[67, 1], [72, 1], [72, 1], [74, 1], [76, 1], [72, 1], [76, 1], [74, 2], [67, 1], [74, 1], [74, 1], [76, 1], [77, 1], [76, 1], [74, 2], [72, 2]],
];

const WALLS = {
  living: '<rect width="48" height="48" fill="#fff1f6"/><circle cx="12" cy="12" r="3" fill="#ffd9e6"/><circle cx="36" cy="36" r="3" fill="#e9defc"/>',
  kitchen: '<rect width="48" height="48" fill="#f2fbff"/><path d="M0 0h48v48H0z" fill="none" stroke="#d6ecf7" stroke-width="3"/><circle cx="24" cy="24" r="3" fill="#ffe3a8"/>',
  bedroom: '<rect width="48" height="48" fill="#f4efff"/><path d="M12 8l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="#e2d6ff"/><circle cx="36" cy="34" r="2.5" fill="#ffd9e6"/>',
};
const FLOORS = { living: ['#e7b98a', '#f3cfa3', '#d9a575'], kitchen: ['#e9e4f2', '#f6f3fb', '#cfc8dd'], bedroom: ['#d9b48e', '#ecc9a0', '#c99a6e'], garden: ['#8fd47a', '#a8e08f', '#7cc066'] };

function windowArt(night) {
  const sky = night
    ? '<rect x="0" y="0" width="150" height="120" fill="#2c2f6b"/><circle cx="110" cy="30" r="14" fill="#fff6c8"/><circle cx="104" cy="26" r="13" fill="#2c2f6b"/>' + [[30, 30], [60, 70], [20, 90], [80, 22], [130, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('')
    : '<rect x="0" y="0" width="150" height="120" fill="#bfe6ff"/><circle cx="118" cy="28" r="15" fill="#ffe27a"/><path d="M20 70q4-14 18-10q8-12 22-2q12 0 10 12z" fill="#fff"/><path d="M78 98q3-10 13-7q6-9 16-1q9 0 7 8z" fill="#fff"/><path d="M0 104q40-16 80 0t70 0v16H0z" fill="#9ad88f"/>';
  return `<g transform="translate(300 52)">
    <rect x="-10" y="-10" width="170" height="140" rx="10" fill="#fff" stroke="#4a3040" stroke-width="3"/>
    <g clip-path="url(#winclip)">${sky}</g>
    <path d="M75 0v120M0 60h150" stroke="#fff" stroke-width="6"/>
    <rect x="0" y="0" width="150" height="120" rx="6" fill="none" stroke="#4a3040" stroke-width="2.5"/>
    <path d="M-26-14q30 60 6 150h-14q8-80-8-150z" fill="#ffa6c1" stroke="#4a3040" stroke-width="3" stroke-linejoin="round"/>
    <path d="M176-14q-30 60-6 150h14q-8-80 8-150z" fill="#ffa6c1" stroke="#4a3040" stroke-width="3" stroke-linejoin="round"/>
    <rect x="-36" y="-20" width="222" height="10" rx="5" fill="#c58a5a" stroke="#4a3040" stroke-width="2.5"/>
  </g>`;
}

function roomArt(night, decor, room, halloween) {
  const defs = `<defs>
    <pattern id="wallp" width="48" height="48" patternUnits="userSpaceOnUse">${WALLS[room] || WALLS.living}</pattern>
    <linearGradient id="floorg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${FLOORS[room][0]}"/><stop offset="1" stop-color="${FLOORS[room][1]}"/></linearGradient>
    <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#1f2260' : '#8fd0ff'}"/><stop offset="1" stop-color="${night ? '#4a3f8a' : '#dff3ff'}"/></linearGradient>
    <clipPath id="winclip"><rect x="0" y="0" width="150" height="120" rx="6"/></clipPath>
  </defs>`;
  const bats = halloween ? P.bat(220, 70, 0.9) + P.bat(560, 50, 0.7) + P.bat(640, 110, 0.8) : '';
  if (room === 'garden') {
    return `${defs}<rect width="${W}" height="${FLOOR_TOP}" fill="url(#skyg)"/>
      ${night ? [[60, 40], [160, 90], [300, 30], [460, 70], [620, 40], [720, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`).join('') + '<circle cx="680" cy="60" r="22" fill="#fff6c8"/>'
    : '<circle cx="690" cy="60" r="28" fill="#ffe27a"/><path d="M90 90q8-22 30-16q12-18 34-4q20 0 16 20z" fill="#fff"/><path d="M420 60q6-16 22-12q10-14 26-2q16 0 12 14z" fill="#fff"/>'}
      <path d="M0 250q120-40 260-10t300 0 240-20V292H0z" fill="#9ad88f"/>
      <rect x="0" y="232" width="${W}" height="60" fill="#f5e2c4"/>${Array.from({ length: 17 }, (_, i) => `<path d="M${i * 48 + 6} 292v-70l12-14 12 14v70z" fill="#fff3e0" stroke="#c9a27a" stroke-width="2"/>`).join('')}
      <path d="M0 252h${W}M0 276h${W}" stroke="#c9a27a" stroke-width="5"/>
      <rect x="0" y="${FLOOR_TOP}" width="${W}" height="${450 - FLOOR_TOP}" fill="url(#floorg)"/>
      ${Array.from({ length: 40 }, (_, i) => `<path d="M${(i * 97) % W} ${f1(floorY(((i * 37) % 100) / 100))}l3-7 3 7" stroke="#6fb85a" stroke-width="2" fill="none"/>`).join('')}${bats}`;
  }
  return `${defs}
  <rect x="0" y="0" width="${W}" height="${FLOOR_TOP}" fill="url(#wallp)"/>
  <rect x="0" y="${FLOOR_TOP}" width="${W}" height="${450 - FLOOR_TOP}" fill="url(#floorg)"/>
  ${[0.12, 0.3, 0.52, 0.78].map((k) => `<path d="M0 ${f1(floorY(k))}H${W}" stroke="${FLOORS[room][2]}" stroke-width="2" opacity=".55"/>`).join('')}
  ${[-3, -2, -1, 0, 1, 2, 3, 4].map((i) => `<path d="M${400 + i * 120} ${FLOOR_TOP}L${400 + i * 190} 450" stroke="${FLOORS[room][2]}" stroke-width="2" opacity=".35"/>`).join('')}
  <rect x="0" y="${FLOOR_TOP - 14}" width="${W}" height="16" fill="#fff" stroke="#ead6df" stroke-width="2"/>
  ${windowArt(night)}
  ${room === 'kitchen' ? `<g transform="translate(150 96)"><circle r="30" fill="#fff" stroke="#4a3040" stroke-width="3"/><path d="M0-18V0l12 8" stroke="#4a3040" stroke-width="3" fill="none" stroke-linecap="round"/></g>`
    : `<g transform="translate(120 110)"><rect x="-36" y="-30" width="72" height="56" rx="4" fill="#fff" stroke="#4a3040" stroke-width="3"/><rect x="-28" y="-22" width="56" height="40" fill="#d8f0e0"/><path d="M-28 18l16-18 12 12 10-8 18 14z" fill="#8fd18f"/><circle cx="14" cy="-10" r="6" fill="#ffe27a"/></g>`}
  ${decor.includes('decor-poster') && room !== 'kitchen' ? `<g transform="translate(560 120)">${P.poster()}</g>` : ''}
  ${decor.includes('decor-lights') && room !== 'kitchen' ? P.fairyLights() : ''}
  ${room === 'kitchen' ? '' : decor.includes('decor-rug') ? `<g transform="translate(400 ${floorY(0.55)})">${P.rainbowRug()}</g>` : `<ellipse cx="400" cy="${floorY(0.55)}" rx="170" ry="40" fill="${room === 'bedroom' ? '#e6dcff' : '#fbe0ea'}" stroke="${room === 'bedroom' ? '#d2c4f5' : '#f1c4d6'}" stroke-width="3"/>`}
  ${bats}`;
}

/**
 * Build the house.
 * opts: { pets: [{ id, name }], room, equipped, out: { decor, toys, myToys } (what is out in this room),
 *   books, tricks (number unlocked), gift (bool), getNeeds(petId), onNeeds(petId, delta), onEvent(name), onGift() }
 */
export function createHouse(opts) {
  const { equipped, room = 'living' } = opts;
  const out = opts.out || {};
  const decor = out.decor || [];
  const halloween = opts.halloween ?? isHalloween();
  const night = (() => { const h = new Date().getHours(); return h < 7 || h >= 19; })();
  const svgEl = E(null, 'svg', { viewBox: `0 0 ${W} 450`, class: 'house-svg', role: 'img', 'aria-label': 'Your house. Click the floor to walk. Drag a toy and let go to throw it. Click a pet to give it a cuddle.' });
  markup(svgEl, roomArt(night, decor, room, halloween));
  const world = E(svgEl, 'g');
  const fxLayer = E(svgEl, 'g', { 'pointer-events': 'none' });
  const reduced = reducedMotion();
  const petList = (opts.pets || []).slice(0, 7);

  // ---------------------------------------------------------------- furniture
  const things = [];
  const place = (el, x, z, scale = 1) => el.setAttribute('transform', `translate(${f1(x)} ${f1(floorY(z))}) scale(${f1(depth(z) * scale * 1000) / 1000})`);
  function addProp(markupStr, x, z, id, scale = 1) {
    const g = E(world, 'g', { 'data-thing': id });
    markup(g, markupStr);
    place(g, x, z, scale);
    const t = { id, el: g, x, z, kind: 'prop' };
    things.push(t);
    return t;
  }
  const seat = room === 'kitchen' ? { x: 560, z: 0.5 } : room === 'bedroom' ? { x: 620, z: 0.14 } : room === 'garden' ? null : { x: 668, z: 0.1 };
  if (room === 'kitchen') {
    addProp(P.fridge(), 680, 0.02, 'fridge', 1.2);
    addProp(P.counter(), 400, 0.0, 'counter', 1.2);
    addProp(P.kitchenTable(), 470, 0.52, 'table', 1.2);
    addProp(P.kitchenChairBack(), seat.x, seat.z - 0.002, 'chair-back', CHAIR);
    addProp(P.kitchenChairFront(), seat.x, seat.z + 0.004, 'chair-front', CHAIR);
  } else if (room === 'bedroom') {
    addProp(P.bedBack(), seat.x, seat.z - 0.002, 'chair-back', CHAIR);
    addProp(P.bedFront(), seat.x, seat.z + 0.004, 'chair-front', CHAIR);
    addProp(P.wardrobe(), 150, 0.0, 'wardrobe', 1.2);
    addProp(P.bookshelf((opts.books || []).map((b) => b.cover)), 380, 0.0, 'bookshelf', 1.2);
  } else if (room === 'garden') {
    addProp(P.tree(), 110, 0.04, 'tree', 1.3);
    addProp(P.flowers(), 300, 0.02, 'flowers', 1.2);
    addProp(P.flowers(), 720, 0.03, 'flowers2', 1.2);
    addProp(P.paddlingPool(), 520, 0.5, 'pool', 1);
  } else {
    addProp(P.armchairBack(), seat.x, seat.z - 0.002, 'chair-back', CHAIR);
    addProp(P.armchairFront(), seat.x, seat.z + 0.004, 'chair-front', CHAIR);
    addProp(P.piano(), 150, 0.03, 'piano', 1.15);
    addProp(P.stool(), 150, 0.16, 'stool', 1.1);
    if (decor.includes('decor-plant')) addProp(P.plant(), 34, 0.02, 'plant', 1.3);
  }
  const pool = room === 'garden' ? { x: 520, z: 0.5 } : null;
  const pianoSpot = room === 'living' ? { x: 150, z: 0.17 } : null;
  if (halloween) {
    addProp(P.pumpkin(), 40, 0.95, 'pumpkin1', 1.1);
    addProp(P.pumpkin(0.8), 770, 0.9, 'pumpkin2', 1);
  }
  // A bed and a bowl for every pet.
  const beds = petList.map((_, i) => ({ x: 70 + i * 82, z: 0.3 + (i % 2) * 0.1 }));
  if (room !== 'garden') beds.forEach((b, i) => addProp(P.petBed(decor.includes('decor-bed')), b.x, b.z - 0.01, `bed-${i}`, 0.75));
  else beds.forEach((b) => { b.z = 0.25; }); // they nap on the grass
  const bowls = petList.map((_, i) => {
    const b = { x: 250 + i * 64, z: 0.94, food: null };
    const t = addProp(P.bowl(), b.x, b.z, `bowl-${i}`, 0.9);
    b.foodG = E(t.el, 'g', { transform: 'translate(0 -27) scale(.22)' });
    return b;
  });
  // Her own toys that are out in this room; click one to play with it.
  const myToys = (out.myToys || []).slice(0, 6).map((id, i) => {
    const x = room === 'bedroom' ? 470 + i * 46 : 520 + i * 48, z = room === 'bedroom' ? 0.62 + (i % 2) * 0.12 : 0.72 + (i % 2) * 0.12;
    const t = addProp(`<g transform="translate(-30 -60) scale(.5)">${itemArt(id)}</g>`, x, z, `mytoy-${id}`, 1);
    t.el.setAttribute('data-mytoy', id); t.el.style.cursor = 'pointer';
    return { id, x, z, el: t.el };
  });
  // Each pet's own special toy, in the living room (one per kind of pet).
  const species = [...new Set(petList.map((p) => p.id))];
  const specialSpots = [{ x: 470, z: 0.06 }, { x: 560, z: 0.05 }, { x: 380, z: 0.07 }, { x: 280, z: 0.05 }, { x: 760, z: 0.3 }, { x: 40, z: 0.45 }, { x: 760, z: 0.6 }];
  const specials = {};
  if (room === 'living') {
    species.forEach((sp, i) => {
      const def = P.SPECIES_PROP[sp]; if (!def) return;
      const pos = specialSpots[i];
      addProp(def.back(), pos.x, pos.z - 0.003, `special-${sp}`, PROP);
      let spokes = null;
      if (def.spokes) {
        const st = addProp('', pos.x, pos.z - 0.002, `spokes-${sp}`, PROP);
        spokes = E(st.el, 'g'); markup(spokes, def.spokes());
        addProp(def.front(), pos.x, pos.z + 0.003, `special-front-${sp}`, PROP);
      }
      specials[sp] = { ...pos, spokes };
    });
  }
  let giftT = null;
  if (opts.gift) {
    giftT = addProp(P.giftBox(), 740, 0.8, 'gift', 1);
    giftT.el.style.cursor = 'pointer'; giftT.el.setAttribute('data-gift', '1');
  }

  // ---------------------------------------------------------------- throwable toys
  const throwables = ['toy-ball', ...(out.toys || []).filter((t) => P.TOYS[t] && t !== 'toy-ball')].slice(0, 4);
  const items = throwables.map((id, i) => {
    const def = P.TOYS[id];
    const shadow = E(world, 'ellipse', { rx: def.r * 0.9, ry: def.r * 0.28, fill: '#00000022' });
    const g = E(world, 'g', { class: 'house-toy', 'data-toy': id, style: 'cursor:grab' });
    const spin = E(g, 'g');
    markup(spin, def.art());
    const it = { id, def, x: 360 + i * 70, z: 0.7 - (i % 3) * 0.12, h: 0, vx: 0, vz: 0, vh: 0, rot: 0, held: null, el: g, spin, shadow, kind: 'toy', lastThrow: -99 };
    things.push(it);
    return it;
  });
  const ball = items[0];

  // ---------------------------------------------------------------- pets
  const pets = petList.map((info, i) => {
    const rig = createPet(info.id);
    const g = E(world, 'g', { class: 'house-pet', 'data-pet': info.id, 'data-idx': i, style: 'cursor:pointer' });
    const shadow = E(g, 'ellipse', { cx: 0, cy: 0, rx: 34, ry: 8, fill: '#00000022' });
    const inner = E(g, 'g');
    inner.appendChild(rig.el);
    const pe = { idx: i, id: `pet-${i}`, species: info.id, name: info.name || 'Pet', kind: 'pet', rig, el: g, inner, shadow, pers: PERSONALITY[info.id] || PERSONALITY['pet-kitten'],
      x: 220 + i * 90, z: 0.45 + (i % 3) * 0.15, theta: i % 2 ? Math.PI : 0, targetTheta: i % 2 ? Math.PI : 0, phase: i, tailPhase: i * 1.3, stride: 0,
      state: 'idle', t: 0, dur: 1 + i * 0.7, sub: null, carrying: null, eyes: 'open', mouth: 'smile', look: 0, lick: 0, headDy: 0, blink: 1 + i, squash: 0, roll: 0, hop: 0,
      target: null, then: null, speed: 70, after: null, eatT: 0 };
    things.push(pe);
    return pe;
  });

  // ---------------------------------------------------------------- the girl
  const girlRig = createGirl(equipped);
  const girlG = E(world, 'g', { class: 'house-girl', style: 'cursor:pointer' });
  E(girlG, 'ellipse', { cx: 0, cy: 0, rx: 40, ry: 9, fill: '#00000022' });
  girlG.appendChild(girlRig.el);
  const handItem = E(girlRig.el, 'g', { display: 'none' });
  const girl = { kind: 'girl', id: 'girl', el: girlG, x: 640, z: 0.8, dir: -1, phase: 0, state: 'idle', t: 0, dur: 3, target: null, then: null, pose: 'stand', holding: null, throwT: 0, stroke: 0, queue: [], face: null, faceT: 0, lift: 0 };
  things.push(girl);

  // ---------------------------------------------------------------- effects and speech
  const fx = [];
  function heart(x, y, colour = '#ff5c8a') {
    const g = E(fxLayer, 'path', { d: P.heartPath(0, 0, 0.9), fill: colour, stroke: '#fff', 'stroke-width': 1.5 });
    fx.push({ el: g, x: x + rand(-8, 8), y, vy: -38, life: 1.3, t: 0, kind: 'heart' });
  }
  function note(x, y) {
    const g = E(fxLayer, 'g');
    markup(g, `<path d="M0 0v-16l9-3v14" stroke="#7b5bd6" stroke-width="2.4" fill="none"/><ellipse cx="-3" cy="0" rx="4" ry="3" fill="#7b5bd6"/><ellipse cx="6" cy="-5" rx="4" ry="3" fill="#7b5bd6"/>`);
    fx.push({ el: g, x: x + rand(-10, 10), y, vy: -30, vx: rand(-10, 10), life: 1.6, t: 0, kind: 'note' });
  }
  function zzz(x, y) {
    const g = E(fxLayer, 'text', { 'font-size': 18, 'font-weight': 800, fill: '#7b6bd6', 'font-family': 'system-ui, sans-serif' });
    g.textContent = 'z';
    fx.push({ el: g, x, y, vy: -18, vx: 10, life: 2.2, t: 0, kind: 'z' });
  }
  function sparkle(x, y) {
    const cols = ['#ff7b8a', '#ffe066', '#7fd88f', '#6fb8ff', '#b28cff'];
    const g = E(fxLayer, 'path', { d: 'M0-7l2 5 5 2-5 2-2 5-2-5-5-2 5-2z', fill: cols[Math.floor(Math.random() * 5)] });
    fx.push({ el: g, x: x + rand(-14, 14), y: y + rand(-10, 6), vy: -20, life: 1, t: 0, kind: 'spark' });
  }
  function crumb(x, y, colour = '#e8b46a') {
    const g = E(fxLayer, 'circle', { r: 2.4, fill: colour });
    fx.push({ el: g, x: x + rand(-6, 6), y, vy: -40, vx: rand(-40, 40), g: 300, life: 0.7, t: 0, kind: 'crumb' });
  }
  function splash(x, y) {
    const g = E(fxLayer, 'circle', { r: 3, fill: '#9fdcff' });
    fx.push({ el: g, x: x + rand(-10, 10), y, vy: -90, vx: rand(-50, 50), g: 320, life: 0.6, t: 0, kind: 'crumb' });
  }
  // Speech bubbles (girl) and thought bubbles (pets), following the speaker.
  const bubbles = new Map();
  function say(who, text, life = 2.6) {
    const old = bubbles.get(who); if (old) old.el.remove();
    const g = E(fxLayer, 'g', { class: 'speech' });
    const w = Math.max(44, text.length * 7.4 + 22);
    E(g, 'rect', { x: -w / 2, y: -34, width: w, height: 28, rx: 14, fill: '#fff', stroke: '#4a3040', 'stroke-width': 2.2 });
    E(g, 'path', { d: 'M-6 -7l4 9 6-9', fill: '#fff', stroke: '#4a3040', 'stroke-width': 2.2, 'stroke-linejoin': 'round' });
    E(g, 'path', { d: 'M-5 -8h10', stroke: '#fff', 'stroke-width': 3 });
    const tx = E(g, 'text', { x: 0, y: -15, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#4a3040', 'font-family': 'system-ui, sans-serif' });
    tx.textContent = text;
    bubbles.set(who, { el: g, who, life, t: 0 });
    if (who === girl) svgEl.dataset.said = text;
  }
  function think(pe, markupStr) {
    const old = bubbles.get(pe); if (old) old.el.remove();
    const g = E(fxLayer, 'g');
    markup(g, `<ellipse cx="0" cy="-30" rx="24" ry="20" fill="#fff" stroke="#4a3040" stroke-width="2.4"/><circle cx="-10" cy="-4" r="4.5" fill="#fff" stroke="#4a3040" stroke-width="2"/><circle cx="-15" cy="5" r="2.6" fill="#fff" stroke="#4a3040" stroke-width="2"/><g transform="translate(-16 -46) scale(.27)">${markupStr}</g>`);
    bubbles.set(pe, { el: g, who: pe, life: 2.8, t: 0 });
  }
  function setFace(f, secs = 1.6) { girl.face = f; girl.faceT = secs; }

  // ---------------------------------------------------------------- helpers
  const lastUser = { t: -99 };
  let clock = 0;
  const emit = (name) => { if (opts.onEvent) opts.onEvent(name); svgEl.dataset.lastEvent = name; };
  const needs = (pe, d) => { if (opts.onNeeds) opts.onNeeds(pe.species, d); };
  const getNeeds = (pe) => (opts.getNeeds ? opts.getNeeds(pe.species) : { hunger: 70, fun: 70, energy: 80 });
  const headY = (pe) => floorY(pe.z) - 100 * depth(pe.z) - (pe.hop || 0);
  const awake = (pe) => !['sleep', 'eat'].includes(pe.state);

  function setState(pe, state, dur = 2, extra = {}) {
    pe.state = state; pe.t = 0; pe.dur = dur;
    Object.assign(pe, { sub: null, lick: 0, headDy: 0, eyes: 'open', mouth: 'smile', roll: 0, hop: 0, after: null }, extra);
    if (pe.idx === 0) svgEl.dataset.petState = state;
    svgEl.dataset.petStates = pets.map((p) => p.state).join(',');
  }
  function walkTo(pe, x, z, then, speed = 70) {
    pe.target = { x: clamp(x, 40, W - 40), z: clamp(z, 0.05, 0.98) };
    pe.then = then; pe.speed = speed * pe.pers.speed;
    setState(pe, 'walk', 14); // never walk for ever
  }
  function setGirlState(state, dur = 3, extra = {}) {
    girl.state = state; girl.t = 0; girl.dur = dur; Object.assign(girl, extra);
    svgEl.dataset.girlState = state;
  }
  function girlWalkTo(x, z, then, speed = 85) {
    girl.target = { x: clamp(x, 50, W - 50), z: clamp(z, 0.05, 0.98) }; girl.then = then; girl.speed = speed;
    setGirlState('walk', 14);
  }
  function moveToward(a, target, speed, dt) {
    const dx = target.x - a.x, dz = (target.z - a.z) * FLOOR_DEPTH * 1.6;
    const d = Math.hypot(dx, dz);
    if (d < 4) return true;
    const step = Math.min(d, speed * dt);
    a.x += (dx / d) * step; a.z += ((dz / d) * step) / (FLOOR_DEPTH * 1.6);
    return false;
  }
  // Gently push pets apart so they never stand inside each other.
  function separate(dt) {
    for (let i = 0; i < pets.length; i++) {
      for (let j = i + 1; j < pets.length; j++) {
        const a = pets[i], b = pets[j];
        if (a.state === 'sleep' || b.state === 'sleep' || a.state === 'wheel' || b.state === 'wheel') continue;
        const dx = b.x - a.x, dz = (b.z - a.z) * FLOOR_DEPTH * 1.6;
        const d = Math.hypot(dx, dz) || 0.01;
        if (d < 46) {
          const push = (46 - d) * 2.5 * dt;
          const ux = dx / d, uz = dz / d / (FLOOR_DEPTH * 1.6);
          a.x -= ux * push; b.x += ux * push; a.z = clamp(a.z - uz * push, 0.05, 1); b.z = clamp(b.z + uz * push, 0.05, 1);
        }
      }
    }
  }

  // ---------------------------------------------------------------- pet brain (the same for every pet)
  function idleChoice(pe) {
    const n = getNeeds(pe);
    if (n.energy < 25) { goSleep(pe); return; }
    if (reduced) { setState(pe, 'idle', 6); return; }
    if (n.hunger < 30 && Math.random() < 0.4) think(pe, itemArt('pf-kibble'));
    else if (n.fun < 30 && Math.random() < 0.4) think(pe, `<g transform="translate(60 60) scale(2.4)">${P.TOYS['toy-ball'].art()}</g>`);
    const r = Math.random();
    const loose = items.filter((it) => !it.held);
    if (r < 0.3) walkTo(pe, rand(80, 720), rand(0.25, 0.95), () => setState(pe, 'idle', rand(2, 4)));
    else if (r < 0.48) doSpecial(pe);
    else if (r < 0.58 * pe.pers.play + 0.1 && loose.length) { const it = loose[Math.floor(Math.random() * loose.length)]; walkTo(pe, it.x - 30, it.z, () => batToy(pe, it), 90); }
    else if (r < 0.66) { const other = pets.find((o) => o !== pe && awake(o)); if (other) walkTo(pe, other.x + (Math.random() < 0.5 ? -50 : 50), other.z, () => { setState(pe, 'idle', 2, { eyes: 'happy' }); pe.targetTheta = other.x > pe.x ? 0 : Math.PI; }); else setState(pe, 'idle', 3); }
    else if (r < 0.66 + 0.12 * pe.pers.nap) goSleep(pe, rand(10, 16));
    else setState(pe, 'idle', rand(3, 6));
  }
  function goSleep(pe, dur = rand(16, 24)) {
    const b = beds[pe.idx];
    walkTo(pe, b.x, b.z, () => setState(pe, 'sleep', dur), 60);
  }
  function wakeThen(pe, fn) { if (pe.state === 'sleep') { setState(pe, 'wake', 0.9); pe.after = fn; } else fn(); }
  function batToy(pe, it) {
    if (it.held) { setState(pe, 'idle', 2); return; }
    setState(pe, 'bat', 0.5);
    it.vx = rand(150, 260) * (it.x > pe.x ? 1 : -1); it.vh = 160; it.vz = rand(-0.4, 0.4);
    sfx('boing'); emit('bat');
    needs(pe, { fun: 2 });
  }
  function doSpecial(pe) {
    const sp = pe.species, spot = specials[sp];
    if (pool && Math.random() < 0.6) { walkTo(pe, pool.x + rand(-60, 60), pool.z, () => setState(pe, 'splash', 3)); return; }
    if (!spot) { if (sp === 'pet-puppy') setState(pe, 'spin', 2.4); else if (sp === 'pet-panda') setState(pe, 'roll', 1.6); else setState(pe, 'binky', 2.2); return; }
    if (sp === 'pet-hamster') walkTo(pe, spot.x, spot.z + 0.05, () => { if (pets.some((o) => o !== pe && o.state === 'wheel')) setState(pe, 'idle', 2); else setState(pe, 'wheel', rand(5, 8)); });
    else if (sp === 'pet-puppy') setState(pe, 'spin', 2.4);
    else if (sp === 'pet-bunny') Math.random() < 0.5 ? setState(pe, 'binky', 2.2) : walkTo(pe, spot.x - 10, spot.z + 0.12, () => setState(pe, 'nibble', 4));
    else if (sp === 'pet-chick') walkTo(pe, spot.x + 20, spot.z + 0.12, () => setState(pe, 'peck', 4));
    else if (sp === 'pet-panda') Math.random() < 0.5 ? setState(pe, 'roll', 1.6) : walkTo(pe, spot.x - 40, spot.z + 0.12, () => setState(pe, 'nibble', 4.5));
    else if (sp === 'pet-unicorn') walkTo(pe, spot.x - 70, spot.z + 0.1, () => { pe.target = { x: spot.x + 70, z: spot.z + 0.1 }; setState(pe, 'prance', 3); });
    else walkTo(pe, spot.x - 34, spot.z + 0.1, () => setState(pe, 'scratch', 3));
  }
  // A toy was thrown: everyone who is awake and in the mood runs for it.
  function chaseAll(it) {
    for (const pe of pets) {
      if (pe.state === 'eat' || pe.state === 'stroked' || pe.carrying) continue;
      if (pe.state === 'sleep' && Math.random() > pe.pers.play * 0.6) continue;
      wakeThen(pe, () => { pe.chasing = it; setState(pe, 'chase', 10); });
    }
  }
  function caught(winner, it) {
    it.held = winner; it.vx = it.vz = it.vh = 0;
    winner.carrying = it;
    sfx('squeak'); emit('pickup');
    needs(winner, { fun: 5, energy: -1 });
    const gside = girl.x > winner.x ? -1 : 1;
    walkTo(winner, girl.x + gside * 58, girl.state === 'sit' || girl.state === 'read' ? girl.z + 0.12 : girl.z, () => dropToy(winner), 110);
    winner.state = 'fetch';
    // Everyone else: a happy little bounce, then trot along behind.
    for (const pe of pets) {
      if (pe === winner || pe.state !== 'chase') continue;
      setState(pe, 'cheer', rand(0.8, 1.4), { eyes: 'happy', mouth: 'open' });
      pe.after = () => walkTo(pe, winner.x + rand(-80, 80), clamp(winner.z + rand(-0.15, 0.15), 0.1, 1), () => setState(pe, 'idle', rand(1.5, 3)), 90);
    }
  }
  function dropToy(pe) {
    const it = pe.carrying;
    pe.carrying = null;
    if (it) { it.held = null; it.vx = Math.cos(pe.theta) * 40; it.vh = 60; }
    setState(pe, 'idle', 3, { eyes: 'happy', mouth: 'open' });
    heart(pe.x, headY(pe));
    emit('drop');
    needs(pe, { fun: 5 });
    if (girl.state !== 'eat' && girl.state !== 'piano') { say(girl, `Good ${PET_WORD[pe.species] || 'pet'}!`); setFace('happy'); }
    // The girl throws it again if nobody else does.
    if (it && clock - lastUser.t > 4 && !reduced) {
      setTimeout(() => {
        if (!svgEl.isConnected || it.held || drag || ['sit', 'read', 'eat', 'piano', 'stroke'].includes(girl.state) || Math.abs(it.x - girl.x) > 160) return;
        girlWalkTo(it.x + (it.x > girl.x ? -26 : 26), it.z, () => girlPickUp(it));
      }, 1400);
    }
  }

  // ---------------------------------------------------------------- girl brain
  function girlIdleChoice() {
    if (reduced) { setGirlState('idle', 6); return; }
    const r = Math.random();
    const loose = items.find((it) => !it.held && Math.hypot(it.vx, it.vh) < 5 && Math.abs(it.x - girl.x) < 260);
    if (r < 0.32) girlWalkTo(rand(80, 700), rand(0.3, 0.95), () => setGirlState('idle', rand(2, 4)));
    else if (r < 0.5 && seat) girlWalkTo(seat.x, seat.z + 0.05, () => setGirlState('sit', rand(7, 13)));
    else if (r < 0.66 && pets.length) { const pe = pets[Math.floor(Math.random() * pets.length)]; if (['idle', 'sleep'].includes(pe.state)) strokeOne(pe); else setGirlState('idle', 2); }
    else if (r < 0.82 && loose) girlWalkTo(loose.x + (loose.x > girl.x ? -26 : 26), loose.z, () => girlPickUp(loose));
    else { setGirlState(Math.random() < 0.3 ? 'wave' : 'idle', rand(1.5, 3)); }
  }
  function strokeOne(pe, then = null) {
    if (pe.state === 'walk' || pe.state === 'chase') setState(pe, 'idle', 6);
    pe.waiting = true;
    const side = girl.x < pe.x ? -1 : 1;
    girlWalkTo(pe.x + side * 44, pe.z + 0.02, () => {
      pe.waiting = false;
      girl.dir = -side;
      setGirlState('stroke', 3.2, { strokeThen: then });
      setFace('love', 3.2);
      if (Math.random() < 0.6) say(girl, ['Who’s a good pet?', 'Aww, so soft!', 'I love you!', `Hello, ${pe.name}!`][Math.floor(Math.random() * 4)]);
      if (pe.state !== 'sleep') setState(pe, 'stroked', 3.2);
      emit('stroke');
      needs(pe, { fun: 8 });
    });
  }
  function girlPickUp(it) {
    if (it.held || Math.abs(it.x - girl.x) > 70) { setGirlState('idle', 1); return; }
    setGirlState('pickup', 0.45, { pickItem: it });
  }
  function girlThrow() {
    const it = girl.holding;
    if (!it) return;
    girl.holding = null; it.held = null;
    const toward = girl.x > 400 ? -1 : 1;
    it.vx = toward * rand(260, 420); it.vh = rand(260, 420); it.vz = rand(-0.5, 0.35);
    it.lastThrow = clock;
    sfx('pop'); setFace('proud', 1);
    if (Math.random() < 0.5) say(girl, 'Fetch!');
    chaseAll(it);
  }

  // ---------------------------------------------------------------- pointer: grab, throw, click
  let drag = null;
  const toWorld = (ev) => {
    const m = svgEl.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const toyScreen = (it) => ({ x: it.x, y: floorY(it.z) - it.h - it.def.r * depth(it.z) });
  svgEl.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    const p = toWorld(ev);
    lastUser.t = clock;
    let best = null, bd = 1e9;
    for (const it of items) {
      const s = toyScreen(it);
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < it.def.r * depth(it.z) + 16 && d < bd) { best = it; bd = d; }
    }
    if (best) {
      ev.preventDefault();
      if (best.held && best.held.kind === 'pet') { best.held.carrying = null; setState(best.held, 'idle', 1.5); }
      if (best.held === 'girl') { girl.holding = null; setGirlState('idle', 1); }
      best.held = 'user';
      drag = { it: best, samples: [{ t: performance.now(), ...p }], start: p, moved: false };
      try { svgEl.setPointerCapture(ev.pointerId); } catch { /* fine */ }
      svgEl.classList.add('grabbing');
      for (const pe of pets) if (['idle', 'walk', 'cheer'].includes(pe.state)) setState(pe, 'watch', 3);
      emit('grab');
      return;
    }
    if (ev.target.closest && ev.target.closest('[data-gift]')) { openGift(); return; }
    // A pet (front-most first): a cuddle.
    for (const pe of [...pets].sort((a, b) => b.z - a.z)) {
      const fy = floorY(pe.z);
      if (Math.abs(p.x - pe.x) < 50 * depth(pe.z) && p.y > fy - 120 * depth(pe.z) && p.y < fy + 6) {
        sfx('pop'); heart(pe.x, headY(pe));
        girl.queue = [];
        strokeOne(pe);
        return;
      }
    }
    const gy = floorY(girl.z);
    if (Math.abs(p.x - girl.x) < 45 && p.y > gy - 220 * depth(girl.z) && p.y < gy + 4 && !['sit', 'read', 'piano'].includes(girl.state)) {
      setGirlState('wave', 1.8); setFace('happy'); say(girl, 'Hi!'); emit('wave');
      return;
    }
    const mt = ev.target.closest && ev.target.closest('[data-mytoy]');
    if (mt) { const t = myToys.find((m) => m.id === mt.dataset.mytoy); if (t) { playWith(t); return; } }
    if (ev.target.closest && ev.target.closest('[data-thing=piano],[data-thing=stool]')) { playPiano(); return; }
    if (p.y > FLOOR_TOP + 4) {
      const z = clamp((p.y - FLOOR_TOP) / FLOOR_DEPTH, 0.02, 1);
      girl.holdArt = null; girl.queue = [];
      girlWalkTo(p.x, z, () => setGirlState('idle', 6));
      emit('walk');
    }
  });
  svgEl.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const p = toWorld(ev);
    const it = drag.it;
    drag.samples.push({ t: performance.now(), ...p });
    if (drag.samples.length > 8) drag.samples.shift();
    if (Math.hypot(p.x - drag.start.x, p.y - drag.start.y) > 4) drag.moved = true;
    it.x = clamp(p.x, 20, W - 20);
    const r = it.def.r * depth(it.z);
    if (p.y + r > floorY(it.z)) { it.z = clamp((p.y + r - FLOOR_TOP) / FLOOR_DEPTH, 0, 1); it.h = 0; }
    else it.h = clamp(floorY(it.z) - (p.y + r), 0, 400);
    it.vx = it.vz = it.vh = 0;
  });
  const release = (ev) => {
    if (!drag) return;
    const it = drag.it;
    svgEl.classList.remove('grabbing');
    try { svgEl.releasePointerCapture(ev.pointerId); } catch { /* fine */ }
    const now = performance.now();
    const recent = drag.samples.filter((s) => now - s.t < 110);
    const a = recent[0] || drag.samples[0], b = drag.samples[drag.samples.length - 1];
    const dt = Math.max(0.016, (b.t - a.t) / 1000);
    let vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt;
    it.held = null;
    if (!drag.moved) { vx = rand(-60, 60); vy = -260; }
    it.vx = clamp(vx, -1300, 1300);
    it.vh = clamp(-vy, -300, 950);
    it.vz = clamp(vy > 0 ? vy / 900 : -Math.min(1, -vy / 900) * 0.7, -0.9, 0.9);
    it.lastThrow = clock;
    drag = null;
    lastUser.t = clock;
    sfx('pop');
    emit('throw');
    svgEl.dataset.throws = String(Number(svgEl.dataset.throws || 0) + 1);
    chaseAll(it);
  };
  svgEl.addEventListener('pointerup', release);
  svgEl.addEventListener('pointercancel', release);

  // ---------------------------------------------------------------- commands
  /** Put food in one pet's bowl; it trots over and eats it. */
  function feed(item, effect, idx = 0) {
    const pe = pets[idx]; if (!pe) return;
    if (girl.queue.length || girl.state === 'stroke') stopCuddles();
    const b = bowls[idx];
    b.food = { item, effect };
    while (b.foodG.firstChild) b.foodG.firstChild.remove();
    markup(b.foodG, `<g transform="translate(-60 -60)">${itemArt(item.id)}</g>`);
    b.foodG.setAttribute('transform', 'translate(0 -27) scale(.22)');
    sfx('pop');
    if (pe.carrying) { pe.carrying.held = null; pe.carrying = null; }
    wakeThen(pe, () => walkTo(pe, b.x + 34, b.z - 0.03, () => { pe.targetTheta = Math.PI; setState(pe, 'eat', 4); }, 95));
    if (idx === 0 || Math.random() < 0.3) say(girl, pets.length > 1 && idx > 0 ? 'Dinner time!' : `Here you go, ${pe.name}!`);
  }
  function cuddleAll() {
    const list = pets.filter((pe) => pe.state !== 'eat');
    if (!list.length) return;
    girl.queue = list.slice(1);
    say(girl, list.length > 1 ? 'Cuddles for everyone!' : 'Cuddle time!');
    strokeOne(list[0], nextCuddle);
  }
  function nextCuddle() { const pe = girl.queue.shift(); if (pe) strokeOne(pe, nextCuddle); }
  function stopCuddles() { girl.queue = []; if (girl.state === 'stroke') { girl.strokeThen = null; setGirlState('idle', 2); } for (const pe of pets) { pe.waiting = false; if (pe.state === 'stroked') setState(pe, 'idle', 1); } }
  function bedtime() {
    stopCuddles();
    say(girl, 'Night night, everyone!'); setFace('sleepy', 3);
    pets.forEach((pe, i) => setTimeout(() => { if (svgEl.isConnected) { if (pe.carrying) { pe.carrying.held = null; pe.carrying = null; } goSleep(pe, rand(25, 35)); } }, i * 250));
    emit('bedtime');
  }
  function trick(id) {
    const t = TRICKS.find((x) => x.id === id) || TRICKS[0];
    stopCuddles();
    say(girl, `${t.name}!`); setFace('proud', 2);
    pets.forEach((pe, i) => setTimeout(() => {
      if (!svgEl.isConnected) return;
      if (pe.carrying) { pe.carrying.held = null; pe.carrying = null; }
      wakeThen(pe, () => { pe.targetTheta = girl.x > pe.x ? 0 : Math.PI; setState(pe, `trick-${t.id}`, t.id === 'dance' ? 3 : 2); });
    }, i * 180));
    setTimeout(() => { if (svgEl.isConnected) { say(girl, pets.length > 1 ? 'Clever pets!' : 'Clever pet!'); setFace('happy'); pets.forEach((pe) => heart(pe.x, headY(pe))); } }, 2600);
    emit('trick');
  }
  function playPiano() {
    if (!pianoSpot) return;
    girl.queue = [];
    girlWalkTo(pianoSpot.x, pianoSpot.z + 0.02, () => {
      girl.dir = 1;
      const tune = TUNES[Math.floor(Math.random() * TUNES.length)];
      const secs = playSequence(tune.map(([m, beats]) => ({ notes: [m], beats })), { tempo: 120 }) || tune.reduce((s, n) => s + n[1], 0) * 0.5;
      setGirlState('piano', Math.max(3, secs)); setFace('happy', secs);
      for (const pe of pets) if (awake(pe)) wakeThen(pe, () => setState(pe, 'dance', Math.max(3, secs)));
      emit('piano');
    });
  }
  function playWith(t) {
    girl.queue = [];
    girlWalkTo(t.x + (t.x > girl.x ? -40 : 40), t.z, () => {
      girl.dir = t.x > girl.x ? 1 : -1;
      setHand(t.id); setGirlState('play', 3.5); setFace('happy', 3.5); say(girl, 'Wheee!');
      emit('play');
    });
  }
  function setHand(id) {
    girl.holdArt = id;
    while (handItem.firstChild) handItem.firstChild.remove();
    const mid = `bite${Math.floor(Math.random() * 1e9)}`;
    markup(handItem, `<defs><mask id="${mid}"><rect x="-70" y="-70" width="140" height="140" fill="#fff"/><g class="bites" fill="#000"></g></mask></defs><g mask="url(#${mid})"><g transform="translate(-60 -60)">${itemArt(id)}</g></g>`);
    girl.bites = handItem.querySelector('.bites');
  }
  /** She eats something herself: lifts it to her mouth, takes three bites, chews. */
  function girlEat(item) {
    girl.queue = [];
    girl.dir = girl.x > 400 ? -1 : 1;
    setHand(item.id); setGirlState('eat', 4.8, { biteN: 0 });
    emit('girl-eat');
  }
  function read(book) {
    if (!seat) { say(girl, 'Let’s read inside!'); return; }
    girl.queue = [];
    girlRig.setBook(book.cover);
    girlWalkTo(seat.x, seat.z + 0.05, () => { setGirlState('read', 30); emit('read'); say(girl, `Reading ${book.name}…`, 3); });
  }
  function openGift() {
    if (!giftT) return;
    const g = giftT;
    giftT = null;
    girlWalkTo(g.x - 40, g.z, () => {
      girl.dir = 1; setFace('surprised', 1.2);
      g.el.remove();
      for (let i = 0; i < 8; i++) sparkle(g.x, floorY(g.z) - 30);
      sfx('reveal');
      const msg = opts.onGift ? opts.onGift() : 'A present!';
      setTimeout(() => { if (svgEl.isConnected) { setFace('happy', 2); say(girl, msg, 3); } }, 700);
      emit('gift');
    });
  }

  // ---------------------------------------------------------------- simulation
  function stepToys(dt) {
    for (const it of items) {
      if (it.held === 'user') continue;
      if (it.held && it.held.kind === 'pet') {
        const pe = it.held, m = pe.rig.mouth(), k = depth(pe.z);
        it.x = pe.x + m.x * k; it.z = pe.z + 0.001;
        it.h = Math.max(0, -(m.y * k) - it.def.r * k * 1.6 + (pe.hop || 0));
        continue;
      }
      if (it.held === 'girl') {
        const hnd = girlRig.hand(girl.dir > 0 ? 1 : 0);
        const k = depth(girl.z) * GIRL;
        it.x = girl.x + hnd.x * k; it.z = girl.z + 0.002; it.h = Math.max(0, -(hnd.y * k) - it.def.r * k);
        continue;
      }
      const air = it.h > 0 || it.vh > 0;
      it.vh -= 1500 * dt;
      it.h += it.vh * dt;
      if (it.h <= 0) {
        it.h = 0;
        if (it.vh < -90) { it.vh = -it.vh * it.def.bounce; if (it.vh > 120) sfx('boing'); }
        else it.vh = 0;
      }
      it.x += it.vx * dt;
      it.z += it.vz * dt;
      if (!air || it.h === 0) { const fr = Math.exp(-2.4 * dt); it.vx *= fr; it.vz *= fr; }
      if (it.x < 20) { it.x = 20; it.vx = Math.abs(it.vx) * 0.6; }
      if (it.x > W - 20) { it.x = W - 20; it.vx = -Math.abs(it.vx) * 0.6; }
      if (it.z < 0) { it.z = 0; it.vz = Math.abs(it.vz) * 0.5; }
      if (it.z > 1) { it.z = 1; it.vz = -Math.abs(it.vz) * 0.5; }
      if (Math.abs(it.vx) < 3) it.vx = 0;
      if (Math.abs(it.vz) < 0.01) it.vz = 0;
      it.rot += (it.vx * dt) / (it.def.r * U) * 57;
    }
  }

  function stepPet(pe, dt) {
    pe.t += dt;
    pe.tailPhase += dt * (pe.state === 'stroked' || pe.state === 'cheer' ? 5 : 2.2);
    pe.blink -= dt;
    let view = 'sit', moving = false, speed = 0;
    const done = (fn) => { const a = pe.after; pe.after = null; if (a) a(); else if (fn) fn(); else setState(pe, 'idle', rand(1.5, 3)); };
    switch (pe.state) {
      case 'walk': {
        const arrived = moveToward(pe, pe.target, pe.speed, dt);
        moving = !arrived; speed = pe.speed;
        if (arrived || pe.t > pe.dur) { const t = pe.then; pe.then = null; if (t) t(); else setState(pe, 'idle', 2); }
        break;
      }
      case 'fetch': {
        const arrived = moveToward(pe, pe.target, 110, dt);
        moving = !arrived; speed = 110;
        if (arrived || pe.t > 10) { const t = pe.then; pe.then = null; if (t) t(); else dropToy(pe); }
        break;
      }
      case 'chase': {
        const it = pe.chasing;
        if (!it || it.held === 'user') { setState(pe, 'watch', 3); break; }
        if (it.held && it.held !== pe) { setState(pe, 'idle', 1); break; }
        if (pe.t > pe.dur) { setState(pe, 'idle', 2); break; } // gave up
        const reach = (it.def.r + 18) * depth(it.z) / U;
        const tx = it.x - Math.sign(it.x - pe.x || 1) * reach * 0.8;
        const arrived = moveToward(pe, { x: tx, z: it.z }, 185 * pe.pers.speed, dt);
        moving = true; speed = 185;
        if ((arrived || Math.abs(pe.x - tx) < 8) && Math.abs(pe.z - it.z) < 0.07 && it.h < 30 && Math.hypot(it.vx, it.vz * 300) < 160) caught(pe, it);
        break;
      }
      case 'cheer':
        pe.hop = Math.abs(Math.sin(pe.t * 10)) * 10; pe.eyes = 'happy'; pe.mouth = 'open';
        if (pe.t > pe.dur) done();
        break;
      case 'watch': {
        const it = drag?.it || ball;
        pe.look = clamp((it.x - pe.x) / 120, -1, 1);
        pe.squash = Math.max(0, Math.sin(pe.t * 9)) * 0.6;
        pe.mouth = 'open';
        if (!drag && pe.t > 1.2) setState(pe, 'idle', 2);
        if (drag && pe.t > pe.dur) pe.t = 0; // keep watching while it is held
        break;
      }
      case 'sleep':
        view = 'sleep'; pe.phase += dt * 1.5;
        if (Math.random() < dt * 0.6) zzz(pe.x + 14, floorY(pe.z) - 50 * depth(pe.z));
        if (Math.random() < dt * 0.5) needs(pe, { energy: 2 });
        if (pe.t > pe.dur) { setState(pe, 'wake', 1.2); }
        break;
      case 'wake':
        pe.eyes = pe.t < 0.5 ? 'happy' : 'open'; pe.mouth = 'open'; pe.squash = Math.sin(pe.t * 3) * 0.6;
        if (pe.t > pe.dur) done();
        break;
      case 'stroked':
        pe.eyes = 'happy'; pe.look = clamp((girl.x - pe.x) / 80, -1, 1) * 0.4;
        pe.squash = Math.sin(pe.t * 7) * 0.15;
        if (Math.random() < dt * 2.2) heart(pe.x, headY(pe));
        if (pe.t > pe.dur) setState(pe, 'idle', 2, { eyes: 'happy' });
        break;
      case 'eat': {
        // Head down into the bowl, chomp chomp; the food gets smaller with each bite.
        const b = bowls[pe.idx];
        const prog = Math.min(1, pe.t / pe.dur);
        const chomp = Math.sin(pe.t * 12);
        pe.headDy = 14 + Math.max(0, chomp) * 4; pe.eyes = 'happy';
        pe.mouth = chomp > 0 ? 'open' : 'smile';
        const left = Math.max(0, 1 - Math.floor(prog * 4) / 4);
        b.foodG.setAttribute('transform', `translate(0 ${f1(-27 + (1 - left) * 8)}) scale(${f1(0.22 * Math.max(0.05, left) * 1000) / 1000})`);
        if (Math.random() < dt * 6) crumb(b.x, floorY(b.z) - 22);
        if (Math.random() < dt * 2.2) sfx('munch');
        if (pe.t > pe.dur) {
          if (b.food) {
            needs(pe, { hunger: b.food.effect.hunger, fun: b.food.effect.fun });
            const n = b.food.effect.favourite ? 5 : 1;
            for (let i = 0; i < n; i++) setTimeout(() => { if (svgEl.isConnected) heart(pe.x, headY(pe)); }, i * 120);
            if (b.food.effect.favourite) think(pe, P.heartPath(60, 70, 3).replace(/^/, '<path d="') + '" fill="#ff5c8a"/>');
          }
          b.food = null;
          while (b.foodG.firstChild) b.foodG.firstChild.remove();
          emit('ate');
          setState(pe, 'lick', 2.2);
        }
        break;
      }
      case 'lick':
        pe.lick = 0.6 + Math.sin(pe.t * 10) * 0.4; pe.eyes = 'closed'; pe.mouth = 'tongue';
        if (pe.t > pe.dur) setState(pe, 'idle', 2);
        break;
      case 'bat':
        view = 'move'; pe.stride = 0.3; pe.phase += dt * 20;
        if (pe.t > pe.dur) setState(pe, 'idle', 1.5);
        break;
      case 'wheel': {
        const spot = specials[pe.species];
        if (!spot) { setState(pe, 'idle', 1); break; }
        view = 'move'; moving = true; speed = 260;
        pe.x = spot.x; pe.z = spot.z - 0.001; pe.targetTheta = 0;
        pe.hop = 18 * PROP * depth(spot.z);
        if (spot.spokes) spot.spokes.setAttribute('transform', `translate(0 -80) rotate(${f1(-pe.t * 300)})`);
        if (pe.t > pe.dur) { pe.hop = 0; pe.z = spot.z + 0.06; pe.x = spot.x + 40; setState(pe, 'idle', 3, { eyes: 'happy' }); needs(pe, { fun: 6, energy: -3 }); emit('wheel'); }
        break;
      }
      case 'spin': case 'trick-spin':
        view = 'move'; moving = true; speed = 120; pe.theta += dt * 9; pe.targetTheta = pe.theta; pe.mouth = 'open';
        if (pe.t > pe.dur) { pe.theta = Math.round(pe.theta / Math.PI) * Math.PI; pe.targetTheta = pe.theta; setState(pe, 'idle', 2, { eyes: 'happy' }); needs(pe, { fun: 4 }); emit('spin'); }
        break;
      case 'binky': {
        view = 'move'; moving = true; speed = 40;
        const k = (pe.t * 1.8) % 1;
        pe.hop = Math.sin(k * Math.PI) * 26;
        if (k < 0.05) pe.targetTheta = pe.targetTheta ? 0 : Math.PI;
        pe.x = clamp(pe.x + Math.cos(pe.theta) * 30 * dt, 60, W - 60);
        if (pe.t > pe.dur) { setState(pe, 'idle', 2, { eyes: 'happy' }); needs(pe, { fun: 4 }); emit('binky'); }
        break;
      }
      case 'nibble': case 'peck':
        if (pe.state === 'peck') { view = 'move'; pe.stride = 0; pe.headDy = Math.max(0, Math.sin(pe.t * 9)) * 14; }
        else { pe.headDy = 6 + Math.max(0, Math.sin(pe.t * 8)) * 6; pe.eyes = 'happy'; }
        pe.mouth = Math.sin(pe.t * 14) > 0 ? 'open' : 'smile';
        if (Math.random() < dt * 4) crumb(pe.x, floorY(pe.z) - 20, pe.state === 'peck' ? '#e0b25a' : pe.species === 'pet-panda' ? '#8fd16f' : '#ff9f43');
        if (pe.t > pe.dur) { setState(pe, 'idle', 2, { eyes: 'happy' }); needs(pe, { fun: 3, hunger: 3 }); emit('nibble'); }
        break;
      case 'roll': case 'trick-roll':
        view = 'sit'; pe.roll = (pe.t / pe.dur) * 360; pe.x = clamp(pe.x + 50 * dt, 60, W - 60); pe.eyes = 'happy';
        if (pe.t > pe.dur) { setState(pe, 'idle', 2, { eyes: 'happy' }); needs(pe, { fun: 4 }); emit('roll'); }
        break;
      case 'prance': {
        view = 'move'; moving = true; speed = 140;
        moveToward(pe, pe.target, 80, dt);
        pe.hop = Math.abs(Math.sin(pe.t * 7)) * 8;
        if (Math.random() < dt * 14) sparkle(pe.x - Math.cos(pe.theta) * 30, floorY(pe.z) - 30);
        if (pe.t > pe.dur) { setState(pe, 'idle', 2, { eyes: 'happy' }); needs(pe, { fun: 5 }); emit('prance'); }
        break;
      }
      case 'scratch':
        view = 'move'; pe.stride = 0.35; pe.phase += dt * 22; pe.targetTheta = 0;
        pe.headDy = -6; pe.eyes = 'happy';
        if (pe.t > pe.dur) { setState(pe, 'idle', 2); needs(pe, { fun: 3 }); emit('scratch'); }
        break;
      case 'splash':
        view = 'move'; moving = true; speed = 60; pe.hop = Math.abs(Math.sin(pe.t * 8)) * 8; pe.eyes = 'happy'; pe.mouth = 'open';
        if (Math.random() < dt * 12) splash(pe.x, floorY(pe.z) - 8);
        if (pe.t > pe.dur) { setState(pe, 'idle', 2, { eyes: 'happy' }); needs(pe, { fun: 6 }); emit('splash'); }
        break;
      case 'dance': case 'trick-dance':
        view = Math.sin(pe.t * 4) > 0 ? 'move' : 'sit'; pe.hop = Math.abs(Math.sin(pe.t * 8)) * 10; pe.eyes = 'happy'; pe.mouth = 'open';
        if (view === 'move') { pe.targetTheta = Math.sin(pe.t * 2) > 0 ? 0 : Math.PI; pe.stride = 0.6; pe.phase += dt * 14; }
        if (Math.random() < dt * 2) note(pe.x, headY(pe));
        if (pe.t > pe.dur) { setState(pe, 'idle', 2, { eyes: 'happy' }); needs(pe, { fun: 5 }); }
        break;
      case 'trick-sit':
        pe.lick = 0.9; pe.mouth = 'open'; pe.eyes = 'happy'; pe.squash = Math.sin(pe.t * 6) * 0.2;
        if (pe.t > pe.dur) { setState(pe, 'idle', 2); needs(pe, { fun: 3 }); }
        break;
      case 'trick-jump':
        pe.hop = Math.max(0, Math.sin((pe.t / pe.dur) * Math.PI)) * 60; view = pe.hop > 5 ? 'move' : 'sit'; pe.stride = 0; pe.eyes = 'happy'; pe.mouth = 'open';
        if (pe.t > pe.dur) { setState(pe, 'idle', 2); needs(pe, { fun: 4 }); }
        break;
      case 'trick-wave':
        pe.lick = 0.7 + Math.sin(pe.t * 12) * 0.3; pe.mouth = 'open'; pe.eyes = 'happy';
        if (pe.t > pe.dur) { setState(pe, 'idle', 2); needs(pe, { fun: 3 }); }
        break;
      default: { // idle: sit, blink, look about, sometimes lick a paw
        if (pe.waiting) { if (pe.t > 8) pe.waiting = false; break; }
        if (!pe.sub && Math.random() < dt * 0.25) pe.sub = Math.random() < 0.5 ? { k: 'look', v: rand(-1, 1), t: rand(1, 2) } : { k: 'lick', t: 2 };
        if (pe.sub) {
          pe.sub.t -= dt;
          if (pe.sub.k === 'look') pe.look += (pe.sub.v - pe.look) * Math.min(1, dt * 5);
          if (pe.sub.k === 'lick') { pe.lick = 0.6 + Math.sin(pe.t * 10) * 0.4; pe.eyes = 'closed'; pe.mouth = 'tongue'; }
          if (pe.sub.t <= 0) { pe.sub = null; pe.lick = 0; pe.eyes = 'open'; pe.mouth = 'smile'; }
        } else pe.look *= 1 - Math.min(1, dt * 2);
        pe.squash *= 1 - Math.min(1, dt * 6);
        if (pe.t > pe.dur) idleChoice(pe);
      }
    }
    if (moving) {
      view = 'move';
      const target = pe.state === 'chase' ? pe.chasing : pe.target;
      if (target && !['wheel', 'spin', 'trick-spin', 'binky', 'splash'].includes(pe.state) && Math.abs(target.x - pe.x) > 6) pe.targetTheta = target.x >= pe.x ? 0 : Math.PI;
      pe.stride = Math.min(1, speed / 90);
      pe.phase += dt * (4 + speed / 18);
    }
    if (!['spin', 'trick-spin'].includes(pe.state)) {
      const d = pe.targetTheta - pe.theta;
      if (Math.abs(d) > 0.01) pe.theta += Math.sign(d) * Math.min(Math.abs(d), dt * 7);
    }
    if (view === 'sit' && pe.state === 'idle') pe.theta = pe.targetTheta;
    let eyes = pe.eyes;
    if (pe.blink < 0) { eyes = 'closed'; if (pe.blink < -0.13) pe.blink = rand(2, 5); }
    pe.rig.pose({
      view, theta: pe.theta, phase: pe.phase, stride: view === 'move' ? pe.stride : 0, eyes,
      mouth: pe.carrying ? 'open' : pe.mouth, look: pe.look, headDy: pe.headDy, lick: pe.lick, tailPhase: pe.tailPhase, squash: pe.squash,
    });
  }

  function stepGirl(dt) {
    girl.t += dt;
    girl.phase += dt * 2;
    girl.faceT -= dt;
    let pose = 'stand';
    let face = girl.faceT > 0 ? girl.face : null;
    switch (girl.state) {
      case 'walk': {
        const arrived = moveToward(girl, girl.target, girl.speed, dt);
        if (Math.abs(girl.target.x - girl.x) > 4) girl.dir = girl.target.x > girl.x ? 1 : -1;
        pose = 'walk';
        girl.phase += dt * 6;
        if (arrived || girl.t > girl.dur) { const t = girl.then; girl.then = null; if (t) t(); else setGirlState('idle', 2); }
        break;
      }
      case 'sit':
        if (!seat) { setGirlState('idle', 1); break; }
        pose = 'sit'; girl.x = seat.x; girl.z = seat.z + 0.001;
        if (girl.t > girl.dur) { girl.z = seat.z + 0.1; setGirlState('idle', 1.5); }
        break;
      case 'read':
        pose = 'read'; girl.x = seat.x; girl.z = seat.z + 0.001;
        if (girl.t > girl.dur) { girl.z = seat.z + 0.1; setGirlState('idle', 2); }
        break;
      case 'piano':
        pose = 'read'; girl.x = pianoSpot.x; girl.z = pianoSpot.z + 0.001; face = 'happy';
        if (Math.random() < dt * 3) note(girl.x + rand(-30, 30), floorY(girl.z) - 160 * depth(girl.z));
        if (girl.t > girl.dur) { girl.z = pianoSpot.z + 0.12; setGirlState('idle', 2); say(girl, 'Ta-da!'); }
        break;
      case 'stroke':
        pose = 'crouch'; girl.stroke = girl.t * 7; face = 'love';
        if (girl.t > girl.dur) { const t = girl.strokeThen; girl.strokeThen = null; if (t && girl.queue.length) t(); else setGirlState('idle', 2); }
        break;
      case 'pickup': {
        pose = 'crouch'; girl.stroke = 0;
        if (girl.t > girl.dur) {
          const it = girl.pickItem;
          if (it && !it.held) {
            it.held = 'girl'; girl.holding = it; setGirlState('hold', 0.8);
            for (const pe of pets) if (pe.state === 'idle') { pe.targetTheta = girl.x > pe.x ? 0 : Math.PI; setState(pe, 'watch', 1.6); }
          } else setGirlState('idle', 1);
        }
        break;
      }
      case 'hold':
        pose = 'hold';
        if (girl.t > girl.dur) { setGirlState('throw', 0.5); girl.dir = girl.x > 400 ? -1 : 1; }
        break;
      case 'throw':
        pose = 'throw'; girl.throwT = girl.t / girl.dur;
        if (girl.throwT > 0.55 && girl.holding) girlThrow();
        if (girl.t > girl.dur) setGirlState('idle', rand(2, 4));
        break;
      case 'wave':
        pose = 'wave';
        if (girl.t > girl.dur) setGirlState('idle', 2);
        break;
      case 'eat': {
        // Three bites: lift (0.45s) → bite → lower and chew (1.05s).
        pose = 'eat';
        const cycle = 1.5, k = girl.t % cycle, n = Math.floor(girl.t / cycle);
        if (n < 3) {
          girl.lift = k < 0.45 ? k / 0.45 : k < 0.6 ? 1 : Math.max(0.15, 1 - (k - 0.6) / 0.3);
          face = k < 0.45 ? 'happy' : k < 0.6 ? 'bite' : 'chew';
          if (k >= 0.45 && girl.biteN <= n) {
            girl.biteN = n + 1;
            sfx('munch');
            const spots = [[30, -30], [38, 8], [-6, 36]];
            const [bx, by] = spots[n];
            if (girl.bites) E(girl.bites, 'circle', { cx: bx, cy: by, r: 30 });
            for (let i = 0; i < 4; i++) crumb(girl.x + girl.dir * 6, floorY(girl.z) - 135 * depth(girl.z) * GIRL / 0.88);
          }
        } else { girl.lift = 0; face = 'happy'; if (girl.holdArt) { girl.holdArt = null; say(girl, ['Yummy!', 'Mmm, delicious!', 'So tasty!'][Math.floor(Math.random() * 3)]); heart(girl.x, floorY(girl.z) - 200 * depth(girl.z)); } }
        if (girl.t > girl.dur) { setGirlState('idle', 2); emit('girl-ate'); }
        break;
      }
      case 'play':
        pose = 'hold';
        if (Math.random() < dt * 1.5) heart(girl.x, floorY(girl.z) - 150 * depth(girl.z));
        if (girl.t > girl.dur) { girl.holdArt = null; setGirlState('idle', 2); emit('played'); }
        break;
      default:
        if (girl.t > girl.dur) girlIdleChoice();
    }
    girl.pose = pose;
    girlRig.pose({ pose, phase: girl.phase, dir: girl.dir, t: girl.throwT, stroke: girl.stroke, lift: girl.lift });
    girlRig.setFace(face);
    if (girl.holdArt) {
      const hnd = girlRig.hand(girl.dir > 0 ? 1 : 0);
      handItem.setAttribute('display', 'inline');
      handItem.setAttribute('transform', `translate(${f1(hnd.x - girl.dir * 8)} ${f1(hnd.y - 16)}) scale(.46)`);
    } else handItem.setAttribute('display', 'none');
  }

  function stepFx(dt) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      f.t += dt;
      if (f.g) f.vy += f.g * dt;
      f.y += f.vy * dt; f.x += (f.vx || 0) * dt;
      const a = Math.max(0, 1 - f.t / f.life);
      f.el.setAttribute('transform', `translate(${f1(f.x)} ${f1(f.y)})${f.kind === 'z' ? ` scale(${f1(0.7 + f.t * 0.3)})` : ''}`);
      f.el.setAttribute('opacity', f1(a * 100) / 100);
      if (f.t > f.life) { f.el.remove(); fx.splice(i, 1); }
    }
    for (const [who, b] of bubbles) {
      b.t += dt;
      const x = who === girl ? girl.x : who.x;
      const y = who === girl ? floorY(girl.z) - (girl.pose === 'sit' || girl.pose === 'read' ? 175 : 205) * depth(girl.z) : headY(who) - 6;
      b.el.setAttribute('transform', `translate(${f1(clamp(x + (who === girl ? 0 : 30), 60, W - 60))} ${f1(y)})`);
      b.el.setAttribute('opacity', b.t > b.life - 0.3 ? f1((b.life - b.t) / 0.3) : 1);
      if (b.t > b.life) { b.el.remove(); bubbles.delete(who); }
    }
  }

  let order = '';
  function draw() {
    for (const pe of pets) {
      const pk = depth(pe.z);
      pe.el.setAttribute('transform', `translate(${f1(pe.x)} ${f1(floorY(pe.z))}) scale(${f1(pk * 1000) / 1000})`);
      pe.inner.setAttribute('transform', `translate(0 ${f1(-(pe.hop || 0) / pk)})${pe.roll ? ` rotate(${f1(pe.roll)} 0 -40)` : ''}`);
      pe.shadow.setAttribute('rx', f1(34 * (1 - Math.min(0.5, (pe.hop || 0) / 80))));
      pe.shadow.setAttribute('transform', pe.state === 'wheel' ? 'scale(0)' : '');
    }
    const gk = depth(girl.z) * GIRL;
    const lift = girl.pose === 'sit' || girl.state === 'read' ? (48 * CHAIR - 36 * GIRL - 8) * depth(girl.z) : girl.state === 'piano' ? (52 * 1.1 - 36 * GIRL - 6) * depth(girl.z) : 0;
    girlG.setAttribute('transform', `translate(${f1(girl.x)} ${f1(floorY(girl.z) - lift)}) scale(${f1(gk * 1000) / 1000})`);
    for (const it of items) {
      const k = depth(it.z);
      const r = it.def.r * k;
      it.el.setAttribute('transform', `translate(${f1(it.x)} ${f1(floorY(it.z) - it.h - r)}) scale(${f1(k * 1000) / 1000})`);
      it.spin.setAttribute('transform', `rotate(${f1(it.rot % 360)})`);
      const sh = Math.max(0.3, 1 - it.h / 220);
      it.shadow.setAttribute('transform', `translate(${f1(it.x)} ${f1(floorY(it.z))}) scale(${f1(k * sh * 100) / 100})`);
      it.shadow.setAttribute('opacity', it.held && it.held !== 'user' ? 0 : 1);
    }
    const sorted = things.slice().sort((a, b) => a.z - b.z);
    const key = sorted.map((t) => t.id || t.kind).join();
    if (key !== order) {
      order = key;
      for (const t of sorted) { if (t.shadow && t.kind === 'toy') world.appendChild(t.shadow); }
      for (const t of sorted) world.appendChild(t.el);
    }
    svgEl.dataset.ballX = f1(ball.x); svgEl.dataset.ballH = f1(ball.h);
    if (pets[0]) svgEl.dataset.petX = f1(pets[0].x);
  }

  // ---------------------------------------------------------------- loop
  let last = 0, raf = 0, seen = false;
  function frame(ts) {
    if (!svgEl.isConnected) { if (seen) { stop(); return; } raf = requestAnimationFrame(frame); return; }
    seen = true;
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts;
    clock += dt;
    stepToys(dt);
    for (const pe of pets) stepPet(pe, dt);
    separate(dt);
    stepGirl(dt); stepFx(dt); draw();
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  pets.forEach((pe) => setState(pe, 'idle', 1 + pe.idx * 0.8));
  setGirlState('idle', 2.5);
  draw();
  raf = requestAnimationFrame(frame);

  return {
    el: svgEl,
    pets: pets.map((p) => ({ species: p.species, name: p.name })),
    feed, cuddleAll, bedtime, trick, playPiano, read, girlEat, say: (t) => say(girl, t),
    cuddle: (i = 0) => { if (pets[i]) strokeOne(pets[i]); },
    destroy: stop,
    _special: (i = 0) => { if (pets[i]) doSpecial(pets[i]); },
    _sit: () => { if (seat) girlWalkTo(seat.x, seat.z + 0.05, () => setGirlState('sit', 20)); },
    _throw(i = 0, vx = 600, vh = 500) { const it = items[i]; it.held = null; it.vx = vx; it.vh = vh; it.vz = 0; it.lastThrow = clock; chaseAll(it); },
  };
}
