import { createHmac, timingSafeEqual } from 'crypto';

export interface AccessClaims {
  sub: string;
  exp?: number;
}

export class AccessTokenError extends Error {
  readonly status = 401;
  constructor(message = 'Invalid access token') {
    super(message);
    this.name = 'AccessTokenError';
  }
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

/** HS256 access token. Auth-service does not emit these yet; this is the shared verifier. */
export function signAccessToken(claims: AccessClaims, secret: string, ttlSec = 900): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({ ...claims, exp: claims.exp ?? Math.floor(Date.now() / 1000) + ttlSec }),
  );
  const sig = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

export function verifyAccessToken(token: string, secret: string): AccessClaims {
  if (!secret) throw new AccessTokenError('JWT secret not configured');
  const parts = token.split('.');
  if (parts.length !== 3) throw new AccessTokenError();
  const [header, payload, sig] = parts;
  const expected = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new AccessTokenError();
  let body: AccessClaims;
  try {
    body = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AccessClaims;
  } catch {
    throw new AccessTokenError();
  }
  if (!body.sub || typeof body.sub !== 'string') throw new AccessTokenError('Missing sub');
  if (body.exp !== undefined && body.exp < Math.floor(Date.now() / 1000)) {
    throw new AccessTokenError('Expired');
  }
  return { sub: body.sub, exp: body.exp };
}
