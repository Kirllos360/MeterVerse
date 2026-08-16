# P12-02-13 — OBSERVABILITY ARCHITECTURE

## 1. Metrics (§20)
Exposed via existing /metrics/prometheus endpoint (metrics-collector) + new event metrics:
| Metric | Type | Meaning |
|--------|------|---------|
| meterverse_outbox_pending | gauge | PENDING count |
| meterverse_outbox_retry | gauge | RETRY count |
| meterverse_outbox_dead | gauge | DEAD count |
| meterverse_outbox_age_seconds | histogram | age of oldest PENDING |
| meterverse_outbox_dispatch_total | counter | events dispatched |
| meterverse_outbox_success_total | counter | acked |
| meterverse_outbox_retry_total | counter | retried |
| meterverse_outbox_duplicate_total | counter | idempotency duplicates (consumer) |
| meterverse_outbox_idem_conflict_total | counter | same-key-different-payload conflicts |
| meterverse_outbox_replay_total | counter | replay operations |
| meterverse_svc_auth_failure_total | counter | failed service auth |
| meterverse_svc_auth_total | counter | service auth attempts |
| meterverse_event_latency_seconds | histogram | event publish→ack latency |
| meterverse_consumer_lag | gauge | per-consumer delivery backlog |

## 2. Logs (§20)
- Structured JSON (existing logger) with requestId + correlationId + service + eventId.
- Dispatcher logs: claim, deliver, ack, retry, dead-letter (with reason).
- Consumer logs: idempotency hit/conflict, poison.
- Audit (AuditEntry): replay, revoke, issue, publish (who/what/when + correlationId).

## 3. Alerts (§20)
- Outbox pending > 10k or lag > 5min → HIGH alert.
- Dead-letter growth > 100/h → HIGH.
- Idempotency conflicts > 10/h → MEDIUM (possible key collision/bug).
- Service auth failure burst > 20/min → HIGH (possible intrusion).
- Retry storm (retry rate > 50/min) → MEDIUM.

## 4. Dashboards (§20)
- **Outbox Health:** pending/retry/dead gauges, age, dispatch rate, success/retry ratio.
- **Delivery:** per-consumer success/fail/lag, duplicate rate.
- **Security:** service auth success/fail, replay count, conflicts.
- **Latency:** event publish→ack histogram, p50/p95/p99.

## 5. Implementation
- Extend metrics-collector.js with the above gauges/counters.
- Health-monitor integrates dispatcher liveness.
- No new observability stack (reuse Prometheus export + logs).
