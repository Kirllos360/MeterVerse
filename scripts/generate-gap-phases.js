const fs = require('fs');
const path = require('path');

const WAVE02 = 'D:\\meter\\planning\\001_WAVES\\02_USER_EXPERIENCE';
const WAVE04 = 'D:\\meter\\planning\\001_WAVES\\04_PLATFORM';

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function writeYaml(path, content) { fs.writeFileSync(path, content, 'utf8'); console.log('  ' + path); }

// ============================================================
// PHASE 00 — Enterprise Test Foundation
// ============================================================
const p00 = path.join(WAVE02, '00_ENTERPRISE_TEST_FOUNDATION');
ensureDir(p00);

// PHASE_STATUS
writeYaml(path.join(p00, 'PHASE_STATUS.yaml'), `# Phase 00 — Enterprise Test Foundation
status: PLANNING
started: null
completed: null
total_tasks: 4
completed_tasks: 0
evidence_dir: 00_ENTERPRISE_TEST_FOUNDATION/_evidence/
`);

const phase00Tasks = [
  { id: 'T09-UNIT', name: 'T09 — Unit Test Infrastructure', desc: 'Set up Vitest, write unit tests for all services', steps: 8,
    checklist: '[/] Vitest configured [/] 54 existing scripts converted [/] 10 new unit tests written [/] Coverage target set [/] All pass' },
  { id: 'T10-API', name: 'T10 — API Test Suite', desc: 'Write API integration tests for all 21 route files', steps: 10,
    checklist: '[/] Supertest configured [/] Auth endpoints tested [/] CRUD endpoints tested [/] Error cases tested [/] Permission checks tested [/] All pass' },
  { id: 'T11-PLAY-AUTH', name: 'T11 — Playwright Auth Tests', desc: 'Write Playwright E2E tests for login & auth flows', steps: 6,
    checklist: '[/] Playwright configured [/] Login flow tested [/] Unauthorized redirected [/] Role-based access tested [/] Screenshots captured' },
  { id: 'T12-PLAY-PAGES', name: 'T12 — Playwright Page Tests', desc: 'Write Playwright E2E tests for all admin pages', steps: 8,
    checklist: '[/] List pages tested [/] Detail pages tested [/] CRUD flows tested [/] Error states tested [/] Empty states tested [/] Screenshots captured' },
];

for (const t of phase00Tasks) {
  const td = path.join(p00, t.id);
  ensureDir(td);
  // TASK_STATUS
  writeYaml(path.join(td, 'TASK_STATUS.yaml'), `# ${t.name}
status: PLANNING
started: null
completed: null
phase: 00_ENTERPRISE_TEST_FOUNDATION
total_steps: ${t.steps}
completed_steps: 0
checklist: "${t.checklist}"
`);
  // Task steps
  for (let s = 1; s <= t.steps; s++) {
    const sd = path.join(td, `STEP_${String(s).padStart(2,'0')}`);
    ensureDir(sd);
    writeYaml(path.join(sd, 'STEP_STATUS.yaml'), `# ${t.name} — Step ${s}
status: PLANNING
started: null
completed: null
evidence: []
`);
  }
}

