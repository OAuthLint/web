---
layout: ../../../layouts/DocsLayout.astro
title: "Triage findings"
description: "Decide what each finding is: fix it, assign it, or ignore it with a reason. Every decision is recorded."
section: "cloud-triage"
---

# Triage findings

Decide what each finding is: fix it, assign it, or ignore it with a reason. Every decision is recorded.

## Read a finding

A finding shows the flagged code, why it matters, the references, and the suggested fix as a diff.

<figure>
  <div class="docs-shot"><img class="docs-shot-img docs-shot-dark" src="/img/cloud/Finding-dark.png" alt="A finding with its code, explanation and fix" loading="lazy" decoding="async"><img class="docs-shot-img docs-shot-light" src="/img/cloud/Finding-light.png" alt="" aria-hidden="true" loading="lazy" decoding="async"></div>
  <figcaption>A finding, with its code, explanation and fix.</figcaption>
</figure>

## What you can do

| Action | What happens |
| --- | --- |
| Open a pull request with the fix | OAuthLint opens a change on the provider with the suggested fix. |
| Assign | Someone owns it. They are notified. |
| Ignore with a reason | The finding is closed. The reason and who ignored it go to the audit log. |
| Report a false positive | We review the rule. The finding stays open until then. |

## Ignore with a reason

A reason is required: accepted risk, mitigated elsewhere, test code, or false positive. An expiry date is optional; when it passes, the finding opens again.

<figure>
  <div class="docs-shot"><img class="docs-shot-img docs-shot-dark" src="/img/cloud/Finding-triage-dark.png" alt="Ignoring a finding with a required reason" loading="lazy" decoding="async"><img class="docs-shot-img docs-shot-light" src="/img/cloud/Finding-triage-light.png" alt="" aria-hidden="true" loading="lazy" decoding="async"></div>
  <figcaption>Ignoring a finding requires a reason.</figcaption>
</figure>
