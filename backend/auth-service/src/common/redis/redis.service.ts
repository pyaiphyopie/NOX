import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly memory = new Map<string, { value: string; expiresAt?: number }>();

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis | null) {}

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  private isExpired(entry: { expiresAt?: number }): boolean {
    return entry.expiresAt !== undefined && Date.now() > entry.expiresAt;
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      return this.client.get(key);
    }
    const entry = this.memory.get(key);
    if (!entry || this.isExpired(entry)) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
      return;
    }
    this.memory.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      await this.client.del(key);
      return;
    }
    this.memory.delete(key);
  }

  async incr(key: string): Promise<number> {
    if (this.client) {
      return this.client.incr(key);
    }
    const current = await this.get(key);
    const next = (current ? parseInt(current, 10) : 0) + 1;
    const entry = this.memory.get(key);
    const ttlMs = entry?.expiresAt ? entry.expiresAt - Date.now() : undefined;
    await this.set(key, String(next), ttlMs && ttlMs > 0 ? Math.ceil(ttlMs / 1000) : undefined);
    return next;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (this.client) {
      await this.client.expire(key, ttlSeconds);
      return;
    }
    const entry = this.memory.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (this.client) {
      return (await this.client.exists(key)) === 1;
    }
    const entry = this.memory.get(key);
    if (!entry || this.isExpired(entry)) {
      this.memory.delete(key);
      return false;
    }
    return true;
  }
}
