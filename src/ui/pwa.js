// Service worker registration and "update ready" banner.
import { h, clear } from '../dom.js';

// Only reload when the user pressed "Update now" (not on the very first install).
let updateRequested = false;

export function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
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
    if (reloaded || !updateRequested) return;
    reloaded = true;
    location.reload();
  });
}
