# P12-01 — DATAFLOW MATRIX

**Date:** 2026-08-15 · **Gate:** P12-01 · **Method:** chain trace, break identification

## Chain 1 — Meter → Reading → Billing → Invoice → Payment → Accounting
```
Meter → MeterVerse meter (serial, type, areaId)
  → Reading (value, source, timestamp, meter.areaId)          [A - ingestReading]
  → billing-engine (consumption from readings)                 [B - code]
  → Invoice (charges + settlement)                             [B - code]
  → Payment (allocation oldest-first)                          [A - tested]
  → posting-engine → GL/journal + CustomerLedgerEntry          [B - code, DB-gated]
```
**Breaks:** billing-engine and GL journaling are code-complete but **DB-runtime-ungated** (no live E2E — PG down). Reading→billing mapping assumes readings exist (billing-engine consumes; upstream capture = OBIS-gated for directional).

## Chain 2 — Symbiot → Meter → Reading → Solar → Settlement → Invoice
```
Symbiot → TCP/HTTP transport → ingestReading (serial→Meter)   [A - tested]
  → Reading (source=symbiot)                                   [A]
  → solar-wallet-engine (accepts resolved directional inputs)  [A - 16 tests]
  → settlement-engine → solar invoice (solar.js)               [B - code]
```
**Break:** the directional register capture (OBIS 1.8.0/2.8.0) feeding solar-wallet is **OBIS-gated** — the chain stops there (solar-wallet accepts the resolved inputs; the capture isn't persisted yet).

## Chain 3 — Customer → Contract/Unit → Meter → Readings → Billing → Invoice → Payment → Journal → Aging
```
Customer → meter-assignments (FK) → Meters → Readings        [A - verified]
  → billing → invoices → payments (allocation)               [A - tested]
  → journal/ledger → aging/statement                         [A - statement tested]
```
**No break** — this chain is code-complete and tested (financial 29/29), live-ungated only by PG.

## Chain 4 — External event/API → Auth → Domain → DB → Event/Audit → Consumer
```
External (Symbiot/SEP) → auth (JWT/bridge) → integration layer → service → DB
  → audit (auditLog) + event (event-bus/postEvent) → consumer
```
**Break:** correlation ID exists only on ingestion; other external consumers (webhooks) have retry/dead-letter but **no correlation ID** (recorded gap).

## Hidden dependencies discovered
1. **Reading→billing** assumes consumption derivation — the billing-engine's input contract is implicit (needs an explicit reading-consumption mapping doc).
2. **Solar wallet** depends on resolved directional inputs — no persisted OBIS registers (OBIS-gated).
3. **GL journaling** (posting-engine) is feature-flag guarded (FINANCIAL_POSTING_ENABLED) — DB-gated live.