// T09 detailed steps
const t09steps = [
  'READ: Review existing 54 verification scripts in scripts/ — understand what they test and how',
  'UNDERSTAND: Map which services need unit tests (12 services × at least 3 tests each = 36 minimum)',
  'PLAN: Define test structure — __tests__/ directories, Vitest config, coverage threshold (80%)',
  'IMPLEMENT: Set up Vitest with Jest-compatible API, configure coverage reporter, add npm run test script',
  'IMPLEMENT: Convert 54 verification scripts into proper Vitest describe/it blocks with assertions',
  'IMPLEMENT: Write 10 new unit tests covering services with zero coverage (sms-engine, billing-engine, validation-engine)',
  'TEST: Run full suite, fix any failures, verify coverage meets threshold',
  'EVIDENCE: Capture coverage report, commit all tests, update Feature Lifecycle'
];
const t10steps = [
  'READ: Review 21 route files and their existing test patterns (if any)',
  'UNDERSTAND: Map each route to its test cases (success, failure, edge, auth, permission)',
  'PLAN: Define API test structure — supertest, test DB, auth helpers, seed data',
  'IMPLEMENT: Create test helper utilities (auth token generation, test DB setup, route factory)',
  'IMPLEMENT: Write tests for auth.js routes (login, me, refresh — success + failure + lockout)',
  'IMPLEMENT: Write tests for 3 route files with requirePermission (customers, invoices, meters — full CRUD)',
  'IMPLEMENT: Write tests for domain.js CRUD factory (including DELETE idempotency check)',
  'IMPLEMENT: Write permission tests (unauthorized returns 403, wrong role returns 403)',
  'TEST: Run full API test suite, fix failures, verify all 21 route categories covered',
  'EVIDENCE: Capture test results, commit, update Dependency Heat Map (T10 completed unblocks T13)'
];
const t11steps = [
  'READ: Review frontend auth pages, identity layer, and Clerk configuration',
  'UNDERSTAND: Map auth flows (login, logout, register, password reset, role redirect)',
  'PLAN: Define Playwright test structure — auth fixture, test users, screenshot directory',
  'IMPLEMENT: Write login test (valid credentials → dashboard, invalid → error message, locked account → lockout message)',
  'IMPLEMENT: Write role-based access tests (admin sees admin pages, viewer sees limited pages)',
  'EVIDENCE: Capture screenshots of each auth state, commit tests'
];
const t12steps = [
  'READ: Review GenericAdminPage pattern and all 59 admin page configs',
  'UNDERSTAND: Map page categories (list, detail, CRUD, read-only) and their test patterns',
  'PLAN: Define Page Object Model for admin pages, test data fixtures',
  'IMPLEMENT: Write list page smoke tests (5 pages: customers, meters, invoices, payments, users — data renders, pagination works)',
  'IMPLEMENT: Write detail page tests (5 detail pages — navigation works, data displays, back button works)',
  'IMPLEMENT: Write CRUD flow tests (create → verify → edit → verify → delete → verify — 2 entities)',
  'IMPLEMENT: Write error/empty state tests (invalid ID → error state, no data → empty state)',
  'EVIDENCE: Capture screenshots of all states, commit tests'
];

// Write step content for T09
for (let i = 0; i < t09steps.length; i++) {
  const sd = path.join(p00, 'T09-UNIT', `STEP_${String(i+1).padStart(2,'0')}`);
  // Step content as README
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t09steps[i].split(':')[0].trim()}

## Action
${t09steps[i]}

## Verification
- [ ] Step content understood
- [ ] Dependencies checked
- [ ] Implementation follows IMPLEMENTATION_PLAYBOOK.md stages

## Evidence
- Build logs
- Test output
- Coverage report
`);
}
// Write step content for T10
for (let i = 0; i < t10steps.length; i++) {
  const sd = path.join(p00, 'T10-API', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t10steps[i].split(':')[0].trim()}

## Action
${t10steps[i]}

## Verification
- [ ] Step content understood
- [ ] Dependencies checked
- [ ] Implementation follows IMPLEMENTATION_PLAYBOOK.md stages

## Evidence
- API test results
- Supertest output
`);
}
// Write step content for T11
for (let i = 0; i < t11steps.length; i++) {
  const sd = path.join(p00, 'T11-PLAY-AUTH', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t11steps[i].split(':')[0].trim()}

## Action
${t11steps[i]}

## Verification
- [ ] Step content understood
- [ ] Dependencies checked
- [ ] Implementation follows IMPLEMENTATION_PLAYBOOK.md stages

## Evidence
- Playwright test results
- Screenshots
`);
}
// Write step content for T12
for (let i = 0; i < t12steps.length; i++) {
  const sd = path.join(p00, 'T12-PLAY-PAGES', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t12steps[i].split(':')[0].trim()}

## Action
${t12steps[i]}

## Verification
- [ ] Step content understood
- [ ] Dependencies checked
- [ ] Implementation follows IMPLEMENTATION_PLAYBOOK.md stages

## Evidence
- Playwright test results
- Screenshots for all states
`);
}

// ============================================================
// PHASE 42g — Enterprise Control Health
// ============================================================
const p42g = path.join(WAVE02, '42g_CONTROL_HEALTH');
ensureDir(p42g);
writeYaml(path.join(p42g, 'PHASE_STATUS.yaml'), `# Phase 42g — Enterprise Control Health
status: PLANNING
started: null
completed: null
total_tasks: 7
completed_tasks: 0
evidence_dir: 42g_CONTROL_HEALTH/_evidence/
`);

