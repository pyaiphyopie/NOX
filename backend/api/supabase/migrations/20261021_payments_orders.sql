-- NOX payments schema (Supabase)
-- Matches backend/api/src/payments/types.ts unions and PaymentsStore interface.
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- Ticket inventory (PaymentsStore.getTicketType / reserve / release)
create table if not exists ticket_types (
  id            text primary key,
  event_id      text not null,
  name          text not null,
  price_minor   integer not null check (price_minor >= 0),
  currency      text not null default 'MMK' check (char_length(currency) = 3),
  total_qty     integer not null check (total_qty >= 0),
  sold_qty      integer not null default 0 check (sold_qty >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (sold_qty <= total_qty)
);

create index if not exists ticket_types_event_id_idx on ticket_types (event_id);

-- Orders + payments (CreatePaymentInput / ParsedWebhook / status unions)
create table if not exists payments_orders (
  id                  text primary key,
  order_id            text not null,
  payment_id          text not null,
  provider            text not null,
  method              text not null,
  market              text not null check (char_length(market) = 2),
  amount_minor        integer not null check (amount_minor >= 0),
  currency            text not null check (char_length(currency) = 3),
  status              text not null default 'pending'
                        check (status in (
                          'pending','payment_processing','paid','failed','cancelled','refunded','partially_refunded')),
  payment_status      text not null default 'pending'
                        check (payment_status in (
                          'pending','processing','completed','failed','expired','refund_pending','refunded','partially_refunded')),
  buyer_phone         text,
  buyer_email         text,
  buyer_display_name  text,
  description         text,
  return_url          text,
  notify_url          text,
  expires_at          timestamptz,
  idempotency_key     text not null,
  provider_event_id   text,
  provider_ref        text,
  paid_at             timestamptz,
  raw_webhook         jsonb,
  ticket_type_id      text references ticket_types (id),
  ticket_qty          integer not null default 1 check (ticket_qty >= 1),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (idempotency_key)
);

create index if not exists payments_orders_order_id_idx on payments_orders (order_id);
create index if not exists payments_orders_payment_id_idx on payments_orders (payment_id);
create index if not exists payments_orders_status_idx on payments_orders (status);
create index if not exists payments_orders_provider_event_idx on payments_orders (provider, provider_event_id);

-- updated_at trigger
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ticket_types_updated_at on ticket_types;
create trigger trg_ticket_types_updated_at
  before update on ticket_types
  for each row execute function set_updated_at();

drop trigger if exists trg_payments_orders_updated_at on payments_orders;
create trigger trg_payments_orders_updated_at
  before update on payments_orders
  for each row execute function set_updated_at();

-- RLS: service role only for now (API uses service key server-side)
alter table ticket_types enable row level security;
alter table payments_orders enable row level security;

-- Atomic reserve: decrement sold_qty only if capacity remains
create or replace function reserve_tickets(p_ticket_type_id text, p_qty integer)
returns boolean as $$
declare
  updated integer;
begin
  update ticket_types
     set sold_qty = sold_qty + p_qty
   where id = p_ticket_type_id
     and (total_qty - sold_qty) >= p_qty
  returning 1 into updated;
  return found;
end;
$$ language plpgsql;

create or replace function release_tickets(p_ticket_type_id text, p_qty integer)
returns void as $$
begin
  update ticket_types
     set sold_qty = greatest(sold_qty - p_qty, 0)
   where id = p_ticket_type_id;
end;
$$ language plpgsql;