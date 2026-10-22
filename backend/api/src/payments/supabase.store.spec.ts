import { SupabasePaymentsStore } from './supabase.store';
import { OrderRow } from './payments.service';

type FakeResult = { data?: unknown; error?: { code?: string; message?: string } | null };

function createFakeDb(handlers: {
  from?: (table: string) => unknown;
  rpc?: (fn: string, args: Record<string, unknown>) => Promise<FakeResult> | FakeResult;
}) {
  return {
    from: (table: string) => {
      if (!handlers.from) throw new Error(`unexpected from(${table})`);
      return handlers.from(table);
    },
    rpc: (fn: string, args: Record<string, unknown>) => {
      if (!handlers.rpc) throw new Error(`unexpected rpc(${fn})`);
      return handlers.rpc(fn, args);
    },
  };
}

describe('SupabasePaymentsStore', () => {
  const sampleOrder: OrderRow = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: '22222222-2222-2222-2222-222222222222',
    eventId: '33333333-3333-3333-3333-333333333333',
    status: 'payment_processing',
    totalAmount: 15000,
    currency: 'MMK',
    ticketCount: 1,
    paymentId: '44444444-4444-4444-4444-444444444444',
    idempotencyKey: 'u1:k1',
    reservationExpiresAt: new Date('2026-10-22T00:00:00Z'),
    items: [{ ticketTypeId: '55555555-5555-5555-5555-555555555555', qty: 1, unitPrice: 15000 }],
  };

  it('claimOrder returns duplicate on 23505', async () => {
    const store = new SupabasePaymentsStore(
      createFakeDb({
        rpc: async () => ({ error: { code: '23505', message: 'duplicate' } }),
      }) as never,
    );
    await expect(store.claimOrder(sampleOrder)).resolves.toBe('duplicate');
  });

  it('claimOrder inserts via save_order_with_items', async () => {
    let seen: Record<string, unknown> | undefined;
    const store = new SupabasePaymentsStore(
      createFakeDb({
        rpc: async (fn, args) => {
          expect(fn).toBe('save_order_with_items');
          seen = args;
          return { data: null, error: null };
        },
      }) as never,
    );
    await expect(store.claimOrder(sampleOrder)).resolves.toBe('inserted');
    expect(seen?.p_mode).toBe('insert');
    expect(seen?.p_idempotency_key).toBe('u1:k1');
    expect(seen?.p_user_id).toBe(sampleOrder.userId);
  });

  it('findOrderByIdempotency filters by user_id', async () => {
    const filters: string[] = [];
    const store = new SupabasePaymentsStore(
      createFakeDb({
        from: () => {
          const chain: Record<string, unknown> = {};
          const self = () => chain;
          chain.select = self;
          chain.eq = (col: string, val: string) => {
            filters.push(`${col}=${val}`);
            return chain;
          };
          chain.is = self;
          chain.maybeSingle = async () => ({ data: null, error: null });
          return chain;
        },
      }) as never,
    );
    await store.findOrderByIdempotency('u1:k1', sampleOrder.userId);
    expect(filters).toContain('idempotency_key=u1:k1');
    expect(filters).toContain(`user_id=${sampleOrder.userId}`);
  });

  it('transitionOrder returns undefined when RPC returns null', async () => {
    const store = new SupabasePaymentsStore(
      createFakeDb({
        rpc: async () => ({ data: null, error: null }),
      }) as never,
    );
    await expect(
      store.transitionOrder(sampleOrder.id, ['payment_processing'], 'cancelled'),
    ).resolves.toBeUndefined();
  });

  it('insertWebhook treats 23505 as not inserted', async () => {
    const store = new SupabasePaymentsStore(
      createFakeDb({
        from: () => ({
          insert: async () => ({ error: { code: '23505' } }),
        }),
      }) as never,
    );
    await expect(
      store.insertWebhook({ provider: 'fake', providerEventId: 'evt-1' }),
    ).resolves.toEqual({ inserted: false });
  });
});
