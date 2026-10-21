// Known-answer tests for the screen maths and the shared calibration record. Run: npm test
import assert from 'node:assert/strict';
import { physicalSize, ppi, cssPxPerInch, aspect, closestSize, measureState, chipFor, report, summaryText, estimateAlts, fix, one } from '../src/lib/screen.js';
import { estimateScreen, sidesFromDiagonal, altText } from '../src/lib/estimate.js';
import {
  CARD, STORE_KEY, devPxPerMmFromObject, panelFromDiagonal, screenSignature, parseStore, pickProfile, withProfile, emptyStore, loadStore, saveStore,
} from '../src/lib/calibration.js';
import { ALL_SIZES, SIZE_GROUPS } from '../src/lib/sizes.js';

let n = 0;
const near = (a, b, tol, msg) => { n++; assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, want ${b} +/- ${tol}`); };
const eq = (a, b, msg) => { n++; assert.deepEqual(a, b, msg); };
const perMm = (ppiValue) => ppiValue / 25.4; // device pixels per mm from a known panel density

// 1. Diagonal from device pixels and density (published panel specs).
// iPhone 12/13/14: 1170 x 2532 at 460 ppi. CSS 390 x 844 at DPR 3. Sold as 6.1 in.
let p = physicalSize(390, 844, 3, perMm(460));
near(p.diagIn, 6.06, 0.01, 'iPhone 6.1 diagonal');
eq(closestSize(p.diagIn).diag, 6.1, 'iPhone closest size');
// MacBook Air M1: 2560 x 1600 at 227 ppi, default CSS 1440 x 900 at DPR 2 renders 2880 x 1800 and scales down.
// Calibration is in rendered pixels, so use the rendered density 227 * 2880 / 2560.
p = physicalSize(1440, 900, 2, perMm(227 * 2880 / 2560));
near(p.diagIn, 13.30, 0.01, 'MacBook Air 13.3 diagonal');
// Native mode gives the same answer.
p = physicalSize(1280, 800, 2, perMm(227));
near(p.diagIn, 13.30, 0.01, 'MacBook Air native mode');

// 2. Pixel density.
near(ppi(1920, 1080, 15.6), 141.21, 0.01, '1080p 15.6 in PPI');
near(ppi(2560, 1440, 27), 108.79, 0.01, '1440p 27 in PPI');
near(ppi(3840, 2160, 27), 163.18, 0.01, '4K 27 in PPI');

// 3. Width and height from a diagonal (comparison table).
let s = panelFromDiagonal(27, 16 / 9);
near(s.longMm / 25.4, 23.53, 0.01, '27 in 16:9 width');
near(s.shortMm / 25.4, 13.24, 0.01, '27 in 16:9 height');
s = panelFromDiagonal(15.6, 16 / 9);
near(s.longMm / 25.4, 13.60, 0.01, '15.6 in width');
near(s.shortMm / 25.4, 7.65, 0.01, '15.6 in height');

// 4. Card match round trip: 85.6 mm shown as 323.5 CSS px at DPR 1 is the 96 dpi reference screen.
const dev = devPxPerMmFromObject(CARD.w / 25.4 * 96, CARD.w, 1);
near(dev, 96 / 25.4, 1e-9, 'card gives 96 dpi');
near(cssPxPerInch(dev, 1), 96, 1e-9, '96 CSS px per inch');
near(devPxPerMmFromObject(323.5, 85.6, 2), 7.558, 0.001, 'card at DPR 2');
// A 1920 x 1080 screen at 96 dpi is 23.0 in.
near(physicalSize(1920, 1080, 1, dev).diagIn, 22.95, 0.01, '1080p at 96 dpi');

// 5. Zoom does not change the result: Chrome at 125% zoom shrinks screen.width and grows DPR by the same factor.
const z1 = physicalSize(1536, 864, 1.25, 5).diagIn;
const z2 = physicalSize(1536 / 1.2, 864 / 1.2, 1.25 * 1.2, 5).diagIn;
near(z1, z2, 1e-9, 'zoom invariance');

// 6. Screen signature (shared with the ruler): device pixels, long side first, same in both orientations.
eq(screenSignature(390, 844, 3), '2530x1170', 'phone signature');
eq(screenSignature(844, 390, 3), '2530x1170', 'phone signature, landscape');
eq(screenSignature(1440, 900, 2), '2880x1800', 'laptop signature');

// 7. Aspect ratios in words.
eq(aspect(1920, 1080).text, '16:9', '1080p');
eq(aspect(1440, 900).text, '16:10', '16:10');
eq(aspect(1280, 800).text, '16:10', '16:10 small');
eq(aspect(2560, 1664).text, '20:13 (1.54:1)', 'MacBook Air 13.6');
eq(aspect(390, 844).text, 'about 9:19.5 (1:2.16)', 'phone portrait');
eq(aspect(844, 390).text, 'about 19.5:9 (2.16:1)', 'phone landscape');
eq(aspect(1366, 768).text, 'about 16:9 (1.78:1)', '1366 x 768');
eq(aspect(3440, 1440).text, 'about 21:9 (2.39:1)', 'ultrawide');
eq(aspect(1024, 768).text, '4:3', '4:3');
eq(aspect(1280, 1024).text, '5:4', '5:4');
eq(aspect(0, 768).text, '', 'zero width');
// The table's shape label is the short form, so the table and a measured screen use the same words.
eq(aspect(2560, 1664).short, '1.54:1', 'short label, unnamed ratio');
eq(aspect(2532, 1170).short, 'about 19.5:9', 'short label, near a named ratio');
eq(aspect(1920, 1080).short, '16:9', 'short label, named ratio');

// 8. Formatting.
eq(fix(13.30, 2), '13.3', 'fix trims');
eq(fix(13, 2), '13', 'fix whole');
eq(one(13), '13.0', 'one keeps a decimal');
eq(one(NaN), '', 'one NaN');

// 9. Closest common size.
eq(closestSize(23.8).diag, 23.8, '24 in monitor');
eq(closestSize(15.55).diag, 15.6, '15.6 laptop measured a bit small');
eq(closestSize(40), null, 'nothing near 40 in');
eq(closestSize(24.45).diag, 24.5, '25 in gaming monitor');
eq(closestSize(5.85).diag, 5.8, '5.8 in phone');
eq(closestSize(10.2).diag, 10.2, '10.2 in tablet');
eq(closestSize(14.2).diag, 14.2, '14 in pro laptop');
eq(closestSize(NaN), null, 'NaN');
eq(new Set(ALL_SIZES.map((x) => x.id)).size, ALL_SIZES.length, 'size ids unique');
for (const g of SIZE_GROUPS) for (const r of g.rows) assert.ok(r.ratio >= 1 && r.diag > 0 && r.px[0] >= r.px[1], 'size rows sane');

// 10. The shared record: what this tool may call "measured".
const sig = '2880x1800';
const card = { method: 'card', devPxPerMm: 8.9, cssPxPerMmAtCal: 4.45, dprAtCal: 2, screenW: 1440, screenH: 900, ts: 1, objectName: 'credit card' };
let store = withProfile(emptyStore(), sig, card);
eq(measureState(pickProfile(store, sig)).kind, 'measured', 'card on this screen');
eq(measureState(pickProfile(store, '1920x1080')).kind, 'other', 'card on another screen');
eq(measureState(pickProfile(emptyStore(), sig)).kind, 'none', 'nothing saved');
eq(measureState(pickProfile(withProfile(emptyStore(), sig, { ...card, method: 'diagonal' }), sig)).kind, 'typed', 'typed size');
eq(measureState(pickProfile(withProfile(emptyStore(), sig, { ...card, method: 'device' }), sig)).kind, 'typed', 'device pick');
eq(measureState(pickProfile(withProfile(emptyStore(), sig, { ...card, method: 'coin' }), sig)).kind, 'measured', 'coin');
const borrowedStore = parseStore(JSON.stringify({ v: 1, profiles: { [sig]: card }, active: sig, borrowed: { '1920x1080': sig } }));
eq(measureState(pickProfile(borrowedStore, '1920x1080')).kind, 'other', 'borrowed is not measured here');
eq(chipFor('measured', card).short, 'Measured', 'chip measured');
eq(chipFor('none').short, 'Estimated', 'chip none says Estimated');
eq(chipFor('other').short, 'Estimated', 'chip other screen says Estimated');
eq(chipFor('typed').kind, 'estimate', 'typed size is only an estimate');

// 11. A record written by the ruler survives a save from this tool: other screens and borrowed entries stay.
const rulerText = JSON.stringify({ v: 1, profiles: { '1920x1080': { ...card, method: 'card' }, '2530x1170': { ...card, method: 'diagonal', diagIn: 6.1 } }, active: '1920x1080', borrowed: { '2560x1440': '1920x1080' } });
const mem = { data: { [STORE_KEY]: rulerText }, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = String(v); } };
store = withProfile(loadStore(mem), sig, card);
assert.ok(saveStore(mem, store));
const back = JSON.parse(mem.data[STORE_KEY]);
eq(Object.keys(back.profiles).sort(), ['1920x1080', '2530x1170', '2880x1800'], 'profiles kept');
eq(back.borrowed, { '2560x1440': '1920x1080' }, 'borrowed kept');
eq(back.v, 1, 'version unchanged');
eq(STORE_KEY, 'bm.calibration.v1', 'same key as the ruler');
const blocked = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
eq(loadStore(blocked), emptyStore(), 'blocked storage reads as empty');
eq(saveStore(blocked, store), false, 'blocked storage save fails softly');

// 12. Full report and copy text.
const env = { sw: 1440, sh: 900, aw: 1440, ah: 875, ow: 1440, oh: 875, iw: 1440, ih: 789, dpr: 2 };
let r = report(env, perMm(227 * 2880 / 2560));
near(r.phys.diagIn, 13.3, 0.01, 'report diagonal');
eq(r.device, { w: 2880, h: 1800 }, 'report device pixels');
near(r.ppi, 255.4, 0.1, 'rendered PPI');
eq(r.closest.diag, 13.3, 'report closest');
near(r.viewPhys.hIn, 789 / 900 * r.phys.hIn, 1e-9, 'viewport height');
let t = summaryText(r, 'Measured');
assert.ok(t.includes('Screen size: 13.3 in (33.8 cm) diagonal'), t);
assert.ok(t.includes('Resolution: 2880 x 1800 device pixels'), t);
assert.ok(t.includes('Pixel density: 255 rendered pixels per inch'), t);
r = report(env, 0);
eq(r.phys, null, 'no calibration, no inches');
t = summaryText(r);
assert.ok(t.includes('Screen size: about 13.3 in (33.8 cm) diagonal, estimated'), t);
assert.ok(!t.includes('not measured'), t);
assert.ok(!/NaN|undefined|Infinity/.test(t), 'no bad numbers');
eq(r.est.diag, 13.3, 'report carries the estimate');
near(r.estPhys.diagIn, 13.3, 1e-9, 'estimate diagonal in report');
near(r.estPhys.wIn / r.estPhys.hIn, 1440 / 900, 1e-9, 'estimate keeps the screen shape');
// After a card match the measured value leads and the estimate follows.
t = summaryText(report({ ...env, os: 'mac' }, perMm(227 * 2880 / 2560)));
assert.ok(t.includes('Screen size: 13.3 in (33.8 cm) diagonal, measured with a card') && t.includes('Estimate from pixels: 13.3 in'), t);
// Fractional DPR (Windows 125%): device pixels round.
r = report({ ...env, sw: 1536, sh: 864, dpr: 1.25 }, 0);
eq(r.device, { w: 1920, h: 1080 }, 'Windows 125% device pixels');


// 13. The instant estimate. Known answers: screen CSS size x pixel ratio, matched to common devices.
// est(cssW, cssH, dpr, os, mobile) gives { diag, alts }.
const est = (w, h, dpr, os, mobile = false) => estimateScreen({ sw: w, sh: h, dpr, os, mobile });
const main = (w, h, dpr, os, mobile, want, msg) => { const e = est(w, h, dpr, os, mobile); eq(e.how, 'match', msg + ' is a table match'); eq(e.diag, want, msg); return e; };
// iPhones (Safari reports CSS pixels; device pixels are 3x).
main(390, 844, 3, 'ios', true, 6.1, 'iPhone 1170 x 2532');
main(393, 852, 3, 'ios', true, 6.1, 'iPhone 15 1179 x 2556');
main(430, 932, 3, 'ios', true, 6.7, 'iPhone 15 Plus 1290 x 2796');
main(440, 956, 3, 'ios', true, 6.9, 'iPhone 16 Pro Max');
main(375, 667, 2, 'ios', true, 4.7, 'iPhone SE 750 x 1334');
main(414, 896, 2, 'ios', true, 6.1, 'iPhone XR / 11');
eq(est(390, 844, 3, 'ios', true).alts, [], 'iPhone 6.1 has no alternatives');
// Android phones: odd pixel ratios round to the panel.
let e = main(412, 915, 2.625, 'android', true, 6.5, 'Pixel-style 1080 x 2400');
eq(e.alts, [6.1, 6.7], 'Android 1080 x 2400 alternatives');
main(360, 800, 3, 'android', true, 6.5, 'Android 1080 x 2400 at 3x');
main(384, 854, 2.8125, 'android', true, 6.5, 'Android 1080 x 2402 rounds to the 1080 x 2400 panel');
main(360, 780, 3, 'android', true, 6.1, 'Android 1080 x 2340');
main(412, 892, 3.5, 'android', true, 6.8, 'Galaxy Ultra 1440 x 3120-ish');
// iPad and Android tablets.
main(820, 1180, 2, 'ios', true, 10.9, 'iPad Air 1640 x 2360');
main(1024, 1366, 2, 'ios', true, 12.9, 'iPad Pro 2048 x 2732');
e = main(768, 1024, 2, 'ios', true, 9.7, 'iPad 1536 x 2048');
eq(e.alts, [7.9], 'iPad 2048 x 1536 could be an iPad mini');
eq(est(1280, 800, 2, 'android', true).cls, 'tablet', 'wide touch screen is a tablet');
// Macs: the default scaled mode draws 2x the looks-like size.
e = main(1440, 900, 2, 'mac', false, 13.3, 'MacBook 1440 x 900 at 2x');
eq(e.alts, [15.4], 'MacBook 2880 x 1800 could be a 15 inch');
main(1280, 800, 2, 'mac', false, 13.3, 'MacBook 2560 x 1600');
main(1512, 982, 2, 'mac', false, 14.2, 'MacBook Pro 14');
main(1728, 1117, 2, 'mac', false, 16.2, 'MacBook Pro 16');
main(1470, 956, 2, 'mac', false, 13.6, 'MacBook Air 13.6');
main(2560, 1440, 2, 'mac', false, 27, 'iMac 5K / Studio Display');
// 1920 x 1080: a monitor at 100 percent, a laptop at 125 percent and up.
e = main(1920, 1080, 1, 'pc', false, 24, '1080p at 100 percent is a monitor');
eq(e.alts.slice(0, 2), [21.5, 27], '1080p monitor alternatives');
assert.ok(e.alts.includes(15.6), '1080p monitor could be a 15.6 laptop');
n++;
e = main(1536, 864, 1.25, 'pc', false, 15.6, '1080p at 125 percent is a 15.6 laptop');
assert.ok(e.alts.includes(14), '1080p laptop could be 14 in');
n++;
main(1280, 720, 1.5, 'pc', false, 14, '1080p at 150 percent is a 14 in laptop');
// Other common Windows screens.
main(1366, 768, 1, 'pc', false, 15.6, '1366 x 768 laptop');
main(2560, 1440, 1, 'pc', false, 27, '1440p monitor');
main(3440, 1440, 1, 'pc', false, 34, 'ultrawide');
main(2560, 1440, 1.5, 'pc', false, 27, '4K monitor at 150 percent');
main(1920, 1080, 1, 'mac', false, 24, 'external 1080p monitor on a Mac');
// A phone Android resolution must never be read as an iPhone, and a Mac must never get a Windows laptop.
assert.notEqual(est(360, 780, 3, 'android', true).diag, 5.4, 'Android 1080 x 2340 is not the iPhone mini');
n++;
// Zoom does not change the answer: Chrome at 125 percent shrinks the screen and grows the ratio.
eq(est(1920 / 1.25, 1080 / 1.25, 1.25, 'pc').diag, 15.6, 'Chrome zoom 125 percent: same pixels, the ratio decides');
// Rotation does not change the answer.
eq(est(844, 390, 3, 'ios', true).diag, est(390, 844, 3, 'ios', true).diag, 'landscape iPhone');
// No match: typical pixel density for the device class.
e = est(450, 970, 3, 'unknown', true);
eq(e.how, 'typical', 'unknown phone falls back');
eq(e.cls, 'phone', 'fallback class phone');
near(e.diag, Math.hypot(1350, 2910) / 420, 0.05, 'phone fallback uses 420 PPI');
e = est(1500, 1000, 1, 'pc');
eq(e.how, 'typical', 'unknown monitor falls back');
near(e.diag, Math.hypot(1500, 1000) / 100, 0.25, 'monitor fallback uses 100 PPI');
eq(e.diag % 0.5, 0, 'desktop fallback rounds to half an inch');
e = est(1800, 1200, 2, 'unknown');
eq(e.how, 'typical', 'unknown hi-dpi desktop falls back');
near(e.diag, Math.hypot(3600, 2400) / 220, 0.25, 'hi-dpi fallback uses 220 PPI');
// Bad input gives no estimate, never NaN.
eq(estimateScreen({ sw: 0, sh: 0, dpr: 1 }), null, 'no screen, no estimate');
eq(estimateScreen({ sw: NaN, sh: 800, dpr: 1 }), null, 'NaN screen');
// Helpers.
eq(altText([14]), '14 in', 'one alternative');
eq(altText([14, 17.3]), '14 or 17.3 in', 'two alternatives');
eq(altText([14, 17.3, 13.3]), '14, 17.3 or 13.3 in', 'three alternatives');
eq(altText([]), '', 'no alternatives');
eq(estimateAlts(est(1920, 1080, 1, 'pc')).startsWith('21.5'), true, 'alt words');
const sd = sidesFromDiagonal(15.6, 1920, 1080);
near(sd.wIn, 13.6, 0.01, 'estimated width of a 15.6 in 16:9');
near(sd.hIn, 7.65, 0.01, 'estimated height of a 15.6 in 16:9');
near(Math.hypot(sd.wIn, sd.hIn), 15.6, 1e-9, 'sides give back the diagonal');
// Every table row is reachable by its own pixel count on its own platform and class, and never returns NaN.
{
  const { ESTIMATE_TABLE } = await import('../src/lib/estimate.js');
  for (const [cls, rows] of Object.entries(ESTIMATE_TABLE)) {
    for (const r of rows) {
      assert.ok(r.diag > 0 && r.px[0] >= r.px[1] && r.px[1] > 0, `row sane: ${r.diag} ${r.px}`);
      const os = r.os || 'unknown';
      const dprTry = r.dpr ? (r.dpr[0] + r.dpr[1]) / 2 : cls === 'phone' ? 3 : cls === 'tablet' ? Math.min(2, r.px[1] / 620) : 1;
      const got = estimateScreen({ sw: r.px[0] / dprTry, sh: r.px[1] / dprTry, dpr: dprTry, os, mobile: cls !== 'desktop' });
      assert.ok(got && got.how === 'match' && (got.diag === r.diag || got.alts.includes(r.diag)), `row found: ${cls} ${r.diag} ${r.px} gave ${got && got.diag}`);
      n++;
    }
  }
}

console.log(`ok: ${n} checks passed`);
