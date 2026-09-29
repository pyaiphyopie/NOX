import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface NoxUser {
  id: string;
  phone: string | null;
  email: string | null;
  display_name: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly supabase: SupabaseClient | null;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (url && key) {
      this.supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } else {
      this.supabase = null;
      this.logger.warn(
        'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — user persistence disabled',
      );
    }
  }

  async findOrCreateByPhone(phone: string): Promise<NoxUser> {
    if (!this.supabase) {
      const id = `dev-${Buffer.from(phone).toString('hex').slice(0, 32)}`;
      return {
        id,
        phone,
        email: null,
        display_name: null,
        role: 'consumer',
        is_verified: true,
        created_at: new Date().toISOString(),
      };
    }

    const { data: existing, error: findError } = await this.supabase
      .from('users')
      .select('id, phone, email, display_name, role, is_verified, created_at')
      .eq('phone', phone)
      .is('deleted_at', null)
      .maybeSingle();

    if (findError) {
      this.logger.error('find user error', findError.message);
      throw findError;
    }

    if (existing) {
      await this.supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', existing.id);
      return existing as NoxUser;
    }

    const { data: created, error: createError } = await this.supabase
      .from('users')
      .insert({
        phone,
        role: 'consumer',
        is_verified: true,
        last_login_at: new Date().toISOString(),
      })
      .select('id, phone, email, display_name, role, is_verified, created_at')
      .single();

    if (createError) {
      this.logger.error('create user error', createError.message);
      throw createError;
    }

    await this.supabase.from('profiles').upsert({ id: created.id });

    return created as NoxUser;
  }

  async findById(id: string): Promise<NoxUser | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('users')
      .select('id, phone, email, display_name, role, is_verified, created_at')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      this.logger.error('findById error', error.message);
      return null;
    }
    return data as NoxUser | null;
  }
}