const phase42gTasks = [
  { id: 'T17-PERM', name: 'T17 — Full Permission Enforcement (13 routes)', desc: 'Replace requireRole() with requirePermission() on all remaining routes', steps: 8,
    checklist: '[/] 13 routes audited [/] Missing perm keys added [/] All routes use requirePermission [/] Role-based tests pass [/] Migration documented' },
  { id: 'T21-AUDIT', name: 'T21 — Full Audit Coverage (15 routes)', desc: 'Add auditLog() to all mutation endpoints missing it', steps: 6,
    checklist: '[/] 15 routes audited [/] Audit calls added [/] Audit table verified [/] No regressions' },
  { id: 'T29-DB', name: 'T29 — Database Schema Hardening', desc: 'Fix enums, seed data, N+1 audit, migration history', steps: 6,
    checklist: '[/] Enums created [/] Seed data completed [/] N+1 queries found & fixed [/] Migration history file created' },
  { id: 'T30-API', name: 'T30 — API Hardening', desc: 'Fix domain.js DELETE bug, add Zod to 6 routes, add Swagger', steps: 8,
    checklist: '[/] domain.js DELETE idempotent [/] 6 routes have Zod validation [/] Swagger docs generated [/] All pass' },
  { id: 'T31-CONSO', name: 'T31 — Codebase Consolidation', desc: 'Dedup permissions/security, create controller layer, clean console.log', steps: 6,
    checklist: '[/] permissions.js + security.js merged [/] Controller directory populated [/] console.log removed [/] No regressions' },
  { id: 'T34-GRAPH', name: 'T34 — Graphiti Rebuild', desc: 'Rebuild knowledge graph from correct path, add auto-sync', steps: 5,
    checklist: '[/] graphify run on D:\\meter [/] HTML renders correctly [/] 225+ files mapped [/] --watch enabled' },
  { id: 'T35-WORKFLOW-ENGINE', name: 'T35 — Workflow Engine Service', desc: 'Build workflow-engine.js to centralize state transitions', steps: 6,
    checklist: '[/] workflow-engine.js built [/] 3 state machines validated [/] Transitions audited [/] Tests pass' },
];

for (const t of phase42gTasks) {
  const td = path.join(p42g, t.id);
  ensureDir(td);
  writeYaml(path.join(td, 'TASK_STATUS.yaml'), `# ${t.name}
status: PLANNING
started: null
completed: null
phase: 42g_CONTROL_HEALTH
total_steps: ${t.steps}
completed_steps: 0
checklist: "${t.checklist}"
`);
  for (let s = 1; s <= t.steps; s++) {
    const sd = path.join(td, `STEP_${String(s).padStart(2,'0')}`);
    ensureDir(sd);
    writeYaml(path.join(sd, 'STEP_STATUS.yaml'), `# ${t.name} — Step ${s}
status: PLANNING
started: null
completed: null
evidence: []
`);
  }
}

// Write step content for T17
const t17steps = [
  'READ: Audit all 21 route files — identify which use requireRole(), which use requirePermission(), which use neither',
  'UNDERSTAND: Map each requireRole() call to its equivalent requirePermission() key. Check if missing keys need creation',
  'PLAN: Migration order — start with read-only routes, progress to mutation routes, end with admin.js (most complex)',
  'IMPLEMENT: Update admin.js — replace all requireRole("admin","super_admin") with requirePermission("admin.*")',
  'IMPLEMENT: Update ai.js, business.js, crud.js, domain.js, monitor.js, notifications.js, reports.js, security.js',
  'IMPLEMENT: Update meter-assignments.js, services.js, preferences.js, search.js — 13 routes total',
  'TEST: Test every updated route with authorized user (gets 200) and unauthorized user (gets 403)',
  'EVIDENCE: Capture before/after perm check results, commit, update Dependency Heat Map (unblocks T18, T21, Phase 43d)'
];
for (let i = 0; i < t17steps.length; i++) {
  const sd = path.join(p42g, 'T17-PERM', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t17steps[i].split(':')[0].trim()}

## Action
${t17steps[i]}

## Gates
- D02: requirePermission() on every endpoint
- D12: Authorization checked on all endpoints
- D20: GATE_CHECK passes

## Evidence
- Permission test results per route
- Git diff showing requireRole → requirePermission across 13 files
`);
}

// Write step content for T21
const t21steps = [
  'READ: Audit all 21 route files — identify which mutation endpoints (POST, PUT, DELETE, PATCH) are missing auditLog() calls',
  'UNDERSTAND: Map each missing auditLog location. Check auditLog import exists but is unused (admin.js imports it but never calls it)',
  'PLAN: Batch routes by complexity. Start with simple routes (notifications.js, services.js), end with complex (crud.js, domain.js)',
  'IMPLEMENT: Add auditLog() calls to all POST/PUT/DELETE/PATCH endpoints in admin.js, ai.js, alerts.js, business.js, domain.js, monitor.js',
  'IMPLEMENT: Add auditLog to notifications.js, preferences.js, reports.js, search.js, security.js, services.js — 15 routes total',
  'EVIDENCE: Verify AuditEntry table contains records from all 21 routes, commit, update Dependency Heat Map (unblocks T21)'
];
for (let i = 0; i < t21steps.length; i++) {
  const sd = path.join(p42g, 'T21-AUDIT', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t21steps[i].split(':')[0].trim()}

## Action
${t21steps[i]}

## Gates
- D02: auditLog() on all mutations
- D09: Entity operations are audited

## Evidence
- Audit log entries for each route
- Git diff showing auditLog calls added
`);
}

