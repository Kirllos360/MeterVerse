# P12-02-26 — ENTERPRISE BENCHMARK REVIEW

§29 — industry patterns labeled (SOURCE-DERIVED / INDUSTRY-RESEARCH / ARCHITECTURAL-RECOMMENDATION / INFERENCE).

| Pattern | Source label | Relevance to P12-02 |
|---------|--------------|----------------------|
| Transactional outbox (Microservices.io) | INDUSTRY-RESEARCH | Core of P12-02 (02). Apply: DB table written in same tx; relay/dispatcher publishes. |
| Outbox with SKIP LOCKED | INDUSTRY-RESEARCH | Dispatcher claim (12). Standard for multi-worker outbox. |
| Idempotency-key pattern (Stripe/Stripe docs pattern) | INDUSTRY-RESEARCH | 04 (same key+same payload → replay response; diff payload → conflict). |
| Correlation ID / trace propagation (W3C Trace Context) | INDUSTRY-RESEARCH | 05 (requestId/correlationId/causationId; future traceId/spanId). |
| Effectively-once vs exactly-once | INDUSTRY-RESEARCH | 07 (at-least-once + consumer idempotency = effectively-once; never claim exactly-once). |
| Service API keys + HMAC (no mTLS) | ARCHITECTURAL-RECOMMENDATION | 06 — chosen for single-process monolith + 8GB env; mTLS overkill. |
| Dead-letter queue | INDUSTRY-RESEARCH | 08 (EventDeadLetter). |
| Backoff with jitter (AWS/Azure docs) | INDUSTRY-RESEARCH | 08 (exp backoff + jitter). |
| SAP/Oracle Utilities/Siemens EnergyIP | SOURCE-DERIVED | Utility-domain reference: event-driven meter→billing; confirms per-aggregate ordering + financial idempotency. NOT copied (proprietary). |
| Enterprise integration architecture | SOURCE-DERIVED | Confirms REST-first + outbox for reliability; no broker needed at this scale. |
| Ledger immutability + adjustment entries | SOURCE-DERIVED | 18 (accounting safety: immutability, adjustments, no silent duplicate). |

## Verdict
P12-02 applies **industry-standard, battle-tested patterns** (transactional outbox, idempotency keys, correlation IDs, DLQ, backoff+jitter, service API keys) adapted to MeterVerse's single-process + PostgreSQL reality. **No proprietary code copied.** No fashionable infra (Kafka/Redis) introduced because scale/env doesn't justify it (evidence-based, §4).
