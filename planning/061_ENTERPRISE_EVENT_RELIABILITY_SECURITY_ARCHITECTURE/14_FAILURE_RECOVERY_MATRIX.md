# P12-02-14 — FAILURE RECOVERY MATRIX

## 20 cases (§21) — behavior, recovery, retry, audit, monitoring, data-integrity
| # | Failure | Expected behavior | Recovery | Retry | Audit | Monitor | Data integrity |
|---|---------|-------------------|----------|-------|-------|---------|----------------|
| 1 | DB commit ok, crash before dispatch | outbox row committed | dispatcher resumes, claims on lease expiry | yes | — | pending>0 | safe (no loss) |
| 2 | DB commit fails | tx rolls back (domain + outbox) | caller retries | yes | — | errors | safe |
| 3 | Outbox insert fails | tx rolls back | same | yes | — | errors | safe |
| 4 | Dispatcher crashes | claimed leases expire (30s) | re-claim | yes | crash log | dead dispatcher | safe |
| 5 | Consumer crashes before ack | delivery PENDING, lease expiry | redeliver → idempotent | yes | delivery log | lag | safe |
| 6 | Consumer done but ack fails | delivery stuck PENDING | redeliver → idempotent (no double-apply) | yes | ack failure | duplicate rate | safe |
| 7 | External API ok but response lost | consumer retries → external idempotent? | if external non-idempotent → guarded (idempotency key passed) | yes | — | timeout | requires external idempotency |
| 8 | Duplicate event arrives | idempotencyKey → COMPLETED, skip | auto | n/a | duplicate counter | duplicates | safe |
| 9 | Same key, different payload | CONFLICT (409 / reject + alert) | operator resolves | no | conflict log | conflicts | safe (never overwrite) |
| 10 | Service credential expires | verify fails 401 | renew (rotate) → retry | yes | expiry alert | auth failures | safe |
| 11 | Service credential revoked | verify fails 401 | reissue | no | revoke log | auth failures | safe |
| 12 | Tenant context missing | event held (RETRY "missing scope") | operator fixes producer | no | — | pending | safe (fail-closed) |
| 13 | Tenant context spoofed | consumer scope check rejects (areaId from aggregate, not payload) | drop + alert | no | security log | auth failures | safe |
| 14 | Event payload malformed | poison → DEAD immediately | operator fixes/upgrades | no | poison log | dead>0 | safe |
| 15 | Event version unsupported | poison → DEAD (versioned consumer) | operator upgrades consumer | no | — | dead | safe |
| 16 | Dead-letter replay | audited replay → PENDING (idempotent) | manual, admin.ops | yes | replay log | replay counter | safe (idempotency) |
| 17 | Database unavailable | dispatcher backs off, events wait | DB recovery (P60.7 doc) | yes | DB alerts | — | safe (outbox durable) |
| 18 | Network unavailable | consumer 5xx/timeout → retry | backoff | yes | — | retries | safe |
| 19 | External dependency unavailable | consumer 5xx/timeout → retry → DEAD after max | manual replay when dep back | yes | — | dead | safe |
| 20 | Event ordering violation (N+1 before N) | consumer holds, waits for predecessor | re-queue after timeout (30s) | yes | order log | lag | safe (ordering guard) |

## Financial-safety overlay (see 18)
- Any case that could create a duplicate financial entry (1,5,6,8,16,20) is protected by IdempotencyRecord — **no case produces a silent duplicate ledger/invoice/payment**.
- Financial replay (16) requires idempotency record present, else BLOCKED + operator review.
