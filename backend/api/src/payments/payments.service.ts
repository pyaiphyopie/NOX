import { createHash, createHmac, randomUUID } from 'crypto';
import {
  AmountMismatchError,
  CreatePaymentInput,
  OrderStatus,
  PaymentInstruction,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  canTransition,
  methodsForMarket,
  ORDER_TRANSITIONS,
  PAYMENT_TRANSITIONS,
} from './types';
import { AdapterRegistry } from './registry';

export interface TicketTypeRow {
  id: string;
  eventId: string;
  price: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  quantityReserved: number;
  maxPerOrder: number;
  salesStartAt?: Date;
  salesEndAt?: Date;
  isActive: boolean;
}

export interface OrderRow {
  id: string;
  userId: string;
  eventId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  ticketCount: number;
  paymentId?: string;
  idempotencyKey: string;
  reservationExpiresAt: Date;
  items: { ticketTypeId: string; qty: number; unitPrice: number }[];
}

export interface PaymentRow {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerRef?: string;
  method: PaymentMethod;
  market: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotencyKey: string;
  instruction?: PaymentInstruction;
  expiresAt: Date;
  failureCode?: string;
  failureMessage?: string;
}

export interface WebhookRow {
  provider: PaymentProvider;
  providerEventId: string;
  paymentId?: string;
}

export interface IssuedTicket {
  id: string;
  orderId: string;
  ticketTypeId: string;
  eventId: string;
  ownerId: string;
  qrPayload: string;
  qrSignature: string;
}

export interface PaymentsStore {
  getTicketType(id: string): TicketTypeRow | undefined;
  reserve(ticketTypeId: string, qty: number): boolean;
  release(ticketTypeId: string, qty: number): void;
  convertReserveToSold(ticketTypeId: string, qty: number): void;
  findOrderByIdempotency(key: string): OrderRow | undefined;
  findOrder(id: string): OrderRow | undefined;
  saveOrder(order: OrderRow): void;
  findPayment(id: string): PaymentRow | undefined;
  findPaymentByProviderRef(provider: PaymentProvider, ref: string): PaymentRow | undefined;
  savePayment(payment: PaymentRow): void;
  insertWebhook(row: WebhookRow): { inserted: boolean };
  ticketsForOrder(orderId: string): IssuedTicket[];
  saveTickets(tickets: IssuedTicket[]): void;
}

export class InMemoryPaymentsStore implements PaymentsStore {
  ticketTypes = new Map<string, TicketTypeRow>();
  orders = new Map<string, OrderRow>();
  payments = new Map<string, PaymentRow>();
  webhooks = new Set<string>();
  tickets: IssuedTicket[] = [];

  getTicketType(id: string) {
    return this.ticketTypes.get(id);
  }
  reserve(ticketTypeId: string, qty: number): boolean {
    const tt = this.ticketTypes.get(ticketTypeId);
    if (!tt) return false;
    if (tt.quantityTotal - tt.quantitySold - tt.quantityReserved < qty) return false;
    tt.quantityReserved += qty;
    return true;
  }
  release(ticketTypeId: string, qty: number): void {
    const tt = this.ticketTypes.get(ticketTypeId);
    if (!tt) return;
    tt.quantityReserved = Math.max(0, tt.quantityReserved - qty);
  }
  convertReserveToSold(ticketTypeId: string, qty: number): void {
    const tt = this.ticketTypes.get(ticketTypeId);
    if (!tt) return;
    tt.quantityReserved = Math.max(0, tt.quantityReserved - qty);
    tt.quantitySold += qty;
  }
  findOrderByIdempotency(key: string) {
    return [...this.orders.values()].find((o) => o.idempotencyKey === key);
  }
  findOrder(id: string) {
    return this.orders.get(id);
  }
  saveOrder(order: OrderRow) {
    this.orders.set(order.id, order);
  }
  findPayment(id: string) {
    return this.payments.get(id);
  }
  findPaymentByProviderRef(provider: PaymentProvider, ref: string) {
    return [...this.payments.values()].find(
      (p) => p.provider === provider && p.providerRef === ref,
    );
  }
  savePayment(payment: PaymentRow) {
    this.payments.set(payment.id, payment);
  }
  insertWebhook(row: WebhookRow) {
    const key = `${row.provider}:${row.providerEventId}`;
    if (this.webhooks.has(key)) return { inserted: false };
    this.webhooks.add(key);
    return { inserted: true };
  }
  ticketsForOrder(orderId: string) {
    return this.tickets.filter((t) => t.orderId === orderId);
  }
  saveTickets(tickets: IssuedTicket[]) {
    this.tickets.push(...tickets);
  }
}

