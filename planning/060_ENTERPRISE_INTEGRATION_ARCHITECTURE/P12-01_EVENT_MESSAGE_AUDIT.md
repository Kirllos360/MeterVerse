# P12-01 — EVENT / MESSAGE AUDIT

**Date:** 2026-08-15 · **Gate:** P12-01 · **Method:** verify what actually exists (not what docs claim)

## What EXISTS (verified)
| Mechanism | Location | Real? | Evidence |
|-----------|----------|-------|----------|
| EventBus (in-process) | services/event-bus.js | **YES** | class EventBus { emit, emitAsync } verified |
| postEvent (financial events) | services/posting-engine.js | **YES** | used by payments (PAYMENT_RECEIVED) |
| Scheduler | services/scheduler-engine.js | **YES** | ScheduledTask + jobs |
| QueueJob | schema model | **YES** | job model + imports execute |
| Webhook dispatcher | services/webhook-dispatcher.js | **YES** | outbound HTTP + retry |
| Polling ingestion | services/polling-ingestion.js | **YES** | adapters from ConnectionProfile |
| Websocket gateway | services/websocket-gateway.js | **YES** | realtime |
| SyncLog | schema model | **YES** | sync records |
| ImportJob/ExportJob/OcrJob/PdfJob/ExcelJob | schema models | **YES** | async job models |

## What does NOT exist (verified absent)
| Mechanism | Status |
|-----------|--------|
| External message broker (Kafka/RabbitMQ) | **NOT present** — event-bus is in-process |
| Distributed pub/sub across services | **NOT present** (single Express process) |
| Persistent outbox/transactional-outbox | **NOT present** — postEvent after tx (best-effort) |
| Dead-letter queue (DLQ) | NOT as a broker; webhook has retry only |

## Architecture verdict
- **MeterVerse is a synchronous REST-first system** with an **in-process EventBus** for domain events + **job/queue models** for async work + **webhook dispatcher** for outbound.
- A **distributed broker is NOT required** for current architecture (single process). The P40 plan's "EventBus durability" non-gating condition (from P42) remains open: the in-process bus is not durable across restarts.

## Where event-driven is genuinely required (vs REST sufficient)
| Flow | Current | Required? |
|------|---------|-----------|
| Payment → GL | postEvent (async best-effort) | event (yes, current) |
| Notification after invoice | notification-engine | event or sync (both fine) |
| Import job completion | QueueJob status poll | job (current) |
| Cross-service realtime | websocket-gateway | websocket (current) |
| Durable event replay | NOT present | **GAP** (needs persistent event store for financial audit) |

## Gap
**G-016 (draft):** Financial events (postEvent) are not persisted for replay/audit beyond AuditEntry. Recommend a persistent event/outbox record for financial integrations (P12-02 design candidate).
