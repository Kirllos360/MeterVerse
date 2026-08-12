# P58 — EXECUTION BLUEPRINT (dependency-aware)
**Date:** 2026-08-12 · **Status:** FOR APPROVAL — do not auto-execute

## PHASES (dependency order)

### PHASE 0 — Repository stabilization (1-2 days)
- Complete Meter/ backup → delete (user decision)
- Dead-code cleanup (~17 files, 47 nav-less routes)
- Rename AdminLayout default export (SystemLayout conflict)
- Add launcher regression scan (trailing-space + stale ports) to CI
- Re-baseline P40 tracker coverage

### PHASE 1 — Runtime/config stabilization (1 day)
- Verify X-Dev-Mode bypass stripped in prod
- GitPush.cmd secret gate
- Mock creds removal (env-only)

### PHASE 2 — Financial completeness (C13) (3-5 days)
- Model C13-W05 Bank Reconciliation (9 models + routes + engine)
- GL migration baseline (`prisma migrate diff` + apply)
- Tariff engine: verify Egyptian fee chain + seed real per-area tariffs

### PHASE 3 — Authorization: role-level hardening (2 days)
- Verify requirePermission coverage (61/63 already)
- Seed granular PermissionOnRole for advanced domains
- Add permission tests (RBAC isolation: admin 200 / billing 403 / ops 403)

### PHASE 4 — Authorization: DATA-SCOPE ENFORCEMENT (P0 GATE) (3-5 days) ⚠️
- Apply `requireAccess` to detail/update/delete routes for scoped models (Customer, Meter, Reading, Invoice, Payment, Zone, Unit, etc.)
- Scope list queries by user area/project from PermissionOnRole(scopeType/scopeId)
- Migration: User.area/project string → role-scope binding
- Horizontal escalation tests: User A → Project B / Area B / Customer B must 403

### PHASE 5 — Admin core truth (2-3 days)
- Wire or remove the 9 MOCK pages (upload, documents, sync, balances, bill-cycle, monitoring, accounting/accounts, database, database-management)
- Wire or remove the 11 STATIC pages
- Finish the 10 MIXED settings pages

### PHASE 6 — Portal core truth (2-3 days)
- Wire portal operational pages (customer cards, statements)
- Ensure portal cannot reach admin data (verify with scoped tokens)

### PHASE 7 — Data lineage/audit (1-2 days)
- Add areaId/projectId to AuditEntry
- Correlation ID end-to-end

### PHASE 8 — Monitoring/observability (1 day)
- Portal health in admin monitor
- Scheduler/queue/ingestion dashboards (already live — verify)

### PHASE 9 — Operational data (1 day)
- Re-seed operational data; verify counts

### PHASE 10 — Wave 4 readiness (GATE) 
- Re-run the §24 prerequisite matrix
- BLOCKED until Phases 0-9 pass

## DEPENDENCY GRAPH
```
Phase 0 ──> Phase 1 ──> Phase 2 ─┐
                                 ├──> Phase 3 ──> Phase 4 (P0 gate) ──> Phase 5 ──> Phase 6 ──> Phase 7 ──> Phase 8 ──> Phase 9 ──> Phase 10 (Wave 4)
```

## CERTIFICATION GATES
- G1 (after Phase 0): clean tree, no dead files, launcher scan green
- G2 (after Phase 4): horizontal-escalation tests pass (P0 GATE — WAVE 4 BLOCKED until this passes)
- G3 (after Phase 5/6): 0 mock/static pages in admin+portal
- G4 (after Phase 9): full test matrix + build + browser + security
- G5 (Phase 10): Wave 4 readiness certified

## STOP CONDITIONS
- Any scoping test fails → STOP (REC-01 not complete)
- Any page still mock in admin after Phase 5 → STOP
- Portal reaches scoped admin data → STOP
