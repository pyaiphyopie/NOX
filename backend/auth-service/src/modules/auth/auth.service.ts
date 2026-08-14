import { Injectable, Logger } from '@nestjs/common';
import { OtpService } from './otp.service';
import { TokenService, TokenPair } from './token.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
    private readonly users: UsersService,
  ) {}

  async requestOtp(phone: string, ip: string) {
    return this.otp.requestOtp(phone, ip);
  }

  async verifyOtp(phone: string, code: string): Promise<TokenPair & { user: { id: string; phone: string | null; role: string } }> {
    const normalized = await this.otp.verifyOtp(phone, code);
    const user = await this.users.findOrCreateByPhone(normalized);

    const pair = await this.tokens.issueTokens({
      sub: user.id,
      phone: user.phone || normalized,
      role: user.role,
    });

    this.logger.log(`User authenticated: ${user.id}`);

    return {
      ...pair,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    return this.tokens.rotateRefreshToken(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.revokeRefreshToken(refreshToken);
  }
}
