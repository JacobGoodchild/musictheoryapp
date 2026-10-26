// The pet house: a little room where the pet and the player's avatar live.
// Grab a toy with the mouse and fling it: the pet chases it, picks it up and
// brings it back. The girl wanders, sits in her armchair, strokes the pet and
// throws the ball too. Each pet has its own special toy (hamster wheel,
// scratching post, kennel, carrot patch, nest, bamboo, rainbow).
//
// One SVG, 800×450. The floor has depth: z = 0 at the back wall, 1 at the
// front; things further back are higher up and smaller, and drawn first.
import { createPet } from './pet-rig.js';
import { createGirl } from './girl-rig.js';
import * as P from './props.js';
import { itemArt } from './item-art.js';
import { sfx } from '../audio/synth.js';

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

function roomArt(night, decor) {
  const sky = night
    ? '<rect x="0" y="0" width="150" height="120" fill="#2c2f6b"/><circle cx="110" cy="30" r="14" fill="#fff6c8"/><circle cx="104" cy="26" r="13" fill="#2c2f6b"/>' + [[30, 30], [60, 70], [20, 90], [80, 22], [130, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('')
    : '<rect x="0" y="0" width="150" height="120" fill="#bfe6ff"/><circle cx="118" cy="28" r="15" fill="#ffe27a"/><path d="M20 70q4-14 18-10q8-12 22-2q12 0 10 12z" fill="#fff"/><path d="M78 98q3-10 13-7q6-9 16-1q9 0 7 8z" fill="#fff"/><path d="M0 104q40-16 80 0t70 0v16H0z" fill="#9ad88f"/>';
  return `
  <defs>
    <pattern id="wallp" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#fff1f6"/><circle cx="12" cy="12" r="3" fill="#ffd9e6"/><circle cx="36" cy="36" r="3" fill="#e9defc"/></pattern>
    <linearGradient id="floorg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7b98a"/><stop offset="1" stop-color="#f3cfa3"/></linearGradient>
    <clipPath id="winclip"><rect x="0" y="0" width="150" height="120" rx="6"/></clipPath>
  </defs>
  <rect x="0" y="0" width="${W}" height="${FLOOR_TOP}" fill="url(#wallp)"/>
  <rect x="0" y="${FLOOR_TOP}" width="${W}" height="${450 - FLOOR_TOP}" fill="url(#floorg)"/>
  ${[0.12, 0.3, 0.52, 0.78].map((k) => `<path d="M0 ${f1(floorY(k))}H${W}" stroke="#d9a575" stroke-width="2" opacity=".55"/>`).join('')}
  ${[-3, -2, -1, 0, 1, 2, 3, 4].map((i) => `<path d="M${400 + i * 120} ${FLOOR_TOP}L${400 + i * 190} 450" stroke="#d9a575" stroke-width="2" opacity=".35"/>`).join('')}
  <rect x="0" y="${FLOOR_TOP - 14}" width="${W}" height="16" fill="#fff" stroke="#ead6df" stroke-width="2"/>
  <g transform="translate(300 52)">
    <rect x="-10" y="-10" width="170" height="140" rx="10" fill="#fff" stroke="#4a3040" stroke-width="3"/>
    <g clip-path="url(#winclip)">${sky}</g>
    <path d="M75 0v120M0 60h150" stroke="#fff" stroke-width="6"/>
    <rect x="0" y="0" width="150" height="120" rx="6" fill="none" stroke="#4a3040" stroke-width="2.5"/>
    <path d="M-26-14q30 60 6 150h-14q8-80-8-150z" fill="#ffa6c1" stroke="#4a3040" stroke-width="3" stroke-linejoin="round"/>
    <path d="M176-14q-30 60-6 150h14q-8-80 8-150z" fill="#ffa6c1" stroke="#4a3040" stroke-width="3" stroke-linejoin="round"/>
    <rect x="-36" y="-20" width="222" height="10" rx="5" fill="#c58a5a" stroke="#4a3040" stroke-width="2.5"/>
  </g>
  <g transform="translate(120 110)">
    <rect x="-36" y="-30" width="72" height="56" rx="4" fill="#fff" stroke="#4a3040" stroke-width="3"/>
    <rect x="-28" y="-22" width="56" height="40" fill="#d8f0e0"/>
    <path d="M-28 18l16-18 12 12 10-8 18 14z" fill="#8fd18f"/><circle cx="14" cy="-10" r="6" fill="#ffe27a"/>
  </g>
  ${decor.includes('decor-poster') ? `<g transform="translate(560 120)">${P.poster()}</g>` : ''}
  ${decor.includes('decor-lights') ? P.fairyLights() : ''}
  ${decor.includes('decor-rug') ? `<g transform="translate(400 ${floorY(0.55)})">${P.rainbowRug()}</g>` : `<ellipse cx="400" cy="${floorY(0.55)}" rx="170" ry="40" fill="#fbe0ea" stroke="#f1c4d6" stroke-width="3"/>`}`;
}

/**
 * Build the house. opts: { petId, petName, equipped, toys (owned ids),
 * onNeeds(delta), onEvent(name) }. Returns { el, feed(item, effect), destroy }.
 */
export function createHouse(opts) {
  const { petId, equipped, toys = [] } = opts;
  const decor = toys.filter((t) => t.startsWith('decor-'));
  const night = (() => { const h = new Date().getHours(); return h < 7 || h >= 19; })();
  const svgEl = E(null, 'svg', { viewBox: `0 0 ${W} 450`, class: 'house-svg', role: 'img', 'aria-label': 'Your pet’s house. Drag a toy and let go to throw it. Click your pet to give it a cuddle.' });
  markup(svgEl, roomArt(night, decor));
  const world = E(svgEl, 'g');
  const fxLayer = E(svgEl, 'g', { 'pointer-events': 'none' });
  const reduced = reducedMotion();

  // ---------------------------------------------------------------- things in the room
  const things = []; // { z, el, kind, ... } sorted for drawing
  const place = (el, x, z, scale = 1, extra = '') => el.setAttribute('transform', `translate(${f1(x)} ${f1(floorY(z))}) scale(${f1(depth(z) * scale * 1000) / 1000})${extra}`);
  function addProp(markupStr, x, z, id, scale = 1) {
    const g = E(world, 'g', { 'data-thing': id });
    markup(g, markupStr);
    place(g, x, z, scale);
    const t = { id, el: g, x, z, kind: 'prop' };
    things.push(t);
    return t;
  }
  const chair = { x: 668, z: 0.1 };
  addProp(P.armchairBack(), chair.x, chair.z - 0.002, 'chair-back', CHAIR);
  const chairFront = addProp(P.armchairFront(), chair.x, chair.z + 0.004, 'chair-front', CHAIR);
  void chairFront;
  const bedPos = { x: 128, z: 0.42 };
  addProp(P.petBed(decor.includes('decor-bed')), bedPos.x, bedPos.z - 0.01, 'bed');
  const bowlPos = { x: 268, z: 0.86 };
  const bowlT = addProp(P.bowl(), bowlPos.x, bowlPos.z, 'bowl');
  const bowlFood = E(bowlT.el, 'g', { transform: 'translate(0 -27) scale(.22)' });
  if (decor.includes('decor-plant')) addProp(P.plant(), 762, 0.02, 'plant', 1.3);
  else addProp(P.plant(), 34, 0.02, 'plant', 1.3);
  // The pet's own special toy.
  const special = P.SPECIES_PROP[petId] || P.SPECIES_PROP['pet-kitten'];
  const spPos = petId === 'pet-unicorn' ? { x: 470, z: 0.08 } : { x: 492, z: 0.06 };
  addProp(special.back(), spPos.x, spPos.z - 0.003, 'special', PROP);
  let spokes = null;
  if (special.spokes) {
    const st = addProp('', spPos.x, spPos.z - 0.002, 'spokes', PROP);
    spokes = E(st.el, 'g');
    markup(spokes, special.spokes());
    addProp(special.front(), spPos.x, spPos.z + 0.003, 'special-front', PROP);
  }

  // ---------------------------------------------------------------- toys
  const throwables = ['toy-ball', ...toys.filter((t) => P.TOYS[t])];
  const items = throwables.map((id, i) => {
    const def = P.TOYS[id];
    const shadow = E(world, 'ellipse', { rx: def.r * 0.9, ry: def.r * 0.28, fill: '#00000022' });
    const g = E(world, 'g', { class: 'house-toy', 'data-toy': id, style: 'cursor:grab' });
    const spin = E(g, 'g');
    markup(spin, def.art());
    const it = { id, def, x: 360 + i * 70, z: 0.7 - (i % 3) * 0.12, h: 0, vx: 0, vz: 0, vh: 0, rot: 0, held: null, el: g, spin, shadow, kind: 'toy', lastThrow: 0 };
    things.push(it);
    return it;
  });
  const ball = items[0];

  // ---------------------------------------------------------------- the pet
  const petRig = createPet(petId);
  const petG = E(world, 'g', { class: 'house-pet', style: 'cursor:pointer' });
  const petShadow = E(petG, 'ellipse', { cx: 0, cy: 0, rx: 34, ry: 8, fill: '#00000022' });
  const petInner = E(petG, 'g');
  petInner.appendChild(petRig.el);
  const pet = { kind: 'pet', el: petG, x: 300, z: 0.6, theta: 0, targetTheta: 0, phase: 0, tailPhase: 0, stride: 0, state: 'idle', t: 0, dur: 2, sub: null, carrying: null, eyes: 'open', mouth: 'smile', look: 0, lick: 0, headDy: 0, blink: 2, squash: 0, roll: 0, target: null, then: null, speed: 0, view: 'sit', spin: 0, hop: 0 };
  things.push(pet);

  // ---------------------------------------------------------------- the girl
  const girlRig = createGirl(equipped);
  const girlG = E(world, 'g', { class: 'house-girl', style: 'cursor:pointer' });
  E(girlG, 'ellipse', { cx: 0, cy: 0, rx: 40, ry: 9, fill: '#00000022' });
  girlG.appendChild(girlRig.el);
  const girl = { kind: 'girl', el: girlG, x: 600, z: 0.78, dir: -1, phase: 0, state: 'idle', t: 0, dur: 3, target: null, then: null, pose: 'stand', holding: null, throwT: 0, stroke: 0 };
  things.push(girl);

  // ---------------------------------------------------------------- effects
  const fx = [];
  function heart(x, y, colour = '#ff5c8a') {
    const g = E(fxLayer, 'path', { d: P.heartPath(0, 0, 0.9), fill: colour, stroke: '#fff', 'stroke-width': 1.5 });
    fx.push({ el: g, x: x + rand(-8, 8), y, vy: -38, life: 1.3, t: 0, kind: 'heart' });
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
  let bubble = null;
  function think(markupStr) {
    if (bubble) bubble.el.remove();
    const g = E(fxLayer, 'g');
    markup(g, `<ellipse cx="0" cy="-30" rx="26" ry="22" fill="#fff" stroke="#4a3040" stroke-width="2.5"/><circle cx="-12" cy="-4" r="5" fill="#fff" stroke="#4a3040" stroke-width="2"/><circle cx="-18" cy="6" r="3" fill="#fff" stroke="#4a3040" stroke-width="2"/><g transform="translate(-18 -48) scale(.3)">${markupStr}</g>`);
    bubble = { el: g, life: 3, t: 0 };
  }

  // ---------------------------------------------------------------- helpers
  const petScreen = () => ({ x: pet.x, y: floorY(pet.z) - 60 * depth(pet.z) });
  const dist = (a, b) => Math.hypot(a.x - b.x, (a.z - b.z) * FLOOR_DEPTH * 1.6);
  const lastUser = { t: -99 };
  let clock = 0;
  const emit = (name) => { if (opts.onEvent) opts.onEvent(name); svgEl.dataset.lastEvent = name; };
  const needs = (d) => { if (opts.onNeeds) opts.onNeeds(d); };
  const getNeeds = () => (opts.getNeeds ? opts.getNeeds() : { hunger: 70, fun: 70, energy: 80 });

  function setPetState(state, dur = 2, extra = {}) {
    pet.state = state; pet.t = 0; pet.dur = dur;
    Object.assign(pet, { sub: null, lick: 0, headDy: 0, eyes: 'open', mouth: 'smile', spin: 0, roll: 0 }, extra);
    svgEl.dataset.petState = state;
  }
  function petWalkTo(x, z, then, speed = 70) {
    pet.target = { x: clamp(x, 40, W - 40), z: clamp(z, 0.05, 0.98) };
    pet.then = then; pet.speed = speed;
    setPetState('walk', 99);
  }
  function setGirlState(state, dur = 3, extra = {}) {
    girl.state = state; girl.t = 0; girl.dur = dur; Object.assign(girl, extra);
    svgEl.dataset.girlState = state;
  }
  function girlWalkTo(x, z, then, speed = 85) {
    girl.target = { x: clamp(x, 50, W - 50), z: clamp(z, 0.05, 0.98) }; girl.then = then; girl.speed = speed;
    setGirlState('walk', 99);
  }

  // ---------------------------------------------------------------- pet brain
  function petIdleChoice() {
    const n = getNeeds();
    if (n.energy < 25) { goSleep(); return; }
    if (reduced) { setPetState('idle', 6); return; }
    const r = Math.random();
    if (n.hunger < 30 && Math.random() < 0.5) think(itemArt('pf-kibble'));
    else if (n.fun < 30 && Math.random() < 0.5) think(`<g transform="translate(60 60) scale(2.4)">${P.TOYS['toy-ball'].art()}</g>`);
    if (r < 0.32) petWalkTo(rand(80, 720), rand(0.25, 0.95), () => setPetState('idle', rand(2, 4)));
    else if (r < 0.52) doSpecial();
    else if (r < 0.62) { const it = items[Math.floor(Math.random() * items.length)]; if (!it.held) petWalkTo(it.x - 30, it.z, () => batToy(it), 90); else setPetState('idle', 2); }
    else if (r < 0.7) goSleep(rand(10, 16));
    else setPetState('idle', rand(3, 6));
  }
  function goSleep(dur = rand(14, 22)) {
    petWalkTo(bedPos.x, bedPos.z, () => setPetState('sleep', dur), 60);
  }
  function batToy(it) {
    if (it.held) { setPetState('idle', 2); return; }
    setPetState('bat', 0.5);
    it.vx = rand(150, 260) * (it.x > pet.x ? 1 : -1); it.vh = 160; it.vz = rand(-0.4, 0.4);
    sfx('boing'); emit('bat');
    needs({ fun: 2 });
  }
  function doSpecial() {
    const sp = petId;
    if (sp === 'pet-hamster') petWalkTo(spPos.x, spPos.z + 0.05, () => setPetState('wheel', rand(5, 8)));
    else if (sp === 'pet-puppy') setPetState('spin', 2.4);
    else if (sp === 'pet-bunny') Math.random() < 0.5 ? setPetState('binky', 2.2) : petWalkTo(spPos.x - 10, spPos.z + 0.12, () => setPetState('nibble', 4));
    else if (sp === 'pet-chick') petWalkTo(spPos.x + 20, spPos.z + 0.12, () => setPetState('peck', 4));
    else if (sp === 'pet-panda') Math.random() < 0.5 ? setPetState('roll', 1.6) : petWalkTo(spPos.x - 40, spPos.z + 0.12, () => setPetState('nibble', 4.5));
    else if (sp === 'pet-unicorn') petWalkTo(spPos.x - 70, spPos.z + 0.1, () => { pet.target = { x: spPos.x + 70, z: spPos.z + 0.1 }; setPetState('prance', 3); });
    else petWalkTo(spPos.x - 34, spPos.z + 0.1, () => setPetState('scratch', 3));
  }
  function startChase(it) {
    if (pet.state === 'stroked') return;
    pet.chasing = it;
    setPetState('chase', 99);
  }

  // ---------------------------------------------------------------- girl brain
  function girlIdleChoice() {
    if (reduced) { setGirlState('idle', 6); return; }
    const r = Math.random();
    const loose = items.find((it) => !it.held && Math.hypot(it.vx, it.vh) < 5 && Math.abs(it.x - girl.x) < 260);
    if (r < 0.3) girlWalkTo(rand(80, 600), rand(0.3, 0.95), () => setGirlState('idle', rand(2, 4)));
    else if (r < 0.52) girlWalkTo(chair.x, chair.z + 0.05, () => setGirlState('sit', rand(7, 13)));
    else if (r < 0.7 && pet.state !== 'chase' && pet.state !== 'fetch') goStroke();
    else if (r < 0.86 && loose) girlWalkTo(loose.x + (loose.x > girl.x ? -26 : 26), loose.z, () => girlPickUp(loose));
    else setGirlState(Math.random() < 0.3 ? 'wave' : 'idle', rand(1.5, 3));
  }
  function goStroke() {
    if (pet.state === 'walk' || pet.state === 'chase') setPetState('idle', 4);
    const side = girl.x < pet.x ? -1 : 1;
    pet.waiting = true;
    girlWalkTo(pet.x + side * 44, pet.z + 0.02, () => {
      pet.waiting = false;
      girl.dir = -side;
      setGirlState('stroke', 3.6);
      if (pet.state !== 'sleep') setPetState('stroked', 3.6);
      emit('stroke');
      needs({ fun: 8 });
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
    sfx('pop');
    startChase(it);
  }

  // ---------------------------------------------------------------- pointer: grab and throw
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
    // Toys first (they are small), the nearest one in reach.
    let best = null, bd = 1e9;
    for (const it of items) {
      const s = toyScreen(it);
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < it.def.r * depth(it.z) + 16 && d < bd) { best = it; bd = d; }
    }
    if (best) {
      ev.preventDefault();
      if (best.held === 'pet') { pet.carrying = null; setPetState('idle', 1.5); }
      if (best.held === 'girl') { girl.holding = null; setGirlState('idle', 1); }
      best.held = 'user';
      drag = { it: best, samples: [{ t: performance.now(), ...p }], start: p, moved: false };
      try { svgEl.setPointerCapture(ev.pointerId); } catch { /* fine */ }
      svgEl.classList.add('grabbing');
      if (!['sleep', 'stroked'].includes(pet.state)) setPetState('watch', 99);
      emit('grab');
      return;
    }
    // The pet: a cuddle.
    const ps = petScreen();
    if (Math.abs(p.x - ps.x) < 50 * depth(pet.z) && p.y > ps.y - 60 * depth(pet.z) && p.y < floorY(pet.z) + 6) {
      sfx('pop');
      heart(pet.x, ps.y - 30);
      goStroke();
      return;
    }
    // The girl: a wave.
    const gy = floorY(girl.z);
    if (Math.abs(p.x - girl.x) < 45 && p.y > gy - 220 * depth(girl.z) && p.y < gy + 4 && girl.state !== 'sit') {
      setGirlState('wave', 1.8); emit('wave');
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
    if (!drag.moved) { vx = rand(-60, 60); vy = -260; } // a tap makes it hop
    it.vx = clamp(vx, -1300, 1300);
    it.vh = clamp(-vy, -300, 950);
    it.vz = clamp(vy > 0 ? vy / 900 : -Math.min(1, -vy / 900) * 0.7, -0.9, 0.9);
    it.lastThrow = clock;
    drag = null;
    lastUser.t = clock;
    sfx('pop');
    emit('throw');
    svgEl.dataset.throws = String(Number(svgEl.dataset.throws || 0) + 1);
    if (pet.state === 'sleep') { setPetState('wake', 1.2); pet.after = () => startChase(it); }
    else startChase(it);
  };
  svgEl.addEventListener('pointerup', release);
  svgEl.addEventListener('pointercancel', release);

  // ---------------------------------------------------------------- feeding
  let bowlItem = null;
  function feed(item, effect) {
    bowlItem = { item, effect };
    while (bowlFood.firstChild) bowlFood.firstChild.remove();
    markup(bowlFood, `<g transform="translate(-60 -60)">${itemArt(item.id)}</g>`);
    sfx('pop');
    if (pet.carrying) { pet.carrying.held = null; pet.carrying = null; }
    const go = () => petWalkTo(bowlPos.x + 42, bowlPos.z - 0.02, () => setPetState('eat', 3.2), 95);
    if (pet.state === 'sleep') { setPetState('wake', 1); pet.after = go; } else go();
  }

  // ---------------------------------------------------------------- simulation
  function stepToys(dt) {
    for (const it of items) {
      if (it.held === 'user') continue;
      if (it.held === 'pet') {
        const m = petRig.mouth();
        const k = depth(pet.z);
        it.x = pet.x + m.x * k; it.z = pet.z + 0.001;
        it.h = Math.max(0, -(m.y * k) - it.def.r * k * 1.6);
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

  function moveToward(a, target, speed, dt) {
    const dx = target.x - a.x, dz = (target.z - a.z) * FLOOR_DEPTH * 1.6;
    const d = Math.hypot(dx, dz);
    if (d < 4) return true;
    const step = Math.min(d, speed * dt);
    a.x += (dx / d) * step; a.z += ((dz / d) * step) / (FLOOR_DEPTH * 1.6);
    return false;
  }

  function stepPet(dt) {
    pet.t += dt;
    pet.tailPhase += dt * (pet.state === 'stroked' ? 5 : 2.2);
    pet.blink -= dt;
    let view = 'sit', moving = false, speed = 0;
    switch (pet.state) {
      case 'walk': {
        const done = moveToward(pet, pet.target, pet.speed, dt);
        moving = !done; speed = pet.speed;
        if (done) { const t = pet.then; pet.then = null; if (t) t(); else setPetState('idle', 2); }
        break;
      }
      case 'chase': {
        const it = pet.chasing;
        if (!it || it.held === 'user') { setPetState('watch', 99); break; }
        if (it.held) { setPetState('idle', 2); break; }
        const reach = (it.def.r + 18) * depth(it.z) / U;
        const tx = it.x - Math.sign(it.x - pet.x || 1) * reach * 0.8;
        const done = moveToward(pet, { x: tx, z: it.z }, 190, dt);
        moving = true; speed = 190;
        if ((done || Math.abs(pet.x - tx) < 8) && Math.abs(pet.z - it.z) < 0.06 && it.h < 30 && Math.hypot(it.vx, it.vz * 300) < 140) {
          it.held = 'pet'; it.vx = it.vz = it.vh = 0;
          pet.carrying = it;
          sfx('squeak'); emit('pickup');
          needs({ fun: 4, energy: -1 });
          const gside = girl.x > pet.x ? -1 : 1;
          if (girl.state === 'sit') petWalkTo(girl.x + gside * 60, girl.z + 0.12, () => dropToy(), 110);
          else petWalkTo(girl.x + gside * 58, girl.z, () => dropToy(), 110);
          pet.state = 'fetch'; svgEl.dataset.petState = 'fetch';
        }
        break;
      }
      case 'fetch': {
        const done = moveToward(pet, pet.target, 110, dt);
        moving = !done; speed = 110;
        if (done) { const t = pet.then; pet.then = null; if (t) t(); }
        break;
      }
      case 'watch': {
        // Waiting excitedly for the throw: little bounces, eyes on the toy.
        const it = drag?.it || items[0];
        pet.look = clamp((it.x - pet.x) / 120, -1, 1);
        pet.squash = Math.max(0, Math.sin(pet.t * 9)) * 0.6;
        pet.mouth = 'open';
        if (!drag && pet.t > 1.5) setPetState('idle', 2);
        break;
      }
      case 'sleep':
        view = 'sleep';
        if (Math.random() < dt * 0.7) zzz(pet.x + 14, floorY(pet.z) - 50 * depth(pet.z));
        if (Math.random() < dt * 0.5) needs({ energy: 2 });
        if (pet.t > pet.dur) { setPetState('wake', 1.2); pet.after = null; }
        break;
      case 'wake':
        pet.eyes = pet.t < 0.5 ? 'happy' : 'open'; pet.mouth = 'open'; pet.squash = Math.sin(pet.t * 3) * 0.6;
        if (pet.t > pet.dur) { const a = pet.after; pet.after = null; if (a) a(); else setPetState('idle', 2); }
        break;
      case 'stroked':
        pet.eyes = 'happy'; pet.look = clamp((girl.x - pet.x) / 80, -1, 1) * 0.4;
        pet.squash = Math.sin(pet.t * 7) * 0.15;
        if (Math.random() < dt * 2.2) heart(pet.x, floorY(pet.z) - 110 * depth(pet.z));
        if (pet.t > pet.dur) setPetState('idle', 2, { eyes: 'happy' });
        break;
      case 'eat':
        pet.headDy = 16; pet.eyes = 'happy';
        pet.mouth = Math.sin(pet.t * 14) > 0 ? 'open' : 'smile';
        if (Math.random() < dt * 6) crumb(bowlPos.x, floorY(bowlPos.z) - 26);
        if (Math.random() < dt * 2.2) sfx('munch');
        if (pet.t > pet.dur) {
          if (bowlItem) {
            needs({ hunger: bowlItem.effect.hunger, fun: bowlItem.effect.fun });
            if (bowlItem.effect.favourite) for (let i = 0; i < 5; i++) setTimeout(() => heart(pet.x, floorY(pet.z) - 110 * depth(pet.z)), i * 120);
            else heart(pet.x, floorY(pet.z) - 110 * depth(pet.z));
          }
          bowlItem = null;
          while (bowlFood.firstChild) bowlFood.firstChild.remove();
          emit('ate');
          setPetState('lick', 2.4);
        }
        break;
      case 'lick':
        pet.lick = 0.6 + Math.sin(pet.t * 10) * 0.4; pet.eyes = 'closed'; pet.mouth = 'tongue';
        if (pet.t > pet.dur) setPetState('idle', 2);
        break;
      case 'bat':
        view = 'move'; pet.stride = 0.3; pet.phase += dt * 20;
        if (pet.t > pet.dur) setPetState('idle', 1.5);
        break;
      case 'wheel': {
        view = 'move'; moving = true; speed = 260;
        pet.x = spPos.x; pet.z = spPos.z - 0.001; pet.targetTheta = 0;
        pet.hop = 18 * PROP * depth(spPos.z); // run on the bottom of the wheel
        if (spokes) spokes.setAttribute('transform', `translate(0 -80) rotate(${f1(-pet.t * 300)})`);
        if (pet.t > pet.dur) { pet.hop = 0; pet.z = spPos.z + 0.06; pet.x = spPos.x + 40; setPetState('idle', 3, { eyes: 'happy' }); needs({ fun: 6, energy: -3 }); emit('wheel'); }
        break;
      }
      case 'spin':
        view = 'move'; moving = true; speed = 120; pet.theta += dt * 9; pet.targetTheta = pet.theta;
        pet.mouth = 'open';
        if (pet.t > pet.dur) { pet.theta = Math.round(pet.theta / Math.PI) * Math.PI; pet.targetTheta = pet.theta; setPetState('idle', 2, { eyes: 'happy' }); needs({ fun: 4 }); emit('spin'); }
        break;
      case 'binky': {
        view = 'move'; moving = true; speed = 40;
        const k = (pet.t * 1.8) % 1;
        pet.hop = Math.sin(k * Math.PI) * 26;
        if (k < 0.05) pet.targetTheta = pet.targetTheta ? 0 : Math.PI;
        pet.x = clamp(pet.x + Math.cos(pet.theta) * 30 * dt, 60, W - 60);
        if (pet.t > pet.dur) { pet.hop = 0; setPetState('idle', 2, { eyes: 'happy' }); needs({ fun: 4 }); emit('binky'); }
        break;
      }
      case 'nibble': case 'peck':
        if (pet.state === 'peck') { view = 'move'; pet.stride = 0; pet.headDy = Math.max(0, Math.sin(pet.t * 9)) * 14; }
        else { pet.headDy = 6 + Math.max(0, Math.sin(pet.t * 8)) * 6; pet.eyes = 'happy'; }
        pet.mouth = Math.sin(pet.t * 14) > 0 ? 'open' : 'smile';
        if (Math.random() < dt * 4) crumb(pet.x, floorY(pet.z) - 20, pet.state === 'peck' ? '#e0b25a' : petId === 'pet-panda' ? '#8fd16f' : '#ff9f43');
        if (pet.t > pet.dur) { setPetState('idle', 2, { eyes: 'happy' }); needs({ fun: 3, hunger: 3 }); emit(pet.state); }
        break;
      case 'roll':
        view = 'sit'; pet.roll = (pet.t / pet.dur) * 360; pet.x = clamp(pet.x + 60 * dt, 60, W - 60);
        if (pet.t > pet.dur) { pet.roll = 0; setPetState('idle', 2, { eyes: 'happy' }); needs({ fun: 4 }); emit('roll'); }
        break;
      case 'prance': {
        view = 'move'; moving = true; speed = 140;
        moveToward(pet, pet.target, 80, dt);
        pet.hop = Math.abs(Math.sin(pet.t * 7)) * 8;
        if (Math.random() < dt * 14) sparkle(pet.x - Math.cos(pet.theta) * 30, floorY(pet.z) - 30);
        if (pet.t > pet.dur) { pet.hop = 0; setPetState('idle', 2, { eyes: 'happy' }); needs({ fun: 5 }); emit('prance'); }
        break;
      }
      case 'scratch':
        view = 'move'; pet.stride = 0.35; pet.phase += dt * 22; pet.targetTheta = 0; moving = false;
        pet.headDy = -6; pet.eyes = 'happy';
        if (pet.t > pet.dur) { setPetState('idle', 2); needs({ fun: 3 }); emit('scratch'); }
        break;
      default: { // idle: sit, blink, look about, sometimes lick a paw
        if (pet.waiting) break;
        if (!pet.sub && Math.random() < dt * 0.25) pet.sub = Math.random() < 0.5 ? { k: 'look', v: rand(-1, 1), t: rand(1, 2) } : { k: 'lick', t: 2 };
        if (pet.sub) {
          pet.sub.t -= dt;
          if (pet.sub.k === 'look') pet.look += (pet.sub.v - pet.look) * Math.min(1, dt * 5);
          if (pet.sub.k === 'lick') { pet.lick = 0.6 + Math.sin(pet.t * 10) * 0.4; pet.eyes = 'closed'; pet.mouth = 'tongue'; }
          if (pet.sub.t <= 0) { pet.sub = null; pet.lick = 0; pet.eyes = 'open'; pet.mouth = 'smile'; }
        } else pet.look *= 1 - Math.min(1, dt * 2);
        pet.squash *= 1 - Math.min(1, dt * 6);
        if (pet.t > pet.dur) petIdleChoice();
      }
    }
    if (moving) {
      view = 'move';
      const target = pet.state === 'chase' ? pet.chasing : pet.target;
      if (target && pet.state !== 'wheel' && pet.state !== 'spin' && pet.state !== 'binky' && Math.abs(target.x - pet.x) > 6) pet.targetTheta = target.x >= pet.x ? 0 : Math.PI;
      pet.stride = Math.min(1, speed / 90);
      pet.phase += dt * (4 + speed / 18);
    }
    // Turn smoothly (through a front view).
    if (pet.state !== 'spin') {
      const d = pet.targetTheta - pet.theta;
      if (Math.abs(d) > 0.01) pet.theta += Math.sign(d) * Math.min(Math.abs(d), dt * 7);
    }
    if (view === 'sit' && Math.abs(Math.cos(pet.theta)) < 0.99 && pet.state === 'idle') pet.theta = pet.targetTheta;
    // Blink now and then.
    let eyes = pet.eyes;
    if (pet.blink < 0) { eyes = 'closed'; if (pet.blink < -0.13) pet.blink = rand(2, 5); }
    pet.view = view;
    petRig.pose({
      view, theta: pet.theta, phase: pet.phase, stride: view === 'move' ? pet.stride : 0, eyes: eyes === 'open' && pet.blink < 0 ? 'closed' : eyes,
      mouth: pet.carrying ? 'open' : pet.mouth, look: pet.look, headDy: pet.headDy, lick: pet.lick, tailPhase: pet.tailPhase, squash: pet.squash,
    });
  }

  function dropToy() {
    const it = pet.carrying;
    pet.carrying = null;
    if (it) { it.held = null; it.vx = Math.cos(pet.theta) * 40; it.vh = 60; }
    setPetState('idle', 3, { eyes: 'happy', mouth: 'open' });
    heart(pet.x, floorY(pet.z) - 110 * depth(pet.z));
    emit('drop');
    needs({ fun: 5 });
    // The girl takes it and throws it again if nobody else does.
    if (it && girl.state !== 'stroke' && clock - lastUser.t > 4 && !reduced) {
      setTimeout(() => {
        if (!it.held && girl.state !== 'sit' && !drag && Math.abs(it.x - girl.x) < 140 && svgEl.isConnected) girlWalkTo(it.x + (it.x > girl.x ? -26 : 26), it.z, () => girlPickUp(it));
      }, 1400);
    }
  }

  function stepGirl(dt) {
    girl.t += dt;
    girl.phase += dt * 2;
    let pose = 'stand';
    switch (girl.state) {
      case 'walk': {
        const done = moveToward(girl, girl.target, girl.speed, dt);
        if (Math.abs(girl.target.x - girl.x) > 4) girl.dir = girl.target.x > girl.x ? 1 : -1;
        pose = girl.holding ? 'walk' : 'walk';
        girl.phase += dt * 6;
        if (done) { const t = girl.then; girl.then = null; if (t) t(); else setGirlState('idle', 2); }
        break;
      }
      case 'sit':
        pose = 'sit'; girl.x = chair.x; girl.z = chair.z + 0.001;
        if (girl.t > girl.dur) { girl.z = chair.z + 0.1; setGirlState('idle', 1.5); }
        break;
      case 'stroke':
        pose = 'crouch'; girl.stroke = girl.t * 7;
        if (girl.t > girl.dur) setGirlState('idle', 2);
        break;
      case 'pickup': {
        pose = 'crouch'; girl.stroke = 0;
        if (girl.t > girl.dur) {
          const it = girl.pickItem;
          if (it && !it.held) { it.held = 'girl'; girl.holding = it; setGirlState('hold', 0.8); pet.targetTheta = girl.x > pet.x ? 0 : Math.PI; if (pet.state === 'idle') setPetState('watch', 1.6); }
          else setGirlState('idle', 1);
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
      default:
        if (girl.t > girl.dur) girlIdleChoice();
    }
    girl.pose = pose;
    girlRig.pose({ pose, phase: girl.phase, dir: girl.dir, t: girl.throwT, stroke: girl.stroke });
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
    if (bubble) {
      bubble.t += dt;
      bubble.el.setAttribute('transform', `translate(${f1(pet.x + 34)} ${f1(floorY(pet.z) - 110 * depth(pet.z))})`);
      bubble.el.setAttribute('opacity', bubble.t > bubble.life - 0.4 ? f1((bubble.life - bubble.t) / 0.4) : 1);
      if (bubble.t > bubble.life) { bubble.el.remove(); bubble = null; }
    }
  }

  let order = '';
  function draw() {
    const pk = depth(pet.z);
    petG.setAttribute('transform', `translate(${f1(pet.x)} ${f1(floorY(pet.z))}) scale(${f1(pk * 1000) / 1000})`);
    petInner.setAttribute('transform', `translate(0 ${f1(-(pet.hop || 0) / pk)})${pet.roll ? ` rotate(${f1(pet.roll)} 0 -40)` : ''}`);
    petShadow.setAttribute('rx', f1(34 * (1 - Math.min(0.4, (pet.hop || 0) / 80))));
    petShadow.setAttribute('transform', pet.state === 'wheel' ? 'scale(0)' : '');
    const gk = depth(girl.z) * GIRL;
    const lift = girl.pose === 'sit' ? (48 * CHAIR - 36 * GIRL - 8) * depth(girl.z) : 0;
    girlG.setAttribute('transform', `translate(${f1(girl.x)} ${f1(floorY(girl.z) - lift)}) scale(${f1(gk * 1000) / 1000})`);
    for (const it of items) {
      const k = depth(it.z);
      const r = it.def.r * k;
      it.el.setAttribute('transform', `translate(${f1(it.x)} ${f1(floorY(it.z) - it.h - r)}) scale(${f1(k * 1000) / 1000})`);
      it.spin.setAttribute('transform', `rotate(${f1(it.rot % 360)})`);
      const sh = Math.max(0.3, 1 - it.h / 220);
      it.shadow.setAttribute('transform', `translate(${f1(it.x)} ${f1(floorY(it.z))}) scale(${f1(k * sh * 100) / 100})`);
      it.shadow.setAttribute('opacity', it.held === 'pet' || it.held === 'girl' ? 0 : 1);
    }
    // Draw order by depth (only re-order the DOM when it changes).
    const sorted = things.slice().sort((a, b) => a.z - b.z);
    const key = sorted.map((t) => t.id || t.kind).join();
    if (key !== order) {
      order = key;
      for (const t of sorted) { if (t.shadow) world.appendChild(t.shadow); }
      for (const t of sorted) world.appendChild(t.el);
    }
    svgEl.dataset.ballX = f1(ball.x); svgEl.dataset.ballH = f1(ball.h);
    svgEl.dataset.petX = f1(pet.x);
  }

  // ---------------------------------------------------------------- loop
  let last = 0, raf = 0, seen = false;
  function frame(ts) {
    if (!svgEl.isConnected) { if (seen) { stop(); return; } raf = requestAnimationFrame(frame); return; }
    seen = true;
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts;
    clock += dt;
    stepToys(dt); stepPet(dt); stepGirl(dt); stepFx(dt); draw();
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  setPetState('idle', 1.5);
  setGirlState('idle', 2.5);
  draw();
  raf = requestAnimationFrame(frame);

  return {
    el: svgEl,
    feed,
    cuddle: () => goStroke(),
    bedtime: () => goSleep(),
    destroy: stop,
    /** For tests and the dev page: start the pet's special game. */
    _special: () => doSpecial(),
    _sit: () => girlWalkTo(chair.x, chair.z + 0.05, () => setGirlState('sit', 20)),
    /** For tests: throw a toy as if dragged. */
    _throw(i = 0, vx = 600, vh = 500) { const it = items[i]; it.held = null; it.vx = vx; it.vh = vh; it.vz = 0; startChase(it); },
  };
}
