import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdapterRegistry } from './registry';
import { PaymentsController, WebhooksController } from './payments.controller';
import { InMemoryPaymentsStore, PaymentsService, PaymentsStore } from './payments.service';

export const PAYMENTS_STORE = 'PAYMENTS_STORE';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [
    AdapterRegistry,
    {
      provide: PAYMENTS_STORE,
      useFactory: () => new InMemoryPaymentsStore(),
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
