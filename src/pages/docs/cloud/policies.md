---
layout: ../../../layouts/DocsLayout.astro
title: "Policies"
description: "Choose which findings block a merge, across the organisation or per repository. A policy is the same whether you edit it as a form or as code."
section: "cloud-policies"
---

# Policies

Choose which findings block a merge, across the organisation or per repository. A policy is the same whether you edit it as a form or as code.

## What blocks a merge

Pick the severities that fail the status check. The default is critical and high.

<figure>
  <div class="docs-shot"><img class="docs-shot-img docs-shot-dark" src="/img/cloud/PRPolicy-dark.png" alt="Choosing which severities block a merge" loading="lazy" decoding="async"><img class="docs-shot-img docs-shot-light" src="/img/cloud/PRPolicy-light.png" alt="" aria-hidden="true" loading="lazy" decoding="async"></div>
  <figcaption>Choosing which severities block a merge.</figcaption>
</figure>

## Organisation and repository

The organisation policy applies everywhere. A repository can tighten it, never loosen it below what the organisation requires.

## Required rules and overrides

Mark rules as required so no repository can turn them off, or change a rule's severity for one repository.

## Policy as code

The same policy, as YAML you can review in a pull request:

```yaml
version: 1
block_on: [critical, high]
required:
  - auth.jwt.no-verification
  - auth.oauth.pkce-missing
repositories:
  payments-api:
    block_on: [critical, high, medium]
```
