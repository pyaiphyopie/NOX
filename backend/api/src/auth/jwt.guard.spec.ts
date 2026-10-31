import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { signAccessToken } from './access-token';
import { JwtAuthGuard, AuthedRequest } from './jwt.guard';

function ctx(req: AuthedRequest) {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as never;
}

describe('JwtAuthGuard', () => {
  const secret = 'test-access-secret-32chars-minimum!!';

  function guardWith(secretValue: string) {
    const config = {
      get: (_key: string, fallback = '') => secretValue || fallback,
    } as unknown as ConfigService;
    const guard = new JwtAuthGuard(config);
    guard.onModuleInit();
    return guard;
  }

  it('rejects missing Authorization header', async () => {
    const guard = guardWith(secret);
    await expect(guard.canActivate(ctx({ headers: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('sets userId from JWT sub', async () => {
    const guard = guardWith(secret);
    const token = await signAccessToken({ sub: 'buyer-42' }, secret);
    const req: AuthedRequest = { headers: { authorization: `Bearer ${token}` } };
    await expect(guard.canActivate(ctx(req))).resolves.toBe(true);
    expect(req.userId).toBe('buyer-42');
  });

  it('rejects invalid token with generic message', async () => {
    const guard = guardWith(secret);
    await expect(
      guard.canActivate(ctx({ headers: { authorization: 'Bearer not-a-jwt' } })),
    ).rejects.toMatchObject({ message: 'Invalid access token' });
  });
});
