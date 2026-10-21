// Screen maths. No DOM here, so the test script runs it in Node.
// The input is what the browser reports (CSS pixels and devicePixelRatio) plus the saved calibration
// (device pixels per millimeter, shared with the online ruler).
import { MM_PER_IN } from './units.js';
import { ALL_SIZES } from './sizes.js';

/** Physical size of a pixel area. w and h are CSS pixels; dpr turns them into device pixels. */
export function physicalSize(w, h, dpr, devPxPerMm) {
  const wMm = (w * dpr) / devPxPerMm;
  const hMm = (h * dpr) / devPxPerMm;
  const diagMm = Math.hypot(wMm, hMm);
  return { wMm, hMm, diagMm, wIn: wMm / MM_PER_IN, hIn: hMm / MM_PER_IN, diagIn: diagMm / MM_PER_IN };
}

/** Pixels per inch along the diagonal. wPx and hPx are device pixels. */
export const ppi = (wPx, hPx, diagIn) => Math.hypot(wPx, hPx) / diagIn;

/** How many CSS pixels make one real inch on this screen. */
export const cssPxPerInch = (devPxPerMm, dpr) => (devPxPerMm * MM_PER_IN) / dpr;

/** Device pixels: CSS pixels times the pixel ratio, rounded, the way the browser rounds them. */
export const devicePx = (cssPx, dpr) => Math.round(cssPx * dpr);

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** Named ratios people know. Values are long side over short side. */
export const NAMED_RATIOS = [
  ['16:9', 16 / 9], ['16:10', 16 / 10], ['3:2', 3 / 2], ['4:3', 4 / 3], ['5:4', 5 / 4],
  ['21:9', 21 / 9], ['32:9', 32 / 9], ['19.5:9', 19.5 / 9], ['20:9', 20 / 9], ['18:9', 18 / 9], ['1:1', 1],
];

/**
 * Aspect ratio in words. The long side comes first in the name, and the order follows the screen
 * (a portrait phone gives "9:19.5").
 * Returns { text, short, exact, near, value }. value is long / short; short is the label without the decimal.
 */
export function aspect(w, h) {
  w = Math.round(w); h = Math.round(h);
  if (!(w > 0 && h > 0)) return { text: '', short: '', exact: null, near: null, value: NaN };
  const portrait = h > w;
  const long = Math.max(w, h), short = Math.min(w, h);
  const value = long / short;
  const g = gcd(long, short);
  const a = long / g, b = short / g;
  const order = (x, y) => (portrait ? `${y}:${x}` : `${x}:${y}`);
  const named = NAMED_RATIOS.find(([, v]) => Math.abs(v - value) < 1e-9);
  if (named) {
    const [x, y] = named[0].split(':');
    return { text: order(x, y), short: order(x, y), exact: order(x, y), near: null, value };
  }
  let best = null;
  for (const [name, v] of NAMED_RATIOS) {
    const off = Math.abs(v - value) / v;
    if (off <= 0.025 && (!best || off < best.off)) best = { name, off };
  }
  const dec = `${portrait ? `1:${fix(value, 2)}` : `${fix(value, 2)}:1`}`;
  if (best) {
    const [x, y] = best.name.split(':');
    const near = order(x, y);
    return { text: `about ${near} (${dec})`, short: `about ${near}`, exact: null, near, value };
  }
  if (a <= 50 && b <= 50) return { text: `${order(a, b)} (${dec})`, short: dec, exact: order(a, b), near: null, value };
  return { text: dec, short: dec, exact: null, near: null, value };
}

