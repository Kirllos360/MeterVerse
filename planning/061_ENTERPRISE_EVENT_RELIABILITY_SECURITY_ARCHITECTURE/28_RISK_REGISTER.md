# P12-02-28 — RISK REGISTER

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|----|------|-----------|--------|------------|-------|--------|
| R-01 | Outbox grows unbounded | low | med | retention 90d + archive + sweeper | ops | designed (13,10) |
| R-02 | Retry storm | med | med | backoff jitter + concurrency limit + self-throttle | eng | designed (08,12) |
| R-03 | One tenant starves others | low | high | per-area replay + consumer scope + fair batch | eng | designed (09) |
| R-04 | Financial duplicate on replay | med | critical | idempotency mandatory + financialReplayGuard | eng | designed (18) |
| R-05 | Schema evolution breaks consumers | med | high | eventVersion + versioned consumers + poison→DEAD | eng | designed (07) |
| R-06 | PG scale limits (outbox volume) | low | med | partitioning documented; perf target verified | eng | designed (10) |
| R-07 | Service key leak | low | high | HMAC hash, rotation, revocation, audit | sec | designed (06) |
| R-08 | Nonce replay window | low | med | nonce cache 30s + timestamp skew | sec | designed (06) |
| R-09 | Migration regression | med | med | dual-publish + per-consumer flag + full regression | eng | designed (15,16) |
| R-10 | PG environmental blocker persists | high | high | recovery doc; implementation gated | ops | BLOCKED (G-001) |
| R-11 | OBIS/SEP evidence delays solar consumers | med | med | outbox core independent; solar consumer after evidence | owner | EVIDENCE |
| R-12 | Existing consumers break during cutover | med | high | shadow mode + dual-publish + rollback flags | eng | designed (16) |

## Top residual risks
1. R-04 financial duplicate (mitigated by mandatory idempotency — HIGH confidence).
2. R-10 PG blocker (external, documented; gates implementation, not design).
3. R-12 cutover regression (mitigated by shadow + flags).
