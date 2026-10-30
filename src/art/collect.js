// More collectable sticker art (original SVG, 120×120 box, kawaii style to
// match ./food.js): animals, sea friends, space, flowers, music friends,
// Halloween, treasure, vehicles, and the holographic Ultra Mythics.
import { face } from './food.js';

const OL = '#4f3747';
const o = (w = 3) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const sparkle = (x, y, r = 5, c = '#fff') => `<path d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z" fill="${c}"/>`;
const star = (x, y, r, c) => { const p = []; for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`); } return `<polygon points="${p.join(' ')}" fill="${c}" ${o(2.5)}/>`; };

// ---------------------------------------------------------------- animals (one head drawing, many kinds)
function animal({ c, c2 = '#fff', ears = 'round', earC, extra = '', faceY = 66, mouth = 'w', snout = null }) {
  const ec = earC || c;
  const E = {
    round: `<circle cx="32" cy="34" r="15" fill="${ec}" ${o()}/><circle cx="88" cy="34" r="15" fill="${ec}" ${o()}/><circle cx="32" cy="35" r="7" fill="#ffc2d6"/><circle cx="88" cy="35" r="7" fill="#ffc2d6"/>`,
    cat: `<path d="M24 52L28 16L52 34Z" fill="${ec}" ${o()}/><path d="M96 52L92 16L68 34Z" fill="${ec}" ${o()}/><path d="M30 42l2-16 12 10z" fill="#ffc2d6"/><path d="M90 42l-2-16-12 10z" fill="#ffc2d6"/>`,
    long: `<ellipse cx="44" cy="22" rx="10" ry="26" fill="${ec}" ${o()}/><ellipse cx="76" cy="22" rx="10" ry="26" fill="${ec}" ${o()}/><ellipse cx="44" cy="24" rx="5" ry="17" fill="#ffc2d6"/><ellipse cx="76" cy="24" rx="5" ry="17" fill="#ffc2d6"/>`,
    floppy: `<path d="M26 40c-14 6-14 34-2 40 8-6 10-24 12-34z" fill="${ec}" ${o()}/><path d="M94 40c14 6 14 34 2 40-8-6-10-24-12-34z" fill="${ec}" ${o()}/>`,
    fox: `<path d="M22 56L24 12L54 34Z" fill="${ec}" ${o()}/><path d="M98 56L96 12L66 34Z" fill="${ec}" ${o()}/><path d="M28 44l1-22 14 12z" fill="#fff"/><path d="M92 44l-1-22-14 12z" fill="#fff"/>`,
    big: `<circle cx="26" cy="40" r="20" fill="${ec}" ${o()}/><circle cx="94" cy="40" r="20" fill="${ec}" ${o()}/><circle cx="26" cy="41" r="11" fill="#ffc2d6"/><circle cx="94" cy="41" r="11" fill="#ffc2d6"/>`,
    tufts: `<path d="M30 40l-6-24 22 14z" fill="${ec}" ${o()}/><path d="M90 40l6-24-22 14z" fill="${ec}" ${o()}/>`,
    none: '',
    frog: `<circle cx="38" cy="34" r="16" fill="${c}" ${o()}/><circle cx="82" cy="34" r="16" fill="${c}" ${o()}/><circle cx="38" cy="34" r="9" fill="#fff"/><circle cx="82" cy="34" r="9" fill="#fff"/>`,
  }[ears];
  return `${E}<ellipse cx="60" cy="66" rx="42" ry="38" fill="${c}" ${o()}/>${extra}${snout ? `<ellipse cx="60" cy="${faceY + 12}" rx="${snout[0]}" ry="${snout[1]}" fill="${c2}" ${snout[2] ? o(2.5) : ''}/>` : ''}${face(60, faceY, 1, mouth)}`;
}

const A = {
  'a-kitty': () => animal({ c: '#ffb36b', ears: 'cat', extra: '<path d="M50 30l2 8M60 28v9M70 30l-2 8" stroke="#e08a3c" stroke-width="3" stroke-linecap="round"/>', mouth: 'cat' }),
  'a-puppy': () => animal({ c: '#ecc592', ears: 'floppy', earC: '#a8703f', snout: [16, 11] }),
  'a-bear': () => animal({ c: '#c98a52', ears: 'round', snout: [15, 11, 1], c2: '#f2d2a8' }),
  'a-bunny': () => animal({ c: '#fbf7ff', ears: 'long', snout: [10, 7] }),
  'a-fox': () => animal({ c: '#ff8a3c', ears: 'fox', extra: '<path d="M20 70q20 30 40 30t40-30q-14 12-40 12t-40-12z" fill="#fff"/>' }),
  'a-panda': () => animal({ c: '#fff', ears: 'round', earC: '#3a3440', extra: '<ellipse cx="44" cy="66" rx="12" ry="14" fill="#3a3440" transform="rotate(-20 44 66)"/><ellipse cx="76" cy="66" rx="12" ry="14" fill="#3a3440" transform="rotate(20 76 66)"/>' }),
  'a-frog': () => animal({ c: '#8fd18a', ears: 'frog', faceY: 70, mouth: 'smile' }),
  'a-pig': () => animal({ c: '#ffb6c9', ears: 'cat', earC: '#ff9ab3', extra: '<ellipse cx="60" cy="84" rx="14" ry="10" fill="#ff9ab3" stroke="#4f3747" stroke-width="2.5"/><ellipse cx="55" cy="84" rx="2.5" ry="3.5" fill="#4f3747"/><ellipse cx="65" cy="84" rx="2.5" ry="3.5" fill="#4f3747"/>', faceY: 62, mouth: 'smile' }),
  'a-koala': () => animal({ c: '#b9b4c9', ears: 'big', earC: '#b9b4c9', extra: '<ellipse cx="60" cy="76" rx="8" ry="11" fill="#4f3747"/>', faceY: 62, mouth: 'smile' }),
  'a-mouse': () => animal({ c: '#d9d4e4', ears: 'big', earC: '#d9d4e4' }),
  'a-owl': () => animal({ c: '#c98a52', ears: 'tufts', extra: '<circle cx="44" cy="62" r="15" fill="#fff6e8"/><circle cx="76" cy="62" r="15" fill="#fff6e8"/><path d="M54 76l6 8 6-8z" fill="#ffb03b" stroke="#4f3747" stroke-width="2"/>', mouth: 'o' }),
  'a-penguin': () => animal({ c: '#3a3f5a', ears: 'none', extra: '<path d="M30 70q0-30 30-30t30 30q0 26-30 28t-30-28z" fill="#fff"/><path d="M52 80l8 6 8-6z" fill="#ffb03b" stroke="#4f3747" stroke-width="2"/>', mouth: 'smile' }),
  'a-tiger': () => animal({ c: '#ffa64f', ears: 'round', extra: '<path d="M60 30v12M48 32l3 10M72 32l-3 10M20 66h12M88 66h12M22 78h10M88 78h10" stroke="#4f3747" stroke-width="3.5" stroke-linecap="round"/>', snout: [15, 10] }),
  'a-lion': () => `<circle cx="60" cy="64" r="54" fill="#d98a3c" ${o()}/>${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => `<circle cx="${(60 + Math.cos((a * Math.PI) / 180) * 48).toFixed(1)}" cy="${(64 + Math.sin((a * Math.PI) / 180) * 48).toFixed(1)}" r="12" fill="#e89a4c"/>`).join('')}` + animal({ c: '#ffcf7a', ears: 'round', snout: [14, 10] }),
  'a-sheep': () => `${[[30, 40], [60, 28], [90, 40], [22, 70], [98, 70], [36, 96], [84, 96], [60, 104]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="18" fill="#fff" ${o(2.5)}/>`).join('')}<ellipse cx="60" cy="70" rx="28" ry="30" fill="#4f3747"/>${face(60, 70, 0.9)}`,
  'a-cow': () => animal({ c: '#fff', ears: 'round', earC: '#fff', extra: '<path d="M30 30l-8-14M90 30l8-14" stroke="#e8d0a8" stroke-width="6" stroke-linecap="round"/><ellipse cx="36" cy="56" rx="12" ry="9" fill="#3a3440"/><ellipse cx="86" cy="48" rx="9" ry="7" fill="#3a3440"/><ellipse cx="60" cy="88" rx="22" ry="12" fill="#ffc2d6" stroke="#4f3747" stroke-width="2.5"/>', faceY: 62, mouth: 'smile' }),
  'a-hamster': () => animal({ c: '#f3b45f', ears: 'round', extra: '<ellipse cx="60" cy="82" rx="28" ry="16" fill="#fff8ef"/>' }),
  'a-raccoon': () => animal({ c: '#9a96a8', ears: 'cat', earC: '#7c788a', extra: '<path d="M24 64q36-22 72 0q-10 14-36 10q-26 4-36-10z" fill="#3a3440"/>', snout: [12, 8] }),
  'a-axolotl': () => `${[22, 98].map((x) => `<path d="M${x} 50l${x < 60 ? -16 : 16}-10M${x} 60l${x < 60 ? -18 : 18}0M${x} 70l${x < 60 ? -16 : 16} 10" stroke="#ff7bb0" stroke-width="6" stroke-linecap="round"/>`).join('')}` + animal({ c: '#ffc6e0', ears: 'none', mouth: 'smile' }),
};

// ---------------------------------------------------------------- sea friends
const fish = (c, c2) => `<path d="M14 60c16-26 52-30 72-8l20-16v48l-20-16c-20 22-56 18-72-8z" fill="${c}" ${o()}/><path d="M50 40q10 20 0 40" stroke="${c2}" stroke-width="5" fill="none"/>${face(36, 58, 0.75)}`;
const SEA = {
  's-fish-blue': () => fish('#7cc6ff', '#bfe6ff'),
  's-fish-pink': () => fish('#ff9ec4', '#ffd1e6'),
  's-clownfish': () => fish('#ff9a3c', '#fff'),
  's-octopus': () => `${[20, 36, 52, 68, 84, 100].map((x) => `<path d="M${x} 74q-4 24 8 30" stroke="#b28cff" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('')}<ellipse cx="60" cy="56" rx="40" ry="38" fill="#c9a7ff" ${o()}/>${face(60, 62, 1)}`,
  's-whale': () => `<path d="M10 70q0-40 50-40t50 40q-6 30-50 30t-50-30z" fill="#6f9df2" ${o()}/><path d="M30 80q30 16 60 0" fill="#bfe6ff"/><path d="M60 30q-4-16-12-18M60 30q4-16 12-18" stroke="#9fdcff" stroke-width="5" fill="none" stroke-linecap="round"/>${face(46, 62, 0.9)}`,
  's-jellyfish': () => `${[34, 48, 62, 76, 90].map((x) => `<path d="M${x} 66q-6 14 0 24t0 22" stroke="#ff9ec4" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}<path d="M18 66q0-48 42-48t42 48z" fill="#ffc6e0" ${o()}/>${face(60, 46, 0.9)}`,
  's-crab': () => `<path d="M14 40l14 16M106 40l-14 16" stroke="${OL}" stroke-width="3"/><circle cx="14" cy="34" r="12" fill="#ff6b6b" ${o()}/><circle cx="106" cy="34" r="12" fill="#ff6b6b" ${o()}/><path d="M26 92l-8 12M94 92l8 12M40 96l-4 12M80 96l4 12" stroke="#ff6b6b" stroke-width="6" stroke-linecap="round"/><ellipse cx="60" cy="72" rx="40" ry="28" fill="#ff7b7b" ${o()}/>${face(60, 70, 1)}`,
  's-starfish': () => `${star(60, 64, 50, '#ffb05c')}${face(60, 66, 0.9)}`,
  's-turtle': () => `<ellipse cx="102" cy="66" rx="14" ry="12" fill="#a8e08f" ${o()}/><ellipse cx="56" cy="68" rx="44" ry="32" fill="#5fae5a" ${o()}/><path d="M36 52l20-10 20 10-6 22H42z" fill="#8fd18a" stroke="${OL}" stroke-width="2"/>${face(102, 64, 0.5)}`,
  's-shell': () => `<path d="M60 108L14 52q20-36 46-36t46 36z" fill="#ffd6e6" ${o()}/>${[30, 45, 60, 75, 90].map((x) => `<path d="M60 108L${x} 20" stroke="#ff9ec4" stroke-width="3"/>`).join('')}${face(60, 70, 0.8)}`,
  's-seahorse': () => `<path d="M70 20q24 6 18 30-4 16-18 22 10 10 6 26-6 14-20 10 10-4 10-14-12-12-14-28 0-20 6-30-12 0-16-10z" fill="#ffd36e" ${o()}/>${face(70, 34, 0.6)}`,
  's-dolphin': () => `<path d="M14 82q20-60 80-50l14-12-2 18q10 10 8 22-30-16-64 6l4 16-14-10q-14 10-26 10z" fill="#8fb8f0" ${o()}/>${face(78, 46, 0.6)}`,
  's-puffer': () => `${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<path d="M${(60 + Math.cos(a) * 40).toFixed(1)} ${(62 + Math.sin(a) * 40).toFixed(1)}l${(Math.cos(a) * 12).toFixed(1)} ${(Math.sin(a) * 12).toFixed(1)}" stroke="${OL}" stroke-width="3"/>`; }).join('')}<circle cx="60" cy="62" r="42" fill="#ffe066" ${o()}/>${face(60, 62, 1, 'o')}`,
};

// ---------------------------------------------------------------- space
const planet = (c, ring) => `<ellipse cx="60" cy="64" rx="56" ry="14" fill="none" stroke="${ring}" stroke-width="8" transform="rotate(-14 60 64)"/><circle cx="60" cy="62" r="36" fill="${c}" ${o()}/><path d="M6 72q54 6 108-24" stroke="${ring}" stroke-width="8" fill="none" stroke-linecap="round"/>${face(60, 58, 0.9)}`;
const SPACE = {
  'p-saturn': () => planet('#ffcf7a', '#ff9ec4'),
  'p-purple-planet': () => planet('#b28cff', '#7fd8ff'),
  'p-earth': () => `<circle cx="60" cy="60" r="46" fill="#6fb8ff" ${o()}/><path d="M30 40q14-6 22 4t-4 22q-16 2-18-26zM70 70q18-6 22 8-8 16-22 12z" fill="#7fd88f"/>${face(60, 62, 1)}`,
  'p-moon': () => `<path d="M76 14a48 48 0 1 0 28 72 40 40 0 1 1-28-72z" fill="#ffe66b" ${o()}/>${face(50, 66, 0.8, 'smile')}`,
  'p-star': () => `${star(60, 62, 52, '#ffe066')}${face(60, 64, 0.9)}`,
  'p-sun': () => `${Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5; return `<path d="M${(60 + Math.cos(a) * 44).toFixed(1)} ${(60 + Math.sin(a) * 44).toFixed(1)}l${(Math.cos(a) * 12).toFixed(1)} ${(Math.sin(a) * 12).toFixed(1)}" stroke="#ffb03b" stroke-width="6" stroke-linecap="round"/>`; }).join('')}<circle cx="60" cy="60" r="38" fill="#ffd23f" ${o()}/>${face(60, 62, 1)}`,
  'p-rocket': () => `<path d="M60 8q26 24 22 66H38Q34 32 60 8z" fill="#fff" ${o()}/><path d="M38 74l-14 20 16-4zM82 74l14 20-16-4z" fill="#ff7b8a" ${o(2.5)}/><path d="M48 78l12 32 12-32z" fill="#ffb03b" ${o(2.5)}/><circle cx="60" cy="44" r="12" fill="#7fd8ff" ${o(2.5)}/>${face(60, 44, 0.45)}`,
  'p-alien': () => `<path d="M40 22l-6-14M80 22l6-14" stroke="${OL}" stroke-width="3"/><circle cx="34" cy="8" r="5" fill="#ff9ec4"/><circle cx="86" cy="8" r="5" fill="#ff9ec4"/><ellipse cx="60" cy="64" rx="42" ry="44" fill="#9be38b" ${o()}/>${face(60, 66, 1.1)}`,
  'p-ufo': () => `<path d="M34 52q0-34 26-34t26 34z" fill="#bfe6ff" ${o()}/><ellipse cx="60" cy="62" rx="52" ry="16" fill="#b9a2f0" ${o()}/>${[24, 44, 64, 84, 100].map((x) => `<circle cx="${x}" cy="64" r="4" fill="#ffe066"/>`).join('')}${face(60, 40, 0.55)}<path d="M40 80l-10 24h60l-10-24" fill="#fff8a8" opacity=".6"/>`,
  'p-comet': () => `<path d="M60 70L8 24q30 4 58 30zM60 70L14 54q24-6 52 4z" fill="#9fdcff" opacity=".8"/><circle cx="74" cy="76" r="26" fill="#ffd23f" ${o()}/>${face(74, 78, 0.7)}`,
  'p-astro': () => `<circle cx="60" cy="56" r="44" fill="#fff" ${o()}/><ellipse cx="60" cy="58" rx="30" ry="26" fill="#3a3f7a"/><path d="M42 48q10-10 22-8" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>${face(60, 62, 0.8)}<rect x="40" y="98" width="40" height="16" rx="6" fill="#fff" ${o()}/>`,
  'p-galaxy': () => `<circle cx="60" cy="60" r="48" fill="#3a2f80" ${o()}/><path d="M60 60m-30 0a30 14 20 1 0 60 0a30 14 20 1 0-60 0" fill="#b28cff" opacity=".6"/>${[[40, 40], [80, 46], [70, 82], [34, 76], [86, 70]].map(([x, y]) => sparkle(x, y, 5)).join('')}${face(60, 62, 0.8)}`,
};

// ---------------------------------------------------------------- flowers and nature
const petals = (n, c, r = 22, rx = 12) => Array.from({ length: n }, (_, i) => `<ellipse cx="60" cy="${56 - r}" rx="${rx}" ry="${r}" fill="${c}" ${o(2.5)} transform="rotate(${(i * 360) / n} 60 56)"/>`).join('');
const NATURE = {
  'n-daisy': () => `${petals(10, '#fff', 22, 9)}<circle cx="60" cy="56" r="18" fill="#ffd23f" ${o()}/>${face(60, 56, 0.6)}`,
  'n-sunflower': () => `<path d="M60 80v34" stroke="#5fae5a" stroke-width="6"/>${petals(12, '#ffd23f', 24, 9)}<circle cx="60" cy="56" r="20" fill="#a8703f" ${o()}/>${face(60, 56, 0.65)}`,
  'n-tulip': () => `<path d="M60 70v40" stroke="#5fae5a" stroke-width="6"/><path d="M60 110q-30-20-16-34" fill="#7fcf6a" ${o(2.5)}/><path d="M34 30q4 44 26 44t26-44l-13 12-13-18-13 18z" fill="#ff7b8a" ${o()}/>${face(60, 52, 0.7)}`,
  'n-rose': () => `<path d="M60 74v38" stroke="#5fae5a" stroke-width="6"/><circle cx="60" cy="50" r="30" fill="#ff5c7a" ${o()}/><path d="M44 46q16-18 32 0q-16 10-32 0zM48 58q12 10 24 0" stroke="#d63c5a" stroke-width="3" fill="none"/>${face(60, 58, 0.55)}`,
  'n-blossom': () => `${petals(5, '#ffc6e0', 24, 16)}<circle cx="60" cy="56" r="12" fill="#ff8fb8" ${o(2.5)}/>${face(60, 56, 0.45)}`,
  'n-lotus': () => `<path d="M60 20q20 30 0 64q-20-34 0-64zM26 40q30 10 34 44Q24 76 26 40zM94 40q-30 10-34 44 36-8 34-44z" fill="#ffb6d5" ${o()}/><ellipse cx="60" cy="96" rx="42" ry="10" fill="#7fcf6a" ${o()}/>${face(60, 62, 0.55)}`,
  'n-cactus': () => `<path d="M48 110V30q0-14 12-14t12 14v80zM48 70H32q-8 0-8-10V44M72 60h16q8 0 8-10V36" fill="none" stroke="${OL}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M48 110V30q0-14 12-14t12 14v80zM48 70H32q-8 0-8-10V44M72 60h16q8 0 8-10V36" fill="none" stroke="#7fcf6a" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="60" cy="14" r="6" fill="#ff8fb8"/>${face(60, 54, 0.6)}<rect x="38" y="96" width="44" height="18" rx="4" fill="#f2a46b" ${o(2.5)}/>`,
  'n-rainbow': () => `${['#ff7b8a', '#ffb05c', '#ffe066', '#7fd88f', '#6fb8ff', '#b28cff'].map((c, i) => `<path d="M${14 + i * 6} 90a${46 - i * 6} ${46 - i * 6} 0 0 1 ${92 - i * 12} 0" stroke="${c}" stroke-width="7" fill="none"/>`).join('')}<path d="M4 92q4-16 20-12q8-12 22 0q-2 12-42 12zM116 92q-4-16-20-12q-8-12-22 0q2 12 42 12z" fill="#fff" ${o(2.5)}/>${face(60, 70, 0.6)}`,
  'n-cloud': () => `<path d="M24 86q-18 0-18-18t20-18q2-24 28-24 20 0 28 16 26-4 30 20 12 4 12 14t-14 10z" fill="#fff" ${o()}/>${face(60, 66, 1)}`,
  'n-clover': () => `${[0, 90, 180, 270].map((a) => `<path d="M60 56c-20-20-30 4-16 14-12 6 4 28 16-14z" fill="#5fc36b" ${o(2.5)} transform="rotate(${a} 60 56)"/>`).join('')}<path d="M60 56q10 30 4 50" stroke="#4a9a52" stroke-width="5" fill="none"/>${face(60, 56, 0.45)}`,
  'n-leaf': () => `<path d="M20 100Q20 20 100 20Q100 100 20 100z" fill="#8fd18a" ${o()}/><path d="M24 96L92 28" stroke="#5fae5a" stroke-width="3"/>${face(60, 62, 0.8)}`,
  'n-mushroom': () => `<path d="M44 70h32v34q0 8-16 8t-16-8z" fill="#fff4e0" ${o()}/><path d="M12 70q0-52 48-52t48 52z" fill="#b28cff" ${o()}/>${[[36, 46], [64, 34], [86, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff"/>`).join('')}${face(60, 88, 0.6)}`,
};

// ---------------------------------------------------------------- music friends
const MUSIC = {
  'm-violin': () => `<path d="M60 4v26" stroke="${OL}" stroke-width="6"/><path d="M60 30c-20 0-24 16-16 26-12 8-12 26 0 34 10 8 22 8 32 0 12-8 12-26 0-34 8-10 4-26-16-26z" fill="#c9773a" ${o()}/><path d="M52 50q-4 6 0 10M68 50q4 6 0 10" stroke="${OL}" stroke-width="2.5" fill="none"/>${face(60, 76, 0.65)}`,
  'm-trumpet': () => `<path d="M10 56h60l30-22v52l-30-22H10z" fill="#ffd23f" ${o()}/><rect x="34" y="40" width="6" height="16" fill="#e0a100"/><rect x="46" y="40" width="6" height="16" fill="#e0a100"/><rect x="58" y="40" width="6" height="16" fill="#e0a100"/>${face(84, 60, 0.6)}`,
  'm-drum': () => `<path d="M50 26L28 4M70 26L92 4" stroke="#a8703f" stroke-width="6" stroke-linecap="round"/><path d="M18 44v44q42 22 84 0V44z" fill="#ff7b8a" ${o()}/><ellipse cx="60" cy="44" rx="42" ry="14" fill="#fff4e0" ${o()}/><path d="M18 60l20 30 22-30 22 30 20-30" stroke="#ffd23f" stroke-width="3" fill="none"/>${face(60, 72, 0.6)}`,
  'm-guitar': () => `<rect x="56" y="2" width="8" height="54" fill="#8a5a3a" ${o(2.5)}/><path d="M60 46c-22 0-34 14-30 28-8 14 2 34 30 34s38-20 30-34c4-14-8-28-30-28z" fill="#ff9a3c" ${o()}/><circle cx="60" cy="76" r="9" fill="${OL}"/>${face(60, 96, 0.5)}`,
  'm-flute': () => `<rect x="6" y="52" width="108" height="16" rx="8" fill="#d9dde8" ${o()}/>${[30, 44, 58, 72, 86].map((x) => `<circle cx="${x}" cy="60" r="3.5" fill="${OL}"/>`).join('')}${face(60, 38, 0.7)}`,
  'm-piano': () => `<rect x="10" y="30" width="100" height="70" rx="10" fill="#3a3440" ${o()}/><rect x="16" y="64" width="88" height="30" fill="#fff"/>${[28, 40, 64, 76, 88].map((x) => `<rect x="${x - 3}" y="64" width="7" height="18" fill="#3a3440"/>`).join('')}${face(60, 46, 0.7)}`,
  'm-harp': () => `<path d="M24 108V14q50 0 70 60l-6 34z" fill="#ffd23f" ${o()}/>${[38, 50, 62, 74].map((x) => `<path d="M${x} 24V104" stroke="#a8703f" stroke-width="2"/>`).join('')}${face(46, 56, 0.55)}`,
  'm-sax': () => `<path d="M76 10v52q0 40-32 40-22 0-22-22 0-14 12-14" fill="none" stroke="${OL}" stroke-width="20" stroke-linecap="round"/><path d="M76 10v52q0 40-32 40-22 0-22-22 0-14 12-14" fill="none" stroke="#ffb03b" stroke-width="14" stroke-linecap="round"/>${face(48, 88, 0.55)}`,
  'm-maracas': () => `<path d="M38 70l-10 40M82 70l10 40" stroke="#a8703f" stroke-width="8" stroke-linecap="round"/><ellipse cx="40" cy="46" rx="22" ry="28" fill="#ff7b8a" ${o()}/><ellipse cx="80" cy="46" rx="22" ry="28" fill="#7fd88f" ${o()}/>${face(40, 46, 0.5)}${face(80, 46, 0.5)}`,
  'm-xylophone': () => `${['#ff7b8a', '#ffb05c', '#ffe066', '#7fd88f', '#6fb8ff', '#b28cff'].map((c, i) => `<rect x="${14 + i * 16}" y="${30 + i * 4}" width="13" height="${70 - i * 8}" rx="4" fill="${c}" ${o(2)}/>`).join('')}${face(60, 48, 0.55)}`,
  'm-treble': () => `<path d="M44 90V26l52-12v64" fill="none" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/><path d="M44 26l52-12v14l-52 12z" fill="${OL}"/><ellipse cx="32" cy="92" rx="16" ry="12" fill="#ffb05c" ${o()} transform="rotate(-20 32 92)"/><ellipse cx="84" cy="80" rx="16" ry="12" fill="#7fd8ff" ${o()} transform="rotate(-20 84 80)"/>${face(32, 92, 0.42)}${face(84, 80, 0.42)}`,
  'm-crotchet': () => `<path d="M74 92V14" stroke="${OL}" stroke-width="7"/><ellipse cx="56" cy="92" rx="22" ry="16" fill="#ff8fb8" ${o()} transform="rotate(-20 56 92)"/>${face(56, 92, 0.55)}`,
};

// ---------------------------------------------------------------- Halloween
const SPOOKY = {
  'h-pumpkin': () => `<path d="M60 26q4-14 14-16" stroke="#5fae5a" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="68" rx="28" ry="38" fill="#ff9a3c" ${o()}/><ellipse cx="82" cy="68" rx="28" ry="38" fill="#ff9a3c" ${o()}/><ellipse cx="60" cy="68" rx="26" ry="40" fill="#ffad4f" ${o()}/>${face(60, 70, 1)}`,
  'h-ghost': () => `<path d="M24 108V52q0-38 36-38t36 38v56l-12-10-12 10-12-10-12 10-12-10z" fill="#fff" ${o()}/>${face(60, 56, 1, 'o')}`,
  'h-bat': () => `<path d="M60 60q-20-30-52-18 14 8 10 22-12-4-18 6 26 0 36 14 12-10 24-24zM60 60q20-30 52-18-14 8-10 22 12-4 18 6-26 0-36 14-12-10-24-24z" fill="#6a5a7a" ${o()}/><circle cx="60" cy="62" r="20" fill="#7a6a8a" ${o()}/><path d="M48 46l-4-10 10 6M72 46l4-10-10 6" fill="#7a6a8a" ${o(2)}/>${face(60, 64, 0.6)}`,
  'h-candy-corn': () => `<path d="M60 10L96 106H24z" fill="#fff" ${o()}/><path d="M42 58h36l14 48H28z" fill="#ffb03b"/><path d="M28 106h64l-6-16H34z" fill="#ffe066"/><path d="M60 10L96 106H24z" fill="none" ${o()}/>${face(60, 66, 0.7)}`,
  'h-witch-hat': () => `<ellipse cx="60" cy="96" rx="52" ry="12" fill="#5a3f8a" ${o()}/><path d="M30 94L64 10l26 84z" fill="#6a4aa0" ${o()}/><rect x="34" y="78" width="54" height="10" fill="#ffb03b"/>${star(66, 50, 8, '#ffe066')}`,
  'h-cauldron': () => `<ellipse cx="60" cy="44" rx="40" ry="10" fill="#7fd88f" ${o()}/><circle cx="48" cy="34" r="6" fill="#a8f0a0" ${o(2)}/><circle cx="70" cy="28" r="4" fill="#a8f0a0" ${o(2)}/><path d="M20 48q0 60 40 60t40-60z" fill="#3a3440" ${o()}/>${face(60, 76, 0.8)}`,
  'h-black-cat': () => animal({ c: '#3a3440', ears: 'cat', earC: '#3a3440', mouth: 'cat' }).replace(/fill="#4f3747"/g, 'fill="#fff"'),
  'h-spider': () => `${[-1, 1].map((s) => [30, 46, 62].map((y) => `<path d="M60 ${y}q${s * 40} -16 ${s * 50} 20" stroke="${OL}" stroke-width="4" fill="none"/>`).join('')).join('')}<path d="M60 0v22" stroke="#c9c3d6" stroke-width="2"/><circle cx="60" cy="50" r="26" fill="#5a4a6a" ${o()}/>${face(60, 52, 0.7)}`,
  'h-candy-bucket': () => `<path d="M30 30q30-26 60 0" stroke="${OL}" stroke-width="4" fill="none"/><path d="M22 40h76l-10 66H32z" fill="#ff9a3c" ${o()}/><path d="M42 60l6-7 6 7zM66 60l6-7 6 7z" fill="${OL}"/><path d="M44 80q16 12 32 0" stroke="${OL}" stroke-width="3" fill="none"/>${star(40, 34, 7, '#ffe066')}<circle cx="72" cy="32" r="7" fill="#ff7bb0" ${o(2)}/>`,
  'h-haunted-house': () => `<path d="M20 110V52l40-36 40 36v58z" fill="#7a6a9a" ${o()}/><path d="M12 56l48-44 48 44" fill="none" stroke="#5a4a7a" stroke-width="8" stroke-linecap="round"/><rect x="34" y="62" width="16" height="16" fill="#ffe066" ${o(2)}/><rect x="70" y="62" width="16" height="16" fill="#ffe066" ${o(2)}/><path d="M50 110V90q10-10 20 0v20z" fill="#3a3440"/>`,
  'h-mummy': () => `<ellipse cx="60" cy="62" rx="40" ry="46" fill="#f5efe0" ${o()}/>${[34, 48, 80, 94].map((y) => `<path d="M22 ${y}q38 ${y % 3 ? 8 : -6} 76 0" stroke="#d9cfb8" stroke-width="3" fill="none"/>`).join('')}<rect x="30" y="56" width="60" height="20" fill="#3a3440"/>${face(60, 66, 0.8)}`,
  'h-lantern': () => `<path d="M60 8v12" stroke="${OL}" stroke-width="4"/><rect x="34" y="20" width="52" height="10" rx="4" fill="#3a3440"/><path d="M34 30h52l-6 66H40z" fill="#ffd23f" ${o()}/><rect x="34" y="96" width="52" height="10" rx="4" fill="#3a3440"/>${face(60, 62, 0.7)}`,
};

// ---------------------------------------------------------------- treasure and vehicles
const TREASURE = {
  't-diamond': () => `<path d="M24 44l16-22h40l16 22-36 56z" fill="#9fe8ff" ${o()}/><path d="M24 44h72M40 22l-4 22 24 56 24-56-4-22" stroke="#6fc6e8" stroke-width="2" fill="none"/>${face(60, 54, 0.6)}`,
  't-crown': () => `<path d="M16 90l-6-56 26 24 24-36 24 36 26-24-6 56z" fill="#ffd23f" ${o()}/><circle cx="60" cy="72" r="7" fill="#ff5c8a" ${o(2)}/>`,
  't-ring': () => `<circle cx="60" cy="74" r="32" fill="none" stroke="${OL}" stroke-width="14"/><circle cx="60" cy="74" r="32" fill="none" stroke="#ffd23f" stroke-width="9"/><path d="M44 30l16-20 16 20-16 16z" fill="#ff8fd0" ${o()}/>`,
  't-pearl': () => `<path d="M10 70q50 50 100 0Q60 100 10 70z" fill="#ffc6e0" ${o()}/><path d="M10 70q50-60 100 0Q60 40 10 70z" fill="#ffd6e8" ${o()}/><circle cx="60" cy="70" r="16" fill="#fff" ${o(2.5)}/>${face(60, 70, 0.4)}`,
  't-chest': () => `<path d="M14 58q0-34 46-34t46 34z" fill="#c98a52" ${o()}/><rect x="14" y="58" width="92" height="48" rx="6" fill="#a8703f" ${o()}/><path d="M14 58h92" stroke="#ffd23f" stroke-width="6"/><rect x="52" y="56" width="16" height="20" rx="3" fill="#ffd23f" ${o(2)}/>${sparkle(30, 18, 6, '#ffd23f')}${sparkle(94, 20, 5, '#ffd23f')}`,
  't-coin': () => `<circle cx="60" cy="60" r="44" fill="#ffd23f" ${o()}/><circle cx="60" cy="60" r="34" fill="none" stroke="#e0a100" stroke-width="3"/>${face(60, 62, 0.9)}`,
  't-crystal': () => `<path d="M60 10l22 34-22 66-22-66z" fill="#c9a7ff" ${o()}/><path d="M30 60l14-16 10 50zM90 60l-14-16-10 50z" fill="#e0ccff" ${o(2.5)}/>${face(60, 52, 0.55)}`,
  't-wand': () => `<path d="M22 104L70 50" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M22 104L70 50" stroke="#ff8fd0" stroke-width="6" stroke-linecap="round"/>${star(80, 38, 26, '#ffe066')}${face(80, 40, 0.45)}${sparkle(30, 30, 6, '#ffd23f')}`,
};
const RIDES = {
  'v-car': () => `<path d="M10 80V64q0-8 8-10l16-20h44l16 20q16 2 16 12v14z" fill="#ff7b8a" ${o()}/><path d="M40 40h34l10 14H32z" fill="#bfe6ff"/><circle cx="34" cy="84" r="12" fill="#3a3440" ${o()}/><circle cx="88" cy="84" r="12" fill="#3a3440" ${o()}/>${face(62, 66, 0.55)}`,
  'v-bus': () => `<rect x="10" y="26" width="100" height="60" rx="10" fill="#ffd23f" ${o()}/>${[22, 46, 70].map((x) => `<rect x="${x}" y="36" width="18" height="16" rx="3" fill="#bfe6ff" ${o(2)}/>`).join('')}<circle cx="32" cy="90" r="11" fill="#3a3440" ${o()}/><circle cx="88" cy="90" r="11" fill="#3a3440" ${o()}/>${face(60, 68, 0.6)}`,
  'v-train': () => `<rect x="18" y="40" width="70" height="48" rx="8" fill="#6fb8ff" ${o()}/><rect x="70" y="24" width="30" height="64" rx="6" fill="#ff7b8a" ${o()}/><rect x="28" y="16" width="12" height="24" fill="#3a3440"/><circle cx="34" cy="94" r="10" fill="#3a3440" ${o()}/><circle cx="62" cy="94" r="10" fill="#3a3440" ${o()}/><circle cx="88" cy="94" r="10" fill="#3a3440" ${o()}/>${face(52, 64, 0.6)}`,
  'v-balloon': () => `<path d="M40 86l6 14M80 86l-6 14" stroke="${OL}" stroke-width="2.5"/><rect x="44" y="98" width="32" height="16" rx="4" fill="#c98a52" ${o()}/><path d="M60 6q40 0 40 40 0 26-24 42H44Q20 72 20 46 20 6 60 6z" fill="#ff9ec4" ${o()}/><path d="M60 6q-16 30 0 82M60 6q16 30 0 82" stroke="#ffd23f" stroke-width="4" fill="none"/>${face(60, 46, 0.6)}`,
  'v-boat': () => `<path d="M60 10v60" stroke="${OL}" stroke-width="4"/><path d="M62 14l32 50H62z" fill="#fff" ${o()}/><path d="M12 72h96l-14 30H26z" fill="#ff9a3c" ${o()}/><path d="M6 108q14-8 28 0t28 0 28 0 26 0" stroke="#6fb8ff" stroke-width="5" fill="none"/>${face(60, 86, 0.55)}`,
  'v-bike': () => `<circle cx="28" cy="80" r="22" fill="none" stroke="${OL}" stroke-width="6"/><circle cx="92" cy="80" r="22" fill="none" stroke="${OL}" stroke-width="6"/><path d="M28 80l24-36h34l6 36M52 44l14 36 26-36M44 36h20M84 30v14" stroke="#ff7b8a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
};

// ---------------------------------------------------------------- Ultra Mythics (holographic)
const HOLO = '<defs><linearGradient id="§holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8fd8"><animate attributeName="stop-color" values="#ff8fd8;#7fe0ff;#ffe66b;#b28cff;#ff8fd8" dur="4s" repeatCount="indefinite"/></stop><stop offset=".5" stop-color="#7fe0ff"><animate attributeName="stop-color" values="#7fe0ff;#ffe66b;#b28cff;#ff8fd8;#7fe0ff" dur="4s" repeatCount="indefinite"/></stop><stop offset="1" stop-color="#b28cff"><animate attributeName="stop-color" values="#b28cff;#ff8fd8;#7fe0ff;#ffe66b;#b28cff" dur="4s" repeatCount="indefinite"/></stop></linearGradient></defs>';
const shine = `${sparkle(18, 20, 7)}${sparkle(100, 28, 5)}${sparkle(96, 100, 6)}${sparkle(16, 96, 4)}`;
const ULTRA = {
  'u-holo-unicorn': () => `${HOLO}${A['a-bunny']().replace(/fill="#fbf7ff"/g, 'fill="url(#§holo)"').replace(/<ellipse cx="(44|76)" cy="22"[^>]*\/>/g, '')}<path d="M54 30L60 0L66 30Z" fill="#ffd76a" ${o(2.5)}/>${shine}`,
  'u-galaxy-dragon': () => `${HOLO}<path d="M20 40l-10-24 26 14zM100 40l10-24-26 14z" fill="#7b5bd6" ${o()}/><ellipse cx="60" cy="62" rx="44" ry="40" fill="url(#§holo)" ${o()}/><path d="M36 26l6 14 8-16 10 14 10-14 8 16 6-14" fill="none" stroke="#7b5bd6" stroke-width="5" stroke-linejoin="round"/>${face(60, 64, 1)}${shine}`,
  'u-crystal-clef': () => `${HOLO}<path d="M44 92V22l52-12v66" fill="none" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M44 22l52-12v16l-52 12z" fill="url(#§holo)" ${o(2.5)}/><ellipse cx="30" cy="94" rx="20" ry="15" fill="url(#§holo)" ${o()} transform="rotate(-20 30 94)"/><ellipse cx="82" cy="80" rx="20" ry="15" fill="url(#§holo)" ${o()} transform="rotate(-20 82 80)"/>${face(30, 94, 0.5)}${face(82, 80, 0.5)}${shine}`,
  'u-rainbow-phoenix': () => `${HOLO}${['#ff7b8a', '#ffb05c', '#ffe066', '#7fd88f', '#6fb8ff'].map((c, i) => `<path d="M60 70Q${10 + i * 6} ${30 - i * 4} ${4 + i * 4} ${70 - i * 10}" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M60 70Q${110 - i * 6} ${30 - i * 4} ${116 - i * 4} ${70 - i * 10}" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}<circle cx="60" cy="66" r="26" fill="url(#§holo)" ${o()}/><path d="M56 40l4-14 4 14" fill="#ffd23f" ${o(2)}/>${face(60, 68, 0.7)}${shine}`,
  'u-diamond-kitty': () => `${HOLO}${A['a-kitty']().replace(/#ffb36b/g, 'url(#§holo)').replace(/stroke="#e08a3c"/g, 'stroke="#fff"')}<path d="M44 14l16-10 16 10-16 10z" fill="#9fe8ff" ${o(2)}/>${shine}`,
};

export const COLLECT = { ...A, ...SEA, ...SPACE, ...NATURE, ...MUSIC, ...SPOOKY, ...TREASURE, ...RIDES, ...ULTRA };
export const HOLO_GRADIENT = HOLO;
