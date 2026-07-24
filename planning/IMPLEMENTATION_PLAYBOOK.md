# Enterprise Implementation Playbook

**Purpose:** The instruction manual for how an AI engineer executes work.  
**Scope:** Every Phase, Task, and Step — never skip a stage.  
**Status:** MANDATORY — all AI agents must follow this sequence exactly.

---

## The Lifecycle

```
READ
  ↓
UNDERSTAND
  ↓
VERIFY
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
SELF REVIEW
  ↓
TEST
  ↓
COMPARE
  ↓
EVIDENCE
  ↓
FIX
  ↓
RETEST
  ↓
COMMIT
  ↓
UPDATE PLANNING
  ↓
NEXT STEP
```

Every Phase, Task, and Step follows this exact sequence.  
Never skip a stage. Never reorder.

---

## Stage 1 — READ

Before touching code, the AI must read these documents **in order**:

| Order | Document | Location |
|:-----:|----------|----------|
| 1 | AI Execution Contract | `000_ENTERPRISE_PROGRAM/AI_EXECUTION_CONTRACT.md` |
| 2 | Enterprise Program Overview | `000_ENTERPRISE_PROGRAM/` |
| 3 | Master Control | `000_ENTERPRISE_PROGRAM/MASTER_CONTROL/` |
| 4 | Current Wave | `001_WAVES/{CURRENT_WAVE}/` |
| 5 | Current Phase | `001_WAVES/{CURRENT_WAVE}/{CURRENT_PHASE}/` |
| 6 | Current Task | `001_WAVES/{CURRENT_WAVE}/{CURRENT_PHASE}/{CURRENT_TASK}/` |
| 7 | Current Step | Inside current task directory |
| 8 | All STATUS files | STEP_STATUS, TASK_STATUS, PHASE_STATUS, Wave Status, Master Status |
| 9 | Knowledge Base | `000_ENTERPRISE_PROGRAM/31_ENTERPRISE_KNOWLEDGE_BASE/` |
| 10 | Ultimate Audit Framework | `000_ENTERPRISE_PROGRAM/ULTIMATE_AUDIT_FRAMEWORK.md` |
| 11 | Definition of Done | `000_ENTERPRISE_PROGRAM/39_Definition_of_Done/DEFINITION_OF_DONE.md` |
| 12 | Dependency Heat Map | `000_ENTERPRISE_PROGRAM/34_Dependency_Heat_Map/DEPENDENCY_HEAT_MAP.md` |
| 13 | Domain Map (relevant domains) | `000_ENTERPRISE_PROGRAM/37_Domain_Map/DOMAIN_MAP.md` |
| 14 | Runtime Inventory (relevant engines) | `000_ENTERPRISE_PROGRAM/36_Runtime_Inventory/RUNTIME_INVENTORY.md` |
| 15 | Technical Ownership | `000_ENTERPRISE_PROGRAM/35_Technical_Ownership/TECHNICAL_OWNERSHIP.md` |
| 16 | Architecture Overview | `docs/architecture.md` (or equivalent) |
| 17 | Graphiti diagrams | `graphify-out/` |
| 18 | SpecKit documents | `speckit/` or equivalent |
| 19 | AGENTS.md | Project root |
| 20 | VERSION | `planning/VERSION` |

**Only after ALL required documents have been read may implementation begin.**

### Tool Activation (before any implementation)
1. Read `configs/tools-manifest.md` — full tool inventory
2. Declare `🧰 Tools activated: [tool1, tool2, ...]` as FIRST output line
3. If a needed tool is missing: install it immediately (npm install, pip install, npx)
4. Log all tool usage to `configs/tool-usage-log.json` after task completion
5. After task: self-improvement check — could a different/better tool have helped?
6. If yes: acquire the tool, update manifest, document in LEARNING_ENGINE/

---

## Stage 2 — UNDERSTAND

The AI **must** answer internally (or in writing):

### Why
- Why does this task exist?
- Which business problem does it solve?

### Who
- Who uses this feature?
- Who is the business owner? (see Technical Ownership)

### What
- Which systems are affected?
- Which database tables? (see Domain Map)
- Which APIs?
- Which frontend pages?
- Which runtime services? (see Runtime Inventory)
- Which permissions? (see Domain Map)
- Which reports?
- Which dashboards?
- Which notifications?
- Which documentation?

### Dependencies
- Which future waves depend on this? (see Capability Roadmap)
- What is the dependency heat level? (see Dependency Heat Map)

### If any answer is missing → STOP
Do not proceed. The missing answer must be resolved first.

---

## Stage 3 — VERIFY

Before coding, verify architecture alignment:

