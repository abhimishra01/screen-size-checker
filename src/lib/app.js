// Browser side of the checker: reads the screen, keeps the result live, and runs the card match.
// The maths lives in screen.js and calibration.js and is tested in Node.
import {
  CARD, STORE_KEY, devPxPerMmFromObject, estimateCssPxPerMm, screenSignature,
  loadStore, saveStore, pickProfile, withProfile, withoutProfile,
} from './calibration.js';
import { report, measureState, chipFor, summaryText, one, fix } from './screen.js';

const $ = (id) => document.getElementById(id);
function safeStorage() { try { return window.localStorage; } catch { return null; } }
const blockedStore = { getItem() { throw new Error('no storage'); }, setItem() { throw new Error('no storage'); } };
const NEEDS = 'Needs a card match';
const NARROW = '(max-width: 700px), (pointer: coarse) and (max-width: 1100px)';
const times = (a, b) => `${a} × ${b}`;

export function initChecker() {
  const root = $('tool');
  if (!root) return;
  const storage = safeStorage() || blockedStore;
  let store = loadStore(storage);
  let sig = '';
  let state = { kind: 'none', profile: null };
  let last = null;
  const resultEl = root.querySelector('.result');
  const dlg = $('cal');
  const objEl = $('obj');
  const handle = $('obj-h');
  const toastEl = $('toast');

  const dpr = () => window.devicePixelRatio || 1;
  const env = () => ({
    sw: window.screen.width, sh: window.screen.height,
    aw: window.screen.availWidth, ah: window.screen.availHeight,
    ow: window.outerWidth, oh: window.outerHeight,
    iw: window.innerWidth, ih: window.innerHeight, dpr: dpr(),
  });
  function resolve() {
    sig = screenSignature(window.screen.width, window.screen.height, dpr());
    state = measureState(pickProfile(store, sig));
  }

  // ---------- result
  const set = (id, text) => { const el = $(id); if (el && el.textContent !== text) el.textContent = text; };
  function orientationText() {
    const type = (window.screen.orientation && window.screen.orientation.type) || '';
    const o = type ? (type.startsWith('portrait') ? 'Portrait' : 'Landscape') : (window.screen.height > window.screen.width ? 'Portrait' : 'Landscape');
    return `${o}, ${navigator.maxTouchPoints > 0 ? 'touch screen' : 'no touch'}`;
  }
  function render() {
    const measured = state.kind === 'measured';
    const r = report(env(), measured ? state.profile.devPxPerMm : 0);
    last = r;
    resultEl.dataset.state = state.kind;
    const chip = chipFor(state.kind, state.profile);
    for (const el of document.querySelectorAll('[data-cal-chip]')) {
      el.dataset.kind = chip.kind;
      el.title = chip.text;
      el.querySelector('[data-cal-chip-text]').textContent = chip.short;
    }
    for (const el of document.querySelectorAll('[data-cal-btn-text]')) el.textContent = measured ? 'Measure again' : 'Measure with a card';

    if (measured) {
      const p = r.phys;
      set('r-diag', `${one(p.diagIn)} in`);
      set('r-diag-cm', `${one(p.diagMm / 10)} cm diagonal`);
      set('r-wh', `Width ${one(p.wIn)} in, height ${one(p.hIn)} in (${one(p.wMm / 10)} × ${one(p.hMm / 10)} cm).`);
      const when = state.profile.ts ? new Date(state.profile.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      const how = `Measured with a card on this screen${when ? ` on ${when}` : ''}.`;
      set('r-note', r.closest
        ? `Closest common size: ${r.closest.diag} in (${r.closest.note.toLowerCase()}). Sizes on the box are rounded, so a small gap is normal. ${how}`
        : `This is not close to a size in our list. Some screens are less common, so this can be right. If it looks wrong, match the card again or measure with a tape. ${how}`);
    } else {
      set('r-diag', state.kind === 'other' ? 'Not measured on this screen' : 'Not measured yet');
      set('r-diag-cm', '');
      set('r-wh', state.kind === 'other'
        ? 'Your saved card match is for a different screen. Each screen needs its own match.'
        : state.kind === 'typed'
          ? 'In the online ruler you set this screen from a size you typed or a device you picked. That is not a measurement, so it is not shown here.'
          : 'Browsers report pixels, not inches. Any site that prints inches without a card match is guessing.');
      set('r-note', 'Press Measure with a card, hold a bank card flat on the screen, and drag the outline to fit. It takes about 20 seconds.');
    }

    set('f-res', `${times(r.device.w, r.device.h)}`);
    set('f-scr', times(r.screen.w, r.screen.h));
    set('f-dpr', fix(r.dpr, 3));
    set('f-asp', r.aspect.text);
    set('f-ppi', measured ? `${Math.round(r.ppi)} PPI` : NEEDS);
    set('f-vp', times(r.viewport.w, r.viewport.h));
    set('f-vpin', measured ? `${one(r.viewPhys.wIn)} × ${one(r.viewPhys.hIn)} in` : NEEDS);
    set('f-avl', times(r.avail.w, r.avail.h));
    set('f-win', times(r.window.w, r.window.h));
    set('f-cpi', measured ? fix(r.cssPerIn, 1) : NEEDS);
    set('f-col', `${window.screen.colorDepth}-bit`);
    set('f-ori', orientationText());
    drawShape(r);
    markTable(measured ? r.closest : null);
    root.dataset.ready = 'true';
  }
  // Drawing of the screen's shape. Only the proportions are real; it is not drawn at true size.
  function drawShape(r) {
    const W = 200, H = 140;
    const k = Math.min(W / r.screen.w, H / r.screen.h);
    const w = r.screen.w * k, h = r.screen.h * k;
    const x = 20 + (W - w) / 2, y = 5 + (H - h) / 2;
    const rect = $('shape-r'), line = $('shape-d');
    rect.setAttribute('x', x.toFixed(1)); rect.setAttribute('y', y.toFixed(1));
    rect.setAttribute('width', w.toFixed(1)); rect.setAttribute('height', h.toFixed(1));
    line.setAttribute('x1', x.toFixed(1)); line.setAttribute('y1', (y + h).toFixed(1));
    line.setAttribute('x2', (x + w).toFixed(1)); line.setAttribute('y2', y.toFixed(1));
    set('shape-c', r.phys
      ? `Shape of your screen. Diagonal ${one(r.phys.diagIn)} in.`
      : `Shape of your screen: ${r.aspect.text}. Size not measured.`);
  }
  function markTable(closest) {
    for (const row of document.querySelectorAll('[data-size]')) {
      const mine = !!closest && row.dataset.size === closest.id;
      if (mine) row.dataset.yours = '1'; else delete row.dataset.yours;
      const tag = row.querySelector('.yours');
      if (tag) tag.textContent = mine ? 'Closest to yours' : '';
    }
  }

  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3500);
  }

  // ---------- copy
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back below */ }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
  $('copy').addEventListener('click', async () => {
    const chip = chipFor(state.kind, state.profile);
    const ok = await copyText(summaryText(last, chip.text));
    const msg = $('copy-msg');
    msg.textContent = ok ? 'Copied.' : 'Copy failed. Select the numbers and copy them by hand.';
    setTimeout(() => { msg.textContent = ''; }, 3000);
  });

  // ---------- card match
  // per = CSS px per mm the user has set. It survives Turn card even when the outline must be cut to fit.
  const cal = { rotated: false, cssW: 300, per: 4 };
  // Phones and touch tablets: the panel sits at the bottom so the card can lie flat across the screen. Keep in step with tool.css.
  const isPhone = () => matchMedia(NARROW).matches;
  const spec = () => (cal.rotated ? { wMm: CARD.h, hMm: CARD.w } : { wMm: CARD.w, hMm: CARD.h });
  function startCssPerMm() {
    if (state.profile) return state.profile.devPxPerMm / dpr();
    const coarse = matchMedia('(pointer: coarse)').matches;
    return estimateCssPxPerMm({ coarse, minSide: Math.min(window.screen.width, window.screen.height) });
  }
  const roomW = () => window.innerWidth - (isPhone() ? 32 : 460);

  function placeObject() {
    const left = isPhone() ? Math.max(4, Math.min((window.innerWidth - cal.cssW) / 2 - 12, window.innerWidth - cal.cssW - 12)) : Math.max(24, (roomW() - cal.cssW) / 2);
    const top = isPhone() ? 40 : 110;
    objEl.style.left = `${Math.round(left)}px`;
    objEl.style.top = `${top}px`;
    sizeObject();
  }
  function sizeObject() {
    const s = spec();
    objEl.style.width = `${cal.cssW}px`;
    let h = (cal.cssW * s.hMm) / s.wMm;
    objEl.classList.remove('cut');
    // On a phone the panel covers the lower part. Only the width matters, so cut the outline above the panel.
    if (isPhone()) {
      const panelTop = dlg.querySelector('.cal-panel').getBoundingClientRect().top;
      const free = panelTop - objEl.offsetTop - 10;
      if (h > free) { h = Math.max(60, free); objEl.classList.add('cut'); }
    }
    objEl.style.height = `${h}px`;
    const perMm = cal.cssW / s.wMm;
    handle.setAttribute('aria-valuenow', String(Math.round(perMm * 100) / 100));
    handle.setAttribute('aria-valuetext', `${fix(cal.cssW, 0)} pixels wide for ${s.wMm} millimeters`);
    $('obj-l').textContent = `Bank card: ${s.wMm} mm`;
  }
  const clampW = (w) => Math.max(40, Math.min(w, window.innerWidth - (isPhone() ? 16 : 40)));
  const setW = (w) => { cal.cssW = clampW(w); cal.per = cal.cssW / spec().wMm; };
  function nudge(dMm) {
    setW(cal.cssW + dMm * (cal.cssW / spec().wMm));
    sizeObject();
  }
  function startObject() {
    const per = startCssPerMm();
    cal.rotated = CARD.w * per > roomW() - 40;
    $('rot-note').hidden = !cal.rotated;
    cal.per = per;
    cal.cssW = clampW(spec().wMm * per);
    placeObject();
  }
  function checkPinch() {
    const vv = window.visualViewport;
    $('pinch').hidden = !(vv && Math.abs(vv.scale - 1) > 0.02);
  }
  function openCal() {
    $('cal-err').textContent = '';
    $('reset').hidden = !state.profile;
    if (!dlg.open) dlg.showModal();
    startObject();
    checkPinch();
    $('cal-h').focus();
  }
  function closeCal() { if (dlg.open) dlg.close(); }
  for (const b of document.querySelectorAll('[data-cal-open]')) b.addEventListener('click', openCal);
  $('cal-close').addEventListener('click', closeCal);
  $('rotate').addEventListener('click', () => {
    cal.rotated = !cal.rotated;
    $('rot-note').hidden = !cal.rotated;
    cal.cssW = clampW(spec().wMm * cal.per);
    placeObject();
  });
  for (const b of dlg.querySelectorAll('[data-nudge]')) b.addEventListener('click', () => nudge(Number(b.dataset.nudge)));
  handle.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 0.1, ArrowUp: 0.1, ArrowLeft: -0.1, ArrowDown: -0.1 }[e.key];
    if (d) { e.preventDefault(); nudge(d * (e.shiftKey ? 10 : 1)); }
  });

  $('fit').addEventListener('click', () => {
    const d = dpr();
    const dev = devPxPerMmFromObject(cal.cssW, spec().wMm, d);
    if (!(dev > 1 && dev < 100)) { $('cal-err').textContent = 'That size looks wrong. Try again.'; return; }
    const profile = {
      method: 'card', devPxPerMm: dev, cssPxPerMmAtCal: dev / d, dprAtCal: d,
      screenW: window.screen.width, screenH: window.screen.height, ts: Date.now(), objectName: 'credit card',
    };
    store = withProfile(store, sig, profile);
    const saved = saveStore(storage, store);
    resolve();
    render();
    closeCal();
    const msg = `Measured: your screen is ${one(last.phys.diagIn)} inches.`;
    toast(saved ? msg : `${msg} This browser blocks saving, so it is kept only until you leave.`);
  });
  $('reset').addEventListener('click', () => {
    store = withoutProfile(store, sig);
    saveStore(storage, store);
    resolve();
    render();
    closeCal();
    toast('Card match removed for this screen.');
  });

  // Drag the grip to resize, drag the outline to move it, pinch to resize.
  const pts = new Map();
  let drag = null;
  objEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#obj-h')) return;
    e.preventDefault();
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) drag = { mode: 'move', x: e.clientX, y: e.clientY, l: objEl.offsetLeft, t: objEl.offsetTop };
    if (pts.size === 2) { const [a, b] = [...pts.values()]; drag = { mode: 'pinch', d: Math.hypot(a.x - b.x, a.y - b.y), w: cal.cssW }; }
  });
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const left = objEl.getBoundingClientRect().left;
    // Keep the grab point under the finger: no jump when the drag starts.
    drag = { mode: 'size', id: e.pointerId, left, offset: cal.cssW - (e.clientX - left) };
    handle.focus({ preventScroll: true });
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (drag.mode === 'size' && e.pointerId === drag.id) {
      setW(e.clientX - drag.left + drag.offset);
      sizeObject();
    } else if (pts.has(e.pointerId)) {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (drag.mode === 'move' && pts.size === 1) {
        objEl.style.left = `${drag.l + e.clientX - drag.x}px`;
        objEl.style.top = `${Math.max(30, drag.t + e.clientY - drag.y)}px`;
        sizeObject();
      } else if (drag.mode === 'pinch' && pts.size === 2) {
        const [a, b] = [...pts.values()];
        setW((drag.w * Math.hypot(a.x - b.x, a.y - b.y)) / drag.d);
        sizeObject();
      }
    }
  });
  const up = (e) => { pts.delete(e.pointerId); if (drag && (drag.mode === 'size' ? e.pointerId === drag.id : pts.size === 0)) drag = null; };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);

  // ---------- keep it live
  let raf = 0;
  const update = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const before = sig;
      resolve();
      render();
      if (dlg.open && before !== sig) startObject();
      else if (dlg.open) sizeObject();
    });
  };
  window.addEventListener('resize', update);
  if (window.screen.orientation) window.screen.orientation.addEventListener('change', update);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { if (dlg.open) checkPinch(); });
  function watchDpr() {
    matchMedia(`(resolution: ${dpr()}dppx)`).addEventListener('change', () => { update(); watchDpr(); }, { once: true });
  }
  watchDpr();
  // Another tab (the online ruler) may save a match.
  window.addEventListener('storage', (e) => { if (e.key === null || e.key === STORE_KEY) { store = loadStore(storage); update(); } });

  resolve();
  render();
  if (/[?&]debug\b/.test(location.search)) window.__ssc = { get state() { return state; }, get last() { return last; }, openCal, cal };
}