// Write step content for T29
const t29steps = [
  'READ: Review schema.prisma — identify all string-based status fields that should be enums',
  'UNDERSTAND: Map each enum candidate (Customer.status, Invoice.status, Meter.status, Payment.status, etc.) to its valid values',
  'PLAN: Create Prisma enum types, generate migration, update all seed data, update all route handlers that use string values',
  'IMPLEMENT: Create enums, generate migration, run migration, update seed data for all 5 reference tables',
  'IMPLEMENT: Audit all queries for N+1 patterns (use Prisma $queryRaw logging to detect), fix with include/select',
  'EVIDENCE: Enum migration runs clean, seed data populates correctly, N+1 queries eliminated, migration history file created'
];
for (let i = 0; i < t29steps.length; i++) {
  const sd = path.join(p42g, 'T29-DB', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t29steps[i].split(':')[0].trim()}

## Action
${t29steps[i]}

## Gates
- D03: @@index on FKs, proper enums
- D11: Query limits prevent DB overload

## Evidence
- Migration output
- Seed data verification
- Query log showing no N+1
`);
}

// Write step content for T30
const t30steps = [
  'READ: Review domain.js CRUD factory — identify DELETE handler that calls prisma.model.delete without pre-check',
  'UNDERSTAND: All 15 entities affected. Fix pattern: findUnique → if null return 404 → else delete',
  'PLAN: Read 6 routes with missing Zod (alerts.js, monitor.js, preferences.js, search.js, security.js, services.js). Define schemas.',
  'IMPLEMENT: Fix domain.js DELETE — add findUnique check before delete (or catch P2025 → 404) for all 15 entities',
  'IMPLEMENT: Add Zod validation schemas to alerts.js, monitor.js, preferences.js, search.js, security.js, services.js',
  'IMPLEMENT: Generate OpenAPI/Swagger docs from Zod schemas (zod-to-openapi or similar)',
  'TEST: Double-delete each of the 15 entities → verify 404 not 500. Test all new Zod schemas with invalid input.',
  'EVIDENCE: Bug fix verified (15 entities), Zod schemas tested, Swagger UI renders at /api/docs'
];
for (let i = 0; i < t30steps.length; i++) {
  const sd = path.join(p42g, 'T30-API', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t30steps[i].split(':')[0].trim()}

## Action
${t30steps[i]}

## Gates
- D02: DELETE idempotency, Zod validation
- D04: OpenAPI/Swagger compatible structure
- D10: Input validation at API layer

## Evidence
- Test showing 404 on double-delete (before: 500, after: 404)
- Zod schema files for 6 routes
- Swagger docs at /api/docs
`);
}

// Write step content for T31
const t31steps = [
  'READ: Compare permissions.js and security.js — identify all duplicated code (ROUTE_PERMISSION_MAP, ROLE_PERMISSIONS)',
  'UNDERSTAND: Map which routes import from which file. Plan consolidation into security.js only.',
  'PLAN: Create controller directory structure. Plan extraction of business logic from route handlers.',
  'IMPLEMENT: Remove duplicates from permissions.js. Update all imports to use security.js. Verify no broken imports.',
  'IMPLEMENT: Extract business logic from 3 route files (invoices, customers, meters) into controller files as proof of concept',
  'EVIDENCE: permissions.js imports removed, all routes pointing to security.js, 3 controllers created, console.log removed'
];
for (let i = 0; i < t31steps.length; i++) {
  const sd = path.join(p42g, 'T31-CONSO', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t31steps[i].split(':')[0].trim()}

## Action
${t31steps[i]}

## Gates
- D02: Follows existing patterns
- D14: DRY — reuse existing patterns

## Evidence
- Git diff showing dedup
- Controller files created
- All routes still functional
`);
}

// Write step content for T34
const t34steps = [
  'READ: Check current graphify-out/manifest.json — confirm path prefix is `D:\\meter\\Meter-\\` (wrong)',
  'UNDERSTAND: Install graphify, run detection on D:\\meter to scan 225+ files for correct paths',
  'IMPLEMENT: Run graphify D:\\meter --mode deep --update to rebuild graph from correct path',
  'IMPLEMENT: Enable --watch mode so graph auto-syncs on code changes',
  'EVIDENCE: Verify graph.html renders 225+ nodes, verify edges connect real files, commit manifest'
];
for (let i = 0; i < t34steps.length; i++) {
  const sd = path.join(p42g, 'T34-GRAPH', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t34steps[i].split(':')[0].trim()}

## Action
${t34steps[i]}

## Gates
- D05: No component exists in code but missing from graph
- IMPLEMENTATION_PLAYBOOK Stage 3: Graphiti mismatch → STOP

## Evidence
- graph.html screenshot
- graphify-out/manifest.json showing correct paths
`);
}

