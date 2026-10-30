// Cartoon pets built from parts (body, legs, tail, head, face) so the house
// game can pose them every frame: walk and run cycles, a smooth turn through a
// front view (not a flat mirror flip), sitting, paw licking, eating, sleeping.
// Flat colours with a dark outline, like a cartoon. Original art.
//
// Local coordinates: the pet stands on y = 0, centred on x = 0, facing right
// when theta = 0. About 100 units tall.

const NS = 'http://www.w3.org/2000/svg';
let uidCount = 0;

function E(parent, tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (parent) parent.appendChild(e);
  return e;
}

// Species look and build. legLen/body sizes in local units.
export const SPECIES = {
  'pet-kitten': { fur: '#f7a24f', far: '#e48a3a', patch: '#fff8ef', line: '#4a3026', inner: '#ffb3bd', nose: '#ff8597', stripe: '#d9772c', ears: 'cat', tail: 'cat', legLen: 22, rx: 35, ry: 18, hx: 30, hy: 26, whiskers: true, stripes: true, gait: 'walk' },
  'pet-puppy': { fur: '#ecc592', far: '#d9ab74', patch: '#fff8ef', line: '#4a3026', inner: '#ffb3bd', nose: '#3b2a2a', earCol: '#a8703f', ears: 'floppy', tail: 'dog', legLen: 24, rx: 36, ry: 19, hx: 29, hy: 26, gait: 'walk', spot: '#a8703f' },
  'pet-bunny': { fur: '#fbf7ff', far: '#e6ddf0', patch: '#ffffff', line: '#5a4566', inner: '#ffbcd2', nose: '#ff8fb0', ears: 'bunny', tail: 'pom', legLen: 16, rx: 32, ry: 20, hx: 27, hy: 25, gait: 'hop', whiskers: true },
  'pet-hamster': { fur: '#f3b45f', far: '#dc9a45', patch: '#fff8ef', line: '#55361f', inner: '#ffb3bd', nose: '#ff8597', ears: 'round', tail: 'none', legLen: 9, rx: 32, ry: 23, hx: 29, hy: 25, gait: 'scurry', whiskers: true, cheeks: true },
  'pet-panda': { fur: '#ffffff', far: '#3a3440', patch: '#ffffff', line: '#2e2833', inner: '#3a3440', nose: '#2e2833', limb: '#3a3440', ears: 'panda', tail: 'panda', legLen: 18, rx: 37, ry: 23, hx: 30, hy: 27, gait: 'waddle', eyePatch: true },
  'pet-unicorn': { fur: '#fffbff', far: '#ece2f6', patch: '#ffe3ef', line: '#5d4a78', inner: '#ffc4dc', nose: '#d68aa8', hoof: '#c9b3f0', ears: 'unicorn', tail: 'rainbow', legLen: 30, rx: 34, ry: 18, hx: 27, hy: 27, gait: 'prance', horn: true },
  'pet-chick': { fur: '#ffe066', far: '#f2c53d', patch: '#fff3b0', line: '#6b4a12', inner: '#ffb3bd', nose: '#ff9f2e', ears: 'none', tail: 'bird', legLen: 12, rx: 22, ry: 19, hx: 25, hy: 24, gait: 'bird', bird: true },
};

const RAINBOW = ['#ff7b8a', '#ffb05c', '#ffe066', '#7fd88f', '#6fb8ff', '#b28cff'];

