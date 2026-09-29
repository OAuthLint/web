# Security Policy — oauthlint.dev

This repository is the static marketing site + public rule catalogue for
OAuthLint. It ships no server and stores no user data.

## Reporting a vulnerability
Please do not open a public issue for security reports. Email
**security@oauthlint.dev** (see https://oauthlint.dev/.well-known/security.txt).
We acknowledge within 72 hours.

## Hygiene
- Secret scanning (gitleaks) + dependency review in CI.
- Pinned dependencies, static output, no third-party runtime beyond the fonts +
  optional privacy-first analytics.
