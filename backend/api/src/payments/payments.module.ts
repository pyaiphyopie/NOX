import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdapterRegistry } from './registry';
import { PaymentsController, WebhooksController } from './payments.controller';
import { InMemoryPaymentsStore, PaymentsService, PaymentsStore } from './payments.service';
import { SupabasePaymentsStore } from './supabase.store';
import { JwtAuthGuard } from '../auth/jwt.guard';

export const PAYMENTS_STORE = 'PAYMENTS_STORE';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [
    AdapterRegistry,
    JwtAuthGuard,
    {
      provide: PAYMENTS_STORE,
      useFactory: (config: ConfigService) => {
        if (config.get<string>('PAYMENTS_STORE') === 'supabase') {
          const url = config.get<string>('SUPABASE_URL');
          const key = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
          if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
          return SupabasePaymentsStore.fromEnv(url, key);
        }
        return new InMemoryPaymentsStore();
      },
      inject: [ConfigService],
    },
    {
      provide: PaymentsService,
      useFactory: (store: PaymentsStore, registry: AdapterRegistry, config: ConfigService) =>
        new PaymentsService(
          store,
          registry,
          config.get<string>('TICKET_HMAC_SECRET', 'dev-ticket-hmac'),
          config.get<string>('PUBLIC_API_URL', 'http://localhost:3002'),
        ),
      inject: [PAYMENTS_STORE, AdapterRegistry, ConfigService],
    },
  ],
  exports: [PaymentsService, AdapterRegistry, PAYMENTS_STORE],
})
export class PaymentsModule {}
