import { createHouse } from '../src/game/house.js';
const q = new URLSearchParams(location.search);
const toys = (q.get('toys') || '').split(',').filter(Boolean);
const h = createHouse({ petId: q.get('pet') || 'pet-kitten', equipped: {}, toys, getNeeds: () => ({ hunger: 70, fun: 70, energy: 80 }) });
document.getElementById('out').append(h.el);
window.house = h;
