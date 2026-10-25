// Pet friends: original chibi-style SVG pets with soft 3D-like shading
// (radial gradients, gloss, contact shadow). Parts carry class names so CSS
// can animate them: walking bob, tail wag, blinking, sleeping and playing.

// Prices in coins (tuned with the economy simulation, docs/economy.md).
export const PETS = [
  { id: 'pet-chick', name: 'Chick', price: 50 },
  { id: 'pet-kitten', name: 'Kitten', price: 60 },
  { id: 'pet-bunny', name: 'Bunny', price: 60 },
  { id: 'pet-puppy', name: 'Puppy', price: 70 },
  { id: 'pet-hamster', name: 'Hamster', price: 70 },
  { id: 'pet-panda', name: 'Panda', price: 110 },
  { id: 'pet-unicorn', name: 'Baby Unicorn', price: 180 },
];
export const petById = (id) => PETS.find((p) => p.id === id);

// light / base / shade / outline colours per species
const COL = {
  'pet-kitten': ['#ffdcae', '#ffb36b', '#e98a3c', '#b4622a'],
  'pet-bunny': ['#ffffff', '#f6f0fb', '#d9cbe8', '#9f8fb4'],
  'pet-chick': ['#fff7b8', '#ffe066', '#f2b51c', '#c08a10'],
  'pet-puppy': ['#f8e4c8', '#e8c39a', '#c9935c', '#93633c'],
  'pet-hamster': ['#ffe2ad', '#f2b257', '#d4882a', '#a5661c'],
  'pet-panda': ['#ffffff', '#f5f5f8', '#d6d6e0', '#6c6c7c'],
  'pet-unicorn': ['#ffffff', '#fdf5ff', '#e4d4f2', '#a596c4'],
};

let n = 0;

