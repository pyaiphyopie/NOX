# NOX Architecture Reality

**Status:** CURRENT LAW (living)  
**Last verified:** 2026-10-24 Asia/Rangoon  
**Scope:** What exists on `main` today — not product aspiration.

Copyright in this work and related NOX materials is held personally by **Pyai Phyo Pie / ပြည့်ဖြိုးပိုင်**. Do not list trading names as the copyright holder.

---

## Architecture law (cite these, not the May PDF)

| ADR | Title | Role |
|-----|-------|------|
| [ADR-001](adr/ADR-001-modular-monolith.md) | Modular Monolith | Current structure law: NestJS domain modules under `backend/api`. No new microservice tree. |
| [ADR-004](adr/ADR-004-payments-adapter.md) | Payments adapter | Payments live in the monolith; thin adapters; Postgres is source of truth. Spec: [ADR-004-payments-adapter-spec.md](adr/ADR-004-payments-adapter-spec.md). |

If an ADR and this page disagree on *intent*, update the ADR. If they disagree on *what is on disk*, update this page.

---

## Archived intent (not a repo map)

| Artifact | Status |
|----------|--------|
| Google Drive PDF **Nox Technical Architecture Repository.pdf** (file id `1RymbKiAeQdsQIgLMOKqpKaHtbqqWhVmI`, modified **2026-05-12**) | **ARCHIVED INTENT** |

The May PDF remains a good **product thesis** (lean MVP, mobile-first nightlife OS, external MM wallets, path to scale). It is **not** an accurate map of this repository. Planning from it without this page will invent services and apps that are not on `main`.

---

## Live tree (verified 2026-10-24)

```
NOX/                          # Turborepo + pnpm
├── backend/
│   ├── api/                  # NestJS modular monolith — AppModule = PaymentsModule only
│   └── auth-service/         # Nest bootstrap stub — imports modules that are not on disk
├── packages/
│   ├── design-tokens/
│   └── shared-types/
├── infrastructure/
│   ├── docker/               # Redis only (docker-compose)
│   ├── github-actions/
│   └── supabase/migrations/
├── flutter_blueprint/        # Melos Flutter scaffold — not in pnpm workspace
└── docs/
    ├── adr/
    ├── PHASE_1_FOUNDATION.md # Historical scaffold report (paths may lag)
    └── ARCHITECTURE_REALITY.md  # this file
```

**pnpm workspace** (`pnpm-workspace.yaml`): `backend/*`, `packages/*` only.  
**`apps/`:** removed in [#34](https://github.com/pyaiphyopie/NOX/pull/34) (phantom apps audit). Do not schedule work under `apps/` until a new ADR re-introduces them.

**Related repo (not in this monorepo):** `pyaiphyopie/nox_0.2` — Next.js consumer UI on Vercel (`https://nox-kappa-liard.vercel.app`), mock data in `lib/data.ts`. It is **not** organizer / venue / admin dashboards.

---

## Drift vs May 2026 PDF

| Layer | Status | Evidence on `main` |
|-------|--------|-------------------|
| Monorepo shape | **CHANGED** | Modular monolith (ADR-001); no `apps/`; no multi-service `services/` tree; workspace = `backend/*` + `packages/*` |
| Flutter consumer | **PARTIAL** | `flutter_blueprint/` Melos scaffold only; PHASE_1 still cites missing `apps/mobile-app` |
| Dashboards (organizer / venue / admin) | **MISSING** | No dashboard apps in NOX; `nox_0.2` is a separate consumer mock, not those surfaces |
| API / gateway | **CHANGED** | NestJS `backend/api` exists; `AppModule` imports PaymentsModule only — not a multi-service gateway |
| Auth | **PARTIAL** | `backend/auth-service` has `main.ts` + `app.module.ts` importing `./modules/auth` and `./modules/users`, but those directories are **not on disk** |
| Payments | **PARTIAL** | ADR-004 adapters: `fake`, `wavepay`, `kbzpay` under `backend/api/src/payments/adapters/`; default `PAYMENTS_MODE=fake` |
| Tickets / QR | **MISSING** | No ticket/QR/check-in service or encrypted-payload flow in tree |
| Notifications (FCM) | **MISSING** | No FCM / notification module in product code |
| Analytics (PostHog + Metabase) | **MISSING** | Not wired in product code |
| Infra hosting | **PARTIAL** | Supabase migrations + Redis docker + Vercel for `nox_0.2`; no Terraform / K8s trees |
| Observability (Sentry / Grafana / Prometheus / Pino) | **MISSING** | No product instrumentation found on `main` |
| Wallets | **MATCH (+ naming extras)** | External wallets only; WavePay + KBZPay adapters implemented; Aya/CB/Dinger appear in env naming — still no in-house wallet |

Status key: **MATCH** = aligned with May intent and present · **PARTIAL** = directionally present but incomplete or stubbed · **MISSING** = not in product tree · **CHANGED** = deliberate different shape (usually via ADR).

---

## Explicit facts (do not re-litigate without an ADR)

1. Live architecture is a **modular monolith**, not the May microservice list (api-gateway, auth, payment, notification, analytics, ticket as separate deployables).
2. **`apps/` is gone** (#34). README / PHASE_1 diagrams that still show `apps/*` are stale relative to disk.
3. **Auth-service does not currently run as checked in** — module imports have no corresponding source directories.
4. **Payments are adapter-shaped and fake-by-default**; production must not use `PAYMENTS_MODE=fake` (ADR-004).
5. Do **not** schedule microservices or K8s / Terraform until Jake signs this page (merge of the PR that introduced it counts as sign-off) and the build order below has a signed successor plan.

---

## Next build order

Until this page is Jake-signed, treat the following as the only sequencing assumption:

1. **Fix or replace the auth stub** so auth runs (migrate into `backend/api` per ADR-001, or restore missing modules — prefer monolith migration).
2. **Decide Flutter path vs absorb `nox_0.2`** into the monorepo (consumer surface first; organizer/venue/admin dashboards are still MISSING).
3. **Tickets / QR** (domain module + validation story).
4. **Notifications (FCM)**.
5. **Observability** (Sentry and whatever else is justified for MVP — not a full Grafana/Prometheus stack by default).

Phase-2 May items (AI recs, BNPL, creator payouts, etc.) stay out of scope until the layers above exist.

---

## How to update this page

Update **this file** when:

- An ADR is accepted, superseded, or materially amended; or
- A layer in the drift table moves between MATCH / PARTIAL / MISSING / CHANGED on `main`.

Do **not** silently “fix” gaps by editing the May PDF. Bump **Last verified** (Asia/Rangoon date) on every substantive edit. Keep claims path-backed; do not invent MAU, event counts, or uptime.
