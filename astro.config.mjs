import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { rm } from 'node:fs/promises';
import site from './src/site.config.ts';

const bingemind = site.bingemind;
// The Bingemind root owns robots.txt, so this mode does not emit one.
// It also owns ads.txt, so the tool's own copy would sit at the wrong address.
const dropRoot = { name: 'drop-root-files', hooks: { 'astro:build:done': async ({ dir }) => {
  if (bingemind) for (const f of ['robots.txt', 'ads.txt']) await rm(new URL(f, dir), { force: true });
} } };

// Contact and Terms are thin pages with noindex, so they stay out of the sitemap.
const noindexFilter = (page) => !/\/(contact|terms)\/$/.test(page);

export default defineConfig({
  // GitHub Pages builds set PAGES_BASE=/<slug>/ and PAGES_SITE=https://<user>.github.io.
  site: bingemind ? 'https://bingemind.com' : process.env.PAGES_SITE || 'https://bingemind.com',
  base: bingemind ? `/screen-size-checker/` : process.env.PAGES_BASE || '/',
  outDir: bingemind ? 'dist-bingemind' : 'dist',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  // Only the Bingemind build is indexed, so only it gets a sitemap (its URLs match the canonical links).
  integrations: bingemind ? [sitemap({ filter: noindexFilter }), dropRoot] : [dropRoot],
  vite: { plugins: [tailwindcss()] },
});
