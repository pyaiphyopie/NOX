# Phase 1 — Foundation Execution Report

**Date:** 2026-08-02  
**Owner:** NOX Core  
**Status:** Complete (local scaffold)

## Deliverables

| Item | Status | Location |
|------|--------|----------|
| Turborepo + pnpm workspace | ✅ | `/` |
| Design tokens | ✅ | `packages/design-tokens` |
| Shared domain types | ✅ | `packages/shared-types` |
| Supabase schema + RLS | ✅ | `infrastructure/supabase/migrations` |
| Auth Service (NestJS) | ✅ | `backend/auth-service` |
| Flutter consumer foundation | ✅ | `apps/mobile-app` |
| CI skeleton | ✅ | `infrastructure/github-actions/ci.yml` |
| Docker (auth) | ✅ | `infrastructure/docker` |

## Auth Flow Implemented

```
POST /auth/login          → request OTP (Myanmar phone)
POST /auth/verify-otp     → verify + issue access + refresh tokens
POST /auth/refresh        → rotate refresh token
POST /auth/logout         → invalidate refresh token
```

- JWT access token (15m default)
- Opaque refresh token with rotation
- Redis store (with in-memory fallback)
- Phone normalization for Myanmar (+95)

## Database Tables

users · venues · organizers · events · ticket_types · tickets · orders · payments · checkins · saved_events · notifications · venue_staff · audit_logs

All tables use:
- UUID primary keys
- `created_at` / `updated_at` / `deleted_at` (soft delete)
- Appropriate indexes
- Basic RLS policies

## Flutter Screens Delivered

- Auth (Phone OTP)
- Discovery (Hero + Genre filters + Tonight’s Pulse + Trending)
- Event Detail (Hero, info, ticket tiers, Secure Entry CTA)
- My Tickets
- Profile
- Main shell with bottom navigation

## Next Actions (Phase 2)

1. Wire Auth Service to real Supabase + Redis
2. Event Service + Ticket Service (scaffolded)
3. Payment provider adapters (KBZPay / WavePay first)
4. Connect Flutter to live API
5. QR payload generation + signature

## Assumptions Documented

- Primary auth = Phone OTP (Myanmar market)
- Currency = MMK (integer minor units)
- Soft deletes everywhere
- No proprietary wallet in MVP
- External payment redirect + webhook verification

---

**NOX = Urban Entertainment Infrastructure**  
**Mission: Own The Night**
