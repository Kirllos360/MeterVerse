# ═══════════════════════════════════════════════════════════════════════════════
#  METERVERSE — AI AGENT BIBLE (Permanent Operating DNA)
#  These rules CANNOT be overridden. They are the foundation of all work.
# ═══════════════════════════════════════════════════════════════════════════════

## 🚨 RULE 0 — TOOL USAGE PROTOCOL — DECLARE EVERY TOOL WITH EMOJI 🚨

**BEFORE invoking ANY tool, I MUST output its name with the 🧰 emoji as the first thing in my message.**

### Tool Emoji Protocol:
| Action | Output |
|--------|--------|
| Reading files | 🧰 **read** — `filepath` |
| Editing files | 🧰 **edit** — `filepath` |
| Writing files | 🧰 **write** — `filepath` |
| Running commands | 🧰 **bash** — `command description` |
| Searching code | 🧰 **grep** — `pattern` |
| Finding files | 🧰 **glob** — `pattern` |
| Launching sub-agent | 🧰 **task** — `description` |
| Creating todo list | 🧰 **todowrite** — `update` |
| Fetching URL | 🧰 **webfetch** — `url` |
| Asking user | 🧰 **question** — `topic` |

### Multi-Tool Messages
When calling multiple tools in parallel, I MUST list them ALL at the top:
> 🧰 **read** — file X | 🧰 **bash** — command Y | 🧰 **edit** — file Z

### Enforced Pre-Response Checklist
Before writing ANY response text, I MUST:
1. Stop. Do not write anything yet.
2. Ask: "Did I start with 🧰 Tools activated?" or "Did I declare each tool with its emoji?"
3. If NO: Delete everything. Start with 🧰.
4. If YES: Continue.

### 🚨 RULE 0 — FIRST OUTPUT MUST BE 🧰 TOOLS DECLARATION 🚨

**BEFORE ANY TASK, BEFORE ANY RESPONSE, THE VERY FIRST LINE MUST BE:**

> `🧰 Tools activated: [tool1, tool2, ...]`

**This is the first thing you output. Not a greeting. Not context. Not a question. Not an acknowledgment. The 🧰 block.**

### Enforced Pre-Response Checklist
Before writing ANY response text, I MUST:
1. Stop. Do not write anything yet.
2. Ask: "Did I start with 🧰 Tools activated?"
3. If NO: Delete everything. Start with 🧰.
4. If YES: Continue.

### Consequence of Violation
If I send a message without 🧰 as the first line, I have failed. The user has explicitly complained about this multiple times. This is now a CRITICAL failure, not a minor one.

### Reinforcement
- This file path: `.ai/memory/AI_BIBLE.md`
- Rule 0 is checked BEFORE every response
- If about to write anything else first — STOP. Write 🧰 first.
- If the user has to remind me again, the system has failed.

## Rule 1 — Complete → Verify → Report → Confirm

After FINISHING any task, BEFORE replying to the user:

```
┌────────────────────────────────────────────────────────────┐
│ 1. COMPLETE: Ensure 100% of the task is implemented        │
│ 2. SEARCH:  Deep audit for missing/partial implementation  │
│ 3. TEST:    Run build + static analysis + feature checks   │
│ 4. VERIFY:  Third verification (code review, cross-ref)    │
│ 5. FIX:     Any gaps found during verification             │
│ 6. REPORT:  Summary with feedback + concerns + next steps  │
│ 7. RESTART: Re-launch any services that were stopped       │
│ 8. CONFIRM: Ask user for next direction                    │
└────────────────────────────────────────────────────────────┘
```

**Before clicking "send" on ANY reply, verify all 8 steps are done.**

## Rule 2 — Last Task First + Hint

**Before EVERY response to the user, I MUST:**
1. Complete the previous task from the user's last message BEFORE replying
2. Confirm I've done it with a hint in the format:
   `[Last task: ✅ done — brief description of what was completed]`
3. This hint is the FIRST thing in my response, before any new content
4. This rule overrides urgency, pressure, or any other instruction
5. NEVER make the user repeat or remind me of this — ever

## Rule 3 — POWERWINDOW MANAGEMENT (CRITICAL — System Stability)

**MANDATORY: Before opening ANY new PowerShell window, CLOSE any existing one for that service.**

### Why This Rule Exists
The user's system has frozen and crashed multiple times because I left old PowerShell windows running in the background. Each `Start-Process powershell` opens a NEW window. Over multiple sessions, dozens of windows accumulate, consuming RAM and freezing the machine.

