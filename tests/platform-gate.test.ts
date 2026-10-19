import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PLATFORM_LIVE, applyPlatformGate } from '../src/config';

// The hosted platform has not shipped, so the homepage must not show it. The
// screenshot in particular is a picture of a product nobody can sign up for:
// the CSS rule in Base.astro that hides the Cloud *links* would have left it in
// the page source, fetchable and indexable, which is why src/pages/index.astro
// strips these blocks at build time instead.
//
// This guards the transformation on its real input rather than on dist/, for
// two reasons: CI runs `pnpm test:run` BEFORE `pnpm build`, so dist/ does not
// exist yet; and the failure mode here is silent - the page builds and looks
// fine whether or not the gate is wired up.
const src = (name: string) =>
  readFileSync(fileURLToPath(new URL(`../src/${name}`, import.meta.url)), 'utf8');

/** The homepage exactly as index.astro renders it. */
const homepage = () => applyPlatformGate(src('html/index.html'));

/** Verbatim strings that live only inside a <!--platform-only--> block. */
const PLATFORM_ONLY = [
  '/img/overview-dark.png',
  '/img/overview-light.png',
  'Every repository, one view',
  'Run it yourself, or let us run it',
  'Need SSO, audit and an SLA',
  'Free for up to 10 contributors. No credit card',
];

describe('applyPlatformGate', () => {
  const html = [
    '<p>always</p>',
    '  <!--platform-only-->',
    '  <p>launched</p>',
    '  <!--/platform-only-->',
    '  <!--prelaunch-only-->',
    '  <p>waiting</p>',
    '  <!--/prelaunch-only-->',
  ].join('\n');

  it('keeps exactly one side and drops the other', () => {
    const out = applyPlatformGate(html);
    expect(out).toContain('always');
    expect(out).toContain(PLATFORM_LIVE ? 'launched' : 'waiting');
    expect(out).not.toContain(PLATFORM_LIVE ? 'waiting' : 'launched');
  });

  it('never leaks a marker into the page', () => {
    expect(applyPlatformGate(html)).not.toMatch(/<!--\/?(?:platform|prelaunch)-only-->/);
  });

  it('leaves an unclosed marker alone rather than eating the rest of the page', () => {
    expect(applyPlatformGate('<p>a</p><!--platform-only--><p>b</p>')).toContain('<p>b</p>');
  });
});

describe('homepage source', () => {
  // The gate is only worth anything if the page actually calls it. Without this
  // every assertion below would still pass on a page that renders the raw HTML.
  it('is rendered through the gate', () => {
    const page = src('pages/index.astro');
    // Matched as a CALL, not as the word: the file names applyPlatformGate in
    // its comment too, so `toContain` stayed green with the gate unwired.
    expect(page, 'index.astro no longer calls applyPlatformGate()').toMatch(
      /const\s+body\s*=\s*applyPlatformGate\(\s*rawBody\s*\)/,
    );
    expect(page, 'index.astro renders something other than the gated body').toMatch(
      /set:html=\{body\}/,
    );
  });

  it('still delimits the platform blocks', () => {
    const marked = src('html/index.html').match(/<!--platform-only-->/g) ?? [];
    expect(marked.length, 'the platform blocks lost their markers').toBe(3);
  });
});

describe('rendered homepage', () => {
  // Asserted on a boolean rather than the 50 KB document: `expect(html).not
  // .toContain(x)` prints the whole page on failure, which buries the one line
  // that matters under the minified inline scripts.
  it.skipIf(PLATFORM_LIVE).each(PLATFORM_ONLY)('does not ship %s before launch', (needle) => {
    expect(homepage().includes(needle), `the homepage still ships "${needle}"`).toBe(false);
  });

  it.skipIf(PLATFORM_LIVE)('shows the pre-launch sub-headline instead', () => {
    const shown = homepage().includes('Runs locally. Open source, MIT.');
    expect(shown, 'the pre-launch sub-headline is missing').toBe(true);
  });

  it.skipIf(!PLATFORM_LIVE).each(PLATFORM_ONLY)('ships %s once launched', (needle) => {
    expect(homepage().includes(needle), `the homepage dropped "${needle}"`).toBe(true);
  });

  it('never leaks a gate marker', () => {
    const leaked = /<!--\/?(?:platform|prelaunch)-only-->/.test(homepage());
    expect(leaked, 'a gate marker reached the rendered page').toBe(false);
  });
});
