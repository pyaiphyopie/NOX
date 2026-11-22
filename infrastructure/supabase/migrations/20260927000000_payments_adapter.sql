-- NOX ADR-004 — Payments adapter schema
-- Additive. Safe to apply after 20260802000000_initial_schema.sql
-- PG15 compatible (Supabase).

-- ---- enums ----
DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE 'payment_processing';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE 'partially_refunded';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE payment_status ADD VALUE 'expired';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE payment_status ADD VALUE 'refund_pending';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE payment_status ADD VALUE 'partially_refunded';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'kbzpay_pwa', 'kbzpay_qr', 'wavepay_pin', 'mmqr_dynamic',
    'ayapay', 'cbpay',
    'promptpay_qr', 'qris', 'va', 'gopay', 'dana', 'ovo',
    'gcash', 'maya', 'qrph',
    'momo', 'vietqr',
    'duitnow_qr', 'fpx', 'tng',
    'paynow', 'card',
    'fake'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN ALTER TYPE payment_provider ADD VALUE 'dinger'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE payment_provider ADD VALUE 'mmqr'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE payment_provider ADD VALUE 'xendit'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE payment_provider ADD VALUE 'hitpay'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE payment_provider ADD VALUE 'stripe'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE payment_provider ADD VALUE 'twoc2p'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE payment_provider ADD VALUE 'omise'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE payment_provider ADD VALUE 'fake'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- orders ----
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_reservation_expiry
  ON public.orders (reservation_expires_at)
  WHERE status IN ('pending', 'payment_processing') AND deleted_at IS NULL;

-- ---- payments ----
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS method payment_method,
  ADD COLUMN IF NOT EXISTS market CHAR(2) NOT NULL DEFAULT 'MM',
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS instruction JSONB,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_code TEXT,
  ADD COLUMN IF NOT EXISTS failure_message TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency
  ON public.payments (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_ref
  ON public.payments (provider, provider_ref)
  WHERE provider_ref IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_processing
  ON public.payments (status, updated_at)
  WHERE status IN ('pending', 'processing') AND deleted_at IS NULL;

-- ---- webhooks (durable idempotency) ----
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider payment_provider NOT NULL,
  provider_event_id TEXT NOT NULL,
  payment_id UUID REFERENCES public.payments(id),
  headers JSONB,
  payload JSONB NOT NULL,
  signature_valid BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  process_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_payment
  ON public.payment_webhooks (payment_id);

-- ---- attempts ----
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES public.payments(id),
  attempt_no INTEGER NOT NULL,
  request JSONB,
  response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment
  ON public.payment_attempts (payment_id);

-- ---- payouts (schema only; P2) ----
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.organizers(id),
  market CHAR(2) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL,
  provider payment_provider,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- service role bypasses RLS; no anon policies on money tables
COMMENT ON TABLE public.payment_webhooks IS 'ADR-004 durable webhook inbox. UNIQUE(provider, provider_event_id).';
COMMENT ON TABLE public.payments IS 'Source of truth for ticket money. Client success screens never issue tickets.';
