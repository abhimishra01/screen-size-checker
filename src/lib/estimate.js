// Instant estimate of the screen diagonal, before anyone measures anything. No DOM here, so Node can test it.
// A browser reports pixels, not inches. So this matches the pixel count (screen size times pixel ratio) to a table
// of common devices and panels. When several sizes share one resolution, the most common comes first and the rest
// become "could also be" sizes. When nothing matches, it falls back to a typical pixel density for the device class.
// The answer is always shown as an estimate. A card match (screen.js, calibration.js) replaces it.

// Entry: [os, diagonal in, long side px, short side px, kind, dprLow, dprHigh]
// os: 'ios' | 'android' | 'mac' | 'pc', or null for a monitor that any computer can use. Pixels are device pixels, long side first, the way the browser draws them.
// dprLow..dprHigh (optional): the pixel ratio the usual owner of this size runs. A match inside the range goes first.
// Same resolution: the first entry that fits is the main answer, later ones are the alternatives.
const e = (os, diag, w, h, kind, lo, hi) => ({ os, diag, px: [w, h], kind, dpr: lo === undefined ? null : [lo, hi] });

const PHONES = [
  // iPhone
  e('ios', 4.7, 1334, 750, 'iPhones'),
  e('ios', 5.5, 2208, 1242, 'iPhones'),
  e('ios', 5.8, 2436, 1125, 'iPhones'),
  e('ios', 5.4, 2340, 1080, 'iPhones'),
  e('ios', 6.1, 1792, 828, 'iPhones'),
  e('ios', 6.5, 2688, 1242, 'iPhones'),
  e('ios', 6.1, 2532, 1170, 'iPhones'),
  e('ios', 6.1, 2556, 1179, 'iPhones'),
  e('ios', 6.3, 2622, 1206, 'iPhones'),
  e('ios', 6.7, 2778, 1284, 'iPhones'),
  e('ios', 6.7, 2796, 1290, 'iPhones'),
  e('ios', 6.9, 2868, 1320, 'iPhones'),
  // Android
  e('android', 6.5, 1600, 720, 'Android phones'),
  e('android', 6.6, 1600, 720, 'Android phones'),
  e('android', 6.7, 1600, 720, 'Android phones'),
  e('android', 5.5, 1920, 1080, 'Android phones'),
  e('android', 6.5, 2400, 1080, 'Android phones'),
  e('android', 6.1, 2400, 1080, 'Android phones'),
  e('android', 6.7, 2400, 1080, 'Android phones'),
  e('android', 6.1, 2340, 1080, 'Android phones'),
  e('android', 6.2, 2340, 1080, 'Android phones'),
  e('android', 6.4, 2340, 1080, 'Android phones'),
  e('android', 6.7, 2408, 1080, 'Android phones'),
  e('android', 6.3, 2424, 1080, 'Android phones'),
  e('android', 6.3, 2856, 1280, 'Android phones'),
  e('android', 6.8, 2992, 1344, 'Android phones'),
  e('android', 6.7, 2992, 1344, 'Android phones'),
  e('android', 6.8, 3120, 1440, 'Android phones'),
  e('android', 6.7, 3120, 1440, 'Android phones'),
  e('android', 6.8, 3200, 1440, 'Android phones'),
  e('android', 6.9, 3200, 1440, 'Android phones'),
  e('android', 5.8, 2960, 1440, 'Android phones'),
  e('android', 6.2, 2960, 1440, 'Android phones'),
];

