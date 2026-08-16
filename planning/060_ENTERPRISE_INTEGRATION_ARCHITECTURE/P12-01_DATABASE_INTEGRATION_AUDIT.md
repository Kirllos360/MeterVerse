# P12-01 — DATABASE INTEGRATION AUDIT

**Date:** 2026-08-15 · **Gate:** P12-01 · **Method:** Prisma schema mapping (§12)

## Integration-related models (verified in schema.prisma)
| Model | Purpose | Integration role |
|-------|---------|------------------|
| AuditEntry | audit trail | audit-by-design |
| ApiKey | external API access | auth |
| Gateway + GatewayLog | meter gateway | transport |
| ConnectionProfile | external DB config | integration config |
| SyncLog | sync records | sync status |
| Webhook | outbound events | event outbound |
| QueueJob | async jobs | job queue |
| ScheduledTask + Task | scheduled/workflow | automation |
| Notification + Template + Preference | notifications | communication |
| ImportJob / ExportJob / OcrJob / PdfJob / ExcelJob | async file jobs | import/export |
| PaymentTransaction | payment allocation | financial integration |
| CustomerLedgerEntry | ledger | financial |
| InvoiceSettlement | settlement lines | financial |
| Reading (source/timestamp/areaId) | meter data | ingestion |

## External identity mapping
- **Meter.serial (unique)** = the external identity for Symbiot ingestion. Verified: ingestReading maps serial→Meter.
- No dedicated `ExternalIdentity` model — serial IS the mapping (sufficient for current scope).

## Missing models required for reliable integration (P12-02 candidates)
| Missing | Why | Severity |
|---------|-----|----------|
| Persistent Event/Outbox record | financial events (postEvent) not replayable across restart | HIGH (financial audit) |
| CorrelationRecord | correlation IDs only on ingestion | MED |
| ReconciliationRecord | payment/invoice reconciliation evidence | MED |
| IdempotencyRecord | explicit idempotency keys (only import/cheque have guard) | MED |

## Migration safety (re-verified from P60.7)
- 16 versioned migrations exist; deploy now uses `migrate deploy` (P60.7 §12 fix). Dev `db:setup` retains db push.
- **Data safe:** backup `meterverse_20261508.sql` matches baseline (223/277/361/116/53 + Settlement 3 + ImportJob 2).

## Gap
- **G-021:** persistent financial event/outbox (P12-02 design candidate).
- **G-022:** reconciliation + idempotency records (P12-02 design candidates).
