import {
  CanActivate,
  ExecutionContext,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenError, assertJwtAccessSecret, verifyAccessToken } from './access-token';

export interface AuthedRequest {
  headers: Record<string, string | string[] | undefined>;
  userId?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  private secret = '';

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const configured = this.config.get<string>('JWT_ACCESS_SECRET', '');
    // Fail fast when configured; empty is allowed only so unit tests that
    // never hit the guard can boot. Live requests still 401 via verify.
    if (configured) assertJwtAccessSecret(configured);
    this.secret = configured;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization ?? req.headers.Authorization;
    const raw = Array.isArray(header) ? header[0] : header;
    if (!raw?.startsWith('Bearer ')) throw new UnauthorizedException('Missing access token');
    try {
      const claims = await verifyAccessToken(raw.slice('Bearer '.length).trim(), this.secret);
      req.userId = claims.sub;
      return true;
    } catch (err) {
      if (err instanceof AccessTokenError) throw new UnauthorizedException('Invalid access token');
      if (err instanceof Error && err.message.includes('JWT_ACCESS_SECRET')) {
        throw new UnauthorizedException('Invalid access token');
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
