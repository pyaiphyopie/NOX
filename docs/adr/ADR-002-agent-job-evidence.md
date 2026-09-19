# ADR-002: Agent Job and Evidence Contracts

**Status:** Accepted  
**Date:** 2026-09-20  
**Deciders:** Jake (Founder), CODY / 0X Alpha

## Context

The NOX Multi-Agent Ecosystem was specified as Governance → CODY decomposer → Orchestrator → capability pods → signed Core OS state. In the repository and in chat, that graph did not exist. Agents were prompt files. “Done” was a self-report.

Without a typed job record and runtime evidence, Copilot Cody, Grok CODY, and 0X Alpha cannot share a definition of finished work. They also cannot fail closed when a sandbox is unavailable.

## Decision

1. Persist job, evidence, and checker contracts in `packages/shared-types` (`agent-job.ts`). Schema id: `0x-alpha.job.v1`.
2. A job may be `accepted` only when:
   - Runtime evidence exists (`sandbox_available: true` and `runs[]` non-empty), or the job is explicitly left unaccepted.
   - Checker verdict is `pass` on a clean context (`used_codegen_transcript: false`).
   - `prod` work carries a Governance `policy_token`.
3. Invented run logs are a protocol violation. If no sandbox Worker is bound, record `sandbox_available: false` and `runs: []`.
4. This ADR does not implement the orchestrator, bus, or sandbox. It freezes the objects those systems must speak.

## Consequences

**Positive**
- One contract for chat agents, Copilot, and future Workers.
- Checker cannot rubber-stamp CodeGen prose.
- Prod remains gated.

**Trade-offs**
- Types without a store are still documents. A durable `state_ref` implementation is follow-up work.
- Existing CI does not yet emit `RuntimeEvidence`. Until it does, 0X Alpha jobs stay unaccepted after local checks.

## Alternatives considered

1. Keep contracts only in Grok artifacts — rejected (not the product repo).
2. Implement full Orchestrator first — rejected (no shared schema to execute).

## References

- ADR-001 Modular Monolith
- `packages/shared-types/src/agent-job.ts`
- 0X Alpha skill / SPEC
