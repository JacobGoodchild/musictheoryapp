// Renders assets/icon.svg to PNG icons for the web app manifest.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const svg = fs.readFileSync('assets/icon.svg', 'utf8');
const b = await chromium.launch();
for (const size of [192, 512]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await p.screenshot({ path: `assets/icon-${size}.png`, omitBackground: true });
}
await b.close();
