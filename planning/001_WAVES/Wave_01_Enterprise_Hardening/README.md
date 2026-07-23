# Wave 01 - Enterprise Hardening

**Status:** ACTIVE
**Target:** Phase 42 (a, b, c, d)
**Duration:** 4 sub-phases

## Objectives
1. Fix domain.js - unblock 18 domain entities
2. Add 20+ database indexes - prevent query degradation
3. Wire remaining 12 notification events
4. Add export for all entities
5. Create customer/meter/invoice detail pages
6. Add GATE_CHECK enforcement - prevent AI from skipping work
7. Split page-configs.ts - fix 1.79GB dev server memory
8. Establish unit test foundation - move from 0% coverage
9. Resolve Meter/ parallel codebase - 267K file decision

## Phases

| Phase | Focus | Status | Tasks |
|-------|-------|--------|-------|
| 42a | Indexes & Domain Fix | COMPLETE | T01 (indexes), T02 (domain.js) |
| 42b | Notifications & Export | COMPLETE | T03 (notifications), T04 (export) |
| 42c | Detail Pages | IN_PROGRESS | T05-T11 (detail pages), T12 (enhancements) |
| 42d | QA & Tooling | PLANNING | T03 (GATE_CHECK), T04 (page-configs), T05 (tests), T06 (Meter/) |
| 42.0 | Shared Auth & Permissions | PLANNING | T00 (Login Engine), T00 (Permissions) || 42f | Communication and Billing | PLANNING | T17 (Email), T18 (SMS), T19 (Billing), T20 (Validation) || 42e | Enterprise Controls | PLANNING | T13 (permissions), T14 (alerts), T15 (monitoring), T16 (KPIs) |

## Dependencies
- Phase 42.0 MUST execute before all other phases- Phase 42a must complete before 42b
- 42b and 42c can run in parallel
- 42d runs in parallel with 42a, 42b, 42c (non-blocking)
- T03 (GATE_CHECK) is independent - can start immediately

## Risk Summary
- Database indexes are non-breaking - safe to add anytime
- domain.js fix is critical path - blocks 18 entities
- Notifications and detail pages are independent
- GATE_CHECK is highest-priority: without it, no future work is verifiable
- Zero tests is highest-risk: no regression safety for any change
## Per-Step Audit Gate (MANDATORY)

Every step execution MUST:
1. Read its STEP_STATUS.yaml before starting (confirm PLANNING)
2. After implementation, verify evidence_required exists
3. Update status to COMPLETE only after evidence verified
4. Re-read STEP_STATUS.yaml to confirm the update persisted

This replaces the T99 end-of-phase-only audit with per-step verification.
T99 remains as a final consistency check.


## Execution Order (MANDATORY)

Phase 42d T03 (GATE_CHECK) MUST be the first task executed in Wave 01.
All subsequent work depends on GATE_CHECK for verification.
Phase 42e cannot start until GATE_CHECK is complete.

## Graphiti Sync — Mandatory Per-Task Step

Every task MUST include a "Sync Graphiti" step (either as its own step or as a substep of T99):
1. Before marking a task COMPLETE, update graphiti/index.json with new/modified nodes
2. Add edges connecting new nodes to existing architecture
3. Verify graph accuracy: query graphiti to confirm all new components are represented
4. If graph reveals missing components (planned but not built), return to implementation

The T99-S02 audit step will verify graphiti consistency as the final gate.


