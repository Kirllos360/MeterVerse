# RP3 — Dependency Matrix

**Date:** 2026-06-17
**Source:** RP1 mapping + tasks.md existing dependencies
**Mode:** Enterprise Planning — No Implementation

---

## Complete Task Dependency Graph

### Key

```
TASK [Priority]
├── depends on: [prerequisites]
└── blocked by: [dependents]
```

---

### Wave 1 — P0 Critical (Foundation First)

#### T200 — Create SYSTEM_DNA.md (P0)
```
No dependencies — governance document
Blocks: All subsequent architecture decisions
```

#### T088 — Area DB Template (P0)
```
Depends on: T087 (Features DB schema)
Blocks: G002 (Solar), G003 (Chilled Water), G004 (Settlement), G023 (15 Area DBs), G031 (Migration)
Risk: 45 tables per area × 15 areas = 675 tables total
```

#### T087 — Features DB Schema (P0)
```
Depends on: T086 (Core DB schema)
Blocks: T088
Note: Already planned in tasks.md but 0% complete
```

#### T086 — Core DB Schema (P0)
```
Depends on: None
Blocks: T087, T089, T090
Note: 15 tables foundation — prerequisites everything
```

#### T023 — Single Schema → Multi-Schema Migration (part of G023)
```
Depends on: T086, T087, T088
Blocks: G031 (Data Migration)
Risk: Data migration from single sim_system to 15 area schemas
```

#### T201 — PDF Generation Engine (P0)
```
Depends on: T202 (Template Engine), T068 (Invoice Frontend)
Blocks: G005 (PDF), G024 (QR), G025 (Hash)
Risk: Choosing wrong PDF tech stack (Puppeteer vs PDFKit vs WeasyPrint port)
```

#### T202 — Template Engine V3 (P0)
```
Depends on: None (can develop in parallel)
Blocks: T201, T102 (Reports)
Risk: Port from Flask Jinja2 to NestJS equivalent
```

#### T209 — SSL/HTTPS (P0)
```
Depends on: T211 (Production Environment)
Blocks: None (deployment parallel)
Risk: Certificate provisioning
```

#### T211 — Production Environment (P0)
```
Depends on: G009/CI-CD (parallel track)
Blocks: T209, deployment of all features
Risk: Server provisioning lead time
```

#### T091 — Symbiot Bridge (P0)
```
Depends on: T086 (Core DB)
Blocks: G030, automatic reading collection
Risk: Windows service packaging, TCP channel reliability
```

#### T107-T110 — Data Migration Scripts (P0)
```
Depends on: T088 (Area DB), T086 (Core DB)
Blocks: G031, production cutover
Risk: Data volume, schema mismatch
```

---

### Wave 2 — P1 Critical (Billing + Quality)

#### T203 — Bill Cycle Governance (P1)
```
Depends on: T009 (RBAC), T010 (Audit)
Blocks: G007, T206 (duplicate prevention), T208 (safe regeneration)
Risk: Financial accuracy
```

#### T204 — Fix Customer/Unit Resolution (P1)
```
Depends on: T032 (Meter Assignment Logic)
Blocks: G012
Risk: Need to correctly resolve active assignment at billing period date
```

#### T206 — DB Unique Constraint (P1)
```
Depends on: None (schema change)
Blocks: T208
Risk: Existing duplicate data must be resolved before applying constraint
```

#### T208 — Safe Invoice Regeneration (P1)
```
Depends on: T203 (Bill Cycle), T206 (Unique Constraint)
Blocks: G018
Risk: Changing core billing logic
```

#### T083 — Contract Reconciliation (P1)
```
Depends on: T012 (Contract Harness)
Blocks: G008
Risk: YAML drift — reconciliation may find mismatches requiring code changes
```

#### T212 — QR Code Generation (P1)
```
Depends on: T201 (PDF Engine)
Blocks: G024
Note: Requires PDF output before QR embedding makes sense
```

#### T213 — Invoice Hash (P1)
```
Depends on: T201 (PDF Engine), T063 (Invoice Issue)
Blocks: G025
Risk: Hash computation must be deterministic and verifiable
```

#### T210 — Monitoring/Alerting (P1)
```
Depends on: T211 (Production Env), T081 (Frontend Observability)
Blocks: G020
Risk: False positives in alert rules
```

#### T216 — Scheduled Backup (P1)
```
Depends on: T084a (DR Drill)
Blocks: G032
Note: Must not interfere with production operations
```

#### T112 — Security Audit (P1)
```
Depends on: None
Blocks: G010 — Production security certification
Risk: Findings may require code changes mid-sprint
```

#### T113 — Load Test (P1)
```
Depends on: T062 (Invoice Gen), T065 (Payment Recording)
Blocks: G011 — Performance certification
Risk: Results may require architecture changes
```

