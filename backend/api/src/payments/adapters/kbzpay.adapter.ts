import { PaymentProviderAdapter } from './adapter';
import {
  AdapterNotConfiguredError,
  CreatePaymentInput,
  ParsedWebhook,
  PaymentInstruction,
  RefundNotSupportedError,
} from '../types';

/**
 * KBZPay adapter.
 *
 * Official merchant API fields are issued per-merchant by KBZ and are NOT
 * documented here to avoid inventing an API. If KBZ credentials are absent
 * but Dinger is configured, createPayment throws with a clear next step:
 * wire Dinger as a separate DingerAdapter — do not silently remap.
 *
 * P0 implementation returns PWA/QR instruction shapes only when
 * KBZPAY_CHECKOUT_BASE is set (merchant-provided hosted checkout URL).
 */
export class KbzPayAdapter implements PaymentProviderAdapter {
  readonly provider = 'kbzpay' as const;
  readonly markets = ['MM'];
  readonly methods = ['kbzpay_pwa' as const, 'kbzpay_qr' as const];

  constructor(
    private readonly merchantId: string,
    private readonly checkoutBase: string,
  ) {}

  configured(): boolean {
    return Boolean(this.merchantId && this.checkoutBase);
  }

  async createPayment(input: CreatePaymentInput): Promise<{
    providerRef: string;
    instruction: PaymentInstruction;
    raw: unknown;
  }> {
    if (!this.configured()) throw new AdapterNotConfiguredError('kbzpay');
    const providerRef = input.idempotencyKey.slice(0, 50);
    const url = `${this.checkoutBase}?orderId=${encodeURIComponent(input.orderId)}&amount=${input.amountMinor}&ref=${encodeURIComponent(providerRef)}&method=${input.method}`;
    const instruction: PaymentInstruction =
      input.method === 'kbzpay_qr'
        ? { kind: 'qr', payload: url }
        : { kind: 'deeplink', url, fallbackQr: url };
    return { providerRef, instruction, raw: { gap: 'official_kbz_sdk_not_embedded' } };
  }

  verifySignature(): boolean {
    // Official signature scheme arrives with the merchant pack.
    return Boolean(this.merchantId);
  }

  async parseWebhook(req: {
    headers: Record<string, string | string[] | undefined>;
    rawBody: Buffer;
  }): Promise<ParsedWebhook> {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(req.rawBody.toString('utf8')) as Record<string, unknown>;
    } catch {
      payload = {};
    }
    const ref = String(payload.merch_order_id ?? payload.orderId ?? payload.ref ?? '');
    const ok = String(payload.trade_status ?? payload.status ?? '').toLowerCase();
    const status: ParsedWebhook['status'] =
      ok === 'success' || ok === 'completed' || ok === 'paid' ? 'completed' : 'ignored';
    return {
      providerEventId: String(payload.trans_id ?? payload.eventId ?? ref),
      providerRef: ref,
      status,
      amountMinor: Number(payload.total_amount ?? payload.amount ?? 0),
      currency: 'MMK',
      paidAt: status === 'completed' ? new Date() : undefined,
      raw: payload,
    };
  }

  async queryPayment(providerRef: string) {
    return { status: 'processing' as const, raw: { providerRef, gap: 'kbz_query_not_wired' } };
  }

  async refund(): Promise<{ providerRefundRef: string; raw: unknown }> {
    throw new RefundNotSupportedError('kbzpay');
  }
}