const TABLETS = [
  e('ios', 9.7, 2048, 1536, 'iPads'),
  e('ios', 7.9, 2048, 1536, 'iPads'),
  e('ios', 10.2, 2160, 1620, 'iPads'),
  e('ios', 10.5, 2224, 1668, 'iPads'),
  e('ios', 8.3, 2266, 1488, 'iPads'),
  e('ios', 10.9, 2360, 1640, 'iPads'),
  e('ios', 11, 2388, 1668, 'iPads'),
  e('ios', 11, 2420, 1668, 'iPads'),
  e('ios', 12.9, 2732, 2048, 'iPads'),
  e('ios', 13, 2732, 2048, 'iPads'),
  e('ios', 13, 2752, 2064, 'iPads'),
  e('android', 10.1, 1280, 800, 'Android tablets'),
  e('android', 8, 1280, 800, 'Android tablets'),
  e('android', 10.1, 1920, 1200, 'Android tablets'),
  e('android', 10.5, 1920, 1200, 'Android tablets'),
  e('android', 11, 1920, 1200, 'Android tablets'),
  e('android', 10.4, 2000, 1200, 'Android tablets'),
  e('android', 11, 2560, 1600, 'Android tablets'),
  e('android', 10.5, 2560, 1600, 'Android tablets'),
  e('android', 12.4, 2800, 1752, 'Android tablets'),
  e('android', 14.6, 2960, 1848, 'Android tablets'),
];

const DESKTOPS = [
  // MacBooks and iMacs. Pixels are the ones Mac draws at the default or a scaled setting.
  e('mac', 13.3, 2880, 1800, 'MacBooks'),
  e('mac', 15.4, 2880, 1800, 'MacBooks'),
  e('mac', 13.3, 2560, 1600, 'MacBooks'),
  e('mac', 13.3, 3360, 2100, 'MacBooks'),
  e('mac', 15.4, 3360, 2100, 'MacBooks'),
  e('mac', 14.2, 3024, 1964, 'MacBooks'),
  e('mac', 13.6, 2940, 1912, 'MacBooks'),
  e('mac', 13.6, 2560, 1664, 'MacBooks'),
  e('mac', 16.2, 3456, 2234, 'MacBooks'),
  e('mac', 15.3, 3420, 2214, 'MacBooks'),
  e('mac', 15.3, 2880, 1864, 'MacBooks'),
  e('mac', 16, 3072, 1920, 'MacBooks'),
  e('mac', 12, 2304, 1440, 'MacBooks'),
  e('mac', 21.5, 4096, 2304, 'iMacs and monitors'),
  e('mac', 24, 4480, 2520, 'iMacs and monitors'),
  e('mac', 27, 5120, 2880, 'iMacs and monitors'),
  e('mac', 32, 6016, 3384, 'monitors'),
  e('mac', 27, 3840, 2160, 'monitors'),
  e('mac', 32, 3840, 2160, 'monitors'),
  e('mac', 24, 3840, 2160, 'monitors'),
  // Windows, Linux, Chromebooks. The pixel ratio tells a monitor (100 percent) from a laptop (125 percent and up).
  e('pc', 15.6, 1366, 768, 'laptops'),
  e('pc', 14, 1366, 768, 'laptops'),
  e('pc', 11.6, 1366, 768, 'laptops'),
  e('pc', 15.6, 1600, 900, 'laptops'),
  e('pc', 14, 1600, 900, 'laptops'),
  e('pc', 13.3, 1280, 800, 'laptops'),
  e(null, 19, 1440, 900, 'monitors'),
  e(null, 22, 1680, 1050, 'monitors'),
  e(null, 19, 1280, 1024, 'monitors'),
  e('pc', 15.6, 1920, 1080, 'laptops', 1.15, 1.35),
  e('pc', 17.3, 1920, 1080, 'laptops', 1.15, 1.35),
  e('pc', 14, 1920, 1080, 'laptops', 1.4, 2.1),
  e('pc', 13.3, 1920, 1080, 'laptops', 1.4, 2.1),
  e(null, 24, 1920, 1080, 'monitors', 0.9, 1.1),
  e(null, 21.5, 1920, 1080, 'monitors', 0.9, 1.1),
  e(null, 27, 1920, 1080, 'monitors', 0.9, 1.1),
  e('pc', 16, 1920, 1200, 'laptops', 1.15, 1.35),
  e('pc', 14, 1920, 1200, 'laptops', 1.4, 2.1),
  e('pc', 13.3, 1920, 1200, 'laptops', 1.4, 2.1),
  e(null, 24, 1920, 1200, 'monitors', 0.9, 1.1),
  e(null, 27, 2560, 1440, 'monitors'),
  e(null, 32, 2560, 1440, 'monitors'),
  e(null, 24, 2560, 1440, 'monitors'),
  e(null, 30, 2560, 1600, 'monitors', 0.9, 1.1),
  e('pc', 16, 2560, 1600, 'laptops', 1.15, 2.1),
  e('pc', 14, 2560, 1600, 'laptops', 1.15, 2.1),
  e('pc', 13.6, 2560, 1664, 'laptops'),
  e('pc', 13.5, 2256, 1504, 'laptops'),
  e('pc', 15, 2496, 1664, 'laptops'),
  e('pc', 12.3, 2736, 1824, 'laptops'),
  e('pc', 13, 2880, 1920, 'laptops'),
  e('pc', 14, 2880, 1800, 'laptops'),
  e('pc', 16, 2880, 1800, 'laptops'),
  e('pc', 13.3, 3200, 1800, 'laptops'),
  e('pc', 15.6, 3200, 1800, 'laptops'),
  e('pc', 15.6, 3456, 2160, 'laptops'),
  e(null, 27, 3840, 2160, 'monitors', 0.9, 1.7),
  e(null, 32, 3840, 2160, 'monitors', 0.9, 1.7),
  e(null, 28, 3840, 2160, 'monitors', 0.9, 1.7),
  e('pc', 15.6, 3840, 2160, 'laptops', 1.75, 4),
  e('pc', 17.3, 3840, 2160, 'laptops', 1.75, 4),
  e(null, 27, 3840, 2160, 'monitors', 1.75, 4),
  e('pc', 16, 3840, 2400, 'laptops'),
  e(null, 34, 3440, 1440, 'ultrawide monitors'),
  e(null, 35, 3440, 1440, 'ultrawide monitors'),
  e(null, 29, 2560, 1080, 'ultrawide monitors'),
  e(null, 34, 2560, 1080, 'ultrawide monitors'),
  e(null, 38, 3840, 1600, 'ultrawide monitors'),
  e(null, 34, 5120, 2160, 'ultrawide monitors'),
  e(null, 40, 5120, 2160, 'ultrawide monitors'),
  e(null, 49, 5120, 1440, 'ultrawide monitors'),
  e(null, 49, 3840, 1080, 'ultrawide monitors'),
  e(null, 27, 5120, 2880, 'monitors'),
  e(null, 32, 5120, 2880, 'monitors'),
];