/** SVG for a pet. viewBox 0 0 100 100, standing on y≈94. */
export function petSVG(id, { size = 120, label = null } = {}) {
  const pet = petById(id);
  if (!pet) return '';
  const u = `pt${++n}`;
  const [lt, base, sh, ol] = COL[id];
  const L = `stroke="${ol}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const grad = (gid, a, b, c) => `<radialGradient id="${u}-${gid}" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  const defs = `<defs>${grad('b', lt, base, sh)}${grad('d', '#6a6a7a', '#2f2f3a', '#16161e')}${grad('p', '#ffe0ec', '#ffb3cf', '#f58fb5')}${grad('g', '#fff4b0', '#f6c637', '#d49a00')}${grad('o', '#ffd29a', '#ff9a3c', '#e07418')}${grad('br', '#d8a578', '#9b6a42', '#6e4626')}<linearGradient id="${u}-r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8fb4"/><stop offset=".33" stop-color="#ffd36e"/><stop offset=".66" stop-color="#8fd3ff"/><stop offset="1" stop-color="#c3a3ff"/></linearGradient></defs>`;
  const B = `url(#${u}-b)`;
  const dark = id === 'pet-panda' ? `url(#${u}-d)` : null;

  // Species parts ---------------------------------------------------------
  let ears = '', tail = '', extra = '', front = '', feetFill = B, noMouth = false;
  switch (id) {
    case 'pet-kitten':
      ears = `<path d="M28 34L30 10L48 24Z" fill="${B}" ${L}/><path d="M72 34L70 10L52 24Z" fill="${B}" ${L}/><path d="M32 28L33 16L42 24Z" fill="url(#${u}-p)"/><path d="M68 28L67 16L58 24Z" fill="url(#${u}-p)"/>`;
      tail = `<path d="M70 80C88 82 94 64 86 52" fill="none" stroke="${ol}" stroke-width="9" stroke-linecap="round"/><path d="M70 80C88 82 94 64 86 52" fill="none" stroke="${base}" stroke-width="5.5" stroke-linecap="round"/>`;
      // three neat tabby stripes on the forehead, plus a pale tummy
      extra = `<path d="M47 17.5L50 27L53 17.5Q50 16.6 47 17.5Z" fill="${sh}"/><path d="M39 19.5L44 27L45 18.2Q41.8 18.4 39 19.5Z" fill="${sh}"/><path d="M61 19.5L56 27L55 18.2Q58.2 18.4 61 19.5Z" fill="${sh}"/><ellipse cx="50" cy="78" rx="12" ry="9" fill="#fff6ea" opacity=".9"/>`;
      break;
    case 'pet-bunny':
      ears = `<g class="pet-ears"><ellipse cx="38" cy="14" rx="7.5" ry="20" fill="${B}" ${L} transform="rotate(-10 38 30)"/><ellipse cx="38" cy="16" rx="3.6" ry="13" fill="url(#${u}-p)" transform="rotate(-10 38 30)"/><ellipse cx="62" cy="14" rx="7.5" ry="20" fill="${B}" ${L} transform="rotate(10 62 30)"/><ellipse cx="62" cy="16" rx="3.6" ry="13" fill="url(#${u}-p)" transform="rotate(10 62 30)"/></g>`;
      tail = `<circle cx="74" cy="80" r="8" fill="${B}" ${L}/>`;
      break;
    case 'pet-chick':
      tail = `<path d="M70 70Q84 62 86 70Q84 78 72 80Z" fill="${B}" ${L}/>`;
      extra = `<path d="M46 20q2-10 6-2q4-8 4 4" fill="${B}" ${L}/><ellipse cx="28" cy="74" rx="6" ry="10" fill="${B}" ${L} transform="rotate(20 28 74)"/><ellipse cx="72" cy="74" rx="6" ry="10" fill="${B}" ${L} transform="rotate(-20 72 74)"/>`;
      // a little two-part beak (it IS the mouth, so no separate smile)
      front = `<path d="M44.5 51.5Q50 47.5 55.5 51.5Q50 54.2 44.5 51.5Z" fill="url(#${u}-o)" stroke="#c4600e" stroke-width="1.4" stroke-linejoin="round"/><path d="M46.5 52.6Q50 57 53.5 52.6Q50 53.8 46.5 52.6Z" fill="#f08a2c" stroke="#c4600e" stroke-width="1.2" stroke-linejoin="round"/>`;
      feetFill = `url(#${u}-o)`;
      noMouth = true;
      break;
    case 'pet-puppy':
      ears = `<path d="M28 28C14 30 14 56 24 62C30 56 30 40 34 32Z" fill="url(#${u}-br)" ${L}/><path d="M72 28C86 30 86 56 76 62C70 56 70 40 66 32Z" fill="url(#${u}-br)" ${L}/>`;
      tail = `<path d="M72 76C84 74 86 64 82 58" fill="none" stroke="${ol}" stroke-width="8" stroke-linecap="round"/><path d="M72 76C84 74 86 64 82 58" fill="none" stroke="${base}" stroke-width="4.6" stroke-linecap="round"/>`;
      extra = `<ellipse cx="60" cy="40" rx="7" ry="6" fill="url(#${u}-br)" opacity=".8"/>`;
      front = `<ellipse cx="50" cy="52" rx="3.4" ry="2.4" fill="#3a2a2a"/>`;
      break;
    case 'pet-hamster':
      ears = `<circle cx="30" cy="24" r="7" fill="${B}" ${L}/><circle cx="30" cy="24" r="3.4" fill="url(#${u}-p)"/><circle cx="70" cy="24" r="7" fill="${B}" ${L}/><circle cx="70" cy="24" r="3.4" fill="url(#${u}-p)"/>`;
      extra = `<ellipse cx="50" cy="56" rx="17" ry="10" fill="#fff6e6"/><ellipse cx="50" cy="80" rx="14" ry="10" fill="#fff6e6"/>`;
      break;
    case 'pet-panda':
      ears = `<circle cx="28" cy="24" r="9" fill="${dark}" stroke="#16161e" stroke-width="2"/><circle cx="72" cy="24" r="9" fill="${dark}" stroke="#16161e" stroke-width="2"/>`;
      extra = `<ellipse cx="40" cy="46" rx="8" ry="9.5" fill="${dark}" transform="rotate(20 40 46)"/><ellipse cx="60" cy="46" rx="8" ry="9.5" fill="${dark}" transform="rotate(-20 60 46)"/><ellipse cx="30" cy="76" rx="7" ry="11" fill="${dark}" transform="rotate(20 30 76)"/><ellipse cx="70" cy="76" rx="7" ry="11" fill="${dark}" transform="rotate(-20 70 76)"/>`;
      front = `<ellipse cx="50" cy="53" rx="3" ry="2.2" fill="#22222c"/>`;
      feetFill = dark;
      break;
    case 'pet-unicorn':
      // mane: soft rainbow curls flowing down behind the head on one side
      const mane = [[62, 18, '#ffb3cf'], [71, 24, '#ffd98a'], [77, 33, '#a8e6a0'], [80, 43, '#9ad4ff'], [80, 53, '#c8b0ff'], [77, 62, '#ffb3cf']];
      ears = mane.map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${c}" stroke="${ol}" stroke-width="2.2"/>`).join('') + `<path d="M30 30L32 14L44 24Z" fill="${B}" ${L}/>`;
      tail = `<path d="M70 78C90 80 92 62 84 54C88 66 80 72 70 70Z" fill="url(#${u}-r)" ${L}/>`;
      // forelock tuft in front, then the golden horn
      extra = `<circle cx="45" cy="21.5" r="5.5" fill="#ffb3cf" stroke="${ol}" stroke-width="2"/><circle cx="53.5" cy="20" r="5.5" fill="#c8b0ff" stroke="${ol}" stroke-width="2"/><path d="M47 18L50 -1L55 17Z" fill="url(#${u}-g)" stroke="#b58300" stroke-width="1.6" stroke-linejoin="round"/><path d="M48.6 12l5-1.6M49.4 6.6l4-1.2" stroke="#b58300" stroke-width="1.2" stroke-linecap="round"/>`;
      break;
  }

  // Face: open eyes (blink with CSS) and closed eyes (sleeping).
  const eyeOpen = (x) => `<ellipse cx="${x}" cy="46" rx="4.6" ry="5.8" fill="#2a2230"/><circle cx="${x + 1.5}" cy="43.6" r="1.9" fill="#fff"/><circle cx="${x - 1.4}" cy="48.6" r=".9" fill="#fff"/>`;
  const eyesWhite = id === 'pet-panda';
  const face = `<g class="eyes-open">${eyeOpen(41)}${eyeOpen(59)}</g><g class="eyes-closed"><path d="M36 47q5 4 10 0M54 47q5 4 10 0" fill="none" stroke="${eyesWhite ? '#fff' : '#2a2230'}" stroke-width="2.2" stroke-linecap="round"/></g>${front}${noMouth ? '' : '<path d="M46 56q2 2.6 4 0q2 2.6 4 0" fill="none" stroke="#2a2230" stroke-width="1.8" stroke-linecap="round"/>'}<ellipse cx="32" cy="53" rx="5.2" ry="3.2" fill="#ff8fab" opacity=".55"/><ellipse cx="68" cy="53" rx="5.2" ry="3.2" fill="#ff8fab" opacity=".55"/>`;

  const zzz = `<g class="pet-zzz" fill="#7a6fb0" font-family="system-ui, sans-serif" font-weight="800"><text x="70" y="22" font-size="11">z</text><text x="78" y="12" font-size="8">z</text><text x="84" y="4" font-size="6">z</text></g>`;
  const ball = `<g class="pet-ball"><circle cx="92" cy="86" r="7.5" fill="url(#${u}-p)" stroke="#d76a99" stroke-width="1.8"/><path d="M85 86q7-5 15 0" fill="none" stroke="#fff" stroke-width="1.8"/></g>`;

  const body = `<g class="pet-flip"><g class="pet-bob">
    <g class="pet-tail">${tail}</g>
    <ellipse class="foot foot-l" cx="40" cy="90" rx="8" ry="4.6" fill="${feetFill}" ${L}/><ellipse class="foot foot-r" cx="60" cy="90" rx="8" ry="4.6" fill="${feetFill}" ${L}/>
    <ellipse cx="50" cy="74" rx="25" ry="18" fill="${B}" ${L}/>
    <g class="pet-head">${ears}<circle cx="50" cy="44" r="27" fill="${B}" ${L}/>${extra}${face}<ellipse cx="39" cy="30" rx="9" ry="5" fill="#fff" opacity=".5" transform="rotate(-24 39 30)"/></g>
  </g>${ball}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -6 108 106" width="${size}" height="${size}" class="pet-svg" role="img" aria-label="${label || pet.name}">${defs}<ellipse class="pet-shadow" cx="50" cy="95" rx="25" ry="3.6" fill="#2a1a3a" opacity=".18"/>${body}${zzz}</svg>`;
}
