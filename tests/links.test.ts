import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// src/html/*.html are the captured design partials. The capture carried over the
// design tool's own FILENAMES as hrefs - `DocsSelfhost.dc.html` shipped on
// /pricing as a visible "Self-host guide" button and 404'd, for months, on a
// page that is in sitemap-0.xml. A relative href in a partial is never right
// here: the partial is inlined into an Astro route whose URL has nothing to do
// with the file it came from, so the browser resolves it against the ROUTE and
// lands nowhere.
//
// This is guarded on the SOURCE, not on dist/ or on the live site: CI runs
// `pnpm test:run` before `pnpm build`, and a crawl cannot run in CI at all.
const htmlDir = fileURLToPath(new URL('../src/html', import.meta.url));

const partials = readdirSync(htmlDir)
  .filter((f) => f.endsWith('.html'))
  .map((f) => [f, readFileSync(`${htmlDir}/${f}`, 'utf8')] as const);

/** Schemes and shapes a partial may legitimately link to. */
const ANCHORED = /^(?:\/|https?:\/\/|\/\/|mailto:|tel:|#|data:)/;

const hrefsOf = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

describe('the captured HTML partials', () => {
  it('ship at least one partial with links, so an empty sweep cannot pass', () => {
    expect(partials.length).toBeGreaterThan(0);
    expect(partials.some(([, html]) => hrefsOf(html).length > 0)).toBe(true);
  });

  it.each(partials)('%s has no relative href', (name, html) => {
    const relative = hrefsOf(html).filter((h) => !ANCHORED.test(h));
    expect(relative, `${name} links to ${relative.join(', ')}`).toEqual([]);
  });

  it('matches a relative href when one is present (positive control)', () => {
    // Proves the sweep above is not vacuous: the same predicate, fed the exact
    // shape that shipped broken, has to flag it.
    const planted = '<a href="DocsSelfhost.dc.html">Self-host guide</a>';
    expect(hrefsOf(planted).filter((h) => !ANCHORED.test(h))).toEqual(['DocsSelfhost.dc.html']);
  });

  it('points the pricing self-host button at the real route', () => {
    const pricing = partials.find(([n]) => n === 'pricing.html')?.[1] ?? '';
    expect(pricing).toContain('href="/docs/self-host"');
    expect(pricing).not.toContain('DocsSelfhost');
  });
});
