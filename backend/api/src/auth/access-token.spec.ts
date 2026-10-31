import { createHmac } from 'crypto';
import { SignJWT } from 'jose';
import {
  ACCESS_TOKEN_AUD,
  ACCESS_TOKEN_ISS,
  ACCESS_TOKEN_TYP,
  AccessTokenError,
  assertJwtAccessSecret,
  signAccessToken,
  verifyAccessToken,
} from './access-token';

describe('access token', () => {
  const secret = 'test-access-secret-32chars-minimum!!';

  it('round-trips sub with iss/aud/typ', async () => {
    const token = await signAccessToken({ sub: 'user-1' }, secret);
    const claims = await verifyAccessToken(token, secret);
    expect(claims.sub).toBe('user-1');
    expect(claims.iss).toBe(ACCESS_TOKEN_ISS);
    expect(claims.aud).toBe(ACCESS_TOKEN_AUD);
    expect(claims.typ).toBe(ACCESS_TOKEN_TYP);
    expect(typeof claims.exp).toBe('number');
  });

  it('rejects missing token material and bad signature', async () => {
    await expect(verifyAccessToken('not-a-jwt', secret)).rejects.toBeInstanceOf(AccessTokenError);
    const token = await signAccessToken({ sub: 'user-1' }, secret);
    await expect(verifyAccessToken(token + 'x', secret)).rejects.toBeInstanceOf(AccessTokenError);
  });

  it('rejects expired tokens', async () => {
    const token = await signAccessToken({ sub: 'user-1', exp: 1 }, secret);
    await expect(verifyAccessToken(token, secret)).rejects.toBeInstanceOf(AccessTokenError);
  });

  it('rejects a token with no sub', async () => {
    const token = await new SignJWT({ typ: ACCESS_TOKEN_TYP })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuer(ACCESS_TOKEN_ISS)
      .setAudience(ACCESS_TOKEN_AUD)
      .setExpirationTime(Math.floor(Date.now() / 1000) + 60)
      .sign(new TextEncoder().encode(secret));
    await expect(verifyAccessToken(token, secret)).rejects.toBeInstanceOf(AccessTokenError);
  });

  it('rejects alg mismatch (none)', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'user-1',
        exp: Math.floor(Date.now() / 1000) + 60,
        iss: ACCESS_TOKEN_ISS,
        aud: ACCESS_TOKEN_AUD,
        typ: ACCESS_TOKEN_TYP,
      }),
    ).toString('base64url');
    await expect(verifyAccessToken(`${header}.${payload}.`, secret)).rejects.toBeInstanceOf(
      AccessTokenError,
    );
  });

  it('rejects missing exp', async () => {
    // Manually build HS256 JWT without exp claim
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'user-1',
        iss: ACCESS_TOKEN_ISS,
        aud: ACCESS_TOKEN_AUD,
        typ: ACCESS_TOKEN_TYP,
      }),
    ).toString('base64url');
    const sig = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    await expect(verifyAccessToken(`${header}.${payload}.${sig}`, secret)).rejects.toBeInstanceOf(
      AccessTokenError,
    );
  });

  it('rejects wrong audience', async () => {
    const token = await new SignJWT({ typ: ACCESS_TOKEN_TYP })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject('user-1')
      .setIssuer(ACCESS_TOKEN_ISS)
      .setAudience('other-api')
      .setExpirationTime(Math.floor(Date.now() / 1000) + 60)
      .sign(new TextEncoder().encode(secret));
    await expect(verifyAccessToken(token, secret)).rejects.toBeInstanceOf(AccessTokenError);
  });

  it('rejects wrong issuer', async () => {
    const token = await new SignJWT({ typ: ACCESS_TOKEN_TYP })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject('user-1')
      .setIssuer('other-auth')
      .setAudience(ACCESS_TOKEN_AUD)
      .setExpirationTime(Math.floor(Date.now() / 1000) + 60)
      .sign(new TextEncoder().encode(secret));
    await expect(verifyAccessToken(token, secret)).rejects.toBeInstanceOf(AccessTokenError);
  });

  it('fail-fast on short secret', () => {
    expect(() => assertJwtAccessSecret('short')).toThrow(/32/);
  });
});
