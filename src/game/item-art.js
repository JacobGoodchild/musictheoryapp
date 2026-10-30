// Pictures for supermarket items, in a 120×120 box: the kawaii food art from
// ../art/food.js, plus pet food, toys and decorations drawn here.
import { FOOD, GRADIENTS, face } from '../art/food.js';
import * as P from './props.js';
import { itemById as wearById } from '../art/avatar.js';

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

// Toys for her.
const MY_TOYS = {
  'my-teddy': () => `<circle cx="38" cy="30" r="12" fill="#c98a52" ${o()}/><circle cx="82" cy="30" r="12" fill="#c98a52" ${o()}/><ellipse cx="60" cy="86" rx="30" ry="26" fill="#c98a52" ${o()}/><ellipse cx="60" cy="88" rx="16" ry="14" fill="#f2d2a8"/><circle cx="60" cy="48" r="26" fill="#c98a52" ${o()}/><ellipse cx="60" cy="58" rx="11" ry="8" fill="#f2d2a8"/>${face(60, 50, 0.7)}<path d="M50 72l10 6 10-6-10-4z" fill="#ff7b8a" ${o(2)}/>`,
  'my-crayons': () => `<rect x="20" y="40" width="80" height="62" rx="6" fill="#ffd36e" ${o()}/>${['#ff7b8a', '#6fb8ff', '#7fd88f', '#b28cff', '#ffb05c'].map((c, i) => `<path d="M${30 + i * 14} 44V22l5-10 5 10v22z" fill="${c}" ${o(2)}/>`).join('')}<rect x="28" y="62" width="64" height="22" rx="4" fill="#fff" ${o(2)}/>${face(60, 72, 0.5)}`,
  'my-yoyo': () => `<path d="M60 10v40" stroke="${OL}" stroke-width="2.5"/><circle cx="60" cy="74" r="34" fill="#ff7bb0" ${o()}/><circle cx="60" cy="74" r="20" fill="#ffd1e6" ${o(2.5)}/><circle cx="60" cy="74" r="5" fill="${OL}"/>`,
  'my-skipping': () => `<path d="M28 34q32 120 64 0" fill="none" stroke="#ff7b8a" stroke-width="5" stroke-linecap="round"/><rect x="20" y="14" width="16" height="30" rx="7" fill="#6fb8ff" ${o()}/><rect x="84" y="14" width="16" height="30" rx="7" fill="#6fb8ff" ${o()}/>`,
  'my-bubbles': () => `<path d="M40 108l26-52" stroke="#b28cff" stroke-width="7" stroke-linecap="round"/><circle cx="72" cy="44" r="14" fill="none" stroke="#b28cff" stroke-width="6"/><circle cx="92" cy="20" r="10" fill="#bfe6ff66" stroke="#7cc6ff" stroke-width="2"/><circle cx="104" cy="44" r="7" fill="#ffd1ec66" stroke="#ff9ec4" stroke-width="2"/><circle cx="40" cy="30" r="8" fill="#d9fbe466" stroke="#7fd88f" stroke-width="2"/>`,
  'my-ukulele': () => `<rect x="54" y="6" width="12" height="54" rx="4" fill="#a8703f" ${o()}/><path d="M60 52c-18 0-30 10-30 26 0 10 6 14 6 20 0 8 10 14 24 14s24-6 24-14c0-6 6-10 6-20 0-16-12-26-30-26z" fill="#f2b257" ${o()}/><circle cx="60" cy="84" r="9" fill="${OL}"/><rect x="48" y="100" width="24" height="5" rx="2" fill="#8a5a3a"/>`,
  'my-unicorn-plush': () => `<ellipse cx="60" cy="88" rx="30" ry="22" fill="#fdf5ff" ${o()}/><circle cx="60" cy="54" r="26" fill="#fdf5ff" ${o()}/><path d="M54 30L60 6L66 30Z" fill="#ffd76a" ${o(2.5)}/><circle cx="36" cy="44" r="9" fill="#ff9ec4" ${o(2)}/><circle cx="40" cy="62" r="8" fill="#b28cff" ${o(2)}/>${face(62, 58, 0.7)}`,
  'my-kite': () => `<path d="M60 8L96 50L60 100L24 50Z" fill="#6fb8ff" ${o()}/><path d="M60 8L60 100M24 50H96" stroke="#fff" stroke-width="3"/><path d="M60 100q-8 8 0 14q8 4 0 6" fill="none" stroke="${OL}" stroke-width="2"/><path d="M52 110l-6 4 6 2zM60 118l6 2-6 2z" fill="#ff7b8a"/>`,
};

