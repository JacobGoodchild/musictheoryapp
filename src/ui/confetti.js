// Lightweight confetti burst (canvas, no libraries). Respects reduced motion.
export function confetti({ count = 140, duration = 2600 } = {}) {
  if (document.documentElement.dataset.reducedMotion === 'true' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.reducedMotion !== 'false') return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  c.width = innerWidth; c.height = innerHeight;
  Object.assign(c.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 95 });
  document.body.append(c);
  const ctx = c.getContext('2d');
  const colours = ['#6e6af0', '#b44fd8', '#f5c542', '#3aa76d', '#e85d75', '#2f8fd8'];
  const parts = Array.from({ length: count }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4,
    rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, col: colours[Math.floor(Math.random() * colours.length)],
  }));
  const start = performance.now();
  (function frame(t) {
    const el = t - start;
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of parts) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, 1 - el / duration);
      ctx.fillStyle = p.col; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
    }
    if (el < duration) requestAnimationFrame(frame); else c.remove();
  })(start);
}
