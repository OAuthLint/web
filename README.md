# OAuthLint — website, rule catalogue & docs

The public website for **[OAuthLint](https://github.com/OAuthLint/oauthlint)** — a
static-analysis linter for the OAuth, OIDC, JWT, session, CORS and MCP
anti-patterns that AI coding tools ship by default.

This repository is the entire public web surface, served at **oauthlint.dev**:

- **Marketing** — the landing page, pricing, security, research and legal pages.
- **Rule catalogue** — every rule, searchable and filterable, generated from the
  open-source rule pack (`/rules`), with a vulnerable + safe example per rule.
- **Documentation** — the full product docs, served at `/docs`, with full-text
  search.

Built as one static [Astro](https://astro.build) site on the **Tracer** design
system.

<p>
  <img alt="Astro" src="https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="Biome" src="https://img.shields.io/badge/Biome-lint%20%2B%20format-60A5FA?logo=biome&logoColor=white">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green">
</p>

## Quick start

```bash
pnpm install     # installs deps + git hooks (lefthook)
pnpm dev         # http://localhost:4321
```

| Task              | Command             |
| ----------------- | ------------------- |
| Dev server        | `pnpm dev`          |
| Production build  | `pnpm build`        |
| Preview the build | `pnpm preview`      |
| Lint + format     | `pnpm lint` / `pnpm format` |
| Type-check        | `pnpm typecheck`    |
| Tests             | `pnpm test`         |
| Refresh rule data | `pnpm sync:rules`   |

## Project structure

```
src/
  pages/            Routes. Marketing pages render design partials via set:html;
    rules/          the rule catalogue + per-rule pages are data-driven.
    docs/           Documentation (Markdown), served at /docs.
  layouts/          Base (shell, SEO, theme, motion) + DocsLayout.
  components/       SiteChrome (nav + footer), AnnouncementBar.
  html/             Rendered design partials (marketing pages).
  styles/           tokens.css (the Tracer design tokens) + global.css.
  lib/              Rule loader, inline renderer, syntax highlighting.
  data/             Announcement, research figures.
vendor/oauthlint-rules/   Vendored snapshot of the OSS rule pack (see below).
public/             Static assets, the generated Semgrep bundles (r/*.yaml).
```

## Rule catalogue data

The catalogue and per-rule pages are generated at build time from a **vendored
snapshot** of the open-source [`oauthlint-rules`](https://github.com/OAuthLint/oauthlint)
pack — the rule YAML plus each rule's vulnerable/safe fixtures — under
`vendor/oauthlint-rules/`. This keeps the site a standalone, deploy-anywhere repo
with no build-time coupling to the CLI.

Refresh it after a rule release:

```bash
pnpm sync:rules   # pulls from the OSS repo and regenerates public/r/*.yaml
```

## Standards

| Concern            | Tooling                                             |
| ------------------ | --------------------------------------------------- |
| Language           | TypeScript (strict)                                 |
| Format + lint      | [Biome](https://biomejs.dev)                        |
| Commits            | [Conventional Commits](https://www.conventionalcommits.org) (commitlint) |
| Versioning         | [Semantic Versioning](https://semver.org) via [Changesets](https://github.com/changesets/changesets) |
| Git hooks          | [lefthook](https://lefthook.dev) (format, type-check, secret scan, tests) |
| Tests              | [Vitest](https://vitest.dev)                        |
| Docs search        | [Pagefind](https://pagefind.app) (static, build-time) |
| SEO                | JSON-LD, Open Graph, sitemap, `robots.txt`          |
| Accessibility      | Keyboard focus, reduced-motion, light + dark themes |

Git hooks run on every commit (format, type-check, secret scan) and push (tests);
CI re-runs them on Forgejo Actions.

## Deployment

Deployed as a static build to **Cloudflare Pages** at
[oauthlint.dev](https://oauthlint.dev). Documentation is served under `/docs`.

**Primary: [GitHub](https://github.com/OAuthLint/web)** · mirrored to a
self-hosted Forgejo instance for redundancy.

## Contributing

Issues and pull requests are welcome. Please follow the standards above — the
git hooks and CI enforce them. Every user-facing change should include a
changeset (`pnpm changeset`).

## License

[MIT](./LICENSE). The OAuthLint rule pack it consumes is likewise MIT.