// Book covers: original art in each book's colours (no copied cover pictures).
function bookCover(id) {
  const B = {
    'book-percy': { c: '#2f5fb3', t: ['PERCY', 'JACKSON'], art: '<path d="M64 52l-12 22h10l-8 22 20-28H64l8-16z" fill="#ffe066" stroke="#4f3747" stroke-width="2"/><path d="M28 98q8-6 16 0t16 0 16 0 16 0" fill="none" stroke="#9fd0ff" stroke-width="3"/>' },
    'book-hp': { c: '#8e2a3a', t: ['HARRY', 'POTTER'], art: '<path d="M38 96V74l8-8 8 8v22M58 96V64l10-12 10 12v32" fill="#5a1a24" stroke="#f5c542" stroke-width="2"/><circle cx="86" cy="54" r="2" fill="#f5c542"/><circle cx="34" cy="58" r="1.6" fill="#f5c542"/><circle cx="74" cy="44" r="1.4" fill="#f5c542"/>' },
    'book-ranger': { c: '#3f7a3a', t: ["RANGER'S", 'APPRENTICE'], art: '<path d="M44 96q-14-22 0-44" fill="none" stroke="#e0c08a" stroke-width="3.5"/><path d="M44 52v44" stroke="#f5f0e0" stroke-width="1.5"/><path d="M40 74h44l-6-4m6 4-6 4" fill="none" stroke="#f5f0e0" stroke-width="3" stroke-linecap="round"/>' },
    'book-tomgates': { c: '#f2c230', t: ['TOM', 'GATES'], art: '<circle cx="60" cy="66" r="10" fill="none" stroke="#4f3747" stroke-width="2.5"/><path d="M60 76v14M50 82h20M60 90l-8 8M60 90l8 8M54 64h1M65 64h1M55 70q5 4 10 0" fill="none" stroke="#4f3747" stroke-width="2.5" stroke-linecap="round"/><path d="M30 60l6-6M86 92l6 4M88 58l6-2" stroke="#4f3747" stroke-width="2" stroke-linecap="round"/>' },
    'book-wimpy': { c: '#d9443a', t: ['DIARY OF A', 'WIMPY KID'], art: '<rect x="32" y="52" width="56" height="46" fill="#fffdf2"/><path d="M32 62h56M32 72h56M32 82h56M32 92h56" stroke="#bfd6f0" stroke-width="1.4"/><circle cx="60" cy="64" r="6" fill="none" stroke="#4f3747" stroke-width="2"/><path d="M60 70v14M54 76h12M60 84l-5 8M60 84l5 8" fill="none" stroke="#4f3747" stroke-width="2" stroke-linecap="round"/>' },
    'book-music': { c: '#7b5bd6', t: ['MUSIC', 'THEORY FUN'], art: '<path d="M54 92V62l20-6v30" fill="none" stroke="#fff" stroke-width="3.5"/><ellipse cx="49" cy="92" rx="7" ry="5" fill="#fff"/><ellipse cx="69" cy="86" rx="7" ry="5" fill="#fff"/>' },
  }[id];
  const fs = B.t.some((t) => t.length > 8) ? 9 : 12;
  return `<path d="M22 8h74q6 0 6 6v94q0 6-6 6H22z" fill="${B.c}" ${o()}/><path d="M22 8v106" stroke="#0003" stroke-width="10"/><rect x="28" y="16" width="68" height="${fs * 2 + 14}" rx="4" fill="#fff" opacity=".92"/>
    ${B.t.map((t, i) => `<text x="62" y="${30 + i * (fs + 3)}" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="${fs}" fill="${B.c}">${t.replace(/'/g, '&#39;')}</text>`).join('')}${B.art}`;
}

const DECOR = {
  'decor-bed': () => `<g transform="translate(60 92) scale(.68)">${P.petBed(true)}</g>`,
  'decor-lights': () => `<path d="M10 40q50 40 100 0" fill="none" stroke="#6b5a70" stroke-width="2.5"/>${[['#ff7b8a', 22, 52], ['#ffe066', 42, 62], ['#7fd88f', 60, 64], ['#6fb8ff', 78, 62], ['#b28cff', 98, 52]].map(([c, x, y]) => `<circle cx="${x}" cy="${y + 6}" r="12" fill="${c}" opacity=".3"/><ellipse cx="${x}" cy="${y + 6}" rx="6" ry="8" fill="${c}" ${o(2)}/>`).join('')}`,
  'decor-rug': () => `<g transform="translate(60 64) scale(.28)">${P.rainbowRug()}</g>`,
  'decor-plant': () => `<g transform="translate(60 108) scale(.62)">${P.plant()}</g>`,
  'decor-poster': () => `<g transform="translate(60 60) scale(1.05)">${P.poster()}</g>`,
};

// Clothes from the avatar shop, as simple garment pictures.
function wearArt(it) {
  const c = it.colour || it.cape || '#ff8fb8';
  if (it.slot === 'outfit' && (it.dress || it.onesie)) return `<path d="M44 14h32l6 16 20 72H18l20-72z" fill="${c}" ${o()}/><path d="M44 14q16 12 32 0" fill="none" ${o(2.5)}/>${it.dots ? '<circle cx="50" cy="60" r="4" fill="#fff"/><circle cx="70" cy="76" r="4" fill="#fff"/><circle cx="58" cy="90" r="4" fill="#fff"/>' : ''}${it.ears ? `<path d="M46 14l-6-12 12 6zM74 14l6-12-12 6z" fill="${c}" ${o(2)}/>` : ''}`;
  if (it.slot === 'outfit') return `<path d="M40 16l-26 18 12 18 12-8v60h44V44l12 8 12-18-26-18q-10 10-20 10t-20-10z" fill="${c}" ${o()}/>${it.stripes ? '<path d="M38 60h44M38 76h44" stroke="#fff" stroke-width="5"/>' : ''}`;
  if (it.slot === 'bottoms') return it.kind === 'trousers' ? `<path d="M34 16h52l6 92H66l-6-60-6 60H28z" fill="${c}" ${o()}/>` : it.kind === 'shorts' ? `<path d="M30 30h60l8 50H66l-6-26-6 26H22z" fill="${c}" ${o()}/>` : `<path d="M38 24h44l24 70q-46 16-92 0z" fill="${c}" ${o()}/>`;
  if (it.slot === 'shoes') return `<path d="M14 80q0-26 22-26 10 18 30 18 28 0 40 10v14H14z" fill="${c}" ${o()}/><path d="M14 92h92" stroke="${it.sole || '#c9c3d6'}" stroke-width="6"/>`;
  if (it.slot === 'hat') return `<path d="M24 80q0-50 36-50t36 50z" fill="${c}" ${o()}/><path d="M12 80h96" stroke="${c}" stroke-width="10" stroke-linecap="round"/>`;
  return `<path d="M60 60c-20-24-44-8-30 8 10 10 30 0 30-8zM60 60c20-24 44-8 30 8-10 10-30 0-30-8z" fill="${c}" ${o()}/><circle cx="60" cy="60" r="8" fill="${c}" ${o(2.5)}/>`;
}

/** SVG markup (no outer <svg>) for an item, in a 120×120 box. */
export function itemArt(id) {
  const uid = `ia${++n}`;
  let s;
  if (FOOD[id]) s = `<defs>${Object.values(GRADIENTS).join('')}</defs>${FOOD[id]()}`;
  else if (PET_FOOD[id]) s = PET_FOOD[id]();
  else if (P.TOYS[id]) s = `<g transform="translate(60 62) scale(${(36 / P.TOYS[id].r).toFixed(2)})">${P.TOYS[id].art()}</g>`;
  else if (DECOR[id]) s = DECOR[id]();
  else if (MY_TOYS[id]) s = MY_TOYS[id]();
  else if (id.startsWith('book-')) s = bookCover(id);
  else if (wearById(id)) s = wearArt(wearById(id));
  else s = `<circle cx="60" cy="60" r="30" fill="#ddd"/>`;
  return s.replace(/§/g, uid);
}

export function itemSVG(id, size = 72, label = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${label}">${itemArt(id)}</svg>`;
}
