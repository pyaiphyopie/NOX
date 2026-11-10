---------------------------- MODULE TicketPayments ----------------------------
(***************************************************************************)
(* Models NOX PaymentsService ticket buy → pay → issue / fail / cancel /   *)
(* expire for one ticket type. Names and steps map 1:1 to                  *)
(* backend/api/src/payments/payments.service.ts and types.ts.              *)
(*                                                                         *)
(* Bounds: one ticket type, QtyTotal seats, at most MaxOrders concurrent   *)
(* orders (qty 1 or 2), small webhook event id set.                        *)
(*                                                                         *)
(* Multi-item: CreateOrderMulti (2 seats) and CreateOrderPartialFail       *)
(* (first line reserve succeeds, later line sold-out — must roll back).    *)
(***************************************************************************)
EXTENDS Integers, FiniteSets, TLC

CONSTANTS
  QtyTotal,     \* ticket_types.quantity_total
  Orders,       \* finite set of order ids (slots)
  EventIds      \* finite set of provider webhook event ids

ASSUME QtyTotal \in Nat \ {0}
ASSUME Orders # {}
ASSUME EventIds # {}

OrderStatuses == {
  "none",
  "payment_processing",
  "paid",
  "failed",
  "cancelled"
}

PaymentStatuses == {
  "none",
  "processing",
  "completed",
  "failed",
  "expired"
}

VARIABLES
  quantitySold,       \* InMemoryPaymentsStore.quantitySold
  quantityReserved,   \* InMemoryPaymentsStore.quantityReserved
  orderStatus,        \* [orderId -> OrderStatus]
  paymentStatus,      \* [orderId -> PaymentStatus]
  paymentAmount,      \* [orderId -> Nat] payments.amount (minor units)
  tickets,            \* [orderId -> Nat] IssuedTicket count for order
  orderQty,           \* [orderId -> Nat] seats this order reserved (0 if none)
  webhookSeen,        \* set of providerEventIds (payment_webhooks unique key)
  amountMismatch,     \* [orderId -> BOOLEAN] payment.failure_code = amount_mismatch
  reserving           \* [orderId -> BOOLEAN] this order still holds its reserve

vars == <<
  quantitySold, quantityReserved, orderStatus, paymentStatus,
  paymentAmount, tickets, orderQty, webhookSeen, amountMismatch, reserving
>>

-----------------------------------------------------------------------------
\* types.ts ORDER_TRANSITIONS / PAYMENT_TRANSITIONS (subset used here)

OrderCan(from, to) ==
  \/ from = to
  \/ from = "payment_processing" /\ to \in {"paid", "failed", "cancelled"}
  \/ from = "none" /\ to = "payment_processing"

PaymentCan(from, to) ==
  \/ from = to
  \/ from = "processing" /\ to \in {"completed", "failed", "expired"}
  \/ from = "none" /\ to = "processing"

Remaining == QtyTotal - quantitySold - quantityReserved

-----------------------------------------------------------------------------

TypeOK ==
  /\ quantitySold \in 0..QtyTotal
  /\ quantityReserved \in 0..QtyTotal
  /\ orderStatus \in [Orders -> OrderStatuses]
  /\ paymentStatus \in [Orders -> PaymentStatuses]
  /\ paymentAmount \in [Orders -> Nat]
  /\ tickets \in [Orders -> Nat]
  /\ orderQty \in [Orders -> Nat]
  /\ webhookSeen \subseteq EventIds
  /\ amountMismatch \in [Orders -> BOOLEAN]
  /\ reserving \in [Orders -> BOOLEAN]

Init ==
  /\ quantitySold = 0
  /\ quantityReserved = 0
  /\ orderStatus = [o \in Orders |-> "none"]
  /\ paymentStatus = [o \in Orders |-> "none"]
  /\ paymentAmount = [o \in Orders |-> 0]
  /\ tickets = [o \in Orders |-> 0]
  /\ orderQty = [o \in Orders |-> 0]
  /\ webhookSeen = {}
  /\ amountMismatch = [o \in Orders |-> FALSE]
  /\ reserving = [o \in Orders |-> FALSE]

