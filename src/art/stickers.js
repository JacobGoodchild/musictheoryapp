// Original sticker art: die-cut sticker with a music symbol (Bravura glyph,
// SIL Open Font Licence, bundled with VexFlow), colours by hue and rarity.
import { rarityById } from '../state/stickers.js';

const glyphText = (g) => [].concat(g).map((c) => String.fromCodePoint(c)).join('');

export function stickerSVG(s, { locked = false, size = 120 } = {}) {
  const id = `st-${s.id}`;
  const h = s.hue;
  const rar = rarityById(s.rarity);
  let fill;
  if (s.rainbow) fill = `<linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".25" stop-color="#ffd93d"/><stop offset=".5" stop-color="#6bcb77"/><stop offset=".75" stop-color="#4d96ff"/><stop offset="1" stop-color="#b45cff"/></linearGradient>`;
  else if (s.cosmic) fill = `<radialGradient id="${id}-g" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#7a5cff"/><stop offset=".6" stop-color="#241a5c"/><stop offset="1" stop-color="#0b0a24"/></radialGradient>`;
  else if (s.gold) fill = `<linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#f2c230"/><stop offset="1" stop-color="#c58a00"/></linearGradient>`;
  else fill = `<linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 85% 78%)"/><stop offset="1" stop-color="hsl(${(h + 30) % 360} 75% 58%)"/></linearGradient>`;
  const ink = s.cosmic ? '#fff' : `hsl(${h} 60% 18%)`;
  const glyph = glyphText(s.glyph);
  const fontSize = s.stack ? 34 : 54;
  const text = s.stack
    ? `<text x="60" y="58" text-anchor="middle" font-family="Bravura" font-size="${fontSize}" fill="${ink}">${String.fromCodePoint([].concat(s.glyph)[0])}</text><text x="60" y="84" text-anchor="middle" font-family="Bravura" font-size="${fontSize}" fill="${ink}">${String.fromCodePoint([].concat(s.glyph)[1])}</text>`
    : `<text x="60" y="74" text-anchor="middle" font-family="Bravura" font-size="${fontSize}" fill="${ink}">${glyph}</text>`;
  const face = s.face ? `<g transform="translate(86 34)"><circle r="12" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="-4.5" cy="-2" r="2.2" fill="${ink}"/><circle cx="4.5" cy="-2" r="2.2" fill="${ink}"/><path d="M-4 3.5q4 4 8 0" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/><circle cx="-8" cy="3" r="2" fill="#ff8fa3" opacity=".7"/><circle cx="8" cy="3" r="2" fill="#ff8fa3" opacity=".7"/></g>` : '';
  const sparkle = ['legendary', 'mythic'].includes(s.rarity) ? `<g fill="#fff" opacity=".9"><path d="M22 26l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M96 20l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z"/></g>` : '';
  const stars = s.cosmic ? '<g fill="#fff"><circle cx="30" cy="40" r="1.2"/><circle cx="88" cy="34" r="1"/><circle cx="40" cy="92" r="1.3"/><circle cx="92" cy="88" r="1"/><circle cx="70" cy="22" r="1.1"/></g>' : '';
  const body = locked
    ? `<path d="M60 8c22 0 40 6 46 22s4 40-4 56-22 26-42 26-34-10-42-26-10-40-4-56S38 8 60 8z" fill="var(--bg-2, #e9e9f2)" stroke="var(--border, #d6d6e4)" stroke-width="3"/>
       <text x="60" y="${s.stack ? 72 : 74}" text-anchor="middle" font-family="Bravura" font-size="${fontSize}" fill="var(--text-3, #999)" opacity=".35">${s.stack ? String.fromCodePoint([].concat(s.glyph)[0]) : glyph}</text>
       <g transform="translate(60 64)" opacity=".85"><rect x="-13" y="-4" width="26" height="20" rx="5" fill="var(--surface, #fff)" fill-opacity=".75" stroke="var(--text-3, #888)" stroke-width="2"/><path d="M-7-4v-5a7 7 0 0 1 14 0v5" fill="none" stroke="var(--text-3, #888)" stroke-width="2.5"/></g>`
    : `<path d="M60 8c22 0 40 6 46 22s4 40-4 56-22 26-42 26-34-10-42-26-10-40-4-56S38 8 60 8z" fill="#fff" stroke="${rar.colour}" stroke-width="3" filter="url(#${id}-sh)"/>
       <path d="M60 15c19 0 34 5 39 19s3 34-3 48-19 22-36 22-29-8-36-22-8-34-3-48S41 15 60 15z" fill="url(#${id}-g)"/>
       ${stars}${text}${face}${sparkle}
       <path d="M30 26q12-10 30-10" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55" fill="none"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${locked ? 'Locked sticker' : `${s.name} sticker (${rar.name})`}"><defs>${fill}<filter id="${id}-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".18"/></filter></defs>${body}</svg>`;
}
