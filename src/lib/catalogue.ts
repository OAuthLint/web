import { stripInline } from './inline';
import type { RuleView, Severity } from './rules';

export const PAGE_SIZE = 25;
export const TOPIC_LABELS: Record<string, string> = {
  jwt: 'JWT',
  oauth: 'OAuth',
  oidc: 'OIDC',
  flow: 'Data flow',
  cookie: 'Cookies',
  crypto: 'Cryptography',
  cors: 'CORS',
  mcp: 'MCP',
  android: 'Android',
  secret: 'Secrets',
  web: 'Web',
  tls: 'TLS',
  session: 'Sessions',
  nextauth: 'NextAuth',
  iac: 'Infrastructure',
  express: 'Express',
  fastify: 'Fastify',
  fastapi: 'FastAPI',
  betterauth: 'Better Auth',
  nestjs: 'NestJS',
  hono: 'Hono',
  drf: 'Django REST',
  storage: 'Storage',
  passport: 'Passport',
  keychain: 'Keychain',
  flask: 'Flask',
  django: 'Django',
};
export const LANGUAGE_LABELS: Record<string, string> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  python: 'Python',
  go: 'Go',
  java: 'Java',
  rust: 'Rust',
  csharp: 'C#',
  'C#': 'C#',
  php: 'PHP',
  PHP: 'PHP',
  ruby: 'Ruby',
  Ruby: 'Ruby',
  kotlin: 'Kotlin',
  Kotlin: 'Kotlin',
  swift: 'Swift',
  Swift: 'Swift',
  xml: 'XML',
  XML: 'XML',
  json: 'JSON',
  JSON: 'JSON',
  terraform: 'Terraform',
  Terraform: 'Terraform',
  yaml: 'YAML',
  YAML: 'YAML',
};
const TITLES: Record<string, string> = {
  'auth.jwt.jose-no-audience': 'JWT audience is not validated',
  'auth.jwt.decode-without-verify': 'JWT decoded without signature verification',
  'auth.jwt.alg-none': 'Unsigned JWTs are accepted',
  'auth.py.jwt.no-verify': 'JWT signature verification is disabled',
  'auth.flow.open-redirect': 'Untrusted input reaches a redirect',
  'auth.flow.secret-in-log': 'A secret may be written to a log',
  'auth.flow.ssrf': 'Untrusted input reaches an outbound request',
};
export function ruleTitle(rule: Pick<RuleView, 'id' | 'title'>): string {
  return TITLES[rule.id] ?? stripInline(rule.title);
}
export function topicSlug(id: string): string {
  return id.split('.').at(-2) ?? 'other';
}
export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic;
}
export function languageLabel(language: string): string {
  return LANGUAGE_LABELS[language] ?? language;
}

export interface CatalogueEntry {
  id: string;
  search: string;
  severity: string;
  languages: string[];
  category: string;
  mode: string;
}
export function catalogueEntry(rule: RuleView): CatalogueEntry {
  return {
    id: rule.id,
    search: [
      rule.id,
      rule.ruleId,
      rule.slug,
      rule.title,
      ruleTitle(rule),
      rule.cwe,
      rule.owasp,
      topicLabel(topicSlug(rule.id)),
      ...rule.languages.map(languageLabel),
    ]
      .join(' ')
      .toLowerCase(),
    severity: rule.severity,
    languages: rule.languages,
    category: topicSlug(rule.id),
    mode: rule.mode,
  };
}
export interface CatalogueState {
  q: string;
  language: string;
  category: string;
  severity: string;
  analysis: string;
  sort: 'id' | 'severity';
  page: number;
}
export function readCatalogueState(params: URLSearchParams): CatalogueState {
  const page = Number(params.get('page'));
  return {
    q: (params.get('q') ?? '').slice(0, 200),
    language: params.get('language') ?? '',
    category: params.get('category') ?? '',
    severity: params.get('severity') ?? '',
    analysis: params.get('analysis') ?? '',
    sort: params.get('sort') === 'severity' ? 'severity' : 'id',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}
export function writeCatalogueState(
  state: CatalogueState,
  params = new URLSearchParams(),
): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of [
    'q',
    'language',
    'category',
    'severity',
    'analysis',
    'sort',
    'page',
  ] as const) {
    const value = state[key];
    if (!value || (key === 'page' && value === 1) || (key === 'sort' && value === 'id'))
      next.delete(key);
    else next.set(key, String(value));
  }
  return next;
}
export function matchesRule(rule: CatalogueEntry, state: CatalogueState): boolean {
  const terms = state.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return (
    terms.every((term) => rule.search.includes(term)) &&
    (!state.language || rule.languages.includes(state.language)) &&
    (!state.category || rule.category === state.category) &&
    (!state.severity || rule.severity === state.severity) &&
    (!state.analysis || rule.mode === state.analysis)
  );
}
export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};