-----------------------------------------------------------------------------
\* payments.service.ts createOrder (paid path, adapter succeeds, single item qty 1)
\* Indivisible: reserve + insert order/payment + adapter.createPayment success.

CreateOrder(o) ==
  /\ orderStatus[o] = "none"
  /\ Remaining >= 1                          \* reserve(): remaining check
  \* payments.service.ts:225-227 reserve
  /\ quantityReserved' = quantityReserved + 1
  /\ reserving' = [reserving EXCEPT ![o] = TRUE]
  /\ orderQty' = [orderQty EXCEPT ![o] = 1]
  \* payments.service.ts:238-264 order+payment rows
  /\ orderStatus' = [orderStatus EXCEPT ![o] = "payment_processing"]
  /\ paymentStatus' = [paymentStatus EXCEPT ![o] = "processing"]
  /\ paymentAmount' = [paymentAmount EXCEPT ![o] = 15000]
  /\ UNCHANGED <<quantitySold, tickets, webhookSeen, amountMismatch>>

\* Multi-item success: two lines (or qty 2) both reserve — payments.service.ts:210-232
CreateOrderMulti(o) ==
  /\ orderStatus[o] = "none"
  /\ Remaining >= 2
  /\ quantityReserved' = quantityReserved + 2
  /\ reserving' = [reserving EXCEPT ![o] = TRUE]
  /\ orderQty' = [orderQty EXCEPT ![o] = 2]
  /\ orderStatus' = [orderStatus EXCEPT ![o] = "payment_processing"]
  /\ paymentStatus' = [paymentStatus EXCEPT ![o] = "processing"]
  /\ paymentAmount' = [paymentAmount EXCEPT ![o] = 30000]
  /\ UNCHANGED <<quantitySold, tickets, webhookSeen, amountMismatch>>

\* createOrder when sold out before any reserve — no state change.
CreateOrderSoldOut(o) ==
  /\ orderStatus[o] = "none"
  /\ Remaining < 1
  /\ UNCHANGED vars

\* Multi-item mid-loop sold-out: first item reserve()s, later item throws Sold out.
\* payments.service.ts createOrder pricing/reserve loop — FIXED: releases all of
\* `priced` before rethrow, so net effect is UNCHANGED (no leftover reserved seats).
CreateOrderPartialFail(o) ==
  /\ orderStatus[o] = "none"
  /\ Remaining >= 1          \* first line can reserve
  /\ Remaining < 2           \* second line cannot (only one seat left, or qty>remaining)
  /\ UNCHANGED vars          \* fixed: reserve then release priced → no leftover

-----------------------------------------------------------------------------
\* payments.service.ts issueTickets + convertReserveToSold

IssueTickets(o) ==
  IF tickets[o] > 0
  THEN /\ UNCHANGED <<quantitySold, quantityReserved, tickets, reserving>>
  ELSE /\ quantityReserved' = quantityReserved - orderQty[o]   \* convertReserveToSold
       /\ quantitySold' = quantitySold + orderQty[o]
       /\ tickets' = [tickets EXCEPT ![o] = orderQty[o]]
       /\ reserving' = [reserving EXCEPT ![o] = FALSE]

-----------------------------------------------------------------------------
\* payments.service.ts applyParsedWebhook — completed, matching amount

WebhookCompleted(o, eid) ==
  /\ orderStatus[o] # "none"
  /\ paymentStatus[o] # "none"
  /\ eid \notin webhookSeen                      \* insertWebhook unique
  \* payments.service.ts:364-368 amount match (modeled as equal)
  /\ ~amountMismatch[o]
  /\ PaymentCan(paymentStatus[o], "completed")   \* :381 canTransition
  /\ webhookSeen' = webhookSeen \union {eid}
  /\ paymentStatus' = [paymentStatus EXCEPT ![o] = "completed"]  \* :388
  /\ IF OrderCan(orderStatus[o], "paid")         \* :392
     THEN /\ orderStatus' = [orderStatus EXCEPT ![o] = "paid"]
          /\ IssueTickets(o)
          /\ UNCHANGED <<paymentAmount, amountMismatch, orderQty>>
     ELSE /\ UNCHANGED <<orderStatus, quantitySold, quantityReserved,
                          tickets, reserving, paymentAmount, amountMismatch, orderQty>>

