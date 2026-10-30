// Furniture, species toys and throwable toys for the pet house, as SVG
// markup (app-authored, never user text). Flat cartoon colours with a dark
// outline to match the pets. Each prop stands on y = 0, centred on x = 0, in
// the same units as the pets and the girl.

const L = '#4a3040';
const ink = `stroke="${L}" stroke-width="3" stroke-linejoin="round"`;
const star = (x, y, r, fill) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
};
export const heartPath = (x, y, s) => `M${x} ${y + 4 * s}c${-6 * s} ${-5 * s} ${-12 * s} ${-9 * s} ${-12 * s} ${-14 * s}c0 ${-4 * s} ${3 * s} ${-7 * s} ${6.5 * s} ${-7 * s}c${2.5 * s} 0 ${4.5 * s} ${1.5 * s} ${5.5 * s} ${3.5 * s}c${1 * s} ${-2 * s} ${3 * s} ${-3.5 * s} ${5.5 * s} ${-3.5 * s}c${3.5 * s} 0 ${6.5 * s} ${3 * s} ${6.5 * s} ${7 * s}c0 ${5 * s} ${-6 * s} ${9 * s} ${-12 * s} ${14 * s}z`;

// ---------------------------------------------------------------- furniture
export function armchairBack(c = '#f28fb0') {
  const d = '#d9709a';
  return `<g>
    <path d="M-80-36V-150q0-26 26-26h108q26 0 26 26V-36z" fill="${c}" ${ink}/>
    <path d="M-58-60v-84q0-12 12-12h92q12 0 12 12v84" fill="none" stroke="${d}" stroke-width="3"/>
    <circle cx="-26" cy="-118" r="3.5" fill="${d}"/><circle cx="26" cy="-118" r="3.5" fill="${d}"/><circle cx="0" cy="-96" r="3.5" fill="${d}"/>
    <rect x="-70" y="-48" width="140" height="30" rx="12" fill="#ffc0d4" ${ink}/>
  </g>`;
}
export function armchairFront(c = '#f28fb0') {
  return `<g>
    <path d="M-92-100q0-12 12-12h14q12 0 12 12V0h-38z" fill="${c}" ${ink}/>
    <path d="M54-100q0-12 12-12h14q12 0 12 12V0H54z" fill="${c}" ${ink}/>
    <path d="M-70-18h140v14h-140z" fill="${c}" ${ink}/>
    <rect x="-86" y="-4" width="10" height="8" rx="3" fill="#8a5a3a" ${ink}/><rect x="76" y="-4" width="10" height="8" rx="3" fill="#8a5a3a" ${ink}/>
    <path d="M-86-96h26M60-96h26" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-linecap="round"/>
  </g>`;
}

export function petBed(fancy = false) {
  const rim = fancy ? '#ff8fb8' : '#9fc7f0', rimD = fancy ? '#e96d9a' : '#7aa8d8', cushion = fancy ? '#fff0f6' : '#fff7e8';
  return `<g>
    <ellipse cx="0" cy="-14" rx="78" ry="26" fill="${rim}" ${ink}/>
    <ellipse cx="0" cy="-20" rx="62" ry="15" fill="${cushion}" ${ink}/>
    <path d="M-78-14q0 18 78 22q78-4 78-22" fill="${rimD}" ${ink}/>
    ${fancy ? `<path d="${heartPath(0, -6, 0.8)}" fill="#fff"/>` : '<path d="M-40 0h8M-10 4h8M20 3h8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>'}
  </g>`;
}

export function bowl(colour = '#7ec8f0') {
  return `<g>
    <path d="M-30-22h60l-7 20q-1 3-4 3H-19q-3 0-4-3z" fill="${colour}" ${ink}/>
    <ellipse cx="0" cy="-22" rx="30" ry="7" fill="#fff" ${ink}/>
    <path d="M-14-10a4 3 0 0 1 8 0a4 3 0 0 1 8 0" fill="none" stroke="#fff" stroke-width="2.4" opacity=".85"/>
  </g>`;
}

