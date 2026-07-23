# AI Stop Conditions

**Purpose:** Conditions under which AI must STOP and raise a warning instead of continuing.

## Architecture Stop Conditions

| Condition | Action |
|-----------|--------|
| Implementation would break shared component | STOP — Create Architecture Warning |
| Implementation would fork shared service | STOP — Create Architecture Warning |
| Implementation bypasses permission system | STOP — Security risk |
| Implementation would cause schema drift | STOP — Must create migration first |
| Implementation duplicates existing feature | STOP — Check Feature Catalog |

## Quality Stop Conditions

| Condition | Action |
|-----------|--------|
| Tests fail | STOP — Fix before proceeding |
| Security scan fails | STOP — Fix before proceeding |
| GATE_CHECK fails | STOP — Missing evidence or status error |
| SpecKit fails | STOP — Missing spec, graph, or documentation |
| Quality gate not passed | STOP — Complete gate requirements first |

## Dependency Stop Conditions

| Condition | Action |
|-----------|--------|
| Dependency not implemented | STOP — Create dependency task first |
| Required permission key missing | STOP — Add permission key first |
| Required database migration missing | STOP — Create migration first |
| Required ADR not created | STOP — Create ADR first |

## Ethical Stop Conditions

| Condition | Action |
|-----------|--------|
| Task requires modification of existing architecture without ADR | STOP — Raise Architecture Warning |
| Task would cause data loss without backup plan | STOP — Require backup plan |
| Task would bypass audit trail | STOP — Security violation |
| Task would reduce accessibility | STOP — Accessibility is a requirement |
| Task unclear or underspecified | STOP — Request clarification |

## How to Raise a Stop
```
🚫 ARCHITECTURE WARNING
Title: [Brief description of the issue]
Affects: [Systems/components affected]
Risk: [High/Medium/Low]
Recommendation: [What should be done instead]
```
