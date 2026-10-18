// Dev helper: screenshot app screens. Usage:
// node scripts/shots.mjs outDir "#/home,#/practice" [WxH] [light|dark] [--click=selector]
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const out = process.argv[2] || 'screenshots/app';
const routes = (process.argv[3] || '#/home').split(',');
const [w, hgt] = (process.argv[4] || '1366x768').split('x').map(Number);
const theme = process.argv[5] || 'light';
const full = process.argv.includes('--full');
const clickArg = process.argv.find((a) => a.startsWith('--click='));
fs.mkdirSync(out, { recursive: true });
const port = 4300 + Math.floor(Math.random() * 500);
const srv = spawn('node', ['scripts/serve.mjs', String(port)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 400));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, colorScheme: theme });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await page.addInitScript((th) => {
  if (!localStorage.getItem('g5theory.save')) localStorage.setItem('g5theory.save', JSON.stringify({ version: 3, profile: { name: 'Alex' }, coins: 340, settings: { theme: th } }));
}, theme);
try {
  for (const r of routes) {
    await page.goto(`http://localhost:${port}/index.html${r}`);
    await page.waitForTimeout(1200);
    if (clickArg) { for (const sel of clickArg.slice(8).split('|')) { await page.click(sel).catch(() => {}); await page.waitForTimeout(500); } }
    const name = r.replace(/[^a-z0-9]+/gi, '_') || 'root';
    await page.screenshot({ path: `${out}/${name}-${w}x${hgt}-${theme}.png`, fullPage: full });
    console.log('shot', name);
  }
} finally { await browser.close(); srv.kill(); }
