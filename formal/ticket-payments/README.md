# Ticket payments formal check

TLA+ model of NOX `PaymentsService` inventory reservation, multi-item atomic reserve/rollback, and ticket issuance.

- **Skill:** `.cursor/skills/verify-nox-ticket-payments/SKILL.md`
- **Run:** `./formal/ticket-payments/run.sh` (from repo root or this directory)
- **Read failures:** pstack `/statechart` skill (by name)
- **Maintain after drift:** `/maintain-formal-verification-skill`

Pinned tool: TLC / tla2tools **1.7.4** (jar downloaded into `tools/`, gitignored).

Key multi-item actions: `CreateOrderMulti`, `CreateOrderPartialFail`. Invariant: `AtomicReserveRollback`.
