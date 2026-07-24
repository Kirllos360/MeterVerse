# SESSION START — AI Execution Engine

**Rule:** Read these files IN THIS ORDER. Do not skip. Do not reorder.
**Violation:** Any AI that skips these files is operating without context.

## Required Reading Order

| Order | File | Purpose |
|:-----:|------|---------|
| 1 | `planning/EXECUTION/SESSION_START.md` | This file — entry point |
| 2 | `planning/EXECUTION/CURRENT_PROJECT_STATE.md` | Single source of truth |
| 3 | `planning/EXECUTION/CURRENT_TARGET.md` | What we're working on now |
| 4 | `planning/EXECUTION/EXECUTION_ORDER.md` | Execution lifecycle |
| 5 | `planning/EXECUTION/IMPLEMENTATION_RULES.md` | How to implement |
| 6 | `planning/EXECUTION/VALIDATION_RULES.md` | How to validate |
| 7 | `planning/EXECUTION/COMMIT_RULES.md` | How to commit |
| 8 | `planning/EXECUTION/SESSION_CONTEXT.md` | This session's context |
| 9 | `planning/EXECUTION/CURRENT_STATE.md` | Current execution state |
| 10 | `planning/IMPLEMENTATION_PLAYBOOK.md` | 13-stage lifecycle |
| 11 | `planning/ULTIMATE_AUDIT_LOOP.md` | SUPERLOOP verification |
| 12 | `planning/VERSION` | Planning OS version |
| 13 | Current Phase directory | Relevant phase details |
| 14 | Current Task directory | Relevant task details |
| 15 | Current Step directory | Relevant step details |

## After Reading

1. Read `configs/tools-manifest.md` — inventory ALL available tools
2. Declare `🧰 Tools activated: [tool1, tool2, ...]` as FIRST output line
3. If the task requires a tool not in manifest: INSTALL IT immediately (npm/pip/npx)
4. Update `SESSION_CONTEXT.md` with your session info
5. Read the **Current Execution Ticket** from `CURRENT_TARGET.md`
6. Begin the **Execution Lifecycle** per `EXECUTION_ORDER.md`
7. After every step, update `CURRENT_PROJECT_STATE.md`

## Self-Improvement Gate (After Every Task)
After completing any task, ask:
1. Could I have done this better with a different tool?
2. What gap in my approach did I discover?
3. Is there a new MCP, package, or process that would prevent this gap?
4. If yes to any — acquire it, document in LESSONS_LEARNED.md, add to tools-manifest.md

## Information Classification

Every piece of information encountered must be classified:

| Classification | Meaning | Action |
|---------------|---------|--------|
| **KNOWN** | Verified by code or documentation | Use with confidence |
| **ASSUMED** | Reasonable inference, needs validation | Note as assumption, validate |
| **UNKNOWN** | Missing information, blocks certainty | STOP and resolve |
| **BLOCKED** | Cannot continue until resolved | Document blocker, STOP |

**Never implement on ASSUMED or UNKNOWN information.**
