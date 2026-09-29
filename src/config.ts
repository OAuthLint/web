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
