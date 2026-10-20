import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PLATFORM_LIVE, applyPlatformGate } from '../src/config';

// app.oauthlint.dev has NO DNS RECORD: a click does not get a 404, the
// connection fails. Those anchors were only CSS-hidden, which is the weaker
// half — "a hidden <a> is harmless" is true for a reader and false for a
// crawler, which still followed 2 dead links out of every page.
//
// Guarded on the SOURCE: CI runs `pnpm test:run` before `pnpm build`.
const read = (p: string) =>
  readFileSync(fileURLToPath(new URL(`../${p}`, import.meta.url)), 'utf8');

const pagesDir = fileURLToPath(new URL('../src/pages', import.meta.url));

/** Pages whose body is a captured HTML partial, so the gate has to run on them. */
const partialPages = readdirSync(pagesDir)
  .filter((f) => f.endsWith('.astro'))
  .map((f) => [f, readFileSync(`${pagesDir}/${f}`, 'utf8')] as const)
  .filter(([, src]) => /from '\.\.\/html\//.test(src));

describe('applyPlatformGate, on dead app anchors', () => {
  const planted =
    '<p>before</p>\n<a class="ol-cta" href="https://app.oauthlint.dev/signup">Start free</a>\n<p>after</p>';

  it.skipIf(PLATFORM_LIVE)('removes them before launch', () => {
    const out = applyPlatformGate(planted);
    expect(out).not.toContain('app.oauthlint.dev');
    // and takes ONLY the anchor: the surrounding content survives untouched
    expect(out).toContain('<p>before</p>');
    expect(out).toContain('<p>after</p>');
  });

  it.skipIf(!PLATFORM_LIVE)('keeps them once launched', () => {
    expect(applyPlatformGate(planted)).toContain('app.oauthlint.dev');
  });

  it('never touches an anchor pointing elsewhere', () => {
    const keep = '<a href="https://github.com/OAuthLint/oauthlint">GitHub</a>';
    expect(applyPlatformGate(keep)).toContain('github.com/OAuthLint/oauthlint');
  });

  it('stops at the first </a> and does not swallow what follows', () => {
    // An anchor cannot nest, so a non-greedy match is correct — but a GREEDY one
    // would eat everything up to the LAST </a> on the page. This is that guard.
    const two = '<a href="https://app.oauthlint.dev/login">Sign in</a><a href="/rules">Rules</a>';
    const out = applyPlatformGate(two);
    expect(out).not.toContain('app.oauthlint.dev');
    expect(out, 'the greedy-match bug swallowed the next anchor').toContain('href="/rules"');
  });
});

describe('the gate is actually wired', () => {
  it('finds the pages it is meant to check, so an empty sweep cannot pass', () => {
    expect(partialPages.length).toBeGreaterThanOrEqual(12);
  });

  it.each(partialPages)('%s passes its partial through the gate', (name, src) => {
    // Matching what set:html is actually FED, not the mere presence of the
    // identifier: `applyPlatformGate` also appears in comments, and a test that a
    // comment satisfies is worth nothing (that exact mistake shipped here once).
    //
    // Two legitimate shapes, so the check resolves one hop instead of pinning a
    // style: the call inline, or a const assigned from the call.
    const fed = src.match(/set:html=\{\s*([^}]+?)\s*\}/)?.[1];
    expect(fed, `${name} has no set:html at all`).toBeTruthy();
    const gated =
      /^applyPlatformGate\(\s*\w+\s*\)$/.test(fed as string) ||
      new RegExp(`const\\s+${fed}\\s*=\\s*applyPlatformGate\\(\\s*\\w+\\s*\\)`).test(src);
    expect(gated, `${name} renders its partial ungated (set:html={${fed}})`).toBe(true);
  });

  it('DocsLayout gates its two anchors on PLATFORM_LIVE', () => {
    const docs = read('src/layouts/DocsLayout.astro');
    expect(docs).toMatch(/PLATFORM_LIVE\s*&&/);
  });

  it('has exactly ONE known, deliberate exception left', () => {
    // After the chrome is gated, one link to the dead host survives on purpose:
    // step 1 of the Cloud get-started guide. De-linking it alone would be
    // cosmetic - the WHOLE page is a walkthrough of a product that has not
    // shipped, and that page's fate is a product call, not a link fix. It is
    // noindex since the indexing pass, so nothing advertises it.
    //
    // Pinned so the exception stays DELIBERATE: a second one fails this test
    // instead of quietly joining the first.
    const dir = fileURLToPath(new URL('../src', import.meta.url));
    const offenders: string[] = [];
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const full = `${d}/${e.name}`;
        if (e.isDirectory()) {
          walk(full);
        } else if (/\.(md|astro)$/.test(e.name)) {
          const body = readFileSync(full, 'utf8');
          // only count real links, not the comments that explain this very rule
          if (/href="https:\/\/app\.oauthlint\.dev|\]\(https:\/\/app\.oauthlint\.dev/.test(body)) {
            offenders.push(full.slice(dir.length + 1));
          }
        }
      }
    };
    walk(dir);
    expect(offenders.sort()).toEqual([
      'components/SiteChrome.astro', // gated by PLATFORM_LIVE above
      'layouts/DocsLayout.astro', // gated by PLATFORM_LIVE above
      'pages/docs/cloud/get-started.md', // the one deliberate exception
    ]);
    // Base.astro is absent on purpose and that is load-bearing: its occurrence is
    // the CSS backstop SELECTOR, `a[href^="https://app.oauthlint.dev"]`, which the
    // `href="` pattern above correctly does not match. If it ever shows up here,
    // someone turned the backstop into a real link.
  });

  it('SiteChrome gates its two anchors on PLATFORM_LIVE', () => {
    const chrome = read('src/components/SiteChrome.astro');
    expect(chrome).toMatch(/PLATFORM_LIVE\s*&&/);
    expect(chrome).toMatch(/import \{[^}]*PLATFORM_LIVE[^}]*\} from '\.\.\/config';/);
  });

  it.skipIf(PLATFORM_LIVE)('leaves no dead anchor in any gated partial', () => {
    const htmlDir = fileURLToPath(new URL('../src/html', import.meta.url));
    const offenders = readdirSync(htmlDir)
      .filter((f) => f.endsWith('.html'))
      .filter((f) =>
        applyPlatformGate(readFileSync(`${htmlDir}/${f}`, 'utf8')).includes('app.oauthlint.dev'),
      );
    expect(offenders, `still dead-linking: ${offenders.join(', ')}`).toEqual([]);
  });
});
