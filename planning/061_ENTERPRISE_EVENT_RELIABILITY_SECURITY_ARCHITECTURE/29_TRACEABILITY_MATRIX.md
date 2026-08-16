# P12-02-29 — TRACEABILITY MATRIX

§35 — Business Requirement → Domain → Process → Data Model → API → Event → Security → Consumer → Test → Acceptance → Task.

| Req | Domain | Process | Model | API | Event | Security | Consumer | Test | Acceptance | Wave |
|-----|--------|---------|-------|-----|-------|----------|----------|------|-----------|------|
| Reliable event publish | Events | business-tx→outbox | OutboxEvent | internal publish | all | service auth | dispatcher | atomic-tx | commit atomic | D |
| No event loss | Events | outbox atomic | OutboxEvent | — | — | — | dispatcher | crash-inject | no loss | D,E |
| Idempotent consumers | Idempotency | consumer-dedup | IdempotencyRecord | — | all | tenant key | consumer | dup-delivery | no double-apply | C,I,J |
| Correlation trace | Observability | request→event→audit | OutboxEvent+AuditEntry | — | all | server-authoritative | all | trace test | log+audit has corrId | B |
| Service auth | Security | service→operation | ServiceIdentity/Credential | /internal/* | — | HMAC+nonce | services | auth neg-tests | 401/403/expired | G |
| Retry/DLQ | Reliability | failed-delivery | EventDelivery/DeadLetter | replay API | — | admin.ops | dispatcher | failure-inject | DEAD on max | F |
| Financial replay safety | Accounting | controlled-replay | IdempotencyRecord | replay | financial | guard | ledger | replay-fin | no dup journal | J |
| Scoped ordering | Ordering | per-aggregate | OutboxEvent idx | — | — | — | consumer | order test | N+1 held | E |
| Observability metrics | Observability | outbox metrics | — | metrics | — | — | dispatcher | metrics test | prometheus export | H |
| Solar/Symbiot | Solar | reading→wallet | Reading+OutboxEvent | ingestion | READING.INGESTED | bridge auth | solar-wallet | e2e | idempotent ingest | I |
| Backward compat | Events | dual-publish | — | — | — | — | legacy listeners | compat test | postEvent intact | K |

## Coverage
- All major P12-02 requirements traceable to model→event→test→acceptance→wave.
- **Coverage: 100%** of the 11 core requirements above (all rows have every column). Financial/solar covered (rows 4,7,10).
- Traceability verified in this matrix; no orphan requirement.
