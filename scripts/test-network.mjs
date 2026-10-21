// Privacy test. Records every request while the page reads the screen, a card is matched, results are copied
// and the match is removed. Fails if any request goes to another host, has a body, or happens after the page has
// loaded (the tool itself must never call the network).
// Run after a build: npm run test:browser
import assert from 'node:assert/strict';
import { serve, launch, entry } from './e2e-lib.mjs';

const srv = await serve();
const browser = await launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 }, screen: { width: 1440, height: 900 }, deviceScaleFactor: 2,
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
const seen = [];
let phase = 'load';
ctx.on('request', (r) => seen.push({ url: r.url(), body: r.postData() || '', phase }));
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(srv.url + entry, { waitUntil: 'networkidle' });
await page.waitForSelector('#tool[data-ready="true"]');
phase = 'use';
await page.click('.result [data-cal-open]');
await page.focus('#obj-h');
for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
await page.click('#fit');
await page.click('#copy');
await page.click('.result [data-cal-open]');
await page.click('#reset');
await page.setViewportSize({ width: 1000, height: 700 });
await page.waitForTimeout(500);

const allowed = new Set([new URL(srv.url).host]);
const problems = [];
for (const r of seen) {
  const host = new URL(r.url).host;
  if (!allowed.has(host) && !r.url.startsWith('data:') && !r.url.startsWith('blob:')) problems.push(`host not allowed: ${r.url}`);
  if (r.body) problems.push(`request has a body: ${r.url}`);
  if (r.phase === 'use') problems.push(`request while using the tool: ${r.url}`);
}
await browser.close();
await srv.close();
assert.deepEqual(problems, [], problems.join('\n'));
assert.deepEqual(errors, [], 'console errors: ' + errors.join(' | '));
console.log(`network test: ${seen.length} requests, all while loading, all to ${[...allowed].join(', ')}, none while measuring`);
