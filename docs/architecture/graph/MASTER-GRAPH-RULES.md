# METERVERSE — MASTER GRAPH RULES (v1.0.0)

**P59-C/LR-2A · 2026-08-14 · Control foundation — every future change is checked against these rules.**

## 1. Purpose

The master connectivity graph is an **operational control system**, not documentation. Every future
implementation must answer: "Does this change respect the master connectivity, tenancy, permission,
workflow, resilience, failover, maintenance, dependency and data-flow rules?"

## 2. Node Rules

- Every node has: `id`, `type` (environment/tenancy/identity/domain/service/database/legacy), `owner`, `scope`, `criticality` (critical/high/medium/low).
- No orphan nodes: every node must have ≥1 edge or be declared a leaf with a documented reason.
- Stable IDs across graph versions (dot/node `id=`).

## 3. Edge Rules

- Every edge has: `rel`, `direction`, `auth`, `fail`.
- Only **FACT** edges represent existing architecture. PROPOSED edges are marked `style=dashed`/label `PROPOSED`.
- No forbidden cycles (e.g., tenancy must not contain a cycle Area→Project→Area).
- No edge may bypass tenancy scope.

## 4. Scope Rules (Tenancy)

- **Area is the canonical tenancy root.** Customer→Area, Meter→Area, Reading→Meter→Area, Invoice→Customer→Area, Payment→Customer/Invoice→Area.
- **Project is subordinate and NON-authorizing** (deferred). projectId must never expand area authorization.
- NULL or mismatched resource scope ⇒ **DENY** (fail-closed) — this is the P59-B invariant.
- Cross-area edges require explicit authorization; cross-project edges are denied by default.

## 5. Permission Rules

- Authorization is enforced in the **backend** (`security.js` requireAccess/scopeWhere/clampRequestedScope) — never trust UI alone.
- Global roles (super_admin/admin) bypass by design (system governance).
- Non-global roles require a valid area scope; empty scope ⇒ fail-closed (match nothing).
- Client-supplied `?areaId=`/`?projectId=` must be clamped to the user's scope.

## 6. Failure Rules

- Every critical edge has a failure mode and recovery path (retry/backoff, review queue, transaction rollback, gateway retry).
- No workflow without a failure path.
- No service without error handling + audit.

## 7. Failover Rules

- Only **ONE environment** has authoritative write ownership at any moment (split-brain protection).
- Profile 0 (normal) → detection → decision → fencing → Profile 1 activation → monitoring → recovery → reconciliation → return.
- Profile 2 (emergency) activates ONLY if MAIN + Profile 1 both down; read-only survival layer.
- Fencing: old primary must not write after failover.
- **Failover must never widen permissions** — user→role→area→project→permission→data scope preserved.

## 8. Maintenance Rules

- Maintenance classes: zero-downtime / degraded-mode / planned-failover / emergency / DB / backend / frontend / integration / migration.
- Every maintenance class: PRECHECK → EXECUTION → HEALTH CHECK → ROLLBACK → POSTCHECK.
- Maintenance must not unnecessarily stop the whole system (Profile 1 can serve while MAIN is maintained).

## 9. Validation Rules (graph validator)

- Orphan nodes ⇒ violation.
- Invalid edges (unknown node/type) ⇒ violation.
- Forbidden cycles (tenancy) ⇒ violation.
- Missing permission/area/project scope on scoped edge ⇒ violation.
- Workflow without failure path ⇒ violation.
- Failover without fencing/recovery ⇒ violation.
- Production write path without authorization ⇒ violation.
- Service without test coverage ⇒ warning.

## 10. Change-Control Rules

- Every major change: GRAPH IMPACT ANALYSIS → spec → plan → tasks → dependency check → implement → test → graph revalidation → converge → security validation → operational validation → commit → push → post-commit graph validation.
- NO code without graph impact check. NO task without dependency check. NO feature without test. NO permission without tenancy check. NO workflow without failure path. NO failover without fencing. NO maintenance without recovery. NO production change without git + validation + governance.

## 11. P59-B Hard Boundary

- The **639 frozen production records** must never be modified without explicit stakeholder approval.
- Automated tests must NEVER target `meter_pulse` (db-guard + live-guard).
- Legacy architecture must NEVER be imported directly into production — only adapted value.

## 12. Safety Margins (WHERE NOT DEFINED → REQUIRES BUSINESS DECISION)

| Metric | Value | Status |
|--------|-------|--------|
| RTO (Profile 1) | REQUIRES BUSINESS DECISION (recommended ≤ 15 min) | PENDING |
| RPO (Profile 1) | REQUIRES BUSINESS DECISION (recommended ≤ 15 min) | PENDING |
| Health-check interval | 30s (scheduler) | FACT |
| Failure detection threshold | REQUIRES BUSINESS DECISION (recommended 3 consecutive failures) | PENDING |
| Fencing mechanism | write-authority token | DESIGNED (not implemented) |
| Replication strategy | REQUIRES BUSINESS DECISION (streaming vs periodic) | PENDING |
| Max emergency operating time (Profile 2) | REQUIRES BUSINESS DECISION | PENDING |
