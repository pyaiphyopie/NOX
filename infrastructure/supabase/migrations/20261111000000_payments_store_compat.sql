-- NOX-7 follow-up: align PaymentsStore RPCs with the existing order_items
-- schema (quantity, total_price, currency), prevent paid-status downgrades,
-- and refuse inventory underflow. Service role only. Do not apply remotely
-- from this change set.

-- Existing 20260814000000 table uses quantity/total_price/currency.
-- The 20261001 CREATE TABLE IF NOT EXISTS (qty) is a no-op when that table exists.

CREATE OR REPLACE FUNCTION public.save_order_with_items(
  p_id UUID,
  p_user_id UUID,
  p_event_id UUID,
  p_status order_status,
  p_total_amount INTEGER,
  p_currency TEXT,
  p_ticket_count INTEGER,
  p_payment_id UUID,
  p_idempotency_key TEXT,
  p_reservation_expires_at TIMESTAMPTZ,
  p_items JSONB,
  p_mode TEXT DEFAULT 'upsert'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_mode = 'insert' THEN
    INSERT INTO public.orders (
      id, user_id, event_id, status, total_amount, currency, ticket_count,
      payment_id, idempotency_key, reservation_expires_at, metadata
    ) VALUES (
      p_id, p_user_id, p_event_id, p_status, p_total_amount, p_currency, p_ticket_count,
      p_payment_id, p_idempotency_key, p_reservation_expires_at, '{}'::jsonb
    );
  ELSE
    INSERT INTO public.orders (
      id, user_id, event_id, status, total_amount, currency, ticket_count,
      payment_id, idempotency_key, reservation_expires_at, metadata
    ) VALUES (
      p_id, p_user_id, p_event_id, p_status, p_total_amount, p_currency, p_ticket_count,
      p_payment_id, p_idempotency_key, p_reservation_expires_at, '{}'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      status = CASE
        WHEN public.orders.status IN ('paid', 'cancelled', 'failed', 'refunded', 'partially_refunded')
          AND EXCLUDED.status IS DISTINCT FROM public.orders.status
        THEN public.orders.status
        ELSE EXCLUDED.status
      END,
      total_amount = EXCLUDED.total_amount,
      currency = EXCLUDED.currency,
      ticket_count = EXCLUDED.ticket_count,
      payment_id = COALESCE(EXCLUDED.payment_id, public.orders.payment_id),
      reservation_expires_at = EXCLUDED.reservation_expires_at,
      updated_at = NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id = p_id) THEN
    INSERT INTO public.order_items (order_id, ticket_type_id, quantity, unit_price, total_price, currency)
    SELECT
      p_id,
      (item->>'ticket_type_id')::UUID,
      (item->>'qty')::INTEGER,
      (item->>'unit_price')::INTEGER,
      (item->>'qty')::INTEGER * (item->>'unit_price')::INTEGER,
      p_currency
    FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) AS item;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_payment(
  p_id UUID,
  p_order_id UUID,
  p_provider payment_provider,
  p_provider_ref TEXT,
  p_method payment_method,
  p_market CHAR(2),
  p_amount INTEGER,
  p_currency TEXT,
  p_status payment_status,
  p_idempotency_key TEXT,
  p_instruction JSONB,
  p_expires_at TIMESTAMPTZ,
  p_failure_code TEXT,
  p_failure_message TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payments (
    id, order_id, provider, provider_ref, method, market, amount, currency,
    status, idempotency_key, instruction, expires_at, failure_code, failure_message
  ) VALUES (
    p_id, p_order_id, p_provider, p_provider_ref, p_method, p_market, p_amount, p_currency,
    p_status, p_idempotency_key, p_instruction, p_expires_at, p_failure_code, p_failure_message
  )
  ON CONFLICT (id) DO UPDATE SET
    provider_ref = COALESCE(EXCLUDED.provider_ref, public.payments.provider_ref),
    instruction = COALESCE(EXCLUDED.instruction, public.payments.instruction),
    status = CASE
      WHEN public.payments.status IN ('completed', 'refunded', 'partially_refunded')
        AND EXCLUDED.status IS DISTINCT FROM public.payments.status
      THEN public.payments.status
      WHEN public.payments.status IN ('failed', 'expired')
        AND EXCLUDED.status IN ('pending', 'processing')
      THEN public.payments.status
      ELSE EXCLUDED.status
    END,
    failure_code = EXCLUDED.failure_code,
    failure_message = EXCLUDED.failure_message,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();
END;
$$;

DROP FUNCTION IF EXISTS public.release_ticket_type(UUID, INTEGER);
CREATE FUNCTION public.release_ticket_type(p_id UUID, p_qty INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated INTEGER;
BEGIN
  IF p_qty < 1 THEN
    RETURN FALSE;
  END IF;
  UPDATE public.ticket_types
  SET quantity_reserved = quantity_reserved - p_qty,
      updated_at = NOW()
  WHERE id = p_id
    AND quantity_reserved >= p_qty;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated = 1;
END;
$$;

DROP FUNCTION IF EXISTS public.convert_reserve_to_sold(UUID, INTEGER);
CREATE FUNCTION public.convert_reserve_to_sold(p_id UUID, p_qty INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated INTEGER;
BEGIN
  IF p_qty < 1 THEN
    RETURN FALSE;
  END IF;
  UPDATE public.ticket_types
  SET quantity_reserved = quantity_reserved - p_qty,
      quantity_sold = quantity_sold + p_qty,
      updated_at = NOW()
  WHERE id = p_id
    AND quantity_reserved >= p_qty
    AND quantity_sold + p_qty <= quantity_total;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated = 1;
END;
$$;

ALTER TABLE public.ticket_types
  DROP CONSTRAINT IF EXISTS ticket_types_inventory_bounds;

ALTER TABLE public.ticket_types
  ADD CONSTRAINT ticket_types_inventory_bounds
  CHECK (
    quantity_sold >= 0
    AND quantity_reserved >= 0
    AND quantity_sold + quantity_reserved <= quantity_total
  ) NOT VALID;

ALTER TABLE public.ticket_types
  VALIDATE CONSTRAINT ticket_types_inventory_bounds;

REVOKE ALL ON FUNCTION public.save_order_with_items(
  UUID, UUID, UUID, order_status, INTEGER, TEXT, INTEGER, UUID, TEXT, TIMESTAMPTZ, JSONB, TEXT
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_payment(
  UUID, UUID, payment_provider, TEXT, payment_method, CHAR(2), INTEGER, TEXT, payment_status, TEXT, JSONB, TIMESTAMPTZ, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_ticket_type(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.convert_reserve_to_sold(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_ticket_type(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transition_order_status(UUID, order_status[], order_status) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.save_order_with_items(
  UUID, UUID, UUID, order_status, INTEGER, TEXT, INTEGER, UUID, TEXT, TIMESTAMPTZ, JSONB, TEXT
) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_payment(
  UUID, UUID, payment_provider, TEXT, payment_method, CHAR(2), INTEGER, TEXT, payment_status, TEXT, JSONB, TIMESTAMPTZ, TEXT, TEXT
) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_ticket_type(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.convert_reserve_to_sold(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_ticket_type(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.transition_order_status(UUID, order_status[], order_status) TO service_role;

COMMENT ON FUNCTION public.save_order_with_items IS
  'NOX-7 atomic order + order_items write against quantity/total_price/currency. Upsert will not downgrade terminal order status. insert mode raises 23505 on idempotency clash.';
COMMENT ON FUNCTION public.save_payment IS
  'NOX-7 payment upsert that will not downgrade completed/refunded (or failed/expired back to pending/processing).';
COMMENT ON FUNCTION public.release_ticket_type IS
  'Decrement reserved only when reserved >= qty. Returns false instead of clamping and stealing other reservations.';
