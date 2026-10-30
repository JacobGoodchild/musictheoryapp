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
  const onesie = !!o.onesie;
  const bot = parts.bottoms || { colour: '#6f8fd8', kind: 'skirt' };
  const bottom = isDress ? main : onesie ? main : o.id === 'dungarees' ? o.overlay : bot.colour;
  const sleeve = o.cardigan || (o.cape ? o.colour : main);
  const sh = parts.shoes || { colour: '#ff6f9a' };
  const shoe = sh.colour;
  const legCol = onesie ? main : !isDress && o.id !== 'dungarees' && bot.kind === 'trousers' ? bot.colour : skin;
  const armCol = onesie ? main : skin;
  const root = E(null, 'g', { class: 'girl-rig' });
  E(root, 'defs').innerHTML = '';
  parseInto(root, parts.defs);

  const body = E(root, 'g');
  const backHair = E(body, 'g');
  parseInto(backHair, parts.back);
  backHair.setAttribute('transform', 'translate(-100 -266)');
  if (o.cape) E(body, 'path', { d: 'M-24-122C-40-90-44-60-46-44h92c-2-16-6-46-22-78z', fill: o.cape });

  // Legs and shoes (behind the clothes).
  const legs = [limb(body, legCol === skin ? 13 : 15, legCol), limb(body, legCol === skin ? 13 : 15, legCol)];
  const shoeAttrs = { rx: sh.tall ? 11 : 10, ry: sh.tall ? 8 : 6, fill: shoe, stroke: sh.sole || (sh.bunny ? '#ffc2d6' : 'none'), 'stroke-width': 2 };
  const shoes = [E(body, 'ellipse', shoeAttrs), E(body, 'ellipse', shoeAttrs)];
  const socks = [E(body, 'circle', { r: 1, fill: '#fff' }), E(body, 'circle', { r: 1, fill: '#fff' })];
  void socks;
  // Arms: sleeve + skin + hand.
  const arms = [0, 1].map(() => ({ skin: limb(body, onesie ? 14 : 11, armCol), sleeve: limb(body, 15, sleeve), hand: E(body, 'circle', { r: 7, fill: skin }) }));
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
  } else if (onesie) {
    E(torso, 'path', { d: 'M-22-124Q0-130 22-124L26-64Q26-54 14-54H-14Q-26-54-26-64Z', fill: main });
    E(torso, 'path', { d: 'M0-122V-62', stroke: shade(main, 0.85), 'stroke-width': 2.5 });
    if (o.dots) [[-12, -104], [12, -96], [-10, -76], [12, -70]].forEach(([x, y]) => E(torso, 'path', { d: `M${x} ${y - 4}l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z`, fill: '#fff' }));
    else E(torso, 'ellipse', { cx: 0, cy: -84, rx: 13, ry: 18, fill: '#fff', opacity: 0.55 });
  } else {
    // Skirt, shorts or trousers first, then the top.
    const k = o.id === 'dungarees' ? 'shorts' : bot.kind;
    if (k === 'shorts') E(torso, 'path', { d: 'M-24-80h48l4 26h-22l-2-10-2 10h-22z', fill: bottom });
    else if (k === 'trousers') E(torso, 'path', { d: 'M-24-80h48l2 24h-52z', fill: bottom });
    else if (k === 'tutu') E(torso, 'path', { d: 'M-24-80h48l18 22q-4 6-9 2q-5 6-10 1q-5 6-10 1q-5 6-10 1q-5 6-10 1q-5 6-10 1q-5 6-10-2q-5 4-9-2z', fill: bottom });
    else E(torso, 'path', { d: 'M-24-80h48l14 30q-38 10-76 0z', fill: bottom });
    if (bot.seam && k === 'trousers') E(torso, 'path', { d: 'M-24-74h48', stroke: bot.seam, 'stroke-width': 2 });
    if (bot.pleats && k === 'skirt') for (const x of [-20, -8, 4, 16]) E(torso, 'path', { d: `M${x} -78l${x / 6} 26`, stroke: shade(bottom, 0.8), 'stroke-width': 2 });
    if (bot.sparkle && k === 'skirt') [[-14, -66], [8, -60], [20, -70]].forEach(([x, y]) => E(torso, 'path', { d: `M${x} ${y - 4}l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z`, fill: '#fff' }));
    E(torso, 'path', { d: 'M-22-124Q0-130 22-124L26-76Q0-70-26-76Z', fill: main });
    if (o.stripes) for (const y of [-112, -100, -88]) E(torso, 'path', { d: `M-25 ${y}h50`, stroke: o.stripes, 'stroke-width': 5 });
    if (o.cardigan) { E(torso, 'path', { d: 'M-22-124Q-10-127-4-127L-6-74Q-16-74-26-76Z', fill: o.cardigan }); E(torso, 'path', { d: 'M22-124Q10-127 4-127L6-74Q16-74 26-76Z', fill: o.cardigan }); }
    if (o.overlay) { E(torso, 'path', { d: 'M-14-108h28v34h-28z', fill: o.overlay }); E(torso, 'path', { d: 'M-12-108l-6-16M12-108l6-16', stroke: o.overlay, 'stroke-width': 5 }); E(torso, 'circle', { cx: -9, cy: -104, r: 2.4, fill: '#ffd84d' }); E(torso, 'circle', { cx: 9, cy: -104, r: 2.4, fill: '#ffd84d' }); }
    if (o.collar2) E(torso, 'path', { d: 'M-14-126l14 14 14-14 5 7-19 15-19-15z', fill: o.collar2 });
    if (o.hoodie) E(torso, 'path', { d: 'M-14-126q14 12 28 0', stroke: '#0002', 'stroke-width': 5, fill: 'none' });
    if (o.cape) [[-10, -100], [10, -92]].forEach(([x, y]) => E(torso, 'path', { d: `M${x} ${y - 4}l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z`, fill: '#f5c542' }));
  }
  const frontArms = E(body, 'g');
  // A book to read (hidden unless reading).
  const book = E(frontArms, 'g', { display: 'none' });
  const bookCover = E(book, 'path', { d: 'M-31-106h62v44h-62z', fill: '#6f8fd8', stroke: '#4a3040', 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  E(book, 'path', { d: 'M-28-103q14-5 28 0v38q-14-5-28 0zM28-103q-14-5-28 0v38q14-5 28 0z', fill: '#fffdf6', stroke: '#4a3040', 'stroke-width': 1.6 });
  E(book, 'path', { d: 'M-23-94h17M-23-88h17M-23-82h12M6-94h17M6-88h17M6-82h12', stroke: '#c9c3d6', 'stroke-width': 1.6 });
  // Head on top (hood ears from a onesie go behind it).
  const headG = E(body, 'g');
  if (o.ears === 'bunny') for (const x of [-18, 18]) { E(headG, 'ellipse', { cx: x, cy: -224, rx: 9, ry: 24, fill: main, transform: `rotate(${x / 2} ${x} -210)` }); E(headG, 'ellipse', { cx: x, cy: -222, rx: 4.5, ry: 16, fill: '#ffc2d6', transform: `rotate(${x / 2} ${x} -210)` }); }
  if (o.ears === 'cat' || o.ears === 'unicorn') for (const sx of [-1, 1]) E(headG, 'path', { d: `M${sx * 38} -192L${sx * 32} -226L${sx * 12} -208Z`, fill: main });
  if (o.ears === 'unicorn') E(headG, 'path', { d: 'M-6-208L0-240L6-208Z', fill: '#ffd76a' });
  if (o.ears === 'dino') for (const [x, y] of [[-26, -200], [-10, -212], [8, -213], [24, -202]]) E(headG, 'path', { d: `M${x - 8} ${y + 6}L${x} ${y - 10}L${x + 8} ${y + 6}Z`, fill: '#5fae5a' });
  if (o.onesie && o.ears) E(headG, 'path', { d: 'M-45-150Q-50-214 0-216Q50-214 45-150', fill: 'none', stroke: main, 'stroke-width': 9, 'stroke-linecap': 'round' });
  const headInner = E(headG, 'g', { transform: 'translate(-100 -266)' });
  parseInto(headInner, parts.headBase);
  // Facial expressions drawn over the face (avatar coordinates, head centre 100,96).
  const faceG = E(headInner, 'g', { display: 'none' });
  parseInto(headInner, parts.headTop);
  const ec = parts.eyeColour;
  const cover = `<ellipse cx="86" cy="97" rx="11.5" ry="10.5" fill="${skin}"/><ellipse cx="114" cy="97" rx="11.5" ry="10.5" fill="${skin}"/><ellipse cx="100" cy="111" rx="13" ry="8" fill="${skin}"/>`;
  const ink = 'stroke="#2a2230" stroke-width="2.8" stroke-linecap="round" fill="none"';
  const happyEyes = `<path d="M79 99q7-8 14 0M107 99q7-8 14 0" ${ink}/>`;
  const roundEyes = `<ellipse cx="86" cy="97" rx="6" ry="7.5" fill="#2a2230"/><ellipse cx="114" cy="97" rx="6" ry="7.5" fill="#2a2230"/><circle cx="88" cy="94" r="2.4" fill="#fff"/><circle cx="116" cy="94" r="2.4" fill="#fff"/><circle cx="86" cy="98" r="3.5" fill="${ec}" opacity=".55"/><circle cx="114" cy="98" r="3.5" fill="${ec}" opacity=".55"/>`;
  const blush = (big) => `<ellipse cx="74" cy="108" rx="${big ? 9 : 7}" ry="${big ? 6 : 4.5}" fill="#ff8fab" opacity=".6"/><ellipse cx="126" cy="108" rx="${big ? 9 : 7}" ry="${big ? 6 : 4.5}" fill="#ff8fab" opacity=".6"/>`;
  const heartEye = (x) => `<path d="M${x} 103c-6-4-8-7-8-10 0-3 2-5 4.5-5 1.6 0 2.8 1 3.5 2.2.7-1.2 1.9-2.2 3.5-2.2 2.5 0 4.5 2 4.5 5 0 3-2 6-8 10z" fill="#ff4f7d"/>`;
  const FACES = {
    happy: cover + happyEyes + blush() + '<path d="M91 108q9 10 18 0z" fill="#d9465f"/>',
    bite: cover + happyEyes + blush() + '<ellipse cx="100" cy="111" rx="7" ry="6.5" fill="#7a2a3a"/><path d="M95 107h10" stroke="#fff" stroke-width="2.4"/>',
    chew: cover + happyEyes + blush(true) + '<path d="M94 111q3 3 6 0q3 3 6 0" stroke="#2a2230" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="80" cy="108" rx="9" ry="7" fill="#000" opacity=".04"/>',
    love: cover + heartEye(86) + heartEye(114) + blush() + '<path d="M92 108q8 8 16 0" ' + ink + '/>',
    surprised: cover + roundEyes + '<ellipse cx="100" cy="112" rx="4" ry="5" fill="#7a2a3a"/>',
    sleepy: cover + '<path d="M80 99h12M108 99h12" ' + ink + '/>' + blush() + '<ellipse cx="100" cy="111" rx="3" ry="2.4" fill="#7a2a3a"/>',
    proud: cover + roundEyes + blush() + '<path d="M90 107q10 9 20 0" ' + ink + '/>',
  };
  let faceNow = null;
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
    } else if (pz === 'read') {
      dy = 22;
      for (const i of [0, 1]) setLeg(i, hips[i][0] * 1.1, hips[i][1], hips[i][0] * 1.35, -50, hips[i][0] * 1.35, -dy);
      setArm(0, -0.55, 0.9, true); setArm(1, -0.55, 0.9, true);
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
      else if (pz === 'eat') {
        // Lift the food to her mouth (lift 0 → 1), then lower it to chew.
        const i = dir > 0 ? 1 : 0, k = p.lift || 0;
        setArm(i, 1.05 + k * 1.4, 0.45 + k * 1.45, true); setArm(1 - i, 0.2 + br, -0.1);
      }
      else if (pz === 'hold') { const i = dir > 0 ? 1 : 0; setArm(i, 1.1, 0.4, true); setArm(1 - i, 0.2 + br, -0.1); }
      else { setArm(0, 0.2 + br, -0.1); setArm(1, 0.2 + br, -0.1); }
    }
    book.setAttribute('display', pz === 'read' ? 'inline' : 'none');
    body.setAttribute('transform', `translate(0 ${f1(dy)}) rotate(${f1(lean * 0.5)} 0 0)`);
    headG.setAttribute('transform', `translate(${f1(dir * (pz === 'crouch' ? 4 : 1.5))} ${pz === 'walk' ? f1(Math.sin(ph * 2) * 0.8) : 0}) rotate(${f1(pz === 'crouch' ? dir * 8 : lean * 0.6)} 0 -150)`);
  }

  pose({ pose: 'stand' });
  return {
    el: root,
    pose,
    /** A hand position in local units (0 = left hand, 1 = right hand). */
    hand: (i) => handPos[i],
    /** Show a facial expression (happy, bite, chew, love, surprised, sleepy, proud) or null. */
    setFace: (f) => {
      if (f === faceNow) return;
      faceNow = f;
      while (faceG.firstChild) faceG.firstChild.remove();
      if (f && FACES[f]) { parseInto(faceG, FACES[f]); faceG.setAttribute('display', 'inline'); } else faceG.setAttribute('display', 'none');
    },
    /** Colour the book she reads. */
    setBook: (colour) => bookCover.setAttribute('fill', colour),
    height: 215,
  };
}

/** A still, full-body picture of the avatar (for the shop). */
export function girlSVG(equipped, { size = 96, label = 'Avatar' } = {}) {
  const rig = createGirl(equipped);
  const svgEl = document.createElementNS(NS, 'svg');
  svgEl.setAttribute('viewBox', '-75 -248 150 254');
  svgEl.setAttribute('width', size); svgEl.setAttribute('height', size);
  svgEl.setAttribute('role', 'img'); svgEl.setAttribute('aria-label', label);
  svgEl.appendChild(rig.el);
  return svgEl;
}
