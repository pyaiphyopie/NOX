# NOX Platform

**Urban Entertainment Infrastructure**  
**Own The Night**

NOX is the digital operating system for nightlife economies — connecting consumers, venues, promoters, artists, and payment ecosystems across emerging markets. Starting in Yangon, designed for ASEAN expansion.

## Architecture

```
nox-platform/
├── apps/
│   ├── mobile-app/          # Flutter consumer app (Riverpod + GoRouter)
│   ├── organizer-dashboard/ # Next.js
│   ├── venue-dashboard/     # Next.js
│   ├── admin-panel/         # Next.js
│   └── qr-scanner/          # Flutter offline-capable scanner
├── backend/
│   ├── api-gateway/
│   ├── auth-service/        # Phone OTP + JWT rotation
│   ├── event-service/
│   ├── ticket-service/
│   ├── payment-service/     # KBZPay / WavePay / AYA / CB
│   ├── notification-service/
│   └── analytics-service/
├── packages/
│   ├── design-tokens/       # NOX Black / Electric Cyan / Neon Violet
│   ├── shared-types/
│   ├── shared-utils/
│   └── ui-kit/
├── infrastructure/
│   ├── supabase/migrations/ # Production schema + RLS
│   ├── docker/
│   └── github-actions/
└── docs/
```

## Design System

| Token            | Value     |
|------------------|-----------|
| NOX Black        | `#070707` |
| Deep Graphite    | `#141414` |
| Electric Cyan    | `#00AEEF` |
| Neon Violet      | `#8B5CF6` |
| Ice White        | `#F5F7FA` |
| Emerald Pulse    | `#00D68F` |

Typography: **Satoshi** (primary) / Inter (fallback)  
Dark mode first · Cinematic · Luxury minimalism

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Mobile     | Flutter + Riverpod + GoRouter + Hive |
| Web        | Next.js + TypeScript + Tailwind     |
| Backend    | NestJS + TypeScript                 |
| Database   | PostgreSQL (Supabase) + RLS         |
| Auth       | Phone OTP (primary) + JWT rotation  |
| Payments   | KBZPay, WavePay, AYA Pay, CBPay     |
| Infra      | Docker, GitHub Actions, Vercel, Cloudflare |

## Phase 1 Status (Foundation)

- [x] Turborepo monorepo root
- [x] Design tokens package
- [x] Shared types (domain models + API contracts)
- [x] Supabase initial schema (users, venues, organizers, events, tickets, orders, payments, checkins, RLS)
- [x] Auth Service (NestJS) — Phone OTP + JWT + refresh rotation
- [x] Flutter consumer app foundation (Discovery, Auth, Event Detail, Tickets, Profile)
- [ ] Organizer / Venue / Admin dashboards (Phase 4)
- [ ] Ticket engine + QR generation + offline validation (Phase 5)
- [ ] Payment webhooks (Phase 2)

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Flutter ≥ 3.24
- Docker (optional)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment
cp .env.example .env

# Start auth service (dev)
cd backend/auth-service && pnpm dev

# Flutter
cd apps/mobile-app
flutter pub get
flutter run
```

### Database

```bash
# Apply migrations (requires Supabase CLI + project linked)
supabase db push
```

## Core User Journey

```
DISCOVER → DECIDE → BOOK → ENTER → EXPERIENCE
```

## Security Principles

- Defense in depth
- RBAC (consumer / organizer / venue / scanner / admin)
- JWT access + refresh token rotation
- Rate limiting on auth endpoints
- Soft deletes + audit logs
- Duplicate QR protection
- Webhook signature verification

## Mission

NOX is not an event marketplace.  
NOX is Urban Entertainment Infrastructure.

**Own The Night.**
