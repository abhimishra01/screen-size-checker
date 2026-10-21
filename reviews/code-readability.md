# Code review: readability lens (Kim, 2026-10-21)
Verdict: clear names and honest comments. 0 must-fix; 3 copy fixes made.

| Sev | File:line | Finding | Why | Fix |
|---|---|---|---|---|
| should (fixed) | src/pages/index.astro table | Header said "Width x height" but phone rows list the long side first (5.5 x 2.6), while the result says "Width 2.5, height 5.5". | Mixed terms. | "Long x short side (in/cm)", caption and intro updated. |
| should (fixed) | src/pages/index.astro how-to step 1 | Said "or Measure at the top of the page"; that button is hidden below 860 px. | Wrong on phones. | "... on a wide screen". |
| should (fixed) | src/components/Checker.astro facts, src/lib/screen.js summaryText | "pixels per inch" while the tool file asks for "rendered pixels per inch" (MacBook shows 255, Apple says 227). | A developer reads 255 as an error. | Hint and copy text now say rendered pixels per inch; unit test updated. |
| nice | src/lib/app.js | `objectName: 'credit card'` while the UI says bank card. | Same value the ruler writes; keep for the shared record. | Keep. |
No placeholder text on About, Privacy, Terms, FAQ or article. US spelling on the tool's own pages.
