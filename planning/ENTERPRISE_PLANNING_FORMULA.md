# MeterVerse Enterprise Planning Formula — v4.0.0

**Status:** ENTERPRISE PLANNING ARCHITECTURE — NOT implementation
**Replaces:** All prior planning methodology documents
**Governance:** This document defines the planning system itself. Changes require Enterprise Architect approval.

---

## PART 1: PLANNING FORMULA ANALYSIS

### 1.1 Strength Analysis

**old_tasks.md strengths:**
- Flat task numbering (T001-T216) enables unambiguous cross-referencing
- Per-task metadata block (Dependencies, Area/Files, Acceptance, Validation, Risk)
- Explicit checkpoint sections between phases
- Parallel execution markers [P] for independent tasks
- Graphify-First rule for frontend work
- Implementation Strategy section defining execution order
- User Story grouping with independent testability

**METERVERSE_UNIFIED_PLAN.md strengths:**
- Wave/Phase/Task hierarchy matches enterprise program management
- Status indicators (✅/⏳/❌/🔒) enable instant visual scanning
- Planning file inventory tracks governance artifacts
- Gap analysis table against external reference
- Blocked phase documentation with explicit blocker identification

**Weaknesses in both:**
- Neither has a universal task template
- Neither has rollback strategies per task
- Neither has explicit numbering standards
- Neither has completion percentage tracking
- Neither has enterprise tags for cross-domain traceability
- Neither has quality gate definitions at every level

### 1.2 Design Decisions

| Decision | Rationale |
|----------|-----------|
| Hierarchy: Vision → Program → Wave → Phase → Milestone → Task Group → Task → Subtask | Covers enterprise program management from board-level to developer-level |
| Numbering: Hierarchical with leading zeros | Enables infinite depth without renumbering |
| Metadata: 25-field standard template | Covers every dimension an enterprise needs for audit, compliance, risk, and execution |
| Checklist: 10-state lifecycle | Covers every state a task can occupy, including validation states |
| Phase checkpoints as gates | Prevents incomplete work from propagating |
| Rollback strategy mandatory | Enterprise systems cannot proceed without undo capability |

---

## PART 2: ENTERPRISE PLANNING HIERARCHY

```
ENTERPRISE VISION
    │
    ▼
ENTERPRISE PROGRAM          (The entire MeterVerse platform)
    │
    ├── Program Charter     (Vision, mission, scope, constraints)
    ├── Program Roadmap     (Wave timeline, dependencies, releases)
    │
    ▼
WAVE                        (Thematic delivery increment)
    │
    ├── Wave Vision         (Purpose, scope, deliverables, KPIs)
    ├── Wave Dependencies   (What must exist before this wave)
    ├── Wave Risks          (Known risks with mitigations)
    ├── Wave Exit Criteria  (Conditions for wave completion)
    │
    ▼
PHASE                       (Cross-cutting concern or capability)
    │
    ├── Phase Charter       (Problem statement, business value)
    ├── Phase Dependencies  (Which phases must precede)
    ├── Phase Checkpoints   (Intermediate validation points)
    │
    ▼
MILESTONE                   (Significant achievement with deliverables)
    │
    ├── Milestone Definition
    ├── Acceptance Criteria
    ├── Validation Method
    │
    ▼
TASK GROUP                  (Related tasks that form a coherent unit)
    │
    ├── Toggle: [P] Parallel | [S] Sequential
    ├── Group Objective
    │
    ▼
TASK                        (Single atomic unit of work)
    │
    ├── 25-field metadata template (see Part 3)
    │
    ▼
SUBTASK                     (If task decomposition is needed)
    │
    ├── 25-field metadata template (inherits parent, overrides specific fields)
```

### 2.1 Hierarchy Justification

| Level | Why Enterprise Needs It |
|-------|------------------------|
| **Vision** | Provides north star — without it, every decision lacks context |
| **Program** | Groups all waves under one governance umbrella — prevents fragmentation |
| **Wave** | Enables quarterly/seasonal delivery cycles — matches business rhythm |
| **Phase** | Groups cross-cutting concerns — prevents duplicate work across waves |
| **Milestone** | Creates accountability checkpoints — prevents 90% done syndrome |
| **Task Group** | Enables parallel execution — critical for team scalability |
| **Task** | Smallest estimable unit — enables accurate tracking |
| **Subtask** | Enables decomposition when tasks exceed 3 days |

---

## PART 3: ENTERPRISE TASK TEMPLATE

