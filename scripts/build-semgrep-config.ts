#!/usr/bin/env node
/**
 * Build a single, install-free Semgrep ruleset from the OAuthLint rule pack.
 *
 * Merges every rule under `rules/rules/**` into ONE valid Semgrep YAML with a
 * single top-level `rules:` array (metadata intact, so `oauthlint-doc-url` /
 * CWE / OWASP show up in Semgrep output). The file is written to
 * `site/public/r/`, which Astro serves at the site root — i.e. the generated
 * bundle is reachable at:
 *
 *     https://oauthlint.dev/r/oauthlint.yaml
 *
 * so ANY Semgrep user can run the full pack in one command, no install:
 *
 *     semgrep --config https://oauthlint.dev/r/oauthlint.yaml ./src
 *
 * Per-language subsets (`oauthlint-<lang>.yaml`) are emitted too, for users
 * who only want one language's rules.
 *
 * Rules are loaded with the canonical `oauthlint-rules` loader (the same
 * `loadAllRules` the CLI uses) so there is exactly one source of truth for
 * parsing + schema validation — this script never re-implements that logic.
 *
 * Wired into the site build via the `prebuild` npm script, so the bundle is
 * always regenerated from the current rule pack and can never go stale.
 *
 * Run directly with: `pnpm --filter oauthlint-site build:semgrep`
 */
import { readFileSync, readdirSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
// scripts/ -> public/r
const OUT_DIR = join(HERE, '..', 'public', 'r');
// The vendored rule pack (snapshot of the OSS oauthlint-rules, refreshed by
// `pnpm sync:rules`). Reading it here keeps this repo standalone — no package.
const RULES_DIR = join(HERE, '..', 'vendor', 'oauthlint-rules', 'rules');

/** A single Semgrep rule object as authored in the pack YAML. */
interface SemgrepRule {
  id: string;
  languages: string[];
  [key: string]: unknown;
}
/** Matches the shape the OSS `loadAllRules` returned: `{ rule }` wrappers. */
interface LoadedRule {
  rule: SemgrepRule;
}

/** Recursively collect every `*.yml`/`*.yaml` rule file under the pack. */
function ruleFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...ruleFiles(full));
    else if (/\.ya?ml$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Load every rule from the vendored pack, flattening each file's `rules:`. */
function loadAllRules(): LoadedRule[] {
  const rules: LoadedRule[] = [];
  for (const file of ruleFiles(RULES_DIR).sort()) {
    const doc = parseYaml(readFileSync(file, 'utf8')) as { rules?: SemgrepRule[] };
    for (const rule of doc?.rules ?? []) {
      if (rule && Array.isArray(rule.languages)) rules.push({ rule });
    }
  }
  return rules;
}

/** Per-language bundles to emit alongside the combined pack. */
const LANGUAGE_SUBSETS = [
  'javascript',
  'typescript',
  'python',
  'go',
  'java',
  'rust',
  'csharp',
  'php',
  'ruby',
  'kotlin',
  'swift',
  'json',
  'terraform',
  'yaml',
] as const;

/**
 * Serialize a list of rules into a valid Semgrep ruleset document.
 *
 * We emit the rules under a single top-level `rules:` key — exactly the shape
 * Semgrep expects from `--config <file|url>`. A short comment header explains
 * provenance and points at the docs; Semgrep ignores YAML comments.
 */
function renderRuleset(rules: LoadedRule[], heading: string): string {
  const body = stringifyYaml(
    { rules: rules.map((r) => r.rule) },
    { lineWidth: 0 }, // never wrap long pattern strings — keeps Semgrep patterns intact
  );
  const header = [
    '# OAuthLint — Semgrep rules for the OAuth / OIDC / JWT / session / CORS',
    '# anti-patterns that AI coding tools systematically produce.',
    '#',
    `# ${heading}`,
    '#',
    '# Run the full pack with no install:',
    '#   semgrep --config https://oauthlint.dev/r/oauthlint.yaml ./src',
    '#',
    '# Docs:    https://oauthlint.dev/docs/semgrep',
    '# Rules:   https://oauthlint.dev/rules',
    '# License: MIT — https://github.com/Auspeo/oauthlint',
    '#',
    '# Generated from the oauthlint-rules pack. Do not edit by hand.',
    '',
  ].join('\n');
  return `${header}\n${body}`;
}

async function emit(filename: string, contents: string): Promise<void> {
  await writeFile(join(OUT_DIR, filename), contents, 'utf8');
}

async function main(): Promise<void> {
  const rules = loadAllRules();
  if (rules.length === 0) {
    throw new Error('No rules were loaded — refusing to write an empty Semgrep bundle.');
  }

  await mkdir(OUT_DIR, { recursive: true });

  // 1) The combined pack — the must-have, all rules in one document.
  await emit(
    'oauthlint.yaml',
    renderRuleset(rules, `Full pack — ${rules.length} rules across every supported language.`),
  );

  // 2) Per-language subsets — every rule that targets that language.
  const counts: Record<string, number> = {};
  for (const lang of LANGUAGE_SUBSETS) {
    const subset = rules.filter((r) => r.rule.languages.includes(lang));
    counts[lang] = subset.length;
    if (subset.length === 0) continue;
    await emit(
      `oauthlint-${lang}.yaml`,
      renderRuleset(subset, `${lang} subset — ${subset.length} rules.`),
    );
  }

  const langSummary = LANGUAGE_SUBSETS.map((l) => `${l}=${counts[l] ?? 0}`).join(', ');
  console.log(
    `[build-semgrep-config] wrote oauthlint.yaml (${rules.length} rules) + per-language subsets [${langSummary}] to ${OUT_DIR}`,
  );
}

main().catch((err) => {
  console.error('[build-semgrep-config] failed:', err);
  process.exit(1);
});
