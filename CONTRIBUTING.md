# Contributing to the OAuthLint website

Thanks for helping improve [oauthlint.dev](https://oauthlint.dev). This repo is the
marketing site, the public rule catalogue, and the documentation — one static
[Astro](https://astro.build) site.

## Getting started

```bash
pnpm install     # also installs the git hooks (lefthook)
pnpm dev         # http://localhost:4321
```

## Making a change

1. **Branch** off `main` (`feat/…`, `fix/…`, `docs/…`).
2. **Develop** and keep it green: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
   The git hooks run format + type-check + a secret scan on commit and tests on push.
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org)
   (`feat`, `fix`, `docs`, `chore`, `ci`, `refactor`, `test`, `perf`). Commitlint enforces this.
4. **Add a changeset** for any user-facing change: `pnpm changeset`.
5. **Open a pull request.** CI (GitHub Actions) re-runs lint, type-check, tests and build.

## What goes where

| Change                         | Where                                             |
| ------------------------------ | ------------------------------------------------- |
| Marketing copy / layout        | `src/html/*.html` (rendered design partials)      |
| Documentation                  | `src/pages/docs/**.md`                             |
| Rule catalogue / per-rule page | `src/pages/rules/*.astro` (data-driven)           |
| Design tokens                  | `src/styles/tokens.css` (change values with care) |

## Rule data

The rule catalogue is generated from a vendored snapshot of the open-source rule
pack under `vendor/oauthlint-rules/`. Don't edit rules here — they live in
[`OAuthLint/oauthlint`](https://github.com/OAuthLint/oauthlint). Refresh the
snapshot with `pnpm sync:rules`.

## Standards

TypeScript strict · [Biome](https://biomejs.dev) · Conventional Commits ·
[Changesets](https://github.com/changesets/changesets) (SemVer) ·
[lefthook](https://lefthook.dev) · [Vitest](https://vitest.dev). Accessibility
(keyboard focus, reduced motion) and both light + dark themes are non-negotiable.

By contributing you agree your work is licensed under the repository's
[MIT license](./LICENSE) and to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).
