// A pet that lives inside a frame (the avatar picture, or the pet room): it
// wanders about, sits and blinks, plays with its ball, and sometimes naps.
// The moods are CSS classes; this file only decides what to do next.
import { petSVG } from '../art/pets.js';
import { svgFromString } from '../dom.js';

const reduced = () => document.documentElement.dataset.reducedMotion === 'true'
  || (document.documentElement.dataset.reducedMotion !== 'false' && matchMedia('(prefers-reduced-motion: reduce)').matches);

/**
 * A pet stage to place over a position:relative frame.
 * opts.size: pet width as a fraction of the frame (0..1); opts.mood: force a mood (tests/screens).
 */
export function petStage(petId, { size = 0.42, mood = null } = {}) {
  const stage = document.createElement('div');
  stage.className = 'pet-stage';
  stage.setAttribute('aria-hidden', 'true');
  if (!petId) return stage;
  const pet = document.createElement('div');
  pet.className = 'pet';
  pet.style.width = `${size * 100}%`;
  pet.append(svgFromString(petSVG(petId, { size: 100 })));
  stage.append(pet);

  let x = 60 + Math.random() * 20; // percent from the left of the frame (pet centre)
  const place = (secs = 0) => { pet.style.setProperty('--walk', `${secs}s`); pet.style.left = `${x}%`; };
  place();
  const setMood = (m) => { pet.classList.remove('walking', 'sleeping', 'playing', 'idle'); pet.classList.add(m); };
  if (mood || reduced()) { setMood(mood || 'idle'); return stage; }

  const min = size * 50 + 2, max = 100 - size * 50 - 2;
  let timer = null;
  const next = () => {
    if (!stage.isConnected) { if (stage.__seen) return; timer = setTimeout(next, 500); return; } // wait until shown; stop once removed
    stage.__seen = true;
    const r = Math.random();
    if (r < 0.45) {
      // Walk somewhere new, facing the way it goes.
      const to = min + Math.random() * (max - min);
      const secs = Math.max(1.2, Math.abs(to - x) / 14);
      pet.classList.toggle('face-left', to < x);
      x = to; setMood('walking'); place(secs);
      timer = setTimeout(next, secs * 1000 + 100);
    } else if (r < 0.65) { setMood('idle'); timer = setTimeout(next, 2500 + Math.random() * 2500); }
    else if (r < 0.85) { setMood('playing'); timer = setTimeout(next, 3500 + Math.random() * 2000); }
    else { setMood('sleeping'); timer = setTimeout(next, 6000 + Math.random() * 4000); }
  };
  setMood('idle');
  timer = setTimeout(next, 900);
  stage.__stop = () => clearTimeout(timer);
  return stage;
}
