# MeterVerse — Master Knowledge Checklist

**Last Updated:** 2026-07-23  
**Wave 01:** 8 phases, 37 tasks, 185 steps  
**Complete:** 15/185 steps (8.1%)  
**Purpose:** Single source of truth for planning progress. Read this first in any new session.  
**How to use:** Check boxes as steps are completed. This file is authoritative — always update after any change.

---

## Wave 01 — Enterprise Hardening (8 Phases, 37 Tasks, 185 Steps)

```
Execution Flow:
42.0 (Shared Auth) → 42d T03 (GATE_CHECK) → 42.0 (Permissions) → 42a → 
42c → 42b → 42d → 42e → 42f → T99 Audit on each → WAVE COMPLETE
```

---

### Phase 42.0 — Shared Auth & Permission Enforcement `[PLANNING]` ← MUST BE FIRST

**Status:** 0/17 steps complete  
**Dependency:** None (foundation phase)

```
┌─────────────────────────────────────────────────┐
│ 42.0 Flow:                                      │
│ T00 Login: Design → Build Core → Scoped Tokens  │
│           → UI Redirects → Theming               │
│ T00 Permissions: Map → Replace Gates →          │
│                 → Middleware → Seed Keys         │
│ T99: 7-step Audit + Verification Loop           │
└─────────────────────────────────────────────────┘
```

- [ ] **T00: Shared Login Engine** `[PLANNING]` ← START HERE
  - [x] S01: Design login protocol with system_type param
  - [x] S02: Build shared core auth logic
  - [x] S03: Add admin-scoped + user-scoped JWT tokens
  - [x] S04: Wire different UI redirects per system type
  - [x] S05: Add login appearance theming per system
- [x] **T00: Enforce Permissions** `[PLANNING]`
  - [x] S01: Map all endpoints to permission keys
  - [x] S02: Replace requireRole() with requirePermission()
  - [x] S03: Add permission check middleware
  - [x] S04: Seed full 57 permission keys
- [ ] **T99: Phase Completion Audit** `[PLANNING]`

---

### Phase 42a — Indexes & Domain Fix `[IN_PROGRESS]`

**Status:** 2/8 steps complete  
**Dependency:** None (foundation phase)

```
┌─────────────────────────────────────────────────┐
│ 42a Flow:                                       │
│ T01: Audit → Create → EXPLAIN ANALYZE           │
│ T02: Diagnose → Fix → Includes → 404 → SoftDel  │
│ T99: 7-step Audit                               │
└─────────────────────────────────────────────────┘
```

- [ ] **T01: Add Database Indexes** `[IN_PROGRESS]`
  - [x] S01: Audit current indexes ✓
  - [x] S02: Create migration with indexes ✓
  - [ ] S03: Verify with EXPLAIN ANALYZE (seed 1000+ records first)
- [ ] **T02: Fix Domain JS** `[IN_PROGRESS]`
  - [x] S01: Diagnose root cause ✓
  - [x] S02: Implement fix ✓
  - [ ] S03: Add include/relations support
  - [ ] S04: Add 404 handling
  - [ ] S05: Add soft delete support
- [ ] **T99: Phase Completion Audit** `[PLANNING]`

---

### Phase 42b — Notifications & Export `[IN_PROGRESS]`

**Status:** 6/13 steps complete  
**Dependency:** Phase 42a

```
┌─────────────────────────────────────────────────┐
│ 42b Flow:                                       │
│ T03: Audit → Engine → Templates → Wire → API    │
│ T04: Export endpoints (4 entities)              │
│ T99: 7-step Audit                               │
└─────────────────────────────────────────────────┘
```

- [ ] **T03: Wire Notifications** `[COMPLETE]`
  - [x] S01: Audit events (23 found, 0 wired) ✓
  - [x] S02: Build notification engine ✓
  - [x] S03: Create templates (20 seeded) ✓
  - [x] S04: Wire events (via auditLog hook) ✓
  - [x] S05: Create API route (8 endpoints) ✓
- [ ] **T04: Add Export** `[COMPLETE]`
  - [x] S01: Add exports (meters, invoices, readings, payments) ✓
- [ ] **T99: Phase Completion Audit** `[PLANNING]`

---

### Phase 42c — Detail Pages `[IN_PROGRESS]`

**Status:** 7/13 steps complete  
**Dependency:** Phase 42a

