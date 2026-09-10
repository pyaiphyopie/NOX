# ADR-R1: RunSheet is an ops domain inside the monolith

**Status:** Proposed  
**Date:** 2026-09-10  
**Deciders:** Jake (final), CODY (draft)

## Decision

RunSheet lives in `backend/api/src/modules/runsheet/` once that package exists. Dashboards get an event-scoped tab. Scanner gets a night-of strip. Shared types in `packages/shared-types`.

Not a new app. Not `nox_0.2`. Not TaskFlow.

## Why

Tickets and check-ins are already the system of record. A separate SaaS would duplicate inventory and lie at the door.

## Consequence

Blocked on `backend/api` existing. This ADR does not create that package.
