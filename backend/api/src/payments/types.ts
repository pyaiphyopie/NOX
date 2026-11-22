export const PAYMENT_PROVIDERS = [
  'kbzpay',
  'wavepay',
  'ayapay',
  'cbpay',
  'dinger',
  'mmqr',
  'xendit',
  'hitpay',
  'stripe',
  'twoc2p',
  'omise',
  'fake',
] as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_METHODS = [
  'kbzpay_pwa',
  'kbzpay_qr',
  'wavepay_pin',
  'mmqr_dynamic',
  'ayapay',
  'cbpay',
  'promptpay_qr',
  'qris',
  'va',
  'gopay',
  'dana',
  'ovo',
  'gcash',
  'maya',
  'qrph',
  'momo',
  'vietqr',
  'duitnow_qr',
  'fpx',
  'tng',
  'paynow',
  'card',
  'fake',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type OrderStatus =
  | 'pending'
  | 'payment_processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'refund_pending'
  | 'refunded'
  | 'partially_refunded';

export type PaymentInstruction =
  | { kind: 'redirect'; url: string }
  | { kind: 'deeplink'; url: string; fallbackQr?: string }
  | { kind: 'qr'; payload: string; imageUrl?: string }
  | { kind: 'va'; bank: string; account: string; name: string }
  | { kind: 'pin_wait'; message: string }
  | { kind: 'fake_confirm'; confirmUrl: string };

export interface CreatePaymentInput {
  paymentId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  market: string;
  method: PaymentMethod;
  buyer: { phone?: string; email?: string; displayName?: string };
  description: string;
  returnUrl: string;
  notifyUrl: string;
  expiresAt: Date;
  idempotencyKey: string;
}

export interface ParsedWebhook {
  providerEventId: string;
  providerRef: string;
  status: 'completed' | 'failed' | 'expired' | 'refunded' | 'ignored';
  amountMinor: number;
  currency: string;
  paidAt?: Date;
  raw: unknown;
}

export class RefundNotSupportedError extends Error {
  constructor(provider: string) {
    super(`Refund not supported on adapter ${provider}`);
    this.name = 'RefundNotSupportedError';
  }
}

export class AdapterNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} credentials missing. Use PAYMENTS_MODE=fake locally.`);
    this.name = 'AdapterNotConfiguredError';
  }
}

export class AmountMismatchError extends Error {
  constructor() {
    super('Webhook amount/currency does not match payment row');
    this.name = 'AmountMismatchError';
  }
}

export const MM_METHODS: PaymentMethod[] = [
  'kbzpay_pwa',
  'kbzpay_qr',
  'wavepay_pin',
  'mmqr_dynamic',
  'ayapay',
  'cbpay',
  'fake',
];

export function methodsForMarket(market: string, mode: string): PaymentMethod[] {
  if (mode === 'fake') return ['fake'];
  switch (market.toUpperCase()) {
    case 'MM':
      return ['kbzpay_pwa', 'kbzpay_qr', 'wavepay_pin', 'mmqr_dynamic'];
    case 'TH':
      return ['promptpay_qr', 'card'];
    case 'ID':
      return ['qris', 'va', 'gopay', 'dana', 'ovo'];
    case 'PH':
      return ['gcash', 'maya', 'qrph'];
    case 'VN':
      return ['momo', 'vietqr'];
    case 'MY':
      return ['duitnow_qr', 'fpx', 'tng'];
    case 'SG':
      return ['paynow', 'card'];
    default:
      return [];
  }
}

export function providerForMethod(method: PaymentMethod): PaymentProvider {
  if (method === 'fake') return 'fake';
  if (method.startsWith('kbzpay') || method === 'mmqr_dynamic') return 'kbzpay';
  if (method.startsWith('wavepay')) return 'wavepay';
  if (method === 'ayapay') return 'ayapay';
  if (method === 'cbpay') return 'cbpay';
  if (method === 'promptpay_qr') return 'twoc2p';
  if (['qris', 'va', 'gopay', 'dana', 'ovo', 'gcash', 'maya', 'qrph'].includes(method)) {
    return 'xendit';
  }
  if (['duitnow_qr', 'fpx', 'tng'].includes(method)) return 'hitpay';
  if (['paynow', 'card'].includes(method)) return 'stripe';
  if (['momo', 'vietqr'].includes(method)) return 'xendit';
  return 'fake';
}

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['payment_processing', 'cancelled', 'failed', 'paid'],
  payment_processing: ['paid', 'failed', 'cancelled'],
  paid: ['refunded', 'partially_refunded'],
  failed: [],
  cancelled: [],
  refunded: [],
  partially_refunded: ['refunded'],
};

export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['processing', 'failed', 'expired'],
  processing: ['completed', 'failed', 'expired'],
  completed: ['refund_pending', 'refunded', 'partially_refunded'],
  failed: [],
  expired: [],
  refund_pending: ['refunded', 'partially_refunded', 'completed'],
  refunded: [],
  partially_refunded: ['refunded'],
};

export function canTransition<T extends string>(
  map: Record<T, T[]>,
  from: T,
  to: T,
): boolean {
  return from === to || map[from].includes(to);
}
