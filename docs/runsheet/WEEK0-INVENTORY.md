# RunSheet Week 0 Inventory

**Date:** 2026-09-10  
**Repo:** `pyaiphyopie/NOX@main` (`dbe1a7dad`)  
**Status:** Inventory only. No RunSheet domain code. Do not merge as "built."

## Fixture event (placeholder)

Jake authorized Week 0 without a named venue. Until a real event row exists:

| Field | Value |
|---|---|
| Fixture key | `fixture.yangon.club_night.unassigned` |
| Venue | TBD — Jake names one Yangon venue |
| Event | TBD — upcoming Saturday after schema apply |
| Template | `club_night` only |
| Guestlist | **Out of MVP** (no `guestlists` table) |
| Promoter identity | `organizer_staff` flag (no collaborator table) |
| Brief | Deterministic only |
| Night 1 surface | Venue web tablet if scanner APK slips |

Replace this table before Week 1 generate is tested against a live event id.

## What exists in repo

| Area | Reality |
|---|---|
| Architecture ADR | `docs/adr/ADR-001-modular-monolith.md` — accepted. Target home is `backend/api`. |
| Backend code | Only `backend/auth-service` scaffold. **`backend/api` is not in this tree.** |
| Schema | `infrastructure/supabase/migrations/20260802000000_initial_schema.sql` + `20260814000000_schema_gap_fill.sql` |
| Documented tables | users, venues, organizers, events, ticket_types, tickets, orders, payments, checkins, saved_events, notifications, venue_staff, audit_logs + gap-fill (profiles, roles, organizer_staff, scanner_devices, order_items, ticket_transfers, payment_webhooks, …) |
| Dashboards | Organizer/venue/admin marked Phase 4 / not shipped. Legacy Vite `src/pages/PromotersPage.jsx` is prototype UI, not the Next dashboard. |
| Scanner / Flutter | Consumer foundation claimed in Phase 1 notes. No RunSheet surface. |
| Feature flags | None found. |
| Guestlist / promoter attribution tables | **Absent** |
| RunSheet tables | **Absent** |

## Gap vs RunSheet plan

| Plan dependency | In migrations? | Week 1 action |
|---|---|---|
| events + starts_at/capacity | events exist (confirm columns in initial schema before generate) | Read-only live strip |
| tickets sold count | tickets + ticket_types + orders | Aggregate, do not write |
| checkins scanned count | checkins | Aggregate |
| venue_staff / organizer_staff | yes | Map night roles |
| scanner_devices | gap-fill | Assign door captain later |
| guestlist remaining | no | Live strip field = 0 / omit |
| promoter attribution | no | Settlement lines empty in MVP |
| `backend/api` Nest modules | no | Must scaffold monolith module `runsheet` *or* park API until api package exists |
| RLS patterns | basic policies on core tables | New tables follow same pattern |
| `runsheet_v1` flag | no | Stub added this PR (docs + env example only) |

## Blocker (honest)

Week 1 API cannot land as production Nest code until `backend/api` exists. Options:

1. Create `backend/api` modular monolith (ADR-001) then add `modules/runsheet`.
2. Keep RunSheet as SQL + docs until Phase 2 auth/api catch-up.

Recommended: do not pretend RunSheet can ship on `auth-service` alone.

## Exit criteria for this PR

- [x] Schema gap list written from repo, not from memory
- [x] ADR-R1–R5 drafted
- [x] Flag name reserved: `runsheet_v1`
- [x] Live-strip SQL sketch (untested against a live DB)
- [x] Fixture placeholder recorded
- [ ] Jake replaces fixture TBD with venue + event date
- [ ] No feature code claimed complete