// Write step content for T35
const t35steps = [
  'READ: Review 17_Enterprise_State_Machine/ for Customer, Invoice, Meter state machines. Review WorkflowState and WorkflowTransition models in schema.prisma',
  'UNDERSTAND: Map state transitions, validations, and events for all 3 state machines',
  'PLAN: Design workflow-engine.js API — getValidTransitions(), transition(entityType, entityId, toState, actor), validateTransition()',
  'IMPLEMENT: Build workflow-engine.js with transition validation, audit logging, event emission',
  'IMPLEMENT: Integrate engine into route handlers (customers.js, invoices.js, meters.js) — replace ad-hoc state logic',
  'EVIDENCE: All 3 state machines validate, illegal transitions rejected, audit trail created, existing routes still work'
];
for (let i = 0; i < t35steps.length; i++) {
  const sd = path.join(p42g, 'T35-WORKFLOW-ENGINE', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t35steps[i].split(':')[0].trim()}

## Action
${t35steps[i]}

## Gates
- D06: Workflow has centralized engine
- D06: State transitions are valid (no illegal transitions)

## Evidence
- workflow-engine.js code
- Transition validation tests
- Audit log entries for state changes
`);
}

// ============================================================
// PHASE 43d EXTENSION — Admin Control Panels (3 new tasks)
// ============================================================
const p43d = path.join(WAVE02, '43d_ADMIN_CONTROL_PANELS');
ensureDir(p43d);

// Read existing PHASE_STATUS to update it
const p43dStatus = `# Phase 43d — Admin Control Panels & Monitoring
status: PLANNING
started: null
completed: null
total_tasks: 15
completed_tasks: 0
evidence_dir: 43d_ADMIN_CONTROL_PANELS/_evidence/

## Original Tasks (12)
T22-T28: Admin control panels (contracts, permissions, monitoring, backup, queue, cache, system config)
T32-T33: Admin improvements (added by ULTIMATE_AUDIT_LOOP)
T36-T38: Admin debug & monitoring (added by ULTIMATE_AUDIT_LOOP)

## Gap Coverage
- ErrorBoundary on all pages (D01/D10 gap)
- 2 missing detail pages (D01 gap)
- Admin debug mode (D09 gap)
- Export streaming fix (D11 gap)
`;
writeYaml(path.join(p43d, 'PHASE_STATUS.yaml'), p43dStatus);

// Verify 43d directory exists and has original tasks
if (!fs.existsSync(path.join(p43d, 'T22-ADMIN-CONTRACTS'))) {
  // Create original tasks with minimal status
  for (let i = 22; i <= 28; i++) {
    const taskDir = path.join(p43d, `T${i}-ADMIN`);
    ensureDir(taskDir);
    writeYaml(path.join(taskDir, 'TASK_STATUS.yaml'), `# T${i} — Admin Control Panel
status: PLANNING
started: null
completed: null
phase: 43d_ADMIN_CONTROL_PANELS
total_steps: 5
completed_steps: 0
checklist: "[/] Panel functional [/] Permissions enforced [/] Audit logged [/] Evidence captured"
`);
    for (let s = 1; s <= 5; s++) {
      const sd = path.join(taskDir, `STEP_${String(s).padStart(2,'0')}`);
      ensureDir(sd);
      writeYaml(path.join(sd, 'STEP_STATUS.yaml'), `# T${i} Admin Panel — Step ${s}
status: PLANNING
started: null
completed: null
evidence: []
`);
    }
  }
}

// New tasks for 43d
const new43dTasks = [
  { id: 'T32-ERROR-BOUNDARY', name: 'T32 — ErrorBoundary on All Pages', desc: 'Wrap every page with ErrorBoundary component', steps: 5,
    checklist: '[/] All 103 pages wrapped [/] Error states render [/] Recovery navigation works' },
  { id: 'T33-DETAIL-PAGES', name: 'T33 — Missing Detail Pages', desc: 'Add [id] detail pages for the 2 missing entities', steps: 5,
    checklist: '[/] 2 new detail pages [/] Navigation works [/] Data renders [/] Error states handled' },
  { id: 'T36-EXPORT-STREAM', name: 'T36 — Export Streaming Fix', desc: 'Replace in-memory export with streaming export to prevent OOM crashes', steps: 5,
    checklist: '[/] Streams implemented [/] 10K row cap [/] Memory usage verified [/] Works with 1.5M records' },
];

for (const t of new43dTasks) {
  const td = path.join(p43d, t.id);
  ensureDir(td);
  writeYaml(path.join(td, 'TASK_STATUS.yaml'), `# ${t.name}
status: PLANNING
started: null
completed: null
phase: 43d_ADMIN_CONTROL_PANELS
total_steps: ${t.steps}
completed_steps: 0
checklist: "${t.checklist}"
`);
  for (let s = 1; s <= t.steps; s++) {
    const sd = path.join(td, `STEP_${String(s).padStart(2,'0')}`);
    ensureDir(sd);
    writeYaml(path.join(sd, 'STEP_STATUS.yaml'), `# ${t.name} — Step ${s}
status: PLANNING
started: null
completed: null
evidence: []
`);
  }
}

// Write step content for T32
const t32steps = [
  'READ: Find existing ErrorBoundary component at components/effects/ErrorBoundary.tsx',
  'UNDERSTAND: Map all 103 pages — which already have ErrorBoundary, which need it added',
  'PLAN: Group pages by layout (admin layout, dashboard layout, public layout) — wrap at layout level where possible',
  'IMPLEMENT: Add ErrorBoundary to all layouts and standalone pages. Test error states by forcing errors.',
  'EVIDENCE: ErrorBoundary renders on all pages, error recovery works, screenshots captured'
];
for (let i = 0; i < t32steps.length; i++) {
  const sd = path.join(p43d, 'T32-ERROR-BOUNDARY', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t32steps[i].split(':')[0].trim()}

## Action
${t32steps[i]}

## Gates
- D01: ErrorBoundary wrapper
- D10: Error boundaries on all pages

## Evidence
- Screenshots of error states
- List of all wrapped pages
`);
}

