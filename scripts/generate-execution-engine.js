const fs = require('fs');
const path = require('path');

const EXEC = 'D:\\meter\\planning\\EXECUTION';
const AUDIT = 'D:\\meter\\planning\\AUDIT_ENGINE';
const KB = 'D:\\meter\\planning\\KNOWLEDGE_BASE';
const ROOT = 'D:\\meter\\planning';

function ensure(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function write(p, c) { fs.writeFileSync(p, c, 'utf8'); console.log('  ' + p); }

ensure(EXEC);
ensure(AUDIT);
ensure(KB);

// ================================================================
// SESSION_START.md — Entry point for every AI session
// ================================================================
write(path.join(EXEC, 'SESSION_START.md'), `# SESSION START — AI Execution Engine

**Rule:** Read these files IN THIS ORDER. Do not skip. Do not reorder.
**Violation:** Any AI that skips these files is operating without context.

## Required Reading Order

| Order | File | Purpose |
|:-----:|------|---------|
| 1 | \`planning/EXECUTION/SESSION_START.md\` | This file — entry point |
| 2 | \`planning/EXECUTION/CURRENT_PROJECT_STATE.md\` | Single source of truth |
| 3 | \`planning/EXECUTION/CURRENT_TARGET.md\` | What we're working on now |
| 4 | \`planning/EXECUTION/EXECUTION_ORDER.md\` | Execution lifecycle |
| 5 | \`planning/EXECUTION/IMPLEMENTATION_RULES.md\` | How to implement |
| 6 | \`planning/EXECUTION/VALIDATION_RULES.md\` | How to validate |
| 7 | \`planning/EXECUTION/COMMIT_RULES.md\` | How to commit |
| 8 | \`planning/EXECUTION/SESSION_CONTEXT.md\` | This session's context |
| 9 | \`planning/EXECUTION/CURRENT_STATE.md\` | Current execution state |
| 10 | \`planning/IMPLEMENTATION_PLAYBOOK.md\` | 13-stage lifecycle |
| 11 | \`planning/ULTIMATE_AUDIT_LOOP.md\` | SUPERLOOP verification |
| 12 | \`planning/VERSION\` | Planning OS version |
| 13 | Current Phase directory | Relevant phase details |
| 14 | Current Task directory | Relevant task details |
| 15 | Current Step directory | Relevant step details |

## After Reading

1. Update \`SESSION_CONTEXT.md\` with your session info
2. Read the **Current Execution Ticket** from \`CURRENT_TARGET.md\`
3. Begin the **Execution Lifecycle** per \`EXECUTION_ORDER.md\`
4. After every step, update \`CURRENT_PROJECT_STATE.md\`

## Information Classification

Every piece of information encountered must be classified:

| Classification | Meaning | Action |
|---------------|---------|--------|
| **KNOWN** | Verified by code or documentation | Use with confidence |
| **ASSUMED** | Reasonable inference, needs validation | Note as assumption, validate |
| **UNKNOWN** | Missing information, blocks certainty | STOP and resolve |
| **BLOCKED** | Cannot continue until resolved | Document blocker, STOP |

**Never implement on ASSUMED or UNKNOWN information.**
`);

// ================================================================
// SESSION_CONTEXT.md — Per-session context
// ================================================================
write(path.join(EXEC, 'SESSION_CONTEXT.md'), `# SESSION CONTEXT

**Updated:** Every session start
**Purpose:** Captures the current AI session's identity, scope, and boundaries.

## Session Identity

| Field | Value |
|-------|-------|
| Session ID | _(auto-generated)_ |
| AI Model | _(e.g. DeepSeek V4 Flash)_ |
| Started At | _(ISO timestamp)_ |
| Task | _(from CURRENT_TARGET.md)_ |
| Execution Ticket | _(from CURRENT_TARGET.md)_ |

## Scope

### What I am doing this session
_(Fill in: the exact Step/Task being worked on)_

### What I am NOT doing this session
_(Fill in: explicit exclusions to prevent scope creep)_

### What I must NOT touch
- Other tasks in the same phase
- Other phases in the same wave
- Other waves entirely
- Code outside the implementation scope
- Configuration not relevant to the task

## Session State

| Item | Status |
|------|--------|
| Pre-read complete | YES/NO |
| Understanding verified | YES/NO |
| Architecture verified | YES/NO |
| Implementation started | YES/NO |
| Implementation complete | YES/NO |
| Tests passing | YES/NO |
| Evidence captured | YES/NO |
| Committed | YES/NO |
| Planning updated | YES/NO |
| Readiness gate passed | YES/NO |

## Blockers Encountered

| # | Blocker | Status |
|:-:|---------|--------|
| 1 | | |
| 2 | | |

## Decisions Made This Session

| Decision | Rationale |
|----------|-----------|
| | |

## Session End

| Item | Value |
|------|-------|
| Completed Steps | |
| Failed Steps | |
| New Tickets Created | |
| Confidence % | |
| Remaining Risks | |
| Known Limitations | |
| Next Ticket | |
`);

// ================================================================
// EXECUTION_ORDER.md — The execution lifecycle
// ================================================================
write(path.join(EXEC, 'EXECUTION_ORDER.md'), `# EXECUTION ORDER — The Execution Lifecycle

**Every execution follows this exact order. Never skip a stage.**

## The Lifecycle

\`\`\`
SESSION START
    │
    ▼
PRE-READ (read SESSION_START.md required files)
    │
    ▼
UNDERSTAND (classify all info: KNOWN/ASSUMED/UNKNOWN/BLOCKED)
    │
    ▼
VERIFY ARCHITECTURE (planning vs codebase)
    │
    ▼
PLANNING VERIFICATION (verify plan before implementing)
    │
    ▼
IMPLEMENTATION (only the current Execution Ticket)
    │
    ▼
IMPLEMENTATION VERIFICATION (mini audit)
    │
    ▼
TESTING (run all applicable tests)
    │
    ▼
EVIDENCE (capture proof)
    │
    ▼
COMMIT (per COMMIT_RULES.md)
    │
    ▼
REPOSITORY VERIFICATION (verify commit matches planning)
    │
    ▼
PLANNING UPDATE (update STATUS files + CURRENT_PROJECT_STATE.md)
    │
    ▼
READINESS GATE (check: can we proceed to next step?)
    │
    ▼
SESSION END
\`\`\`

## Planning → Implementation → Audit flow

\`\`\`
PLANNING
    │
    ▼
PLANNING VERIFICATION (is the plan complete and consistent?)
    │
    ▼
IMPLEMENTATION
    │
    ▼
IMPLEMENTATION VERIFICATION (mini audit)
    │
    ▼
COMMIT
    │
    ▼
REPOSITORY VERIFICATION (git matches planning)
    │
    ▼
PLANNING UPDATE
    │
    ▼
NEXT STEP (readiness gate)
\`\`\`
`);

// ================================================================
// CURRENT_PROJECT_STATE.md — Single source of truth
// ================================================================
write(path.join(EXEC, 'CURRENT_PROJECT_STATE.md'), `# CURRENT PROJECT STATE — Single Source of Truth

**Updated:** Every session end
**Purpose:** Any new AI session reads this file to understand EXACTLY where the project is.

---

## Project Overview

| Field | Value |
|-------|-------|
| Repository | https://github.com/Kirllos360/MeterVerse |
| Branch | clean-main |
| Planning OS | v2.1 (Enterprise Baseline) + Execution Engine v1.0 |
| Last Updated | 2026-07-23 |

---

## Current Wave

| Field | Value |
|-------|-------|
| Wave | **02 — User Experience & Communication** |
| Completion | 12% |
| Status | ACTIVE (blocked on critical gaps from SUPERLOOP audit) |

## Current Phase

| Field | Value |
|-------|-------|
| Phase | **Phase 00 — Enterprise Test Foundation** (priority over all) |
| Status | PLANNING |
| Reason | ZERO API/Playwright tests — highest risk in system |

## Current Task

| Field | Value |
|-------|-------|
| Task | **T09 — Unit Test Infrastructure** |
| Status | PLANNING |
| Execution Ticket | None yet |

## Current Step

| Field | Value |
|-------|-------|
| Step | Step 01 |
| Status | PLANNING |

---

## Execution Tickets

| Ticket | Priority | Status | Phase | Task |
|--------|:--------:|:------:|-------|------|
| _(none open)_ | | | | |

---

## Blockers

| # | Blocker | Severity | Needed To Unblock |
|:-:|---------|:--------:|-------------------|
| 1 | SMTP credentials | HIGH | T06 Email Delivery |
| 2 | Twilio/Vonage account | HIGH | T07 SMS Service |
| 3 | Firebase project | HIGH | T08 Push Notifications |

---

## Waiting On

| Item | Owner | Since |
|------|-------|-------|
| User confirmation on knowledge gaps | User | 2026-07-23 |
| SMTP credentials | User | 2026-07-23 |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|------------|
| Export endpoint OOM crash with 1.5M records | HIGH | CRITICAL | T36 — Export Streaming fix |
| domain.js DELETE returns 500 on double-delete | HIGH | HIGH | T30 — API Hardening |
| No test safety net for billing changes | HIGH | CRITICAL | T09-T13 — Test Foundation |

---

## Known Bugs

| Bug | Severity | Found | Fix Task |
|-----|:--------:|:-----:|----------|
| domain.js DELETE idempotency (15 entities) | HIGH | SUPERLOOP audit | T30 |
| permissions.js/security.js code duplication | MEDIUM | SUPERLOOP audit | T31 |
| Graphiti graph built from wrong path | HIGH | SUPERLOOP audit | T34 |

---

## Open Decisions

| Decision | Options | Needed By |
|----------|---------|:---------:|
| Accounting method (double vs single entry) | Double-entry, Single-entry | W07 |
| SYMBIOT auth method | API key, OAuth, Basic Auth | W08 |
| Payment gateway provider | Fawry, Paymob, Stripe | W07 |

---

## Completion Percentages

| Dimension | % | Status |
|-----------|:-:|:------:|
| **Project Total** | **82%** | 🟢 |
| Wave 01 (Enterprise Hardening) | 100% | 🟢 |
| Wave 02 (UX & Communication) | 12% | 🔴 |
| Backend | 91% | 🟢 |
| Frontend | 76% | 🟡 |
| Database | 88% | 🟢 |
| Testing | 42% | 🟠 |
| Security | 65% | 🟡 |
| Performance | 61% | 🟡 |
| Documentation | 95% | 🟢 |
| Enterprise Readiness | 79% | 🟡 |
| SUPERLOOP Score | **51.0%** (107/210) | 🔴 |

## Repository Version

| Ref | Hash | Message |
|-----|:----:|---------|
| HEAD | \`70a4fd3\` | Implement ALL 70 gaps from SUPERLOOP audit across 6 new/enhanced phases |

## Planning Version

| File | Version | Status |
|------|:-------:|:------:|
| \`planning/VERSION\` | v2.1 + Execution Engine v1.0 | FROZEN |
| \`planning/IMPLEMENTATION_PLAYBOOK.md\` | 1.0 | ACTIVE |
| \`planning/ULTIMATE_AUDIT_LOOP.md\` | 1.0 | ACTIVE |
| \`planning/EXECUTION/\` | 9 files | ACTIVE |
| \`planning/AUDIT_ENGINE/\` | 7 files | ACTIVE |

## Next Ticket

| Field | Value |
|-------|-------|
| Next EXEC Ticket | EXEC-0001 |
| Phase | 00 — Enterprise Test Foundation |
| Task | T09 — Unit Test Infrastructure |
| Step | Step 01 |
`);

// ================================================================
// CURRENT_TARGET.md — What we're working on now
// ================================================================
write(path.join(EXEC, 'CURRENT_TARGET.md'), `# CURRENT TARGET — What We Are Working On Now

**Updated:** Every session start
**Purpose:** Single focus. Never work on more than one ticket at a time.

---

## Active Execution Ticket

| Field | Value |
|-------|-------|
| **EXEC-0001** | _(next available ticket number)_ |
| Status | WAITING |
| Phase | 00 — Enterprise Test Foundation |
| Task | T09 — Unit Test Infrastructure |
| Step | Step 01 of 08 |
| Started | _(ISO timestamp)_ |
| Target Complete | _(ISO timestamp)_ |

---

## Execution Ticket States

\`\`\`
WAITING
    │
    ▼
RUNNING
    │
    ▼
TESTING
    │
    ▼
FAILED ──→ FIXED ──→ TESTING (loop)
    │
    ▼
VERIFIED
    │
    ▼
COMMITTED
    │
    ▼
CLOSED
\`\`\`

## What This Ticket Requires

| Requirement | Status |
|-------------|:------:|
| Read all required documents | ❌ |
| Understand the task | ❌ |
| Verify architecture | ❌ |
| Plan implementation | ❌ |
| Implement | ❌ |
| Self-review | ❌ |
| Test | ❌ |
| Compare expected vs actual | ❌ |
| Capture evidence | ❌ |
| Fix any failures | ❌ |
| Retest | ❌ |
| Commit | ❌ |
| Update planning | ❌ |
| Pass readiness gate | ❌ |

## What Is NOT This Ticket

- Any task outside T09
- Any phase outside Phase 00
- Any wave outside Wave 02
- Any refactoring not required by the task
- Any documentation not required by the task

## Information Classification for This Ticket

| Item | Classification | Notes |
|------|:-------------:|-------|
| T09 requires Vitest | KNOWN | Standard for Next.js |
| 54 scripts exist | KNOWN | At scripts/ directory |
| Services need unit tests | KNOWN | 12 services |
| Coverage target | ASSUMED | 80% target needs validation |
| Test CI integration | UNKNOWN | Needs GitHub Actions investigation |
`);

// ================================================================
// IMPLEMENTATION_RULES.md
// ================================================================
write(path.join(EXEC, 'IMPLEMENTATION_RULES.md'), `# IMPLEMENTATION RULES

**Rule:** Every implementation must follow these rules. No exceptions.

---

## Rule 1: One Ticket Only
Only implement the current Execution Ticket. Never implement future tickets.

## Rule 2: Never Skip Stages
Follow EXECUTION_ORDER.md lifecycle exactly. PRE-READ → UNDERSTAND → VERIFY → PLAN → IMPLEMENT → VERIFY → TEST → EVIDENCE → COMMIT → VERIFY → UPDATE → GATE.

## Rule 3: Information Classification
Every piece of information is EXACTLY ONE of:
- **KNOWN** — Verified by code or documentation
- **ASSUMED** — Reasonable inference, must validate
- **UNKNOWN** — Missing information, STOP
- **BLOCKED** — Cannot continue, STOP

## Rule 4: Never Implement on ASSUMED or UNKNOWN
If any information needed for implementation is ASSUMED or UNKNOWN, STOP. Validate first.

## Rule 5: Implementation Priority
1. Database (models, migrations)
2. Backend (services, routes, middleware)
3. API contracts (request/response)
4. Permissions
5. Frontend (components, pages)
6. Runtime (engines, events)
7. Tests
8. Documentation

## Rule 6: Scope Boundary
- Only implement the current Step
- Never implement future Steps in the same Task
- Never implement another Task
- Never implement another Phase
- Never refactor outside scope

## Rule 7: Never Say "Done"
Every completion must include ALL of:
- Implementation summary (what was done)
- Verification (how it was verified)
- Evidence (proof)
- Remaining Risks
- Known Limitations
- Next Ticket
- Confidence % (0-100)

If any field is missing, the step is automatically incomplete.

## Rule 8: Prefer Existing Patterns
- Frontend: GenericAdminPage config, shadcn/ui, React Query
- Backend: Express route pattern, Zod validation, requirePermission, auditLog
- Database: Prisma models, UUID PKs, @@index, soft delete

## Rule 9: No Guessing
If uncertain → check documentation. If still uncertain → STOP and ask.

## Rule 10: No Temporary State
- Never leave TODO, FIXME, HACK, or commented code
- Never leave console.log in production code
- Never leave dead code or unused imports
- Never commit without evidence
`);

// ================================================================
// VALIDATION_RULES.md
// ================================================================
write(path.join(EXEC, 'VALIDATION_RULES.md'), `# VALIDATION RULES

**Rule:** Every implementation must be validated. No exceptions.

---

## Multi-Level Validation

### Mini Audit (after every Step)
Run before marking any Step complete:
- [ ] Build passes (npm run build)
- [ ] TypeScript passes (npx tsc --noEmit)
- [ ] Lint passes (npm run lint)
- [ ] Runtime works (manual smoke test)
- [ ] Implementation matches the plan
- [ ] No scope creep
- [ ] Evidence captured
- [ ] STATUS file updated

### Task Audit (after every Task)
- [ ] All Steps complete and verified
- [ ] Business workflow works end-to-end
- [ ] APIs verified (correct status codes, error handling, pagination)
- [ ] Frontend renders (loading, error, empty, edge states)
- [ ] Database operations correct (migrations clean, data accurate)
- [ ] Permissions enforced (authorized gets 200, unauthorized gets 403)
- [ ] Definition of Done checklist complete
- [ ] Dependency Heat Map updated
- [ ] Decision Log checked for new decisions

### Phase Audit (after every Phase)
- [ ] All Tasks complete and verified
- [ ] Graphiti comparison passed (architecture matches code)
- [ ] SpecKit validation passed (documentation matches code)
- [ ] Ultimate Audit Framework applied (21 dimensions)
- [ ] T99 phase audit completed
- [ ] Architecture review passed
- [ ] Technical debt reviewed and documented
- [ ] Performance reviewed (no regressions)
- [ ] Security reviewed (no new vulnerabilities)
- [ ] Enterprise Metrics recalculated

### Wave Audit (after every Wave)
- [ ] All Phases complete and verified
- [ ] Full regression passed
- [ ] End-to-end workflows passed
- [ ] Executive Dashboard updated
- [ ] Capability Roadmap updated
- [ ] Feature Lifecycle updated
- [ ] Release readiness confirmed
- [ ] Lessons learned documented
- [ ] Risks updated in Risk Register

### Release Audit (before production)
- [ ] All Wave audits passed
- [ ] Security penetration test passed
- [ ] Load test passed
- [ ] Backup/restore tested
- [ ] Disaster recovery drill passed
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] Stakeholder sign-off obtained

### Enterprise Audit (quarterly)
- [ ] All Release audits passed since last quarter
- [ ] SUPERLOOP score improved from previous quarter
- [ ] All 21 dimensions scored
- [ ] Knowledge Base updated
- [ ] Decision Log reviewed
- [ ] Technical Debt Register reviewed
- [ ] Risk Register reviewed

## Validation Gates

### After Implementation
\`\`\`
Implementation
    │
    ▼
Mini Audit ──→ FAIL ──→ FIX
    │
    ▼
PASS ──→ Next Step
\`\`\`

### After Task Complete
\`\`\`
Final Step Complete
    │
    ▼
Task Audit ──→ FAIL ──→ Fix affected Steps
    │
    ▼
PASS ──→ Next Task
\`\`\`

### After Phase Complete
\`\`\`
Final Task Complete
    │
    ▼
Phase Audit ──→ FAIL ──→ Fix affected Tasks
    │
    ▼
PASS ──→ Next Phase
\`\`\`

## Verification Record
Every validation must produce:
- Mini Audit: \`AUDIT_ENGINE/mini/{ticket}-{step}.md\`
- Task Audit: \`AUDIT_ENGINE/task/{phase}-{task}.md\`
- Phase Audit: \`AUDIT_ENGINE/phase/{phase}.md\`
- Wave Audit: \`AUDIT_ENGINE/wave/{wave}.md\`
- Release Audit: \`AUDIT_ENGINE/release/{version}.md\`
- Enterprise Audit: \`AUDIT_ENGINE/enterprise/YYYY-QQ.md\`
`);

// ================================================================
// COMMIT_RULES.md
// ================================================================
write(path.join(EXEC, 'COMMIT_RULES.md'), `# COMMIT RULES

**Rule:** Every commit must follow these rules. No exceptions.

---

## Pre-Commit Checklist

- [ ] Only intended files changed (\`git status\` reviewed)
- [ ] Planning updated (STATUS files match reality)
- [ ] Evidence stored (evidence files exist)
- [ ] Documentation updated (if new features/dimensions added)
- [ ] No temporary files (\`.log\`, \`node_modules\`, \`dist\`, etc.)
- [ ] No debug code (\`console.log\`, \`TODO\`, \`FIXME\`, \`HACK\`)
- [ ] No secrets or credentials (env vars only)
- [ ] No commented-out code
- [ ] No merge conflict markers (\`<<<<<<\`, \`======\`, \`>>>>>>\`)
- [ ] Commit message follows convention

## Commit Message Convention

\`\`\`
{type}({scope}): {short description}

{optional body with reasoning}

Related: {ticket-id}
\`\`\`

### Types
- \`feat\` — New feature
- \`fix\` — Bug fix
- \`audit\` — Audit finding or improvement
- \`docs\` — Documentation only
- \`perf\` — Performance improvement
- \`security\` — Security improvement
- \`test\` — Test addition or improvement
- \`plan\` — Planning update
- \`exec\` — Execution engine update
- \`refactor\` — Code refactoring (no functional change)

### Scopes
- \`phase-{n}\` — Phase-specific change
- \`task-{n}\` — Task-specific change
- \`planning\` — Planning OS change
- \`execution\` — Execution Engine change
- \`audit\` — Audit Engine change
- \`backend\` — Backend code change
- \`frontend\` — Frontend code change
- \`database\` — Database/migration change

### Examples
\`\`\`
feat(phase-00): Add Vitest configuration and first unit tests

T09 Unit Test Infrastructure Step 1-3 complete.
54 verification scripts converted to proper Vitest describe/it blocks.
10 new unit tests for sms-engine, billing-engine, validation-engine.
Coverage threshold set to 80%.

Related: EXEC-0001
\`\`\`

## After Commit
1. Verify push succeeds: \`git push\`
2. Verify GitHub commit appears
3. Update \`CURRENT_PROJECT_STATE.md\` with new hash
4. Update \`CURRENT_TARGET.md\` to next ticket

## Never Commit
- Broken code (tests must pass first)
- Without evidence (screenshots, logs, test output)
- Multiple tickets in one commit
- Without updating STATUS files
- Without completing the Definition of Done
`);

// ================================================================
// CURRENT_STATE.md — Current execution state
// ================================================================
write(path.join(EXEC, 'CURRENT_STATE.md'), `# CURRENT STATE — Execution State

**Updated:** Every Step completion
**Purpose:** Tracks the granular execution state of the current ticket.

---

## Execution State

| Item | Status |
|------|:------:|
| Pre-read complete | NO |
| Understanding verified | NO |
| Architecture verified | NO |
| Planning complete | NO |
| Implementation complete | NO |
| Self-review complete | NO |
| Testing complete | NO |
| Compare complete | NO |
| Evidence captured | NO |
| Fix complete | NO |
| Retest complete | NO |
| Commit complete | NO |
| Planning update complete | NO |
| Readiness gate passed | NO |

## Next Action

The next action to take is:
_(Fill in: the exact next thing to do)_

## Active State

\`\`\`
EXEC-XXXX → {Phase} → {Task} → Step {N} → {State}
\`\`\`

Example:
\`\`\`
EXEC-0001 → Phase 00 → T09 → Step 01 → WAITING
\`\`\`

## Execution Log

| Step | Action | Result | Evidence | Timestamp |
|:----:|--------|:------:|:--------:|:---------:|
| 01 | _(pre-read)_ | ❌ | | |
`);

// ================================================================
// SESSION_END.md — Session completion protocol
// ================================================================
write(path.join(EXEC, 'SESSION_END.md'), `# SESSION END — Completion Protocol

**Rule:** Every session must complete this file before finishing.

---

## Session Summary

| Field | Required |
|-------|:--------:|
| Session ID | YES |
| AI Model | YES |
| Duration | YES |
| Execution Ticket | YES |
| Steps Completed | YES |
| Steps Failed | YES |

## Completion Record

Every completion must include ALL fields. If any is missing, the session is incomplete.

| Field | Required | Value |
|-------|:--------:|-------|
| **Implementation** | YES | What was implemented |
| **Verification** | YES | How it was verified |
| **Evidence** | YES | Links to evidence files |
| **Remaining Risks** | YES | Any residual risks |
| **Known Limitations** | YES | What doesn't work yet |
| **Next Ticket** | YES | EXEC-XXXX for next session |
| **Confidence %** | YES | 0-100 |

## Information Classification Review

| Classification | Count | Action Taken |
|:--------------:|:-----:|--------------|
| KNOWN | | Used |
| ASSUMED | | Validated |
| UNKNOWN | | Resolved |
| BLOCKED | | Documented |

## State Update Checklist

- [ ] \`CURRENT_PROJECT_STATE.md\` updated (completion %, hash, next ticket)
- [ ] \`CURRENT_TARGET.md\` updated (new ticket number)
- [ ] \`CURRENT_STATE.md\` reset for next step
- [ ] \`SESSION_CONTEXT.md\` finalized
- [ ] \`STATUS.yaml\` files updated (STEP, TASK, PHASE)
- [ ] \`AUDIT_ENGINE/\` record created (mini audit)
- [ ] All evidence committed
- [ ] Repository pushed to GitHub

## Final Word

| Question | Answer |
|----------|--------|
| Was the ticket completed? | YES/NO/PARTIAL |
| Is the system better than before? | YES/NO |
| What would you do differently? | |
`);

// ================================================================
// AUDIT ENGINE files
// ================================================================
ensure(AUDIT);
ensure(path.join(AUDIT, 'mini'));
ensure(path.join(AUDIT, 'task'));
ensure(path.join(AUDIT, 'phase'));
ensure(path.join(AUDIT, 'wave'));
ensure(path.join(AUDIT, 'release'));
ensure(path.join(AUDIT, 'enterprise'));

write(path.join(AUDIT, 'AUDIT_README.md'), `# AUDIT ENGINE — Multi-Level Verification

**Purpose:** Mini audit after every step → Task audit → Phase audit → Wave audit → Release audit → Enterprise audit.
**Rule:** Every level must pass before proceeding to the next.

## Audit Hierarchy

\`\`\`
Every Step    → Mini Audit
Every Task    → Task Audit
Every Phase   → Phase Audit
Every Wave    → Wave Audit
Every Release → Release Audit
Every Quarter → Enterprise Audit
\`\`\`

## Directory Structure

\`\`\`
AUDIT_ENGINE/
├── AUDIT_README.md       ← This file
├── mini/                 ← Mini audits per step
│   └── {ticket}-{step}.md
├── task/                 ← Task audits
│   └── {phase}-{task}.md
├── phase/                ← Phase audits
│   └── {phase}.md
├── wave/                 ← Wave audits
│   └── {wave}.md
├── release/              ← Release audits
│   └── {version}.md
└── enterprise/           ← Quarterly enterprise audits
    └── YYYY-QQ.md
\`\`\`
`);

// Create template audit files
const auditTemplates = [
  ['mini', 'MINI_AUDIT_TEMPLATE.md', `# Mini Audit — EXEC-{TICKET} Step {N}

| Check | Result |
|-------|:------:|
| Build passes | PASS/FAIL |
| TypeScript passes | PASS/FAIL |
| Lint passes | PASS/FAIL |
| Runtime works | PASS/FAIL |
| Implementation matches plan | PASS/FAIL |
| No scope creep | PASS/FAIL |
| Evidence captured | PASS/FAIL |
| STATUS file updated | PASS/FAIL |

**Overall:** PASS/FAIL
**Notes:**
`],
  ['task', 'TASK_AUDIT_TEMPLATE.md', `# Task Audit — {PHASE} {TASK}

| Check | Result |
|-------|:------:|
| All Steps complete and verified | PASS/FAIL |
| Business workflow works | PASS/FAIL |
| APIs verified | PASS/FAIL |
| Frontend renders | PASS/FAIL |
| Database operations correct | PASS/FAIL |
| Permissions enforced | PASS/FAIL |
| Definition of Done complete | PASS/FAIL |
| Dependency Heat Map updated | PASS/FAIL |
| Decision Log checked | PASS/FAIL |

**Overall:** PASS/FAIL
**Notes:**
`],
  ['phase', 'PHASE_AUDIT_TEMPLATE.md', `# Phase Audit — {PHASE}

| Check | Result |
|-------|:------:|
| All Tasks complete and verified | PASS/FAIL |
| Graphiti comparison passed | PASS/FAIL |
| SpecKit validation passed | PASS/FAIL |
| Ultimate Audit Framework applied | PASS/FAIL |
| Architecture review passed | PASS/FAIL |
| Technical debt reviewed | PASS/FAIL |
| Performance reviewed | PASS/FAIL |
| Security reviewed | PASS/FAIL |
| Enterprise Metrics recalculated | PASS/FAIL |

**Overall:** PASS/FAIL
**Notes:**
`],
  ['wave', 'WAVE_AUDIT_TEMPLATE.md', `# Wave Audit — {WAVE}

| Check | Result |
|-------|:------:|
| All Phases complete and verified | PASS/FAIL |
| Full regression passed | PASS/FAIL |
| E2E workflows passed | PASS/FAIL |
| Executive Dashboard updated | PASS/FAIL |
| Capability Roadmap updated | PASS/FAIL |
| Feature Lifecycle updated | PASS/FAIL |
| Release readiness confirmed | PASS/FAIL |
| Lessons learned documented | PASS/FAIL |
| Risks updated in Risk Register | PASS/FAIL |

**Overall:** PASS/FAIL
**Notes:**
`],
  ['release', 'RELEASE_AUDIT_TEMPLATE.md', `# Release Audit — v{VERSION}

| Check | Result |
|-------|:------:|
| All Wave audits passed | PASS/FAIL |
| Security penetration test passed | PASS/FAIL |
| Load test passed | PASS/FAIL |
| Backup/restore tested | PASS/FAIL |
| Disaster recovery drill passed | PASS/FAIL |
| Monitoring alerts configured | PASS/FAIL |
| Rollback plan documented | PASS/FAIL |
| Stakeholder sign-off obtained | PASS/FAIL |

**Overall:** PASS/FAIL
**Notes:**
`],
  ['enterprise', 'ENTERPRISE_AUDIT_TEMPLATE.md', `# Enterprise Audit — {YEAR} Q{Q}

| Check | Result |
|-------|:------:|
| All Release audits since last quarter | PASS/FAIL |
| SUPERLOOP score improved | PASS/FAIL |
| All 21 dimensions scored | PASS/FAIL |
| Knowledge Base updated | PASS/FAIL |
| Decision Log reviewed | PASS/FAIL |
| Technical Debt Register reviewed | PASS/FAIL |
| Risk Register reviewed | PASS/FAIL |

**SUPERLOOP Score:** {SCORE}/210 ({PERCENT}%)
**Notes:**
`]
];

for (const [dir, fname, content] of auditTemplates) {
  write(path.join(AUDIT, dir, fname), content);
}

// ================================================================
// KNOWLEDGE BASE directory (runtime knowledge bridge)
// ================================================================
ensure(KB);
write(path.join(KB, 'KNOWLEDGE_README.md'), `# KNOWLEDGE BASE — Runtime Knowledge

**Purpose:** Bridges planning knowledge with runtime code knowledge.
**Content:** References to the 20 Knowledge Base documents in 000_ENTERPRISE_PROGRAM/31_ENTERPRISE_KNOWLEDGE_BASE/

## Domains

| Domain | KB Document |
|--------|-------------|
| Company Profile | 01_Company_Profile.md |
| Business Model | 02_Business_Model.md |
| Areas | 03_Areas.md |
| Projects | 04_Projects.md |
| Meter Types | 05_Meter_Types.md |
| Customer Types | 06_Customer_Types.md |
| Tariff System | 07_Tariff_System.md |
| Billing Model | 08_Billing_Model.md |
| Collections | 09_Collections.md |
| Financial Model | 10_Financial_Model.md |
| External Systems | 11_External_Systems.md |
| SYMBIOT | 12_SYMBIOT.md |
| User Personas | 13_User_Personas.md |
| Admin Personas | 14_Admin_Personas.md |
| Field Operators | 15_Field_Operators.md |
| Mobile | 16_Mobile.md |
| Permissions | 17_Permissions.md |
| Workflows | 18_Workflows.md |
| Reports | 19_Reports.md |
| AI Knowledge | 20_AI_Knowledge.md |
`);

// ================================================================
// UPDATE VERSION
// ================================================================
const versionPath = 'D:\\meter\\planning\\VERSION';
let version = fs.readFileSync(versionPath, 'utf8');

const newSection = `
---

## v3.0 (Execution Engine) — 2026-07-23

### Major Changes
- Repository reorganized into 6-layer architecture:
  \`\`\`
  planning/
  ├── 000_ENTERPRISE_PROGRAM/    # Business, architecture, governance (41 layers)
  ├── 001_WAVES/                 # Implementation planning (waves/phases/tasks)
  ├── EXECUTION/                 # Session lifecycle (9 files)
  ├── AUDIT_ENGINE/              # Multi-level verification (6 audit levels)
  ├── KNOWLEDGE_BASE/            # Enterprise knowledge bridge
  └── PROJECT/                   # Source code (backend, frontend)
  \`\`\`

### Added
- \`EXECUTION/SESSION_START.md\` — Mandatory reading order for every AI session
- \`EXECUTION/SESSION_CONTEXT.md\` — Per-session context and boundaries
- \`EXECUTION/EXECUTION_ORDER.md\` — The execution lifecycle (13 stages)
- \`EXECUTION/CURRENT_PROJECT_STATE.md\` — Single source of truth
- \`EXECUTION/CURRENT_TARGET.md\` — Current execution ticket focus
- \`EXECUTION/CURRENT_STATE.md\` — Granular execution state
- \`EXECUTION/IMPLEMENTATION_RULES.md\` — 10 implementation rules
- \`EXECUTION/VALIDATION_RULES.md\` — 6-level audit hierarchy
- \`EXECUTION/COMMIT_RULES.md\` — Commit rules and conventions
- \`EXECUTION/SESSION_END.md\` — Session completion protocol
- \`AUDIT_ENGINE/\` — Mini/Task/Phase/Wave/Release/Enterprise audit templates
- \`KNOWLEDGE_BASE/\` — Runtime knowledge bridge

### Key Innovations
- **Execution Tickets** (EXEC-XXXX): Single ticket per session, never multitask
- **Information Classification**: KNOWN / ASSUMED / UNKNOWN / BLOCKED — never guess
- **Never Say Done**: Every completion requires Implementation + Verification + Evidence + Risks + Limitations + Next Ticket + Confidence%
- **Planning → Verification → Implementation → Verification → Commit → Verification → Update → Gate**: Double verification at every layer
- **Current Project State**: Single file any session reads to understand the project

### Status: ACTIVE — Implementation phase
The planning freeze is complete. EXECUTION engine is the operating system.
`;

// Insert after the v2.1 section
// Find the end of v2.1 content and append v3.0
const insertPoint = version.indexOf('### Rules\n4. Focus shifts from planning to implementation');
if (insertPoint >= 0) {
  // Find the end of that section
  const endOfVersion = version.length;
  version = version.trimEnd() + '\n' + newSection;
} else {
  version = version.trimEnd() + '\n' + newSection;
}

fs.writeFileSync(versionPath, version, 'utf8');
console.log('  planning/VERSION (updated to v3.0)');

console.log('\n=== EXECUTION ENGINE COMPLETE ===');
console.log('EXECUTION/ — 9 files created');
console.log('AUDIT_ENGINE/ — 7 template files created');
console.log('KNOWLEDGE_BASE/ — 1 bridge file created');
console.log('VERSION — updated to v3.0');
