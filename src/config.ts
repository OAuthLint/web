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
