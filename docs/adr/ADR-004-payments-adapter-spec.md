# ADR-004 — NOX Payments Adapter Spec

Status: Accepted (P0 implemented 2026-09-27)  
Date: 2026-09-19  
Owner: NOX Core / Pierre Computer Company  
Scope: Ticketing collect → confirm → issue → refund → (later) payout  
Does not build: a NOX wallet, FX engine, or multi-currency treasury

## 1. Decision

NOX never talks to a wallet SDK from the app as source of truth.

All money movement goes through a **Payments Router** in NestJS. The router owns:

- market + method selection
- payment intent lifecycle
- webhook verification + idempotency
- ticket issuance trigger
- inventory release on expiry/failure

Adapters are thin. Domain state lives in Postgres.

```
Flutter / Next.js
        │  JWT
        ▼
   Orders API
        │
        ▼
 PaymentsRouter ──► AdapterRegistry
        │                 ├── KbzPayAdapter        (MM, P0)
        ├── WavePayAdapter       (MM, P0)
        ├── DingerAdapter        (MM aggregator, P0 optional)
        ├── MmqrAdapter          (MM dynamic QR, P0)
        ├── AyaPayAdapter        (MM, P1)
        ├── CbPayAdapter         (MM, P1)
        ├── XenditAdapter        (ID/PH/MY, P2)
        ├── HitPayAdapter        (SG/MY/PH POS, P2)
        ├── PromptPayAdapter     (TH via 2C2P/Omise, P2)
        └── StripeAdapter        (SG cards + PayNow, P2)
```

Ticket QR is **not** a payment QR. Door scan = HMAC ticket credential. Door extras (drinks, upgrade) may show a separate **merchant QR** from the same adapter family.

## 2. Non-negotiables

1. Server-side payment row is source of truth. Client “success” screens never issue tickets.
2. Webhooks: verify signature → idempotency key → transactional state machine.
3. Inventory reserved atomically at order create; released on cancel/expire/fail.
4. Amounts are integer minor units. MMK has no subunits → amount = MMK integer.
5. Charge in the event’s local currency. No USD list price on Yangon tickets.
6. Myanmar money stays onshore. Do not route MMK through Xendit/Stripe.
7. Never invent provider APIs. If a credential or callback format is unknown, adapter stays `Unimplemented` and the gap is documented.
8. Collect (buyer → NOX) and payout (NOX → organizer) are different ports. Payouts are out of P0.

## 3. Markets and methods

`market` = ISO-3166-1 alpha-2 of the **event**, not the buyer’s passport.

| Market | P0 methods | Adapter | Currency | Notes |
|---|---|---|---|---|
| MM | `kbzpay.pwa`, `kbzpay.qr`, `wavepay.pin`, `mmqr.dynamic` | KBZ / Wave / Dinger / MMQR | MMK | Dual-wallet required. MMQR covers walk-up + any bank app. |
| MM | `ayapay`, `cbpay` | AYA / CB | MMK | P1. Smaller share; keep interface ready. |
| TH | `promptpay.qr` | 2C2P or Omise | THB | Default rail. Cards secondary. |
| ID | `qris`, `va`, `gopay`, `dana`, `ovo` | Xendit (Midtrans alt) | IDR | Card-only checkout will fail conversion. |
| PH | `gcash`, `maya`, `qrph` | Xendit or PayMongo | PHP | GCash is table stakes. |
| VN | `momo`, `vietqr` | Xendit/local | VND | P2/P3. |
| MY | `duitnow.qr`, `fpx`, `tng` | HitPay or Xendit | MYR | |
| SG | `paynow`, `card` | Stripe or HitPay | SGD | Only market where cards are first-class. |

Router input: `{ market, currency, amount, channel: online | door_extra }`.  
Router output: ordered list of enabled methods. Never show TH PromptPay on an MM event.

## 4. Domain model

### 4.1 State machines

**Order** (extend existing enum)

```
pending
  → payment_processing
      → paid
      → failed
      → cancelled          (TTL / user cancel before pay)
  paid → refunded
  paid → partially_refunded
```

Existing migration only has `pending | paid | failed | refunded | cancelled`. Add `payment_processing` and `partially_refunded` before ASEAN work.

**Payment**

```
pending → processing → completed
                    → failed
                    → expired
completed → refund_pending → refunded
                          → partially_refunded
```

Existing enum: add `expired`, `refund_pending`, `partially_refunded`.

