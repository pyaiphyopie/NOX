import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IssuedTicket,
  OrderRow,
  PaymentRow,
  PaymentsStore,
  TicketTypeRow,
  WebhookRow,
} from './payments.service';
import { PaymentMethod, PaymentProvider, PaymentStatus, OrderStatus } from './types';

type Db = SupabaseClient;

function mapTicket(row: Record<string, unknown>): TicketTypeRow {
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    price: Number(row.price),
    currency: String(row.currency),
    quantityTotal: Number(row.quantity_total),
    quantitySold: Number(row.quantity_sold),
    quantityReserved: Number(row.quantity_reserved),
    maxPerOrder: Number(row.max_per_order),
    salesStartAt: row.sales_start_at ? new Date(String(row.sales_start_at)) : undefined,
    salesEndAt: row.sales_end_at ? new Date(String(row.sales_end_at)) : undefined,
    isActive: Boolean(row.is_active),
  };
}

export class SupabasePaymentsStore implements PaymentsStore {
  constructor(private readonly db: Db) {}

  static fromEnv(url: string, serviceRoleKey: string): SupabasePaymentsStore {
    return new SupabasePaymentsStore(createClient(url, serviceRoleKey, { auth: { persistSession: false } }));
  }

  async getTicketType(id: string): Promise<TicketTypeRow | undefined> {
    const { data, error } = await this.db.from('ticket_types').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? mapTicket(data) : undefined;
  }

  async reserve(ticketTypeId: string, qty: number): Promise<boolean> {
    const { data, error } = await this.db.rpc('reserve_ticket_type', { p_id: ticketTypeId, p_qty: qty });
    if (error) throw error;
    return Boolean(data);
  }

  async release(ticketTypeId: string, qty: number): Promise<void> {
    const { error } = await this.db.rpc('release_ticket_type', { p_id: ticketTypeId, p_qty: qty });
    if (error) throw error;
  }

  async convertReserveToSold(ticketTypeId: string, qty: number): Promise<void> {
    const { error } = await this.db.rpc('convert_reserve_to_sold', { p_id: ticketTypeId, p_qty: qty });
    if (error) throw error;
  }

  async findOrderByIdempotency(key: string): Promise<OrderRow | undefined> {
    const { data, error } = await this.db
      .from('orders')
      .select('*')
      .eq('idempotency_key', key)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    return data ? this.hydrateOrder(data) : undefined;
  }

  async findOrder(id: string): Promise<OrderRow | undefined> {
    const { data, error } = await this.db.from('orders').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? this.hydrateOrder(data) : undefined;
  }

  async saveOrder(order: OrderRow): Promise<void> {
    const { error } = await this.db.from('orders').upsert({
      id: order.id,
      user_id: order.userId,
      event_id: order.eventId,
      status: order.status,
      total_amount: order.totalAmount,
      currency: order.currency,
      ticket_count: order.ticketCount,
      payment_id: order.paymentId ?? null,
      idempotency_key: order.idempotencyKey,
      reservation_expires_at: order.reservationExpiresAt.toISOString(),
      metadata: { items: order.items },
    });
    if (error) throw error;
    await this.db.from('order_items').delete().eq('order_id', order.id);
    if (order.items.length) {
      const { error: itemError } = await this.db.from('order_items').insert(
        order.items.map((item) => ({
          order_id: order.id,
          ticket_type_id: item.ticketTypeId,
          qty: item.qty,
          unit_price: item.unitPrice,
        })),
      );
      if (itemError) throw itemError;
    }
  }

  async findPayment(id: string): Promise<PaymentRow | undefined> {
    const { data, error } = await this.db.from('payments').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapPayment(data) : undefined;
  }

  async findPaymentByProviderRef(provider: PaymentProvider, ref: string): Promise<PaymentRow | undefined> {
    const { data, error } = await this.db
      .from('payments')
      .select('*')
      .eq('provider', provider)
      .eq('provider_ref', ref)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    return data ? mapPayment(data) : undefined;
  }

