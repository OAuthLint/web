# Releasing the website

The site is versioned with [Changesets](https://github.com/changesets/changesets)
(Semantic Versioning) and released from `main` on GitHub (the primary remote;
Forgejo mirrors it). A release is a git tag + a GitHub release + a Cloudflare
Pages deploy.

## Every change

Add a changeset for anything user-facing:

```bash
pnpm changeset          # pick patch / minor / major, describe the change
```

## Cutting a release

1. **Version.** Consume the pending changesets — bumps `package.json` and writes
   `CHANGELOG.md`:
   ```bash
   pnpm version:packages   # changeset version
   ```
2. **Verify.** `pnpm lint && pnpm typecheck && pnpm test:run && pnpm build`.
3. **Commit + tag** on `main`:
   ```bash
   git commit -am "release: web vX.Y.Z"
   git tag vX.Y.Z && git push origin main --tags
   ```
4. **GitHub release** on the `vX.Y.Z` tag, marked `--latest`. Follow the notes
   convention below.
5. **Deploy** — Cloudflare Pages builds `main` (or `wrangler pages deploy dist`).

## Release-notes convention

Mirror the OAuthLint repo: concise, linked, human. One release per version tag.

- **Title:** `OAuthLint Website X.Y.Z`
- A one-line **bold summary** of the release.
- **`### Added` / `### Changed` / `### Fixed`** sections (only the ones that apply).
- A closing links line: the live site, the rules catalogue, and the
  `Full changelog: …/compare/vA.B.C...vX.Y.Z` compare link.

Keep prose human (no em-dashes); prefer periods, colons and parentheses.
