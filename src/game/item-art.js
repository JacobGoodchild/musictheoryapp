// Pictures for supermarket items, in a 120×120 box: the kawaii food art from
// ../art/food.js, plus pet food, toys and decorations drawn here.
import { FOOD, GRADIENTS, face } from '../art/food.js';
import * as P from './props.js';

const OL = '#4f3747';
const o = (w = 3) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
let n = 0;

const PET_FOOD = {
  'pf-fish': () => `<path d="M14 60c14-22 44-26 66-12l18-16v56l-18-16c-22 14-52 10-66-12z" fill="#7cc6ff" ${o()}/><path d="M40 46q8 14 0 28" fill="none" ${o(2.5)}/><circle cx="28" cy="56" r="4" fill="${OL}"/><circle cx="29.5" cy="54.5" r="1.4" fill="#fff"/><path d="M56 52q6 8 0 16M66 50q6 10 0 20" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><ellipse cx="60" cy="96" rx="40" ry="8" fill="#ffd6e4" ${o(2.5)}/>`,
  'pf-kibble': () => `<path d="M30 30l6-12h48l6 12v74H30z" fill="#ffb86b" ${o()}/><path d="M30 30h60" ${o()}/><circle cx="60" cy="64" r="22" fill="#fff" ${o(2.5)}/><ellipse cx="60" cy="70" rx="8" ry="6.5" fill="#8a5a3a"/>${[[48, 58], [55, 51], [65, 51], [72, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#8a5a3a"/>`).join('')}`,
  'pf-bone': () => `<path d="M30 52h60a10 10 0 1 1 10 14a10 10 0 1 1-10 14H30a10 10 0 1 1-10-14a10 10 0 1 1 10-14z" fill="#f6d39a" ${o()}/>${face(60, 64, 0.8)}`,
  'pf-seeds': () => `<path d="M32 44q-4-20 10-24h36q14 4 10 24l6 52q0 10-10 10H36q-10 0-10-10z" fill="#e9c88f" ${o()}/><path d="M38 34q22 8 44 0" fill="none" stroke="#c99a5e" stroke-width="5" stroke-linecap="round"/>${[[46, 66], [60, 60], [74, 68], [52, 82], [68, 84], [60, 74]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.6" fill="#a8743a" transform="rotate(${i * 30} ${x} ${y})"/>`).join('')}`,
  'pf-bamboo': () => `${[[44, -8], [60, 0], [76, 8]].map(([x, a]) => `<g transform="rotate(${a} ${x} 100)"><rect x="${x - 8}" y="22" width="16" height="80" rx="7" fill="#8fd16f" ${o()}/><path d="M${x - 8} 48h16M${x - 8} 74h16" ${o(2.4)}/></g>`).join('')}<path d="M66 24l20-12q-4 14-20 12z" fill="#6fc35a" ${o(2.4)}/>`,
  'pf-rainbow': () => `<defs>${GRADIENTS.rainbow}</defs><path d="M60 14l13 28 30 4-22 21 6 30-27-15-27 15 6-30-22-21 30-4z" fill="url(#§rainbow)" ${o()}/>${face(60, 58, 0.85)}`,
};

const DECOR = {
  'decor-bed': () => `<g transform="translate(60 92) scale(.68)">${P.petBed(true)}</g>`,
  'decor-lights': () => `<path d="M10 40q50 40 100 0" fill="none" stroke="#6b5a70" stroke-width="2.5"/>${[['#ff7b8a', 22, 52], ['#ffe066', 42, 62], ['#7fd88f', 60, 64], ['#6fb8ff', 78, 62], ['#b28cff', 98, 52]].map(([c, x, y]) => `<circle cx="${x}" cy="${y + 6}" r="12" fill="${c}" opacity=".3"/><ellipse cx="${x}" cy="${y + 6}" rx="6" ry="8" fill="${c}" ${o(2)}/>`).join('')}`,
  'decor-rug': () => `<g transform="translate(60 64) scale(.28)">${P.rainbowRug()}</g>`,
  'decor-plant': () => `<g transform="translate(60 108) scale(.62)">${P.plant()}</g>`,
  'decor-poster': () => `<g transform="translate(60 60) scale(1.05)">${P.poster()}</g>`,
};

/** SVG markup (no outer <svg>) for an item, in a 120×120 box. */
export function itemArt(id) {
  const uid = `ia${++n}`;
  let s;
  if (FOOD[id]) s = `<defs>${Object.values(GRADIENTS).join('')}</defs>${FOOD[id]()}`;
  else if (PET_FOOD[id]) s = PET_FOOD[id]();
  else if (P.TOYS[id]) s = `<g transform="translate(60 62) scale(${(36 / P.TOYS[id].r).toFixed(2)})">${P.TOYS[id].art()}</g>`;
  else if (DECOR[id]) s = DECOR[id]();
  else s = `<circle cx="60" cy="60" r="30" fill="#ddd"/>`;
  return s.replace(/§/g, uid);
}

export function itemSVG(id, size = 72, label = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${label}">${itemArt(id)}</svg>`;
}