```
┌─────────────────────────────────────────────────────────────────────┐
│  TASK: MV-[WAVE]-[PHASE]-[GROUP]-[TASK]                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ## 1. IDENTIFICATION                                              │
│  - ID:            (unique, never reused)                           │
│  - Wave:          (01-99)                                          │
│  - Phase:         (e.g., 44a, 420)                                 │
│  - Task Group:    (e.g., TG01)                                     │
│  - Parent:        (if subtask, parent task ID)                     │
│  - Children:      (list of subtask IDs, if any)                    │
│  - Parallel:      [P] yes / [S] sequential                         │
│  - User Story:    [US1]/[US2]/[US3]/[SETUP]/[FOUNDATIONAL]/[POLISH]│
│  - Status:        (one of 10 checklist states below)               │
│  - Completion:    (0-100%)                                         │
│                                                                     │
│  ## 2. DESCRIPTION                                                 │
│  - Title:          (concise, action-oriented)                      │
│  - Objective:      (what this task achieves)                       │
│  - Business Value: (why this matters to the business)              │
│  - Technical Value:(why this matters to the architecture)          │
│                                                                     │
│  ## 3. DEPENDENCIES                                                │
│  - Prerequisites:  (task IDs that must be COMPLETE before start)   │
│  - Inputs:         (documents, artifacts, data needed)             │
│  - Blocked By:     (external dependencies outside project control) │
│                                                                     │
│  ## 4. SCOPE                                                       │
│  - Area/Files:     (directories, files affected)                   │
│  - Components:     (frontend, backend, database, API, runtime)     │
│  - Modules:        (auth, billing, meters, readings, etc.)         │
│  - In Scope:       (what IS included)                              │
│  - Out of Scope:   (what is NOT included — prevents scope creep)   │
│                                                                     │
│  ## 5. ACCEPTANCE                                                  │
│  - Acceptance Criteria: (conditions that prove completion)         │
│  - Validation Steps:    (commands, checks, tests to run)           │
│  - Testing Required:    (unit, API, Playwright, manual)            │
│                                                                     │
│  ## 6. QUALITY                                                     │
│  - Security Impact:     (none/low/medium/high/critical)            │
│  - Performance Impact:  (none/low/medium/high)                     │
│  - UX Impact:           (none/low/medium/high)                     │
│  - Accessibility Impact:(none/low/medium/high)                     │
│  - Localization Impact: (none/low/medium/high)                     │
│  - AI Impact:           (none/low/medium/high)                     │
│                                                                     │
│  ## 7. RISK & RECOVERY                                             │
│  - Risks:           (known risks with probability × impact)        │
│  - Assumptions:     (things we believe to be true)                 │
│  - Constraints:     (immutable boundaries)                         │
│  - Rollback Plan:   (how to undo this task if it fails)            │
│  - Fallback:        (alternative approach if primary fails)        │
│                                                                     │
│  ## 8. DELIVERABLES                                                │
│  - Outputs:         (code, documents, configurations produced)     │
│  - Documentation:   (what must be documented or updated)           │
│  - Evidence:        (logs, screenshots, test results)              │
│                                                                     │
│  ## 9. GOVERNANCE                                                  │
│  - Owner:           (person/team responsible)                      │
│  - Estimated Effort:(story points, hours, or sessions)             │
│  - Estimated Duration:(calendar time)                              │
│  - Priority:        (P0=critical, P1=high, P2=medium, P3=low)     │
│  - Enterprise Tags: (comma-separated keywords for traceability)    │
│                                                                     │
│  ## 10. FUTURE                                                     │
│  - Future Expansion: (how this task enables future capabilities)   │
│  - Notes:           (anything else relevant)                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.1 Numbering Standard

```
MV-01-420-TG01-T001
│  │   │    │    └── Task number (001-999)
│  │   │    └─────── Task Group (TG01-TG99)
│  │   └──────────── Phase (420, 42a, 43b, 44a, 45a, etc.)
│  └──────────────── Wave (01-99)
└─────────────────── MeterVerse prefix

