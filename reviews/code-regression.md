# Code review: regression lens (Kim, 2026-10-21)
Verdict: the maths is right. Hand results match the page for 10 devices. 1 must-fix found and fixed (size list gaps gave wrong "closest size" and a false "check your match").

## Hand recomputation (perfect card match, page result in brackets)
Formula: devPxPerMm = cssW / 85.6 x DPR; side mm = CSS px x DPR / devPxPerMm; diagonal = hypot / 25.4.
| Device (source) | Pixels, density | Hand | Page |
|---|---|---|---|
| iPhone 13 (Apple tech specs: 2532x1170, 460 ppi) | 18.11 px/mm | 140.0 x 64.7 mm, 6.06 in | 6.1 in, 460 PPI |
| iPhone 11 Pro (Apple: 2436x1125, 458 ppi) | 18.03 px/mm | 5.86 in | 5.9 in, closest 5.8 after fix (was 6.1) |
| MacBook Air M1 (Apple: 2560x1600, 227 ppi; default 1440x900 at DPR 2) | rendered 2880 px over 286.4 mm | 13.30 in, 255 rendered PPI | 13.3 in, 255 PPI |
| 15.6 in 1080p at Windows 125% (1536x864, DPR 1.25) | 5.559 px/mm | 15.6 in, 141 PPI | 15.6 in, 141 PPI |
| 27 in 1440p | 4.283 px/mm | 27.0 in, 109 PPI | 27.0 in, 109 PPI |
| 24.5 in 1080p gaming | 3.540 px/mm | 24.5 in, 90 PPI | 24.5 in; closest 24.5 after fix (was 23.8) |
| iPad 7th gen (Apple: 2160x1620, 264 ppi) | 10.39 px/mm | 10.2 in | 10.2 in; closest 10.2 after fix (was "not close, check the card match") |
| Galaxy S23 Ultra (Samsung: 3088x1440, about 500 ppi) | 19.69 px/mm | 6.8 in | 6.8 in; closest 6.8 after fix (was 6.9) |
| Card round trip (ISO/IEC 7810 ID-1: 85.60 x 53.98 mm) | 323.5 CSS px at DPR 1 | 3.779 px/mm, 96 px/in | unit test |
| Zoom 125% in Chrome | 1536x864 @1.25 vs 1280x720 @1.5 | same diagonal | unit test |

| Sev | File:line | Finding | Why | Fix |
|---|---|---|---|---|
| must (fixed) | src/lib/sizes.js | 5.8, 6.5, 6.8 phones, 10.2 tablet, 14.2 and 16.2 laptops, 24.5 monitors were missing. | Wrong closest size, and an iPad 10.2 got "not close to a common size. Check the card match". | Added rows and tests. Commit e955477. |
| should (fixed) | src/lib/app.js r-note | "Not close" message blamed the user's match. | Rare sizes exist. | New text: "not close to a size in our list ... this can be right". |
| nice | src/lib/screen.js closestSize | 4 percent window, spec says 0.3 in. | A fixed 0.3 in misses large monitors (49 in measures about 48.5). Recorded as a deliberate deviation. | Keep 4 percent. |
| nice | src/lib/screen.js aspect | 2560x1664 shows "20:13 (1.54:1)"; spec example said "about 16:10". 16:10 is 3.9 percent off, so the code follows the spec's own 2 percent rule. Table now shows "1.54:1", so both agree. | | Keep. |

Template rules: canonical https://bingemind.com/screen-size-checker/ on both builds; Pages build has `noindex, follow` (checked with PAGES_BASE/PAGES_SITE); `_headers` noindex for *.pages.dev; privacy, terms, about, contact linked; 404.html built; sitemap has tool, about, privacy only; no GA or AdSense code when the IDs are empty. Network test: no request while measuring.
