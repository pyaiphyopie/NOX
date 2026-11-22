# NOX project instructions

## Project context and authority

- NOX is urban nightlife infrastructure (“Own The Night”), not just an event marketplace. Preserve existing behavior and favor small, additive changes.
- Before changing architecture, schema, or product behavior, inspect the implementation and relevant source documents. For conflicts, follow accepted decisions in [`docs/adr`](../docs/adr/), then the technical architecture, MVP blueprint, UI design system, brand system, and investor deck.
- [`README.md`](../README.md) describes the intended platform layout, not a guarantee that every listed app or package exists in the checkout. Inspect the current tree and package scripts before choosing a location or command; do not restart completed foundation work.

## Architecture

- Backend domains belong in the NestJS modular monolith under `backend/api`. Keep domain boundaries clear and reuse existing modules and patterns.
- Do not add deployable microservices under `services/`, or scaffold separate NestJS apps for auth, events, tickets, payments, or notifications. `backend/auth-service` is legacy; do not expand it—migrate its functionality into `backend/api` when requested.
- The target includes Flutter apps and Next.js dashboards, but check the actual workspace before assuming those app directories are present. Do not relocate or scaffold the target tree as incidental cleanup.
- Keep shared contracts in `packages/shared-types`, design values in `packages/design-tokens`, and database changes in `infrastructure/supabase/migrations`.

## Data, auth, and security

- PostgreSQL/Supabase is authoritative for persisted domain state. Preserve UUIDs, foreign keys, indexes, audit fields, soft-delete conventions, and RLS from the surrounding schema and migrations.
- Never weaken or disable RLS or RBAC to make tests pass. Validate inputs and enforce authorization server-side; do not trust client-supplied identity, payment status, ticket ownership, or scan results.
- Treat secrets as environment/secret-manager values only. Never commit them or expose them in logs, test output, or sandbox environment variables.
- Tickets are issued and validated against server-side ticket records. A QR code is a credential, not the ticket source of truth; retain ownership, event, expiry, usage, and replay checks.

## Payments

- Follow [`ADR-004-payments-adapter-spec.md`](../docs/adr/ADR-004-payments-adapter-spec.md): payment integrations are thin adapters inside `backend/api`; do not add a wallet, stored balance, or custody system.
- The database payment/order state is authoritative. A client success screen must never issue tickets. Verify webhook signatures against the raw body before parsing, persist/idempotently process events, and apply payment/order/ticket changes transactionally.
- Do not invent provider endpoints, payloads, signature schemes, or credentials. Keep unsupported integrations unimplemented and document the gap. Ask before adding/changing a payment provider or performing a destructive migration.
- Never enable fake payment mode in production. A production deploy or other production mutation requires the applicable Governance authorization token; do not perform it without authorization.

## Product and design

- Reuse existing UI components and tokens. Preserve NOX’s dark-first luxury-minimal design and brand values: Black `#070707`, Graphite `#141414`, Electric Cyan `#00AEEF`, Neon Violet `#8B5CF6`, Ice White `#F5F7FA`; Satoshi with Inter fallback.
- Keep consumer, organizer, venue, scanner, and admin roles and their data boundaries explicit. Do not add out-of-scope fintech functionality such as BNPL, wallets, or payouts without an approved product/architecture decision.

## Changes and verification

- Read nearby implementation and tests before editing; follow their naming, formatting, error-handling, and dependency-injection patterns. Make the smallest change that fully addresses the request.
- Add or update focused tests for changed behavior. Inspect the relevant `package.json` scripts first, then run the narrowest applicable test, lint, build, or type-check command. Use Flutter tooling only for an existing Flutter package.
- Report the exact validation commands and outcomes. Never claim a test, build, security check, or runtime sandbox ran if it did not.
- Under [`ADR-002`](../docs/adr/ADR-002-agent-job-evidence.md), work is not accepted on an agent’s assertion alone: acceptance requires real runtime evidence and an independent passing checker with `used_codegen_transcript: false`. If no sandbox is bound, report `sandbox_available: false` and `runs: []`; do not fabricate evidence.
- Update directly related architecture, migration, API, or security documentation when behavior or contracts change. Do not create planning/status documents for routine code changes.
