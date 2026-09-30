-- RunSheet live strip — SKETCH ONLY
-- Not applied. Not verified against a live database.
-- Guestlist omitted (no table). Comps omitted unless ticket_types encode them later.

-- :event_id uuid

SELECT
  e.id AS event_id,
  e.title,
  v.capacity AS capacity,
  (
    SELECT COUNT(*)::int
    FROM public.tickets t
    WHERE t.event_id = e.id
      AND t.deleted_at IS NULL
      AND t.status IN ('sold', 'issued', 'paid', 'active')
  ) AS sold,
  (
    SELECT COUNT(*)::int
    FROM public.checkins c
    WHERE c.event_id = e.id
      AND c.deleted_at IS NULL
  ) AS scanned,
  (
    SELECT COUNT(*)::int
    FROM public.checkins c
    WHERE c.event_id = e.id
      AND c.deleted_at IS NULL
      AND c.created_at >= NOW() - INTERVAL '15 minutes'
  ) AS scans_last_15m
FROM public.events e
JOIN public.venues v ON v.id = e.venue_id
WHERE e.id = :event_id
  AND e.deleted_at IS NULL;

-- TODO Week 1: confirm ticket.status enum values in 20260802000000_initial_schema.sql
-- TODO Week 1: capacity may live on events, not venues — check columns before shipping
