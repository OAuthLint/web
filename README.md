# oauthlint.dev — website + rule catalogue

The OAuthLint public website — **marketing, the public rule catalogue, and the
documentation** — in one static Astro site (design system **"Tracer"**), deployed
to Cloudflare Pages at [oauthlint.dev](https://oauthlint.dev). Docs are served at
`/docs`; full-text docs search is powered by Pagefind (static, build-time).

## Develop
```bash
pnpm install
pnpm dev            # http://localhost:4321
```

## Standards
- **Astro** static output · **TypeScript** strict · **Biome** (format + lint)
- **Conventional Commits** (commitlint) · **Changesets** (SemVer) · **lefthook** hooks
- **Vitest** tests · SEO (JSON-LD, OG, sitemap, robots) · a11y · dark/light themes

## Rule catalogue data
The catalogue and per-rule pages are generated from a **vendored snapshot** of the
OSS `oauthlint-rules` pack under `vendor/oauthlint-rules/` (rule YAML + fixture
examples). Refresh it after a rule release:
```bash
pnpm sync:rules     # pulls from ../oauthlint/rules, regenerates public/r/*.yaml
```

## Layout
- `src/pages/` — routes. Marketing pages render design partials from `src/html/`
  via `set:html`; `rules/` is data-driven from `src/lib/rules.ts`.
- `src/components/SiteChrome.astro` — shared nav + footer. `src/layouts/Base.astro`
  — the shell (SEO, theme, restored interactivity).
- `src/styles/tokens.css` — the Tracer design tokens (source of truth).

## Deploy
Forgejo-primary (`git.auspeo.com`), push-mirrored to GitHub. CI builds on Forgejo
Actions and publishes `dist/` to Cloudflare Pages.

License: MIT.
