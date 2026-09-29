import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { RedisService } from '../../common/redis/redis.service';

export interface AccessTokenPayload {
  sub: string;
  phone: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;
const ACCESS_TTL_SECONDS = 60 * 15;

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  private refreshKey(token: string) {
    return `refresh:${token}`;
  }

  private userRefreshSetKey(userId: string) {
    return `user:refresh:${userId}`;
  }

  async issueTokens(payload: AccessTokenPayload): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(
      {
        sub: payload.sub,
        phone: payload.phone,
        role: payload.role,
      },
      {
        expiresIn: ACCESS_TTL_SECONDS,
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      },
    );

    const refreshToken = randomBytes(48).toString('hex');
    await this.redis.set(
      this.refreshKey(refreshToken),
      JSON.stringify({ userId: payload.sub, phone: payload.phone, role: payload.role }),
      REFRESH_TTL_SECONDS,
    );

    const setKey = this.userRefreshSetKey(payload.sub);
    const existing = await this.redis.get(setKey);
    const tokens: string[] = existing ? JSON.parse(existing) : [];
    tokens.push(refreshToken);
    const trimmed = tokens.slice(-10);
    await this.redis.set(setKey, JSON.stringify(trimmed), REFRESH_TTL_SECONDS);

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TTL_SECONDS,
    };
  }

  async rotateRefreshToken(oldRefreshToken: string): Promise<TokenPair> {
    const data = await this.redis.get(this.refreshKey(oldRefreshToken));
    if (!data) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.redis.del(this.refreshKey(oldRefreshToken));

    const parsed = JSON.parse(data) as {
      userId: string;
      phone: string;
      role: string;
    };

    return this.issueTokens({
      sub: parsed.userId,
      phone: parsed.phone,
      role: parsed.role,
    });
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.redis.del(this.refreshKey(refreshToken));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const setKey = this.userRefreshSetKey(userId);
    const existing = await this.redis.get(setKey);
    if (existing) {
      const tokens: string[] = JSON.parse(existing);
      await Promise.all(tokens.map((t) => this.redis.del(this.refreshKey(t))));
      await this.redis.del(setKey);
    }
  }
}