  async savePayment(payment: PaymentRow): Promise<void> {
    const { error } = await this.db.from('payments').upsert({
      id: payment.id,
      order_id: payment.orderId,
      provider: payment.provider,
      provider_ref: payment.providerRef ?? null,
      method: payment.method,
      market: payment.market,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      idempotency_key: payment.idempotencyKey,
      instruction: payment.instruction ?? null,
      expires_at: payment.expiresAt.toISOString(),
      failure_code: payment.failureCode ?? null,
      failure_message: payment.failureMessage ?? null,
    });
    if (error) throw error;
  }

  async insertWebhook(row: WebhookRow): Promise<{ inserted: boolean }> {
    const { error } = await this.db.from('payment_webhooks').insert({
      provider: row.provider,
      provider_event_id: row.providerEventId,
      payment_id: row.paymentId ?? null,
      payload: {},
      signature_valid: true,
    });
    if (error && (error as { code?: string }).code === '23505') return { inserted: false };
    if (error) throw error;
    return { inserted: true };
  }

  async ticketsForOrder(orderId: string): Promise<IssuedTicket[]> {
    const { data, error } = await this.db.from('tickets').select('*').eq('order_id', orderId).is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map(mapTicketIssued);
  }

  async saveTickets(tickets: IssuedTicket[]): Promise<void> {
    if (!tickets.length) return;
    const { error } = await this.db.from('tickets').insert(
      tickets.map((t) => ({
        id: t.id,
        order_id: t.orderId,
        ticket_type_id: t.ticketTypeId,
        event_id: t.eventId,
        owner_id: t.ownerId,
        qr_payload: t.qrPayload,
        qr_signature: t.qrSignature,
        status: 'sold',
      })),
    );
    if (error) throw error;
  }

  async listExpirableOrders(now: Date): Promise<OrderRow[]> {
    const { data, error } = await this.db
      .from('orders')
      .select('*')
      .in('status', ['pending', 'payment_processing'])
      .lte('reservation_expires_at', now.toISOString())
      .is('deleted_at', null);
    if (error) throw error;
    const rows = [];
    for (const row of data ?? []) rows.push(await this.hydrateOrder(row));
    return rows;
  }

  private async hydrateOrder(row: Record<string, unknown>): Promise<OrderRow> {
    const meta = (row.metadata ?? {}) as { items?: OrderRow['items'] };
    let items = meta.items ?? [];
    if (!items.length) {
      const { data } = await this.db.from('order_items').select('*').eq('order_id', row.id);
      items = (data ?? []).map((item) => ({
        ticketTypeId: String(item.ticket_type_id),
        qty: Number(item.qty),
        unitPrice: Number(item.unit_price),
      }));
    }
    return {
      id: String(row.id),
      userId: String(row.user_id),
      eventId: String(row.event_id),
      status: row.status as OrderStatus,
      totalAmount: Number(row.total_amount),
      currency: String(row.currency),
      ticketCount: Number(row.ticket_count),
      paymentId: row.payment_id ? String(row.payment_id) : undefined,
      idempotencyKey: String(row.idempotency_key ?? ''),
      reservationExpiresAt: new Date(String(row.reservation_expires_at ?? row.created_at)),
      items,
    };
  }
}

function mapPayment(row: Record<string, unknown>): PaymentRow {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    provider: row.provider as PaymentProvider,
    providerRef: row.provider_ref ? String(row.provider_ref) : undefined,
    method: (row.method as PaymentMethod) ?? 'fake',
    market: String(row.market ?? 'MM'),
    amount: Number(row.amount),
    currency: String(row.currency),
    status: row.status as PaymentStatus,
    idempotencyKey: String(row.idempotency_key ?? ''),
    instruction: row.instruction as PaymentRow['instruction'],
    expiresAt: new Date(String(row.expires_at ?? row.created_at)),
    failureCode: row.failure_code ? String(row.failure_code) : undefined,
    failureMessage: row.failure_message ? String(row.failure_message) : undefined,
  };
}

function mapTicketIssued(row: Record<string, unknown>): IssuedTicket {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    ticketTypeId: String(row.ticket_type_id),
    eventId: String(row.event_id),
    ownerId: String(row.owner_id),
    qrPayload: String(row.qr_payload),
    qrSignature: String(row.qr_signature),
  };
}
