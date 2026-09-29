---
layout: ../../../layouts/DocsLayout.astro
title: "Connect the CLI"
description: "Link the CLI on your machine, or a CI job, to your organisation. Your code still never leaves your machine: only findings are sent, and only when you choose to."
section: "cloud-cli"
---

# Connect the CLI

Link the CLI on your machine, or a CI job, to your organisation. Your code still never leaves your machine: only findings are sent, and only when you choose to.

## Sign in from your terminal

```bash
npx oauthlint login
```

1. The CLI shows a short code and opens your browser.
2. Sign in if you are not already, and confirm the code matches.
3. Return to your terminal. The CLI is connected.

## Send findings

A connected CLI keeps scanning locally. Findings are sent to your organisation only when you upload them.

```bash
npx oauthlint scan ./src --upload
```

## In CI

Create a token scoped to one repository, with the least access it needs and an expiry date, and store it as a secret in your pipeline.

```bash
OAUTHLINT_TOKEN=*** npx oauthlint scan ./src --upload
```

## Sessions and tokens

Every connected machine, CI token and browser session is listed in your settings, with when it was last used. Revoke any of them in one click.
