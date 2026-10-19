import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
// @ts-check
import { defineConfig } from 'astro/config';
import { PLATFORM_LIVE } from './src/config';

// Static site for oauthlint.dev. Built into `dist/`, baked into the nginx image
// by Dockerfile, and served self-hosted on k3s behind a Cloudflare Tunnel - NOT
// Cloudflare Pages, which an earlier version of this comment claimed.

/**
 * Files under public/ that belong to the unshipped platform. Astro copies all
 * of public/ verbatim, so stripping the markup that REFERENCES a screenshot is
 * only half the job: /img/overview-dark.png answered 200 to anyone with the
 * URL long after the section itself was gone. An unreleased UI has to be
 * absent, not merely unlinked. Nothing is deleted from the repo - these come
 * back with PLATFORM_LIVE, same as the blocks in src/html/index.html.
 */
const PLATFORM_ASSETS = ['img/overview-dark.png', 'img/overview-light.png'];

/** @returns {import('astro').AstroIntegration} */
function gatePlatformAssets() {
  return {
    name: 'gate-platform-assets',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (PLATFORM_LIVE) return;
        for (const asset of PLATFORM_ASSETS) {
          await rm(fileURLToPath(new URL(asset, dir)), { force: true });
          logger.info(`withheld /${asset} (PLATFORM_LIVE is false)`);
        }
      },
    },
  };
}
export default defineConfig({
  site: 'https://oauthlint.dev',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap(), pagefind(), gatePlatformAssets()],
  markdown: {
    // Dual-theme highlighting for fenced code blocks, matching the fixture
    // highlighter in src/lib/highlight.ts. `defaultColor: false` emits both
    // `--shiki-light*` and `--shiki-dark*` CSS variables with no baked-in
    // color, so global.css can switch them on the site's [data-theme] toggle.
    // Without this, Astro's default single dark theme left light-mode code
    // blocks dark with faint, unreadable text.
    shikiConfig: {
      themes: { light: 'github-light-default', dark: 'github-dark-default' },
      defaultColor: false,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
});
