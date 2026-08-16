# P12-02-24 — ACCEPTANCE CRITERIA

§25 — objective, measurable Definition of Done (no vague "works").

## Per component
| Component | Measurable acceptance |
|-----------|----------------------|
| Outbox producer | Event + domain mutation commit atomically (integration test: outbox INSERT failure → domain rolled back). 100% of new producers use enqueueEvent. |
| Outbox dispatcher | No double-dispatch under 2 concurrent instances (SKIP LOCKED test). Lease reclaim ≤30s after crash. Throughput ≥100 events/s on test DB. |
| Idempotency | Same-key-same-payload → COMPLETED (persisted response). Same-key-diff-payload → CONFLICT. Concurrency: 2 parallel same-key → 1 processed. Financial event without key → DEAD. |
| Correlation | Every log line + AuditEntry has correlationId. Spoof attempt (invalid UUID) → regenerated server-side. 100% of outbox events carry correlationId. |
| Service auth | Valid key → pass. Expired/revoked/forged key → 401. Nonce replay → 403. Timestamp skew >60s → 403. Service payload areaId ⊄ service scope → 403. |
| Retry/backoff | 5xx → exp backoff (1s base, jitter). 4xx permanent → DEAD immediately. Poison → DEAD. Max attempts → DEAD. Max age → DEAD. |
| Dead-letter/replay | Replay → PENDING (idempotent, audited). Financial replay without idempotency → BLOCKED. Dry-run produces no mutation. |
| Ordering | Per-aggregate ordering preserved; N+1-before-N held then re-queued (no deadlock >30s). |
| Financial safety | Replay of PAYMENT.RECEIVED → no second ledger entry (integration test). Idempotency guard mandatory for financial consumers. |
| Observability | All §13 metrics exported to /metrics/prometheus. Alerts configured (pending>10k, dead>100/h, auth-fail>20/min). |
| Backward compat | Existing postEvent listeners work unchanged through Phase 6 (dual-publish test). Per-consumer cutover flag. |
| Migration | Each phase reversible (flag). migrate deploy on test DB succeeds; rollback (drop new tables) verified. |

## Global
- Full suite grows from 405 → ≥450 (≥45 new tests across unit/integration/E2E/failure/security/perf).
- Graph validator 12/0/0, SpecKit 100%, FE tsc 0.
- No regression in existing 405 tests.
