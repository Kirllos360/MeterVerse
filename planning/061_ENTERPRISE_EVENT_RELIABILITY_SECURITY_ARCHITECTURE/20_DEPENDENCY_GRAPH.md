# P12-02-20 — DEPENDENCY GRAPH

## What P12-02 unlocks / blocks (§26)
```
P12-02 Foundation
  ├─ unlocks → Event Reliability (outbox/dispatch)
  ├─ unlocks → Idempotency (financial-safe retries/replay)
  ├─ unlocks → Traceability (correlation)
  ├─ unlocks → Service-to-service security (bridge auth)
  │
  ├─ enables → P12-03 (consumer migration) 
  ├─ enables → Wave 07 Accounting (idempotent journal posting)
  ├─ enables → Meter Operations (reliable reading events)
  ├─ enables → Solar Invoice (READING.INGESTED → wallet → invoice)
  ├─ enables → Collections (payment/aging events)
  ├─ enables → Reporting (correlated events)
  ├─ enables → Integrations (external webhook reliability)
  └─ enables → Enterprise Release
```

## Dependency order
```
P12-01 (baseline) → P12-02 (this) → P12-03 (consumer migration) → Wave 07 Accounting
   → Meter Ops → Solar Invoice → Collections → Reporting → Integrations → Release
```

## What still blocks implementation
- **PostgreSQL :5433 runtime** (G-001, environmental) — schema migration + integration tests need PG.
- **SEP/Jasper external evidence** (G-004/013/019) — not needed for outbox core, only for those consumers.
- **OBIS approval** (G-003) — not needed for outbox; solar wallet consumes READING events regardless.

## Internal dependency graph (P12-02 components)
```
schema (10) ← producer (02) ← dispatcher (12) → consumer (04) → accounting (18)
   ↑                          ↑
correlation (05)        service-auth (06)
idempotency (04)        retry/DLQ (08)
observability (13) ← dispatcher + consumers
```

## Decision
P12-02 core is **not blocked by OBIS/SEP** (independent); only PG runtime gates implementation/testing. Solar/SEP consumers can be added after core.
