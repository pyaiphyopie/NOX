import { SignJWT, jwtVerify, errors as JoseErrors } from 'jose';

export const ACCESS_TOKEN_ISS = 'nox-auth';
export const ACCESS_TOKEN_AUD = 'nox-api';
export const ACCESS_TOKEN_TYP = 'access';
/** Minimum length for JWT_ACCESS_SECRET (fail-fast at boot). */
export const MIN_JWT_SECRET_LENGTH = 32;

export interface AccessClaims {
  sub: string;
  exp: number;
  iss?: string;
  aud?: string | string[];
  typ?: string;
}

export class AccessTokenError extends Error {
  readonly status = 401;
  constructor(message = 'Invalid access token') {
    super(message);
    this.name = 'AccessTokenError';
  }
}

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/** Throws if the secret is missing or too short. Call at boot. */
export function assertJwtAccessSecret(secret: string | undefined | null): asserts secret is string {
  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_ACCESS_SECRET must be set and at least ${MIN_JWT_SECRET_LENGTH} characters`,
    );
  }
}

/** HS256 access token. Auth-service does not emit these yet; this is the shared verifier. */
export async function signAccessToken(
  claims: { sub: string; exp?: number; typ?: string },
  secret: string,
  ttlSec = 900,
): Promise<string> {
  assertJwtAccessSecret(secret);
  const exp = claims.exp ?? Math.floor(Date.now() / 1000) + ttlSec;
  return new SignJWT({ typ: claims.typ ?? ACCESS_TOKEN_TYP })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.sub)
    .setIssuer(ACCESS_TOKEN_ISS)
    .setAudience(ACCESS_TOKEN_AUD)
    .setExpirationTime(exp)
    .sign(secretKey(secret));
}

export async function verifyAccessToken(token: string, secret: string): Promise<AccessClaims> {
  assertJwtAccessSecret(secret);
  try {
    const { payload, protectedHeader } = await jwtVerify(token, secretKey(secret), {
      algorithms: ['HS256'],
      issuer: ACCESS_TOKEN_ISS,
      audience: ACCESS_TOKEN_AUD,
      clockTolerance: 5,
    });
    if (protectedHeader.alg !== 'HS256') {
      throw new AccessTokenError('Invalid algorithm');
    }
    if (!payload.sub || typeof payload.sub !== 'string') {
      throw new AccessTokenError('Missing sub');
    }
    if (typeof payload.exp !== 'number') {
      throw new AccessTokenError('Missing exp');
    }
    const typ = typeof payload.typ === 'string' ? payload.typ : undefined;
    if (typ !== undefined && typ !== ACCESS_TOKEN_TYP) {
      throw new AccessTokenError('Invalid token typ');
    }
    return {
      sub: payload.sub,
      exp: payload.exp,
      iss: typeof payload.iss === 'string' ? payload.iss : undefined,
      aud: payload.aud as string | string[] | undefined,
      typ,
    };
  } catch (err) {
    if (err instanceof AccessTokenError) throw err;
    if (err instanceof JoseErrors.JWTExpired) throw new AccessTokenError('Expired');
    if (err instanceof JoseErrors.JWTClaimValidationFailed) {
      throw new AccessTokenError(err.message || 'Invalid claims');
    }
    if (err instanceof Error && err.message.includes('JWT_ACCESS_SECRET')) throw err;
    throw new AccessTokenError();
  }
}
