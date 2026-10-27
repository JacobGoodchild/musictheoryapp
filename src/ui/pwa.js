// Service worker registration and "update ready" banner.
import { h, clear } from '../dom.js';

// Only reload when the user pressed "Update now" (not on the very first install).
let updateRequested = false;

export function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    // Look for a new version every time the app opens, and every 30 minutes.
    reg.update().catch(() => {});
    setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
    const show = (worker) => {
      const banner = document.getElementById('update-banner');
      clear(banner);
      banner.append(h('span', {}, 'A new version is ready.'),
        h('button', { class: 'btn small primary', onclick: () => { updateRequested = true; worker.postMessage('skipWaiting'); } }, 'Update now'));
      banner.hidden = false;
    };
    if (reg.waiting && navigator.serviceWorker.controller) show(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) show(w);
      });
    });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // A new version took over: reload once to show it (not on the very first install).
    if (reloaded || (!updateRequested && !hadController)) return;
    reloaded = true;
    location.reload();
  });
}