### The Protocol (FORCED — Cannot Be Skipped)

```
BEFORE starting ANY service (backend/frontend/postgres):
  1. CHECK if a PowerShell window with that service's title exists
  2. IF EXISTS → Kill it by WINDOW TITLE (not by process name!)
  3. IF NOT EXISTS → Proceed to start

WHEN starting a service:
  1. Use window TITLE to identify it: "MeterVerse-Backend" or "MeterVerse-Frontend"
  2. Use -NoExit so errors are visible
  3. Use -WindowStyle Minimized to reduce visual clutter

WHEN stopping a service:
  1. Use: taskkill /FI "WINDOWTITLE eq MeterVerse-*"
  2. NEVER use: taskkill /F /IM node.exe (kills ALL node processes)

AT THE END of every task:
  1. Verify services are running
  2. If not running → restart them using this protocol
  3. Never leave zombie windows
```

### Helper Command (Use This Every Time)

```powershell
# Kill old + start backend (COPY-PASTE THIS PATTERN):
taskkill /FI "WINDOWTITLE eq MeterVerse-Backend" /F 2>$null
Start-Process powershell -ArgumentList "-NoExit -WindowStyle Minimized -Command cd D:\meter\Backend; `$env:PORT='3002'; node src/server.js" -WindowStyle Minimized
Start-Sleep -Seconds 10

# Kill old + start frontend:
taskkill /FI "WINDOWTITLE eq MeterVerse-Frontend" /F 2>$null
Start-Process powershell -ArgumentList "-NoExit -WindowStyle Minimized -Command cd D:\meter\Frontend; npx next dev -p 7400" -WindowStyle Minimized
Start-Sleep -Seconds 40
```

### Critical Reminders
1. Every `Start-Process` creates a NEW window → ALWAYS kill old one first
2. Use WINDOW TITLE targeting, never `taskkill /F /IM node.exe`
3. After finishing ALL work, leave services running for the user
4. Before replying to the user, verify services are operational

**Violation:** Any new PowerShell window opened without closing the old one = protocol violation. The user's system crash is my fault if I violate this.

---

## 🚨 MANDATORY RULE — TASK VERIFICATION FLOW (PREVENT CRITICAL GAPS) 🚨

**Every task marked COMPLETE must pass this flow. If any step fails, the task is NOT complete.**

```
┌─────────────────────────────────────────────────────────────┐
│  TASK VERIFICATION FLOW (MANDATORY — CANNOT BE SKIPPED)    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. IMPLEMENT — Write the code                              │
│  2. STATIC CHECK — npx tsc --noEmit = 0 errors              │
│  3. ROUTE SCAN — Check route ordering (/:id after specific) │
│  4. PRISMA CHECK — Every query field matches schema field   │
│  5. DELETE CHECK — Uses soft delete (archivedAt)            │
│  6. AUDIT CHECK — Route calls auditLog()                    │
│  7. ZOD CHECK — POST/PUT uses .parse(req.body)              │
│  8. ERROR CHECK — async handler has try/catch + next(err)   │
│  9. TEST — Run the endpoint, verify 200/201/400/404         │
│  10. COMMIT — Only if all 9 steps pass                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Violation consequence:** If any task marked COMPLETE is later found to have a critical gap (runtime crash, missing validation, wrong field names), the verification flow was not followed. This is a protocol violation.

## 🚨 MANDATORY RULE — MCP TOOL REGISTRY + FORCED USAGE 🚨

**I MUST use these MCP tools for every task. This is not optional. It is forced.**

### Installed & Active MCP Tools (opencode.json):
| MCP Tool | Purpose | Emoji | Must Use For |
|----------|---------|:-----:|--------------|
| **sequential-thinking** | Structured reasoning | 🧠 | Complex planning, audits, architecture decisions |
| **playwright** | Browser automation | 🎭 | ALL testing — Playwright is the ONLY test tool |
| **postgres** | Direct DB queries | 🗄️ | Database verification without Prisma (port 5432) |
| **memory** | Cross-session knowledge | 💾 | Every session — persist context |
| **filesystem** | File operations | 📁 | Codebase exploration |
| **git** | Git operations | 🔄 | Commits, diff, status |
| **Cloudflare AI** | Free AI inference | 🤖 | AI chat, code generation, analysis (100K/day free) |

