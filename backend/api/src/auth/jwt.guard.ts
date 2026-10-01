import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenError, verifyAccessToken } from './access-token';

export interface AuthedRequest {
  headers: Record<string, string | string[] | undefined>;
  userId?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization ?? req.headers.Authorization;
    const raw = Array.isArray(header) ? header[0] : header;
    if (!raw?.startsWith('Bearer ')) throw new UnauthorizedException('Missing access token');
    try {
      const claims = verifyAccessToken(
        raw.slice('Bearer '.length).trim(),
        this.config.get<string>('JWT_ACCESS_SECRET', ''),
      );
      req.userId = claims.sub;
      return true;
    } catch (err) {
      if (err instanceof AccessTokenError) throw new UnauthorizedException(err.message);
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
