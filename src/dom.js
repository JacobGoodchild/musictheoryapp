// Small DOM helpers. Text is always set with textContent, never innerHTML.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, ...children) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    el.setAttribute(k, String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Parse a trusted, app-authored SVG string (never user data) into a node. */
export function svgFromString(str) {
  const doc = new DOMParser().parseFromString(str, 'image/svg+xml');
  return document.importNode(doc.documentElement, true);
}

export function clear(el) { while (el.firstChild) el.firstChild.remove(); return el; }

export function toast(message, { icon = null, timeout = 2600 } = {}) {
  const host = document.getElementById('toasts');
  if (!host) return;
  const t = h('div', { class: 'toast', role: 'status' }, icon, message);
  host.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, timeout);
}

export function modal(contentFn, { label = 'Dialog' } = {}) {
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const close = (val) => { back.remove(); document.removeEventListener('keydown', onKey); prev?.focus?.(); resolve(val); };
    const box = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': label });
    const back = h('div', { class: 'modal-backdrop', onclick: (e) => { if (e.target === back) close(null); } }, box);
    const onKey = (e) => { if (e.key === 'Escape') close(null); };
    document.addEventListener('keydown', onKey);
    append(box, [contentFn(close)]);
    document.body.append(back);
    (box.querySelector('[autofocus]') || box.querySelector('button, input, select, a'))?.focus();
  });
}

export function confirmDialog(title, text, { ok = 'Yes', cancel = 'Cancel', danger = false } = {}) {
  return modal((close) => h('div', { class: 'stack' },
    h('h2', {}, title),
    h('p', { class: 'muted' }, text),
    h('div', { class: 'row', style: { justifyContent: 'flex-end' } },
      h('button', { class: 'btn', onclick: () => close(false) }, cancel),
      h('button', { class: `btn ${danger ? 'danger' : 'primary'}`, onclick: () => close(true), autofocus: true }, ok)),
  ), { label: title });
}

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
