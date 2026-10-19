// Sticker frame for the kawaii food art in ./food.js: a white die-cut edge
// (traced from the drawing's own outline), a soft shadow, a rarity-coloured
// glow for the rarer stickers, and a padlocked silhouette when not collected.
import { rarityById } from '../state/stickers.js';
import { FOOD, GRADIENTS } from './food.js';

let count = 0;

export function stickerSVG(s, { locked = false, size = 120 } = {}) {
  // Ids must be unique per drawing (many stickers share a page).
  const uid = `st${++count}`;
  const rar = rarityById(s.rarity);
  // Drawn at 82% so the white die-cut edge and glow never run off the sticker.
  const art = `<g transform="translate(60 60) scale(.82) translate(-60 -60)">${(FOOD[s.art] || FOOD.cookie)().replace(/§/g, uid)}</g>`;
  const defs = Object.values(GRADIENTS).join('').replace(/§/g, uid);
  const special = ['legendary', 'mythic'].includes(s.rarity);
  const filters = `
    <filter id="${uid}-cut" x="-25%" y="-25%" width="150%" height="150%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="fat"/>
      <feFlood flood-color="#fff"/><feComposite in2="fat" operator="in" result="edge"/>
      <feMorphology in="SourceAlpha" operator="dilate" radius="5.5" result="fat2"/>
      <feGaussianBlur in="fat2" stdDeviation="2.2" result="blur"/><feOffset in="blur" dy="2.5" result="sh"/>
      <feFlood flood-color="${special ? rar.colour : '#3a2a40'}" flood-opacity="${special ? 0.55 : 0.22}"/><feComposite in2="sh" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${uid}-ghost" x="-25%" y="-25%" width="150%" height="150%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="fat"/>
      <feFlood flood-color="#9a94b0" flood-opacity=".35"/><feComposite in2="fat" operator="in"/>
    </filter>`;
  const body = locked
    ? `<g filter="url(#${uid}-ghost)">${art}</g>
       <g transform="translate(60 62)"><rect x="-15" y="-4" width="30" height="23" rx="6" fill="#ffffffcc" stroke="#8a84a0" stroke-width="2.5"/><path d="M-8-4v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#8a84a0" stroke-width="3"/><circle cy="7" r="3" fill="#8a84a0"/></g>`
    : `<g filter="url(#${uid}-cut)">${art}</g>${special ? `<g fill="${rar.colour}" opacity=".9"><path d="M14 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M106 16l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/></g>` : ''}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${locked ? 'Locked sticker' : `${s.name} sticker (${rar.name})`}"><defs>${defs}${filters}</defs>${body}</svg>`;
}
