# ADR-004 — Payments adapter

Status: Accepted  
Date: 2026-09-19  
Implemented: 2026-09-27  

Full spec: see companion document in repo root conversation artifact and `docs/adr/ADR-004-payments-adapter-spec.md`.

## Decision

NOX collects ticket money through a NestJS Payments module inside `backend/api` (modular monolith, ADR-001). Adapters are thin. Postgres is source of truth. Client success screens never issue tickets.

P0 adapters: Fake (local), WavePay (official PG hosts), KBZPay (hosted checkout URL only until merchant pack arrives).

P2 adapters (Xendit, HitPay, Stripe, 2C2P) are typed in the registry/enums but not implemented. MMK never routes through those PSPs.

## Consequences

- Apply `infrastructure/supabase/migrations/20260927000000_payments_adapter.sql` before production webhooks.
- Wave hash concat order must be re-verified against the Wave merchant pack (`signWave` in `wavepay.adapter.ts`).
- `PAYMENTS_MODE=fake` is forbidden in production.
- Auth is still `x-user-id` on the P0 slice; swap for JWT guard when auth-service migrates into `backend/api`.
