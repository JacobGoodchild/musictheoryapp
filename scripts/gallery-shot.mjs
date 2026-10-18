// Dev helper: open the stave gallery, print problems, and screenshot it in batches.
// Usage: node scripts/gallery-shot.mjs [outDir] [group] [batchSize]
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const out = process.argv[2] || 'screenshots/gallery';
const group = process.argv[3] || '';
const batch = Number(process.argv[4] || 24);
const noShots = process.argv.includes('--no-shots');
fs.mkdirSync(out, { recursive: true });
const srv = spawn('node', ['scripts/serve.mjs', '4199'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 400));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
try {
  for (let from = 0; ; from += batch) {
    await page.goto(`http://localhost:4199/dev/gallery.html?group=${group}&from=${from}&to=${from + batch}`);
    await page.waitForFunction(() => window.galleryResults, null, { timeout: 120000 });
    const res = await page.evaluate(() => window.galleryResults);
    if (!res.length) break;
    for (const r of res) if (r.problems.length) console.log(r.group, r.id, '→', r.problems.join(' | '));
    if (!noShots) await page.screenshot({ path: `${out}/batch-${String(from).padStart(4, '0')}.png`, fullPage: true, timeout: 120000 });
    console.log(`batch ${from}: ${res.length} staves`);
    if (res.length < batch) break;
  }
} finally {
  await browser.close();
  srv.kill();
}
