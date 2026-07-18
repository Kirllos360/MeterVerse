# Final Remediation Plan

**Date:** 2026-06-17
**Status:** Required because pre-phase-h-final-certification = NOT READY FOR FULL PILOT DEPLOYMENT

---

## Sprint 1: Immediate P1 Fixes (~3 days)

### Day 1
| Task | Action | Owner | Files |
|------|--------|-------|-------|
| **T071a** — Consumption view migration | Create consumption API endpoint or adapt existing readings API; wire Frontend ConsumptionPage to it | Backend + Frontend | `backend/src/readings/`, `Frontend/src/components/billing/ConsumptionPage.tsx` |
| **T067** — Use customer_statement_view | Modify `getStatement()` to use `prisma.$queryRaw` against the view instead of JS computation | Backend | `backend/src/customers/customers.controller.ts:100-143` |

### Day 2
| Task | Action | Owner | Files |
|------|--------|-------|-------|
| **T084** — Fix contract test timeouts | Investigate 12x timeout at 35s; likely missing DB mocks. Add `jest.setTimeout(60000)` or mock Prisma calls | Backend | `backend/test/contract/*.contract.spec.ts` |
| **T085** — Constitution ratification | Replace template placeholders in `.specify/memory/constitution.md` with ratified principles | Q&A | `.specify/memory/constitution.md` |

---

## Sprint 2: Polish Phase (~11 days)

### Days 3-4: Reporting (T073, T074, T076)
| Task | Action | Effort |
|------|--------|--------|
| T073 | Create `reports.controller.ts` with `POST /reports/exports` (async job lifecycle) and `GET /reports/exports/:jobId` | 2 days |
| T074 | Create `reports.contract.spec.ts` asserting ReportExportRequest/ReportJob schemas | 1 day |
| T076 | Migrate `Frontend/src/components/reports/ReportsPage.tsx` from mock data to live API | 1 day |

### Days 5-6: RBAC + Permissions (T075, T077)
| Task | Action | Effort |
|------|--------|--------|
| T075 | Write `rbac-audit.spec.ts`: action-level permissions per role, audit coverage for sensitive actions | 1 day |
| T077 | Implement `can(action, resource)` helper in `Frontend/src/lib/permissions.ts`; gate critical buttons | 1 day |

### Days 7-8: Frontend Quality (T079, T081, T082)
| Task | Action | Effort |
|------|--------|--------|
| T079 | Add contract + integration test files under Frontend/; wire into CI | 2 days |
| T081 | Add error boundaries, Sentry config, user-safe error surfaces, correlation ID display | 1 day |
| T082 | Batch validation utility for frontend Polish validation | 1 day |

### Day 9: Contract Reconciliation (T083)
| Task | Action | Effort |
|------|--------|--------|
| T083 | Run all 12 contract specs; map each to meter-verse-api.yaml operationId; document any drift | 1 day |

---

## Sprint 3: Deployment Infrastructure (~5 days)

### Days 10-11
| Task | Action | Effort |
|------|--------|--------|
| Dockerfile | Create production Dockerfile for NestJS backend (multi-stage build) | 1 day |
| CI/CD pipeline | GitHub Actions: backend test → build → push; frontend lint → build → push | 2 days |

### Days 12-14
| Task | Action | Effort |
|------|--------|--------|
| Nginx + SSL | Configure reverse proxy, SSL certs for API gateway | 1 day |
| Monitoring | Health check endpoint → uptime monitoring; error rate alerting | 1 day |

---

## Re-Certification Gate

After completing all 3 sprints:

1. Run `R0-R7` audit suite again
2. Verify: Critical=0, High=0, Security=0, DB variance=0, Billing variance=0
3. Verify: MVP completion >= 98%, UAT >= 95%
4. If GREEN → **Phase H GO**
5. If RED → Iterate on gaps

---

## Effort Summary

| Sprint | Tasks | Duration | Team |
|--------|-------|----------|------|
| Sprint 1: P1 Fixes | 4 | 3 days | 2 devs |
| Sprint 2: Polish | 10 | 9 days | 2 devs |
| Sprint 3: Infrastructure | ~5 | 5 days | 1 devops |
| **Total** | **~19** | **~17 days** | |

## Parallel Execution Opportunities
- **Day 1-3**: Backend works on T071a/T067/T084 while Frontend works on T076/T077
- **Day 4-6**: Backend works on T073/T074 while Frontend works on T079/T081
- **Day 7-9**: Backend works on T075/T083 while Frontend works on T082
- **Day 10-14**: DevOps works on deployment while devs address any found issues