// Write step content for T33
const t33steps = [
  'READ: Review existing [id] detail pages (8 exist) — understand pattern (page.tsx structure, data fetching, error handling)',
  'UNDERSTAND: Identify which 2 entities are missing detail pages from the 53 admin entities',
  'PLAN: Model new pages after existing patterns (invoices/[id], meters/[id], customers/[id])',
  'IMPLEMENT: Create 2 new [id] detail pages with data fetching, loading state, error state, empty state, navigation',
  'EVIDENCE: Detail pages render, navigation from list→detail works, error states display correctly'
];
for (let i = 0; i < t33steps.length; i++) {
  const sd = path.join(p43d, 'T33-DETAIL-PAGES', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t33steps[i].split(':')[0].trim()}

## Action
${t33steps[i]}

## Gates
- D01: [id] detail pages follow existing pattern

## Evidence
- Screenshots of detail pages
- Navigation flow working
`);
}

// Write step content for T36
const t36steps = [
  'READ: Find export endpoints — check which load all data into memory (not streamed)',
  'UNDERSTAND: Export pattern — currently reads ALL rows, formats, sends as JSON/CSV. Must be cursor-based or streamed.',
  'PLAN: Design streaming export — use Prisma cursor pagination, stream rows, cap at 10K per export',
  'IMPLEMENT: Rewrite exportData() in crud-service.js and export endpoints to use streaming, add 10K row cap',
  'EVIDENCE: Export of 50K+ records completes without OOM, memory usage stays under 50MB, cap enforced'
];
for (let i = 0; i < t36steps.length; i++) {
  const sd = path.join(p43d, 'T36-EXPORT-STREAM', `STEP_${String(i+1).padStart(2,'0')}`);
  fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${i+1}: ${t36steps[i].split(':')[0].trim()}

## Action
${t36steps[i]}

## Gates
- D11: Export endpoints don't load all into memory
- D11: Pagination caps

## Evidence
- Memory usage before/after
- Export of 50K+ records succeeds
`);
}

// ============================================================
// PHASE 45a — Performance Hardening
// ============================================================
const p45a = path.join(WAVE04, '45a_PERFORMANCE_HARDENING');
ensureDir(p45a);
writeYaml(path.join(p45a, 'PHASE_STATUS.yaml'), `# Phase 45a — Performance Hardening
status: PLANNING
started: null
completed: null
total_tasks: 4
completed_tasks: 0
evidence_dir: 45a_PERFORMANCE_HARDENING/_evidence/

## Gaps Covered
- D11: Export memory issue (T36 moved to 43d)
- D11: Pagination caps on 12 routes
- D11: Circuit breakers on external calls
- D03: Cache layer implementation
- D10: Graceful degradation audit
`);

