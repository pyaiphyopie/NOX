import { AdapterRegistry } from './registry';
import { ConfigService } from '@nestjs/config';
import {
  InMemoryPaymentsStore,
  PaymentsService,
  retainOrderStatus,
  retainPaymentStatus,
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
    store.saveOrder(created.order);
    const n = await service.expireReservations(new Date());
    expect(n).toBe(1);
    expect(store.findOrder(created.order.id)?.status).toBe('cancelled');
    expect(store.getTicketType('ga')?.quantityReserved).toBe(0);
  });

  it('releases prior reserves when a later multi-item line is sold out', async () => {
    const { store, service } = seed();
    store.ticketTypes.set('vip', {
      id: 'vip',
      eventId: 'evt-1',
      price: 50000,
      currency: 'MMK',
      quantityTotal: 0,
      quantitySold: 0,
      quantityReserved: 0,
      maxPerOrder: 2,
      isActive: true,
    });
    await expect(
      service.createOrder({
        userId: 'u1',
        eventId: 'evt-1',
        market: 'MM',
        method: 'fake',
        items: [
          { ticketTypeId: 'ga', qty: 1 },
          { ticketTypeId: 'vip', qty: 1 },
        ],
        idempotencyKey: 'multi-partial',
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(store.getTicketType('ga')?.quantityReserved).toBe(0);
    expect(store.getTicketType('vip')?.quantityReserved).toBe(0);
    expect(store.orders.size).toBe(0);
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

describe('PaymentsService integrity fixes', () => {
  it('awaits free-order ticket issuance even with an async store', async () => {
    const base = new InMemoryPaymentsStore();
    base.ticketTypes.set('free', {
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
    // Wrap every method in a microtask so missing awaits surface as empty tickets.
    const store: InMemoryPaymentsStore = new Proxy(base, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        if (typeof value !== 'function') return value;
        return (...args: unknown[]) => {
          const result = (value as (...a: unknown[]) => unknown).apply(target, args);
          return Promise.resolve(result);
        };
      },
    }) as InMemoryPaymentsStore;

    const service = new PaymentsService(
      store,
      registry(),
      'ticket-secret',
      'http://localhost:3002',
      60,
    );
    const result = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'free', qty: 1 }],
      idempotencyKey: 'free-async',
    });
    expect(result.order.status).toBe('paid');
    // Give any floating promise a turn; tickets must already be present.
    await Promise.resolve();
    expect(base.tickets.length).toBe(1);
    expect(base.getTicketType('free')?.quantitySold).toBe(1);
  });

  it('scopes idempotency keys per buyer', async () => {
    const { service, store } = seed();
    const a = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'shared-key',
    });
    const b = await service.createOrder({
      userId: 'u2',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'shared-key',
    });
    expect(a.order.id).not.toBe(b.order.id);
    expect(a.order.userId).toBe('u1');
    expect(b.order.userId).toBe('u2');
    expect(a.order.idempotencyKey).toBe('u1:shared-key');
    expect(b.order.idempotencyKey).toBe('u2:shared-key');
    expect(store.orders.size).toBe(2);
  });

  it('does not overwrite a paid order when expiry races', async () => {
    const { service, store } = seed();
    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'race-ttl',
    });
    // Webhook marks paid after the expiry job listed candidates (TOCTOU).
    store.transitionOrder(created.order.id, ['payment_processing'], 'paid');
    (store as InMemoryPaymentsStore & {
      listExpirableOrders?: (now: Date) => Promise<import('./payments.service').OrderRow[]>;
    }).listExpirableOrders = async () => {
      const order = store.findOrder(created.order.id);
      return order ? [order] : [];
    };
    const n = await service.expireReservations(new Date());
    expect(n).toBe(0);
    expect(store.findOrder(created.order.id)?.status).toBe('paid');
    expect(store.getTicketType('ga')?.quantityReserved).toBe(1);
  });

  it('cancel uses compare-and-set and skips release when already paid', async () => {
    const { service, store } = seed();
    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'cancel-cas',
    });
    store.transitionOrder(created.order.id, ['payment_processing'], 'paid');
    await expect(service.cancel(created.order.id, 'u1')).rejects.toMatchObject({ status: 409 });
    expect(store.getTicketType('ga')?.quantityReserved).toBe(1);
  });

  it('does not consume a webhook event when the payment is missing so a retry can issue tickets', async () => {
    const { service, store } = seed();
    await expect(
      service.handleWebhook({
        provider: 'fake',
        headers: { 'x-nox-fake-secret': 'dev-fake-secret' },
        rawBody: Buffer.from(
          JSON.stringify({
            providerRef: 'fake_not_yet',
            paymentId: 'not-yet',
            status: 'completed',
            amountMinor: 15000,
            currency: 'MMK',
            eventId: 'evt-early-1',
          }),
        ),
      }),
    ).rejects.toMatchObject({ status: 404 });
    expect(store.webhooks.size).toBe(0);

    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'early-wh',
    });
    const result = await service.handleWebhook({
      provider: 'fake',
      headers: { 'x-nox-fake-secret': 'dev-fake-secret' },
      rawBody: Buffer.from(
        JSON.stringify({
          providerRef: created.payment.providerRef,
          paymentId: created.payment.id,
          status: 'completed',
          amountMinor: 15000,
          currency: 'MMK',
          eventId: 'evt-early-1',
        }),
      ),
    });
    expect(result.duplicate).toBe(false);
    expect(result.issued).toBe(1);
    expect(store.findOrder(created.order.id)?.status).toBe('paid');
    expect(store.tickets.length).toBe(1);
  });

  it('does not let saveOrder downgrade a paid order to payment_processing', async () => {
    const { service, store } = seed();
    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'no-downgrade',
    });
    store.transitionOrder(created.order.id, ['payment_processing'], 'paid');
    store.saveOrder({ ...created.order, status: 'payment_processing' });
    expect(store.findOrder(created.order.id)?.status).toBe('paid');
    expect(retainOrderStatus('paid', 'payment_processing')).toBe('paid');
  });

  it('does not let savePayment downgrade a completed payment to processing', async () => {
    const { service, store } = seed();
    const created = await service.createOrder({
      userId: 'u1',
      eventId: 'evt-1',
      market: 'MM',
      method: 'fake',
      items: [{ ticketTypeId: 'ga', qty: 1 }],
      idempotencyKey: 'pay-no-downgrade',
    });
    const payment = store.findPayment(created.payment.id)!;
    payment.status = 'completed';
    store.savePayment(payment);
    store.savePayment({ ...payment, status: 'processing' });
    expect(store.findPayment(created.payment.id)?.status).toBe('completed');
    expect(retainPaymentStatus('completed', 'processing')).toBe('completed');
  });

  it('does not release inventory when the provider fails after a webhook has already paid', async () => {
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
    const originalSave = store.savePayment.bind(store);
    store.savePayment = (payment) => {
      originalSave(payment);
      if (payment.status === 'pending') {
        store.transitionOrder(payment.orderId, ['payment_processing'], 'paid');
        originalSave({ ...payment, status: 'completed' });
      }
    };
    const registry = {
      mode: 'fake',
      resolve: () => ({
        provider: 'fake',
        createPayment: async () => {
          throw new Error('provider timeout');
        },
      }),
    } as unknown as AdapterRegistry;
    const service = new PaymentsService(store, registry, 'ticket-secret', 'http://localhost:3002', 60);
    await expect(
      service.createOrder({
        userId: 'u1',
        eventId: 'evt-1',
        market: 'MM',
        method: 'fake',
        items: [{ ticketTypeId: 'ga', qty: 1 }],
        idempotencyKey: 'paid-then-timeout',
      }),
    ).rejects.toThrow(/provider timeout/);
    expect(store.findOrder([...store.orders.keys()][0])?.status).toBe('paid');
    expect(store.getTicketType('ga')?.quantityReserved).toBe(1);
    expect(store.getTicketType('ga')?.quantitySold).toBe(0);
    expect(store.findPayment([...store.payments.keys()][0])?.status).toBe('completed');
  });
});
