import { createHmac, timingSafeEqual } from 'crypto';
import { PaymentProviderAdapter } from './adapter';
import {
  CreatePaymentInput,
  ParsedWebhook,
  PaymentInstruction,
  PaymentMethod,
} from '../types';

/**
 * Local / test adapter. Confirm by POSTing the same body to the webhook
 * with header x-nox-fake-secret matching PAYMENTS_FAKE_SECRET.
 * Never enable PAYMENTS_MODE=fake in production.
 */
export class FakePaymentAdapter implements PaymentProviderAdapter {
  readonly provider = 'fake' as const;
  readonly markets = ['MM', 'TH', 'ID', 'PH', 'VN', 'MY', 'SG'];
  readonly methods: PaymentMethod[] = ['fake'];

  constructor(
    private readonly secret: string,
    private readonly publicBaseUrl: string,
  ) {}

  async createPayment(input: CreatePaymentInput): Promise<{
    providerRef: string;
    instruction: PaymentInstruction;
    raw: unknown;
  }> {
    const providerRef = `fake_${input.paymentId}`;
    const instruction: PaymentInstruction = {
      kind: 'fake_confirm',
      confirmUrl: `${this.publicBaseUrl}/webhooks/payment/fake`,
    };
    return { providerRef, instruction, raw: { mode: 'fake' } };
  }

  verifySignature(req: {
    headers: Record<string, string | string[] | undefined>;
    rawBody: Buffer;
  }): boolean {
    const header = headerValue(req.headers['x-nox-fake-secret']);
    if (!header || !this.secret) return false;
    const a = Buffer.from(header);
    const b = Buffer.from(this.secret);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  async parseWebhook(req: {
    headers: Record<string, string | string[] | undefined>;
    rawBody: Buffer;
  }): Promise<ParsedWebhook> {
    const body = JSON.parse(req.rawBody.toString('utf8')) as {
      providerRef?: string;
      paymentId?: string;
      status?: ParsedWebhook['status'];
      amountMinor?: number;
      currency?: string;
      eventId?: string;
    };
    const providerRef = body.providerRef ?? `fake_${body.paymentId ?? 'unknown'}`;
    return {
      providerEventId: body.eventId ?? `evt_${providerRef}`,
      providerRef,
      status: body.status ?? 'completed',
      amountMinor: body.amountMinor ?? 0,
      currency: body.currency ?? 'MMK',
      paidAt: new Date(),
      raw: body,
    };
  }

  async queryPayment(providerRef: string) {
    return { status: 'processing' as const, raw: { providerRef } };
  }
}

export function fakeWebhookSignature(secret: string, rawBody: string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

function headerValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
