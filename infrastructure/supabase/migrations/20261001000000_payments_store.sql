-- NOX-7: atomic inventory + order line items for PaymentsStore
-- Service role only. No anon policies.

CREATE OR REPLACE FUNCTION public.reserve_ticket_type(p_id UUID, p_qty INTEGER)
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
  SET quantity_reserved = quantity_reserved + p_qty,
      updated_at = NOW()
  WHERE id = p_id
    AND deleted_at IS NULL
    AND is_active
    AND quantity_total - quantity_sold - quantity_reserved >= p_qty;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_ticket_type(p_id UUID, p_qty INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ticket_types
  SET quantity_reserved = GREATEST(0, quantity_reserved - p_qty),
      updated_at = NOW()
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.convert_reserve_to_sold(p_id UUID, p_qty INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ticket_types
  SET quantity_reserved = GREATEST(0, quantity_reserved - p_qty),
      quantity_sold = quantity_sold + p_qty,
      updated_at = NOW()
  WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_ticket_type(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_ticket_type(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.convert_reserve_to_sold(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_ticket_type(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_ticket_type(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.convert_reserve_to_sold(UUID, INTEGER) TO service_role;

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.order_items IS 'NOX-7 line items. Service role writes. Buyer identity comes from JWT, not a header.';