Examples:
MV-01-420-TG01-T001  → Wave 01, Phase 420, Task Group 01, Task 001
MV-02-43b-TG01-T006  → Wave 02, Phase 43b, Task Group 01, Task 006 (Email Delivery)
MV-03-44a-TG01-T001  → Wave 03, Phase 44a, Task Group 01, Task 001 (Tariff CRUD)
```

### 3.2 Task States (10-State Checklist)

```
[ ]  NOT_STARTED         — Task created but no work begun
[→]  IN_PROGRESS         — Work actively being done
[!]  BLOCKED             — Cannot proceed; blocker documented
[∼]  WAITING             — Waiting on dependency or external input
[◷]  PARTIAL             — Partially complete; remaining work known
[✗]  VALIDATION_FAILED   — Failed acceptance criteria; needs fix
[✓]  VALIDATION_PASSED   — Acceptance criteria met
[?]  DOCUMENTATION_REQUIRED — Implementation done but docs incomplete
[◉]  READY_FOR_REVIEW    — Ready for peer/architecture review
[●]  READY_FOR_MERGE     — Review passed, ready for commit
[★]  COMPLETED           — Committed, pushed, evidence captured
```

---

## PART 4: ENTERPRISE CHECKLIST STANDARD

### 4.1 Universal Phase Checklist

```
PHASE CHECKPOINT: [PHASE NAME]
├── [ ] All tasks in this phase are COMPLETED or explicitly DEFERRED
├── [ ] No task in BLOCKED state without documented reason
├── [ ] All acceptance criteria met for every task
├── [ ] All validation steps executed and passed
├── [ ] All test suites pass (unit, API, Playwright)
├── [ ] Build passes (backend + frontend)
├── [ ] TypeScript passes (zero errors)
├── [ ] Lint passes (zero warnings)
├── [ ] Security scan passed (npm audit, no criticals)
├── [ ] All new code has test coverage
├── [ ] All new API endpoints have tests
├── [ ] Documentation updated (at minimum: README, API docs)
├── [ ] Knowledge Base updated if new domain knowledge
├── [ ] Dependency Heat Map updated
├── [ ] Decision Log updated with any new decisions
├── [ ] Technical Debt Register updated
├── [ ] Risk Register updated
├── [ ] Evidence directory populated
├── [ ] Phase audit completed (T99 or equivalent)
├── [ ] Exit gate signed off
```

### 4.2 Universal Wave Checklist

```
WAVE EXIT CRITERIA: [WAVE NAME]
├── [ ] All phases COMPLETED or explicitly EXCLUDED
├── [ ] Full regression test suite passes
├── [ ] End-to-end workflows verified
├── [ ] Executive Dashboard updated
├── [ ] Capability Roadmap updated
├── [ ] Feature Lifecycle updated
├── [ ] Enterprise Metrics recalculated
├── [ ] Lessons learned documented
├── [ ] All risks updated in Risk Register
├── [ ] Release readiness confirmed
├── [ ] Stakeholder sign-off obtained
```

---

## PART 5: ENTERPRISE VALIDATION STRUCTURE

### 5.1 Validation Levels

```
Level 0 — Self Validation     (developer runs tests locally)
Level 1 — Peer Validation     (another engineer reviews code)
Level 2 — Integration Validation (all tests pass together)
Level 3 — Architecture Validation (Graphiti comparison)
Level 4 — Security Validation (permission + audit scan)
Level 5 — Performance Validation (load test, pagination caps)
Level 6 — Business Validation (acceptance criteria met)
Level 7 — Governance Validation (all docs updated, status files correct)
Level 8 — Enterprise Validation (SUPERLOOP audit, 21 dimensions)
```

### 5.2 Validation Required Per Task Type

| Task Type | Required Validation Levels |
|-----------|:--------------------------:|
| Database (schema, migration) | 0, 1, 2, 3, 5, 8 |
| Backend (API, service) | 0, 1, 2, 3, 4, 5, 8 |
| Frontend (page, component) | 0, 1, 2, 3, 6, 8 |
| Security (auth, permission) | 0, 1, 2, 3, 4, 7, 8 |
| Performance (optimization) | 0, 1, 2, 5, 8 |
| Documentation (planning) | 1, 3, 7, 8 |
| Testing (test file) | 0, 1, 2, 3 |

---

## PART 6: ENTERPRISE GOVERNANCE STRUCTURE

### 6.1 Governance Gates

```
Gate 0 — Task Acceptance      (task definition approved)
Gate 1 — Readiness             (dependencies met, inputs ready)
Gate 2 — Implementation        (code written, builds pass)
Gate 3 — Self Validation       (tests pass locally)
Gate 4 — Peer Review           (code reviewed, issues resolved)
Gate 5 — Integration           (all tests pass together)
Gate 6 — Documentation         (all docs updated)
Gate 7 — Audit                 (SUPERLOOP audit passed)
Gate 8 — Commit                (committed + pushed)
Gate 9 — Phase Gate            (phase checkpoint passed)
Gate 10 — Wave Gate            (wave exit criteria met)
```

### 6.2 Ownership Matrix

| Artifact | Owner |
|----------|-------|
| Task Definition | PMO Lead |
| Architecture Decision | Enterprise Architect |
| Code Implementation | Development Team |
| Test Coverage | QA Lead |
| Documentation | Documentation Engineer |
| Security Review | Security Lead |
| Performance Review | Performance Lead |
| Governance Review | PMO Lead |
| Enterprise Audit | Enterprise Architect |

---

## PART 7: ENTERPRISE DOCUMENTATION STRUCTURE

### 7.1 Documentation Lifecycle

```
Task Created     → Skeleton documentation (ID, title, objective)
Task In Progress → Implementation notes, design decisions
Task Complete    → Full documentation, evidence captured
Phase Complete   → Consolidated phase documentation
Wave Complete    → Lessons learned, architecture updates
Program Complete → Enterprise knowledge base updated
```

### 7.2 Required Documentation Per Task

| Document Type | Required For |
|---------------|:------------:|
| Implementation notes | Every task |
| API documentation | Every API endpoint |
| Test evidence | Every testable task |
| Screenshots | Every UI change |
| Architecture impact | Every cross-cutting change |
| Security impact | Every auth/permission change |
| Performance impact | Every query/endpoint change |
| Knowledge Base update | Every new domain concept |

---

## PART 8: ENTERPRISE COMPLETION STRUCTURE

### 8.1 Completion Definition

A task is COMPLETED only when ALL of the following are true:

```
[★] All checkboxes in the task definition are checked
[★] All acceptance criteria met
[★] All validation levels passed (per task type)
[★] All governance gates passed
[★] Evidence captured and stored
[★] Documentation updated
[★] Code committed and pushed
[★] Status file updated to COMPLETED
[★] Parent task group notified
```

### 8.2 Completion Percentage Rules

| State | % | Rule |
|-------|:-:|------|
| NOT_STARTED | 0% | No work begun |
| IN_PROGRESS | 10-80% | Proportional to subtasks completed |
| BLOCKED | N/A | Percentage frozen until unblocked |
| PARTIAL | Calculated | Explicit remaining work known |
| VALIDATION_FAILED | Rollback | Percentage regresses to last verified state |
| READY_FOR_REVIEW | 90% | Implementation done, awaiting review |
| COMPLETED | 100% | All gates passed |

---

## PART 9: ENTERPRISE METADATA STANDARD

### 9.1 Mandatory Metadata Fields

Every planning artifact (Wave, Phase, Milestone, Task Group, Task) must carry:

```
id:              (unique identifier)
type:            (wave/phase/milestone/task_group/task/subtask)
status:          (from 10-state checklist)
completion:      (0-100%)
created:         (ISO date)
updated:         (ISO date)
owner:           (person/team)
priority:        (P0-P3)
tags:            (enterprise classification tags)
```

### 9.2 Enterprise Classification Tags

```
Domain:     customer | meter | reading | billing | payment | finance |
            tariff | organization | user | notification | ai | workflow |
            reports | security | settings | integration | infrastructure