\* completed webhook with wrong amount — quarantine, no issue
\* payments.service.ts:364-368 AmountMismatchError
WebhookAmountMismatch(o, eid) ==
  /\ orderStatus[o] # "none"
  /\ paymentStatus[o] \in {"processing"}
  /\ eid \notin webhookSeen
  /\ webhookSeen' = webhookSeen \union {eid}
  /\ amountMismatch' = [amountMismatch EXCEPT ![o] = TRUE]
  /\ UNCHANGED <<quantitySold, quantityReserved, orderStatus, paymentStatus,
                 paymentAmount, tickets, orderQty, reserving>>

\* applyParsedWebhook failed / expired
WebhookFailed(o, eid) ==
  /\ orderStatus[o] # "none"
  /\ paymentStatus[o] # "none"
  /\ eid \notin webhookSeen
  /\ PaymentCan(paymentStatus[o], "failed")
  /\ webhookSeen' = webhookSeen \union {eid}
  /\ paymentStatus' = [paymentStatus EXCEPT ![o] = "failed"]
  /\ IF OrderCan(orderStatus[o], "failed")
     THEN orderStatus' = [orderStatus EXCEPT ![o] = "failed"]
     ELSE UNCHANGED orderStatus
  \* payments.service.ts:406 always release on failed/expired path
  /\ IF reserving[o]
     THEN /\ quantityReserved' = quantityReserved - orderQty[o]
          /\ reserving' = [reserving EXCEPT ![o] = FALSE]
     ELSE UNCHANGED <<quantityReserved, reserving>>
  /\ UNCHANGED <<quantitySold, paymentAmount, tickets, amountMismatch, orderQty>>

WebhookExpired(o, eid) ==
  /\ orderStatus[o] # "none"
  /\ paymentStatus[o] # "none"
  /\ eid \notin webhookSeen
  /\ PaymentCan(paymentStatus[o], "expired")
  /\ webhookSeen' = webhookSeen \union {eid}
  /\ paymentStatus' = [paymentStatus EXCEPT ![o] = "expired"]
  /\ IF OrderCan(orderStatus[o], "cancelled")
     THEN orderStatus' = [orderStatus EXCEPT ![o] = "cancelled"]
     ELSE UNCHANGED orderStatus
  /\ IF reserving[o]
     THEN /\ quantityReserved' = quantityReserved - orderQty[o]
          /\ reserving' = [reserving EXCEPT ![o] = FALSE]
     ELSE UNCHANGED <<quantityReserved, reserving>>
  /\ UNCHANGED <<quantitySold, paymentAmount, tickets, amountMismatch, orderQty>>

\* Duplicate webhook: insertWebhook returns inserted=false — no state change
\* payments.service.ts:348-354
WebhookDuplicate(o, eid) ==
  /\ eid \in webhookSeen
  /\ orderStatus[o] # "none"
  /\ UNCHANGED vars

-----------------------------------------------------------------------------
\* payments.service.ts cancel

Cancel(o) ==
  /\ OrderCan(orderStatus[o], "cancelled")
  /\ orderStatus[o] = "payment_processing"
  /\ orderStatus' = [orderStatus EXCEPT ![o] = "cancelled"]
  /\ IF PaymentCan(paymentStatus[o], "expired")
     THEN paymentStatus' = [paymentStatus EXCEPT ![o] = "expired"]
     ELSE UNCHANGED paymentStatus
  /\ IF reserving[o]
     THEN /\ quantityReserved' = quantityReserved - orderQty[o]
          /\ reserving' = [reserving EXCEPT ![o] = FALSE]
     ELSE UNCHANGED <<quantityReserved, reserving>>
  /\ UNCHANGED <<quantitySold, paymentAmount, tickets, webhookSeen, amountMismatch, orderQty>>

-----------------------------------------------------------------------------
\* payments.service.ts expireReservations (TTL fired for this order)