export interface CreateOrderCommand {
  userId: string;
  eventId: string;
  market: string;
  items: { ticketTypeId: string; qty: number }[];
  method: PaymentMethod;
  idempotencyKey?: string;
  buyer?: { phone?: string; displayName?: string };
}

export class PaymentsService {
  constructor(
    private readonly store: PaymentsStore,
    private readonly registry: AdapterRegistry,
    private readonly ticketHmacSecret: string,
    private readonly publicApiUrl: string,
    private readonly reservationTtlSec = 15 * 60,
  ) {}

  listMethods(market: string): PaymentMethod[] {
    return methodsForMarket(market, this.registry.mode);
  }

  async createOrder(cmd: CreateOrderCommand): Promise<{
    order: OrderRow;
    payment: PaymentRow;
    instruction: PaymentInstruction;
  }> {
    const idempotencyKey =
      cmd.idempotencyKey ??
      defaultIdempotency(cmd.userId, cmd.eventId, cmd.items, cmd.method);

    const existing = this.store.findOrderByIdempotency(idempotencyKey);
    if (existing) {
      const payment = existing.paymentId
        ? this.store.findPayment(existing.paymentId)
        : undefined;
      if (!payment) throw new Error('Existing order missing payment');
      return {
        order: existing,
        payment,
        instruction: payment.instruction ?? { kind: 'pin_wait', message: 'pending' },
      };
    }

    if (!this.listMethods(cmd.market).includes(cmd.method) && this.registry.mode !== 'fake') {
      throw Object.assign(new Error('Method not available in market'), { status: 400 });
    }

    let total = 0;
    let currency = 'MMK';
    let ticketCount = 0;
    const priced: OrderRow['items'] = [];

    for (const item of cmd.items) {
      const tt = this.store.getTicketType(item.ticketTypeId);
      if (!tt || !tt.isActive || tt.eventId !== cmd.eventId) {
        throw Object.assign(new Error('Invalid ticket type'), { status: 400 });
      }
      if (item.qty < 1 || item.qty > tt.maxPerOrder) {
        throw Object.assign(new Error('Quantity not allowed'), { status: 400 });
      }
      const now = new Date();
      if (tt.salesStartAt && now < tt.salesStartAt) {
        throw Object.assign(new Error('Sales not open'), { status: 400 });
      }
      if (tt.salesEndAt && now > tt.salesEndAt) {
        throw Object.assign(new Error('Sales closed'), { status: 400 });
      }
      if (!this.store.reserve(item.ticketTypeId, item.qty)) {
        throw Object.assign(new Error('Sold out'), { status: 409 });
      }
      total += tt.price * item.qty;
      currency = tt.currency;
      ticketCount += item.qty;
      priced.push({ ticketTypeId: item.ticketTypeId, qty: item.qty, unitPrice: tt.price });
    }

    const orderId = randomUUID();
    const paymentId = randomUUID();
    const expiresAt = new Date(Date.now() + this.reservationTtlSec * 1000);

    const order: OrderRow = {
      id: orderId,
      userId: cmd.userId,
      eventId: cmd.eventId,
      status: 'payment_processing',
      totalAmount: total,
      currency,
      ticketCount,
      paymentId,
      idempotencyKey,
      reservationExpiresAt: expiresAt,
      items: priced,
    };

    const adapter = this.registry.resolve(cmd.method);
    const payment: PaymentRow = {
      id: paymentId,
      orderId,
      provider: adapter.provider,
      method: this.registry.mode === 'fake' ? 'fake' : cmd.method,
      market: cmd.market,
      amount: total,
      currency,
      status: 'pending',
      idempotencyKey: `${idempotencyKey}:pay`,
      expiresAt,
    };

    const notifyUrl = `${this.publicApiUrl}/webhooks/payment/${adapter.provider}`;
    const input: CreatePaymentInput = {
      paymentId,
      orderId,
      amountMinor: total,
      currency,
      market: cmd.market,
      method: payment.method,
      buyer: cmd.buyer ?? {},
      description: `NOX tickets ${cmd.eventId}`,
      returnUrl: `${this.publicApiUrl}/orders/${orderId}`,
      notifyUrl,
      expiresAt,
      idempotencyKey,
    };

    try {
      if (total === 0) {
        payment.status = 'completed';
        payment.providerRef = `free_${paymentId}`;
        payment.instruction = { kind: 'pin_wait', message: 'free' };
        order.status = 'paid';
        this.issueTickets(order);
      } else {
        const created = await adapter.createPayment(input);
        payment.providerRef = created.providerRef;
        payment.instruction = created.instruction;
        payment.status = 'processing';
      }
    } catch (err) {
      for (const item of priced) this.store.release(item.ticketTypeId, item.qty);
      order.status = 'failed';
      payment.status = 'failed';
      payment.failureMessage = err instanceof Error ? err.message : 'create_failed';
      this.store.saveOrder(order);
      this.store.savePayment(payment);
      throw err;
    }

    this.store.saveOrder(order);
    this.store.savePayment(payment);
    return { order, payment, instruction: payment.instruction! };
  }

