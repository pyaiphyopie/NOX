# ADR-001: Modular Monolith Architecture

**Status:** Accepted  
**Date:** 2026-08-13  
**Deciders:** Jake (Founder), NOX Core

## Context

NOX must support consumers, organizers, venues, scanners, and admins with strong transactional integrity (tickets, payments, check-ins). Premature microservices increase operational cost, latency, and consistency risk for a pre-product-market-fit platform.

## Decision

Start as a **modular monolith** under `backend/api` with clear domain module boundaries:

- auth
- users
- venues
- organizers
- events
- ticketing
- orders
- payments
- checkins
- notifications
- analytics
- moderation
- admin

Future extraction of domains (Auth, Tickets, Payments, etc.) is allowed only when scale or team structure requires it.

## Consequences

**Positive**
- Single deployment unit, simpler local development, shared transactions, lower infra cost.
- Clear module boundaries make later extraction feasible.
- Faster iteration for Yangon beta.

**Negative / Trade-offs**
- Must enforce module boundaries via code review and package structure; otherwise the monolith becomes a ball of mud.
- Single point of failure at process level (mitigated by horizontal scaling of the NestJS process + proper health checks).

## Alternatives Considered

1. Full microservices from day one → rejected (ops overhead, consistency complexity).
2. Keep current separate `auth-service` and grow more services → rejected (inconsistent with master prompt and current team size).

## References

- Master Engineering Agent Prompt §3, §7, §31
- Existing `backend/auth-service` will be migrated into the monolith modules.
