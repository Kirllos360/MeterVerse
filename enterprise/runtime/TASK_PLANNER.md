# MeterVerse Enterprise Task Planner v4
**Generated:** 2026-07-14 | **Phase 04 — Enterprise AI Integration**

## Planning Pipeline
Every task is automatically planned via this pipeline:

```
Raw Request
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 1. TASK CLASSIFIER                                │
│    Classification → Task Type → Risk Level       │
│    Risk = function(keywords, scope, impact)      │
│    - LOW: doc, format, test                      │
│    - MEDIUM: implement, refactor, schema change  │
│    - HIGH: security, architecture, breaking      │
│    - CRITICAL: production, data, auth            │
└─────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 2. DEPENDENCY RESOLVER                           │
│    Load tool chain from TOOL_SELECTION_ENGINE    │
│    Load intelligence scores from TOOL_INTELLIGENCE│
│    Check tool availability from master-registry  │
│    Resolve inter-tool dependencies               │
│    Parallel groups from dependency graph         │
└─────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 3. EXECUTION ORDER                               │
│    Topological sort of tool chain                │
│    Group parallelizable tools                    │
│    Order: architecture → security → code → test  │
│    → doc → cert (with risk-based priority)       │
└─────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 4. VALIDATION PLAN                               │
│    Per-tool validation gates                     │
│    Per-chain validation gates                    │
│    SpecKit validation (if specs exist)           │
│    Regression test selection                     │
└─────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 5. REGRESSION SCOPE                              │
│    Load KNOWN_REGRESSIONS from enterprise memory │
│    Load project test history                     │
│    Select affected services/modules              │
│    Schedule regression tests                     │
└─────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 6. CERTIFICATION PLAN                            │
│    Map tools to certification dimensions         │
│    Set expected thresholds per dimension         │
│    Calculate expected overall score              │
└─────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 7. DOCUMENTATION PLAN                            │
│    ADR needed? (if ARCH/HIGH/CRITICAL)           │
│    API docs update? (if API change)             │
│    Changelog entry? (if user-facing)             │
│    Knowledge graph update? (if structural)       │
└─────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 8. GIT PLAN                                      │
│    Branch naming: {type}/{chain-id}/{description}│
│    Commit strategy: atomic commits               │
│    PR template: includes cert score              │
└─────────────────────────────────────────────────┘
  │
  ▼
OUTPUT: Task Plan (JSON)
```

## Risk Classification

| Level | Score | Examples | Gates Required |
|-------|-------|----------|---------------|
| 🟢 LOW | 1-20 | Documentation, formatting, lint fixes | tsc, eslint |
| 🟡 MEDIUM | 21-50 | Feature implementation, refactors, schema changes | tsc, eslint, depcruise, madge, tests |
| 🟠 HIGH | 51-80 | Security patches, architecture changes, breaking changes | ALL security + architecture gates |
| 🔴 CRITICAL | 81-100 | Auth changes, data migrations, production config | FULL certification + Chief Architect approval |

## Task Plan Output Schema
```json
{
  "task_id": "TASK-20260714-001",
  "classification": "SECURITY",
  "risk_level": "HIGH",
  "chain_id": "CHAIN-SEC",
  "tools": ["Semgrep", "Snyk", "Trivy", "Checkov", "Gitleaks", "TruffleHog", "npm audit"],
  "parallel_groups": [
    ["Semgrep", "Snyk", "Trivy"],
    ["Checkov", "Gitleaks", "TruffleHog"],
    ["npm audit"]
  ],
  "validation_gates": {
    "architecture": false,
    "security": true,
    "testing": false,
    "documentation": false,
    "certification": true
  },
  "regression_tests": ["playwright", "jest"],
  "expected_certification": 90,
  "needs_adr": true,
  "branch": "security/CHAIN-SEC/patch-description",
  "estimated_duration": "15m"
}
```
