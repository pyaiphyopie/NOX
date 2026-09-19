# NOX Execution Notes — 20 Sep 2026

## 0X Alpha job: persist job/evidence types + kill architecture split

Branch: `feat/0x-alpha-job-evidence-types`

### Done in this change

- ADR-002 accepted: job + evidence + checker contracts.
- `@nox/shared-types` now has `src/` (`agent-job.ts`, tests, index). Package previously referenced `src/index.ts` but the file did not exist.
- Copilot `Cody.instructions.md` no longer instructs a `services/` microservice tree. ADR-001 is the layout source of truth.
- README architecture block matches the monolith.

### Verification (local, this environment)

```
tsc --noEmit   # pass
node --import tsx --test src/agent-job.test.ts
# 4 pass / 0 fail
```

No Cloudflare Sandbox Worker is bound. RuntimeEvidence for a full 0X Alpha accept path is therefore incomplete by protocol (`sandbox_available` would be false on this host). Types and unit tests are the evidence for *this* change.

### Not done

- Orchestrator / message bus / signed Core OS store
- Migrating `backend/auth-service` into `backend/api`
- Wiring CI to emit RuntimeEvidence
- Merging this branch (Jake)

### Owner

0X Alpha + Jake merge approval.
