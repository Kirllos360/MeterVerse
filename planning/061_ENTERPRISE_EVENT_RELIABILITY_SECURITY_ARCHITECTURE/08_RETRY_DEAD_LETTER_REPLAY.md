# P12-02-08 — RETRY / DEAD-LETTER / REPLAY

## 1. Retry policy (§12)
| Failure class | Example | Retryable? | Backoff |
|---------------|---------|------------|---------|
| 4xx permanent | validation error, 409 conflict | **NO** → DEAD immediately | — |
| 4xx transient | 429 rate-limit | yes (respect Retry-After) | fixed 60s |
| 5xx | 500/502/503 | yes | exp backoff |
| Timeout | external API timeout | yes | exp backoff |
| DB failure | connection lost | yes | exp backoff |
| Auth failure | credential expired/revoked | yes (after renewal) | exp |
| Poison | malformed/unsupported version | **NO** → DEAD (poison quarantine) | — |

**Backoff:** `delay = base * 2^(attempt-1) + jitter(0..base)`, base 1s, max 300s. **Max attempts:** 5 (transient) / 3 (5xx). **Max age:** 24h (event older than max-age → DEAD).

## 2. Dead-letter (§12)
- EventDeadLetter record created when: attempts>max, permanent 4xx, poison, or max-age exceeded.
- Fields: eventId, consumerKey, reason (maxAttempts|permanentFailure|poison|timeout|auth), lastError, replayed flag.
- **DLQ does not block other events** (per-event; one poisoned event cannot stop the queue).

## 3. Replay (§12/14)
| Replay type | Scope | Authorization | Idempotent? | Audit |
|-------------|-------|---------------|-------------|-------|
| single event | eventId | admin.ops | yes (idempotencyKey) | replayedAt logged |
| aggregate | aggregateType+id | admin.ops | yes | logged |
| time range | status+createdAt window | admin.ops (dry-run first) | yes | logged |
| tenant | areaId | admin + area scope | yes | logged |
| event type | eventType | admin.ops | yes | logged |
| dead-letter | DLQ rows | admin.ops | yes | logged |
| dry-run | — | admin.ops | n/a | logged (no mutation) |

- **Financial replay is CONTROLLED** (see 18_ACCOUNTING_SAFETY): replay of financial events requires idempotency record present; if absent → blocked + operator review (never auto-replay a financial event that would duplicate a ledger entry).
- Replay sets status PENDING, resets attemptCount, sets causationId=original event.

## 4. Replay authorization
- `admin.ops` permission + audit entry (who, what, when, dry-run flag).
- No anonymous/self-service replay.

## 5. Poison handling
- Poison events (unparseable payload / unsupported eventVersion) → DEAD immediately with reason=poison. Operator decides upgrade/reprocess.

## 6. Retry-storm protection
- Dispatcher global concurrency limit (5) + per-consumer semaphore (2) + backoff jitter prevent thundering herd.
