import { renderMusic } from '../src/notation/render.js';
import { checkEngraving } from '../src/notation/check.js';
import { allStaves } from './catalog.js';

const q = new URLSearchParams(location.search);
const group = q.get('group');
const from = Number(q.get('from') || 0);
const to = Number(q.get('to') || 1e9);

(async () => {
  const items = (await allStaves()).filter((it) => !group || it.group === group).slice(from, to);
  // The gallery is long: skip drawing cards off screen in automated runs is not needed; draw all.
  const gal = document.getElementById('gal');
  const results = [];
  for (const it of items) {
    const card = document.createElement('div');
    card.className = 'card';
    const host = document.createElement('div');
    const pre = document.createElement('pre');
    pre.textContent = `[${it.group}] ${it.id}\n${it.describe}`;
    card.append(host, pre);
    gal.append(card);
    try {
      await renderMusic(host, it.spec);
      const probs = checkEngraving(host);
      if (probs.length) {
        card.classList.add('bad');
        const p = document.createElement('div'); p.className = 'probs'; p.textContent = probs.join('; ');
        card.append(p);
      }
      results.push({ id: it.id, group: it.group, problems: probs });
    } catch (e) {
      card.classList.add('bad');
      results.push({ id: it.id, group: it.group, problems: ['render error: ' + e.message] });
      pre.textContent += '\nERROR ' + e.message;
    }
  }
  document.getElementById('summary').textContent = `${results.length} staves, ${results.filter((r) => r.problems.length).length} with problems`;
  window.galleryResults = results;
})().catch((e) => { window.galleryResults = [{ id: 'gallery', problems: [String(e.stack || e)] }]; });
