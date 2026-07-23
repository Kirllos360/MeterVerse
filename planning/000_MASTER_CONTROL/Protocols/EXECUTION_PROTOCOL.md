# MeterVerse — Master Execution Protocol

## Universal AI Workflow

Every task, from smallest bug fix to largest feature, MUST follow this exact sequence. No step may be skipped.

```
READ           → Read all relevant memory, docs, specs, graphs, current state
    ↓
PLAN           → Design the approach. Identify files, dependencies, risks
    ↓
GRAPH          → Update the dependency graph with planned changes
    ↓
SPEC           → Write or update the specification for this change
    ↓
DESIGN         → Architecture review. Verify against enterprise rules
    ↓
IMPLEMENT      → Write production code (if applicable)
    ↓
BUILD          → Compile, TypeScript check
    ↓
TEST           → Run unit tests, integration tests
    ↓
VERIFY         → Manual verification. Check all acceptance criteria
    ↓
COMPARE GRAPH  → Does implementation match the graph? Fix if not.
    ↓
COMPARE SPEC   → Does implementation match the spec? Fix if not.
    ↓
SCREENSHOTS    → Capture all relevant screenshots
    ↓
REPORT         → Generate implementation report
    ↓
DOCUMENT       → Update memory, project state, changelog
    ↓
UPDATE MEMORY  → AI memory files with sprint results
    ↓
COMMIT         → Conventional commit with evidence
    ↓
PUSH           → Push to remote
    ↓
SELF REVIEW    → Review own work against Definition of Done
    ↓
CHATGPT REVIEW → Generate handoff for ChatGPT review
    ↓
COMPLETE       → Mark step complete in YAML status
```

## Gate Conditions

| Gate | Before Proceeding |
|------|-------------------|
| BUILD | TypeScript must have 0 errors |
| TEST | All tests must pass |
| COMPARE GRAPH | No mismatch between code and graph |
| COMPARE SPEC | No mismatch between code and spec |
| SCREENSHOTS | All required screenshots captured |
| COMMIT | All files staged, message follows convention |
| SELF REVIEW | All Definition of Done items checked |

## Failure Recovery

If any gate fails:
1. Stop. Do not continue.
2. Fix the issue.
3. Return to the READ step.
4. Re-execute from the beginning.
5. Do not skip ahead.
