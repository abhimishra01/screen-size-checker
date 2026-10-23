// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
const cfg = {
  name: 'Screen Size Checker',         // shown in header, title, footer
  domain: 'bingemind.com',              // the live address is the Bingemind one below
  cloudflareProject: 'screen-size-checker',    // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'screen size checker',              // main keyword: goes in the H1 and title
  keywords: ['what is my screen size', 'what size is my monitor', 'what size is my laptop screen', 'measure screen size online', 'screen size in inches', 'monitor size checker'],
  tagline: 'Instant estimate, exact with a card', // short line shown in the page
  description:
    'See your screen size in inches and cm the moment the page loads. It is an estimate from your pixels. Match a bank card for the exact size. Free.',
  ga4: '',                              // GA4 measurement ID. Empty = Google Analytics off
  adsense: '',                          // AdSense publisher ID. Empty = ads off
  brand: '#047857',                     // brand color (emerald; no other tool uses this hue)
  skin: 'minimal',                      // look: 'minimal', 'swiss', 'clay' or 'retro'
  locale: 'en-US',                      // BCP 47 language tag
  ogImage: '/og.png',                   // 1200x630 file in public/
  category: 'UtilitiesApplication',     // schema.org applicationCategory
  owner: 'Screen Size Checker',                // name used in legal pages
};

// Bingemind mode (SITE_MODE=bingemind): the tool lives at bingemind.com/screen-size-checker/.
// Canonical links always name that address. Legal pages name Bingemind as the owner.
const bingemind = process.env.SITE_MODE === 'bingemind';
export default {
  ...cfg,
  domain: 'bingemind.com/screen-size-checker',
  origin: 'https://bingemind.com/screen-size-checker',
  bingemind,
  owner: bingemind ? 'Bingemind (Abhishek Mishra)' : cfg.owner,
  // Every build uses the Bingemind contact page, as the other Bingemind tools do. No email address is shown.
  contactWord: 'Contact',
  contactHref: 'https://bingemind.com/#contact',
  contactLabel: 'bingemind.com/#contact',
};