const perfTasks = [
  { id: 'T37-PAGINATION', name: 'T37 — Pagination Caps on All Routes', desc: 'Add Math.min(100, limit) to 12 routes missing it', steps: 4,
    checklist: '[/] 12 routes updated [/] Caps verified [/] Existing queries not broken' },
  { id: 'T38-CIRCUIT-BREAKER', name: 'T38 — Circuit Breakers on External Calls', desc: 'Implement circuit breaker pattern for SYMBIOT and external API calls', steps: 5,
    checklist: '[/] Circuit breaker built [/] SYMBIOT calls protected [/] Half-open state works [/] Fallback documented' },
  { id: 'T39-CACHE-LAYER', name: 'T39 — Cache Layer Implementation', desc: 'Add Redis or in-memory cache for frequent queries', steps: 6,
    checklist: '[/] Cache engine built [/] Top 10 frequent queries cached [/] Invalidation works [/] Performance improved' },
  { id: 'T40-GRACEFUL-DEGRADATION', name: 'T40 — Graceful Degradation Audit', desc: 'Audit all features to ensure they degrade gracefully when deps fail', steps: 4,
    checklist: '[/] All 15 engines audited [/] Fallbacks documented [/] Works without non-critical deps' },
];

for (const t of perfTasks) {
  const td = path.join(p45a, t.id);
  ensureDir(td);
  writeYaml(path.join(td, 'TASK_STATUS.yaml'), `# ${t.name}
status: PLANNING
started: null
completed: null
phase: 45a_PERFORMANCE_HARDENING
total_steps: ${t.steps}
completed_steps: 0
checklist: "${t.checklist}"
`);
  for (let s = 1; s <= t.steps; s++) {
    const sd = path.join(td, `STEP_${String(s).padStart(2,'0')}`);
    ensureDir(sd);
    writeYaml(path.join(sd, 'STEP_STATUS.yaml'), `# ${t.name} — Step ${s}
status: PLANNING
started: null
completed: null
evidence: []
`);
    fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${s}: Execute

## Action
Execute step ${s} of ${t.desc}

## Gates
- D11: All crash prevention checks pass

## Evidence
- Performance metrics
- Test results
`);
  }
}

// ============================================================
// PHASE 45b — Security Hardening
// ============================================================
const p45b = path.join(WAVE04, '45b_SECURITY_HARDENING');
ensureDir(p45b);
writeYaml(path.join(p45b, 'PHASE_STATUS.yaml'), `# Phase 45b — Security Hardening
status: PLANNING
started: null
completed: null
total_tasks: 6
completed_tasks: 0
evidence_dir: 45b_SECURITY_HARDENING/_evidence/

## Gaps Covered
- D13: MFA is a placeholder (T41)
- D12: CSRF protection missing (T42)
- D13: No IP-based blocking (T43)
- D13: No DDoS protection (T44)
- D13: No security scan in CI (T45)
- D12/D13: CORS/Helmet verification (T46)
`);

const secTasks = [
  { id: 'T41-MFA', name: 'T41 — MFA Implementation', desc: 'Implement TOTP-based multi-factor authentication for admin users', steps: 6,
    checklist: '[/] TOTP library installed [/] MFA enrollment flow [/] MFA verification on login [/] Backup codes [/] Admin can enforce MFA' },
  { id: 'T42-CSRF', name: 'T42 — CSRF Protection', desc: 'Add CSRF protection for cookie-based auth and server-rendered forms', steps: 4,
    checklist: '[/] CSRF middleware enabled [/] Tokens on relevant forms [/] API-only routes excluded [/] Documented' },
  { id: 'T43-IP-BLOCKING', name: 'T43 — IP-Based Blocking', desc: 'Implement IP-based rate limiting and blocking for suspicious activity', steps: 5,
    checklist: '[/] IP tracking on auth failures [/] Temp block after N failures [/] Permanent block after M temp blocks [/] Admin unblock UI' },
  { id: 'T44-DDOS', name: 'T44 — DDoS Protection', desc: 'Implement DDoS protection (rate limiting per IP, request throttling, connection limits)', steps: 4,
    checklist: '[/] Global rate limiter [/] Per-IP throttling [/] Connection limits [/] Configurable thresholds' },
  { id: 'T45-CI-SECURITY', name: 'T45 — Security Scan in CI', desc: 'Add npm audit, dependency scanning, and CodeQL to CI pipeline', steps: 4,
    checklist: '[/] npm audit in CI [/] Dependency scan [/] CodeQL configured [/] Alerts on finding' },
  { id: 'T46-CORS-HELMET', name: 'T46 — CORS/Helmet Verification', desc: 'Verify and harden Helmet security headers and CORS configuration for production', steps: 4,
    checklist: '[/] Helmet enabled with all defaults [/] CORS whitelist for production [/] CSP headers configured [/] Tested' },
];

for (const t of secTasks) {
  const td = path.join(p45b, t.id);
  ensureDir(td);
  writeYaml(path.join(td, 'TASK_STATUS.yaml'), `# ${t.name}
status: PLANNING
started: null
completed: null
phase: 45b_SECURITY_HARDENING
total_steps: ${t.steps}
completed_steps: 0
checklist: "${t.checklist}"
`);
  for (let s = 1; s <= t.steps; s++) {
    const sd = path.join(td, `STEP_${String(s).padStart(2,'0')}`);
    ensureDir(sd);
    writeYaml(path.join(sd, 'STEP_STATUS.yaml'), `# ${t.name} — Step ${s}
status: PLANNING
started: null
completed: null
evidence: []
`);
    fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${s}: Execute

## Action
Execute step ${s} of ${t.desc}

## Gates
- D12: Hacking prevention checks pass
- D13: Cyber attack prevention checks pass

## Evidence
- Security test results
- Configuration verified
`);
  }
}

