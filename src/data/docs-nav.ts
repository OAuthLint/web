/**
 * The docs information architecture: sidebar groups, in order, matching the
 * design's `_docs-tree.json`. Each item's `key` must match the `section`
 * frontmatter of its page, and each `href` must resolve to a page under
 * `src/pages/docs/`. Single source of truth for `DocsLayout.astro` and for
 * the `tests/content.test.ts` guard that keeps the tree and the pages in sync.
 */
export interface DocsNavItem {
  key: string;
  label: string;
  href: string;
}

export interface DocsNavGroup {
  group: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavGroup[] = [
  {
    group: 'Getting started',
    items: [
      { key: 'getting-started', label: 'Introduction', href: '/docs' },
      { key: 'semgrep', label: 'Use with Semgrep', href: '/docs/semgrep' },
    ],
  },
  {
    group: 'OAuthLint Cloud',
    items: [
      {
        key: 'cloud-get-started',
        label: 'Get started with Cloud',
        href: '/docs/cloud/get-started',
      },
      {
        key: 'cloud-pull-requests',
        label: 'Pull request checks',
        href: '/docs/cloud/pull-requests',
      },
      { key: 'cloud-triage', label: 'Triage findings', href: '/docs/cloud/triage' },
      { key: 'cloud-policies', label: 'Policies', href: '/docs/cloud/policies' },
      { key: 'cloud-reports', label: 'Reports and compliance', href: '/docs/cloud/reports' },
      { key: 'cloud-integrations', label: 'Integrations', href: '/docs/cloud/integrations' },
      { key: 'cloud-team', label: 'Team and access', href: '/docs/cloud/team' },
      { key: 'cloud-cli', label: 'Connect the CLI', href: '/docs/cloud/cli' },
      { key: 'cloud-data-privacy', label: 'Data and privacy', href: '/docs/cloud/data-privacy' },
      { key: 'self-host', label: 'Self-host', href: '/docs/self-host' },
    ],
  },
  {
    group: 'Using OAuthLint',
    items: [
      { key: 'cli', label: 'CLI reference', href: '/docs/cli' },
      { key: 'configuration', label: 'Configuration', href: '/docs/configuration' },
      { key: 'suppressing', label: 'Suppressing rules', href: '/docs/suppressing' },
      { key: 'recipes', label: 'Recipes', href: '/docs/recipes' },
    ],
  },
  {
    group: 'Integrations',
    items: [
      { key: 'github-action', label: 'GitHub Action', href: '/docs/github-action' },
      { key: 'code-scanning', label: 'GitHub code scanning', href: '/docs/code-scanning' },
      { key: 'gitlab-ci', label: 'GitLab CI', href: '/docs/gitlab-ci' },
      { key: 'pre-commit', label: 'pre-commit', href: '/docs/pre-commit' },
      { key: 'vscode', label: 'VS Code extension', href: '/docs/vscode' },
      { key: 'mcp', label: 'MCP server for AI tools', href: '/docs/mcp' },
      { key: 'mcp-server-auth', label: 'Scanning MCP servers', href: '/docs/mcp-server-auth' },
      { key: 'iac-auth', label: 'Scanning IaC auth', href: '/docs/iac-auth' },
    ],
  },
  {
    group: 'Contributing',
    items: [{ key: 'writing-rules', label: 'Writing rules', href: '/docs/writing-rules' }],
  },
];