Legal transitions only. Store transition in `audit_logs`.

### 4.2 Schema deltas (additive)

Keep current `payments` / `orders`. Add what the migration is missing.

```sql
-- methods are not providers
CREATE TYPE payment_method AS ENUM (
  'kbzpay_pwa', 'kbzpay_qr', 'wavepay_pin', 'mmqr_dynamic',
  'ayapay', 'cbpay',
  'promptpay_qr', 'qris', 'va', 'gopay', 'dana', 'ovo',
  'gcash', 'maya', 'qrph',
  'momo', 'vietqr',
  'duitnow_qr', 'fpx', 'tng',
  'paynow', 'card'
);

ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'dinger';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'mmqr';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'xendit';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'hitpay';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'stripe';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'twoc2p';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'omise';

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS method payment_method,
  ADD COLUMN IF NOT EXISTS market CHAR(2) NOT NULL DEFAULT 'MM',
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS client_secret TEXT,          -- if hosted session
  ADD COLUMN IF NOT EXISTS instruction JSONB,           -- qr payload, deeplink, va number
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_code TEXT,
  ADD COLUMN IF NOT EXISTS failure_message TEXT;

CREATE TABLE payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider payment_provider NOT NULL,
  provider_event_id TEXT NOT NULL,
  payment_id UUID REFERENCES payments(id),
  headers JSONB,
  payload JSONB NOT NULL,
  signature_valid BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  process_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_event_id)
);

CREATE TABLE payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  attempt_no INTEGER NOT NULL,
  request JSONB,
  response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- later (not P0)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES organizers(id),
  market CHAR(2) NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  provider payment_provider,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`orders.total_amount` stays integer. Add `orders.idempotency_key TEXT UNIQUE` and `orders.reservation_expires_at`.

### 4.3 Money

| Currency | Integer unit | Example |
|---|---|---|
| MMK | 1 kyat | 15000 |
| THB | satang (x100) | 35000 = ฿350 |
| IDR | 1 rupiah | 150000 |
| PHP | centavo (x100) | 50000 = ₱500 |
| SGD | cent | 2500 = S$25.00 |

Adapter interface always takes `amountMinor: number` + `currency`. Router converts from ticket_types.price using market rules. MMK tickets already stored as full kyat — do not multiply by 100.

## 5. Adapter interface

```ts
export type PaymentInstruction =
  | { kind: 'redirect'; url: string }
  | { kind: 'deeplink'; url: string; fallbackQr?: string }
  | { kind: 'qr'; payload: string; imageUrl?: string }
  | { kind: 'va'; bank: string; account: string; name: string }
  | { kind: 'pin_wait'; message: string };

export interface CreatePaymentInput {
  paymentId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  market: string;
  method: PaymentMethod;
  buyer: { phone?: string; email?: string; displayName?: string };
  description: string;
  returnUrl: string;
  notifyUrl: string;
  expiresAt: Date;
  idempotencyKey: string;
}

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;
  readonly markets: string[];
  readonly methods: PaymentMethod[];

  createPayment(input: CreatePaymentInput): Promise<{
    providerRef: string;
    instruction: PaymentInstruction;
    raw: unknown;
  }>;

  parseWebhook(req: {
    headers: Record<string, string>;
    rawBody: Buffer;
  }): Promise<{
    providerEventId: string;
    providerRef: string;
    status: 'completed' | 'failed' | 'expired' | 'refunded' | 'ignored';
    amountMinor: number;
    currency: string;
    paidAt?: Date;
    raw: unknown;
  }>;

  verifySignature(req: { headers: Record<string, string>; rawBody: Buffer }): boolean;

  queryPayment(providerRef: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    raw: unknown;
  }>;

  refund?(input: {
    providerRef: string;
    amountMinor: number;
    reason: string;
    idempotencyKey: string;
  }): Promise<{ providerRefundRef: string; raw: unknown }>;
}
```

P0 adapters may stub `refund` and throw `RefundNotSupportedError`. Ops refunds then happen in the wallet merchant portal and are recorded manually via admin.

## 6. Flow

### 6.1 Online ticket buy

```
POST /orders
  Idempotency-Key: client-uuid
  { eventId, items: [{ ticketTypeId, qty }], method }

