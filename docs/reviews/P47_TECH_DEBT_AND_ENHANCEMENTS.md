# P47 — UI DNA Certification & Technical Debt Register

## 1. UI DNA Audit

| Dimension | Status | Evidence |
|---|---|---|
| Experience DNA | 🟢 Consistent | `src/styles/themes/*` (10 themes), design-system/ tokens, shadcn/ui NY, motion/effects system |
| Workspace shell | 🟢 | AdminLayout (red) + SystemLayout (green), Zustand activePage SPA, no full-page reload |
| Theme | 🟢 | 10 themes + cookie default; admin/user differ only by brand color prop |
| Layout | 🟢 | Consistent sidebar/header/page-container across admin + user |
| Spacing/tokens | 🟢 | design-system/spacing, radius, shadow tokens used throughout |
| Navigation | 🟢 | Admin ALL_NAV_ITEMS (24) resolve; nav-config wired (P45-E); only intentional Forms `#` |
| Legacy vs modern | 🟡 | ~53 GenericAdminPage config-driven (modern), ~12 hardcoded placeholder pages (alerts, balances, bill-cycle, documents, upload, monitoring, accounting sub-pages, collections) |
| Duplicate pages | 🟠 | home ×3 (admin + root SPA + user), payments ×2, accounting re-export; `/` vs `/user` near-duplicate shells |
| Missing pages | 🔴 | 4 backend routes with no page (revenue-assurance, tariff-engine, financial-ai, tenants); user portal entirely missing (C14) |

**Verdict:** Modern pages are DNA-consistent. Legacy/placeholder pages (12) and user-portal absence are the debt.

## 2. Technical Debt Register (ranked)

### Critical
| # | Issue | Evidence | Root cause | Affected | Dep | Repair |
|---|---|---|---|---|---|---|
| 1 | 21 models unmigrated (drift) | 147 tables vs 168 models | db push policy (OBS-013) | schema + migrations | all C13 GL + C19 ops | B-10 drift migration |
| 2 | Root-level C18 runtime dependency | rca.js/intelligence.js import `D:\meter\src\intelligence\*` | C18 built outside backend | backend deploy | rca/intelligence | vendor into backend |
| 3 | C13 W05 Bank Reconciliation missing | no service/route/model/UI | not implemented | C13 | posting-engine | Wave-2.5 follow-up |

### High
| # | Issue | Evidence | Root cause | Affected | Dep | Repair |
|---|---|---|---|---|---|---|
| 4 | User platform = admin reskin | user shell renders admin Users/Permissions/Settings | no user portal built | `/` + `/user` | C14 | build true user portal |
| 5 | `admin/login` is fake (setTimeout) | login page redirects without real auth | legacy | admin/login | auth | wire real login (user page does) |
| 6 | 12 hardcoded placeholder pages | alerts/balances/bill-cycle/documents/upload/monitoring/accounting-sub/collections | incomplete wiring | admin pages | backend endpoints | wire to live endpoints |
| 7 | 4 backend routes, no frontend | revenue-assurance/tariff-engine/financial-ai/tenants | P45-48 gaps | admin | — | add pages |

### Medium
| # | Issue | Evidence | Root cause | Affected | Dep | Repair |
|---|---|---|---|---|---|---|
| 8 | audit actor=anonymous on login | audit before JWT attach | middleware order | auth | — | reorder |
| 9 | collections page uses hardcoded arrays | admin/collections (P46 re-check) | legacy | collections | backend | wire live (P45 added fetch; sub-arrays still static) |
| 10 | SMTP/SMS test placeholders | config-center test returns message only | nodemailer not installed | config-center | — | install + real test |
| 11 | `/user` ≈ `/` duplicate | both green SystemLayout | history | user shell | C14 | consolidate |
| 12 | dashboard starter shell (Clerk) unused | auth-context mock `isAuthenticated:true` | template | dashboard/* | — | remove or wire |

### Low
| # | Issue | Evidence | Root cause | Affected | Dep | Repair |
|---|---|---|---|---|---|---|
| 13 | `backend/coverage/` git history | removed from tracking P45 | committed pre-ignore | repo | — | done |
| 14 | `prisma/dev.db` (SQLite) + views.sql | artifacts | dev experiment | prisma | — | remove/formalize |
| 15 | Gateway model bare (no relation) | schema Gateway areaId no @relation | legacy | schema | — | add relation |
| 16 | CustomerLedgerEntry no relation | dangling customerId | legacy | schema | — | add FK relation |
| 17 | C13 BFF handlers unconsumed | financial-reports/ratios, revenue-assurance/summary, financial-ai/board | created for OBS-48 | frontend api | — | consume or remove |
| 18 | frontend tsc continue-on-error in CI | ci.yml | — | CI | — | make gating |

## 3. Alpha Enhancement Backlog (improvements only, not blockers)

### Quick Wins (small, high value)
1. Wire real login on admin/login (reuse `/login` flow).
2. Add frontend pages for revenue-assurance + financial-ai boards (consume existing BFF).
3. Fix audit actor on login (reorder middleware).
4. Make tsc gating in CI.
5. Remove `/user` duplicate or redirect to `/`.

### Medium
6. Wire the 12 placeholder pages to live endpoints (collections sub-arrays, accounting sub-pages, monitoring).
7. Real SMTP/SMS test (install nodemailer/twilio).
8. Add `admin/tenants` page (C22 frontend gap).
9. B-10 drift migration.

### Long Term (feeds Wave 3+)
10. C14 true user portal (profile, pay-bill, submit reading, notifications inbox, consumption charts, documents, service requests, meter ownership).
11. C24 document governance + C25 unified comms hub (47 planned models).
12. C13 W05 bank reconciliation.
13. Vendor C18 runtime into backend.
