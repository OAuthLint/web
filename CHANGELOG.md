# oauthlint-web

## 0.1.0

The first public release of the OAuthLint website — the marketing site, the public
rule catalogue, and the documentation, unified into one static Astro site on the
"Tracer" design system.

### Added

- **Marketing** — landing, pricing, security, research, about, system status,
  changelog, and legal pages (Terms, Privacy, DPA, disclosure), pixel-perfect on
  the Tracer design system in both light and dark themes.
- **Public rule catalogue** — every rule, searchable and filterable by language,
  category, severity and dataflow (taint) mode; each rule ships a vulnerable and a
  safe example with CWE/OWASP mappings. Generated from a vendored snapshot of the
  open-source rule pack, with no monorepo coupling.
- **Documentation** at `/docs` — getting started, the OAuthLint Cloud guides, CLI
  reference and integrations, with a collapsible sidebar, on-this-page navigation,
  and full-text search (Pagefind).

### Engineering

- One static Astro site, TypeScript (strict), Biome, Conventional Commits,
  Changesets, lefthook git hooks, Vitest (64 tests), SEO (JSON-LD, Open Graph,
  sitemap), accessibility and dark/light themes. GitHub Actions CI. GitHub is
  primary; a self-hosted Forgejo instance mirrors it.
