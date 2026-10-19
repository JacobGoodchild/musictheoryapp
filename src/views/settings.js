import { h, toast, confirmDialog } from '../dom.js';
import { getState, update, setState, flush } from '../state/store.js';
import { exportSave, importSave, freshSave, cleanName } from '../state/save.js';
import { applyTheme } from '../ui/theme.js';
import { setAudioSettings, sfx } from '../audio/synth.js';
import { icon } from '../ui/icons.js';
import { APP_VERSION } from '../version.js';

export default async function settings() {
  const s = getState();
  const nameInput = h('input', { type: 'text', id: 'set-name', maxlength: 24, value: s.profile.name, 'aria-label': 'Profile name' });
  const row = (label, control, help) => h('div', { class: 'set-row' }, h('div', {}, h('div', { class: 'set-label' }, label), help ? h('div', { class: 'small muted' }, help) : null), control);
  const select = (id, value, opts, onchange) => {
    const el = h('select', { id }, opts.map(([v, t]) => h('option', { value: v, selected: v === value }, t)));
    el.addEventListener('change', () => onchange(el.value));
    return el;
  };
  const volume = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: s.settings.volume, id: 'set-volume', 'aria-label': 'Volume' });
  volume.addEventListener('change', () => { update((x) => { x.settings.volume = Number(volume.value); }); setAudioSettings(getState().settings); sfx('correct'); });
  const sound = h('input', { type: 'checkbox', id: 'set-sound', checked: s.settings.sound });
  sound.addEventListener('change', () => { update((x) => { x.settings.sound = sound.checked; }); setAudioSettings(getState().settings); });
  const fileInput = h('input', { type: 'file', accept: '.json,application/json', id: 'import-file', class: 'sr-only' });
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files[0];
    if (!f) return;
    try {
      const data = importSave(await f.text());
      const ok = await confirmDialog('Load this save?', `This replaces your current progress with the save for "${data.profile.name || 'no name'}" (${data.coins} coins).`, { ok: 'Load save', danger: true });
      if (!ok) return;
      setState(data); flush(); applyTheme(data.settings);
      toast('Save loaded');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (e) {
      toast(`Could not load that file: ${e.message}`);
    } finally { fileInput.value = ''; }
  });
  return h('div', { class: 'settings' },
    h('div', { class: 'page-head' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Settings'), h('h1', {}, 'Settings'))),
    h('div', { class: 'card stack' },
      h('h2', {}, 'Profile'),
      row('Name', h('form', { class: 'row', onsubmit: (e) => { e.preventDefault(); const n = cleanName(nameInput.value); if (!n) return; update((x) => { x.profile.name = n; }); toast('Name saved'); } }, nameInput, h('button', { class: 'btn', type: 'submit' }, 'Save')), 'Stored only on this computer.')),
    h('div', { class: 'card stack' },
      h('h2', {}, 'Practice'),
      row('Question level', select('set-level', s.settings.level || 'beginner', [['beginner', 'Beginner (easiest)'], ['standard', 'Standard'], ['exam', 'Exam (full mix)']], (v) => { update((x) => { x.settings.level = v; }); toast('Level saved'); }), 'Beginner gives the easiest questions. Mock exams always use the real exam mix. Hints are always there if you get stuck.')),
    h('div', { class: 'card stack' },
      h('h2', {}, 'Look and sound'),
      row('Theme', select('set-theme', s.settings.theme, [['system', 'Match my computer'], ['light', 'Light'], ['dark', 'Dark']], (v) => { update((x) => { x.settings.theme = v; }); applyTheme(getState().settings); })),
      row('Reduce motion', select('set-motion', s.settings.reducedMotion, [['system', 'Match my computer'], ['true', 'On'], ['false', 'Off']], (v) => { update((x) => { x.settings.reducedMotion = v; }); applyTheme(getState().settings); }), 'Turns off animations such as bag opening and confetti.'),
      row('Sound', h('label', { class: 'switch' }, sound, h('span', {}, 'On'))),
      row('Volume', volume)),
    h('div', { class: 'card stack' },
      h('h2', {}, 'Your save'),
      h('p', { class: 'muted small' }, 'Progress is saved in this browser automatically. Download a copy now and then, so clearing the browser never loses your work.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', id: 'export-btn', onclick: () => download() }, icon('download', 'coin-icon'), 'Download save file'),
        h('label', { class: 'btn', for: 'import-file', tabindex: 0, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } } }, icon('upload', 'coin-icon'), 'Load save file'), fileInput),
      h('hr'),
      h('div', { class: 'row between' }, h('div', {}, h('div', { class: 'set-label' }, 'Reset all progress'), h('div', { class: 'small muted' }, 'Deletes coins, stickers, lessons, mocks and settings on this computer.')),
        h('button', { class: 'btn danger', id: 'reset-btn', onclick: () => reset() }, 'Reset…'))),
    h('div', { class: 'card stack' },
      h('h2', {}, 'About'),
      h('p', { class: 'small' }, `Grade 5 Theory · version ${APP_VERSION}. Works offline once loaded; you can install it from Chrome's address bar.`),
      h('p', { class: 'small muted' }, 'Music engraving by VexFlow (MIT) with the Bravura font (SIL Open Font Licence). All questions, lessons and music examples are original. Not affiliated with ABRSM.'),
      h('a', { href: '#/exam-day' }, 'Exam-day guide')));
}

function download() {
  const blob = new Blob([exportSave(getState())], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const d = new Date();
  a.download = `grade5-theory-save-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Save file downloaded');
}

async function reset() {
  const ok = await confirmDialog('Reset everything?', 'This cannot be undone. Download a save file first if you might want it back.', { ok: 'Yes, reset', danger: true });
  if (!ok) return;
  const ok2 = await confirmDialog('Are you sure?', 'All progress, coins and stickers will be deleted.', { ok: 'Delete everything', danger: true });
  if (!ok2) return;
  setState(freshSave()); flush();
  location.hash = '#/home';
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
