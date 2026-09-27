import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProviderAdapter } from './adapters/adapter';
import { FakePaymentAdapter } from './adapters/fake.adapter';
import { KbzPayAdapter } from './adapters/kbzpay.adapter';
import { WavePayAdapter } from './adapters/wavepay.adapter';
import { PaymentMethod, PaymentProvider, providerForMethod } from './types';

@Injectable()
export class AdapterRegistry {
  private readonly adapters = new Map<PaymentProvider, PaymentProviderAdapter>();
  readonly mode: string;

  constructor(config: ConfigService) {
    this.mode = config.get<string>('PAYMENTS_MODE', 'fake');
    const publicBase = config.get<string>('PUBLIC_API_URL', 'http://localhost:3002');

    this.adapters.set(
      'fake',
      new FakePaymentAdapter(
        config.get<string>('PAYMENTS_FAKE_SECRET', 'dev-fake-secret'),
        publicBase,
      ),
    );
    this.adapters.set(
      'wavepay',
      new WavePayAdapter(
        config.get<string>('WAVEPAY_MERCHANT_ID', ''),
        config.get<string>('WAVEPAY_API_KEY', ''),
        config.get<string>(
          'WAVEPAY_ENDPOINT',
          'https://testpayments.wavemoney.io:8107/payment',
        ),
      ),
    );
    this.adapters.set(
      'kbzpay',
      new KbzPayAdapter(
        config.get<string>('KBZPAY_MERCHANT_ID', ''),
        config.get<string>('KBZPAY_CHECKOUT_BASE', ''),
      ),
    );
  }

  get(provider: PaymentProvider): PaymentProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`No adapter registered for ${provider}`);
    }
    return adapter;
  }

  resolve(method: PaymentMethod): PaymentProviderAdapter {
    if (this.mode === 'fake') return this.get('fake');
    return this.get(providerForMethod(method));
  }
}
