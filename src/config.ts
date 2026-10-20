/**
 * Site feature flags.
 *
 * PLATFORM_LIVE gates every call-to-action that points at OAuthLint Cloud /
 * the hosted platform (Sign in, Start free, Pricing, and the "OAuthLint Cloud"
 * docs section). It is `false` until the platform ships: the CTAs and the Cloud
 * docs are HIDDEN (not deleted). Flip it to `true` to restore all of them in one
 * place — nothing else needs to change.
 */
export const PLATFORM_LIVE = false;

/**
 * True for a route that only makes sense once OAuthLint Cloud has shipped.
 *
 * The list is not a guess: each one of these pages describes the hosted product
 * in its own body text. `/status` reports uptime for workers that do not run,
 * `/dpa` is a GDPR Article 28 agreement for data nobody processes yet, and
 * `/docs/self-host` sits under the "OAuthLint Cloud" docs group and tells the
 * reader to `git clone github.com/oauthlint/cloud` - a repository that returns
 * 404 today.
 *
 * Named to match the helper the in-flight docs/site redesign already carries,
 * so the two converge instead of growing a second vocabulary for the same idea.
 */
export function isCloudPath(path: string): boolean {
  const pathname = path.replace(/\/+$/, '') || '/';
  return (
    pathname === '/docs/cloud' ||
    pathname.startsWith('/docs/cloud/') ||
    ['/cloud', '/pricing', '/status', '/dpa', '/docs/self-host'].includes(pathname)
  );
}

/**
 * Whether a route may be offered to search engines.
 *
 * ⚠️ This closes a CONTRADICTION in this file, not a product choice. The comment
 * above says PLATFORM_LIVE keeps Pricing and the Cloud docs HIDDEN, and
 * applyPlatformGate's own docstring below spells out why hiding is not enough:
 * something "would still sit in the page source, still be fetched, and still be
 * indexable". Yet Base.astro emitted `robots: index,follow` on EVERY page and
 * the sitemap listed all of them - 13 of the 320 URLs in sitemap-0.xml pointed
 * at the unshipped platform, including fabricated uptime figures on /status.
 *
 * So the pages stay reachable by URL (nothing is deleted, nothing 404s) but they
 * are no longer ADVERTISED. Flip PLATFORM_LIVE and they are advertised again,
 * with no other change.
 */
export function isIndexablePath(path: string): boolean {
  const pathname = path.replace(/\/+$/, '') || '/';
  if (pathname === '/404') return false;
  return PLATFORM_LIVE || !isCloudPath(pathname);
}

/**
 * Removes the blocks of a raw HTML partial that must not ship in this build.
 *
 * The marketing pages are captured HTML imported with `?raw`, so an Astro
 * conditional cannot reach inside them. Blocks that belong to one side of the
 * launch are delimited in the source file instead:
 *
 *   <!--platform-only-->  ... shipped only once the platform is live ...  <!--/platform-only-->
 *   <!--prelaunch-only--> ... shipped only until it is ...               <!--/prelaunch-only-->
 *
 * Exactly one of the two is deleted AT BUILD TIME, so the other never reaches
 * the browser. That is deliberately stronger than the `body.platform-prelaunch`
 * CSS rule in Base.astro, and the two are not interchangeable: a hidden <a> is
 * harmless, but a screenshot of a product nobody can sign up for would still
 * sit in the page source, still be fetched, and still be indexable. A picture
 * of an unreleased UI has to be absent, not invisible.
 *
 * Nothing is removed from the source file - flip PLATFORM_LIVE above and every
 * block comes back, in one place, with no other change.
 */
export function applyPlatformGate(html: string): string {
  const drop = PLATFORM_LIVE ? 'prelaunch-only' : 'platform-only';
  const block = new RegExp(`[ \\t]*<!--${drop}-->[\\s\\S]*?<!--/${drop}-->[ \\t]*\\r?\\n?`, 'g');
  // The surviving side keeps its content but loses its delimiters: the markers
  // are build instructions, not page content, and have no business shipping.
  const marker = /[ \t]*<!--\/?(?:platform|prelaunch)-only-->[ \t]*\r?\n?/g;
  return html.replace(block, '').replace(marker, '');
}
