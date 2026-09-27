import { createHmac, timingSafeEqual } from 'crypto';
import { PaymentProviderAdapter } from './adapter';
import {
  AdapterNotConfiguredError,
  CreatePaymentInput,
  ParsedWebhook,
  PaymentInstruction,
  RefundNotSupportedError,
} from '../types';

/**
 * WavePay Payment Gateway adapter.
 *
 * Official hosts (from Wave PG docs):
 *   test: https://testpayments.wavemoney.io:8107/payment
 *   prod: https://payments.wavemoney.io/payment
 *
 * Hash algorithm MUST be re-verified against the merchant pack Wave issues.
 * Current construction: HMAC-SHA256(merchant_id + order_id + amount + merchant_reference_id, secret)
 * hex digest, lowercase. If Wave's pack specifies a different concat order, change ONLY this file.
 *
 * Callback URL must be public HTTPS :443 with a public CA (Wave rejects self-signed).
 */
export class WavePayAdapter implements PaymentProviderAdapter {
  readonly provider = 'wavepay' as const;
  readonly markets = ['MM'];
  readonly methods = ['wavepay_pin' as const];

  constructor(
    private readonly merchantId: string,
    private readonly secret: string,
    private readonly endpoint: string,
  ) {}

  configured(): boolean {
    return Boolean(this.merchantId && this.secret && this.endpoint);
  }

  async createPayment(input: CreatePaymentInput): Promise<{
    providerRef: string;
    instruction: PaymentInstruction;
    raw: unknown;
  }> {
    if (!this.configured()) throw new AdapterNotConfiguredError('wavepay');
    const merchantReferenceId = input.idempotencyKey.slice(0, 50);
    const amount = String(input.amountMinor);
    const hash = signWave(
      this.secret,
      this.merchantId,
      input.orderId,
      amount,
      merchantReferenceId,
    );
    const ttl = Math.max(
      60,
      Math.floor((input.expiresAt.getTime() - Date.now()) / 1000),
    );
    const params = {
      merchant_id: this.merchantId,
      order_id: input.orderId,
      merchant_reference_id: merchantReferenceId,
      frontend_result_url: input.returnUrl,
      backend_result_url: input.notifyUrl,
      amount,
      time_to_live_in_seconds: String(ttl),
      hash,
    };
    const qs = new URLSearchParams(params).toString();
    return {
      providerRef: merchantReferenceId,
      instruction: { kind: 'redirect', url: `${this.endpoint}?${qs}` },
      raw: { endpoint: this.endpoint, order_id: input.orderId },
    };
  }

  verifySignature(req: {
    headers: Record<string, string | string[] | undefined>;
    rawBody: Buffer;
  }): boolean {
    if (!this.configured()) return false;
    const payload = parseBody(req.rawBody);
    const incoming = String(payload.hash ?? payload.Hash ?? '');
    if (!incoming) return false;
    const expected = signWave(
      this.secret,
      String(payload.merchant_id ?? this.merchantId),
      String(payload.order_id ?? ''),
      String(payload.amount ?? ''),
      String(payload.merchant_reference_id ?? ''),
    );
    const a = Buffer.from(incoming.toLowerCase());
    const b = Buffer.from(expected.toLowerCase());
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  async parseWebhook(req: {
    headers: Record<string, string | string[] | undefined>;
    rawBody: Buffer;
  }): Promise<ParsedWebhook> {
    const payload = parseBody(req.rawBody);
    const statusRaw = String(payload.status ?? payload.transaction_status ?? '').toLowerCase();
    const status: ParsedWebhook['status'] =
      statusRaw === 'success' || statusRaw === 'completed' || statusRaw === 'paid'
        ? 'completed'
        : statusRaw === 'expired'
          ? 'expired'
          : statusRaw === 'failed' || statusRaw === 'fail'
            ? 'failed'
            : 'ignored';
    const ref = String(payload.merchant_reference_id ?? payload.order_id ?? '');
    return {
      providerEventId: String(payload.transaction_id ?? payload.txn_id ?? ref),
      providerRef: ref,
      status,
      amountMinor: Number(payload.amount ?? 0),
      currency: 'MMK',
      paidAt: status === 'completed' ? new Date() : undefined,
      raw: payload,
    };
  }

  async queryPayment(providerRef: string) {
    return { status: 'processing' as const, raw: { providerRef, gap: 'wave_query_not_wired' } };
  }

  async refund(): Promise<{ providerRefundRef: string; raw: unknown }> {
    throw new RefundNotSupportedError('wavepay');
  }
}

export function signWave(
  secret: string,
  merchantId: string,
  orderId: string,
  amount: string,
  merchantReferenceId: string,
): string {
  return createHmac('sha256', secret)
    .update(`${merchantId}${orderId}${amount}${merchantReferenceId}`)
    .digest('hex');
}

function parseBody(raw: Buffer): Record<string, unknown> {
  const text = raw.toString('utf8');
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }
}
