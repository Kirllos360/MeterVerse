# Definition of Done

## Purpose
Single source of truth for what "DONE" means. Every task, phase, and wave uses this checklist.

## DoD Checklist

### Build
- [ ] Frontend builds without errors (npm run build in frontend/)
- [ ] Backend starts without errors (npm run dev in backend/)
- [ ] No TypeScript errors
- [ ] No compilation warnings (suppressed warnings documented)

### Type Check
- [ ] TypeScript compilation passes (npx tsc --noEmit)
- [ ] Prop types defined for all new components
- [ ] API response types defined
- [ ] No "any" types (exceptions documented)

### Lint
- [ ] ESLint passes (npm run lint)
- [ ] No unused imports or variables
- [ ] Consistent code style with existing codebase
- [ ] Naming conventions followed

### Runtime
- [ ] Feature works in development environment
- [ ] No console errors
- [ ] No unhandled promise rejections
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Edge cases handled

### Playwright (conditional)
- [ ] New page has smoke test
- [ ] Critical user flows tested
- [ ] Auth flow tested (if auth-related)

### Accessibility (conditional)
- [ ] Keyboard navigation works
- [ ] ARIA labels on interactive elements
- [ ] Color contrast meets WCAG AA

### API Tested
- [ ] New endpoints return correct status codes
- [ ] Error responses follow Error Standards (T20)
- [ ] Pagination works (if applicable)
- [ ] Filtering works (if applicable)
- [ ] Permission checks work (if applicable)

### Database Tested
- [ ] Migrations run without error
- [ ] Seed data updated (if needed)
- [ ] Indexes created (if new queries added)
- [ ] No N+1 queries
- [ ] Rollback tested (if migration)

### Documentation
- [ ] New models documented in Domain Map
- [ ] New APIs documented (in-code JSDoc)
- [ ] New features added to Feature Lifecycle
- [ ] Runtime Inventory updated (if engine changed)
- [ ] Knowledge Base updated (if domain knowledge changed)

### Planning Artifacts
- [ ] STEP_STATUS updated
- [ ] TASK_STATUS updated
- [ ] PHASE_STATUS updated
- [ ] Evidence files committed
- [ ] Tool usage logged

### Version Control
- [ ] Changes committed to git
- [ ] Commit message follows conventions
- [ ] No secrets in commit
- [ ] No debug code, console.log, or commented code

### Screenshots (conditional)
- [ ] UI changes screenshot captured
- [ ] Before/after comparison (if visual change)
- [ ] Screenshots committed to docs/screenshots/

### Evidence
- [ ] Gate check passes (node scripts/gate-check.mjs)
- [ ] Final verification passes (node scripts/final-verification.mjs)
- [ ] All checkboxes in task specification checked

### Review
- [ ] Self-review completed
- [ ] No TODO/FIXME/HACK comments left
- [ ] No dead code or unused imports
- [ ] Code follows existing patterns

## Phase DoD (additional)
- [ ] All steps in all tasks are DONE
- [ ] Phase Audit (T99) completed
- [ ] Dependency Heat Map updated
- [ ] Enterprise Metrics updated
- [ ] No new regressions introduced

## Wave DoD (additional)
- [ ] All phases in wave are DONE
- [ ] Executive Dashboard updated
- [ ] Capability Roadmap updated
- [ ] Domain Map updated
- [ ] Runtime Inventory updated
- [ ] Enterprise Metrics recalculated
- [ ] Feature Lifecycle updated
- [ ] Decision Log reviewed (new decisions captured)
- [ ] Knowledge Base reviewed (new knowledge captured)

---
*Version: 1.0 | Last updated: 2026-07-23*
