# P12-02-18 — ACCOUNTING SAFETY MODEL

## Purpose (§15): protect future Wave 07 accounting architecture; never let replay create duplicate accounting entries.

## Financial event classification
| Event class | Auto-replay? | Idempotency required? | Notes |
|-------------|--------------|-----------------------|-------|
| PAYMENT.RECEIVED | NO (controlled) | YES (mandatory) | ledger entry must be idempotent |
| INVOICE.ISSUED | NO (controlled) | YES | |
| INVOICE.PAID | NO (controlled) | YES | |
| SETTLEMENT.APPLIED | NO (controlled) | YES | |
| JOURNAL.POSTED | NO (controlled) | YES | future Wave 07 |
| CREDIT_NOTE / DEBIT_NOTE | NO (controlled) | YES | future |
| READING.INGESTED | YES (safe) | YES | non-financial until billed |
| NOTIFICATION.SENT | YES (safe) | YES | |
| SYNC.COMPLETED | YES (safe) | YES | |

## Rules (§15)
1. **Idempotency key is MANDATORY for all financial events.** Consumer refuses a financial event without a valid IdempotencyRecord → DEAD + operator.
2. **Financial replay is never automatic.** Replay of PAYMENT/INVOICE/SETTLEMENT/JOURNAL requires: (a) admin.ops, (b) dry-run first, (c) idempotency record present — else BLOCKED.
3. **No silent duplicate ledger.** The idempotency record + `ON CONFLICT` guard ensures a replayed financial event cannot post a second journal line.
4. **Financial periods enforced** (future): events carry periodStart/periodEnd; consumer validates against open financial period (Wave 07) before posting.
5. **Immutability preserved:** invoices/adjustments use adjustment entries, never mutate posted events (existing P59 rules).
6. **Correlation to accounting:** posting-engine consumes outbox PAYMENT_RECEIVED/INVOICE_ISSUED idempotently → journal entries + CustomerLedgerEntry. Original financial event never destroyed (audit).

## Event → accounting interaction map
| Event | Accounting effect (future Wave 07) | Idempotent key source |
|-------|------------------------------------|------------------------|
| INVOICE.ISSUED | JournalEntry + Invoice AR | invoice.id+issuedAt |
| PAYMENT.RECEIVED | JournalEntry cash + PaymentAllocation | payment.id |
| INVOICE.PAID | mark invoice paid + alloc | payment.id+invoice.id |
| SETTLEMENT.APPLIED | JournalEntry adjustments | settlement.id+invoice.id |
| REFUND / REVERSE | contra journal | reverse.id |

## Guardrail
`financialReplayGuard(event)`: if event financial && IdempotencyRecord absent → throw → DEAD with reason "missing-idempotency" → operator. This is the non-negotiable safety gate.