  async handleWebhook(args: {
    provider: PaymentProvider;
    headers: Record<string, string | string[] | undefined>;
    rawBody: Buffer;
  }): Promise<{ duplicate: boolean; paymentId?: string; issued: number }> {
    const adapter = this.registry.get(args.provider);
    if (!adapter.verifySignature(args)) {
      throw Object.assign(new Error('Invalid webhook signature'), { status: 401 });
    }
    return this.applyParsedWebhook(
      args.provider,
      (req) => adapter.parseWebhook(req),
      args,
    );
  }

  async applyParsedWebhook(
    provider: PaymentProvider,
    parse: (req: {
      headers: Record<string, string | string[] | undefined>;
      rawBody: Buffer;
    }) => Promise<{
      providerEventId: string;
      providerRef: string;
      status: 'completed' | 'failed' | 'expired' | 'refunded' | 'ignored';
      amountMinor: number;
      currency: string;
    }>,
    req: {
      headers: Record<string, string | string[] | undefined>;
      rawBody: Buffer;
    },
  ): Promise<{ duplicate: boolean; paymentId?: string; issued: number }> {
    const parsed = await parse(req);
    const inserted = this.store.insertWebhook({
      provider,
      providerEventId: parsed.providerEventId,
    });
    if (!inserted.inserted) {
      const existing = this.store.findPaymentByProviderRef(provider, parsed.providerRef);
      return {
        duplicate: true,
        paymentId: existing?.id,
        issued: existing ? this.store.ticketsForOrder(existing.orderId).length : 0,
      };
    }
    if (parsed.status === 'ignored') {
      return { duplicate: false, issued: 0 };
    }

    const payment = this.store.findPaymentByProviderRef(provider, parsed.providerRef);
    if (!payment) {
      throw Object.assign(new Error('Payment not found for providerRef'), { status: 404 });
    }
    if (parsed.status === 'completed') {
      if (parsed.amountMinor !== payment.amount || parsed.currency !== payment.currency) {
        payment.failureCode = 'amount_mismatch';
        this.store.savePayment(payment);
        throw new AmountMismatchError();
      }
    }

    const nextPayment: PaymentStatus =
      parsed.status === 'completed'
        ? 'completed'
        : parsed.status === 'expired'
          ? 'expired'
          : parsed.status === 'refunded'
            ? 'refunded'
            : 'failed';

    if (!canTransition(PAYMENT_TRANSITIONS, payment.status, nextPayment)) {
      return { duplicate: false, paymentId: payment.id, issued: 0 };
    }

    const order = this.store.findOrder(payment.orderId);
    if (!order) throw new Error('Order missing');

    payment.status = nextPayment;
    this.store.savePayment(payment);

    if (nextPayment === 'completed') {
      if (!canTransition(ORDER_TRANSITIONS, order.status, 'paid')) {
        return { duplicate: false, paymentId: payment.id, issued: this.store.ticketsForOrder(order.id).length };
      }
      order.status = 'paid';
      this.store.saveOrder(order);
      const issued = this.issueTickets(order);
      return { duplicate: false, paymentId: payment.id, issued: issued.length };
    }

    if (nextPayment === 'failed' || nextPayment === 'expired') {
      if (canTransition(ORDER_TRANSITIONS, order.status, nextPayment === 'expired' ? 'cancelled' : 'failed')) {
        order.status = nextPayment === 'expired' ? 'cancelled' : 'failed';
        this.store.saveOrder(order);
      }
      for (const item of order.items) this.store.release(item.ticketTypeId, item.qty);
    }

    return { duplicate: false, paymentId: payment.id, issued: 0 };
  }

