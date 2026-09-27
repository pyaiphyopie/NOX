import { AdapterRegistry } from './registry';
import { ConfigService } from '@nestjs/config';
import {
  InMemoryPaymentsStore,
  PaymentsService,
} from './payments.service';
import { AmountMismatchError } from './types';

function registry(mode = 'fake') {
  return new AdapterRegistry({
    get: (key: string, fallback?: string) => {
      const map: Record<string, string> = {
        PAYMENTS_MODE: mode,
        PAYMENTS_FAKE_SECRET: 'dev-fake-secret',
        PUBLIC_API_URL: 'http://localhost:3002',
        WAVEPAY_MERCHANT_ID: '',
        WAVEPAY_API_KEY: '',
        KBZPAY_MERCHANT_ID: '',
        KBZPAY_CHECKOUT_BASE: '',
      };
      return map[key] ?? fallback;
    },
  } as unknown as ConfigService);
}

function seed() {
  const store = new InMemoryPaymentsStore();
  store.ticketTypes.set('ga', {
    id: 'ga',
    eventId: 'evt-1',
    price: 15000,
    currency: 'MMK',
    quantityTotal: 2,
    quantitySold: 0,
    quantityReserved: 0,
    maxPerOrder: 2,
    isActive: true,
  });
  const service = new PaymentsService(
    store,
    registry(),
    'ticket-secret',
    'http://localhost:3002',
    60,
  );
  return { store, service };
}

describe('PaymentsService', () => {
  it('reserves inventory and returns fake instruction', async () => {
    const { store, service } = seed();
    const result = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'k1',
    });
    expect(result.order.status).toBe('payment_processing');
    expect(result.instruction.kind).toBe('fake_confirm');
    expect(store.getTicketType('ga')?.quantityReserved).toBe(1);
    expect(store.getTicketType('ga')?.quantitySold).toBe(0);
  });

  it('is idempotent on create', async () => {
    const { service } = seed();
    const a = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'same',
    });
    const b = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'same',
    });
    expect(a.order.id).toBe(b.order.id);
  });

  it('returns 409 semantics when sold out', async () => {
    const { service } = seed();
    await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 2 }],
      idempotencyKey: 'full',
    });
    await expect(
      service.createOrder({
        userId: 'u2',
        eventId: 'evt-1',
        market: 'MM',
        method: 'fake',
        items: [{ ticketTypeId: 'ga', qty: 1 }],
        idempotencyKey: 'overflow',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('issues tickets once on completed webhook and ignores duplicates', async () => {
    const { service, store } = seed();
    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 2 }],
      idempotencyKey: 'pay',
    });
    const body = {
      providerRef: created.payment.providerRef,
      paymentId: created.payment.id,
      status: 'completed',
      amountMinor: 30000,
      currency: 'MMK',
      eventId: 'evt-wh-1',
    };
    const raw = Buffer.from(JSON.stringify(body));
    const first = await service.handleWebhook({
      provider: 'fake',
      headers: { 'x-nox-fake-secret': 'dev-fake-secret' },
      rawBody: raw,
    });
    expect(first.issued).toBe(2);
    expect(store.getTicketType('ga')?.quantitySold).toBe(2);
    expect(store.getTicketType('ga')?.quantityReserved).toBe(0);
    const second = await service.handleWebhook({
      provider: 'fake',
      headers: { 'x-nox-fake-secret': 'dev-fake-secret' },
      rawBody: raw,
    });
    expect(second.duplicate).toBe(true);
    expect(store.tickets.length).toBe(2);
  });

  it('rejects invalid webhook signatures', async () => {
    const { service } = seed();
    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'sig',
    });
    await expect(
      service.handleWebhook({
        provider: 'fake',
        headers: { 'x-nox-fake-secret': 'wrong' },
        rawBody: Buffer.from(
          JSON.stringify({
            providerRef: created.payment.providerRef,
            amountMinor: 15000,
            currency: 'MMK',
          }),
        ),
      }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('quarantines amount mismatch and does not issue tickets', async () => {
    const { service, store } = seed();
    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'mismatch',
    });
    await expect(
      service.handleWebhook({
        provider: 'fake',
        headers: { 'x-nox-fake-secret': 'dev-fake-secret' },
        rawBody: Buffer.from(
          JSON.stringify({
            providerRef: created.payment.providerRef,
            paymentId: created.payment.id,
            status: 'completed',
            amountMinor: 1,
            currency: 'MMK',
            eventId: 'evt-bad-amt',
          }),
        ),
      }),
    ).rejects.toBeInstanceOf(AmountMismatchError);
    expect(store.tickets.length).toBe(0);
    expect(store.findOrder(created.order.id)?.status).toBe('payment_processing');
  });

  it('expires reservations and releases inventory', async () => {
    const { service, store } = seed();
    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'ttl',
    });
    created.order.reservationExpiresAt = new Date(Date.now() - 1000);
    const n = service.expireReservations(new Date());
    expect(n).toBe(1);
    expect(store.findOrder(created.order.id)?.status).toBe('cancelled');
    expect(store.getTicketType('ga')?.quantityReserved).toBe(0);
  });

  it('skips adapter for free tickets and issues immediately', async () => {
    const { store, service } = seed();
    store.ticketTypes.set('free', {
      id: 'free',
      eventId: 'evt-1',
      price: 0,
      currency: 'MMK',
      quantityTotal: 10,
      quantitySold: 0,
      quantityReserved: 0,
      maxPerOrder: 2,
      isActive: true,
    });
    const result = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'free', qty: 1 }],
      idempotencyKey: 'free',
    });
    expect(result.order.status).toBe('paid');
    expect(store.tickets.length).toBe(1);
    expect(store.tickets[0].qrSignature).toHaveLength(64);
  });
});
