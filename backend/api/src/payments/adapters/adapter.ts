import {
  CreatePaymentInput,
  ParsedWebhook,
  PaymentInstruction,
  PaymentMethod,
  PaymentProvider,
} from '../types';

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;
  readonly markets: string[];
  readonly methods: PaymentMethod[];

  createPayment(input: CreatePaymentInput): Promise<{
    providerRef: string;
    instruction: PaymentInstruction;
    raw: unknown;
  }>;

  verifySignature(req: {
    headers: Record<string, string | string[] | undefined>;
    rawBody: Buffer;
  }): boolean;

  parseWebhook(req: {
    headers: Record<string, string | string[] | undefined>;
    rawBody: Buffer;
  }): Promise<ParsedWebhook>;

  queryPayment(providerRef: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    raw: unknown;
  }>;

  refund?(input: {
    providerRef: string;
    amountMinor: number;
    reason: string;
    idempotencyKey: string;
  }): Promise<{ providerRefundRef: string; raw: unknown }>;
}
