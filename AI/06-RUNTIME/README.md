# 06-RUNTIME — Runtime Evidence & Operational Memory

## Purpose

Index of runtime evidence collection and the live operational memory (HANDSHAKE.md).

## Source of Truth

| Document | Location | Covers |
|----------|----------|--------|
| HANDSHAKE.md | `../../HANDSHAKE.md` | Live operational memory, session state, runtime evidence status |

## Runtime Evidence

Per EAOS.md Chapter 2.4 (Runtime-First), no claim is valid without runtime evidence. The current runtime evidence status is:

| Metric | Current Value | Source |
|--------|--------------|--------|
| Pipeline Operations Executed | 0 | HANDSHAKE.md Section 10 |
| Domain Events Published | 0 | HANDSHAKE.md Section 10 |
| Policies Evaluated | 0 | HANDSHAKE.md Section 10 |
| Validators Executed | 0 | HANDSHAKE.md Section 10 |
| Services Using EnterpriseService | 2 | HANDSHAKE.md Section 10 |
| Controllers Using PrismaService | 20 | HANDSHAKE.md Section 10 |

## Runtime Collection Points

- `RuntimeMetricsEngine` (`Meter/backend/src/runtime/metrics/runtime-metrics-engine.ts`) — Counters, gauges, histograms
- `OperationLifecycle` (`Meter/backend/src/runtime/lifecycle/operation-lifecycle.ts`) — Per-operation records
- `RuntimeHealthEngine` (`Meter/backend/src/runtime/health/runtime-health-engine.ts`) — Component health scores
- `EventBusService` (`Meter/backend/src/common/events/event-bus.service.ts`) — Event counts
