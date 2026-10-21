// Calibration math and the shared saved record. No DOM here, so it is easy to test and to copy to other tools.
// The stored number is devPxPerMm: device pixels per millimeter. It does not change when the user zooms
// the page in Chrome, Edge or Firefox, because zoom changes devicePixelRatio by the same factor.

import { MM_PER_IN } from './units.js';

export const STORE_KEY = 'bm.calibration.v1';

/** ISO/IEC 7810 ID-1 card, the size of a credit or debit card. */
export const CARD = { w: 85.6, h: 53.98 };

export const cssPxPerMm = (devPxPerMm, dpr) => devPxPerMm / dpr;

/** The user matched an object of known width: widthCssPx on screen is knownMm in real life. */
export const devPxPerMmFromObject = (widthCssPx, knownMm, dpr) => (widthCssPx / knownMm) * dpr;

/** Physical long and short side of a panel from its diagonal in inches and its aspect ratio (long / short). */
export function panelFromDiagonal(diagIn, aspect) {
  const diagMm = diagIn * MM_PER_IN;
  const long = (diagMm * aspect) / Math.sqrt(1 + aspect * aspect);
  return { longMm: long, shortMm: long / aspect };
}

/**
 * Device shortcut: the long side of the screen, in CSS pixels, spans the long side of the panel.
 * Using the live screen size means the result follows display scaling.
 */
export function devPxPerMmFromPanel(longMm, screenLongCssPx, dpr) {
  return (screenLongCssPx / longMm) * dpr;
}

/** Guess for a screen nobody calibrated. Always shown as an estimate. */
export function estimateCssPxPerMm({ coarse, minSide }) {
  if (coarse && minSide <= 600) return 160 / MM_PER_IN; // phones: one CSS pixel is about 1/160 inch
  if (coarse) return 132 / MM_PER_IN; // tablets
  return 96 / MM_PER_IN; // the CSS reference pixel
}

/**
 * Key for one screen. It uses physical pixels, rounded, and the long side first.
 * It must not change when the user zooms the page, and must not change with orientation.
 */
export function screenSignature(screenW, screenH, dpr) {
  const a = Math.round((screenW * dpr) / 10) * 10;
  const b = Math.round((screenH * dpr) / 10) * 10;
  return `${Math.max(a, b)}x${Math.min(a, b)}`;
}

export function emptyStore() {
  return { v: 1, profiles: {}, active: null, borrowed: {} };
}

/** Parse the saved text. Bad, missing or old data gives an empty store. */
export function parseStore(text) {
  if (typeof text !== 'string' || text === '') return emptyStore();
  let data;
  try { data = JSON.parse(text); } catch { return emptyStore(); }
  if (!data || data.v !== 1 || typeof data.profiles !== 'object' || data.profiles === null) return emptyStore();
  const profiles = {};
  for (const [k, p] of Object.entries(data.profiles)) {
    if (p && Number.isFinite(p.devPxPerMm) && p.devPxPerMm > 0.5 && p.devPxPerMm < 200) profiles[k] = p;
  }
  // borrowed[screen] = the screen whose calibration the user chose to reuse here.
  const borrowed = {};
  if (data.borrowed && typeof data.borrowed === 'object') {
    for (const [sig, from] of Object.entries(data.borrowed)) if (typeof from === 'string' && profiles[from] && !profiles[sig]) borrowed[sig] = from;
  }
  return { v: 1, profiles, active: typeof data.active === 'string' && profiles[data.active] ? data.active : null, borrowed };
}

/** What to do for the current screen: use its profile, reuse a chosen one, ask about a new screen, or start fresh. */
export function pickProfile(store, sig) {
  if (store.profiles[sig]) return { state: 'match', profile: store.profiles[sig] };
  const from = store.borrowed && store.borrowed[sig];
  if (from && store.profiles[from]) return { state: 'borrowed', profile: store.profiles[from], from };
  const others = Object.keys(store.profiles);
  if (others.length > 0) return { state: 'other', profile: null, others };
  return { state: 'none', profile: null, others: [] };
}

export function withProfile(store, sig, profile) {
  const borrowed = { ...store.borrowed };
  delete borrowed[sig];
  return { v: 1, profiles: { ...store.profiles, [sig]: profile }, active: sig, borrowed };
}

/** The user chose to reuse the calibration of screen `from` on screen `sig`. Nothing is measured, so it stays approximate. */
export function withBorrowed(store, sig, from) {
  if (!store.profiles[from]) return store;
  return { ...store, borrowed: { ...store.borrowed, [sig]: from } };
}

export function withoutProfile(store, sig) {
  const profiles = { ...store.profiles };
  delete profiles[sig];
  const borrowed = {};
  for (const [k, from] of Object.entries(store.borrowed || {})) if (k !== sig && from !== sig) borrowed[k] = from;
  return { v: 1, profiles, active: store.active === sig ? null : store.active, borrowed };
}

// Storage wrappers: every call is safe when storage is blocked.
export function loadStore(storage) {
  try { return parseStore(storage.getItem(STORE_KEY)); } catch { return emptyStore(); }
}
export function saveStore(storage, store) {
  try { storage.setItem(STORE_KEY, JSON.stringify(store)); return true; } catch { return false; }
}

/**
 * Pick the object for the check step. It must differ from the object the user just matched.
 * `usedId` is 'card', a coin id or a paper id, or null when no object was used (device and size methods).
 */
export function pickCheckObject(usedId) {
  return usedId === 'card' ? 'us-quarter' : 'card';
}

/** Plain words for the status chip. "Calibrated" is only for a method where the user matched a real object. */
export function statusFor(profile, borrowed = false) {
  if (profile && borrowed) return { kind: 'device', text: 'Using the calibration from another screen: approximate', short: 'Approximate' };
  if (!profile) return { kind: 'estimate', text: 'Not calibrated: sizes are an estimate', short: 'Estimate' };
  if (profile.method === 'device') return { kind: 'device', text: 'Set from device size: approximate', short: 'Approximate' };
  if (profile.method === 'diagonal') return { kind: 'device', text: 'Set from screen size: approximate', short: 'Approximate' };
  const what = { card: 'card', coin: 'coin', paper: 'paper' }[profile.method] || 'object';
  return { kind: 'calibrated', text: profile.verified ? `Calibrated with ${what}, checked` : `Calibrated with ${what}`, short: profile.verified ? 'Calibrated, checked' : 'Calibrated' };
}
