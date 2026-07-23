# VALIDATION RULES

**Rule:** Every implementation must be validated. No exceptions.

---

## Multi-Level Validation

### Mini Audit (after every Step)
Run before marking any Step complete:
- [ ] Build passes (npm run build)
- [ ] TypeScript passes (npx tsc --noEmit)
- [ ] Lint passes (npm run lint)
- [ ] Runtime works (manual smoke test)
- [ ] Implementation matches the plan
- [ ] No scope creep
- [ ] Evidence captured
- [ ] STATUS file updated

### Task Audit (after every Task)
- [ ] All Steps complete and verified
- [ ] Business workflow works end-to-end
- [ ] APIs verified (correct status codes, error handling, pagination)
- [ ] Frontend renders (loading, error, empty, edge states)
- [ ] Database operations correct (migrations clean, data accurate)
- [ ] Permissions enforced (authorized gets 200, unauthorized gets 403)
- [ ] Definition of Done checklist complete
- [ ] Dependency Heat Map updated
- [ ] Decision Log checked for new decisions

### Phase Audit (after every Phase)
- [ ] All Tasks complete and verified
- [ ] Graphiti comparison passed (architecture matches code)
- [ ] SpecKit validation passed (documentation matches code)
- [ ] Ultimate Audit Framework applied (21 dimensions)
- [ ] T99 phase audit completed
- [ ] Architecture review passed
- [ ] Technical debt reviewed and documented
- [ ] Performance reviewed (no regressions)
- [ ] Security reviewed (no new vulnerabilities)
- [ ] Enterprise Metrics recalculated

### Wave Audit (after every Wave)
- [ ] All Phases complete and verified
- [ ] Full regression passed
- [ ] End-to-end workflows passed
- [ ] Executive Dashboard updated
- [ ] Capability Roadmap updated
- [ ] Feature Lifecycle updated
- [ ] Release readiness confirmed
- [ ] Lessons learned documented
- [ ] Risks updated in Risk Register

### Release Audit (before production)
- [ ] All Wave audits passed
- [ ] Security penetration test passed
- [ ] Load test passed
- [ ] Backup/restore tested
- [ ] Disaster recovery drill passed
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] Stakeholder sign-off obtained

### Enterprise Audit (quarterly)
- [ ] All Release audits passed since last quarter
- [ ] SUPERLOOP score improved from previous quarter
- [ ] All 21 dimensions scored
- [ ] Knowledge Base updated
- [ ] Decision Log reviewed
- [ ] Technical Debt Register reviewed
- [ ] Risk Register reviewed

## Validation Gates

### After Implementation
```
Implementation
    │
    ▼
Mini Audit ──→ FAIL ──→ FIX
    │
    ▼
PASS ──→ Next Step
```

### After Task Complete
```
Final Step Complete
    │
    ▼
Task Audit ──→ FAIL ──→ Fix affected Steps
    │
    ▼
PASS ──→ Next Task
```

### After Phase Complete
```
Final Task Complete
    │
    ▼
Phase Audit ──→ FAIL ──→ Fix affected Tasks
    │
    ▼
PASS ──→ Next Phase
```

## Verification Record
Every validation must produce:
- Mini Audit: `AUDIT_ENGINE/mini/{ticket}-{step}.md`
- Task Audit: `AUDIT_ENGINE/task/{phase}-{task}.md`
- Phase Audit: `AUDIT_ENGINE/phase/{phase}.md`
- Wave Audit: `AUDIT_ENGINE/wave/{wave}.md`
- Release Audit: `AUDIT_ENGINE/release/{version}.md`
- Enterprise Audit: `AUDIT_ENGINE/enterprise/YYYY-QQ.md`