```
┌─────────────────────────────────────────────────┐
│ 42c Flow:                                       │
│ T05-T11: 7 detail pages (build)                 │
│ T12: Breadcrumbs → Edit/Delete → ErrorBoundary  │
│      → Backend Includes → List Wiring           │
│ T99: 7-step Audit                               │
└─────────────────────────────────────────────────┘
```

- [ ] **T05: Customer Detail** `[COMPLETE]`
  - [x] S01: Create page ✓
- [ ] **T06: Meter Detail** `[COMPLETE]`
  - [x] S01: Create page ✓
- [ ] **T07: Invoice Detail** `[COMPLETE]`
  - [x] S01: Create page ✓
- [ ] **T08: Reading Detail** `[COMPLETE]`
  - [x] S01: Create page ✓
- [ ] **T09: Payment Detail** `[COMPLETE]`
  - [x] S01: Create page ✓
- [ ] **T10: Contract Detail** `[COMPLETE]`
  - [x] S01: Create page ✓
- [ ] **T11: MeterAssignment Detail** `[COMPLETE]`
  - [x] S01: Create page ✓
- [ ] **T12: Detail Page Enhancements** `[PLANNING]`
  - [ ] S01: Add breadcrumbs
  - [ ] S02: Add edit/delete actions
  - [ ] S03: Add ErrorBoundary wrapper
  - [ ] S04: Add backend includes
  - [ ] S05: Wire list rows to detail pages
- [ ] **T99: Phase Completion Audit** `[PLANNING]`

---

### Phase 42d — QA and Tooling `[PLANNING]`

**Status:** 0/25 steps complete  
**Dependency:** Independent

```
┌─────────────────────────────────────────────────┐
│ 42d Flow:                                       │
│ T03: GATE_CHECK (MUST BE FIRST!)                │
│ T04: page-configs split                         │
│ T05: Test foundation (Vitest)                   │
│ T06: Meter/ codebase decision                   │
│ T07: Integration & E2E tests                    │
│ T08: Populate Graphiti                          │
│ T99: 7-step Audit                               │
└─────────────────────────────────────────────────┘
```

- [ ] **T03: GATE_CHECK Enforcement** `[PLANNING]` ← FIRST TASK IN WAVE 01
  - [x] S01: Design gate protocol
  - [x] S02: Implement GATE_CHECK script
  - [x] S03: Add pre-commit hook
  - [x] S04: Add CI validation
- [ ] **T04: Fix page-configs.ts** `[PLANNING]`
  - [ ] S01: Analyze current config structure
  - [ ] S02: Split into domain files
  - [ ] S03: Update imports and test
- [ ] **T05: Test Foundation** `[PLANNING]`
  - [ ] S01: Setup Vitest config
  - [ ] S02: Write core service tests
  - [ ] S03: Write first admin page test
- [ ] **T06: Meter/ Codebase Decision** `[PLANNING]`
  - [ ] S01: Analyze content (267K files)
  - [ ] S02: Create Architecture Decision Record (ADR-004)
  - [ ] S03: Create archive/merge plan
  - [ ] S04: Execute archive or merge
- [ ] **T07: Integration & E2E Tests** `[PLANNING]`
  - [ ] S01: Write backend integration tests
  - [ ] S02: Write Playwright E2E tests
- [ ] **T08: Populate Graphiti** `[PLANNING]`
  - [ ] S01: Map all 78 Prisma models as nodes
  - [ ] S02: Map all 16 route files as API nodes
  - [ ] S03: Map all 53 admin pages as UI nodes
  - [ ] S04: Generate graph visualization
- [ ] **T99: Phase Completion Audit** `[PLANNING]`

---

### Phase 42e — Enterprise Controls `[PLANNING]`

**Status:** 0/17 steps complete  
**Dependency:** Phase 42a, Phase 42d T03 (GATE_CHECK)

```
┌─────────────────────────────────────────────────┐
│ 42e Flow:                                       │
│ T13: Permissions (map → replace → frontend →    │
│       seed)                                      │
│ T14: Monitoring (tracking → filters → dash)      │
│ T15: Alerts (catalog → service → wiring → API)  │
│ T16: KPIs (targets → seed → snapshot → dash)    │
│ T99: 7-step Audit                               │
└─────────────────────────────────────────────────┘
```

- [ ] **T13: Granular Permissions** `[PLANNING]`
  - [ ] S01: Map permission keys to all 140+ endpoints
  - [x] S02: Replace requireRole with requirePermission
  - [ ] S03: Add frontend permission checks
  - [ ] S04: Seed full permission set
