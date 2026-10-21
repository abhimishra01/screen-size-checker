# Code review: minimalism lens (Kim, 2026-10-21)
Verdict: lean. JS 15.6 KB unminified-equivalent bundle, CSS 6 KB tool + 20 KB base. 0 must-fix.

| Sev | File:line | Finding | Why | Fix |
|---|---|---|---|---|
| should (fixed) | src/lib/app.js placeObject | Unused `const s = spec()`. | Dead code. | Removed. Commit e955477. |
| should (fixed) | src/lib/sizes.js | Hand-typed `ratioLabel` strings duplicated what `aspect()` computes, and disagreed with it ("about 10:7" in the table, "1.44:1" in the facts). | Two sources of truth. | Rows now hold `px`; the table label comes from `aspect().short`. Commit e955477. |
| nice | src/lib/screen.js chipFor | Overlaps `statusFor` in calibration.js. | Different words on purpose ("Measured" vs "Calibrated"); calibration.js must stay verbatim. | Keep. |
| nice | src/lib/screen.js NAMED_RATIOS | 18:9 added beyond the spec list. | Harmless; common on Android. | Keep. |
