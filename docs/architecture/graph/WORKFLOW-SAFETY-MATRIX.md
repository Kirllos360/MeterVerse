# METERVERSE — WORKFLOW SAFETY MATRIX (P59-C/LR-3)

**Graph control artifact · version 1.0.0 · reconciled with MASTER-GRAPH-RULES**

Each row: workflow → trigger → authorization → scope → idempotency → failure → recovery → audit → test.

## Import Workflow (Solar Excel ImportJob — IMPLEMENTED LR-3)

| Phase | Trigger | Auth | Area/Project scope | Idempotency | Failure | Recovery | Audit | Test |
|-------|---------|------|--------------------|-------------|---------|----------|-------|------|
| UPLOAD | POST /imports/upload/:type (multer) | documents.* | none (job data) | n/a | file too large / bad mime → 422 | client retry | import.preview | import-engine 8 |
| FILE VALIDATION | mimetype+ext check | documents.* | none | n/a | rejected → 422 + unlink | re-upload | — | 8 |
| SCHEMA VALIDATION | parseWorkbook (xlsx) | documents.* | none | n/a | missing sheet/cols → 422 | re-upload | — | 8 |
| ROW VALIDATION | validateRow | documents.* | none | n/a | per-row errors captured | preview shows invalid rows | — | 8 |
| PREVIEW | createImportJob (status=preview) | documents.* | none | job id stable | — | re-upload | import.preview | 8 |
| EXECUTION | POST /imports/jobs/:id/execute | documents.* | none (job data) | **guarded: status=preview → completed (409 if re-execute)** | row errors counted | partial failure logged; re-upload | import.executed | 8 |
| RESULT | job completed | documents.* | none | — | — | — | — | 8 |

**Boundary:** EXECUTE mutates Customer/Meter/Invoice/Payment via existing models — gated by explicit approval step; does NOT touch the 639 frozen P59-B records. Solar wallet/OBIS behavior NOT in scope.

## Other Critical Workflows (mapped, not re-implemented)

| Workflow | Engine (existing) | Idempotency | Failure→Recovery | Test |
|----------|-------------------|-------------|------------------|------|
| Reading ingestion | scheduler + ingestion-runtime | retry/backoff | failed → review queue | contract |
| Billing/invoice | billing-engine + business-engine | transaction rollback | retry | 7+7 |
| Settlement apply | settlement-engine (LR-2) | one_time guarded | transaction | 7 |
| Payment | payment route + gateway | gateway idempotency | retry + audit | — |
| Tenancy enforcement | security.js requireAccess | n/a | NULL→DENY | 44 |

## Safety Gates per component

| Component | SAFE | WARNING | BLOCKED | RECOVERY |
|-----------|------|---------|---------|----------|
| Database | frozen, guarded | drift detection (P59-B) | mutation by tests | restore from backup |
| Authentication | JWT+session | expired tokens | — | re-login |
| Authorization | backend enforce | UI-only fallback risk | cross-area edge | requireAccess deny |
| Tenancy | fail-closed | NULL scope | P59-B 639 | approved repair |
| Billing | transaction | partial failures | unapproved bill run | rollback |
| Payments | gateway idempotent | gateway down | duplicate charge | retry + reconciliation |
| Imports | preview-first | invalid rows | execution without approval | re-upload |
| Background jobs | retry/backoff | dead-letter | — | alert + operator |
| Notifications | queue | delivery failure | — | retry + receipts |

## Failover / Continuity Safety (DESIGNED — not implemented)

| Metric | Value | Status |
|--------|-------|--------|
| RTO/RPO | REQUIRES BUSINESS DECISION | PENDING |
| Single write owner | DESIGNED (fencing token) | DESIGNED |
| Profile 1 activation | DESIGNED (detection→fence→activate) | DESIGNED |
| Profile 2 emergency | DESIGNED (read-only survival) | DESIGNED |
| Test isolation | IMPLEMENTED + proven | CERTIFIED |
