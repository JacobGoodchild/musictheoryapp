// Inline SVG icons (app-authored, trusted strings).
import { svgFromString } from '../dom.js';

const P = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  learn: '<path d="M4 5.5c2.5-1 5.5-1 8 .8 2.5-1.8 5.5-1.8 8-.8v13c-2.5-1-5.5-1-8 .8-2.5-1.8-5.5-1.8-8-.8z"/><path d="M12 6.3v13"/>',
  practice: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  mock: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5v2h6v-2"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4"/>',
  memorise: '<rect x="3.5" y="6" width="13" height="14" rx="2"/><path d="M7.5 6V4.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1h-3"/>',
  rewards: '<path d="M4 9h16v3H4z"/><path d="M5.5 12v8h13v-8"/><path d="M12 9v11"/><path d="M12 9c-1.5-3-6-4-6-1.5S9 9 12 9zM12 9c1.5-3 6-4 6-1.5S15 9 12 9z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>',
  check: '<path d="M5 12.5 10 17.5 19.5 7"/>',
  paw: '<ellipse cx="12" cy="16" rx="4.6" ry="3.8"/><circle cx="6.5" cy="10.5" r="1.9"/><circle cx="10" cy="7" r="1.9"/><circle cx="14" cy="7" r="1.9"/><circle cx="17.5" cy="10.5" r="1.9"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
  speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"/>',
  flame: '<path d="M12 3c1 4 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 0 2 1 3 2 3 0-3-1-5.5.5-8.5z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
  shuffle: '<path d="M3.5 7h3c4 0 6 10 10 10h4M3.5 17h3c1.7 0 3-1.8 4.2-4M16.5 7h4M13 9.5C14 8 15 7 16.5 7"/><path d="M18 4.5 20.5 7 18 9.5M18 14.5l2.5 2.5-2.5 2.5"/>',
  bag: '<path d="M6 8.5h12l-1 11.5H7z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
  trophy: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0z"/><path d="M8 6.5H5a3 3 0 0 0 3 4M16 6.5h3a3 3 0 0 1-3 4M12 13.5v3.5M8.5 20h7M10 17h4"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
  upload: '<path d="M12 15.5v-11M7 9l5-5 5 5M5 19.5h14"/>',
  ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.5"/><path d="M10 9.5a2 2 0 0 1 4 0"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  map: '<path d="M3.5 6.5 9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5-5.5 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  print: '<path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8" rx="2"/><path d="M7 13.5h10v7H7z"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
};

export function icon(name, cls = 'nav-icon') {
  const body = P[name] || P.star;
  return svgFromString(`<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`);
}

export function coinIcon(cls = 'coin-icon') {
  return svgFromString(`<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#f5c542"/><circle cx="12" cy="12" r="7.5" fill="#f9d870" stroke="#d9a400" stroke-width="1.2"/><path d="M10.2 15.8c-.9 0-1.6-.6-1.6-1.3 0-.9 1-1.6 2.1-1.4.3.1.5.1.7.2V7.5l3.4 1v1.4l-2.2-.6v5c0 1-1.1 1.5-2.4 1.5z" fill="#b07d00"/></svg>`);
}

export function noteIcon(cls = 'coin-icon') {
  return svgFromString(`<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#b9a6ff"/><path d="M9.5 17c-1.2 0-2-.7-2-1.5 0-1.1 1.3-1.9 2.6-1.6.3 0 .5.1.7.2V6.5l5.7-1.5v2.2l-3.9 1v7.4c0 1.3-1.4 2.4-3.1 2.4z" fill="#4b3ab0"/></svg>`);
}