#### T080 — E2E Coverage Expansion (P1)
```
Depends on: T079 (Frontend Tests)
Blocks: G028 — UAT certification
Risk: Test flakiness
```

---

### Wave 3 — P2 Standard (Polish + UX)

#### T207 — Cancel Invoice Endpoint (P2)
```
Depends on: T063 (Invoice Issue), T010 (Audit)
Blocks: G017
```

#### T214 — Invoice Due Date (P2)
```
Depends on: T062 (Invoice Gen), T061 (Project Config)
Blocks: G026
```

#### T205 — Meter Detail API Wiring (P2)
```
Depends on: T047 (Readings API), T038 (Meters API)
Blocks: G015
```

#### T215 — RTL/Responsive Tests (P2)
```
Depends on: T080 (Playwright Specs)
Blocks: G029
```

#### T089 — 16-Profile RBAC (P2)
```
Depends on: T086 (Core DB)
Blocks: G022
Note: Required before production — 9 additional roles
```

#### T102 — 32 Reports (P2)
```
Depends on: T073 (Report Jobs), T202 (Template Engine)
Blocks: Reporting workflow
Risk: Porting 32 reports from Jasper
```

---

### Wave 4 — P3 Polish

#### G027 — Smoke Script PATH Fix (P3)
```
Depends on: None
Blocks: Only environment-specific test execution
```

---

## Dependency Graph (Textual)

```
Level 0 (No dependencies):
  T200 [SYSTEM_DNA], T086 [Core DB], T202 [Template Engine], T112 [Security Audit], G027 [Smoke PATH]

Level 1 (depends on Level 0):
  T087 [Features DB] ← T086
  T201 [PDF Engine] ← T202

Level 2 (depends on Level 1):
  T088 [Area DB] ← T087
  T203 [Bill Cycle] ← T009, T010 (Level 0)
  T204 [Customer Resolve] ← T032 (Level 0)
  T206 [Unique Constraint] ← Level 0
  T212 [QR] ← T201
  T213 [Hash] ← T201, T063
  T211 [Production Env] ← Level 0
  T210 [Monitoring] ← T211, T081

Level 3 (depends on Level 2):
  T107-T110 [Migration] ← T088, T086
  T208 [Safe Regen] ← T203, T206
  T024 [Single→Multi Schema] ← T086, T087, T088
  T209 [SSL] ← T211
  T091 [Symbiot] ← T086

Level 4 (depends on Level 3):
  T207 [Cancel Invoice] ← T063, T010 (Level 0)
  T214 [Due Date] ← T062, T061
  T205 [Meter Detail] ← T047, T038
  T215 [RTL Tests] ← T080

Level 5 (depends on Level 4):
  T089 [16 Roles] ← T086
  T102 [Reports] ← T073, T202
  T083 [Contract Recon] ← T012

Level 6 (leaf nodes):
  T113 [Load Test] ← T062, T065
  T080 [E2E Coverage] ← T079
  T216 [Backup Auto] ← T084a
```

## Critical Path

The longest dependency chain determines minimum project duration:

```
T086 (Core DB) → T087 (Features DB) → T088 (Area DB) → T107-T110 (Migration)
                                                      → G023 (Multi-schema)
```

**Estimated critical path: T086 + T087 + T088 + T107 = ~10 weeks**

Secondary critical path:
```
T202 (Template) → T201 (PDF Engine) → T212 (QR) + T213 (Hash) = ~4 weeks
```

## Parallel Tracks

The following tracks can execute in parallel:

| Track | Tasks | Duration |
|-------|-------|----------|
| A — Database Foundation | T086 → T087 → T088 → T107-T110 | 10 weeks |
| B — Document Output | T202 → T201 → T212 + T213 | 4 weeks |
| C — Billing Core | T203 → T204 → T206 → T208 | 2 weeks |
| D — Billing Polish | T207 → T214 → T205 | 1 week |
| E — Quality | T080 → T215, T083, T112, T113 | 2 weeks |
| F — DevOps | T211 → T209 + T210 + T216 | 2 weeks |
| G — Governance | T200 (1 week, start day 1) | 1 week |

## Risk Areas

| Risk | Tasks Affected | Mitigation |
|------|---------------|------------|
| Database migration conflicts | T086, T087, T088, T107-T110 | Strict migration ordering, rollback scripts per step |
| PDF tech stack choice | T201, T202 | Spike both Puppeteer and PDFKit in first sprint |
| Contract drift from YAML | T083 | Lock YAML as source of truth before reconciliation |
| Existing duplicate invoice data | T206 | Audit existing data before applying constraint |
| Symbiot Windows packaging | T091 | Use Docker for bridge process, not Windows service |
