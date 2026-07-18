# MeterVerse Validation Rules & Quality Gates

**Defines the mandatory validation gates that every implementation phase must pass before being marked complete.**

---

## 1. Definition of Done

A task is COMPLETE only if ALL of these pass:

| Gate | Command/Tool | Expected |
|------|-------------|----------|
| Build | `npx next build` | 0 errors |
| Type Check | `npx tsc --noEmit` | 0 errors |
| Lint | `npx eslint src/` | 0 errors, 0 warnings |
| Unit Tests | `npx jest` | 100% pass rate |
| Playwright | `npx playwright test` | 100% pass rate |
| Console | Browser DevTools | 0 errors, 0 warnings |
| Network | Browser DevTools | 0 failed requests (all 200) |
| Accessibility | axe-core / Lighthouse | 0 violations |
| Performance | Lighthouse / TTI measure | TTI <3s, LCP <2.5s, CLS <0.1 |

## 2. Pre-Implementation Checklist

Before writing any code for a task:

- [ ] Impact Analysis: What existing code does this affect?
- [ ] Dependency Analysis: What does this depend on?
- [ ] Architecture Validation: Does this fit the existing architecture?
- [ ] Risk Analysis: What could go wrong? What's the recovery plan?
- [ ] Implementation Plan: How will this be built, step by step?

## 3. Post-Implementation Checklist

After completing implementation:

- [ ] Build passes (`npx next build`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Lint passes (`npx eslint src/`)
- [ ] All existing tests still pass
- [ ] New tests written for new functionality
- [ ] Playwright tests added for new pages
- [ ] Console inspected — 0 errors
- [ ] Network inspected — all requests 200
- [ ] Accessibility checked — 0 violations
- [ ] Performance budget met
- [ ] Regression verified — nothing broken
- [ ] Status updated in `migration/status.json`

## 4. Phase Completion Gates

Each phase (Phase-02 through Phase-08) must additionally pass:

| Gate | Details |
|------|---------|
| Independent Verification | Another agent or human verifies all deliverables |
| Screenshot comparison | Visual regression against baseline |
| Migration status update | `status.json` updated to reflect completed phase |
| Blocker report | If gates fail after 3 repair cycles, generate BLOCKER REPORT |

## 5. Maximum Repair Cycles

If any gate fails:
- **Cycle 1:** Fix and re-run all gates
- **Cycle 2:** If still failing, broader investigation
- **Cycle 3:** If still failing, STOP and generate BLOCKER REPORT

## 6. Blocker Report Format

If all 3 repair cycles fail, produce:
```
# BLOCKER REPORT — [Phase/Task Name]

## Blocker
Description of what is failing

## Attempted Fixes
1. What was tried — result
2. What was tried — result
3. What was tried — result

## Root Cause Analysis
What is actually causing the failure

## Recommended Resolution
What needs to happen to unblock

## Escalation
Who needs to be involved
```
