# P58 — DATA ARCHITECTURE REPORT
**Date:** 2026-08-12

## CURRENT STATE (verified)
- Single PostgreSQL DB `meter_pulse` on :5433
- Both backends (admin :3131, portal :3003) connect to the SAME DB
- 187 Prisma models, single public schema
- 5 users · 4 roles · 204 perms · 3 areas · 4 projects · 96 customers · 132 meters · 76 invoices · 33 payments · 234 readings

## RECOMMENDED ARCHITECTURE: OPTION A — One shared DB + enforced tenancy
**Rationale:**
- **Security:** tenancy via row-level scope (PermissionOnRole.scopeType/scopeId + requireAccess) — model already exists, only enforcement missing
- **Isolation:** functional isolation via role+scope, not separate DBs
- **Performance:** single connection pool, no cross-DB joins needed
- **Operational complexity:** one backup/restore/migration path
- **Reporting:** admin can monitor portal data directly (no ETL)
- **Auditability:** one AuditEntry stream
- **Consistency:** no split-brain (admin and portal read/write same truth)
- **Future scale:** area/project tenancy scales to more areas; schema-per-tenant later if needed

## ALTERNATIVES (rejected)
- **B (separate DBs):** split-brain risk, duplicate master data, harder reporting/reconciliation, more ops
- **C (schema-per-tenant):** overkill for 3 areas; migration complexity high
- **D (hybrid):** no benefit until multi-tenant SaaS requirement is real

## ADMIN MONITORING PORTAL WITHOUT ESCALATION (Decision 1 requirement)
- Admin monitors portal via the SAME DB read paths, gated by admin-scoped permissions
- Admin cannot mutate portal-owned records unless explicitly permitted (deny-by-default via grant=false rows)
- No privilege escalation: admin reads are themselves subject to requireAccess checks

## RISKS & MIGRATION COST
- **Risk:** if enforcement (OD-01) is not applied, shared DB = shared vulnerability → **P0 gate**
- **Migration cost:** LOW — no schema change needed; work is wiring requireAccess into routes + list scoping + seeding area-scoped roles
- **Backup/recovery:** single-DB backup already works (backup-db.mjs → 5433)

## DATA LINEAGE (current vs recommended)
Current: AuditEntry has actor, action, resource, resourceId, before/after snapshots, correlationId — GOOD foundation.
Missing: no `areaId`/`projectId` on AuditEntry rows (lineage not scoped); recommend adding scope columns to AuditEntry for per-area audit queries.

## FUTURE IMPACT
Option A supports the full C22 SaaS roadmap (Tenant → Subscription → Usage) by adding a `tenantId` scope layer on top of the existing scopeType/scopeId model — no architecture change needed.
