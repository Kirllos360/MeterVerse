# CURRENT TARGET — What We Are Working On Now

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

```
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
```

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