/** A tube with an outline (two stroked paths), for legs and tails. */
function tube(parent, width, colour, line) {
  const g = E(parent, 'g');
  const o = E(g, 'path', { fill: 'none', stroke: line, 'stroke-width': width + 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const f = E(g, 'path', { fill: 'none', stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return { g, set(d) { o.setAttribute('d', d); f.setAttribute('d', d); }, colour(c) { f.setAttribute('stroke', c); } };
}

const f1 = (n) => Math.round(n * 10) / 10;
// Lighter or darker shade of a #rrggbb colour (k > 1 lighter, < 1 darker).
function tint(hex, k) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(k > 1 ? v + (255 - v) * (k - 1) : v * k))).toString(16).padStart(2, '0');
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}
const EYE = { 'pet-kitten': '#5b9a4a', 'pet-puppy': '#7a4a2a', 'pet-bunny': '#c0456a', 'pet-unicorn': '#7b5bd6', 'pet-hamster': '#5a3a24', 'pet-panda': '#5a3a24', 'pet-chick': '#5a3a24' };

// ---------------------------------------------------------------- head
function buildHead(parent, sp, uid) {
  const { hx, hy, line, fur } = sp;
  const g = E(parent, 'g');
  const ears = E(g, 'g');
  const lw = 2.5;
  const ink = { stroke: line, 'stroke-width': lw, 'stroke-linejoin': 'round' };
  const refs = { g, ears };
  // Ears behind the head.
  if (sp.ears === 'cat' || sp.ears === 'unicorn') {
    const narrow = sp.ears === 'unicorn' ? 0.7 : 1;
    for (const s of [-1, 1]) {
      const p = [[s * hx * 0.86, -hy * 0.3], [s * hx * (0.78 - 0.08 * (1 - narrow)), -hy * 1.38], [s * hx * (0.16 + 0.22 * (1 - narrow)), -hy * 0.86]];
      E(ears, 'path', { d: `M${p.map((q) => q.map(f1).join(' ')).join('L')}Z`, fill: fur, ...ink });
      const c = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3 + 3];
      const ip = p.map(([x, y]) => [c[0] + (x - c[0]) * 0.52, c[1] + (y - c[1]) * 0.55]);
      E(ears, 'path', { d: `M${ip.map((q) => q.map(f1).join(' ')).join('L')}Z`, fill: sp.inner, stroke: sp.inner, 'stroke-width': 2, 'stroke-linejoin': 'round' });
    }
  } else if (sp.ears === 'bunny') {
    refs.earL = E(ears, 'g'); refs.earR = E(ears, 'g');
    for (const [s, eg] of [[-1, refs.earL], [1, refs.earR]]) {
      E(eg, 'ellipse', { cx: 0, cy: -22, rx: 8.5, ry: 24, fill: fur, ...ink });
      E(eg, 'ellipse', { cx: 0, cy: -21, rx: 4.2, ry: 17, fill: sp.inner });
      eg.setAttribute('transform', `translate(${s * hx * 0.38} ${-hy * 0.72}) rotate(${s * 10})`);
    }
  } else if (sp.ears === 'round' || sp.ears === 'panda') {
    const r = sp.ears === 'panda' ? 10 : 8.5;
    for (const s of [-1, 1]) {
      E(ears, 'circle', { cx: s * hx * 0.66, cy: -hy * 0.78, r, fill: sp.ears === 'panda' ? sp.limb : fur, ...ink });
      if (sp.ears === 'round') E(ears, 'circle', { cx: s * hx * 0.66, cy: -hy * 0.76, r: 4.5, fill: sp.inner });
    }
  }
  if (sp.horn) {
    // Rainbow mane behind the head (curls along the top and back).
    const mane = E(ears, 'g');
    [[-0.15, -1.02, 10], [-0.55, -0.9, 10], [-0.88, -0.58, 9.5], [-1.04, -0.15, 9], [-0.98, 0.3, 8]].forEach(([x, y, r], i) => {
      E(mane, 'circle', { cx: f1(x * hx), cy: f1(y * hy), r, fill: RAINBOW[i], stroke: line, 'stroke-width': 2.4 });
    });
  }
  // Head shape.
  E(g, 'ellipse', { cx: 0, cy: 0, rx: hx, ry: hy, fill: `url(#${uid}hf)`, ...ink });
  if (['floppy', 'bunny', 'round'].includes(sp.ears)) E(g, 'path', { d: `M-7 ${-hy + 3}q3-9 7-5q3-7 8 1`, fill: 'none', stroke: line, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  if (sp.cheeks) for (const s of [-1, 1]) E(g, 'ellipse', { cx: s * hx * 0.72, cy: hy * 0.38, rx: hx * 0.38, ry: hy * 0.36, fill: fur, ...ink });
  if (sp.cheeks) E(g, 'ellipse', { cx: 0, cy: hy * 0.1, rx: hx * 0.85, ry: hy * 0.62, fill: fur }); // hides the inner cheek lines
  if (sp.ears === 'floppy') {
    refs.flopL = E(g, 'g'); refs.flopR = E(g, 'g');
    for (const [s, eg] of [[-1, refs.flopL], [1, refs.flopR]]) {
      E(eg, 'path', { d: `M${s * -4} 0C${s * 8} -4 ${s * 16} 10 ${s * 14} 24C${s * 12} 34 ${s * 2} 34 ${s * -1} 24C${s * -3} 16 ${s * -6} 6 ${s * -4} 0Z`, fill: sp.earCol, ...ink });
      eg.setAttribute('transform', `translate(${s * hx * 0.8} ${-hy * 0.62})`);
    }
  }
  if (sp.ears === 'unicorn') {
    // Forelock curls on the forehead.
    E(g, 'circle', { cx: -hx * 0.3, cy: -hy * 0.82, r: 7.5, fill: RAINBOW[5], stroke: line, 'stroke-width': 2.4 });
    E(g, 'circle', { cx: -hx * 0.05, cy: -hy * 0.9, r: 6.5, fill: RAINBOW[4], stroke: line, 'stroke-width': 2.4 });
  }
  if (sp.horn) {
    const hg = E(g, 'g');
    E(hg, 'path', { d: `M-6 ${-hy * 0.86}L0 ${-hy * 1.72}L6 ${-hy * 0.86}Z`, fill: '#ffd76a', stroke: '#b8862a', 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
    for (const k of [0.25, 0.5, 0.72]) {
      const y = -hy * (0.86 + 0.86 * k), w = 6 * (1 - k);
      E(hg, 'path', { d: `M${f1(-w)} ${f1(y + 2)}L${f1(w)} ${f1(y - 2)}`, stroke: '#e0a73a', 'stroke-width': 1.6, 'stroke-linecap': 'round' });
    }
  }
  if (sp.bird) {
    // Little tuft on top.
    E(g, 'path', { d: `M-2 ${-hy + 2}c-6-8 0-14 4-10M2 ${-hy + 1}c2-9 10-9 9-3`, fill: 'none', stroke: line, 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  }
  // Face (moves a little toward where the pet is looking: a 3D head turn).
  const face = E(g, 'g');
  refs.face = face;
  if (sp.stripes) {
    const st = E(g, 'g', { stroke: sp.stripe, 'stroke-width': 3.2, 'stroke-linecap': 'round', fill: 'none' });
    E(st, 'path', { d: `M-8 ${-hy + 3}l2 6M0 ${-hy + 1}v7M8 ${-hy + 3}l-2 6` });
    refs.stripes = st;
  }
  if (sp.eyePatch) for (const s of [-1, 1]) E(face, 'ellipse', { cx: s * hx * 0.36, cy: 1, rx: 7.5, ry: 9.5, fill: sp.limb, transform: `rotate(${s * -24} ${s * hx * 0.36} 1)` });
  // Muzzle.
  const my = hy * 0.4;
  if (sp.ears === 'cat') for (const s of [-1, 1]) E(face, 'ellipse', { cx: s * 6.3, cy: my, rx: 8, ry: 6.3, fill: sp.patch });
  else if (sp.ears === 'bunny') for (const s of [-1, 1]) E(face, 'ellipse', { cx: s * 4.6, cy: my, rx: 6, ry: 5, fill: sp.patch });
  else if (sp.ears === 'floppy') E(face, 'ellipse', { cx: 0, cy: my + 1, rx: 13, ry: 9.5, fill: sp.patch });
  else if (sp.cheeks) E(face, 'ellipse', { cx: 0, cy: my + 3, rx: 17, ry: 10, fill: sp.patch });
  else if (sp.horn) { E(face, 'ellipse', { cx: 0, cy: my + 2, rx: 15, ry: 10, fill: sp.patch }); for (const s of [-1, 1]) E(face, 'ellipse', { cx: s * 5, cy: my + 2, rx: 1.6, ry: 2.2, fill: sp.nose }); }
  // Eyes: open, closed (asleep / blink) and happy (^ ^).
  const ex = hx * 0.36, ey = sp.bird ? -3 : -1;
  const open = E(face, 'g'), closed = E(face, 'g', { display: 'none' }), happy = E(face, 'g', { display: 'none' });
  for (const s of [-1, 1]) {
    E(open, 'ellipse', { cx: s * ex, cy: ey, rx: 5.6, ry: 7, fill: `url(#${uid}eye)` });
    E(open, 'circle', { cx: s * ex + 1.7, cy: ey - 2.6, r: 2.5, fill: '#fff' });
    E(open, 'circle', { cx: s * ex - 1.6, cy: ey + 2.6, r: 1.2, fill: '#fff' });
    E(open, 'circle', { cx: s * ex + 2.6, cy: ey + 1.4, r: 0.6, fill: '#fff', opacity: 0.8 });
    E(closed, 'path', { d: `M${f1(s * ex - 5)} ${ey + 1}q5 4 10 0`, fill: 'none', stroke: sp.eyePatch ? '#fff' : '#2b1f2a', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    E(happy, 'path', { d: `M${f1(s * ex - 5)} ${ey + 2}q5-7 10 0`, fill: 'none', stroke: sp.eyePatch ? '#fff' : '#2b1f2a', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  }
  refs.eyes = { open, closed, happy };
  // Blush.
  for (const s of [-1, 1]) E(face, 'ellipse', { cx: s * hx * 0.63, cy: hy * 0.3, rx: 6.2, ry: 3.8, fill: '#ff8fa8', opacity: 0.6 });
  // Nose and mouth.
  const ny = hy * 0.27;
  const mouth = { smile: E(face, 'g'), open: E(face, 'g', { display: 'none' }), tongue: E(face, 'g', { display: 'none' }) };
  if (sp.bird) {
    E(face, 'path', { d: `M-5 ${ny - 1}L0 ${ny - 6}L5 ${ny - 1}Z`, fill: sp.nose, stroke: line, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
    E(mouth.smile, 'path', { d: `M-5 ${ny - 1}L0 ${ny + 3}L5 ${ny - 1}Z`, fill: '#f08a1c', stroke: line, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
    E(mouth.open, 'path', { d: `M-5 ${ny}L0 ${ny + 7}L5 ${ny}Z`, fill: '#f08a1c', stroke: line, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
    E(mouth.tongue, 'path', { d: `M-5 ${ny}L0 ${ny + 7}L5 ${ny}Z`, fill: '#f08a1c', stroke: line, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
  } else {
    if (sp.ears === 'floppy' || sp.eyePatch) E(face, 'ellipse', { cx: 0, cy: ny, rx: 4.8, ry: 3.4, fill: sp.nose });
    else if (!sp.horn) E(face, 'path', { d: `M-3.6 ${ny - 1.6}h7.2l-3.6 3.8z`, fill: sp.nose, stroke: sp.nose, 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
    const my2 = ny + (sp.horn ? 9 : 2.5);
    const m = { fill: 'none', stroke: line, 'stroke-width': 2, 'stroke-linecap': 'round' };
    E(mouth.smile, 'path', { d: `M-5.5 ${my2}q2.75 3.4 5.5 0q2.75 3.4 5.5 0`, ...m });
    E(mouth.open, 'path', { d: `M-4.5 ${my2}q4.5 9 9 0z`, fill: '#a8354a', stroke: line, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
    E(mouth.open, 'path', { d: `M-2.2 ${my2 + 3.8}q2.2 -2 4.4 0q-2.2 2.2 -4.4 0z`, fill: '#ff8fa3' });
    E(mouth.tongue, 'path', { d: `M-5.5 ${my2}q2.75 3.4 5.5 0q2.75 3.4 5.5 0`, ...m });
    E(mouth.tongue, 'path', { d: `M-3 ${my2 + 1.6}q3 8 6 0z`, fill: '#ff7f98', stroke: line, 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
    if (sp.ears === 'bunny') E(mouth.smile, 'rect', { x: -2.4, y: my2 + 1.6, width: 4.8, height: 3.6, rx: 1, fill: '#fff', stroke: line, 'stroke-width': 1.2 });
  }
  refs.mouth = mouth;
  if (sp.whiskers) {
    const w = E(face, 'g', { stroke: line, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.8 });
    for (const s of [-1, 1]) {
      E(w, 'path', { d: `M${s * 13} ${ny + 1}l${s * 11} -3M${s * 13} ${ny + 4}l${s * 11} 2`, fill: 'none' });
    }
  }
  void uid;
  return refs;
}

// ---------------------------------------------------------------- rig
export function createPet(species) {
  const sp = SPECIES[species] || SPECIES['pet-kitten'];
  const uid = `pr${++uidCount}`;
  const root = E(null, 'g', { class: 'pet-rig' });
  const flip = E(root, 'g'); // mirrors only the non-face parts when needed
  const { line, fur, far, legLen: L, rx, ry } = sp;
  const ink = { stroke: line, 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
  const legW = sp.gait === 'scurry' ? 9 : sp.gait === 'prance' ? 9 : 10;
  const limb = sp.limb || fur, limbFar = sp.limb || far;
  const cy = -(L + ry * 0.72);

  // ---- side view (facing right)
  const side = E(flip, 'g');
  const tailG = E(side, 'g');
  let tail = null, tail2 = [];
  if (sp.tail === 'cat' || sp.tail === 'dog') tail = tube(tailG, sp.tail === 'cat' ? 8 : 8, fur, line);
  else if (sp.tail === 'rainbow') tail2 = RAINBOW.slice(0, 4).map((c) => tube(tailG, 6, c, line));
  const pomTail = sp.tail === 'pom' || sp.tail === 'panda' ? E(tailG, 'circle', { r: sp.tail === 'pom' ? 8 : 6.5, fill: sp.tail === 'pom' ? '#fff' : sp.limb, ...ink }) : null;
  const birdTail = sp.tail === 'bird' ? E(tailG, 'path', { d: 'M0 0l-12-8 3 8-5 4z', fill: far, ...ink }) : null;
  const mkLeg = (col) => ({ t: tube(side, legW, col, line), paw: E(side, 'ellipse', { rx: 6.5, ry: 4.2, fill: sp.hoof || col, ...ink }) });
  const legs = sp.bird ? [mkLeg('#ff9f2e'), mkLeg('#ff9f2e')] : [mkLeg(limbFar), mkLeg(limbFar), mkLeg(limb), mkLeg(limb)];
  if (sp.bird) for (const lg of legs) { lg.t.colour('#ffa938'); lg.t.g.firstChild.setAttribute('stroke-width', 7); lg.t.g.lastChild.setAttribute('stroke-width', 3); lg.paw.setAttribute('fill', '#ffa938'); }
  const clipId = `${uid}c`;
  const defs = E(root, 'defs');
  const rg = (id, c) => { const g = E(defs, 'radialGradient', { id, cx: 0.38, cy: 0.32, r: 0.75 }); E(g, 'stop', { offset: 0, 'stop-color': tint(c, 1.35) }); E(g, 'stop', { offset: 0.6, 'stop-color': c }); E(g, 'stop', { offset: 1, 'stop-color': tint(c, 0.9) }); };
  rg(`${uid}hf`, fur); rg(`${uid}bf`, fur);
  const eg = E(defs, 'linearGradient', { id: `${uid}eye`, x1: 0, y1: 0, x2: 0, y2: 1 });
  E(eg, 'stop', { offset: 0.35, 'stop-color': '#1e1622' }); E(eg, 'stop', { offset: 1, 'stop-color': EYE[species] || '#5a3a24' });
  const clip = E(defs, 'clipPath', { id: clipId });
  E(clip, 'ellipse', { cx: 0, cy, rx, ry });
  const sideBody = E(side, 'g');
  E(sideBody, 'ellipse', { cx: 0, cy, rx, ry, fill: `url(#${uid}bf)`, ...ink });
  const sbClip = E(sideBody, 'g', { 'clip-path': `url(#${clipId})` });
  E(sbClip, 'ellipse', { cx: rx * 0.3, cy: cy + ry * 0.75, rx: rx * 0.62, ry: ry * 0.55, fill: sp.patch });
  if (sp.limb) E(sbClip, 'ellipse', { cx: rx * 0.42, cy: cy - ry * 0.1, rx: rx * 0.34, ry: ry * 1.2, fill: sp.limb }); // panda shoulder band
  if (sp.stripes) for (const k of [-0.45, -0.1, 0.25]) E(sbClip, 'path', { d: `M${f1(rx * k)} ${f1(cy - ry)}q3 8 0 13`, stroke: sp.stripe, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' });
  if (sp.spot) E(sbClip, 'ellipse', { cx: -rx * 0.35, cy: cy - ry * 0.55, rx: 11, ry: 8, fill: sp.spot, opacity: 0.55 });
  E(sideBody, 'ellipse', { cx: 0, cy, rx, ry, fill: 'none', ...ink }); // re-ink the edge over the patches
  const wing = sp.bird ? E(side, 'path', { d: `M0 0c-6 0-14 4-14 12 6 0 13-3 14-12z`, fill: far, ...ink }) : null;
  if (sp.horn) { // mane down the neck
    const mn = E(side, 'g');
    [[0.55, -1.15], [0.35, -1.25], [0.12, -1.18]].forEach(([x, y], i) => E(mn, 'circle', { cx: f1(rx * x), cy: f1(cy + ry * y * 0.9), r: 7, fill: RAINBOW[i + 2], stroke: line, 'stroke-width': 2.4 }));
  }

  // ---- front view, standing (used mid-turn and walking toward you)
  const front = E(flip, 'g', { display: 'none' });
  const fLegs = [];
  const fw = rx * 0.62;
  for (const s of sp.bird ? [] : [-1, 1]) {
    const t = tube(front, legW, limbFar, line);
    t.set(`M${f1(s * fw * 0.75)} ${f1(cy)}L${f1(s * fw * 0.8)} -3`);
    E(front, 'ellipse', { cx: f1(s * fw * 0.8), cy: -2, rx: 6, ry: 4, fill: sp.hoof || limbFar, ...ink });
  }
  if (sp.tail === 'cat' || sp.tail === 'dog' || sp.tail === 'rainbow') {
    const t = tube(front, 7, sp.tail === 'rainbow' ? RAINBOW[0] : fur, line);
    t.set(`M${f1(fw * 0.4)} ${f1(cy - 6)}q14 -10 12 -26`);
    fLegs.tailT = t;
  }
  for (const s of [-1, 1]) {
    const t = tube(front, sp.bird ? 3 : legW, sp.bird ? '#ffa938' : limb, line);
    fLegs.push({ t, s });
    fLegs.push({ paw: E(front, 'ellipse', { rx: sp.bird ? 5 : 6.5, ry: sp.bird ? 3 : 4.2, fill: sp.bird ? '#ffa938' : sp.hoof || limb, ...ink }), s });
  }
  E(front, 'ellipse', { cx: 0, cy, rx: fw * 1.05, ry: ry * 1.08, fill: `url(#${uid}bf)`, ...ink });
  if (sp.limb) E(front, 'path', { d: `M${f1(-fw)} ${f1(cy - 4)}Q0 ${f1(cy - ry * 0.7)} ${f1(fw)} ${f1(cy - 4)}L${f1(fw * 0.9)} ${f1(cy + 6)}Q0 ${f1(cy - 6)} ${f1(-fw * 0.9)} ${f1(cy + 6)}Z`, fill: sp.limb });
  E(front, 'ellipse', { cx: 0, cy: cy + ry * 0.25, rx: fw * 0.55, ry: ry * 0.62, fill: sp.patch });

  // ---- sitting (front view, like a cat sitting neatly with a curled tail)
  const sit = E(flip, 'g', { display: 'none' });
  const H = L + ry * 2.1, W = rx * 0.84;
  const sitTail = sp.tail === 'cat' || sp.tail === 'dog' ? tube(sit, 8, fur, line) : null;
  if (sitTail) sitTail.set(`M${f1(W * 0.6)} -6C${f1(W * 1.5)} -4 ${f1(W * 1.55)} ${f1(-H * 0.5)} ${f1(W * 1.15)} ${f1(-H * 0.62)}`);
  const sitRainbow = sp.tail === 'rainbow' ? RAINBOW.slice(0, 4).map((c, i) => { const t = tube(sit, 6, c, line); t.set(`M${f1(W * 0.5)} ${-8 - i * 4}C${f1(W * 1.4)} ${-6 - i * 4} ${f1(W * 1.5)} ${f1(-H * 0.45 - i * 3)} ${f1(W * 1.1 + i * 2)} ${f1(-H * 0.6 - i * 2)}`); return t; }) : null;
  void sitRainbow;
  if (sp.tail === 'pom' || sp.tail === 'panda') E(sit, 'circle', { cx: f1(W * 0.85), cy: -8, r: sp.tail === 'pom' ? 8 : 6, fill: sp.tail === 'pom' ? '#fff' : sp.limb, ...ink });
  if (sp.tail === 'bird') E(sit, 'path', { d: `M${f1(W * 0.7)} ${f1(-H * 0.35)}l12-8-3 8 5 4z`, fill: far, ...ink });
  // haunches and body
  for (const s of sp.bird ? [] : [-1, 1]) E(sit, 'ellipse', { cx: f1(s * W * 0.62), cy: f1(-H * 0.2), rx: f1(W * 0.5), ry: f1(H * 0.22), fill: sp.limb || fur, ...ink });
  E(sit, 'path', { d: `M0 ${f1(-H)}C${f1(-W * 0.62)} ${f1(-H)} ${f1(-W)} ${f1(-H * 0.48)} ${f1(-W)} ${f1(-H * 0.2)}C${f1(-W)} -4 ${f1(-W * 0.6)} 0 0 0C${f1(W * 0.6)} 0 ${f1(W)} -4 ${f1(W)} ${f1(-H * 0.2)}C${f1(W)} ${f1(-H * 0.48)} ${f1(W * 0.62)} ${f1(-H)} 0 ${f1(-H)}Z`, fill: `url(#${uid}bf)`, ...ink });
  if (sp.limb) E(sit, 'path', { d: `M${f1(-W * 0.82)} ${f1(-H * 0.62)}Q0 ${f1(-H * 1.02)} ${f1(W * 0.82)} ${f1(-H * 0.62)}L${f1(W * 0.7)} ${f1(-H * 0.48)}Q0 ${f1(-H * 0.8)} ${f1(-W * 0.7)} ${f1(-H * 0.48)}Z`, fill: sp.limb });
  E(sit, 'ellipse', { cx: 0, cy: f1(-H * 0.42), rx: f1(W * 0.45), ry: f1(H * 0.3), fill: sp.patch });
  if (!sp.bird && !sp.limb) E(sit, 'path', { d: `M${f1(-W * 0.3)} ${f1(-H * 0.68)}l${f1(W * 0.1)} 5 ${f1(W * 0.1)} -4 ${f1(W * 0.1)} 5 ${f1(W * 0.1)} -4 ${f1(W * 0.1)} 5 ${f1(W * 0.1)} -4`, fill: 'none', stroke: tint(sp.patch, 0.9), 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
  if (sp.stripes) for (const s of [-1, 1]) E(sit, 'path', { d: `M${f1(s * W * 0.95)} ${f1(-H * 0.36)}q${s * -6} 2 ${s * -9} 6M${f1(s * W * 0.98)} ${f1(-H * 0.22)}q${s * -6} 2 ${s * -9} 6`, stroke: sp.stripe, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  for (const s of [-1, 1]) E(sit, 'ellipse', { cx: f1(s * W * (sp.bird ? 0.35 : 0.78)), cy: -3.5, rx: sp.bird ? 6 : 9, ry: sp.bird ? 3.5 : 5, fill: sp.bird ? '#ffa938' : sp.hoof || sp.limb || fur, ...ink });
  if (sp.bird) for (const s of [-1, 1]) E(sit, 'path', { d: `M${f1(s * W * 0.95)} ${f1(-H * 0.62)}c${s * 6} 4 ${s * 6} 14 0 20c${s * -4} -6 ${s * -4} -14 0 -20z`, fill: far, ...ink });
  const sitPaws = [-1, 1].map((s) => ({ s, t: tube(sit, legW, limb, line), paw: E(sit, 'ellipse', { rx: 6.2, ry: 4.4, fill: sp.hoof || (sp.limb ? sp.limb : sp.patch), ...ink }), beans: sp.hoof || sp.bird ? null : E(sit, 'g', { fill: '#ffb3c6' }) }));
  for (const pw of sitPaws) if (pw.beans) { for (const [bx, by, r] of [[-3, -0.6, 1.1], [0, -1.6, 1.1], [3, -0.6, 1.1], [0, 1.4, 1.7]]) E(pw.beans, 'circle', { cx: bx, cy: by, r }); }
  if (sp.bird) for (const p of sitPaws) { p.t.g.setAttribute('display', 'none'); p.paw.setAttribute('display', 'none'); }

  // ---- sleeping (curled up loaf)
  const sleep = E(flip, 'g', { display: 'none' });
  const SW = rx * 1.05;
  if (sp.tail === 'cat' || sp.tail === 'dog') { const t = tube(sleep, 8, fur, line); t.set(`M${f1(SW * 0.8)} -14C${f1(SW * 1.1)} -2 ${f1(SW * 0.6)} 2 ${f1(-SW * 0.2)} 0`); }
  if (sp.tail === 'rainbow') RAINBOW.slice(0, 4).forEach((c, i) => { const t = tube(sleep, 5, c, line); t.set(`M${f1(SW * 0.8)} ${-12 - i * 3}C${f1(SW * 1.15)} ${-1 - i} ${f1(SW * 0.6)} ${2 - i} ${f1(-SW * 0.1)} ${-i * 2}`); });
  E(sleep, 'ellipse', { cx: 0, cy: -16, rx: SW, ry: 16.5, fill: sp.limb && false ? sp.limb : fur, ...ink });
  if (sp.limb) E(sleep, 'ellipse', { cx: -SW * 0.45, cy: -14, rx: SW * 0.3, ry: 14, fill: sp.limb });
  if (sp.stripes) for (const k of [0, 0.3, 0.6]) E(sleep, 'path', { d: `M${f1(SW * k)} -32q4 6 1 11`, stroke: sp.stripe, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  if (sp.tail === 'pom' || sp.tail === 'panda') E(sleep, 'circle', { cx: f1(SW * 0.95), cy: -14, r: 7, fill: sp.tail === 'pom' ? '#fff' : sp.limb, ...ink });
  E(sleep, 'ellipse', { cx: 0, cy: -16, rx: SW, ry: 16.5, fill: 'none', ...ink });
  for (const s of [-1, 1]) E(sleep, 'ellipse', { cx: f1(-SW * 0.45 + s * 8), cy: -4.5, rx: 7, ry: 4.4, fill: sp.hoof || sp.limb || sp.patch, ...ink });

  // ---- head (shared by every pose)
  const headG = E(root, 'g');
  const head = buildHead(headG, sp, uid);

  // ---- state
  const views = { side, front, sit, sleep };
  let shown = 'side';
  const show = (v) => { if (v === shown) return; views[shown].setAttribute('display', 'none'); views[v].setAttribute('display', 'inline'); shown = v; };
  let eyesNow = 'open', mouthNow = 'smile';
  const setEyes = (k) => { if (k === eyesNow) return; head.eyes[eyesNow].setAttribute('display', 'none'); head.eyes[k].setAttribute('display', 'inline'); eyesNow = k; };
  const setMouth = (k) => { if (k === mouthNow) return; head.mouth[mouthNow].setAttribute('display', 'none'); head.mouth[k].setAttribute('display', 'inline'); mouthNow = k; };
  const hipF = rx * 0.55, hipB = -rx * 0.55, hipY = cy + ry * 0.35;
  const headSide = { x: rx * 0.86, y: cy - ry - sp.hy * 0.45 };
  const headFront = { x: 0, y: cy - ry - sp.hy * 0.5 };
  const headSit = { x: 0, y: -H - sp.hy * 0.55 };
  const headSleep = { x: -SW * 0.45, y: -28 };
  let mouthPos = { x: 0, y: 0 };

  /**
   * Pose the pet. p: { view: 'move'|'sit'|'sleep', theta, phase, stride,
   * eyes, mouth, look, headDy, tilt, tailPhase, lick (0..1), squash }.
   */
  function pose(p) {
    const view = p.view || 'move';
    const c = Math.cos(p.theta || 0);
    const dir = c >= 0 ? 1 : -1;
    const stride = p.stride ?? 0;
    const ph = p.phase || 0;
    let bodyY = 0, hx = 0, hy = 0, tilt = p.tilt || 0, hs = 1;
    const tp = p.tailPhase || 0;
    if (view === 'move') {
      const frontish = Math.abs(c) < 0.55;
      show(frontish ? 'front' : 'side');
      if (!frontish) {
        flip.setAttribute('transform', `scale(${f1(c * 100) / 100} 1)`);
        // Gait.
        let lift = 0;
        if (sp.gait === 'hop') {
          const air = Math.max(0, Math.sin(ph));
          lift = air * 16 * stride;
          const a = air * 0.9 * stride;
          setLeg(0, hipB - 2, -a * 0.9, true); setLeg(1, hipF - 2, a * 0.6); setLeg(2, hipB + 4, -a, true); setLeg(3, hipF + 4, a * 0.7);
        } else if (sp.bird) {
          const a = Math.sin(ph) * 0.6 * stride;
          setLeg(0, -4, a, false, 1); setLeg(1, 5, -a, false, 1);
          lift = Math.abs(Math.sin(ph)) * 2 * stride;
        } else {
          const amp = (sp.gait === 'prance' ? 0.75 : sp.gait === 'scurry' ? 0.9 : sp.gait === 'waddle' ? 0.42 : 0.55) * stride;
          const s1 = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
          setLeg(0, hipB - 4, s1 * amp); setLeg(1, hipF - 4, s2 * amp);
          setLeg(2, hipB + 4, s2 * amp); setLeg(3, hipF + 4, s1 * amp);
          lift = Math.abs(Math.cos(ph)) * (sp.gait === 'prance' ? 5 : 2.4) * stride;
        }
        bodyY = -lift;
        side.setAttribute('transform', `translate(0 ${f1(bodyY)})${sp.gait === 'waddle' ? ` rotate(${f1(Math.sin(ph) * 3 * stride)} 0 ${f1(cy)})` : ''}`);
        setTail(tp, stride);
        if (wing) wing.setAttribute('transform', `translate(${f1(rx * 0.05)} ${f1(cy - 4)}) rotate(${f1(-10 - Math.abs(Math.sin(ph * 2)) * 25 * stride)})`);
        hx = headSide.x * c; hy = headSide.y + bodyY + (sp.gait === 'hop' ? 0 : Math.sin(ph * 2) * 1.2 * stride);
      } else {
        flip.setAttribute('transform', '');
        const a = Math.sin(ph) * 5 * stride;
        bodyY = -Math.abs(a) * 0.4;
        front.setAttribute('transform', `translate(0 ${f1(bodyY)})`);
        let k = 0;
        for (const it of fLegs) {
          if (it.t) { const lift = it.s < 0 ? Math.max(0, a) : Math.max(0, -a); it.t.set(`M${f1(it.s * 8)} ${f1(cy + ry * 0.4)}L${f1(it.s * 8.5)} ${f1(-3 - lift - bodyY)}`); }
          else { const lift = it.s < 0 ? Math.max(0, a) : Math.max(0, -a); it.paw.setAttribute('cx', f1(it.s * 8.5)); it.paw.setAttribute('cy', f1(-2 - lift - bodyY)); }
          k++;
        }
        hx = headSide.x * c; hy = headFront.y + bodyY;
      }
    } else if (view === 'sit') {
      show('sit');
      flip.setAttribute('transform', '');
      const sq = p.squash || 0;
      sit.setAttribute('transform', sq ? `translate(0 0) scale(${1 + sq * 0.06} ${1 - sq * 0.08})` : '');
      const lick = p.lick || 0;
      for (const pw of sitPaws) {
        const x0 = pw.s * 8.5, y0 = -H * 0.6;
        let x1 = pw.s * 8.5, y1 = -5;
        if (pw.s > 0 && lick > 0) { x1 = 7 - lick * 4; y1 = -5 - lick * (H * 0.62); }
        pw.t.set(`M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}`);
        pw.paw.setAttribute('cx', f1(x1)); pw.paw.setAttribute('cy', f1(y1 + 0.5));
        if (pw.beans) pw.beans.setAttribute('transform', `translate(${f1(x1)} ${f1(y1 + 0.5)})`);
      }
      if (sitTail) {
        const w = Math.sin(tp) * 6;
        sitTail.set(`M${f1(W * 0.6)} -6C${f1(W * 1.5)} -4 ${f1(W * 1.55 + w * 0.5)} ${f1(-H * 0.5)} ${f1(W * 1.15 + w)} ${f1(-H * 0.62 - Math.abs(w) * 0.3)}`);
      }
      hx = 0; hy = headSit.y + (p.headDy || 0) + sq * 3;
      if (lick > 0) tilt = (p.tilt || 0) - 6 * lick;
    } else {
      show('sleep');
      flip.setAttribute('transform', `scale(${dir} 1)`);
      const br = Math.sin(ph) * 0.025;
      sleep.setAttribute('transform', `translate(0 ${f1(-16 * br)}) scale(1 ${1 + br})`);
      hx = headSleep.x * dir; hy = headSleep.y - Math.sin(ph) * 0.6; tilt = -10 * dir; hs = 0.9;
    }
    // Head.
    const look = view === 'move' ? c : (p.look || 0);
    headG.setAttribute('transform', `translate(${f1(hx)} ${f1(hy + (view === 'move' ? p.headDy || 0 : 0))}) rotate(${f1(tilt)}) scale(${hs})`);
    head.face.setAttribute('transform', `translate(${f1(look * 5)} 0)`);
    head.ears.setAttribute('transform', `translate(${f1(look * 1.6)} 0)`);
    if (head.stripes) head.stripes.setAttribute('transform', `translate(${f1(look * 3)} 0)`);
    if (head.earL) {
      const w = Math.sin(tp * 0.5) * 4;
      head.earL.setAttribute('transform', `translate(${f1(-sp.hx * 0.38)} ${f1(-sp.hy * 0.72)}) rotate(${f1(-10 + w - (view === 'sleep' ? 40 : 0))})`);
      head.earR.setAttribute('transform', `translate(${f1(sp.hx * 0.38)} ${f1(-sp.hy * 0.72)}) rotate(${f1(10 + (p.earFlop ? 28 : 0) + (view === 'sleep' ? 40 : 0))})`);
    }
    if (head.flopL) {
      const w = Math.sin(ph * 2) * 6 * (view === 'move' ? stride : 0);
      head.flopL.setAttribute('transform', `translate(${f1(-sp.hx * 0.8)} ${f1(-sp.hy * 0.62)}) rotate(${f1(w)})`);
      head.flopR.setAttribute('transform', `translate(${f1(sp.hx * 0.8)} ${f1(-sp.hy * 0.62)}) rotate(${f1(-w)})`);
    }
    setEyes(view === 'sleep' ? 'closed' : p.eyes || 'open');
    setMouth(view === 'sleep' ? 'smile' : p.mouth || 'smile');
    mouthPos = { x: hx + look * 5, y: hy + sp.hy * 0.42 + (view === 'move' ? p.headDy || 0 : 0) };
  }

  function setLeg(i, hipX, angle, tuck = false, bird = 0) {
    const lg = legs[i];
    const hy0 = bird ? cy + ry * 0.6 : hipY;
    const ll = (-hy0 - 3) * (tuck ? 0.85 : 1);
    const fx = hipX + Math.sin(angle) * ll;
    const fy = hy0 + Math.cos(angle) * ll;
    lg.t.set(`M${f1(hipX)} ${f1(hy0)}L${f1(fx)} ${f1(fy)}`);
    lg.paw.setAttribute('cx', f1(fx + 2)); lg.paw.setAttribute('cy', f1(fy + 0.8));
  }

  function setTail(tp, stride) {
    const bx = -rx * 0.92, by = cy - ry * 0.25;
    if (tail && sp.tail === 'cat') {
      const w = Math.sin(tp) * 7;
      tail.set(`M${f1(bx + 4)} ${f1(by)}C${f1(bx - 18)} ${f1(by - 2)} ${f1(bx - 16 + w * 0.4)} ${f1(by - 26)} ${f1(bx - 6 + w)} ${f1(by - 36)}`);
    } else if (tail) {
      const w = Math.sin(tp * 2.4) * 9;
      tail.set(`M${f1(bx + 4)} ${f1(by)}Q${f1(bx - 10)} ${f1(by - 8)} ${f1(bx - 8 + w)} ${f1(by - 22)}`);
    } else if (tail2.length) {
      tail2.forEach((t, i) => {
        const w = Math.sin(tp - i * 0.5) * 4;
        t.set(`M${f1(bx + 4)} ${f1(by - 2 + i * 3)}C${f1(bx - 14)} ${f1(by - 8 + i * 3)} ${f1(bx - 20 + w)} ${f1(by + 8 + i * 3)} ${f1(bx - 18 + w * 1.5)} ${f1(by + 20 + i * 2)}`);
      });
    }
    if (pomTail) { pomTail.setAttribute('cx', f1(bx + 1)); pomTail.setAttribute('cy', f1(by - 2)); }
    if (birdTail) birdTail.setAttribute('transform', `translate(${f1(-rx * 0.85)} ${f1(cy - 4)}) rotate(${f1(Math.sin(tp) * 8)})`);
    void stride;
  }

  pose({ view: 'sit' });
  return {
    el: root,
    species: sp,
    pose,
    /** Where the mouth is, in local units (for carrying the ball). */
    mouth: () => mouthPos,
    height: H + sp.hy * 1.5,
  };
}

/** A still picture of a pet sitting (for shop cards, home and the album). */
export function petSVG(species, { size = 110, label = 'Pet', pose = { view: 'sit' } } = {}) {
  const rig = createPet(species);
  rig.pose(pose);
  const svgEl = document.createElementNS(NS, 'svg');
  svgEl.setAttribute('viewBox', '-62 -118 124 124');
  svgEl.setAttribute('width', size);
  svgEl.setAttribute('height', size);
  svgEl.setAttribute('role', 'img');
  svgEl.setAttribute('aria-label', label);
  svgEl.appendChild(rig.el);
  return svgEl;
}
