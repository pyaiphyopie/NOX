# NOX Execution Notes — 13 Aug 2026

## Confirmed Decisions

1. **Architecture**: Modular monolith under `backend/api`. ADR-001 accepted.
2. **Schema**: Gap-fill migration produced (`20260814000000_schema_gap_fill.sql`). Additive only.
3. **Next priority order**:
   - Apply schema migration
   - Wire Auth (Supabase + Redis) + harden rate limits
   - Flutter integration against live auth endpoints
   - Strengthen CI (NestJS + Flutter awareness)

## Schema Migration

File: `infrastructure/supabase/migrations/20260814000000_schema_gap_fill.sql`

Key additions:
- profiles
- roles / permissions / role_permissions / user_roles
- venue_verifications + organizer_verifications
- organizer_staff
- event_categories + event_category_map
- order_items
- ticket_transfers
- payment_webhooks (idempotency)
- scanner_devices
- followed_organizers
- reports + moderation_actions
- Expanded event_status enum
- Basic RLS policies

**Apply command (after linking Supabase project):**
```bash
supabase db push
# or
psql $DATABASE_URL -f infrastructure/supabase/migrations/20260814000000_schema_gap_fill.sql
```

## Auth + Redis + Flutter (Phase 2)

Current state:
- `backend/auth-service` exists with AuthModule, UsersModule, RedisModule scaffold.
- OTP + JWT + refresh rotation partially implemented.
- Not yet production-wired to Supabase Auth / real Redis.

Required next steps:
1. Confirm Redis connection (Upstash or self-hosted) and env vars.
2. Harden OTP: rate limit by phone + IP, attempt limits, short TTL, abuse protection.
3. Link public.users ↔ auth.users (Supabase) via trigger or explicit sync on first login.
4. Flutter: secure storage for tokens, Dio interceptor for refresh, proper error surfaces.
5. Google / Apple OAuth after phone path is stable.

## CI Improvements Needed

Current `.github/workflows/ci.yml` is still oriented around legacy Vite/JS frontend (eslint on .js/.jsx, prettier on src/, vitest).

Target:
- PR: lint + typecheck + unit tests + build (Node + Flutter where applicable)
- Main: above + security scan (pnpm audit / Trivy / CodeQL) + smoke
- Separate jobs for `backend/api` (NestJS) once monorepo layout is cleaned.

## Immediate Repo Actions (Recommended)

1. Create branch `chore/schema-gap-fill-and-adr`
2. Add migration + ADR-001 + this note under `docs/` and `infrastructure/supabase/migrations/`
3. Open PR for review
4. Apply migration to staging Supabase
5. Begin Auth production wiring on a follow-up branch

## Owner

NOX Core (CODY) + Jake final approval on any destructive or payment-related changes.
