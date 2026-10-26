import { SPECIES, createPet } from '../src/game/pet-rig.js';
const NS = 'http://www.w3.org/2000/svg';
const poses = [
  { view: 'move', theta: 0, phase: 0, stride: 1 },
  { view: 'move', theta: 0, phase: 1.6, stride: 1 },
  { view: 'move', theta: 0.9, phase: 0.8, stride: 1 },
  { view: 'move', theta: 1.4, phase: 0.8, stride: 1 },
  { view: 'move', theta: Math.PI, phase: 0.5, stride: 1 },
  { view: 'sit' },
  { view: 'sit', lick: 1, eyes: 'closed', mouth: 'tongue' },
  { view: 'sit', eyes: 'happy', mouth: 'open', headDy: 14 },
  { view: 'sleep', theta: 0 },
];
const out = document.getElementById('out');
const size = Number(new URLSearchParams(location.search).get('s') || 130);
for (const id of Object.keys(SPECIES)) {
  const row = document.createElement('div'); row.className = 'row';
  const b = document.createElement('b'); b.textContent = id.slice(4); row.append(b);
  for (const p of poses) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '-75 -125 150 130'); s.setAttribute('width', size); s.setAttribute('height', size * 130 / 150);
    const r = createPet(id); r.pose(p); s.append(r.el); row.append(s);
  }
  out.append(row);
}
import { createGirl } from '../src/game/girl-rig.js';
const outfits = ['tee-pink', 'strawberry-dress', 'dungarees', 'star-cape'];
const gp = [{ pose: 'stand' }, { pose: 'walk', phase: 0.8 }, { pose: 'walk', phase: 2.4 }, { pose: 'sit' }, { pose: 'crouch', dir: 1 }, { pose: 'wave', phase: 1 }, { pose: 'throw', t: 0.2, dir: 1 }, { pose: 'hold', dir: -1 }, { pose: 'push', phase: 1 }];
for (const of of outfits) {
  const row = document.createElement('div'); row.className = 'row';
  for (const p of gp) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '-80 -240 160 250'); s.setAttribute('width', size * 0.8); s.setAttribute('height', size * 1.25);
    const r = createGirl({ outfit: of, hair: of === 'dungarees' ? 'hair-braids' : 'hair-long' }); r.pose(p); s.append(r.el); row.append(s);
  }
  out.append(row);
}