export function plant() {
  return `<g>
    <path d="M-6-60q-30-30-24-70q22 22 24 70M4-60q10-50 40-62q0 40-40 62M0-60q-4-50 6-84q14 40-6 84" fill="#7fcf8a" ${ink}/>
    <path d="M-26-58h52l-8 54q-1 4-5 4h-26q-4 0-5-4z" fill="#f2a46b" ${ink}/>
    <path d="M-28-60h56v10h-56z" fill="#e88a4e" ${ink}/>
  </g>`;
}

// ---------------------------------------------------------------- species toys
export function wheelBack() {
  return `<g>
    <path d="M-50 0l40-80M50 0l-40-80" stroke="#8fa3c8" stroke-width="10" stroke-linecap="round"/>
    <path d="M-50 0l40-80M50 0l-40-80" stroke="${L}" stroke-width="3" fill="none" opacity="0"/>
    <circle cx="0" cy="-80" r="72" fill="#eaf6ff" fill-opacity=".55" stroke="#6fb8ff" stroke-width="10"/>
    <circle cx="0" cy="-80" r="72" fill="none" ${ink}/>
    <circle cx="0" cy="-80" r="62" fill="none" stroke="${L}" stroke-width="2" opacity=".5"/>
  </g>`;
}
export function wheelSpokes() {
  let s = '<g>';
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; s += `<path d="M0 0L${(Math.cos(a) * 66).toFixed(1)} ${(Math.sin(a) * 66).toFixed(1)}" stroke="#a6c8f0" stroke-width="3"/>`; }
  for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8; s += `<circle cx="${(Math.cos(a) * 67).toFixed(1)}" cy="${(Math.sin(a) * 67).toFixed(1)}" r="2.6" fill="#ffd36e"/>`; }
  return `${s}<circle r="9" fill="#ffd36e" ${ink}/></g>`;
}
export function wheelFront() {
  return `<g><path d="M-58 0h116" stroke="${L}" stroke-width="12" stroke-linecap="round"/><path d="M-58 0h116" stroke="#8fa3c8" stroke-width="7" stroke-linecap="round"/></g>`;
}

export function scratchPost() {
  let rope = '';
  for (let y = -16; y > -116; y -= 8) rope += `<path d="M-13 ${y}l26-5" stroke="#c9a06a" stroke-width="2.4"/>`;
  return `<g>
    <rect x="-46" y="-12" width="92" height="14" rx="5" fill="#b48ee8" ${ink}/>
    <rect x="-14" y="-122" width="28" height="112" fill="#e8c890" ${ink}/>${rope}
    <rect x="-40" y="-136" width="80" height="16" rx="6" fill="#b48ee8" ${ink}/>
    <path d="M30-120v26" stroke="${L}" stroke-width="2"/><circle cx="30" cy="-90" r="7" fill="#ff8fb8" ${ink}/>
  </g>`;
}

