# P12-01 — DEPENDENCY GRAPH

**Date:** 2026-08-15 · **Gate:** P12-01 · **Method:** dependency tracing (verified layers)

## Layer structure (verified)
```
┌─────────────────────────────────────────────────────────┐
│ L0  Presentation: Admin FE (:3535) · Portal FE (:3030)  │
├─────────────────────────────────────────────────────────┤
│ L1  API: 69 route modules (auth→ingestion→reports)      │
├─────────────────────────────────────────────────────────┤
│ L2  Service: 48 services (engines + integration)        │
├─────────────────────────────────────────────────────────┤
│ L3  Data: Prisma (189 models) → PostgreSQL :5433        │
├─────────────────────────────────────────────────────────┤
│ L4  External: Symbiot, SEP(gated), email/SMS, webhooks  │
└─────────────────────────────────────────────────────────┘
```

## Key dependency edges (verified)
```
FE → L1 routes → L2 services → L3 Prisma → L4 external
Symbiot → symbiot-bridge → ingestReading → Reading → billing → invoice → payment → ledger
imports → import-engine → ImportJob → QueueJob → execute (gated)
webhooks → webhook-dispatcher → external
scheduler → scheduler-engine → ScheduledTask → QueueJob
event-bus ← (postEvent) ← payments/accounting
AI: routes → D:\meter\src\intelligence (CROSS-ROOT — debt) → backend db/logger (cycle)
```

## Cycles
1. **Cross-root cycle (KNOWN DEBT):** backend routes → D:\meter\src\intelligence → backend db/logger. Functional (loads), perf warning (type:module). Documented G-009.
2. **No other cycles** in the primary service graph (verified layer ordering).

## Dependency graph file (DOT)
See diagrams (D-P12-002) — generated via dot from this structure.

## Blocking edges (live)
- All → Prisma → PostgreSQL (G-001, environmental)
- Solar capture → OBIS (G-003, approval)
- SEP transport → external spec (G-004)