1. Auth user
2. Lock ticket_types rows (SELECT … FOR UPDATE)
3. Check sales window, max_per_order, remaining = total - sold - reserved
4. reserved += qty
5. Insert order status=pending, reservation_expires_at = now()+15m
6. Insert payment status=pending, idempotency_key = hash(user, event, items, method, day-bucket or client key)
7. Adapter.createPayment
8. Store provider_ref + instruction
9. order → payment_processing, payment → processing
10. Return { orderId, paymentId, instruction, expiresAt }
```

Client renders QR / opens PWA / waits for Wave PIN. Poll `GET /orders/:id` every 3s as backup. Tickets appear only after webhook (or poll reconcile) marks paid.

### 6.2 Webhook

```
POST /webhooks/payment/:provider
```

1. Read raw body. Never `JSON.parse` before signature check.
2. `adapter.verifySignature` — fail 401 if invalid.
3. Insert `payment_webhooks` with `UNIQUE (provider, provider_event_id)`. Duplicate → 200 + skip.
4. `adapter.parseWebhook`.
5. Load payment by `provider_ref`. Amount + currency must match. Mismatch → quarantine + alert, do not issue tickets.
6. Transition payment + order in one DB transaction.
7. If completed: decrement reserved, increment sold, insert tickets + HMAC QR, notify.
8. Always return 200 after durable persist (even if ticket issue retries via outbox).
9. Never return 5xx for duplicates; providers retry.

### 6.3 Reconcile job (Redis/cron)

Every 60s: payments in `processing` older than 45s → `adapter.queryPayment`.  
Every 60s: `reservation_expires_at < now()` and order not paid → release reserved qty, payment `expired`, order `cancelled`.

Wallets drop callbacks. Poll is mandatory for MM.

### 6.4 Failure / cancel

User cancel before pay: `POST /orders/:id/cancel` only if `pending|payment_processing`. Release reserve.

Provider fail: payment `failed`, order `failed`, release reserve. User may create a new order (new idempotency key).

### 6.5 Door extras (P1)

Separate `payment` with `channel=door_extra`, no ticket issuance. Instruction is static or dynamic merchant QR (MMQR / PromptPay / DuitNow). Do not reuse ticket QR payload.

## 7. HTTP surface

```
POST /orders
GET  /orders/me
GET  /orders/:id
POST /orders/:id/cancel
GET  /payments/:id                 # status + instruction (owner only)
POST /webhooks/payment/:provider   # unauthenticated + signature
POST /admin/payments/:id/reconcile
POST /admin/payments/:id/record-refund
```

No public “mark paid” endpoint.

## 8. Provider notes (do not invent APIs)

### 8.1 KBZPay (P0)

- Flows: PWA (app switch) and QR.
- Official merchant onboarding via KBZ Bank / kbzpay.com. Credentials: merchant id + key from KBZ — store as `KBZPAY_MERCHANT_ID`, `KBZPAY_APP_KEY`, `KBZPAY_APP_SECRET` (extend `.env.example`; do not commit values).
- Prefer official docs at integration time. If official API access lags, wrap via Dinger `providerName: KBZ Pay`, `methodName: PWA|QR` — still isolate as `KbzPayAdapter` vs `DingerAdapter` so we can swap.

### 8.2 WavePay (P0)

- Documented PG: `https://payments.wavemoney.io/payment` (prod), test host on port 8107.
- Fields: `merchant_id`, `order_id`, `merchant_reference_id`, `frontend_result_url`, `backend_result_url`, `amount`, `time_to_live_in_seconds`, hash with merchant secret.
- Callback URL must be public HTTPS :443 with a public CA cert (no self-signed).
- Amount: positive integer MMK. TTL maps to `expires_at`.

### 8.3 MMQR / Dinger (P0 optional)

- Dinger Pay API supports KBZ, Wave, AYA, Citizens, MPU, Mytel, etc. Use when dual official onboarding is blocked.
- MyanMyanPay-style dynamic amount-locked MMQR is the right door + checkout QR shape: one payload scannable by KBZ, Wave, bank apps.
- Aggregators add counterparty risk. Treat as temporary adapter, not the long-term money owner.

### 8.4 Xendit / HitPay / Stripe (P2)

- New legal entity + MID per country. MM entity cannot collect IDR/PHP.
- Xendit: invoices + QRIS + VA + e-wallets + disbursements (payout port later).
- HitPay: SG/MY/PH + in-person + cross-border tourist QR accept.
- Stripe: SG cards + PayNow only. Do not use as ID/PH spine.

## 9. Idempotency and concurrency

