# Code review: maintainer lens (Kim, 2026-10-21)
Verdict: solid and small. Maths and storage are pure and tested; the DOM file is one readable module. 0 must-fix open (2 fixed).

| Sev | File:line | Finding | Why | Fix |
|---|---|---|---|---|
| should (fixed) | src/lib/app.js env() | iPhone and iPad Safari keep screen.width in portrait after a turn, so width and height and the shape drawing were swapped in landscape. | Wrong "Width 2.4 in, height 5.3 in" on a turned device. | Swap when screen.orientation says landscape and width < height. UI test 1d. Commit 5648eba. |
| should (fixed) | src/lib/app.js pointermove | Moving the outline was not clamped, so it could be dragged off screen and lost. | Only Turn card or reopening brought it back. | Keep 40 px on screen. Commit 5648eba. |
| nice | src/lib/app.js sizeObject | Window resize while the panel is open does not re-clamp the outline width. | Only matters when a window shrinks below the card size. | Leave. |
| nice | src/lib/app.js #fit | A new card match replaces a ruler profile that had `verified: true`. | Correct (a new match is not checked) but the ruler chip drops "checked". | Leave; documented here. |
| nice | scripts/e2e-lib.mjs | Browser tests bind ports 4953 to 4958. | Two agents running the gate at once can collide. | Leave; ports come from the tool file. |

Storage: calibration.js is byte-identical to sites/online-ruler/src/lib/calibration.js (diff clean). Same key `bm.calibration.v1`, same schema, other profiles and `borrowed` entries survive a save (unit test 11, UI test 3). Blocked storage works (UI test 4). No HTML injection: all output goes through textContent. Dependencies: astro, tailwind, sitemap only; playwright-core and wrangler are dev only.
Template leftovers (README, new-tool.sh, screenshots, build-date) are on the fixer's list.
