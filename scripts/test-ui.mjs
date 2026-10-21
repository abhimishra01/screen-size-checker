// Page test on a real build: shared calibration, the card match, reset, copy, phone layout.
// Run after a build: npm run test:browser
import assert from 'node:assert/strict';
import { serve, launch, entry } from './e2e-lib.mjs';

const KEY = 'bm.calibration.v1';
const srv = await serve();
const browser = await launch();
const errors = [];
let checks = 0;
const ok = (cond, msg) => { checks++; assert.ok(cond, msg); };

async function open(opts, seed) {
  const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], ...opts });
  if (seed !== undefined) await ctx.addInitScript(([k, v]) => { try { if (localStorage.getItem(k) === null) localStorage.setItem(k, v); } catch {} }, [KEY, JSON.stringify(seed)]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(srv.url + entry);
  await page.waitForSelector('#tool[data-ready="true"]');
  return { ctx, page };
}
const text = (page, sel) => page.locator(sel).first().innerText();
const phone = { viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const laptop = { viewport: { width: 1440, height: 900 }, screen: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const profile = (method, devPxPerMm, extra = {}) => ({ method, devPxPerMm, cssPxPerMmAtCal: devPxPerMm / 3, dprAtCal: 3, screenW: 390, screenH: 844, ts: 1760000000000, objectName: 'credit card', ...extra });

// 1. A match saved by the online ruler (same key, same record) shows at once: iPhone 6.1 in, 460 PPI.
{
  const { ctx, page } = await open(phone, { v: 1, profiles: { '2530x1170': profile('card', 460 / 25.4, { verified: true }) }, active: '2530x1170', borrowed: {} });
  ok((await text(page, '#r-diag')) === '6.1 in', 'ruler record gives 6.1 in: ' + await text(page, '#r-diag'));
  ok((await text(page, '#f-ppi')) === '460 PPI', 'PPI 460: ' + await text(page, '#f-ppi'));
  ok((await text(page, '#f-res')) === '1170 × 2532', 'device pixels');
  ok((await page.getAttribute('[data-size="phone-6.1"]', 'data-yours')) === '1', 'table marks 6.1 in');
  ok((await text(page, '[data-size="phone-6.1"] .yours')) === 'Closest to yours', 'table label');
  ok((await text(page, '.result [data-cal-chip-text]')) === 'Measured', 'chip says Measured');
  ok(!(await page.locator('#cal').evaluate((d) => d.open)), 'no popup at first');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= 390, 'no horizontal scroll at 390: ' + sw);
  // Phone: the card stands on its short side and the panel stays on screen.
  await page.click('.result [data-cal-open]');
  ok(await page.locator('#rot-note').isVisible(), 'card turned on a phone');
  ok((await text(page, '#obj-l')) === 'Bank card: 53.98 mm', 'short side label');
  const box = await page.locator('.cal-panel').boundingBox();
  ok(box.y + box.height <= 844 && box.x >= 0, 'panel on screen');
  const fitBox = await page.locator('#fit').boundingBox();
  ok(fitBox && fitBox.y + fitBox.height <= 844, 'match button visible on phone');
  await page.keyboard.press('Escape');
  ok(!(await page.locator('#cal').evaluate((d) => d.open)), 'Escape closes');
  await ctx.close();
}

// 1b. Short phone windows (browser bars showing, small phones): "My card matches" stays in view without scrolling the panel.
for (const [w, h] of [[390, 664], [375, 667]]) {
  const { ctx, page } = await open({ ...phone, viewport: { width: w, height: h }, screen: { width: w, height: h + 150 } });
  await page.click('.result [data-cal-open]');
  const fit = await page.locator('#fit').boundingBox();
  ok(fit && fit.y >= 0 && fit.y + fit.height <= h, `match button in view at ${w}x${h}: ` + JSON.stringify(fit));
  await ctx.close();
}

// 1c. A touch tablet gets the bottom panel, so the card lies flat (more precise than its short side).
{
  const { ctx, page } = await open({ viewport: { width: 810, height: 1080 }, screen: { width: 810, height: 1080 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.click('.result [data-cal-open]');
  ok(!(await page.locator('#rot-note').isVisible()), 'card lies flat on a tablet');
  ok((await text(page, '#obj-l')) === 'Bank card: 85.6 mm', 'long side label on a tablet');
  await ctx.close();
}

// 2. A size typed in the ruler is not a measurement.
{
  const { ctx, page } = await open(phone, { v: 1, profiles: { '2530x1170': profile('diagonal', 18, { diagIn: 6.1, aspect: 2.16 }) }, active: '2530x1170', borrowed: {} });
  ok((await text(page, '#r-diag')) === 'Not measured yet', 'typed size is not shown as measured');
  ok((await text(page, '#f-ppi')) === 'Needs a card match', 'no PPI without a card');
  await ctx.close();
}

// 3. Laptop, nothing saved: pixel facts at once, then a card match by keyboard.
{
  const other = { method: 'card', devPxPerMm: 3.78, cssPxPerMmAtCal: 3.78, dprAtCal: 1, screenW: 1920, screenH: 1080, ts: 1 };
  const { ctx, page } = await open(laptop, { v: 1, profiles: { '1920x1080': other }, active: '1920x1080', borrowed: { '2560x1440': '1920x1080' } });
  ok((await text(page, '#r-diag')) === 'Not measured on this screen', 'other screen: ' + await text(page, '#r-diag'));
  ok((await text(page, '#f-res')) === '2880 × 1800', 'resolution');
  ok((await text(page, '#f-asp')) === '16:10', 'aspect');
  ok((await text(page, '#f-dpr')) === '2', 'dpr');
  await page.click('header [data-cal-open]');
  ok(await page.locator('#cal').evaluate((d) => d.open), 'header button opens the panel');
  ok(!(await page.locator('#rot-note').isVisible()), 'card lies flat on a laptop');
  await page.focus('#obj-h');
  for (let i = 0; i < 3; i++) await page.keyboard.press('Shift+ArrowRight');
  await page.click('[data-nudge="-0.1"]');
  const w = await page.locator('#obj').evaluate((el) => parseFloat(el.style.width));
  await page.click('#fit');
  ok(!(await page.locator('#cal').evaluate((d) => d.open)), 'panel closes after match');
  const dev = (w / 85.6) * 2;
  const want = (Math.hypot(2880, 1800) / dev / 25.4).toFixed(1);
  ok((await text(page, '#r-diag')) === `${want} in`, `diagonal ${want}: ` + await text(page, '#r-diag'));
  ok(/^\d+ PPI$/.test(await text(page, '#f-ppi')), 'PPI shown');
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
  ok(saved.v === 1 && saved.profiles['2880x1800'].method === 'card', 'saved in the shared record');
  ok(Math.abs(saved.profiles['2880x1800'].devPxPerMm - dev) / dev < 1e-3, 'saved density');
  ok(saved.profiles['1920x1080'] && saved.borrowed['2560x1440'] === '1920x1080', 'other screens kept');
  // Reload keeps it.
  await page.reload();
  await page.waitForSelector('#tool[data-ready="true"]');
  ok((await text(page, '#r-diag')) === `${want} in`, 'kept after reload');
  // Copy.
  await page.click('#copy');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  ok(clip.includes(`Screen size: ${want} in`) && clip.includes('2880 x 1800'), 'copy text: ' + clip);
  ok((await text(page, '#copy-msg')) === 'Copied.', 'copy message');
  // Reset this screen only.
  await page.click('.result [data-cal-open]');
  await page.click('#reset');
  ok((await text(page, '#r-diag')) === 'Not measured yet' || (await text(page, '#r-diag')) === 'Not measured on this screen', 'reset');
  const after = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
  ok(!after.profiles['2880x1800'] && after.profiles['1920x1080'], 'reset removes only this screen');
  const body = await page.evaluate(() => document.body.innerText);
  ok(!/NaN|undefined|Infinity/.test(body), 'no bad numbers on the page');
  await ctx.close();
}

// 4. Storage blocked: the page still works.
{
  const ctx = await browser.newContext(laptop);
  await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(srv.url + entry);
  await page.waitForSelector('#tool[data-ready="true"]');
  ok((await text(page, '#f-res')) === '2880 × 1800', 'works without storage');
  await page.click('.result [data-cal-open]');
  await page.click('#fit');
  ok(/ in$/.test(await text(page, '#r-diag')), 'match works without storage');
  await ctx.close();
}

await browser.close();
await srv.close();
assert.deepEqual(errors, [], 'console errors: ' + errors.join(' | '));
console.log(`ui test: ${checks} checks passed`);
