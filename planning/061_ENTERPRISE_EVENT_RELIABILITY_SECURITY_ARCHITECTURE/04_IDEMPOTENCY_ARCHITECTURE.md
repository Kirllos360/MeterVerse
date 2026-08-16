# P12-02-04 — IDEMPOTENCY ARCHITECTURE

## 1. Universal idempotency framework (§8)
Covers: HTTP requests, event consumers, payments, invoices, reading ingestion, Symbiot ingestion, settlement, webhooks, background jobs, retries, replay.

## 2. IdempotencyRecord model
```
model IdempotencyRecord {
  id           String   @id @default(uuid())
  key          String                                  // canonical idempotency key
  scope        String                                  // "http" | "event" | "job" | "ingestion"
  tenantId     String?   // tenant binding
  areaId       String?   // area binding (P58: key is area-scoped)
  projectId    String?
  endpoint     String?                                 // endpoint/operation binding
  operation    String?                                 // e.g. "payment.create"
  requestHash  String                                  // SHA-256 of normalized payload
  status       String   @default("IN_PROGRESS")        // IN_PROGRESS|COMPLETED|CONFLICT
  responseBody Json?                                   // persisted response (HTTP replay)
  createdAt    DateTime @default(now())
  expiresAt    DateTime                                // retention
  @@unique([scope, areaId, operation, key])            // uniqueness scoped to tenant+op
  @@index([expiresAt])
}
```

## 3. Semantics — same key, same payload vs different payload (§8)
| Case | Behavior |
|------|----------|
| same key + same payload (hash match) | return persisted response (HTTP) / skip (event) — **idempotent replay** |
| same key + different payload (hash mismatch) | **CONFLICT** — 409 (HTTP) / reject + alert (event); never silently overwrite |
| key not found | process, create record (IN_PROGRESS → COMPLETED) |

## 4. Concurrency (§8)
- Atomic claim: `INSERT ... ON CONFLICT DO NOTHING` for the key; if 0 rows inserted → another request holds the key → read status (return persisted response or CONFLICT).
- Locking: row-level via unique constraint; no external lock needed.

## 5. Key format (§8)
```
idemKey = sha256(scope:areaId:operation:clientKey)
clientKey = explicit header (Idempotency-Key) OR derived (eventId/aggregateId+type for events, meter+timestamp for ingestion)
```

## 6. Coverage mapping
| Operation | Key source | Current | P12-02 |
|-----------|-----------|---------|--------|
| Payment create | Idempotency-Key header | alloc-cap (partial) | + IdempotencyRecord |
| Cheque clear | eventId | idempotent (code) | + record |
| Import execute | job status-guard | present | + record |
| Reading/Symbiot ingest | meter+timestamp+source | append (P60.7) | + record (dedup) |
| Settlement apply | invoice+settlement | invoice-guard | + record |
| Webhook receive | webhook id | — | + record |
| Event consumer | eventId | — | + record (dedup) |

## 7. Cleanup / expiry
- TTL by operation class (payments 24h, events 7d, ingestion 30d). Sweeper job deletes expired.
- **Never delete too early** for financial ops (see 18_ACCOUNTING_SAFETY).

## 8. Replay behavior
- Replay uses the same idempotency key → replayed event returns COMPLETED (no duplicate financial mutation).
- This is the core financial-safety guarantee (see 14/18).
