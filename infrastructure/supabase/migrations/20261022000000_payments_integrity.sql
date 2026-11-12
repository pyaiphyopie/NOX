-- NOX-7 follow-up: atomic order+items write and compare-and-set status transitions.
-- Service role only.

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
      status = EXCLUDED.status,
      total_amount = EXCLUDED.total_amount,
      currency = EXCLUDED.currency,
      ticket_count = EXCLUDED.ticket_count,
      payment_id = EXCLUDED.payment_id,
      reservation_expires_at = EXCLUDED.reservation_expires_at,
      updated_at = NOW();
  END IF;

  -- Items are immutable after first write: only insert when none exist.
  IF NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id = p_id) THEN
    INSERT INTO public.order_items (order_id, ticket_type_id, qty, unit_price)
    SELECT
      p_id,
      (item->>'ticket_type_id')::UUID,
      (item->>'qty')::INTEGER,
      (item->>'unit_price')::INTEGER
    FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) AS item;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_order_status(
  p_id UUID,
  p_from order_status[],
  p_to order_status
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.orders;
BEGIN
  UPDATE public.orders
  SET status = p_to,
      updated_at = NOW()
  WHERE id = p_id
    AND deleted_at IS NULL
    AND status = ANY (p_from)
  RETURNING * INTO updated;
  RETURN updated;
END;
$$;

REVOKE ALL ON FUNCTION public.save_order_with_items(
  UUID, UUID, UUID, order_status, INTEGER, TEXT, INTEGER, UUID, TEXT, TIMESTAMPTZ, JSONB, TEXT
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.transition_order_status(UUID, order_status[], order_status) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_order_with_items(
  UUID, UUID, UUID, order_status, INTEGER, TEXT, INTEGER, UUID, TEXT, TIMESTAMPTZ, JSONB, TEXT
) TO service_role;
GRANT EXECUTE ON FUNCTION public.transition_order_status(UUID, order_status[], order_status) TO service_role;

COMMENT ON FUNCTION public.save_order_with_items IS
  'NOX-7 atomic order + order_items write. insert mode raises 23505 on idempotency clash.';
COMMENT ON FUNCTION public.transition_order_status IS
  'NOX-7 compare-and-set order status. Returns NULL when from-status did not match.';
