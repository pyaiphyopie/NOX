# ADR-005: Open Protocols and Adapter Discipline for External Surfaces

**Status:** Accepted  
**Date:** 2026-11-13  
**Deciders:** Jake (Founder), NOX Core

## Context

NOX operates in Myanmar with ASEAN expansion. Critical paths (tickets, payments, check-ins, venue/promoter collaboration) must remain under Pierre Systems control. External providers (payment rails, push notifications, analytics, future partner tools) introduce lock-in risk if domain logic is coupled to a single vendor API or SaaS tenant.

The Swedish public-sector report on a common federation protocol for chat (eSamverka ES2025-20, January 2026) and the live Matrix federation pilots between agencies illustrate a durable pattern: keep the ability to choose tools independently while still interoperating, by standardizing on an open protocol or thin adapter rather than a shared commercial platform. The same pressure exists here from connectivity, regulatory, and multi-partner conditions in Yangon, even though NOX is a private nightlife platform, not a public-sector chat system.

ADR-001 already fixes the modular monolith under `backend/api`. ADR-004 already applies the adapter pattern to payments (thin adapters, Postgres as source of truth, external Myanmar wallets only). This ADR extends that discipline to every other external surface.

## Decision

1. **Transactional core stays authoritative.** Server-side records for tickets, orders, payments, and check-ins remain the source of truth inside the modular monolith. Client success screens and external systems never issue or mutate those records directly.

2. **External surfaces go behind thin adapters.** Any capability that depends on an external provider (payments already covered by ADR-004, notifications/FCM or equivalent, analytics/PostHog, observability/Sentry, future partner or multi-venue collaboration tools, identity bridges, etc.) is accessed only through an adapter module. Domain code depends on the adapter interface, not the provider SDK or HTTP contract.

3. **Prefer open protocols or multi-provider options when collaboration crosses organizational boundaries.** If a future feature requires promoters, venues, or partners to collaborate without forcing every participant onto one closed SaaS, prefer an open protocol (or a thin adapter over multiple providers) over a single shared tenant. Matrix-style federation is one proven pattern; it is not mandated. The choice is made per surface when the feature is actually built.

4. **No irreversible vendor standardization for interoperability.** Do not pick one commercial platform as the de-facto standard solely so that parties can talk to each other. Once a critical mass is locked in, switching cost rises and the platform adapts to the vendor instead of the reverse (the Skype-for-Business lesson cited in the Swedish report). The payments adapter registry is the reference shape.

5. **This ADR does not introduce new services or change monorepo shape.** Work stays inside `backend/api` domain modules (ADR-001). No `services/` tree, no re-introduction of `apps/` without a new ADR, no Matrix or federation implementation is required for the Yangon beta path.

## Consequences

**Positive**
- Extends the already-working payments adapter pattern to every future external dependency.
- Preserves the ability to swap or add providers without rewriting domain logic.
- Keeps critical state (tickets, money, entry) under NOX control even when partners or users sit on different tools.
- Aligns with Myanmar operational reality (connectivity, local payment rails, multi-party venue/promoter networks) and with longer-term ASEAN expansion.

**Negative / Trade-offs**
- Adapter interfaces and registries add a small amount of code and review discipline.
- Open-protocol options (if chosen later) require operational ownership of the protocol server or bridge; that cost is accepted only when the collaboration surface is real.
- Notifications, analytics, and any collaboration features remain unbuilt; this ADR only constrains how they are added.

## Alternatives Considered

1. Adopt a single commercial collaboration or messaging platform for all partner/venue tools → rejected (lock-in risk, same pattern the Swedish report warns against).
2. Implement Matrix (or another federation protocol) now → rejected (not on the critical path for Yangon beta; premature).
3. Leave external surfaces unadapted and call provider SDKs from domain modules → rejected (violates the payments precedent in ADR-004 and creates the lock-in this ADR exists to prevent).

## References

- ADR-001 Modular Monolith
- ADR-004 Payments adapter
- `docs/ARCHITECTURE_REALITY.md` (current law on disk)
- eSamverka ES2025-20, Common federation protocol for chat in the public sector (January 2026) — strategic pattern only; not a NOX product requirement
