# METERVERSE — MASTER CONNECTIVITY & OPERATING GRAPH

**Version:** 1.0.0 · **Gate:** P59-C/LR-2A · **Date:** 2026-08-14
**Purpose:** Operational control system for all future MeterVerse implementation.

## Graphs

| # | Graph | File (.dot/.svg) | Coverage |
|---|-------|------------------|----------|
| 1 | Master Enterprise Connectivity | MASTER-ENTERPRISE-CONNECTIVITY | All layers linked |
| 2 | Tenancy / Area / Project | TENANCY-AREA-PROJECT | Area root, project deferred, P59-B backlog |
| 3 | RBAC / Permission | RBAC-PERMISSION | Roles, JWT, backend enforcement, P58 test case |
| 4 | Business Data Flow | BUSINESS-DATAFLOW | Meter→Reading→Consumption→Tariff→Charges→Settlement→Invoice→Payment→Ledger→Report |
| 5 | Workflow Engine | WORKFLOW-ENGINE | Existing primitives + normalized process/failure spine |
| 6 | Normal / Failover Operating | NORMAL-FAILOVER-OPERATING | Profile 0/1/2, split-brain protection |
| 7 | Maintenance Operating | MAINTENANCE-OPERATING | Maintenance classes + cycle |
| 8 | Security Attack Path | SECURITY-ATTACK-PATH | 5 attack paths + controls + status |
| 9 | Legacy → MeterVerse Reuse | LEGACY-REUSE | LR-1/LR-2 recovered components + adaptation boundary |
| 10 | Implementation Dependency | IMPLEMENTATION-DEPENDENCY | Shortest dependency-safe order |
| 11 | Test Coverage | TEST-COVERAGE | Evidence-based coverage + gaps |
| 12 | Disaster Recovery | DISASTER-RECOVERY | Backup/restore + profiles |

## Control Artifacts

- `MASTER-GRAPH-RULES.md` — node/edge/scope/permission/failure/failover/maintenance/validation/change-control rules.
- `validate-graph.mjs` — graph validator: DOT parse, reference resolution, orphan detection, forbidden cycles, required attrs. **Run: `node validate-graph.mjs`** (currently 7 pass, 0 fail, 0 warn).
- `MASTER-ENTERPRISE-CONNECTIVITY.json` — machine-readable node/edge index.

## Integration with Existing Infrastructure

- **graphiti/** (`index.json`) — knowledge graph v2.0.0 (118 nodes, 103 edges); the master graph references but does not replace it.
- **speckit/** — Spec Kit v1.0.0 validator (`node speckit/validator.mjs`); the master roadmap lives in `.specify/` (P59-C/LR-2A).
- **graphify-out/** — AST/semantic hash manifest (old `Meter-` backend).
- **memory knowledge-graph** (codebase-memory) — project/phase/architecture entities.

## Usage

1. Before any major change: run `node validate-graph.mjs`.
2. Check the change against MASTER-GRAPH-RULES (tenancy, permission, failure, failover, maintenance).
3. Cross-check with graphiti + speckit.
4. Implement, test, then re-run the validator (GRAPH REVALIDATION in the change-control loop).

## Regenerate SVGs

```
dot -Tsvg MASTER-ENTERPRISE-CONNECTIVITY.dot -o MASTER-ENTERPRISE-CONNECTIVITY.svg
```
