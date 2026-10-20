import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PLATFORM_LIVE, isCloudPath, isIndexablePath } from '../src/config';

// src/config.ts promises that PLATFORM_LIVE keeps Pricing and the Cloud docs
// HIDDEN, and applyPlatformGate's docstring spells out why hiding is not enough:
// something "would still sit in the page source, still be fetched, and still be
// indexable". Base.astro contradicted both by emitting `index,follow` on every
// page, and the sitemap listed all of them - 13 of 320 URLs, including /status
// with its invented uptime figures.
//
// Guarded on the SOURCE: CI runs `pnpm test:run` before `pnpm build`, so there
// is no dist/ to read and no live site to crawl.
const src = (name: string) =>
  readFileSync(fileURLToPath(new URL(`../${name}`, import.meta.url)), 'utf8');

/** Every route whose body text describes the unshipped hosted product. */
const CLOUD = [
  '/pricing',
  '/status',
  '/dpa',
  '/docs/self-host',
  '/cloud',
  '/docs/cloud',
  '/docs/cloud/get-started',
  '/docs/cloud/cli',
  '/docs/cloud/triage',
  '/docs/cloud/reports',
  '/docs/cloud/team',
  '/docs/cloud/policies',
  '/docs/cloud/integrations',
  '/docs/cloud/pull-requests',
  '/docs/cloud/data-privacy',
];

/** Routes that must stay indexable whatever the flag says. */
const PUBLIC = ['/', '/docs', '/rules', '/security', '/about', '/changelog', '/research'];

describe('isCloudPath', () => {
  it.each(CLOUD)('classes %s as a platform route', (p) => {
    expect(isCloudPath(p)).toBe(true);
  });

  it.each(CLOUD)('is insensitive to the trailing slash on %s', (p) => {
    expect(isCloudPath(`${p}/`)).toBe(true);
  });

  it.each(PUBLIC)('leaves %s alone', (p) => {
    expect(isCloudPath(p)).toBe(false);
  });

  it('does not swallow a lookalike prefix', () => {
    // `/docs/cloudy` must NOT match: a startsWith on '/docs/cloud' without the
    // slash would have de-indexed it, which is the classic prefix bug.
    expect(isCloudPath('/docs/cloudy')).toBe(false);
    expect(isCloudPath('/pricing-faq')).toBe(false);
  });
});

describe('isIndexablePath', () => {
  it.skipIf(PLATFORM_LIVE).each(CLOUD)('withholds %s before launch', (p) => {
    expect(isIndexablePath(p)).toBe(false);
  });

  it.skipIf(!PLATFORM_LIVE).each(CLOUD)('offers %s once launched', (p) => {
    expect(isIndexablePath(p)).toBe(true);
  });

  it.each(PUBLIC)('always offers %s', (p) => {
    expect(isIndexablePath(p)).toBe(true);
  });

  it('never offers the 404 page', () => {
    expect(isIndexablePath('/404')).toBe(false);
    expect(isIndexablePath('/404/')).toBe(false);
  });
});

describe('the two places that must consume it', () => {
  it('Base.astro emits robots from isIndexablePath, not a constant', () => {
    const base = src('src/layouts/Base.astro');
    expect(base, 'Base.astro still hard-codes index,follow').not.toMatch(/content="index,follow"/);
    expect(base, 'Base.astro does not call isIndexablePath for robots').toMatch(
      /isIndexablePath\(\s*Astro\.url\.pathname\s*\)\s*\?\s*'index,follow'/,
    );
  });

  it('the sitemap integration is filtered', () => {
    const cfg = src('astro.config.mjs');
    expect(cfg, 'sitemap() is not filtered').toMatch(
      /sitemap\(\s*\{\s*filter:\s*\(page\)\s*=>\s*isIndexablePath\(/,
    );
  });
});