// ============================================================
// PHASE 45f — CI/CD Pipeline
// ============================================================
const p45f = path.join(WAVE04, '45f_CI_CD_PIPELINE');
ensureDir(p45f);
writeYaml(path.join(p45f, 'PHASE_STATUS.yaml'), `# Phase 45f — CI/CD Pipeline
status: PLANNING
started: null
completed: null
total_tasks: 3
completed_tasks: 0
evidence_dir: 45f_CI_CD_PIPELINE/_evidence/

## Gaps Covered
- D15: No CI test pipeline (T13 moved here as dedicated task)
- D05: No Graphiti validation in CI
- All: No deployment pipeline
`);

const ciTasks = [
  { id: 'T13-CI-TEST', name: 'T13 — CI Test Pipeline', desc: 'Create GitHub Actions workflow that runs all tests on every PR/push', steps: 5,
    checklist: '[/] GitHub Actions config [/] Unit tests run [/] API tests run [/] Lint passes [/] Builds succeed' },
  { id: 'T47-CI-GRAPHITI', name: 'T47 — CI Graphiti Validation', desc: 'Add Graphiti validation step to CI — verify architecture matches on every PR', steps: 4,
    checklist: '[/] Graphiti check step [/] Fails on mismatch [/] Reports diff [/] Blocks merge on mismatch' },
  { id: 'T48-CI-DEPLOY', name: 'T48 — CI Deployment Pipeline', desc: 'Create automated deployment pipeline (build → test → deploy) for production', steps: 5,
    checklist: '[/] Build stage [/] Test stage [/] Deploy stage [/] Rollback on failure [/] Documented' },
];

for (const t of ciTasks) {
  const td = path.join(p45f, t.id);
  ensureDir(td);
  writeYaml(path.join(td, 'TASK_STATUS.yaml'), `# ${t.name}
status: PLANNING
started: null
completed: null
phase: 45f_CI_CD_PIPELINE
total_steps: ${t.steps}
completed_steps: 0
checklist: "${t.checklist}"
`);
  for (let s = 1; s <= t.steps; s++) {
    const sd = path.join(td, `STEP_${String(s).padStart(2,'0')}`);
    ensureDir(sd);
    writeYaml(path.join(sd, 'STEP_STATUS.yaml'), `# ${t.name} — Step ${s}
status: PLANNING
started: null
completed: null
evidence: []
`);
    fs.writeFileSync(path.join(sd, 'STEP.md'), `# Step ${s}: Execute

## Action
Execute step ${s} of ${t.desc}

## Gates
- D15: CI pipeline runs all tests
- D17: Automated commit verification

## Evidence
- CI workflow file
- Test pass logs
`);
  }
}

console.log(`\n=== ALL PHASES GENERATED ===`);
console.log(`Phase 00: ${phase00Tasks.length} tasks`);
console.log(`Phase 42g: ${phase42gTasks.length} tasks (${phase42gTasks.map(t => t.id).join(', ')})`);
console.log(`Phase 43d: ${new43dTasks.length} new tasks + ${fs.existsSync(path.join(p43d, 'T22-ADMIN')) ? '12 original' : '0 original recreated'}`);
console.log(`Phase 45a: ${perfTasks.length} tasks`);
console.log(`Phase 45b: ${secTasks.length} tasks`);
console.log(`Phase 45f: ${ciTasks.length} tasks`);
console.log(`Total new tasks: ${phase00Tasks.length + phase42gTasks.length + new43dTasks.length + perfTasks.length + secTasks.length + ciTasks.length}`);