- [ ] **T14: Traffic Monitoring** `[PLANNING]`
  - [ ] S01: Add request tracking middleware
  - [ ] S02: Add area/project filters
  - [ ] S03: Build monitoring dashboard
- [ ] **T15: Alert/Error Engine** `[PLANNING]`
  - [ ] S01: Design error hint catalog
  - [ ] S02: Implement AlertEngine service
  - [ ] S03: Wire into API error handlers
  - [ ] S04: Add alert API + admin page
- [ ] **T16: KPI Framework** `[PLANNING]`
  - [ ] S01: Define KPI targets
  - [ ] S02: Seed KpiDefinition records
  - [ ] S03: Build KPI snapshot service
  - [ ] S04: Add KPI dashboard page
- [ ] **T99: Phase Completion Audit** `[PLANNING]`

---

### Phase 42f — Communication and Billing `[PLANNING]`

**Status:** 0/17 steps complete  
**Dependency:** Phase 42b, Phase 42a

```
┌─────────────────────────────────────────────────┐
│ 42f Flow:                                       │
│ T17: Email (Nodemailer → Wire EmailLog → Queue) │
│ T18: SMS (Adapter → Wire SmsLog)                 │
│ T19: Billing (ChargeRules → BillRun → Invoice  │
│       → Tax/Discount)                           │
│ T20: Validation (Rules → API)                   │
│ T99: 7-step Audit                               │
└─────────────────────────────────────────────────┘
```

- [ ] **T17: Email Engine** `[PLANNING]`
  - [ ] S01: Install Nodemailer + configure SMTP
  - [ ] S02: Wire EmailLog to actual sending
  - [ ] S03: Add email queue for retry
- [ ] **T18: SMS Engine** `[PLANNING]`
  - [ ] S01: Add SMS provider adapter
  - [ ] S02: Wire SmsLog to actual sending
- [ ] **T19: Billing Engine** `[PLANNING]`
  - [ ] S01: Implement ChargeRule evaluation
  - [ ] S02: Implement BillRun generation
  - [ ] S03: Wire invoice generation from readings
  - [ ] S04: Add invoice tax/discount calculation
- [ ] **T20: Validation Engine** `[PLANNING]`
  - [ ] S01: Wire ValidationRule into reading creation
  - [ ] S02: Add validation results API
- [ ] **T99: Phase Completion Audit** `[PLANNING]`

---

## Wave 02 — Not Yet Defined

(Reserved for future phases: Performance, Security Audit, Multi-tenancy, API Docs, i18n, ETL/Migration)

---

## Global Rules (Always Active)

| Rule | Description | Location |
|------|-------------|----------|
| Rule 1 | Complete → Verify → Report → Confirm | AI_BIBLE.md |
| Rule 2 | Last Task First + Hint | AI_BIBLE.md |
| Rule 3 | NEVER Kill Services — Always Restart After Edits | AI_BIBLE.md |
| Rule 4 | Enterprise Engineering Protocol | AI_BIBLE.md |
| Rule 5 | Enterprise QA Pipeline (13-section post-implementation) | AI_BIBLE.md |
| Rule 6 | Verify STATUS.yaml after every update | AI_BIBLE.md, AGENTS.md |
| Rule 7 | Mandatory Tool Selection (🧰 block before every task) | AI_BIBLE.md, AGENTS.md |
| Rule 8 | Tool Usage Audit Trail | AI_BIBLE.md |

## Graphiti Knowledge Graph

**Status:** ✅ Populated — `graphiti/index.json`
**Nodes:** 118 (20 models, 17 routes, 72 pages, 4 middleware, 3 ADRs, 2 services)
**Edges:** 103 (model→route, route→page, route→middleware connections)
**Compare:** Run `node scripts/populate-graphiti.mjs` to regenerate from current codebase

## Tools Available

| Tool | Configured | For |
|------|-----------|-----|
| sequential-thinking MCP | ✅ opencode.json | Complex audit reasoning |
| git MCP | ✅ opencode.json | Diff/status verification |
| filesystem MCP | ✅ opencode.json | Codebase analysis |
| postgres MCP | ✅ opencode.json | Direct DB auditing |
| playwright MCP | ✅ opencode.json | UI screenshots |
| vitest | ✅ backend/node_modules | Unit tests |
| prisma | ✅ backend/node_modules | Schema/migrations |

---

*This file is the single source of truth. Update after every step completion.*







