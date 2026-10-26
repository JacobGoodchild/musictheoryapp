// The player's avatar as a full-body figure for the pet house and the
// supermarket. The head, face, hair and hats are the exact avatar layers from
// src/art/avatar.js; the body is drawn here in the outfit's colours and posed
// every frame (stand, walk, sit, crouch to stroke the pet, wave, throw, push).
//
// Local coordinates: feet on y = 0, centred on x = 0, about 215 units tall.
import { avatarHeadParts } from '../art/avatar.js';

const NS = 'http://www.w3.org/2000/svg';
const f1 = (n) => Math.round(n * 10) / 10;

function E(parent, tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (parent) parent.appendChild(e);
  return e;
}

/** Parse app-authored SVG markup (never user text) into a group. */
function parseInto(g, markup) {
  const doc = new DOMParser().parseFromString(`<svg xmlns="${NS}">${markup}</svg>`, 'image/svg+xml');
  for (const n of [...doc.documentElement.childNodes]) g.appendChild(document.importNode(n, true));
}

function shade(hex, k) {
  const m = /^#([0-9a-f]{6})/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0');
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

function limb(parent, width, colour) {
  const g = E(parent, 'g');
  const p = E(g, 'path', { fill: 'none', stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return { g, set(d) { p.setAttribute('d', d); }, colour(c) { p.setAttribute('stroke', c); } };
}

export function createGirl(equipped) {
  const parts = avatarHeadParts(equipped);
  const o = parts.outfit;
  const skin = parts.skin;
  const main = o.cape ? o.colour : o.colour;
  const isDress = !!o.dress;
  const bottom = isDress ? main : o.overlay || '#6f8fd8';
  const sleeve = o.cardigan || (o.cape ? o.colour : main);
  const shoe = '#ff6f9a';
  const root = E(null, 'g', { class: 'girl-rig' });
  E(root, 'defs').innerHTML = '';
  parseInto(root, parts.defs);

  const body = E(root, 'g');
  const backHair = E(body, 'g');
  parseInto(backHair, parts.back);
  backHair.setAttribute('transform', 'translate(-100 -266)');
  if (o.cape) E(body, 'path', { d: 'M-24-122C-40-90-44-60-46-44h92c-2-16-6-46-22-78z', fill: o.cape });

  // Legs and shoes (behind the clothes).
  const legs = [limb(body, 13, skin), limb(body, 13, skin)];
  const shoes = [E(body, 'ellipse', { rx: 10, ry: 6, fill: shoe }), E(body, 'ellipse', { rx: 10, ry: 6, fill: shoe })];
  const socks = [E(body, 'circle', { r: 1, fill: '#fff' }), E(body, 'circle', { r: 1, fill: '#fff' })];
  void socks;
  // Arms: sleeve + skin + hand.
  const arms = [0, 1].map(() => ({ skin: limb(body, 11, skin), sleeve: limb(body, 15, sleeve), hand: E(body, 'circle', { r: 7, fill: skin }) }));
  const backArm = E(body, 'g'); const frontArmG = E(body, 'g');
  void backArm; void frontArmG;

  // Torso.
  const torso = E(body, 'g');
  E(torso, 'rect', { x: -7, y: -132, width: 14, height: 14, rx: 5, fill: skin });
  if (isDress) {
    E(torso, 'path', { d: 'M-22-124Q0-130 22-124L26-92L42-44Q0-34-42-44L-26-92Z', fill: main });
    if (o.tutu) E(torso, 'path', { d: 'M-40-60q6-6 10 0q6-6 10 0q6-6 10 0q6-6 10 0q6-6 10 0q6-6 10 0q6-6 10 0q6-6 10 0l4 16q-46 10-88 0z', fill: '#ffd6e8' });
    if (o.dots) [[-14, -100], [10, -108], [-22, -62], [4, -78], [24, -58], [-4, -52]].forEach(([x, y]) => E(torso, 'circle', { cx: x, cy: y, r: 3.2, fill: o.dots }));
    if (o.sparkle) [[-12, -96], [12, -80], [-20, -56], [18, -54]].forEach(([x, y]) => E(torso, 'path', { d: `M${x} ${y - 4}l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z`, fill: '#f5d27a' }));
    E(torso, 'path', { d: 'M-26-92q26 6 52 0', stroke: shade(main, 0.85), 'stroke-width': 3, fill: 'none' });
  } else {
    // Skirt or shorts first, then the top.
    if (o.overlay && o.id === 'dungarees') E(torso, 'path', { d: 'M-24-80h48l4 26h-20l-2-6h-12l-2 6h-20z', fill: bottom });
    else E(torso, 'path', { d: 'M-24-80h48l14 30q-38 10-76 0z', fill: bottom });
    E(torso, 'path', { d: 'M-22-124Q0-130 22-124L26-76Q0-70-26-76Z', fill: main });
    if (o.stripes) for (const y of [-112, -100, -88]) E(torso, 'path', { d: `M-25 ${y}h50`, stroke: o.stripes, 'stroke-width': 5 });
    if (o.cardigan) { E(torso, 'path', { d: 'M-22-124Q-10-127-4-127L-6-74Q-16-74-26-76Z', fill: o.cardigan }); E(torso, 'path', { d: 'M22-124Q10-127 4-127L6-74Q16-74 26-76Z', fill: o.cardigan }); }
    if (o.overlay) { E(torso, 'path', { d: 'M-14-108h28v34h-28z', fill: o.overlay }); E(torso, 'path', { d: 'M-12-108l-6-16M12-108l6-16', stroke: o.overlay, 'stroke-width': 5 }); E(torso, 'circle', { cx: -9, cy: -104, r: 2.4, fill: '#ffd84d' }); E(torso, 'circle', { cx: 9, cy: -104, r: 2.4, fill: '#ffd84d' }); }
    if (o.collar2) E(torso, 'path', { d: 'M-14-126l14 14 14-14 5 7-19 15-19-15z', fill: o.collar2 });
    if (o.hoodie) E(torso, 'path', { d: 'M-14-126q14 12 28 0', stroke: '#0002', 'stroke-width': 5, fill: 'none' });
    if (o.cape) [[-10, -100], [10, -92]].forEach(([x, y]) => E(torso, 'path', { d: `M${x} ${y - 4}l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z`, fill: '#f5c542' }));
  }
  const frontArms = E(body, 'g');
  // Head on top.
  const headG = E(body, 'g');
  const headInner = E(headG, 'g', { transform: 'translate(-100 -266)' });
  parseInto(headInner, parts.head);
  const fx = E(root, 'g'); // hearts, sparkles (drawn by the scene)
  void fx;

  const shoulders = [[-22, -118], [22, -118]];
  const hips = [[-10, -58], [10, -58]];
  let handPos = [{ x: -30, y: -70 }, { x: 30, y: -70 }];

  function setArm(i, angle, bend = 0, front = false) {
    // angle: radians from pointing down; positive swings outward (away from body).
    const [sx, sy] = shoulders[i];
    const side = i === 0 ? -1 : 1;
    const L1 = 24, L2 = 22;
    const a1 = angle, a2 = angle + bend;
    const ex = sx + side * Math.sin(a1) * L1, ey = sy + Math.cos(a1) * L1;
    const hx = ex + side * Math.sin(a2) * L2, hy = ey + Math.cos(a2) * L2;
    const arm = arms[i];
    arm.skin.set(`M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}L${f1(hx)} ${f1(hy)}`);
    arm.sleeve.set(`M${f1(sx)} ${f1(sy)}L${f1(sx + (ex - sx) * 0.45)} ${f1(sy + (ey - sy) * 0.45)}`);
    arm.hand.setAttribute('cx', f1(hx)); arm.hand.setAttribute('cy', f1(hy));
    const parent = front ? frontArms : body;
    for (const n of [arm.skin.g, arm.sleeve.g, arm.hand]) if (n.parentNode !== parent) (front ? frontArms.appendChild(n) : body.insertBefore(n, torso));
    handPos[i] = { x: hx, y: hy };
  }

  function setLeg(i, hipX, hipY, kneeX, kneeY, footX, footY) {
    legs[i].set(`M${f1(hipX)} ${f1(hipY)}L${f1(kneeX)} ${f1(kneeY)}L${f1(footX)} ${f1(footY)}`);
    shoes[i].setAttribute('cx', f1(footX + (i === 0 ? -2 : 2))); shoes[i].setAttribute('cy', f1(footY - 3));
  }

  /**
   * p: { pose: 'stand'|'walk'|'sit'|'crouch'|'wave'|'throw'|'push'|'hold',
   *      phase, dir (-1 left / 1 right), t (0..1 for throw), stroke (phase) }
   */
  function pose(p) {
    const ph = p.phase || 0;
    const dir = p.dir || 1;
    let dy = 0, lean = 0;
    const pz = p.pose || 'stand';
    if (pz === 'walk' || pz === 'push') {
      const s = Math.sin(ph);
      dy = -Math.abs(Math.cos(ph)) * 3;
      for (const i of [0, 1]) {
        const sw = (i === 0 ? s : -s) * 9;
        const lift = Math.max(0, i === 0 ? -Math.cos(ph) : Math.cos(ph)) * 7;
        setLeg(i, hips[i][0], hips[i][1], hips[i][0] + sw * 0.5, -30 - lift * 0.4, hips[i][0] + sw, -dy - lift + 0);
      }
      if (pz === 'push') { const i = dir > 0 ? 1 : 0; setArm(i, 1.25, 0.1, true); setArm(1 - i, -0.9, -0.3, true); }
      else { setArm(0, 0.18 + s * 0.35, -0.1); setArm(1, 0.18 - s * 0.35, -0.1); }
      lean = dir * 3;
    } else if (pz === 'sit') {
      dy = 22;
      for (const i of [0, 1]) setLeg(i, hips[i][0] * 1.1, hips[i][1], hips[i][0] * 1.35, -50, hips[i][0] * 1.35 + Math.sin(ph + i * 2) * 1.5, -dy);
      setArm(0, 0.5, -0.45); setArm(1, 0.5, -0.45);
    } else if (pz === 'crouch') {
      dy = 30;
      for (const i of [0, 1]) setLeg(i, hips[i][0], hips[i][1], hips[i][0] + (i === 0 ? -16 : 16), -24 - dy + 6, hips[i][0] * 1.2, -dy);
      const st = Math.sin(p.stroke || 0);
      const near = dir > 0 ? 1 : 0, other = 1 - near;
      setArm(near, 1.45 + st * 0.12, 0.35 - st * 0.15, true);
      setArm(other, 0.35, -0.2);
    } else {
      for (const i of [0, 1]) setLeg(i, hips[i][0], hips[i][1], hips[i][0], -30, hips[i][0] * 1.1, 0);
      const br = Math.sin(ph * 0.5) * 0.03;
      if (pz === 'wave') { setArm(1, 2.1 + Math.sin(ph * 3) * 0.25, 0.5, true); setArm(0, 0.2, -0.1); }
      else if (pz === 'throw') { const t = p.t || 0; const a = t < 0.5 ? 1.4 + t * 3 : 2.9 - (t - 0.5) * 5; const i = dir > 0 ? 1 : 0; setArm(i, a, 0, true); setArm(1 - i, 0.25, -0.1); }
      else if (pz === 'hold') { const i = dir > 0 ? 1 : 0; setArm(i, 1.1, 0.4, true); setArm(1 - i, 0.2 + br, -0.1); }
      else { setArm(0, 0.2 + br, -0.1); setArm(1, 0.2 + br, -0.1); }
    }
    body.setAttribute('transform', `translate(0 ${f1(dy)}) rotate(${f1(lean * 0.5)} 0 0)`);
    headG.setAttribute('transform', `translate(${f1(dir * (pz === 'crouch' ? 4 : 1.5))} ${pz === 'walk' ? f1(Math.sin(ph * 2) * 0.8) : 0}) rotate(${f1(pz === 'crouch' ? dir * 8 : lean * 0.6)} 0 -150)`);
  }

  pose({ pose: 'stand' });
  return {
    el: root,
    pose,
    /** A hand position in local units (0 = left hand, 1 = right hand). */
    hand: (i) => handPos[i],
    height: 215,
  };
}