ExpireReservations(o) ==
  /\ orderStatus[o] = "payment_processing"
  /\ orderStatus' = [orderStatus EXCEPT ![o] = "cancelled"]
  /\ IF PaymentCan(paymentStatus[o], "expired")
     THEN paymentStatus' = [paymentStatus EXCEPT ![o] = "expired"]
     ELSE UNCHANGED paymentStatus
  /\ IF reserving[o]
     THEN /\ quantityReserved' = quantityReserved - orderQty[o]
          /\ reserving' = [reserving EXCEPT ![o] = FALSE]
     ELSE UNCHANGED <<quantityReserved, reserving>>
  /\ UNCHANGED <<quantitySold, paymentAmount, tickets, webhookSeen, amountMismatch, orderQty>>

-----------------------------------------------------------------------------

Next ==
  \/ \E o \in Orders: CreateOrder(o)
  \/ \E o \in Orders: CreateOrderMulti(o)
  \/ \E o \in Orders: CreateOrderSoldOut(o)
  \/ \E o \in Orders: CreateOrderPartialFail(o)
  \/ \E o \in Orders, eid \in EventIds: WebhookCompleted(o, eid)
  \/ \E o \in Orders, eid \in EventIds: WebhookAmountMismatch(o, eid)
  \/ \E o \in Orders, eid \in EventIds: WebhookFailed(o, eid)
  \/ \E o \in Orders, eid \in EventIds: WebhookExpired(o, eid)
  \/ \E o \in Orders, eid \in EventIds: WebhookDuplicate(o, eid)
  \/ \E o \in Orders: Cancel(o)
  \/ \E o \in Orders: ExpireReservations(o)

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
\* Invariants — reader promises

\* Inventory never oversells or over-reserves.
InventoryBound == quantitySold + quantityReserved <= QtyTotal

\* Tickets exist only for paid orders (client never issues; server only on paid).
TicketsOnlyWhenPaid ==
  \A o \in Orders: tickets[o] > 0 => orderStatus[o] = "paid"

\* A paid order always has tickets equal to the qty it reserved.
PaidHasTicket ==
  \A o \in Orders: orderStatus[o] = "paid" => tickets[o] = orderQty[o] /\ orderQty[o] > 0

\* Sum helpers (avoid CommunityModules FoldSet; bounds keep Orders tiny).
SumTickets(S) ==
  LET RECURSIVE Sum(_)
      Sum(T) == IF T = {} THEN 0
                ELSE LET o == CHOOSE x \in T: TRUE
                     IN tickets[o] + Sum(T \ {o})
  IN Sum(S)

SumReservedProcessing(S) ==
  LET RECURSIVE Sum(_)
      Sum(T) == IF T = {} THEN 0
                ELSE LET o == CHOOSE x \in T: TRUE
                     IN (IF orderStatus[o] = "payment_processing" /\ reserving[o]
                         THEN orderQty[o] ELSE 0) + Sum(T \ {o})
  IN Sum(S)

SumHeldReserves(S) ==
  LET RECURSIVE Sum(_)
      Sum(T) == IF T = {} THEN 0
                ELSE LET o == CHOOSE x \in T: TRUE
                     IN (IF reserving[o] THEN orderQty[o] ELSE 0) + Sum(T \ {o})
  IN Sum(S)

\* Sold count equals issued tickets (convertReserveToSold only path to sold).
SoldEqualsIssued ==
  quantitySold = SumTickets(Orders)

\* Open processing orders account for reserved seats (no reserve leak / double hold).
ReservedAccountsForProcessing ==
  quantityReserved = SumReservedProcessing(Orders)

\* Failed createOrder (order still none) leaves no leftover reserved seats from
\* that attempt — atomic reserve/rollback for multi-item mid-loop sold-out.
AtomicReserveRollback ==
  quantityReserved = SumHeldReserves(Orders)

\* Completed payment implies paid order (no money-taken / no-ticket split).
CompletedImpliesPaid ==
  \A o \in Orders: paymentStatus[o] = "completed" => orderStatus[o] = "paid"

\* Amount mismatch never leaves tickets for that order.
MismatchNoTickets ==
  \A o \in Orders: amountMismatch[o] => tickets[o] = 0

=============================================================================