/** Fixed decimals without trailing zeros: fix(13.30, 2) gives "13.3". */
export function fix(n, d = 1) {
  if (!Number.isFinite(n)) return '';
  const s = n.toFixed(d);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

/** One decimal, always shown: 13.0 stays "13.0", so sizes line up. */
export const one = (n) => (Number.isFinite(n) ? n.toFixed(1) : '');

/** Closest common marketed size, if one is within 4 percent. */
export function closestSize(diagIn, list = ALL_SIZES) {
  if (!(diagIn > 0)) return null;
  let best = null;
  for (const s of list) {
    const off = Math.abs(s.diag - diagIn);
    if (!best || off < best.off) best = { ...s, off };
  }
  return best && best.off / best.diag <= 0.04 ? best : null;
}

/**
 * What the saved calibration means for this tool.
 * measured: the user matched a real object on this screen (card, coin or paper).
 * typed: the user picked a device or typed a size in the ruler. We would only echo it back.
 * other: the saved record belongs to another screen.
 * none: nothing saved.
 */
export function measureState(pick) {
  if (!pick || pick.state === 'none') return { kind: 'none', profile: null };
  if (pick.state === 'other' || pick.state === 'borrowed') return { kind: 'other', profile: null };
  const p = pick.profile;
  if (p && ['card', 'coin', 'paper'].includes(p.method)) return { kind: 'measured', profile: p };
  return { kind: 'typed', profile: p };
}

/** Plain words for the status chip. */
export function chipFor(kind, profile) {
  if (kind === 'measured') {
    const what = { card: 'card', coin: 'coin', paper: 'paper' }[profile.method] || 'object';
    return { kind: 'calibrated', short: 'Measured', text: `Measured with a ${what} on this screen` };
  }
  if (kind === 'typed') return { kind: 'device', short: 'Not measured', text: 'Set from a size you picked in the ruler, not measured' };
  if (kind === 'other') return { kind: 'estimate', short: 'Not measured', text: 'Your saved calibration is for another screen' };
  return { kind: 'estimate', short: 'Not measured', text: 'Not measured yet' };
}

/** Everything the page shows, from what the browser reports. All sizes in CSS pixels unless named. */
export function report(env, devPxPerMm) {
  const { sw, sh, aw, ah, ow, oh, iw, ih, dpr } = env;
  const out = {
    screen: { w: sw, h: sh },
    avail: { w: aw, h: ah },
    window: { w: ow, h: oh },
    viewport: { w: iw, h: ih },
    dpr,
    device: { w: devicePx(sw, dpr), h: devicePx(sh, dpr) },
    aspect: aspect(sw, sh),
    phys: null,
    viewPhys: null,
    ppi: null,
    cssPerIn: null,
    closest: null,
  };
  if (devPxPerMm > 0) {
    out.phys = physicalSize(sw, sh, dpr, devPxPerMm);
    out.viewPhys = physicalSize(iw, ih, dpr, devPxPerMm);
    out.ppi = ppi(out.device.w, out.device.h, out.phys.diagIn);
    out.cssPerIn = cssPxPerInch(devPxPerMm, dpr);
    out.closest = closestSize(out.phys.diagIn);
  }
  return out;
}

/** Plain text for the Copy button. */
export function summaryText(r, status) {
  const lines = [];
  if (r.phys) {
    lines.push(`Screen size: ${one(r.phys.diagIn)} in (${one(r.phys.diagMm / 10)} cm) diagonal`);
    lines.push(`Width x height: ${one(r.phys.wIn)} x ${one(r.phys.hIn)} in (${one(r.phys.wMm / 10)} x ${one(r.phys.hMm / 10)} cm)`);
    lines.push(`Pixel density: ${Math.round(r.ppi)} rendered pixels per inch`);
  } else {
    lines.push('Screen size: not measured (match a bank card on the page to measure it)');
  }
  lines.push(`Resolution: ${r.device.w} x ${r.device.h} device pixels`);
  lines.push(`Screen: ${r.screen.w} x ${r.screen.h} CSS pixels, pixel ratio ${fix(r.dpr, 3)}`);
  lines.push(`Aspect ratio: ${r.aspect.text}`);
  lines.push(`Browser viewport: ${r.viewport.w} x ${r.viewport.h} CSS pixels`);
  if (status) lines.push(`Status: ${status}`);
  return lines.join('\n');
}