export const ESTIMATE_TABLE = { phone: PHONES, tablet: TABLETS, desktop: DESKTOPS };

// Typical pixels per inch, used only when no table row fits. Rough on purpose.
const FALLBACK_PPI = {
  phone: { ppi: 420, kind: 'phones' },
  tablet: { ppi: 264, kind: 'tablets' },
  monitor: { ppi: 100, kind: 'monitors' },
  laptop: { ppi: 140, kind: 'laptops' },
  hidpi: { ppi: 220, kind: 'high resolution laptops' },
};

const MM_PER_IN = 25.4;

/** Device class from what the browser says. phone and tablet need a touch device. */
export function deviceClass({ mobile, sw, sh }) {
  if (!mobile) return 'desktop';
  return Math.min(sw, sh) < 600 ? 'phone' : 'tablet';
}

// Can an entry of this os belong to a device that reports this os?
function osFits(entryOs, os, cls) {
  if (cls === 'phone' || cls === 'tablet') {
    if (os === 'ios') return entryOs === 'ios';
    if (os === 'android') return entryOs === 'android';
    return true; // a touch device that does not say which
  }
  if (!entryOs) return true;
  if (os === 'mac') return entryOs === 'mac';
  if (os === 'pc') return entryOs === 'pc';
  return true; // unknown desktop: try every row
}

const tol = (n) => Math.max(2, Math.round(n * 0.004));