```
1. Read expected architecture from planning docs
2. Read actual architecture from codebase
3. Compare expected vs actual
4. Document any differences found
```

### If architecture differs → STOP
Update planning first. Never code first.

### If Graphiti mismatch → STOP
Run Graphiti sync. Update diagrams. Then proceed.

### If SpecKit mismatch → STOP
Update SpecKit documents. Then proceed.

---

## Stage 4 — PLAN

Break the task into sub-plans:

| Area | Check |
|------|-------|
| Frontend | Components, pages, state, routing |
| Backend | Routes, services, middleware, validation |
| Database | Models, migrations, indexes, seeds |
| API | Endpoints, request/response shapes, errors |
| Runtime | Engine changes, event hooks |
| AI | Knowledge updates, predictions |
| Security | Permissions, auth, audit |
| Performance | N+1 queries, indexing, caching |
| Testing | Unit, API, Playwright, integration |
| Deployment | Environment variables, config |
| Documentation | Domain Map, Feature Lifecycle, Knowledge Base |

**No implementation yet.** Only planning.
Document the plan before coding.

---

## Stage 5 — IMPLEMENT

**Rules:**
- Only implement the current Step
- Never implement future Steps
- Never implement another Task
- Never implement another Phase
- Never implement another Wave
- Never refactor outside scope
- Never guess — if unsure, STOP and read more

### Implementation Priority
1. Database (models, migrations)
2. Backend (services, routes, middleware)
3. API contracts (request/response)
4. Permissions
5. Frontend (components, pages)
6. Runtime (engines, events)
7. Tests
8. Documentation

---

## Stage 6 — SELF REVIEW

After implementation, ask:

### Scope
- Did I follow the plan?
- Did I change something outside scope?

### Quality
- Did I break architecture?
- Did I duplicate existing code?
- Did I introduce technical debt?
- Did I violate coding standards?

### Correctness
- Are all edge cases handled?
- Are error states handled?
- Are loading states handled?
- Are empty states handled?

### Security
- Did I validate all inputs?
- Did I check permissions?
- Did I sanitize outputs?
- Did I expose secrets?

### If ANY answer is unsatisfactory → FIX before proceeding.

---

## Stage 7 — TEST

Run these tests in order:

| # | Test | Command |
|:-:|------|---------|
| 1 | TypeScript | `npx tsc --noEmit` |
| 2 | Lint | `npm run lint` |
| 3 | Build (frontend) | `npm run build` |
| 4 | Build (backend) | `npm run dev` (at least starts) |
| 5 | Runtime | Manual smoke test |
| 6 | API | Existing + new endpoints |
| 7 | Database | Migrations, seeds |
| 8 | Frontend | Render test |
| 9 | Permissions | Authorized + unauthorized |
| 10 | Business Rules | Core logic validation |
| 11 | Regression | Existing tests still pass |
| 12 | Playwright | If applicable |
| 13 | Graphiti Validation | Architecture still matches |
| 14 | SpecKit Validation | Docs still match |

### If ANY test fails → STOP → Go to Stage 10 (FIX)

---

## Stage 8 — COMPARE

```
Expected (from planning)
  vs
Actual (from codebase)
```

Compare everything:

| Dimension | Check |
|-----------|-------|
| Pages | Do the pages match the plan? |
| APIs | Do the endpoints match the contract? |
| Components | Do the components match the spec? |
| Database | Do the models match the schema design? |
| Permissions | Are the required permission keys present? |
| Routes | Are all planned routes implemented? |
| Runtime | Did engines change as expected? |
| Graphs | Does Graphiti still reflect reality? |
| Planning | Does planning still match code? |

### If differences found → STOP → Update planning or fix code.

---

## Stage 9 — EVIDENCE

Nothing is complete without evidence. Capture:

| Type | Examples |
|------|----------|
| Build logs | `npm run build` output |
| Console output | API responses, server logs |
| API responses | Curl/Postman results |
| Database records | SQL query results |
| Screenshots | UI before/after |
| Playwright logs | Test results |
| Performance | Load test results |
| Coverage | Code coverage report |
| Git diff | `git diff --stat` |

### Evidence Storage
- Evidence files go in task's `_evidence/` directory
- Screenshots go in `docs/screenshots/{phase}-{task}/`
- Naming: `{step-number}-{description}.{ext}`

---

## Stage 10 — FIX

### If something failed:
1. Identify the root cause
2. Fix the issue
3. Return to Stage 7 (RETEST)
4. Repeat until all tests pass

### Never:
- Continue while failures exist
- Comment out failing tests
- Ignore warnings
- Bypass type checks with `@ts-ignore`

---

## Stage 11 — COMMIT

