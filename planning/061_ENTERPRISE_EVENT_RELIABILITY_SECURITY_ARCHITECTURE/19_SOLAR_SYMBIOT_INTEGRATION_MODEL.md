# P12-02-19 — SOLAR / SYMBIOT INTEGRATION MODEL

## Purpose (§16): reconcile P12-02 with P60.6/P60.7 (already-certified Symbiot behavior — do not redesign).

## Where each foundation element applies in the Symbiot→Solar chain
```
Symbiot → TCP/HTTP (service auth G-017: X-Service-Key)      [06]
  → ingestReading (P60.6/7: serial→Meter, meter-owned tenancy, fail-closed)
      + correlationId (already present P60.7)                [05]
      + idempotencyKey = sha256(area:ingest:meter:timestamp:value)  [04]
  → Reading persisted (source=symbiot)
  → outbox event READING.INGESTED (new producer wrapper)     [02]
  → dispatcher → solar-wallet-engine (idempotent consume)    [04]
  → settlement → solar billing → INVOICE.ISSUED (financial, controlled)  [18]
```

## Additions (P12-02), no redesign of P60.6/7:
1. **Service auth on the bridge** (X-Service-Key + signature + nonce) — closes G-017. Dual-mode during rollout (env flag).
2. **Idempotency for ingestion:** ingestReading currently appends (P60.7 semantics). Add IdempotencyRecord dedup (same meter+timestamp+value) → second push returns COMPLETED instead of duplicate Reading. This is additive (safe; keeps P60.7 tests).
3. **READING.INGESTED outbox event:** after persist, enqueue outbox row (same tx) → downstream (solar-wallet) consumes idempotently.
4. **Correlation:** ingest correlationId propagates into Reading + outbox + solar (already P60.7 for bridge; extend to outbox).

## What stays (certified, unchanged)
- ingestReading tenancy (meter-owned), fail-closed (unknown meter/negative/future timestamp), rate-limit, correlation — P60.6/P60.7 hardened. P12-02 only ADDS idempotency record + outbox + service auth around it.

## Safety
- Replay of READING.INGESTED is safe (non-financial until billed). Solar consumption recomputation idempotent via wallet engine (16 tests).
- Financial events from solar (INVOICE.ISSUED) follow 18_ACCOUNTING_SAFETY (controlled replay).
