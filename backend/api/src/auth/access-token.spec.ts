import { signAccessToken, verifyAccessToken, AccessTokenError } from './access-token';

describe('access token', () => {
  const secret = 'test-access-secret';

  it('round-trips sub', () => {
    const token = signAccessToken({ sub: 'user-1' }, secret);
    expect(verifyAccessToken(token, secret).sub).toBe('user-1');
  });

  it('rejects missing token material and bad signature', () => {
    expect(() => verifyAccessToken('not-a-jwt', secret)).toThrow(AccessTokenError);
    const token = signAccessToken({ sub: 'user-1' }, secret);
    expect(() => verifyAccessToken(token + 'x', secret)).toThrow(AccessTokenError);
  });

  it('rejects expired tokens', () => {
    const token = signAccessToken({ sub: 'user-1', exp: 1 }, secret);
    expect(() => verifyAccessToken(token, secret)).toThrow(AccessTokenError);
  });

  it('rejects a token with no sub', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ exp: 9_999_999_999 })).toString('base64url');
    const { createHmac } = require('crypto') as typeof import('crypto');
    const sig = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    expect(() => verifyAccessToken(`${header}.${payload}.${sig}`, secret)).toThrow(AccessTokenError);
  });
});
