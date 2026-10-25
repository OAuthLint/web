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
  it('Header and Footer gate platform CTAs under SHOW_CLOUD', () => {
    // The refactor replaced raw-HTML partials with Astro components. Platform
    // CTAs (Cloud nav link, DPA footer link) now render under {SHOW_CLOUD && …}
    // in Header.astro and Footer.astro instead of being stripped from raw HTML.
    const header = read('src/components/Header.astro');
    const footer = read('src/components/Footer.astro');
    expect(header).toMatch(/SHOW_CLOUD/);
    expect(footer).toMatch(/SHOW_CLOUD/);
  });

  it.each(partialPages)('%s passes its partial through the gate', (name, src) => {
    const fed = src.match(/set:html=\{\s*([^}]+?)\s*\}/)?.[1];
    expect(fed, `${name} has no set:html at all`).toBeTruthy();
    const gated =
      /^applyPlatformGate\(\s*\w+\s*\)$/.test(fed as string) ||
      new RegExp(`const\\s+${fed}\\s*=\\s*applyPlatformGate\\(\\s*\\w+\\s*\\)`).test(src);
    expect(gated, `${name} renders its partial ungated (set:html={${fed}})`).toBe(true);
  });

  it('DocsLayout has no dead links to app.oauthlint.dev', () => {
    // The componentisation removed the Sign-in/Start-free CTAs from DocsLayout
    // entirely — they moved to Header.astro where they are gated by SHOW_CLOUD.
    const docs = read('src/layouts/DocsLayout.astro');
    expect(docs).not.toMatch(/href="https:\/\/app\.oauthlint\.dev/);
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
    // After the componentisation, SiteChrome and DocsLayout no longer carry
    // app.oauthlint.dev links at all (the CTAs moved to Header/Footer and are
    // gated by SHOW_CLOUD). Only the cloud get-started guide still links there.
    expect(offenders.sort()).toEqual([
      'pages/docs/cloud/get-started.md', // the one deliberate exception
    ]);
    // Base.astro is absent on purpose and that is load-bearing: its occurrence is
    // the CSS backstop SELECTOR, `a[href^="https://app.oauthlint.dev"]`, which the
    // `href="` pattern above correctly does not match. If it ever shows up here,
    // someone turned the backstop into a real link.
  });

  it('SiteChrome itself has no dead links to app.oauthlint.dev', () => {
    // SiteChrome is now a thin wrapper around Header + Footer. The Header and
    // Footer components gate their platform CTAs under SHOW_CLOUD (tested above).
    const chrome = read('src/components/SiteChrome.astro');
    expect(chrome).not.toMatch(/href="https:\/\/app\.oauthlint\.dev/);
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