| Key | Scope |
|---|---|
| `Idempotency-Key` header on `POST /orders` | 24h, per user |
| `payments.idempotency_key` | unique; derived if header missing: `sha256(userId:eventId:sortedItems:method:yyyy-mm-dd-hh)` — hour bucket prevents double-buy on retry, allows repurchase later |
| `payment_webhooks (provider, provider_event_id)` | forever |
| Ticket issue outbox | `order_id` unique where status=paid |

Inventory: `UPDATE ticket_types SET quantity_reserved = quantity_reserved + $qty WHERE id = $id AND quantity_total - quantity_sold - quantity_reserved >= $qty`. 0 rows → 409 sold out.

## 10. Security

- Webhook routes: raw body middleware, no JWT, signature required, IP allowlist when provider publishes one.
- Secrets in env / secret manager only. Rotate independently per provider.
- Log provider refs, never full webhook PII. Redact phone in payment_attempts after 30 days.
- Amount tampering: compare webhook amount to `payments.amount`. On mismatch, status stays processing, Sentry + ops page.
- RLS: users select own orders/payments; service role for webhook worker.
- Rate limit `POST /orders` per user (e.g. 10/min) and per IP.

## 11. Observability

Metrics (OpenTelemetry):

- `nox.payment.create` (provider, method, market, result)
- `nox.payment.webhook` (provider, signature_valid, duplicate)
- `nox.payment.confirm_latency_ms` (create → completed)
- `nox.payment.success_rate`
- `nox.inventory.release`

Alerts: webhook signature fail spike, processing > 10 min, reserve leak (`sum(reserved) vs open processing payments`).

PostHog events: `payment_started`, `payment_completed`, `payment_failed`, `payment_expired`.

## 12. Test matrix (required before Yangon beta)

- Create order sold-out race (two concurrent POSTs, one 409).
- Duplicate webhook (same event id twice) → one ticket set.
- Webhook before createPayment returns (out-of-order) → durable pending then attach.
- Amount mismatch webhook → no tickets.
- Invalid signature → 401, no state change.
- Expire job releases reserve.
- Poll reconcile completes a missed webhook.
- Cancel during processing.
- Free ticket (`amount = 0`) skips adapter, goes paid + issue.

Sandbox: Wave test host + KBZ UAT if issued. If neither exists, adapter has `FakePaymentAdapter` behind `NODE_ENV=test` only.

## 13. Implementation plan

**P0 — Yangon beta**

1. Migration: order/payment enum extensions, webhook + attempt tables, payment columns.
2. `PaymentsModule`: router, registry, outbox ticket issuer.
3. `WavePayAdapter` against official PG docs.
4. `KbzPayAdapter` against official or Dinger-wrapped KBZ PWA/QR.
5. Webhook controller + reconcile cron.
6. Flutter checkout: method picker (KBZ / Wave / MMQR) + instruction renderer + poll.
7. Admin reconcile + manual refund record.

**P1**

- AYA + CB adapters.
- Dynamic MMQR for door extras.
- Real refund() where provider supports it.

**P2 — first ASEAN city**

- New MID + entity.
- Xendit or HitPay or 2C2P behind the same interface.
- Expand `payment_provider` / `payment_method` enums (already listed).
- Do not reuse MM credentials.

**Deferred**

- Split settlements / marketplace payfac.
- Promoter payouts table live.
- BNPL.
- Cross-border tourist QR as a buyer method (accept inbound Nexus/RPC QR on venue extras only).
- Multi-currency event catalog.

## 14. Gaps vs current repo (`pyaiphyopie/NOX`)

| Current | Spec |
|---|---|
| `payment_provider` = kbzpay, wavepay, ayapay, cbpay | keep + add aggregators/regional PSPs |
| no `payment_webhooks` table | add |
| no `order_items` | still recommended; items can live in `orders.metadata` for P0 only |
| order statuses missing `payment_processing` | add |
| `.env.example` has KBZ/Wave keys only | add webhook secrets, Dinger keys, TTL |
| `backend/payment-service` named in README, not implemented | implement as Nest module, not a new microservice |

## 15. Acceptance

P0 is done when:

- A Yangon event can be paid with KBZPay **and** WavePay.
- Killing the app mid-pay still yields a ticket if the wallet charged (webhook or poll).
- Double webhook cannot mint two ticket sets.
- Unpaid QR expiry returns inventory.
- No payment secret is in git.

---

Related: master engineering prompt §17–18, existing migration `20260802000000_initial_schema.sql`, ASEAN fintech map 2026-09-19.
