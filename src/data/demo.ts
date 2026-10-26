import type { FixtureLang } from '../lib/rules';

export interface DemoExample {
  id: string;
  label: string;
  ruleId: string;
  filename: string;
  language: FixtureLang;
  before: string;
  after: string;
  problem: string;
  correction: string;
}
// Curated, illustrative snippets. Severity and rule links come from the vendored pack.
export const demoExamples: DemoExample[] = [
  {
    id: 'audience',
    label: 'TypeScript / JWT audience',
    ruleId: 'auth.jwt.jose-no-audience',
    filename: 'src/auth/verify.ts',
    language: 'ts',
    before: [
      "import { jwtVerify } from 'jose';",
      '',
      'export async function verify(token: string) {',
      '  const { payload } = await jwtVerify(token, JWKS, {',
      "    issuer: 'https://auth.example.com',",
      '  });',
      '',
      '  return payload;',
      '}',
    ].join('\n'),
    after: [
      "import { jwtVerify } from 'jose';",
      '',
      'export async function verify(token: string) {',
      '  const { payload } = await jwtVerify(token, JWKS, {',
      "    issuer: 'https://auth.example.com',",
      "    audience: 'https://api.example.com',",
      '  });',
      '  return payload;',
      '}',
    ].join('\n'),
    problem:
      'A valid signature is not enough. Without an audience check, this API may accept a token intended for a different service.',
    correction:
      'Bind verification to the audience expected by this API. A token issued for another service must be rejected.',
  },
  {
    id: 'signature',
    label: 'Python / JWT signature',
    ruleId: 'auth.py.jwt.no-verify',
    filename: 'app/auth/session.py',
    language: 'python',
    before: [
      'import jwt',
      '',
      '',
      'def read_session(token: str, public_key: str):',
      '    claims = jwt.decode(',
      '        token,',
      '        options={"verify_signature": False},',
      '    )',
      '    return claims["sub"]',
    ].join('\n'),
    after: [
      'import jwt',
      '',
      '',
      'def read_session(token: str, public_key: str):',
      '    claims = jwt.decode(',
      '        token, public_key, algorithms=["RS256"],',
      '        audience="https://api.example.com",',
      '    )',
      '    return claims["sub"]',
    ].join('\n'),
    problem:
      'Signature verification is explicitly disabled. The decoded subject can be controlled by whoever supplies the token.',
    correction:
      'Verify the signature with the trusted public key and an explicit algorithm before using the claims.',
  },
];