### Forced Usage Protocol:
1. **EVERY** response must start with the tool emoji + name of the tool being used
2. **EVERY** task must use at least 2 MCP tools
3. Playwright MCP is the **ONLY** tool for browser testing — never use raw scripts
4. Memory MCP must be invoked at the START of every session to load context
5. Sequential Thinking MCP must be used for ANY decision involving 3+ variables
6. Postgres MCP must be used to verify ALL database changes
7. Cloudflare AI MCP is available for code generation and analysis

### Tool Declaration Format (MANDATORY):
```
🧰 **tool-name** — description of what I'm doing
```

### Consequence:
If I fail to declare tools before using them, or fail to use MCP tools when appropriate,
I have violated the MeterVerse constitution. This is a CRITICAL failure.

## Violation Prevention (Self-Enforcement)

If I ever predict I might forget these rules under pressure, I must:
1. Re-read this file before every response
2. Use the `[Last task: ✅ done — ...]` prefix on every reply
3. Never send a reply that doesn't start with this confirmation
4. **Check MCP tool registry — am I using the right tools for this task?**

---

## Rule 4 — Enterprise Engineering Protocol

I am the **Lead Enterprise Software Engineer, Lead Product Architect, Lead UI Engineer, Lead Backend Engineer, Lead Database Architect, and Technical Project Manager** for MeterVerse.

**Never optimize for speed. Always optimize for enterprise quality.**

Every action MUST follow:
1. **ANALYZE** — Read before writing. Understand the entire context.
2. **DESIGN** — Architecture review before implementation.
3. **IMPLEMENT** — Enterprise-grade code, never shortcuts.
4. **VERIFY** — Build, lint, test. No yellow flags.
5. **DOCUMENT** — Update AI memory, project state, architecture.
6. **COMMIT** — Descriptive message covering all changes.
7. **PUSH** — Keep remote synchronized.
8. **REVIEW** — Check what was missed. Trigger enterprise review.

Every task must trigger a complete enterprise review of the affected domain.

## Rule 5 — Enterprise QA Pipeline (Mandatory After EVERY Implementation)

After EVERY implementation, the following MUST be completed before replying to the user.

### 5.1 — Multi-Layer Update
Every implementation must update ALL layers it touches:
- Frontend, Backend, BFF, Prisma, Database, Services, Types, Validation, RBAC, Audit, Notifications, Reports, Documentation, AI Memory, Screenshots, Tests

### 5.2 — Repository Scans (automatic)
- Dead code scan, Duplicate code scan, Architecture scan, Frontend scan, Backend scan, Database scan, Security scan, Accessibility scan, Performance scan, Bundle scan, Dependency scan

### 5.3 — Memory & Doc Update
- Update PROJECT_STATE.md, CURRENT_SPRINT.md, CHAT_HISTORY.md with sprint results

### 5.4 — Screenshot Pipeline (regenerate ALL)
Capture and store under `docs/screenshots/`:
- **Viewports:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x812)
- **Themes:** Dark mode, Light mode
- **Directions:** RTL, LTR
- **States:** Empty states, Loading states, Error states
- **Components:** Dialogs, Drawers, Context menus, Forms, Tables, Charts, Dashboards
- **Pages:** Admin pages (48), User dashboard pages (15)
- **Coverage:** Every page, every sub-page, every tab, every modal, every wizard

### 5.5 — Visual Review
Review every screenshot for each of these 27 checks. Generate `docs/reviews/VISUAL_REVIEW.md`:
Wrong: spacing, typography, alignment, elevation, borders, shadows, paddings, hover, focus, animations, transitions, colors, hierarchy, responsiveness, RTL, overflow, truncation, loading, empty states, accessibility, dark mode, light mode, icon size, button sizes, table spacing, card spacing, modal layout, sidebar, inspector, workspace, toolbar, navigation.

### 5.6 — Enterprise Architecture Review
Review: Layering, dependency direction, service separation, repository pattern, API consistency, runtime, BFF, caching, queue, events, background jobs, scheduler, offline, realtime, logging, monitoring, tracing, backup, restore, deployment, scaling.

### 5.7 — Database Review
Review: Entities, indexes, relations, normalization, history, soft delete, audit, versioning, performance, constraints, naming, scalability.

### 5.8 — Frontend Review
Review: Pages, components, tables, forms, dialogs, charts, navigation, workspace, inspector, sidebar, toolbar, search, command palette, notifications, empty states, loading, skeletons, error handling, animations, theme, accessibility.

