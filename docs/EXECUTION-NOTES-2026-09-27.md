# Execution notes — 2026-09-27

P0 payments adapter slice landed under `backend/api` (not a new microservice).

Shipped:
- Migration `20260927000000_payments_adapter.sql`
- Nest PaymentsModule + Fake / Wave / KBZ adapters
- Webhook raw-body route `POST /webhooks/payment/:provider`
- In-memory store + Jest matrix (idempotency, sold-out, duplicate webhook, bad signature, amount mismatch, TTL, free tickets)

Not shipped:
- Supabase-backed PaymentsStore
- JWT guard (uses `x-user-id` header)
- Live Wave/KBZ sandbox calls
- Flutter checkout UI
- Promoter payouts

Run:
```
cd backend/api && pnpm install && pnpm test
PAYMENTS_MODE=fake pnpm dev
```
