# Screen Size Checker review summary (Kim, independent reviewer, 2026-10-21)

Lenses run per briefs/review-all.md: code-maintainer, code-minimalism, code-regression, code-readability, design-seo, customers (10 personas). Reports in this folder.

## Result
- Maths: correct. With an exact card fit, hand results match the page for 10 devices (Apple and Samsung specs, ISO/IEC 7810 card). Calibration file byte-identical to the online ruler; key `bm.calibration.v1`; other profiles and borrowed entries survive a save.
- Lighthouse local, re-run after the fixes: 100 / 100 / 100 / 100 mobile and desktop.
- Must-fix found per lens: maintainer 0, minimalism 0, regression 1, readability 0, design-seo 2, customers 2 (overlapping). All fixed.

## Fixes (all committed in the site folder)
| Finding | Severity | Commit |
|---|---|---|
| Size list gaps gave a wrong closest size (24.5 to 23.8, 5.8 to 6.1, 14.2 to 14) or a false "check the card match" (iPad 10.2) | High | e955477 |
| "My card matches" hidden below the panel on 390x664 and 375x667 phone windows | High | e955477 |
| Status chip looked like a button and did nothing (fake affordance) | Medium | e955477 |
| iPad got the side panel, so the card matched on its short side | Medium | e955477 |
| PPI not labelled as rendered pixels (tool-file rule) in grid and copy text | Medium | e955477 |
| Table shape labels disagreed with the facts grid; table "width x height" was really long x short | Medium | e955477 |
| No path for users without a card | Medium | e955477 |
| "Measure at the top of the page" wrong on phones; "not close" note blamed the user | Low | e955477 |
| Turned iPhone or iPad swapped width and height | Medium | 5648eba |
| Outline could be dragged off screen | Low | 5648eba |

New tests: 7 unit checks (68 total), 6 browser checks (41 total): short phone windows, touch tablet, turned phone.
Gates: `npm test`, `npm run build`, `npm run build:bingemind` (network and UI tests) all pass. Pages build has noindex.

## Panel scores (after fixes)
Dana 9, Marcus 8, Priya 8, Mr. Alvarez 8, Joan 8, Tyler 7, Sam 9, Aisha 8, Ben 8, Rosa 8. Average 8.1.

## Comparison
comparison/screen-size-checker.md: ours 61/80 (58 before fixes) vs myscreensize 46, whatismyscreenresolution.io 44, whatismyscreensize 42. Rivals still win speed to answer (they guess) and domain strength. Both are structural, so they were not chased.

## Open, not fixed (by design or for the owner)
- closestSize keeps a 4 percent window, not the spec's 0.3 in (a fixed 0.3 in misses large monitors). Deliberate.
- Safari page zoom cannot be detected (builder's note stands).
- Refresh rate: spec non-goal.
- Not live yet; on-glass test with a real card on a Mac, a Windows PC, an iPhone and an Android phone still needed.