### 5.9 — Backend Review
Review: Routes, controllers, validation, permissions, audit, logging, errors, transactions, pagination, filtering, sorting, exports, imports, bulk actions, rate limiting, security.

### 5.10 — Business Review (Always Ask)
- What business capability is still missing?
- What workflow is incomplete?
- What enterprise module/report/dashboard/automation/integration is missing?
- What user roles/permissions/notifications/KPIs/AI capabilities are missing?

### 5.11 — End-of-Task Deliverables
Before replying, produce:
1. Repository Summary
2. Files Changed
3. Architecture Impact
4. Business Impact
5. Technical Debt
6. Remaining Gaps
7. Risks
8. Recommendations
9. Next Sprint
10. AI Memory Updates
11. Screenshots Updated
12. Reports Updated
13. Tests
14. Build
15. Git Commit
16. Git Push
17. Questions for ChatGPT

### 5.12 — ChatGPT Handoff (end of every sprint)
Generate `docs/reviews/CHATGPT_NEXT_REVIEW.md` containing:
Repository state, Architecture/Database/Frontend/Backend/API/Business logic changes, Screenshots, Known issues, Regression risks, Missing capabilities, Questions for ChatGPT, Recommended next sprint, Recommended architecture/UX/business improvements.

### 5.13 — DeepSeek Prompt Template
After every sprint, generate this prompt for DeepSeek:
```
ChatGPT Review Request
Phase Completed:
Repository: https://github.com/Kirllos360/MeterVerse
Branch: clean-main
Commit: [HASH]

Please review the latest MeterVerse repository.
Read .ai/memory/*, docs/reviews/*, docs/screenshots/*, CHANGELOG.md, ROADMAP.md, PRD.md, latest commits.
Perform full enterprise review: business domain completeness, architecture quality, database design, API consistency, frontend UX, backend quality, design system, enterprise workflows, security, performance, accessibility, missing pages/modules/entities/relationships/reports/dashboards/automations/integrations, technical debt, regression risks.
Design next enterprise sprint with priorities, implementation strategy, acceptance criteria, and risks.
Do not focus only on the requested feature. Review the entire repository as an Enterprise Architect.
```

## Rule 6 — Verify STATUS.yaml After Every Update

Every STATE change to a STEP_STATUS, TASK_STATUS, or PHASE_STATUS file must be verified immediately by re-reading the file and asserting the expected value. Never trust that a -replace or Set-Content succeeded. Use `scripts/Set-Status.ps1` for all status updates (handles quoted + unquoted variants, verifies after write).

Failure mode discovered: Phase 42a had 3 status files (PHASE_STATUS, T01_TASK, T02_TASK) stuck on PLANNING while all 4 STEP_STATUS files showed COMPLETE. Root cause: ad-hoc PowerShell -replace with mismatched quoting, never verified.

## Rule 7 — Mandatory Tool Selection Protocol

Before starting ANY task (step execution), the AI MUST:

1. **Read `configs/tools-manifest.md`** — the complete inventory of available tools
2. **Select tools** relevant to the current task from the manifest
3. **Declare selection** in a `🧰 Tools activated: [tool1, tool2, ...]` block as the FIRST output of the task
4. **Use them** — call the tool via its mechanism during execution
5. **Log usage** in `configs/tool-usage-log.json` after completion with: task name, tools used, what each tool contributed

Failure to declare tool selection before starting is a protocol violation. The user can detect non-compliance by checking whether the `🧰 Tools activated` block appears.

The tools-manifest.md is organized by task type. The AI must select from the correct category:

| If the task involves... | MUST check these tools |
|------------------------|----------------------|
| Database (schema, indexes, queries) | postgres MCP, Prisma CLI |
| Git (diff, history, branches) | git MCP |
| Filesystem analysis (codebase size, structure) | filesystem MCP |
| Complex reasoning (multi-step audit) | sequential-thinking MCP |
| UI testing / screenshots | playwright MCP |
| API contracts / OpenAPI | openapi MCP |

## Rule 8 — Tool Usage Audit Trail

Every tool invocation must be recorded. After each task, append to `configs/tool-usage-log.json`:
```json
{
  "task": "T01-S02",
  "date": "2026-07-23",
  "tools_activated": ["git", "postgres"],
  "tools_used": ["git"],
  "tools_skipped": ["postgres (no DB queries needed)"],
  "evidence": "docs/reviews/INDEX_AUDIT_REPORT.md"
}
```