Layer:      frontend | backend | database | api | runtime | testing |
            documentation | planning | deployment
Type:       feature | fix | refactor | performance | security |
            testing | documentation | planning | governance
Urgency:    critical | high | medium | low
Location:   wave-01 | wave-02 | wave-03 | wave-04 | wave-05 | wave-06
```

---

## PART 10: COMPARISON — old_tasks.md vs METERVERSE_UNIFIED_PLAN.md vs NEW FORMULA

| Dimension | old_tasks.md | Unified Plan v2 | New Formula v4.0 |
|-----------|:------------:|:---------------:|:-----------------:|
| Hierarchy | 7 levels | 3 levels | **8 levels** |
| Task metadata | 8 fields | 3-5 fields | **25 fields** |
| Checklist states | 2 (done/not) | 3-4 visual states | **11 states** |
| Parallel markers | [P] tag | None | **[P]/[S] toggle** |
| Rollback strategy | None | None | **Mandatory** |
| Numbering standard | T001-T216 | None | **MV-01-420-TG01-T001** |
| Enterprise tags | None | None | **3-axis tagging** |
| Validation levels | 1-2 | 1-2 | **9 levels** |
| Governance gates | 0 | 0 | **11 gates** |
| Phase checkpoints | ✅ | ✅ | **✅ + 20-item checklist** |
| Wave exit criteria | None | None | **✅ + 11-item checklist** |
| Documentation lifecycle | None | None | **5-stage lifecycle** |

---

## PART 11: IMPLEMENTATION ROADMAP FOR THIS PLANNING SYSTEM

| Step | Action | Effort |
|:----:|--------|:------:|
| 1 | Ratify this document as Planning OS v4.0.0 | 1 session |
| 2 | Create enterprise task template as standalone file | 1 session |
| 3 | Convert all existing tasks to new template format | 3-5 sessions |
| 4 | Implement validation level scripts | 2 sessions |
| 5 | Implement governance gate automation | 2 sessions |
| 6 | Train team on new planning methodology | 1 session |
| 7 | Migrate METERVERSE_UNIFIED_PLAN.md to new format | 2 sessions |
| 8 | Freeze Planning OS v4.0.0 | 1 session |

---

*Enterprise Planning Formula v4.0.0*
*Status: PROPOSED — pending Enterprise Architect ratification*
*Generated: 2026-07-24*
