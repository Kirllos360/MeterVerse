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

1. Update `SESSION_CONTEXT.md` with your session info
2. Read the **Current Execution Ticket** from `CURRENT_TARGET.md`
3. Begin the **Execution Lifecycle** per `EXECUTION_ORDER.md`
4. After every step, update `CURRENT_PROJECT_STATE.md`

## Information Classification

Every piece of information encountered must be classified:

| Classification | Meaning | Action |
|---------------|---------|--------|
| **KNOWN** | Verified by code or documentation | Use with confidence |
| **ASSUMED** | Reasonable inference, needs validation | Note as assumption, validate |
| **UNKNOWN** | Missing information, blocks certainty | STOP and resolve |
| **BLOCKED** | Cannot continue until resolved | Document blocker, STOP |

**Never implement on ASSUMED or UNKNOWN information.**
