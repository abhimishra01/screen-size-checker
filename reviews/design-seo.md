# Design and SEO review (Kim, 2026-10-21)
Lighthouse (local build, Chrome headless): mobile 100 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100 (perf, a11y, best practices, SEO). LCP 1.4 s mobile, 0.3 s desktop; CLS 0 / 0.006. Compression and cache flags come from the local python server, not the site.
Checked with playwright-cli at 1440 and 390 (iPhone 13 device, 664 px tall window), iPad 810x1080, light and dark. Every control clicked: header Measure, card Measure, -0.1/+0.1 mm, Turn card, grip drag, outline move, My card matches, Close, Escape, Forget this screen, Copy results, theme, Menu, FAQ.

| Sev | Area | Finding | Fix |
|---|---|---|---|
| must (fixed) | Phone UX | On a real phone window (390x664) "My card matches" sat below the 48dvh panel; the user had to scroll inside the panel to find the main action. | Notes move below the buttons on narrow screens. UI test 1b checks 390x664 and 375x667. |
| must (fixed) | Fake affordance | The status chip ("Not measured") had the same bordered 10 px look as the Measure button next to it, and did nothing on click. | Now a soft, borderless status pill. |
| should (fixed) | Tablet | At 810 px the iPad got the desktop side panel, which forced the card onto its short side (1.6x less precise). | Touch screens up to 1100 px get the bottom panel; card lies flat. UI test 1c. |
| should (fixed) | Content | No path for a user with no card at hand (only shown on narrow phones). | Panel note: "No card? Match a coin or a sheet of paper in the online ruler." |
| should (fixed) | Consistency | Table shape labels did not match the facts grid. | One source (aspect().short). |
| nice | Hierarchy | At 1440 the status shows twice (header and card). | Keep: header is global, card is local. |
SEO: title 49 chars, description 146, one H1, clean H2 outline, JSON-LD WebApplication + FAQPage (8) + BreadcrumbList parse, no aggregateRating, canonical, OG image, about 1,800 words with worked example and size table, internal links to ruler, poster tiler, DPI changer, hub. Contact and terms noindex and out of the sitemap.
