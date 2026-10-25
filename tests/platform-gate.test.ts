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
  // The "Three steps, no configuration." flow, gated 2026-10-20. Its HEADLINE is
  // true of the CLI ("no install, no config, no account" — docs/index.md) so it
  // stays on both sides; the three steps and the sub-line were not. "Nothing to
  // write, nothing to maintain" in particular is FALSE for the CLI, where you do
  // write a CI step.
  'Nothing to write, nothing to maintain',
  'The first scan starts right away',
  'Findings land as review comments on the exact line',
  'The status check fails until the finding is fixed or ignored with a reason',
];

/**
 * Strings that ship ONLY before launch, each one sourced from the project's own
 * docs rather than written for the occasion — src/pages/docs/index.md, sections
 * "Run your first scan", "Read a finding", "Fail CI on real issues".
 */
const PRELAUNCH_ONLY = [
  'npx oauthlint scan ./src',
  'Run your first scan',
  'Read a finding',
  'Fail CI on real issues',
  '--fail-on HIGH',
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

describe('the "Three steps" flow', () => {
  // The platform version of this section described a product nobody can use:
  // "Connect once and every change is checked. Nothing to write, nothing to
  // maintain" is the hosted pitch, and it is FALSE of the shipped CLI. Deleting
  // it outright would have left the homepage with no "how it works" at all, so
  // the prelaunch side says what the CLI actually does, in the words the docs
  // already use.
  it.skipIf(PLATFORM_LIVE).each(PRELAUNCH_ONLY)('ships %s before launch', (needle) => {
    expect(homepage()).toContain(needle);
  });

  it.skipIf(!PLATFORM_LIVE).each(PRELAUNCH_ONLY)('withholds %s once launched', (needle) => {
    expect(homepage()).not.toContain(needle);
  });

  it('keeps the headline on BOTH sides, because it is true of both', () => {
    // "no configuration" holds for the CLI too, so this one is not gated. If it
    // ever disappears, the section lost its heading on one side.
    expect(homepage()).toContain('Three steps, no configuration.');
  });

  it('shows the flow exactly once, never both versions at once', () => {
    const out = homepage();
    expect(out.split('Three steps, no configuration.').length - 1).toBe(1);
  });
});

describe('homepage source', () => {
  // The gate is only worth anything if the page actually calls it. Without this
  // every assertion below would still pass on a page that renders the raw HTML.
  it('is rendered through the gate', () => {
    // The componentisation rewrote index.astro as a full Astro component that
    // no longer imports raw HTML. The platform Cloud section is now an Astro
    // conditional: {SHOW_CLOUD && <section>…</section>}. The contract is the
    // same — platform content only ships when SHOW_CLOUD is true — the mechanism
    // changed from applyPlatformGate to an Astro conditional.
    const page = src('pages/index.astro');
    expect(page, 'index.astro lost its SHOW_CLOUD import').toContain('SHOW_CLOUD');
    expect(page, 'index.astro cloud section is not gated by SHOW_CLOUD').toMatch(
      /\{SHOW_CLOUD\s*&&/,
    );
  });

  it('still delimits the platform blocks', () => {
    // Pinned on purpose, and it earned its keep: adding the "Three steps" pair
    // on 2026-10-20 made this test fail at 4-vs-3, which is exactly the signal
    // wanted — a block cannot appear or vanish here unnoticed.
    //   1. the dashboard screenshot        2. the "Run it yourself" plan cards
    //   3. the signup sub-headline         4. the "Three steps" platform flow
    const marked = src('html/index.html').match(/<!--platform-only-->/g) ?? [];
    expect(marked.length, 'the platform blocks lost their markers').toBe(4);
  });

  it('pairs every marker it opens', () => {
    const page = src('html/index.html');
    for (const kind of ['platform', 'prelaunch']) {
      const open = (page.match(new RegExp(`<!--${kind}-only-->`, 'g')) ?? []).length;
      const close = (page.match(new RegExp(`<!--/${kind}-only-->`, 'g')) ?? []).length;
      expect(close, `${kind}-only has ${open} open and ${close} close markers`).toBe(open);
    }
  });
});

describe('public assets', () => {
  // Stripping the markup that references a screenshot is only half the job:
  // Astro copies public/ verbatim, so /img/overview-dark.png answered 200 to
  // anyone with the URL long after the section was gone. The build integration
  // in astro.config.mjs withholds them; this guards that it stays wired.
  it('withholds the platform screenshots from the build', () => {
    const config = readFileSync(
      fileURLToPath(new URL('../astro.config.mjs', import.meta.url)),
      'utf8',
    );
    expect(config, 'the gate integration is not registered').toMatch(
      /integrations:\s*\[[^\]]*gatePlatformAssets\(\)/,
    );
    for (const asset of ['img/overview-dark.png', 'img/overview-light.png']) {
      expect(config, `${asset} is no longer gated`).toContain(asset);
    }
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
