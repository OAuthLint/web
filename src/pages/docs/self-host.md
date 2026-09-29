---
layout: ../../layouts/DocsLayout.astro
title: "Self-host"
description: "The whole app runs on your infrastructure under AGPL-3.0, with every feature included. Your code never leaves it."
section: "self-host"
---

# Self-host

The whole app runs on your infrastructure under AGPL-3.0, with every feature included. Your code never leaves it.

## Requirements

- Docker and Docker Compose
- PostgreSQL 15 or later
- An app registered on your source control: GitHub, GitLab, Bitbucket or Azure DevOps, cloud or self-managed

## Install

```bash
git clone https://github.com/oauthlint/cloud
cd cloud && cp .env.example .env
docker compose up -d
```

Open `http://localhost:8080`. The setup assistant connects your source control and creates the first organisation.

## Update

```bash
docker compose pull && docker compose up -d
```

Each release ships with notes and, for security fixes, an advisory, so you know when to update.

## Or let us run it

Cloud is the same product, hosted and updated for you. Free up to 10 contributors. [Compare self-hosted and Cloud](/docs/cloud/get-started).
