---
name: verify-nox-ticket-payments
description: "Verify NOX ticket payment inventory and issuance safety with TLA+/TLC. Use when changing backend/api/src/payments (createOrder, webhooks, cancel, expire, reserve/release/issueTickets), order/payment status transitions in types.ts, or the formal/ticket-payments model — before merging any change that can oversell seats, leak reserves (including multi-item partial reserve without rollback), issue tickets without a completed matching payment, or skip webhook idempotency."
---

# Verify NOX ticket payments (inventory + issuance)

## Property (plain)

Seats are never oversold or over-reserved; a failed `createOrder` (including multi-item mid-loop sold-out) leaves no leftover reserved seats from that attempt; and tickets are issued only for a **paid** order after a **completed** payment whose amount matches — never on cancel, expire, failure, duplicate webhook, or amount mismatch.

## Harm if broken

Buyers pay and get no ticket, venues oversell capacity, or reserved inventory leaks (including from a multi-item create that fails on a later line) so other buyers cannot purchase.

## Tool and why

**TLA+ / TLC 1.7.4** (model checker). The risk is bad **event order** among `createOrder`, payment webhooks, `cancel`, and `expireReservations`, plus atomicity of multi-item reserve/rollback inside `createOrder`. That fits a model checker over a small model of `PaymentsService`, not a TypeScript code verifier (none is standard for this Nest service).

Read every TLC result with the pstack **`/statechart`** skill (by name). Do not invent alternate TLC story commands here.

## Coverage (files / functions)

| File | Functions / defs |
|------|------------------|
| `backend/api/src/payments/payments.service.ts` | `createOrder` (incl. multi-item pricing/reserve loop + atomic rollback on throw), `applyParsedWebhook`, `handleWebhook`, `cancel`, `expireReservations`, `issueTickets`; store `reserve`, `release`, `convertReserveToSold`, `insertWebhook` |
| `backend/api/src/payments/types.ts` | `ORDER_TRANSITIONS`, `PAYMENT_TRANSITIONS`, `canTransition`, `AmountMismatchError` |
| `formal/ticket-payments/TicketPayments.tla` | full model of the above (paid path; qty 1 or 2 per order; `CreateOrderPartialFail` for mid-loop sold-out rollback) |

**Sync commit:** `7be96628104a083afd510e376b0da2876a98d5c8`  
Move this forward only after you confirm the model still describes the covered code at the new commit (`git status` clean of product edits, then re-run and update this hash).

## Bounds and assumptions

- One ticket type; `QtyTotal = 2`; at most two orders (`o1`, `o2`); each order qty **1** (`CreateOrder`) or **2** (`CreateOrderMulti`); price `15000` MMK per seat.
- Three webhook event ids `{e1,e2,e3}`.
- Models the **paid** adapter-success path, plus multi-item mid-loop sold-out rollback (`CreateOrderPartialFail`). Not free `total === 0`, not adapter throw/rollback, not refunds, not poll reconcile, not real Wave/KBZ adapters.
- Each Next-state action is one indivisible `PaymentsService` method (same granularity as the in-memory service: no mid-method preemption). `CreateOrderPartialFail` models the net effect of the pricing/reserve loop after the atomic try/catch release.
- Signature verification is assumed already passed before `applyParsedWebhook` (invalid signatures never reach domain state).

## How to run

From the repo root:

```bash
./formal/ticket-payments/run.sh
```

Requires `java` 11+ and network once to download pinned `tla2tools.jar` 1.7.4 into `formal/ticket-payments/tools/` (gitignored). Expected wall time: under a few seconds.

**Pass:** TLC prints `Model checking completed. No error has been found.`

**Fail:** TLC prints an invariant name and a state trace. Use **`/statechart`** on `formal/ticket-payments/TicketPayments.tla` to read the shortest path in plain words.

Invariants checked (see `.cfg`):

- `InventoryBound` — `sold + reserved <= QtyTotal`
- `TicketsOnlyWhenPaid` — tickets only when order is `paid`
- `PaidHasTicket` — paid ⇒ tickets equal `orderQty`
- `SoldEqualsIssued` — `quantitySold` equals sum of issued tickets
- `ReservedAccountsForProcessing` — reserved seats match open processing orders still holding a reserve (qty-aware)
- `AtomicReserveRollback` — reserved seats equal seats held by `reserving` orders (no orphan from failed createOrder / multi-item mid-loop)
- `CompletedImpliesPaid` — payment `completed` ⇒ order `paid`
- `MismatchNoTickets` — amount mismatch ⇒ no tickets for that order

Focused unit test (complements TLC): `backend/api/src/payments/payments.service.spec.ts` — `releases prior reserves when a later multi-item line is sold out`.

```bash
cd backend/api && npm test -- --testPathPattern=payments.service.spec -t 'releases prior reserves'
```

## Bug vs modeling error

| Signal | Treat as |
|--------|----------|
| Trace steps match real method order on current code, and replaying those entry points on `InMemoryPaymentsStore` / unit tests reproduces the bad observation | **Product bug** — report; do not weaken the invariant |
| Trace needs a step the service cannot take, or a guard the code has that the model omitted / invented | **Modeling error** — fix `TicketPayments.tla` to match the code, re-run |
| Failure only after you intentionally changed the model without a code change | Model drift — sync model to code |

Never delete or soften an invariant to “make it green” unless the product owner changes the promise.

## When to update

Update the model and re-run when any covered function’s control flow, guards, or status transitions change — especially:

- New order/payment statuses or edges in `ORDER_TRANSITIONS` / `PAYMENT_TRANSITIONS`
- Changes to reserve / release / convertReserveToSold / issueTickets ordering
- Multi-item createOrder pricing loop or its try/catch atomic rollback
- Webhook idempotency or amount-match behavior
- Cancel / expire releasing inventory

After an intentional product change that preserves the plain-language property: adjust the model 1:1, run `./formal/ticket-payments/run.sh`, confirm pass (or report a real break), then set **Sync commit** to the new HEAD.

If verification has drifted after merges that touched coverage without rechecking, use **`/maintain-formal-verification-skill`**.

## Scratch-break (prove the check can fail)

To confirm the harness still catches a regression (do this on a throwaway branch or discard afterward):

1. In `TicketPayments.tla` `CreateOrderPartialFail`, replace `UNCHANGED vars` with `quantityReserved' = quantityReserved + 1` and leave other vars unchanged (skip the release that fixed code does).
2. Optionally mirror in `payments.service.ts` by removing the try/catch release around the pricing/reserve loop.
3. Run `./formal/ticket-payments/run.sh` — expect **`ReservedAccountsForProcessing`** and/or **`AtomicReserveRollback`** to fail. Unit test `releases prior reserves…` should also fail if product was scratched.
4. Revert both scratch edits; re-run — expect clean pass again.

## Out of scope (not covered)

- Free tickets (`total === 0`) path
- Adapter create failure rollback (separate catch still releases `priced`; not modeled as its own action beyond net success path)
- Refund / `partially_refunded` / `refund_pending`
- Poll reconcile job / `queryPayment`
- Real provider adapters (Wave/KBZ) and signature crypto
- DB-level `SELECT FOR UPDATE` concurrency (modeled as atomic `reserve`)
- Flutter / client UI
- Distinct ticket-type inventory (model uses one type; unit test covers two types)