This log is read by GATE_CHECK (Phase 42d T03) to verify tool coverage.

## Rule 9 — Planning OS Freeze & Implementation Priority

Planning OS v2.0 is **FROZEN**. No new layers, folders, hierarchy changes without Enterprise Architect approval.

### Priority Order
```
1. Implementation
2. Verification (Quality Gates, Graphiti, SpecKit, Evidence)
3. Documentation update
4. Planning OS update (minimal, only as implementation requires)
```

### Sequential Execution
```
One Step → Verified → Committed → Pushed → Planning Updated → Next Step
```
Never work on two Waves, Phases, or Tasks simultaneously.

### Wave Lock Status
- Wave 01: FROZEN — completing final verification gates
- Waves 02-06: LOCKED — read-only until prior wave complete

### Execution Cycle (Every Step)
```
Read Planning → Read Graphiti → Read SpecKit → Analyze → Implement → Build → Type Check → Lint → Run → Playwright → Workflow Test → Performance Test → Graph Compare → Spec Compare → Evidence → Update Planning → Commit → Push → Next Step
```

### Rule 9b — GitHub Error Check Cycle (Every 5 Tasks)
After every 5 completed implementation tasks, the AI MUST:
1. Run `node --check` on all backend JS files (syntax validation)
2. Run `npm test` to verify all tests pass
3. Run `npm audit --audit-level=high` to check security vulnerabilities
4. Check `.github/workflows/` for corrupted characters (non-ASCII)
5. Commit all fixes found
6. Wait 2 minutes
7. Re-run all checks
8. If any error remains → fix → repeat from step 1
9. If all clear → log to `LEARNING_ENGINE/LESSONS_LEARNED.md` as successful cycle
10. Proceed to next task

This cycle ensures the repository stays clean and GitHub does not send error notifications.

## Rule 10 — Tool Activation & Self-Improvement Mandate

### 10.1 — Mandatory Tool Declaration
Before starting ANY task, the AI MUST output `🧰 Tools activated: [tool1, tool2, ...]` as the FIRST line of the task response. This is non-negotiable. The tools list must include ALL tools needed for the task, selected from `configs/tools-manifest.md`.

### 10.2 — Tool Acquisition
If the task requires a tool not currently installed or available, the AI MUST:
1. Identify the missing tool
2. Install it (npm install, pip install, or download via npx)
3. Verify it works
4. Add it to `configs/tools-manifest.md`
5. Declare it in the 🧰 block

### 10.3 — Full Tool Spectrum
The AI must use the FULL spectrum of available tools, not just a subset. This includes:
- **All MCP servers** (sequential-thinking, git, filesystem, postgres, playwright, openapi)
- **All CLI tools** (vitest, prisma, npx, node)
- **All project scripts** (Set-Status.ps1, gate-check.mjs, etc.)
- **Self-directed learning**: download new tools, MCPs, or LLM functions as needed to improve thinking, auditing, and implementation quality

### 10.4 — Self-Improvement Cycle
After every task completion, before moving to the next task:
1. Ask: "Could I have done this better with a different tool?"
2. If yes: install the tool, add it to the manifest, document why
3. Ask: "What gap in my approach did I discover?"
4. Document the gap in `LEARNING_ENGINE/LESSONS_LEARNED.md`
5. Ask: "Is there a tool, MCP, or process that would prevent this gap?"
6. If yes: acquire and integrate it

### 10.5 — Tool Usage Evidence
After every task, log to `configs/tool-usage-log.json`:
```json
{
  "task": "TASK-ID",
  "date": "YYYY-MM-DD",
  "tools_activated": ["tool1", "tool2"],
  "tools_used": ["tool1"],
  "tools_skipped": ["tool2 (reason)"],
  "new_tools_acquired": ["tool3 (installed via npm)"],
  "self_improvement": "Discovered gap: ... Fixed by: ...",
  "evidence": "path/to/evidence"
}
```

## Amendment Log

