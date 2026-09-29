---
layout: ../../../layouts/DocsLayout.astro
title: "Integrations"
description: "Send findings where your team already works, and open tickets without leaving the finding."
section: "cloud-integrations"
---

# Integrations

Send findings where your team already works, and open tickets without leaving the finding.

## Available integrations

| Integration | What it does |
| --- | --- |
| Slack and Microsoft Teams | Posts new criticals and blocked merges to a channel, with a daily or weekly digest. |
| Jira and Linear | Opens a ticket from a finding and keeps its status in sync. |
| PagerDuty | Pages the on-call engineer for a critical on a protected branch. |
| Webhooks | Sends signed JSON events to your own endpoint. |
| SARIF export | Publishes findings to any SARIF-aware viewer. |

<figure>
  <div class="docs-shot"><img class="docs-shot-img docs-shot-dark" src="/img/cloud/Integrations-dark.png" alt="Connected and available integrations" loading="lazy" decoding="async"><img class="docs-shot-img docs-shot-light" src="/img/cloud/Integrations-light.png" alt="" aria-hidden="true" loading="lazy" decoding="async"></div>
  <figcaption>Connected and available integrations.</figcaption>
</figure>

## Connect one

1. Open Integrations and choose the tool.
2. Authorise OAuthLint with that tool.
3. Pick the channel, project or endpoint, and which events to send.

## Webhooks

Each delivery is signed with your signing secret, so you can verify it came from OAuthLint. Failed deliveries are retried and listed with their response.
