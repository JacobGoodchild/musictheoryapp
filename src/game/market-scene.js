// The supermarket scene: the girl pushes a trolley in with her pet trotting
// alongside; shopping piles up in the trolley; at the till the scanner beeps
// and the till goes ka-ching. One SVG, 800×240.
import { createPet } from './pet-rig.js';
import { createGirl } from './girl-rig.js';
import { itemArt } from './item-art.js';
import { sfx } from '../audio/synth.js';

const NS = 'http://www.w3.org/2000/svg';
const f1 = (n) => Math.round(n * 10) / 10;
const GROUND = 226, GK = 0.56, PK = 0.56;

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

const L = '#4a3040';
function shelves() {
  const cols = ['#ff8fa3', '#ffd36e', '#7fd88f', '#7cc6ff', '#b9a2f0', '#ffb86b'];
  let s = '';
  for (let row = 0; row < 3; row++) {
    const y = 40 + row * 48;
    s += `<rect x="20" y="${y + 36}" width="760" height="8" rx="3" fill="#d9c4b0" stroke="${L}" stroke-width="2"/>`;
    for (let i = 0; i < 30; i++) {
      const x = 28 + i * 25 + (row % 2) * 8, h = 18 + ((i * 7 + row * 5) % 14), c = cols[(i + row * 2) % cols.length];
      if (x > 768) continue;
      s += (i + row) % 3 === 0
        ? `<rect x="${x}" y="${y + 36 - h}" width="17" height="${h}" rx="3" fill="${c}" stroke="${L}" stroke-width="1.6"/><rect x="${x + 3}" y="${y + 36 - h + 5}" width="11" height="6" rx="2" fill="#fff" opacity=".8"/>`
        : (i + row) % 3 === 1
          ? `<path d="M${x + 2} ${y + 36}v${-h + 6}q0-6 6-6h3q6 0 6 6v${h - 6}z" fill="${c}" stroke="${L}" stroke-width="1.6"/><rect x="${x + 6}" y="${y + 36 - h - 4}" width="5" height="5" fill="#fff" stroke="${L}" stroke-width="1.2"/>`
          : `<circle cx="${x + 9}" cy="${y + 27}" r="8.5" fill="${c}" stroke="${L}" stroke-width="1.6"/>`;
    }
  }
  return s;
}

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
    <path d="M-80 0v-70h160V0z" fill="#9fd0ff" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="-86" y="-80" width="172" height="12" rx="5" fill="#fff" stroke="${L}" stroke-width="3"/>
    <rect x="-70" y="-60" width="70" height="8" rx="4" fill="#5a6a88"/>
    <g transform="translate(46 -80)"><rect x="-24" y="-38" width="48" height="38" rx="6" fill="#ff8fb8" stroke="${L}" stroke-width="3"/><rect x="-16" y="-32" width="32" height="12" rx="3" fill="#e9fff1" stroke="${L}" stroke-width="2"/><text class="till-total" x="0" y="-22.5" text-anchor="middle" font-size="9" font-weight="800" font-family="system-ui, sans-serif" fill="#2a6a3a">0</text>${[[-12, -12], [0, -12], [12, -12], [-12, -5], [0, -5], [12, -5]].map(([x, y]) => `<rect x="${x - 4}" y="${y - 2.5}" width="8" height="5" rx="1.5" fill="#fff"/>`).join('')}</g>
    <path class="till-beam" d="M-60-80l20-30" stroke="#ff3355" stroke-width="3" opacity="0"/>
    <text x="0" y="-26" text-anchor="middle" font-size="15" font-weight="800" font-family="system-ui, sans-serif" fill="#fff">TILL</text>
  </g>`;
}

export function createMarketScene({ petId, equipped }) {
  const svgEl = E(null, 'svg', { viewBox: '0 0 800 240', class: 'market-svg', role: 'img', 'aria-label': 'The supermarket: you, your pet and your trolley' });
  markup(svgEl, `<defs><pattern id="tiles" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#fff"/><rect width="20" height="20" fill="#ffe9f1"/><rect x="20" y="20" width="20" height="20" fill="#ffe9f1"/></pattern></defs>
    <rect width="800" height="240" fill="#fff7e8"/>
    <rect x="0" y="186" width="800" height="54" fill="url(#tiles)"/><path d="M0 186h800" stroke="#e9d5c2" stroke-width="3"/>
    <g transform="translate(400 22)"><rect x="-140" y="-16" width="280" height="30" rx="15" fill="#ff7b8a" stroke="${L}" stroke-width="3"/><text class="aisle-sign" x="0" y="5" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="system-ui, sans-serif">SUPERMARKET</text></g>`);
  // Shelves full of the real things in this aisle (tap one to pop it in the trolley).
  const shelfL = E(svgEl, 'g');
  svgEl.insertBefore(shelfL, svgEl.children[2] || null);
  const sign = svgEl.querySelector('.aisle-sign');
  let onPick = null;
  function setAisle(name, list, pick, freezer = false) {
    onPick = pick;
    sign.textContent = name.toUpperCase();
    while (shelfL.firstChild) shelfL.firstChild.remove();
    markup(shelfL, `<rect x="14" y="38" width="772" height="150" rx="8" fill="${freezer ? '#dff3ff' : '#f6e6d4'}" stroke="${L}" stroke-width="2.5"/>${freezer ? '<path d="M14 38h772" stroke="#9fd0ff" stroke-width="6"/>' : ''}`
      + [84, 134, 184].map((y) => `<rect x="14" y="${y}" width="772" height="7" rx="3" fill="#d9c4b0" stroke="${L}" stroke-width="2"/>`).join(''));
    if (!list.length) return;
    let k = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 15; col++) {
        const item = list[k++ % list.length];
        const x = 40 + col * 50 + (row % 2) * 10, y = 84 + row * 50;
        if (x > 760) continue;
        const g = E(shelfL, 'g', { transform: `translate(${x - 20} ${y - 42}) scale(.34)`, 'data-shelf-item': item.id, style: 'cursor:pointer', role: 'button', 'aria-label': `${item.name}, ${item.price} coins` });
        markup(g, `<rect width="120" height="120" fill="transparent"/>${itemArt(item.id)}`);
        g.addEventListener('click', () => { if (onPick) onPick(item, g); st.target = Math.max(120, Math.min(460, x - 120)); st.mode = 'walk'; });
      }
    }
    if (freezer) markup(shelfL, '<rect x="14" y="38" width="772" height="150" rx="8" fill="#ffffff" opacity=".18" pointer-events="none"/><path d="M60 50l40 120M300 50l40 120M540 50l40 120" stroke="#fff" stroke-width="6" opacity=".35" pointer-events="none"/>');
    // Walk into the new aisle.
    if (!reduced && st) { st.x = -120; st.petX = -60; st.target = 250; st.mode = 'walk'; }
  }
  const till = E(svgEl, 'g', { transform: `translate(690 ${GROUND}) scale(.8)` });
  markup(till, tillArt());
  const tillTotal = till.querySelector('.till-total');
  const beam = till.querySelector('.till-beam');
  const actors = E(svgEl, 'g');
  const fxL = E(svgEl, 'g', { 'pointer-events': 'none' });

  const girlRig = createGirl(equipped);
  const girlG = E(actors, 'g'); girlG.appendChild(girlRig.el);
  const trolley = E(actors, 'g');
  const load = E(trolley, 'g');
  markup(trolley, trolleyArt());
  const petRig = petId ? createPet(petId) : null;
  const petG = E(actors, 'g');
  if (petRig) petG.appendChild(petRig.el);

  const st = { x: -120, target: 250, phase: 0, petPhase: 0, petX: -60, theta: 0, mode: 'walk', t: 0, hop: 0, tailPhase: 0 };
  const reduced = reducedMotion();
  if (reduced) { st.x = st.target; st.petX = st.x + 190; st.mode = 'idle'; }

  function setTrolley(ids) {
    while (load.firstChild) load.firstChild.remove();
    ids.slice(-10).forEach((id, i) => {
      const g = E(load, 'g', { transform: `translate(${-44 + (i % 5) * 20} ${-104 - Math.floor(i / 5) * 18}) scale(.26)` });
      markup(g, `<g transform="translate(-60 -60)">${itemArt(id)}</g>`);
    });
    st.hop = 1;
  }
  function heart(x, y) {
    const g = E(fxL, 'path', { d: 'M0 4c-6-5-12-9-12-14 0-4 3-7 6.5-7 2.5 0 4.5 1.5 5.5 3.5 1-2 3-3.5 5.5-3.5 3.5 0 6.5 3 6.5 7 0 5-6 9-12 14z', fill: '#ff5c8a', stroke: '#fff', 'stroke-width': 1.5 });
    const t0 = performance.now();
    const tick = () => { const t = (performance.now() - t0) / 1000; g.setAttribute('transform', `translate(${x} ${y - t * 40})`); g.setAttribute('opacity', Math.max(0, 1 - t)); if (t < 1 && g.isConnected) requestAnimationFrame(tick); else g.remove(); };
    tick();
  }

  /** Walk to the till, beep each item, then ka-ching. Resolves when done. */
  function checkout(ids, total) {
    return new Promise((resolve) => {
      st.target = 470; st.mode = 'walk'; st.after = async () => {
        st.mode = 'idle';
        for (let i = 0; i < ids.length; i++) {
          if (!svgEl.isConnected) break;
          beam.setAttribute('opacity', 1); sfx('beep');
          tillTotal.textContent = String(Math.round(((i + 1) / ids.length) * total));
          await new Promise((r) => setTimeout(r, reduced ? 60 : 220));
          beam.setAttribute('opacity', 0);
          await new Promise((r) => setTimeout(r, reduced ? 20 : 80));
        }
        sfx('kaching');
        for (let i = 0; i < 4; i++) setTimeout(() => heart(st.x + 60 + i * 12, 120), i * 120);
        st.mode = 'wave'; st.t = 0;
        setTimeout(resolve, reduced ? 100 : 700);
      };
      if (reduced) { st.x = st.target; st.petX = st.x + 190; }
    });
  }

  let last = 0, raf = 0, seen = false;
  function frame(ts) {
    if (!svgEl.isConnected) { if (seen) return; raf = requestAnimationFrame(frame); return; }
    seen = true;
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts; st.t += dt; st.tailPhase += dt * 2.4;
    const walking = st.mode === 'walk' && Math.abs(st.target - st.x) > 2;
    if (walking) { st.x += Math.sign(st.target - st.x) * Math.min(Math.abs(st.target - st.x), 110 * dt); st.phase += dt * 8; }
    else if (st.mode === 'walk') { st.mode = 'idle'; const a = st.after; st.after = null; if (a) a(); }
    // The pet trots ahead of the trolley.
    const petTarget = st.x + 190;
    const petMoving = Math.abs(petTarget - st.petX) > 3;
    if (petMoving) { st.petX += Math.sign(petTarget - st.petX) * Math.min(Math.abs(petTarget - st.petX), 130 * dt); st.petPhase += dt * 10; }
    st.hop = Math.max(0, st.hop - dt * 2.5);
    const pose = walking ? 'push' : st.mode === 'wave' ? 'wave' : 'push';
    girlRig.pose({ pose: walking ? 'push' : pose === 'wave' && st.t < 1.6 ? 'wave' : 'hold', phase: walking ? st.phase : st.t * 2, dir: 1 });
    if (!walking && st.mode === 'wave' && st.t > 1.6) st.mode = 'idle';
    girlG.setAttribute('transform', `translate(${f1(st.x)} ${GROUND}) scale(${GK})`);
    trolley.setAttribute('transform', `translate(${f1(st.x + 86)} ${GROUND - 2 - Math.sin(st.hop * Math.PI) * 6}) scale(.58)`);
    if (petRig) {
      petRig.pose(petMoving ? { view: 'move', theta: 0, phase: st.petPhase, stride: 1, tailPhase: st.tailPhase } : { view: 'sit', eyes: st.hop > 0.3 || st.mode === 'wave' ? 'happy' : 'open', tailPhase: st.tailPhase, squash: Math.sin(st.hop * Math.PI) * 0.8 });
      petG.setAttribute('transform', `translate(${f1(st.petX)} ${GROUND}) scale(${PK})`);
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return { el: svgEl, setTrolley, checkout, setAisle, stop: () => cancelAnimationFrame(raf) };
}
