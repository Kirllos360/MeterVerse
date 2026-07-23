# EXECUTION ORDER — The Execution Lifecycle

**Every execution follows this exact order. Never skip a stage.**

## The Lifecycle

```
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
```

## Planning → Implementation → Audit flow

```
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
```
