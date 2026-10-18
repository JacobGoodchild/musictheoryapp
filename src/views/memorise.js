import { h } from '../dom.js';
export default async function view() {
  return h('div', { class: 'card' }, h('h1', {}, 'Coming soon'), h('p', { class: 'muted' }, 'This part of the app is being built.'));
}