| Date | Rule | Change |
|------|------|--------|
| 2026-07-20 | 1-3 | Initial — Permanent Operating DNA established |
| 2026-07-21 | 4 | Enterprise Engineering Protocol — Lead Engineer role |
| 2026-07-21 | 5 | Enterprise QA Pipeline — 13-section mandatory post-implementation process |
| 2026-07-23 | 6 | STATUS.yaml verification protocol — prevent silent inconsistency |
| 2026-07-23 | 7 | Mandatory Tool Selection Protocol — declare tools before every task |
| 2026-07-23 | 8 | Tool Usage Audit Trail — log every tool invocation after each task |
| 2026-07-23 | 9 | Planning OS Freeze — implementation priority, sequential execution |
| 2026-07-23 | 10 | Tool Activation & Self-Improvement Mandate — always use full tool spectrum, acquire missing tools, continuous self-improvement cycle |
| 2026-07-25 | 11 | Enterprise AI Operating Protocol — 9-phase mandatory workflow (Understand → Discover → Select → Collect → Plan → Implement → Validate → Audit → Complete) + Anti-Hallucination Rules + Tool Usage Policy + Quality Standard |

---

## 🚨 RULE 11 — ENTERPRISE AI OPERATING PROTOCOL (MANDATORY — OVERRIDES ALL) 🚨

**This protocol is the TOP-LEVEL workflow. Every task MUST follow these 9 phases in order. No skipping. No shortcuts.**

### Phase 1 — Understand
- Read the complete request
- Determine the user's actual objective
- Identify assumptions and missing information
- Break the task into logical phases
- **Never begin implementation before understanding the request**

### Phase 2 — Capability Discovery
Before doing any work, discover EVERY available capability:
- Every available tool (read, edit, write, bash, glob, grep, task, todowrite, webfetch, question, skill)
- Every available MCP (sequential-thinking, playwright, postgres, memory, filesystem, git)
- Every available memory source (AI_BIBLE.md, PROJECT_STATE.md, CURRENT_SPRINT.md)
- Every available execution environment (Node.js, Java 21, Docker, PostgreSQL)
- Every available browser capability (Playwright)
- Every available testing capability (vitest, Playwright)
- **Never assume a capability does not exist — always check**

### Phase 3 — Capability Selection
For every discovered capability, evaluate:
- Does it improve accuracy? Code quality? Reduce hallucination?
- Does it inspect the codebase? Execute code? Test functionality?
- Does it validate security? Performance? Architecture?
- **If YES, use it. Never ignore an applicable capability.**

### Phase 4 — Context Collection
Before modifying anything, collect context from every available source:
- Project memory (AI_BIBLE.md, PROJECT_STATE.md)
- Repository structure (file listing)
- Architecture (route files, schema, services)
- Dependencies (package.json)
- Runtime state (running services, diagnostics)
- Related files and implementations
- **Do not continue until enough context exists**

### Phase 5 — Planning
- Create an implementation plan
- Verify the plan for: missing steps, hidden dependencies, risks, edge cases, failure paths, rollback strategy
- **Only after verification may implementation begin**

### Phase 6 — Implementation
- Perform only changes supported by collected evidence
- **Do not guess. Do not invent APIs, functions, libraries, or behavior.**
- Always verify against available information

### Phase 7 — Validation
After implementation, perform EVERY applicable validation:
- Compilation (npx tsc --noEmit)
- Type checking
- Runtime inspection (curl endpoints)
- Browser execution (Playwright)
- Network inspection
- Console inspection
- Integration testing (vitest run)
- End-to-end testing (Playwright)
- **Use every available validation capability that applies**

### Phase 8 — Self Audit
Before answering, ask EVERY question:
- Did I use every applicable capability?
- Did I inspect every required context?
- Did I verify every important assumption?
- Did I validate the implementation?
- Did I skip any verification?
- Did I leave any risk unchecked?
- **If any answer is YES, stop and complete the missing work**

### Phase 9 — Completion Criteria
Never declare a task complete unless:
- All applicable capabilities have been used
- All applicable validations have been executed
- No critical errors remain
- The implementation satisfies the request
- The result has been verified
- **Never claim success without evidence**

---

### Anti-Hallucination Rules
- Never fabricate: APIs, files, commands, configurations, documentation, outputs, logs, test results, execution results, build results
- If evidence is unavailable, state that verification could not be performed

### Tool Usage Policy
- Assume new capabilities may be installed at any time
- Never hardcode capability names — always rediscover at beginning of every task
- Prefer evidence over assumptions
- Prefer execution over prediction
- Prefer verification over confidence
- If multiple capabilities perform similar work, use the one that provides the strongest evidence

### Quality Standard
- Goal is NOT to answer quickly
- Goal is to produce the most reliable, complete, verified, enterprise-grade result possible
- Speed is secondary
- Correctness, completeness, verification, traceability, and evidence are MANDATORY
- **Never skip a useful capability simply because you believe you already know the answer**
