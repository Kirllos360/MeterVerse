# MeterVerse — Enterprise Rules

## Definition of Done
A feature is Done when:
- [ ] Code compiles (0 TypeScript errors)
- [ ] All tests pass
- [ ] API responses match spec
- [ ] Graph matches implementation
- [ ] Spec matches implementation
- [ ] Screenshots captured
- [ ] Reports generated
- [ ] Evidence committed
- [ ] Documentation updated
- [ ] AI memory updated
- [ ] Git committed and pushed
- [ ] Self-review completed
- [ ] No regressions introduced

## Acceptance Criteria
Every deliverable must meet:
1. **Functional**: All specified operations work
2. **Security**: Authentication, authorization, audit enforced
3. **Quality**: Zero TypeScript errors, zero console errors
4. **Performance**: API responds in <100ms
5. **Reliability**: No data loss, no silent failures
6. **Traceability**: Every mutation creates audit entry

## Coding Rules
1. No TypeScript syntax in .js files
2. No Math.random in production code
3. No console.log in production code
4. No empty catch blocks
5. No hardcoded credentials
6. All mutations must have Zod validation
7. All endpoints must have authentication + RBAC
8. All mutations must create audit log

## Review Rules
1. Every PR must include spec and graph updates
2. Every change must be traced in the master graph
3. No merge without approval
4. Review must verify: architecture, security, performance, accessibility

## Testing Rules
1. Every new endpoint must have a test
2. Every bug fix must add a regression test
3. Test coverage must never decrease
4. Tests must run in CI before merge

## Git Rules
1. Conventional commits: `type(scope): description`
2. Types: feat, fix, chore, docs, test, refactor, perf, security
3. Always push to remote after commit
4. Never commit broken code
5. Never commit secrets

## Documentation Rules
1. Every feature must update PROJECT_STATE.md
2. Every phase must generate a phase report
3. Every sprint must generate a sprint report
4. Every release must update CHANGELOG.md
5. Every workflow must have evidence captured