  expireReservations(now = new Date()): number {
    let n = 0;
    // store implementations other than memory are responsible for querying expiry
    if (this.store instanceof InMemoryPaymentsStore) {
      for (const order of this.store.orders.values()) {
        if (
          (order.status === 'pending' || order.status === 'payment_processing') &&
          order.reservationExpiresAt <= now
        ) {
          order.status = 'cancelled';
          this.store.saveOrder(order);
          if (order.paymentId) {
            const payment = this.store.findPayment(order.paymentId);
            if (payment && canTransition(PAYMENT_TRANSITIONS, payment.status, 'expired')) {
              payment.status = 'expired';
              this.store.savePayment(payment);
            }
          }
          for (const item of order.items) this.store.release(item.ticketTypeId, item.qty);
          n += 1;
        }
      }
    }
    return n;
  }

  getOrder(id: string, userId: string): OrderRow {
    const order = this.store.findOrder(id);
    if (!order || order.userId !== userId) {
      throw Object.assign(new Error('Order not found'), { status: 404 });
    }
    return order;
  }

  cancel(orderId: string, userId: string): OrderRow {
    const order = this.getOrder(orderId, userId);
    if (!canTransition(ORDER_TRANSITIONS, order.status, 'cancelled')) {
      throw Object.assign(new Error('Order cannot be cancelled'), { status: 409 });
    }
    order.status = 'cancelled';
    this.store.saveOrder(order);
    if (order.paymentId) {
      const payment = this.store.findPayment(order.paymentId);
      if (payment && canTransition(PAYMENT_TRANSITIONS, payment.status, 'expired')) {
        payment.status = 'expired';
        this.store.savePayment(payment);
      }
    }
    for (const item of order.items) this.store.release(item.ticketTypeId, item.qty);
    return order;
  }

  private issueTickets(order: OrderRow): IssuedTicket[] {
    if (this.store.ticketsForOrder(order.id).length > 0) {
      return this.store.ticketsForOrder(order.id);
    }
    const tickets: IssuedTicket[] = [];
    for (const item of order.items) {
      this.store.convertReserveToSold(item.ticketTypeId, item.qty);
      for (let i = 0; i < item.qty; i++) {
        const id = randomUUID();
        const payload = JSON.stringify({
          ticket_id: id,
          event_id: order.eventId,
          issued_at: new Date().toISOString(),
          version: 1,
        });
        tickets.push({
          id,
          orderId: order.id,
          ticketTypeId: item.ticketTypeId,
          eventId: order.eventId,
          ownerId: order.userId,
          qrPayload: payload,
          qrSignature: createHmac('sha256', this.ticketHmacSecret).update(payload).digest('hex'),
        });
      }
    }
    this.store.saveTickets(tickets);
    return tickets;
  }
}

export function defaultIdempotency(
  userId: string,
  eventId: string,
  items: { ticketTypeId: string; qty: number }[],
  method: PaymentMethod,
): string {
  const sorted = [...items]
    .sort((a, b) => a.ticketTypeId.localeCompare(b.ticketTypeId))
    .map((i) => `${i.ticketTypeId}x${i.qty}`)
    .join(',');
  const hour = new Date().toISOString().slice(0, 13);
  return createHash('sha256')
    .update(`${userId}:${eventId}:${sorted}:${method}:${hour}`)
    .digest('hex');
}
