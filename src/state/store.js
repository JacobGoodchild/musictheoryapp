// The single live copy of the save, with change notifications.
import { loadSave, writeSave } from './save.js';

let state = null;
const listeners = new Set();
let timer = null;

export function getState() {
  if (!state) state = loadSave();
  return state;
}

export function setState(next) {
  state = next;
  persistSoon();
  for (const fn of listeners) fn(state);
}

/** Mutate the state inside fn, then save and notify. */
export function update(fn) {
  const s = getState();
  fn(s);
  persistSoon();
  for (const l of listeners) l(s);
  return s;
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function persistSoon() {
  clearTimeout(timer);
  timer = setTimeout(() => writeSave(state), 150);
}

export function flush() { clearTimeout(timer); writeSave(state); }

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);
}