export function kennel() {
  return `<g>
    <path d="M-62 0v-80h124V0z" fill="#ffcf8a" ${ink}/>
    <path d="M-74-76L0-134L74-76z" fill="#f2777f" ${ink}/>
    <path d="M-26 0v-38a26 26 0 0 1 52 0V0z" fill="#5c3f4f" ${ink}/>
    <rect x="-24" y="-100" width="48" height="16" rx="5" fill="#fff" ${ink}/>
    <path d="M-12-92h24" stroke="#f2777f" stroke-width="3" stroke-linecap="round"/>
    <path d="M-62-60h18M44-40h18M-60-24h14" stroke="#e8b46a" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

export function carrotPatch() {
  const carrot = (x) => `<path d="M${x - 6}-26q6-18 12 0" fill="#ff9f43" ${ink}/><path d="M${x}-28l-8-16M${x}-28l0-18M${x}-28l8-16" stroke="#5fbf6a" stroke-width="5" stroke-linecap="round"/>`;
  return `<g>
    <path d="M-64-26h128l-8 24q-1 2-4 2H-56q-3 0-4-2z" fill="#c58a5a" ${ink}/>
    <ellipse cx="0" cy="-26" rx="64" ry="9" fill="#7a5038" ${ink}/>
    ${[-36, -12, 12, 36].map(carrot).join('')}
  </g>`;
}

export function nest() {
  return `<g>
    <ellipse cx="34" cy="-8" rx="30" ry="9" fill="#fff" ${ink}/>
    ${[[24, -10], [32, -7], [40, -10], [30, -12], [44, -6], [20, -6]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.6" fill="#e0b25a"/>`).join('')}
    <ellipse cx="-34" cy="-14" rx="34" ry="14" fill="#c99a5e" ${ink}/>
    <ellipse cx="-34" cy="-18" rx="24" ry="7" fill="#8a6038"/>
    <path d="M-64-14q10 6 20 0q10 6 20 0q10 6 20 0" stroke="#a87a44" stroke-width="2.4" fill="none"/>
  </g>`;
}

export function bambooPot() {
  const stalk = (x, h, lean) => `<path d="M${x} -40Q${x + lean / 2} ${-40 - h / 2} ${x + lean} ${-40 - h}" stroke="${L}" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M${x} -40Q${x + lean / 2} ${-40 - h / 2} ${x + lean} ${-40 - h}" stroke="#8fd16f" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  return `<g>
    ${stalk(-14, 110, -12)}${stalk(4, 136, 6)}${stalk(18, 96, 16)}
    <path d="M-20-110l-26-8q14-6 26 8M10-150l28-10q-12 14-28 10M30-120l26 2q-14 8-26-2" fill="#7fcf6a" ${ink}/>
    <path d="M-40-42h80l-8 40q-1 2-4 2H-32q-3 0-4-2z" fill="#f4f4f8" ${ink}/>
    <path d="M-30-24h60" stroke="#ff8fa3" stroke-width="5" stroke-linecap="round"/>
  </g>`;
}

export function rainbowArch() {
  const cols = ['#ff7b8a', '#ffb05c', '#ffe066', '#7fd88f', '#6fb8ff', '#b28cff'];
  const arcs = cols.map((c, i) => `<path d="M${-88 + i * 8} -6A${88 - i * 8} ${96 - i * 8} 0 0 1 ${88 - i * 8} -6" stroke="${c}" stroke-width="9" fill="none"/>`).join('');
  const cloud = (x) => `<path d="M${x - 30} -2q-10-22 12-24q6-18 26-8q20-6 22 14q14 4 4 18z" fill="#fff" ${ink}/>`;
  return `<g>${arcs}<path d="M-92-6A92 100 0 0 1 92-6M-44-6A44 52 0 0 1 44-6" stroke="${L}" stroke-width="2.6" fill="none"/>${cloud(-84)}${cloud(84)}${star(0, -112, 9, '#ffd76a')}</g>`;
}

/** The special toy each pet species gets with its home. */
export const SPECIES_PROP = {
  'pet-kitten': { back: scratchPost },
  'pet-puppy': { back: kennel },
  'pet-bunny': { back: carrotPatch },
  'pet-chick': { back: nest },
  'pet-hamster': { back: wheelBack, spokes: wheelSpokes, front: wheelFront },
  'pet-panda': { back: bambooPot },
  'pet-unicorn': { back: rainbowArch },
};

// ---------------------------------------------------------------- throwable toys
// Drawn centred on (0, 0); r is the radius in units.
export const TOYS = {
  'toy-ball': { r: 14, bounce: 0.62, art: () => `<circle r="14" fill="#d7f05a" ${ink}/><path d="M-12-6q12 6 0 18M12-10q-12 4-2 20" stroke="#fff" stroke-width="2.6" fill="none"/>` },
  'toy-star-ball': { r: 14, bounce: 0.72, art: () => `<circle r="14" fill="#a78bfa" ${ink}/>${star(-3, -3, 6, '#ffe066')}${star(6, 6, 3.5, '#fff')}` },
  'toy-yarn': { r: 15, bounce: 0.3, art: () => `<circle r="15" fill="#ff8fb8" ${ink}/><path d="M-12-6q12-6 22 6M-14 2q14-8 26 4M-9 10q8-6 18 0M-4-14q-6 12 4 26" stroke="#e86a9a" stroke-width="2" fill="none"/><path d="M12 8q10 8 4 16" stroke="#ff8fb8" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  'toy-mouse': { r: 13, bounce: 0.35, art: () => `<path d="M-14 6q2-16 16-16q12 0 14 16z" fill="#c9c3d6" ${ink}/><circle cx="-2" cy="-10" r="5" fill="#ffc2d6" ${ink}/><circle cx="10" cy="0" r="1.8" fill="${L}"/><circle cx="16" cy="5" r="2" fill="#ff8fa3"/><path d="M-14 4q-10 2-8 10" stroke="${L}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` },
  'toy-duck': { r: 14, bounce: 0.5, art: () => `<path d="M-15 2q0 12 14 12q14 0 15-10q-4 2-8 0q4-6 0-12q-6-8-14-2q-4 4-2 10q-4-2-5 2z" fill="#ffd84d" ${ink}/><path d="M6-6l9-1-8 4z" fill="#ff9f2e" stroke="${L}" stroke-width="1.6"/><circle cx="1" cy="-7" r="1.8" fill="${L}"/>` },
  'toy-beach-ball': { r: 22, bounce: 0.78, art: () => `<circle r="22" fill="#fff" ${ink}/><path d="M0-22Q-14 0 0 22Q-22 4 0-22z" fill="#ff7b8a"/><path d="M0-22Q14 0 0 22Q22 4 0-22z" fill="#6fb8ff"/><path d="M-22 0q22-6 44 0" stroke="#ffe066" stroke-width="6" fill="none"/><circle r="22" fill="none" ${ink}/><circle r="3" fill="#fff" ${ink}/>` },
  'toy-bone': { r: 14, bounce: 0.4, art: () => `<path d="M-10-4h20a6 6 0 1 1 6 8a6 6 0 1 1-6 8h-20a6 6 0 1 1-6-8a6 6 0 1 1 6-8z" transform="translate(0 -4)" fill="#fff6e6" ${ink}/>` },
};

// ---------------------------------------------------------------- decorations
export function fairyLights() {
  // Four sagging loops between hooks; every bulb hangs from a point ON the wire.
  const cols = ['#ff7b8a', '#ffe066', '#7fd88f', '#6fb8ff', '#b28cff'];
  const hooks = [40, 220, 400, 580, 760], y0 = 30, sag = 46;
  let wire = '', bulbs = '', n = 0;
  for (let k = 0; k < hooks.length - 1; k++) {
    const a = hooks[k], b = hooks[k + 1], cx = (a + b) / 2, cy = y0 + sag;
    wire += `${k ? '' : `M${a} ${y0}`}Q${cx} ${cy} ${b} ${y0}`;
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const x = (1 - t) ** 2 * a + 2 * (1 - t) * t * cx + t * t * b;
      const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y0;
      const c = cols[n % 5];
      bulbs += `<g class="fairy-light" style="animation-delay:${(n % 5) * 0.3}s"><rect x="${(x - 2.5).toFixed(1)}" y="${(y - 1).toFixed(1)}" width="5" height="5" rx="1" fill="#6b5a70"/><circle cx="${x.toFixed(1)}" cy="${(y + 10).toFixed(1)}" r="10" fill="${c}" opacity=".28"/><ellipse cx="${x.toFixed(1)}" cy="${(y + 10).toFixed(1)}" rx="4.5" ry="6" fill="${c}"/></g>`;
      n++;
    }
  }
  const pins = hooks.map((x) => `<circle cx="${x}" cy="${y0}" r="3.5" fill="#c9a06a" stroke="#6b5a70" stroke-width="1.5"/>`).join('');
  return `<path d="${wire}" stroke="#6b5a70" stroke-width="2" fill="none"/>${bulbs}${pins}`;
}

// ---------------------------------------------------------------- kitchen and bedroom
export function fridge() {
  return `<g><rect x="-44" y="-200" width="88" height="200" rx="10" fill="#f4f6fb" ${ink}/><path d="M-44-130h88" ${ink}/>
    <rect x="30" y="-186" width="6" height="40" rx="3" fill="#c9cfe0"/><rect x="30" y="-116" width="6" height="56" rx="3" fill="#c9cfe0"/>
    <circle cx="-22" cy="-170" r="7" fill="#ff8fa3"/><path d="M-10-160l10-14 8 10z" fill="#ffd36e"/><rect x="-28" y="-104" width="22" height="16" rx="2" fill="#fff" stroke="#e0b25a" stroke-width="2"/></g>`;
}
export function counter() {
  return `<g><rect x="-150" y="-104" width="300" height="104" rx="6" fill="#ffe0b8" ${ink}/>
    <rect x="-156" y="-112" width="312" height="14" rx="5" fill="#fff" ${ink}/>
    ${[-142, -70, 2, 74].map((x) => `<rect x="${x}" y="-90" width="66" height="80" rx="5" fill="#ffd09a" stroke="${L}" stroke-width="2.5"/><rect x="${x + 27}" y="-58" width="12" height="5" rx="2.5" fill="#a87a44"/>`).join('')}
    <rect x="-40" y="-112" width="80" height="14" fill="#5a6a88"/>
    ${[-22, 22].map((x) => `<ellipse cx="${x}" cy="-112" rx="14" ry="4" fill="#2a2a3a"/>`).join('')}
    <path d="M60-112v-34h10v6" fill="none" stroke="${L}" stroke-width="4" stroke-linecap="round"/>
    <g transform="translate(-100 -112)"><path d="M-16 0v-14q0-6 6-6h20q6 0 6 6v14z" fill="#ff7b8a" ${ink}/><path d="M-20-20h40" stroke="${L}" stroke-width="3"/></g></g>`;
}
export function kitchenChairBack() {
  return `<g><path d="M-40-48v-92q0-10 10-10h60q10 0 10 10v92" fill="#c58a5a" ${ink}/><path d="M-26-60v-70h52v70" fill="none" stroke="#a8703f" stroke-width="3"/>
    <rect x="-46" y="-56" width="92" height="16" rx="5" fill="#ffc0d4" ${ink}/></g>`;
}
export function kitchenChairFront() {
  return `<g><path d="M-42-40V0M42-40V0" stroke="${L}" stroke-width="10" stroke-linecap="round"/><path d="M-42-40V0M42-40V0" stroke="#c58a5a" stroke-width="5" stroke-linecap="round"/></g>`;
}
export function kitchenTable() {
  return `<g><path d="M-80-70V0M80-70V0" stroke="${L}" stroke-width="11" stroke-linecap="round"/><path d="M-80-70V0M80-70V0" stroke="#c58a5a" stroke-width="6" stroke-linecap="round"/>
    <path d="M-110-86h220l-14 18h-192z" fill="#e8b47a" ${ink}/><ellipse cx="-30" cy="-88" rx="18" ry="5" fill="#fff" ${ink}/><path d="M30-104v16h14v-16z" fill="#bfe6ff" stroke="${L}" stroke-width="2.4"/></g>`;
}
export function bedBack() {
  return `<g><path d="M-100-40v-110q0-18 18-18h164q18 0 18 18v110" fill="#b9a2f0" ${ink}/>
    <rect x="-104" y="-62" width="208" height="30" rx="8" fill="#fff" ${ink}/>
    <rect x="-84" y="-82" width="62" height="28" rx="12" fill="#fff" ${ink}/><rect x="22" y="-82" width="62" height="28" rx="12" fill="#fff" ${ink}/></g>`;
}
export function bedFront() {
  return `<g><path d="M-108-48h216v40h-216z" fill="#ff9ec4" ${ink}/>
    ${[-80, -40, 0, 40, 80].map((x) => `<path d="${heartPath(x, -24, 0.45)}" fill="#fff" opacity=".7"/>`).join('')}
    <rect x="-108" y="-10" width="12" height="12" rx="3" fill="#8a5a3a" ${ink}/><rect x="96" y="-10" width="12" height="12" rx="3" fill="#8a5a3a" ${ink}/></g>`;
}
export function wardrobe() {
  return `<g><rect x="-60" y="-200" width="120" height="196" rx="6" fill="#f5d9b8" ${ink}/><path d="M0-196v188" ${ink}/>
    <circle cx="-8" cy="-100" r="4" fill="#a87a44"/><circle cx="8" cy="-100" r="4" fill="#a87a44"/>
    <path d="M-48-180h36v24h-36zM12-180h36v24h-36z" fill="none" stroke="#e0b88e" stroke-width="2.5"/>
    <rect x="-56" y="-6" width="10" height="8" fill="#8a5a3a"/><rect x="46" y="-6" width="10" height="8" fill="#8a5a3a"/></g>`;
}
export function bookshelf(spines = []) {
  const cols = ['#ff8fa3', '#7cc6ff', '#ffd36e', '#8fd18a', '#b9a2f0', '#ffb86b'];
  const shelf = (y, list) => {
    let x = -62, s = '';
    for (let i = 0; i < 9; i++) {
      const c = list[i] || cols[(i + y) % cols.length], w = list[i] ? 14 : 10 + (i * 3) % 5, h = 40 + (i * 7) % 12;
      s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="2" fill="${c}" stroke="${L}" stroke-width="1.2"/>`;
      x += w + 1;
      if (x > 50) break;
    }
    return s;
  };
  return `<g><rect x="-72" y="-170" width="144" height="170" rx="6" fill="#d9a575" ${ink}/>
    ${shelf(-118, spines.slice(0, 5))}${shelf(-62, spines.slice(5))}
    <path d="M-68-116h136M-68-60h136M-68-6h136" stroke="${L}" stroke-width="3"/></g>`;
}
export function poster() {
  return `<g><rect x="-34" y="-44" width="68" height="88" rx="4" fill="#fff" ${ink}/><rect x="-26" y="-36" width="52" height="72" rx="2" fill="#ffe3ef"/>
    <path d="M-6 18V-20l18-6v36" stroke="${L}" stroke-width="3" fill="none"/><ellipse cx="-11" cy="18" rx="6" ry="4.5" fill="${L}"/><ellipse cx="7" cy="12" rx="6" ry="4.5" fill="${L}"/></g>`;
}
export function rainbowRug() {
  const cols = ['#ff9aa8', '#ffc98a', '#fff09a', '#a6e3a8', '#9fd0ff', '#c9b0ff'];
  return cols.map((c, i) => `<ellipse cx="0" cy="0" rx="${190 - i * 26}" ry="${46 - i * 6.4}" fill="${c}"/>`).join('') + '<ellipse cx="0" cy="0" rx="190" ry="46" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 7"/>';
}

// ---------------------------------------------------------------- music corner, garden, seasonal
export function piano() {
  let keys = '';
  for (let i = 0; i < 14; i++) keys += `<rect x="${-70 + i * 10}" y="-92" width="10" height="26" fill="#fff" stroke="${L}" stroke-width="1.4"/>`;
  for (const i of [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]) keys += `<rect x="${-70 + i * 10 + 7}" y="-92" width="6" height="16" fill="${L}"/>`;
  return `<g><rect x="-80" y="-190" width="160" height="104" rx="8" fill="#7a4a3a" ${ink}/><rect x="-66" y="-176" width="132" height="60" rx="6" fill="#8e5a46"/>
    <path d="M-40-160v30M-40-160l14-4M0-166v34M0-166l14-4" stroke="#f5d27a" stroke-width="3" fill="none"/><ellipse cx="-44" cy="-130" rx="5" ry="4" fill="#f5d27a"/><ellipse cx="-4" cy="-132" rx="5" ry="4" fill="#f5d27a"/>
    <rect x="-84" y="-96" width="168" height="34" rx="4" fill="#7a4a3a" ${ink}/>${keys}
    <rect x="-76" y="-62" width="152" height="62" rx="4" fill="#6a3e30" ${ink}/><rect x="-70" y="-6" width="10" height="8" fill="#4a2a20"/><rect x="60" y="-6" width="10" height="8" fill="#4a2a20"/></g>`;
}
export function stool() {
  return `<g><path d="M-26-40V0M26-40V0" stroke="${L}" stroke-width="9" stroke-linecap="round"/><path d="M-26-40V0M26-40V0" stroke="#7a4a3a" stroke-width="5" stroke-linecap="round"/><rect x="-34" y="-52" width="68" height="16" rx="7" fill="#c9476a" ${ink}/></g>`;
}
export function tree() {
  return `<g><path d="M-14 0q4-60 0-110h28q-4 50 0 110z" fill="#a8703f" ${ink}/>
    <circle cx="-50" cy="-150" r="52" fill="#7fcf6a" ${ink}/><circle cx="48" cy="-156" r="56" fill="#7fcf6a" ${ink}/><circle cx="0" cy="-200" r="60" fill="#8fd97a" ${ink}/>
    ${[[-60, -150], [40, -170], [10, -215], [70, -130], [-20, -175]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#ff7b8a" stroke="${L}" stroke-width="2"/>`).join('')}</g>`;
}
export function flowers() {
  const f = (x, c) => `<path d="M${x} 0v-34" stroke="#5fae5a" stroke-width="4"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x}" cy="-42" rx="6" ry="10" fill="${c}" transform="rotate(${a} ${x} -34)"/>`).join('')}<circle cx="${x}" cy="-34" r="5" fill="#ffe066" stroke="${L}" stroke-width="1.5"/>`;
  return `<g>${f(-40, '#ff9ec4')}${f(-14, '#b28cff')}${f(12, '#ff7b8a')}${f(38, '#ffb05c')}<path d="M-56 0h112" stroke="#5fae5a" stroke-width="5" stroke-linecap="round"/></g>`;
}
export function paddlingPool() {
  return `<g><ellipse cx="0" cy="-14" rx="120" ry="34" fill="#6fb8ff" ${ink}/><ellipse cx="0" cy="-20" rx="104" ry="24" fill="#9fdcff"/>
    <path d="M-60-22q14-6 28 0M10-16q14-6 28 0M-20-30q12-5 24 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-120-14q0 22 120 26q120-4 120-26" fill="#ff8fb8" ${ink}/></g>`;
}
export function pumpkin(s = 1) {
  return `<g transform="scale(${s})"><ellipse cx="-16" cy="-26" rx="20" ry="26" fill="#ff9a3c" ${ink}/><ellipse cx="16" cy="-26" rx="20" ry="26" fill="#ff9a3c" ${ink}/><ellipse cx="0" cy="-26" rx="18" ry="27" fill="#ffad4f" ${ink}/>
    <path d="M0-52q2-10 8-12" stroke="#5fae5a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-14-32l6-7 6 7zM2-32l6-7 6 7z" fill="#4a3040"/><path d="M-14-18q14 10 28 0q-14 4-28 0z" fill="#4a3040"/></g>`;
}
export function bat(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0q-10-12-26-8q6 4 4 10q-6-2-10 2q12 0 18 6q6-4 14-10zM0 0q10-12 26-8q-6 4-4 10q6-2 10 2q-12 0-18 6q-6-4-14-10z" fill="#5a4a6a"/><circle r="7" fill="#5a4a6a"/><circle cx="-2.5" cy="-1" r="1.6" fill="#fff"/><circle cx="2.5" cy="-1" r="1.6" fill="#fff"/></g>`;
}
export function giftBox() {
  return `<g><rect x="-30" y="-48" width="60" height="48" rx="5" fill="#ff7bb0" ${ink}/><rect x="-34" y="-60" width="68" height="16" rx="5" fill="#ff9ec4" ${ink}/>
    <path d="M-5-60v60M5-60v60" stroke="#ffe066" stroke-width="5"/><path d="M0-60c-14-16-26-6-14 0M0-60c14-16 26-6 14 0" fill="none" stroke="#ffe066" stroke-width="5" stroke-linecap="round"/></g>`;
}
