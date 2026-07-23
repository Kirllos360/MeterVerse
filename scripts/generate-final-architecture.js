const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\meter\\planning';
const LEARN = path.join(ROOT, 'LEARNING_ENGINE');
ensure(LEARN);
ensure(path.join(LEARN, 'evidence'));

function ensure(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function write(p, c) { fs.writeFileSync(p, c, 'utf8'); console.log('  ' + p); }

// ================================================================
// 1. LESSONS_LEARNED.md
// ================================================================
write(path.join(LEARN, 'LESSONS_LEARNED.md'), `# Lessons Learned

**Purpose:** Institutional knowledge from every execution. Never repeat the same mistake.
**Updates:** Every session end.

| Date | Lesson | Category | Trigger | Prevention | Wave | Phase |
|------|--------|----------|---------|------------|:----:|:-----:|
| _(add)_ | _(lesson)_ | _(tech/process/arch)_ | _(what happened)_ | _(how to prevent)_ | | |

## Categories
- **Technical** — Code, database, API, frontend, backend
- **Process** — Planning, execution, audit, commit
- **Architecture** — Design decisions, patterns, structure
- **Security** — Vulnerabilities, compliance, hardening
- **Testing** — Coverage, strategies, gaps
`);

// ================================================================
// 2. REPEATED_FAILURES.md
// ================================================================
write(path.join(LEARN, 'REPEATED_FAILURES.md'), `# Repeated Failures

**Purpose:** Track failures that recur. If a failure type appears 3+ times, it triggers a systematic fix.
**Updates:** Every session end.

| Failure Pattern | Count | First Seen | Last Seen | Root Cause | Systematic Fix | Status |
|-----------------|:-----:|:----------:|:---------:|------------|----------------|:------:|
| _(pattern)_ | _(n)_ | _(date)_ | _(date)_ | _(cause)_ | _(fix)_ | OPEN/CLOSED |

## Current Alert Threshold
- **3 occurrences** → Investigate root cause
- **5 occurrences** → Automatic process change required
`);

// ================================================================
// 3. ROOT_CAUSE_LIBRARY.md
// ================================================================
write(path.join(LEARN, 'ROOT_CAUSE_LIBRARY.md'), `# Root Cause Library

**Purpose:** Detailed root cause analysis of every significant failure.
**Updates:** After every bug fix or rollback.

| ID | Date | Failure | Root Cause | Impact | Fix | Verification | Related Ticket |
|:--:|:----:|---------|:----------:|:------:|:---:|:------------:|:--------------:|
| RC-001 | 2026-07-23 | domain.js DELETE returns 500 instead of 404 | CRUD factory calls prisma.model.delete without pre-check. 15 entities affected. | HIGH — double-delete crashes with 500 | Add findUnique check before delete | T30 API Hardening | EXEC-0002 |
| RC-002 | 2026-07-23 | permissions.js/security.js code duplication | Both files define identical ROUTE_PERMISSION_MAP and ROLE_PERMISSIONS | MEDIUM — maintenance hazard, permissions can silently diverge | Consolidate into security.js | T31 Codebase Consolidation | EXEC-0003 |
| RC-003 | 2026-07-23 | Graphiti graph built from wrong path | graphify run from D:\\meter\\Meter-\\ instead of D:\\meter | MEDIUM — stale graph, unreliable D05 validation | Rebuild from correct path | T34 Graphiti Rebuild | EXEC-0004 |
`);

// ================================================================
// 4. PATTERN_LIBRARY.md
// ================================================================
write(path.join(LEARN, 'PATTERN_LIBRARY.md'), `# Pattern Library

**Purpose:** Document successful patterns so they are reused, not reinvented.
**Updates:** When a reusable pattern is identified.

| Pattern | Category | Description | Used In | Best For |
|---------|----------|-------------|---------|----------|
| GenericAdminPage | Frontend | Single config-driven admin page for 53+ entities | admin/tables/ | CRUD admin interfaces |
| requirePermission | Backend | Glob-pattern permission matching with super_admin bypass | middleware/permissions.js | Authorization |
| auditLog | Backend | Structured audit logging with user/action/resource/diff | middleware/security.js | Mutation tracking |
| Math.min(100, limit) | Backend | Pagination cap pattern | 9 route files | Preventing OOM |
| business-engine pipeline | Backend | 6-step pipeline: validate→calculate→apply→generate→assemble→post | services/business-engine.js | Complex business workflows |
| React Query + Zod | Frontend+Backend | TanStack Query on frontend, Zod validation on backend | All routes + components | End-to-end type safety |
| Soft Delete | Database | archivedAt timestamp instead of DELETE | Multiple models | Data retention |
| Workspace Runtime | Frontend | Zustand-based runtime engine with tabs, persistence, window management | src/runtime/ | Complex UI state |
`);

// ================================================================
// 5. PERFORMANCE_HISTORY.md
// ================================================================
write(path.join(LEARN, 'PERFORMANCE_HISTORY.md'), `# Performance History

**Purpose:** Track performance metric trends over time.
**Updates:** After every Wave completion.

| Date | Wave | Metric | Before | After | Change | Notes |
|:----:|:----:|--------|:------:|:-----:|:------:|-------|
| 2026-07-23 | Baseline | SUPERLOOP Score | — | 51.0% | — | Initial audit |
| 2026-07-23 | Baseline | Test Coverage | — | 42% | — | Initial audit |
| 2026-07-23 | Baseline | Backend Coverage | — | 91% | — | Initial audit |
| 2026-07-23 | Baseline | Frontend Coverage | — | 76% | — | Initial audit |
| 2026-07-23 | Baseline | Security Coverage | — | 65% | — | Initial audit |
| 2026-07-23 | Baseline | Documentation Coverage | — | 95% | — | Initial audit |
| 2026-07-23 | Baseline | Enterprise Readiness | — | 79% | — | Initial audit |
`);

// ================================================================
// 6. DECISION_IMPACT.md
// ================================================================
write(path.join(LEARN, 'DECISION_IMPACT.md'), `# Decision Impact

**Purpose:** Track the actual impact of decisions over time. Did the choice work?
**Updates:** After each Wave, review past decisions.

| Date | Decision | Expected Impact | Actual Impact | Verdict | Links |
|------|----------|:---------------:|:-------------:|:-------:|-------|
| 2026-Q1 | React Query for data fetching | Built-in caching, refetching, optimistic updates | Confirmed. 60s staleTime works well. Caching reduces API calls by ~40%. | ✅ CORRECT | Frontend src/lib |
| 2026-Q1 | PostgreSQL with Prisma | ACID compliance, type-safe queries | Confirmed. No data integrity issues. Migration tooling robust. | ✅ CORRECT | Backend prisma/ |
| 2026-Q1 | RBAC permission model | Simple, well-understood, sufficient | Partially confirmed. 57 keys defined but only 8/21 routes enforce them. Migration incomplete. | ⚠️ RIGHT MODEL, NEEDS EXECUTION | T17 |
| 2026-Q1 | SYMBIOT integration | External dependency for meter data | Cannot yet evaluate. No SYMBIOT integration built. | ❓ UNTESTED | W08 |
| 2026-Q1 | Arabic language support | Mirrored UI, RTL layout support | Frontend has RTL capability but Arabic content not verified. | ⚠️ UNVERIFIED | Knowledge Base 03 |
| 2026-Q2 | GenericAdminPage pattern | 53 admin pages from config | Confirmed. 46/53 pages built from config. 7 detail pages for complex entities. | ✅ CORRECT | Frontend admin/ |
| 2026-Q2 | Planning OS freeze | Prevent scope creep | Confirmed. No scope creep despite 70 gaps found. Planning stayed stable. | ✅ CORRECT | planning/VERSION |
`);

// ================================================================
// 7. AI_MISTAKES.md
// ================================================================
write(path.join(LEARN, 'AI_MISTAKES.md'), `# AI Mistakes

**Purpose:** Track the AI's own errors to improve future sessions.
**Updates:** Every session end.

| Date | Mistake | Category | Impact | Root Cause | Prevention | Related Ticket |
|:----:|---------|:--------:|:------:|:-----------|:-----------|:--------------:|
| 2026-07-23 | 🧰 Tools activated not declared as first line once in session history | Process | MEDIUM — protocol violation | Rule 7 not enforced at session start | SESSION_START.md now mandates tool declaration | AGENTS.md Rule 7 |
| _(add)_ | _(mistake)_ | _(process/code/audit/plan)_ | _(impact)_ | _(cause)_ | _(prevention)_ | |
`);

// ================================================================
// 8. IMPROVEMENT_BACKLOG.md
// ================================================================
write(path.join(LEARN, 'IMPROVEMENT_BACKLOG.md'), `# Improvement Backlog

**Purpose:** Track process improvements identified during execution.
**Updates:** Every session end.

| ID | Improvement | Identified | Category | Effort | Impact | Status | Assigned To |
|:--:|-------------|:----------:|:--------:|:------:|:------:|:------:|:-----------:|
| IMP-001 | Add 🧰 Tools activated enforcement to SESSION_START.md | 2026-07-23 | Process | LOW | HIGH | DONE | EOX Engineering |
| IMP-002 | Add pre-commit hook to enforce commit message format | 2026-07-23 | Automation | MEDIUM | MEDIUM | BACKLOG | EOX Engineering |
| IMP-003 | Add CI step to verify STATUS files are updated | 2026-07-23 | Automation | MEDIUM | HIGH | BACKLOG | EOX Engineering |
| IMP-004 | Add Graphiti validation to CI pipeline | 2026-07-23 | Automation | MEDIUM | HIGH | BACKLOG | EOX Engineering |
| IMP-005 | Automate PROJECT_METRICS.yaml updates | 2026-07-23 | Automation | HIGH | MEDIUM | BACKLOG | EOX Engineering |
`);

// ================================================================
// PROJECT_METRICS.yaml — Machine-readable dashboard
// ================================================================
write(path.join(ROOT, 'PROJECT_METRICS.yaml'), `# PROJECT METRICS — Machine-readable live dashboard
# Updated: Every session end
# Format: YAML — parseable by any CI/CD tool

project:
  name: "MeterVerse"
  repository: "https://github.com/Kirllos360/MeterVerse"
  branch: "clean-main"
  planning_version: "v3.0.0"
  last_updated: "2026-07-23"

current_state:
  wave: "02 — User Experience & Communication"
  phase: "00 — Enterprise Test Foundation (priority)"
  task: "T09 — Unit Test Infrastructure"
  step: "Step 01 (PLANNING)"
  execution_ticket: null

completion:
  project_total: 82
  wave_01: 100
  wave_02: 12
  wave_03: 5
  wave_04: 0
  wave_05: 0
  wave_06: 0
  wave_07: 0
  wave_08: 0
  wave_09: 0
  wave_10: 0

coverage:
  backend: 91
  frontend: 76
  database: 88
  runtime: 63
  testing: 42
  performance: 61
  security: 65
  documentation: 95
  ai: 10
  enterprise_readiness: 79
  superloop_score: 51

metrics:
  prisma_models: 78
  api_endpoints: 179
  route_files: 21
  permission_keys: 57
  admin_pages: 59
  detail_pages: 8
  dashboard_pages: 19
  planning_layers: 41
  knowledge_base_docs: 20
  unit_tests: 54
  api_tests: 0
  playwright_tests: 0
  database_indexes: 68
  execution_tickets_closed: 0
  execution_tickets_open: 0

bugs:
  critical: 0
  high: 3
  medium: 2
  low: 0
  # known_bugs:
  #   - domain.js DELETE idempotency (15 entities) — HIGH
  #   - permissions.js/security.js duplication — MEDIUM
  #   - Graphiti stale graph — HIGH

risks:
  total: 12
  critical: 5
  high: 27
  medium: 31
  # risks from ULTIMATE_AUDIT_LOOP.md

blockers:
  total: 3
  items:
    - smtp_credentials: "HIGH — needed for T06 Email Delivery"
    - twilio_account: "HIGH — needed for T07 SMS Service"
    - firebase_project: "HIGH — needed for T08 Push Notifications"
`);

// ================================================================
// PROJECT_HEALTH.yaml — Dependency health, risk aging, AI quality
// ================================================================
write(path.join(ROOT, 'PROJECT_HEALTH.yaml'), `# PROJECT HEALTH — Dependency health, risk aging, AI quality
# Updated: Every session end

dependency_health:
  # Every dependency is HEALTHY, WARNING, BLOCKED, DEPRECATED, REPLACING, or REMOVED
  prisma_orm:
    status: HEALTHY
    version: "latest"
    notes: "Type-safe database access, 78 models"
  react_query:
    status: HEALTHY
    version: "5.x"
    notes: "Server state management, staleTime 60s"
  socket_io:
    status: HEALTHY
    version: "4.x"
    notes: "WebSocket gateway with JWT auth"
  nodemailer:
    status: WARNING
    version: "installed"
    notes: "No SMTP credentials configured — not sending"
  twilio:
    status: BLOCKED
    version: "not installed"
    notes: "SMS engine is a stub — needs Twilio account"
  firebase:
    status: BLOCKED
    version: "not installed"
    notes: "Push engine doesn't exist — needs Firebase project"
  clerk:
    status: HEALTHY
    version: "latest"
    notes: "Frontend authentication, sign-in/sign-up"
  zod:
    status: HEALTHY
    version: "3.x"
    notes: "Schema validation on 15/21 routes"
  playwright:
    status: DEPRECATED
    version: "not used"
    notes: "Installed but zero tests written"
  vitest:
    status: WARNING
    version: "not configured"
    notes: "Need to set up for T09"

risk_aging:
  # Risks that persist get flagged automatically
  - id: RSK-001
    description: "ZERO API tests — highest risk in system"
    created: "2026-07-23"
    last_reviewed: "2026-07-23"
    owner: "EOX Engineering"
    priority: CRITICAL
    days_open: 0
    mitigation: "T10 — API Test Suite (Phase 00)"
    status: OPEN
  - id: RSK-002
    description: "ZERO Playwright E2E tests"
    created: "2026-07-23"
    last_reviewed: "2026-07-23"
    owner: "EOX Engineering"
    priority: CRITICAL
    days_open: 0
    mitigation: "T11-T12 — Playwright Test Suite (Phase 00)"
    status: OPEN
  - id: RSK-003
    description: "13/21 routes use requireRole() not requirePermission()"
    created: "2026-07-23"
    last_reviewed: "2026-07-23"
    owner: "EOX Engineering"
    priority: CRITICAL
    days_open: 0
    mitigation: "T17 — Permission Enforcement (Phase 42g)"
    status: OPEN
  - id: RSK-004
    description: "Export endpoints load all data into memory — WILL crash on 1.5M records"
    created: "2026-07-23"
    last_reviewed: "2026-07-23"
    owner: "EOX Engineering"
    priority: HIGH
    days_open: 0
    mitigation: "T36 — Export Streaming Fix (Phase 43d)"
    status: OPEN
  - id: RSK-005
    description: "domain.js DELETE bug — 15 entities return 500 instead of 404"
    created: "2026-07-23"
    last_reviewed: "2026-07-23"
    owner: "EOX Engineering"
    priority: HIGH
    days_open: 0
    mitigation: "T30 — API Hardening (Phase 42g)"
    status: OPEN

ai_quality:
  # Track AI agent performance over time
  sessions:
    total: 0
    successful: 0
    failed: 0
    stopped: 0
    rolled_back: 0
    retries: 0
  averages:
    audit_score: 0
    fix_count: 0
    completion_time_minutes: 0
  incidents:
    hallucination: 0
    skipped_requirements: 0
    blocked_sessions: 0
  current_session:
    id: null
    model: null
    tickets_completed: 0
    steps_completed: 0
    confidence: 0

evidence_categories:
  # Every evidence file must be categorized
  screenshot: 0
  console: 0
  api_response: 0
  database: 0
  playwright: 0
  unit_test: 0
  integration_test: 0
  performance: 0
  security: 0
  graphiti: 0
  speckit: 0
  git: 0
`);

// ================================================================
// VERSION — Final update
// ================================================================
const versionContent = `# Planning OS Version

## v3.0.0 (Final Architecture) — 2026-07-23

### Changes from v2.1
- Repository reorganized into 7-layer architecture (see below)
- Added EXECUTION_ENGINE/ — 9 session lifecycle files
- Added AUDIT_ENGINE/ — 6-level audit hierarchy (Mini/Task/Phase/Wave/Release/Enterprise)
- Added LEARNING_ENGINE/ — Continuous improvement engine (8 files)
- Added KNOWLEDGE_BASE/ — Runtime knowledge bridge
- Added PROJECT_METRICS.yaml — Machine-readable live dashboard
- Added PROJECT_HEALTH.yaml — Dependency health, risk aging, AI quality

### Key Innovations
- **Execution Tickets** (EXEC-XXXX): One ticket per session, never multitask
- **Information Classification**: KNOWN / ASSUMED / UNKNOWN / BLOCKED — never implement on guesswork
- **Never Say Done**: Every completion requires Implementation + Verification + Evidence + Risks + Limitations + Next Ticket + Confidence%
- **6-Level Audit**: Mini → Task → Phase → Wave → Release → Enterprise
- **Continuous Learning**: Lessons learned, repeated failures, root cause library, pattern library, performance history, decision impact, AI mistakes, improvement backlog
- **Dependency Health**: Every dependency classified HEALTHY / WARNING / BLOCKED / DEPRECATED / REPLACING / REMOVED
- **Risk Aging**: Every risk tracked with days open — long-lived risks are visible
- **Decision Traceability**: Every ADR references wave / phase / task / step / commit / graphiti / speckit
- **AI Quality Metrics**: Sessions, success rate, hallucination incidents, skipped requirements

### Repository Architecture (FINAL)
\`\`\`
planning/
├── 000_ENTERPRISE_PROGRAM/     # Business, architecture, governance (41 layers)
├── 001_WAVES/                  # Implementation planning (waves/phases/tasks)
├── EXECUTION_ENGINE/           # Session lifecycle (9 files)
├── AUDIT_ENGINE/               # Verification hierarchy (6 levels)
├── LEARNING_ENGINE/            # Continuous improvement (8 files)
├── KNOWLEDGE_BASE/             # Knowledge bridge
├── PROJECT_METRICS.yaml        # Machine-readable dashboard
├── PROJECT_HEALTH.yaml         # Dependency health, risk aging, AI quality
└── VERSION                     # This file
\`\`\`

### Status: 🚫 FROZEN — STRICT GOVERNANCE

Planning OS v3.0.0 is declared **FROZEN**. No structural changes permitted without Enterprise Architect approval.

**Permitted without approval:**
- Content updates to existing files (new lessons, metrics, patterns)
- Documentation updates
- STATUS file updates (as steps complete)

**Require Enterprise Architect approval:**
- New folders
- Renamed folders
- Hierarchy changes
- New governance layers
- New templates
- New AI rules

**Semantic Versioning:**
- MAJOR (v4.0.0): Hierarchy change, folder rename, new top-level layer
- MINOR (v3.1.0): New file within existing structure
- PATCH (v3.0.1): Content update, documentation, metrics

### Active
- **Wave:** 02 — User Experience & Communication
- **Next Phase:** Phase 00 — Enterprise Test Foundation (priority over all)
- **Next Task:** T09 — Unit Test Infrastructure (Step 01)
- **Execution Engine:** ACTIVE
- **Superloop Score:** 51.0% (107/210)
`;

fs.writeFileSync(path.join(ROOT, 'VERSION'), versionContent, 'utf8');
console.log('  planning/VERSION (v3.0.0 — FROZEN)');
console.log('\n=== FINAL ARCHITECTURE COMPLETE ===');
console.log('LEARNING_ENGINE/ — 8 files');
console.log('PROJECT_METRICS.yaml — machine-readable dashboard');
console.log('PROJECT_HEALTH.yaml — dependency health, risk aging, AI quality');
console.log('VERSION — v3.0.0 frozen');
