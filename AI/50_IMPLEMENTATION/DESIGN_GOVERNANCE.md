# MeterVerse Design Governance

**Version:** 2.0.0  
**Authority:** Permanent governance rules for all MeterVerse frontend implementation.

---

## 1. Pre-Implementation Checks

Before ANY code is written, the AI must verify:

| Check | Tool | Pass Condition |
|-------|------|---------------|
| Architecture alignment | Read AI/ documents | No conflict with any permanent document |
| Component audit | Grep existing components | No duplicate functionality exists |
| Token usage verification | Check globals.css + design-tokens | All new values use existing tokens |
| Archetype match | Check PAGE_COMPOSITION_RULES.md | Page matches exactly one blueprint |
| Priority review | Check COMPONENT_PRIORITY_ENGINE.md | Component has assigned priority |

## 2. Implementation Rules

| Rule | Enforcement | Auto-fix |
|------|------------|----------|
| No hardcoded colors | ESLint rule: no raw hex/hsl in JSX/CSS | Replace with token reference |
| No hardcoded spacing | ESLint rule: no raw px/rem values | Replace with space-{n} |
| No page-specific components | Code review: new file in components/page/ rejected | Move to shared/ or experience/ |
| All 7 component states defined | Template check: missing state = CI warning | Add missing states |
| All 4 viewports responsive | Playwright test at 1440, 1280, 768, 375 | Add responsive rules |
| RTL support verified | Visual regression with dir="rtl" | Add RTL styles |
| 4 themes supported | Visual regression for light/dark/gray/adaptive | Add theme overrides |

## 3. Definition of Done

A task is COMPLETE only if:

- [ ] Architecture alignment verified
- [ ] No duplicate components created
- [ ] All tokens used (not raw values)
- [ ] 7 component states implemented
- [ ] 4 viewports responsive
- [ ] RTL layout verified
- [ ] 4 themes verified
- [ ] Build passes (0 errors)
- [ ] TypeCheck passes (0 errors)
- [ ] Lint passes (0 errors, 0 warnings)
- [ ] Playwright passes (all viewports)
- [ ] Console: 0 errors
- [ ] Network: 0 failed requests
- [ ] Accessibility: 0 violations
- [ ] Performance: TTI <3s
- [ ] Documentation updated

## 4. Component Lifecycle

```
Proposal → Architecture Review → Implementation → Quality Gate → Integration → Documentation → Release
     |            |                    |                |             |               |           |
     v            v                    v                v             v               v           v
  New component  Check AI/30    Build component   Run all gates   Integrate with  Update AI/   Mark complete
  needed         for duplicate  with all states   (build, tsc,    page templates  documents    in status.json
                                  and variants     lint, test,
                                                   playwright)
```

## 5. Governance Violation Consequences

| Violation | First Occurrence | Repeated |
|-----------|-----------------|----------|
| Hardcoded color | Warning, auto-fix | Rejected in review |
| Missing component state | CI warning | CI failure |
| Duplicate component | Architecture review rejection | Escalation |
| Page without blueprint match | Rejected | Escalation |
| RTL not supported | CI failure | Rejected |
| Theme not supported | CI failure | Rejected |