### Pre-commit checklist:
- [ ] Only intended files changed
- [ ] Planning updated
- [ ] Status files updated
- [ ] Evidence stored
- [ ] Documentation updated
- [ ] No temporary files
- [ ] No debug code (console.log, TODO, FIXME)
- [ ] No secrets or credentials
- [ ] No commented-out code
- [ ] Commit message follows convention

### Commit message format:
```
{type}: {short description}

{optional body with details}

Related: {task-id}
```

### After commit:
- Verify push succeeds
- Verify GitHub commit appears

---

## Stage 12 — UPDATE PLANNING

### Every completed Step updates:
- `STEP_STATUS.yaml` — mark current step COMPLETE
- `TASK_STATUS.yaml` — update step count
- `PHASE_STATUS.yaml` — if all tasks done
- Wave Status — if all phases done
- Master Status — if all waves done

### Additionally, if relevant:
- Decision Log — new decisions made during implementation
- Technical Debt Register — any debt introduced
- Risk Register — any risks discovered
- Evidence folder — commit evidence files

### Verification:
After every status update, immediately re-read the file and assert the expected value.
```powershell
# Example verification
$actual = (Select-String -Path $path -Pattern "status:" | Select-Object -First 1).Line
if ($actual -notmatch "COMPLETE") { throw "UPDATE FAILED" }
```

**Planning must always be synchronized with code.**

---

## Stage 13 — READINESS GATE

Before starting the next Step, answer:

| Question | Answer |
|----------|--------|
| Current Step Complete? | YES/NO |
| Current Task Complete? | YES/NO |
| Current Phase still valid? | YES/NO |
| Dependencies satisfied? | YES/NO (see Dependency Heat Map) |
| No open blockers? | YES/NO |
| Architecture unchanged? | YES/NO |
| Planning synchronized? | YES/NO |
| Evidence complete? | YES/NO |

**If ANY answer is NO → STOP**
Do not proceed to the next step until resolved.

---

## Enterprise Checkpoints

### Every Step
- [ ] Build passes
- [ ] Runtime passes
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Evidence exists
- [ ] Status updated

### Every Task
- [ ] All Steps complete
- [ ] Business workflow verified
- [ ] APIs verified
- [ ] Frontend verified
- [ ] Database verified
- [ ] Definition of Done checklist complete

### Every Phase
- [ ] All Tasks complete
- [ ] Graphiti comparison passed
- [ ] SpecKit validation passed
- [ ] Ultimate Audit Framework applied
- [ ] T99 phase audit completed
- [ ] Architecture review passed
- [ ] Technical debt review
- [ ] Performance review
- [ ] Security review

### Every Wave
- [ ] All Phases complete
- [ ] Regression passed
- [ ] End-to-end workflows passed
- [ ] Executive dashboard updated
- [ ] Capability roadmap updated
- [ ] Feature lifecycle updated
- [ ] Release readiness
- [ ] Lessons learned documented
- [ ] Risks updated in Risk Register

---

## Global Stop Conditions

**The AI must immediately STOP all work if any condition is met:**

| Condition | Reason |
|-----------|--------|
| Planning contradicts implementation | Architecture drift — fix planning first |
| Graphiti mismatch | Knowledge graph is stale |
| SpecKit mismatch | Documentation is stale |
| Missing dependency | Cannot proceed safely |
| Architecture uncertainty | Do not guess |
| Business rule ambiguity | Do not guess |
| Permission uncertainty | Could create security hole |
| Database uncertainty | Could corrupt data |
| API uncertainty | Could break contracts |
| Test failures | Bug exists |
| Build failures | Code is broken |
| Runtime failures | System is unstable |

### When stopped:
1. Document the blocker
2. Update Risk Register if applicable
3. Notify with exact details of what was found

### Only resume when:
- The blocker is resolved
- Planning is updated
- The path forward is clear

**No guessing. No assumptions. No shortcuts.**

---

## Definition of Done

Nothing is Done until:

| Check | Verified By |
|-------|-------------|
| Planning says Done | STATUS files all COMPLETE |
| Code says Done | Implementation complete per spec |
| Tests say Done | All tests pass |
| Evidence says Done | Evidence files exist |
| Graphiti says Done | Architecture matches |
| SpecKit says Done | Documentation matches |
| Audit says Done | Ultimate Audit Framework passed |
| Git says Done | Committed and pushed |

**Only then may the AI proceed to the next step.**

---

*This playbook is part of Planning OS v2.1 (Enterprise Baseline).*  
*Version: 1.0 | Last updated: 2026-07-23*  
*Location: planning/IMPLEMENTATION_PLAYBOOK.md*
