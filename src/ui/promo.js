// "Have a promo code?" box, used on the Rewards and Settings pages.
import { h, toast } from '../dom.js';
import { update } from '../state/store.js';
import { redeemPromo } from '../state/promos.js';
import { sfx } from '../audio/synth.js';
import { confetti } from './confetti.js';

export function promoBox() {
  const input = h('input', { type: 'text', class: 'promo-input', maxlength: 24, autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Promo code', placeholder: 'Enter code' });
  const msg = h('p', { class: 'small promo-msg', 'aria-live': 'polite' });
  const form = h('form', { class: 'row promo-form', onsubmit: (e) => {
    e.preventDefault();
    let res;
    update((s) => { res = redeemPromo(s, input.value); });
    msg.textContent = res.message;
    msg.className = `small promo-msg ${res.ok ? 'good' : 'bad'}`;
    if (res.ok) {
      input.value = ''; sfx('reveal'); confetti(); toast(res.message);
      // Redraw the page so buttons that needed more coins come alive.
      setTimeout(() => window.dispatchEvent(new HashChangeEvent('hashchange')), 900);
    }
  } }, input, h('button', { class: 'btn primary', type: 'submit', 'data-action': 'redeem' }, 'Redeem'));
  return h('div', { class: 'card promo-card' }, h('h3', {}, 'Have a promo code?'), form, msg);
}