/**
 * Estimate the diagonal.
 * env: { sw, sh (screen in CSS pixels), dpr, os ('ios' | 'android' | 'mac' | 'pc' | other), mobile (touch device) }
 * Returns null when the screen size is unknown. Otherwise:
 * { diag (inches), alts (other likely sizes, most likely first), how ('match' | 'typical'), kind, cls, devW, devH, ppi }
 * ppi here is the density the estimate implies, in device pixels per inch.
 */
export function estimateScreen(env) {
  const { sw, sh, dpr = 1, os = 'unknown', mobile = false } = env;
  if (!(sw > 0 && sh > 0 && dpr > 0)) return null;
  const devW = Math.round(sw * dpr), devH = Math.round(sh * dpr);
  const long = Math.max(devW, devH), short = Math.min(devW, devH);
  const cls = deviceClass({ mobile, sw, sh });
  const table = ESTIMATE_TABLE[cls].filter((r) => osFits(r.os, os, cls));

  // Rows that fit within a rounding error; keep only the closest resolution.
  let best = Infinity;
  const near = [];
  for (const r of table) {
    const dl = Math.abs(r.px[0] - long), ds = Math.abs(r.px[1] - short);
    if (dl > tol(r.px[0]) || ds > tol(r.px[1])) continue;
    const d = dl + ds;
    near.push({ r, d });
    if (d < best) best = d;
  }
  const hits = near.filter((x) => x.d === best).map((x) => x.r);
  if (hits.length) {
    // A row whose pixel ratio range holds this screen's ratio goes first. Rows with no range come next.
    // Rows whose range misses follow, the nearest range first. Equal rows keep table order.
    const rank = (r) => (!r.dpr ? 0.5 : dpr >= r.dpr[0] && dpr <= r.dpr[1] ? 0 : 1 + Math.min(Math.abs(dpr - r.dpr[0]), Math.abs(dpr - r.dpr[1])));
    const ordered = hits.map((r, i) => ({ r, i })).sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i).map((x) => x.r);
    const diag = ordered[0].diag;
    const alts = [];
    for (const r of ordered) if (r.diag !== diag && !alts.includes(r.diag)) alts.push(r.diag);
    return { diag, alts: alts.slice(0, 3), how: 'match', kind: ordered[0].kind, cls, devW, devH, ppi: Math.hypot(devW, devH) / diag };
  }

  // No row fits: typical density for this kind of device.
  const fb = cls === 'phone' ? FALLBACK_PPI.phone
    : cls === 'tablet' ? FALLBACK_PPI.tablet
    : dpr >= 1.75 ? FALLBACK_PPI.hidpi
    : dpr >= 1.2 ? FALLBACK_PPI.laptop
    : FALLBACK_PPI.monitor;
  const raw = Math.hypot(devW, devH) / fb.ppi;
  // Phones to 0.1 in; everything else to the nearest half inch, because the guess is not finer than that.
  const diag = cls === 'phone' ? Math.round(raw * 10) / 10 : Math.round(raw * 2) / 2;
  return { diag, alts: [], how: 'typical', kind: fb.kind, cls, devW, devH, ppi: Math.hypot(devW, devH) / diag, typicalPpi: fb.ppi };
}

/** Width and height in inches for a diagonal and a screen shape given in any units. */
export function sidesFromDiagonal(diagIn, w, h) {
  const k = diagIn / Math.hypot(w, h);
  return { diagIn, wIn: w * k, hIn: h * k, wMm: w * k * MM_PER_IN, hMm: h * k * MM_PER_IN, diagMm: diagIn * MM_PER_IN };
}

/** Plain words for the "could also be" line: "14 in", "14 or 17.3 in", "14, 17.3 or 13.3 in". Empty when none. */
export function altText(alts, fmt = String) {
  const a = alts.map(fmt);
  if (!a.length) return '';
  if (a.length === 1) return `${a[0]} in`;
  return `${a.slice(0, -1).join(', ')} or ${a[a.length - 1]} in`;
}
