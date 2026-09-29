---
layout: ../../../layouts/DocsLayout.astro
title: "Pull request checks"
description: "Every pull or merge request is scanned. Findings appear as review comments on the exact line, and a status check blocks the merge when a finding meets your policy."
section: "cloud-pull-requests"
---

# Pull request checks

Every pull or merge request is scanned. Findings appear as review comments on the exact line, and a status check blocks the merge when a finding meets your policy.

## What you see in a pull request

- A review comment on the flagged line, with the rule, why it matters and the fix as a suggested change.
- A status check, `OAuthLint`, that passes or fails.
- A summary of what the change introduced and what it fixed.

<figure>
  <div class="docs-shot"><img class="docs-shot-img docs-shot-dark" src="/img/cloud/PullRequest-dark.png" alt="A pull request blocked by a critical finding" loading="lazy" decoding="async"><img class="docs-shot-img docs-shot-light" src="/img/cloud/PullRequest-light.png" alt="" aria-hidden="true" loading="lazy" decoding="async"></div>
  <figcaption>A pull request blocked by a critical finding.</figcaption>
</figure>

## Unblock a merge

The check clears as soon as the blocking findings are fixed, or ignored with a reason by someone allowed to. Push the fix and the scan runs again.

## One product, four providers

| Provider | Change is called | Blocking uses |
| --- | --- | --- |
| GitHub | Pull request | A required status check |
| GitLab | Merge request | A pipeline status |
| Bitbucket | Pull request | A merge check |
| Azure DevOps | Pull request | A branch policy |
