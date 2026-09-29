---
layout: ../../../layouts/DocsLayout.astro
title: "Data and privacy"
description: "OAuthLint is local-first. Anything that leaves your machine does so because you chose a mode that needs it."
section: "cloud-data-privacy"
---

# Data and privacy

OAuthLint is local-first. Anything that leaves your machine does so because you chose a mode that needs it.

## What we see, by mode

| Mode | Your source code | Findings |
| --- | --- | --- |
| CLI, offline | Never leaves your machine | Stay on your machine |
| CLI, signed in | Never leaves your machine | Sent only when you upload them |
| Pull request checks | Changed files are read, then discarded | Stored, with their history |
| Self-hosted | Never leaves your infrastructure | Stored on your infrastructure |

## Code snippets

Snippets around a flagged line are off by default for the CLI. When they are sent, secrets are redacted first.

## Telemetry

Anonymous usage telemetry helps us see which rules fire. You can turn it off at any time.

## More detail

Permissions by provider, retention and how to report a vulnerability are on the [Security](https://oauthlint.dev/security) page.
