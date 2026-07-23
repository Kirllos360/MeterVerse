# COMMIT RULES

**Rule:** Every commit must follow these rules. No exceptions.

---

## Pre-Commit Checklist

- [ ] Only intended files changed (`git status` reviewed)
- [ ] Planning updated (STATUS files match reality)
- [ ] Evidence stored (evidence files exist)
- [ ] Documentation updated (if new features/dimensions added)
- [ ] No temporary files (`.log`, `node_modules`, `dist`, etc.)
- [ ] No debug code (`console.log`, `TODO`, `FIXME`, `HACK`)
- [ ] No secrets or credentials (env vars only)
- [ ] No commented-out code
- [ ] No merge conflict markers (`<<<<<<`, `======`, `>>>>>>`)
- [ ] Commit message follows convention

## Commit Message Convention

```
{type}({scope}): {short description}

{optional body with reasoning}

Related: {ticket-id}
```

### Types
- `feat` — New feature
- `fix` — Bug fix
- `audit` — Audit finding or improvement
- `docs` — Documentation only
- `perf` — Performance improvement
- `security` — Security improvement
- `test` — Test addition or improvement
- `plan` — Planning update
- `exec` — Execution engine update
- `refactor` — Code refactoring (no functional change)

### Scopes
- `phase-{n}` — Phase-specific change
- `task-{n}` — Task-specific change
- `planning` — Planning OS change
- `execution` — Execution Engine change
- `audit` — Audit Engine change
- `backend` — Backend code change
- `frontend` — Frontend code change
- `database` — Database/migration change

### Examples
```
feat(phase-00): Add Vitest configuration and first unit tests

T09 Unit Test Infrastructure Step 1-3 complete.
54 verification scripts converted to proper Vitest describe/it blocks.
10 new unit tests for sms-engine, billing-engine, validation-engine.
Coverage threshold set to 80%.

Related: EXEC-0001
```

## After Commit
1. Verify push succeeds: `git push`
2. Verify GitHub commit appears
3. Update `CURRENT_PROJECT_STATE.md` with new hash
4. Update `CURRENT_TARGET.md` to next ticket

## Never Commit
- Broken code (tests must pass first)
- Without evidence (screenshots, logs, test output)
- Multiple tickets in one commit
- Without updating STATUS files
- Without completing the Definition of Done
