import {
  Injectable,
  TooManyRequestsException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { RedisService } from '../../common/redis/redis.service';
import { normalizeMyanmarPhone } from './utils/phone.util';

const OTP_TTL_SECONDS = 300;
const OTP_MAX_ATTEMPTS = 5;
const RATE_LIMIT_PHONE_WINDOW = 60 * 15;
const RATE_LIMIT_PHONE_MAX = 5;
const RATE_LIMIT_IP_WINDOW = 60 * 15;
const RATE_LIMIT_IP_MAX = 20;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  private otpKey(phone: string) {
    return `otp:${phone}`;
  }

  private attemptsKey(phone: string) {
    return `otp:attempts:${phone}`;
  }

  private phoneRateKey(phone: string) {
    return `otp:rate:phone:${phone}`;
  }

  private ipRateKey(ip: string) {
    return `otp:rate:ip:${ip}`;
  }

  async requestOtp(rawPhone: string, ip: string): Promise<{ expiresIn: number }> {
    const phone = normalizeMyanmarPhone(rawPhone);

    const phoneCount = await this.redis.incr(this.phoneRateKey(phone));
    if (phoneCount === 1) {
      await this.redis.expire(this.phoneRateKey(phone), RATE_LIMIT_PHONE_WINDOW);
    }
    if (phoneCount > RATE_LIMIT_PHONE_MAX) {
      throw new TooManyRequestsException(
        'Too many OTP requests for this number. Try again later.',
      );
    }

    const ipCount = await this.redis.incr(this.ipRateKey(ip));
    if (ipCount === 1) {
      await this.redis.expire(this.ipRateKey(ip), RATE_LIMIT_IP_WINDOW);
    }
    if (ipCount > RATE_LIMIT_IP_MAX) {
      throw new TooManyRequestsException(
        'Too many OTP requests from this network. Try again later.',
      );
    }

    const code = String(randomInt(100000, 999999));
    await this.redis.set(this.otpKey(phone), code, OTP_TTL_SECONDS);
    await this.redis.del(this.attemptsKey(phone));

    const isProd = this.config.get('NODE_ENV') === 'production';
    if (!isProd) {
      this.logger.log(`[DEV] OTP for ${phone}: ${code}`);
    } else {
      this.logger.log(`OTP generated for ${phone} (SMS dispatch pending)`);
    }

    return { expiresIn: OTP_TTL_SECONDS };
  }

  async verifyOtp(rawPhone: string, code: string): Promise<string> {
    const phone = normalizeMyanmarPhone(rawPhone);
    const stored = await this.redis.get(this.otpKey(phone));

    if (!stored) {
      throw new BadRequestException('OTP expired or not found. Request a new one.');
    }

    const attempts = await this.redis.incr(this.attemptsKey(phone));
    if (attempts === 1) {
      await this.redis.expire(this.attemptsKey(phone), OTP_TTL_SECONDS);
    }
    if (attempts > OTP_MAX_ATTEMPTS) {
      await this.redis.del(this.otpKey(phone));
      throw new TooManyRequestsException(
        'Too many failed attempts. Request a new OTP.',
      );
    }

    if (stored !== code) {
      throw new BadRequestException('Invalid OTP code.');
    }

    await this.redis.del(this.otpKey(phone));
    await this.redis.del(this.attemptsKey(phone));

    return phone;
  }
}
