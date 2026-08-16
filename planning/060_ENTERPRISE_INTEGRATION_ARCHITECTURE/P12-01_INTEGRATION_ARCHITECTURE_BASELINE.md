# P12-01 — INTEGRATION ARCHITECTURE BASELINE

**Date:** 2026-08-15 · **Gate:** P12-01 · **HEAD:** 5ce0e2c1

## The authoritative integration reality
MeterVerse is a **monolithic Express+Prisma backend** (single process) with:
- **Synchronous REST-first** integration (69 route modules, ~200+ endpoints) for frontend/portal/external API consumers.
- **In-process EventBus** for domain events (not distributed).
- **Job/queue models** (QueueJob, ImportJob, ExportJob, ScheduledTask) for async work.
- **Webhook dispatcher** for outbound events.
- **Websocket gateway** for realtime.
- **Symbiot bridge** (TCP :9000 + HTTP :9001) for meter transport + ingestion.
- **Connection profiles/manager/pool** + **credential vault** for external DB integration.
- **Engine services** (billing, settlement, solar-wallet, posting, import, pdf, notification) as the business-logic core.

## Architecture principles confirmed
1. **Single-process monolith** — no microservices, no external broker (correct for current scale).
2. **Tenancy-by-design:** requireAccess/scopeWhere/clamp (P59-B) — verified.
3. **Audit-by-design:** auditLog on all mutations — verified.
4. **Idempotency-by-design:** import (status-guard), cheque-clear, payment-alloc — verified; **not universal** (G-015).
5. **Security-by-design:** RBAC + fail-closed — verified.
6. **Source of truth:** meter_pulse (Prisma) for platform data; external meter DBs read via connection profiles.

## What the baseline DOES NOT claim
- NOT distributed/event-sourced (no outbox — G-016).
- NOT multi-service (single process).
- NOT OBIS-complete (capture gated — G-003).
- NOT SEP-connected (transport gated — G-004).
- NOT live-verified end-to-end (PG blocked — G-001).

## Foundation sufficiency (P12-01 §16 check)
| Foundation | Sufficient? |
|------------|-------------|
| Identity/auth | ✅ JWT + RBAC |
| Tenancy/area/project | ✅ fail-closed |
| API contracts | ✅ (139+ endpoints, contracts consistent) |
| Event contracts | ⚠️ in-process only, no outbox (G-016) |
| DB ownership | ✅ Prisma single source |
| Auditability | ✅ AuditEntry |
| Idempotency | ⚠️ partial (G-015) |
| Retries/failure | ⚠️ webhook/import only (G-015) |
| Observability | ⚠️ correlation partial (G-014) |
| Versioning | ⚠️ no explicit API versioning for all |
| Migration | ✅ 16 migrations + migrate deploy (P60.7) |
| Config | ✅ config-center/env |
| Deployment/rollback | ⚠️ Windows-only launcher (G-011) |

## Verdict
The **integration foundation is SOLID but not complete**: identity/tenancy/API/migration/audit are enterprise-grade; **event durability (outbox), universal idempotency/correlation, and external-service evidence (SEP/Jasper) are the P12-02 design priorities**.
