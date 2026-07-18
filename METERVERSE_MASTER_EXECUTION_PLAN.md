# METERVERSE MASTER EXECUTION PLAN

**Date:** 2026-07-11  
**Version:** 1.0 — Single Source of Truth  
**Project:** MeterVerse — Unified Utility Metering & Billing Platform  
**Repository:** https://github.com/Kirllos360/Meter  
**Author:** Kirllos Hany (kirllos.hany@epower.com.eg)

---

## Table of Contents

1. [Current Maturity](#1-current-maturity)
2. [Architecture Maturity](#2-architecture-maturity)
3. [Frontend Maturity](#3-frontend-maturity)
4. [Backend Maturity](#4-backend-maturity)
5. [Design Maturity](#5-design-maturity)
6. [Testing Maturity](#6-testing-maturity)
7. [Security Maturity](#7-security-maturity)
8. [Performance Maturity](#8-performance-maturity)
9. [Accessibility Maturity](#9-accessibility-maturity)
10. [API Maturity](#10-api-maturity)
11. [Database Maturity](#11-database-maturity)
12. [Repository Maturity](#12-repository-maturity)
13. [Remaining Work](#13-remaining-work)
14. [Implementation Order](#14-implementation-order)
15. [Critical Path](#15-critical-path)
16. [Risk Matrix](#16-risk-matrix)
17. [Estimated Completion Percentage](#17-estimated-completion-percentage)
18. [Estimated Weeks Remaining](#18-estimated-weeks-remaining)
19. [Priority P0 — Must Do Before Launch](#19-priority-p0)
20. [Priority P1 — Should Do Before Launch](#20-priority-p1)
21. [Priority P2 — Nice to Have for Launch](#21-priority-p2)
22. [Priority P3 — Post-Launch Enhancement](#22-priority-p3)

---

## 1. Current Maturity

### Overall Readiness Scores (from Operational Reality Master Report)

| Dimension | Score | Status |
|-----------|-------|--------|
| Operational Readiness | 25% | ❌ Critical |
| Financial Readiness | 30% | ❌ Critical |
| Billing Readiness | 35% | ❌ Critical |
| Migration Readiness | 5% | ❌ Critical |
| Database Readiness | 40% | ⚠️ Weak |
| Security Readiness | 45% | ⚠️ Weak |
| Deployment Readiness | 15% | ❌ Critical |
| User Readiness | 25% | ❌ Critical |
| Production Readiness | 10% | ❌ Critical |
| **Overall Weighted Readiness** | **23%** | **❌ Pre-Launch** |

### What Works Today (12 End-to-End Flows)

| Flow | Status | Details |
|------|--------|---------|
| Project Creation → Location Hierarchy | ✅ 100% | API + Frontend |
| Customer Registration → Unit Assignment | ✅ 100% | API + Frontend |
| Meter Registration → Assignment → Termination → SIM Reuse | ✅ 100% | API + Frontend |
| Reading Entry → Validation → Review Queue | ✅ 100% | API + Frontend |
| Water Balance (Main-vs-Sub Variance) | ✅ 100% | API + Frontend |
| Invoice Generation (Electricity + Water) | ✅ 100% | 12/12 E2E passing |
| Invoice Issue (Immutability) | ✅ 100% | API + Frontend |
| Invoice Adjustment (Credit/Debit) | ✅ 100% | API + Frontend |
| Payment Recording (Oldest-Due-First Allocation) | ✅ 100% | API + Frontend |
| Payment Reversal (Super Admin Only) | ✅ 100% | 4/4 integration tests |
| Customer Statement (Running Balance) | ✅ 100% | API + Frontend |
| Dashboard KPIs → Consumption → Activity | ✅ 100% | API + Frontend |

### What Does NOT Work (Entirely Unimplemented)

| Feature | Status | Impact |
|---------|--------|--------|
| Solar Wallet | ❌ 0% | Revenue loss for solar customers |
| Chilled Water Billing (BTU) | ❌ 0% | Missing meter type, readings, settlement |
| Settlement Engine | ❌ 0% | No fixed/percentage/one-time settlements |
| PDF Generation | ❌ 0% | No output for any document type |
| Template Engine V3 | ❌ 0% | No template rendering capability |
| Bill Cycle Governance | ❌ 0% | No OPEN/CLOSE/CANCEL workflow |
| Symbiot Bridge | ❌ 0% | No meter communication protocol |
| Data Migration | ❌ 0% | No scripts for SBill/Collection Tracker |
| Production Infrastructure | ❌ 0% | No CI/CD, SSL, monitoring, deployment |
| 16-Profile RBAC | ❌ 44% | Only 7 of 16 roles implemented |

### Design Compliance (from Design Compliance Report)

| Dimension | Avg Score | Verdict |
|-----------|-----------|---------|
| Enterprise Feeling | 74/100 | ✅ Good — strongest dimension |
| Visual Hierarchy | 71/100 | ✅ Good — three-tier model followed |
| Information Architecture | 71/100 | ✅ Good — logical entity views |
| Spacing | 70/100 | ✅ Good — consistent spacing scale |
| Consistency | 69/100 | ⚠️ Moderate — two sidebar implementations |
| Motion | 60/100 | ⚠️ Moderate — durations mostly correct |
| Discoverability | 59/100 | ⚠️ Moderate — Cmd+K present, context menus missing |
| Workflow | 61/100 | ⚠️ Moderate — progressive disclosure works, no undo toasts |
| Density | 41/100 | ❌ FAIL — zero density modes |
| Accessibility | 34/100 | ❌ FAIL — WCAG 2.1 AA not met |
| Responsiveness | 34/100 | ❌ FAIL — no breakpoint adaptation |
| **Overall Average** | **60/100** | **⚠️ Moderate gaps** |

### Page-by-Page Design Compliance

| Page | Score | Verdict |
|------|-------|---------|
| InvoiceCommandCenter | 70/100 | ✅ Best page — closest to spec |
| PaymentWorkspace | 68/100 | ⚠️ Strong, needs density+accessibility |
| EnterpriseAdminCenter | 67/100 | ⚠️ Best accessibility, strong admin |
| ReadingWorkspace | 66/100 | ⚠️ Most innovative, least consistent |
| Dashboard | 65/100 | ⚠️ Strong feel, weak responsiveness |
| MeterWorkspace | 65/100 | ⚠️ Strong telemetry features |
| Sidebar (Shell variant) | 64/100 | ⚠️ Clean but unresponsive |
| CustomerWorkspace | 62/100 | ⚠️ Good entity coverage |
| GlobalShell (3-Pane) | 62/100 | ⚠️ Missing density+responsive |
| Workspace Tab Bar | 62/100 | ⚠️ Missing keyboard nav |
| DesignSystem Page | 62/100 | ⚠️ No motion demo |
| SearchModal/CommandPalette | 61/100 | ⚠️ Missing deep search |
| Sidebar (GlobalShell) | 55/100 | ❌ Too minimal, lacking labels |
| Empty/Loading/Error States | 52/100 | ❌ Missing three-tier taxonomy |
| Explorer | 37/100 | ❌ Major rewrite needed |
| Inspector | 38/100 | ❌ Major gaps |
| Settings Page | 37/100 | ❌ Placeholder only |

### UX Gap Analysis (from Enterprise UX Gap Analysis)

| Metric | MeterVerse | Azure | Honeywell | Stripe | Fluent/Carbon | Gap |
|--------|-----------|-------|-----------|--------|---------------|-----|
| Design Tokens | V2: Good | ✅ | ✅ | ✅ | ✅ | Small |
| Data Tables | SmartTable | ✅ | ✅ | ✅ | ✅ | Column mgmt, density, selection |
| Charts | Manual divs | ✅ | ✅ | ✅ | ✅ | **Critical** — Recharts not used |
| Command Palette | V2 partial | ⚠️ | ❌ | ✅ | ⚠️ | Incomplete coverage |
| Test/Live Mode | ❌ | ✅ | ✅ | ✅ | ⚠️ | **Critical** — missing entirely |
| Keyboard Nav | V2 partial | ⚠️ | ⚠️ | ⚠️ | ✅ | V1 has none |
| i18n/RTL | ✅ | ⚠️ | ❌ | ❌ | ⚠️ | **Strength** — 448-key map |
| Theme System | 5 modes | 3 modes | 2 modes | 2 modes | 3+ modes | **Strength** |
| Responsive | ❌ | ✅ | ✅ | ✅ | ✅ | Critical gap |

---

## 2. Architecture Maturity

| Element | Status | Details |
|---------|--------|---------|
| Overall Architecture | ⚠️ PLANNED | 3-Plan model (Full/Safety/Failover), 15-Area multi-schema documented but NOT implemented |
| Core DB Schema | ❌ PENDING | 15 tables designed in spec, zero implemented |
| Features DB Schema | ❌ PENDING | 10 tables designed, zero implemented |
| Area DB Template | ❌ PENDING | 45 tables designed, zero implemented |
| 16-Profile RBAC | ❌ PARTIAL | 7 of 16 roles implemented in code |
| Multi-Schema Isolation | ❌ NOT DONE | Single schema `sim_system` only |
| Symbiot Bridge | ❌ NOT STARTED | 10 TCP × 100 HTTP multiplex |
| 3 Availability Plans | ❌ NOT STARTED | Full/Safety/Failover |
| Current Architecture | ✅ SINGLE-SCHEMA MONOLITH | All data in `sim_system` schema with Prisma ORM |
| Module Structure | ✅ WELL-ORGANIZED | 56 NestJS modules, clear separation |
| Pattern Usage | ✅ STRONG | CQRS, Repository, DDD patterns in use |
| OpenAPI/Swagger | ✅ CONFIGURED | `/api/v1/docs` serves OpenAPI 3.0 |
| Controller Blueprint | ✅ DOCUMENTED | B3-02 Enterprise Controller Blueprint created |

### Architecture Gaps (from AGENTS.md T086+)

| Gap | Impact | Effort |
|-----|--------|--------|
| No multi-schema deployment | Scalability risk — all tenants in one schema | Large |
| No Symbiot bridge | No meter communication | Extra Large |
| Only 7/16 roles | Access control gaps | Medium |
| No CQRS event bus | No async processing | Medium |
| No 3-plan failover | No disaster recovery | Extra Large |

---

## 3. Frontend Maturity

| Area | Status | Score | Details |
|------|--------|-------|---------|
| **Framework** | ✅ GOOD | 85% | Next.js 16.2.6, React 19, TypeScript, Turbopack |
| **UI Components** | ✅ GOOD | 80% | Radix UI (27 primitives), shadcn/ui patterns, 55+ custom components |
| **State Management** | ✅ GOOD | 85% | Zustand 5, TanStack React Query 5, feature flags |
| **i18n** | ✅ STRONG | 90% | Arabic/English, 448-key map, RTL-first architecture |
| **Design System (V1)** | ⚠️ MIXED | 60% | Glass-card + teal theme, Material Symbols, 3 themes |
| **Design System (V2)** | ✅ GOOD | 75% | Apple-minimal, 128-line tokens.css, Lucide icons, premium motion |
| **Shell/Layout** | ⚠️ PARTIAL | 62% | Two conflicting shells (V1 RootLayout + V2 GlobalShell) |
| **Dashboard** | ⚠️ PARTIAL | 65% | Strong enterprise feel but developer KPIs, manual charts |
| **Customer Pages** | ⚠️ PARTIAL | 62% | 9-tab system, placeholder content in 5 tabs, FAB anti-pattern |
| **Meter Pages** | ⚠️ PARTIAL | 65% | Strong telemetry, 4 tabs, no digital twin |
| **Invoice Pages** | ⚠️ PARTIAL | 70% | Best page, workflow ribbon, 12 sections, context-aware actions |
| **Payment Pages** | ⚠️ PARTIAL | 68% | Cashier cockpit, bank reconciliation, invoice matching |
| **Reading Pages** | ⚠️ PARTIAL | 66% | SCADA telemetry, AI anomaly, but inconsistent visual language |
| **Collections Dashboard** | ⚠️ PARTIAL | 50% | Manual progress bars, no interactive KPIs, no drill-down |
| **Tariff Studio** | ⚠️ PARTIAL | 55% | Master-detail correct, simulation is toast-based placeholder |
| **Financial Dashboard** | ❌ WEAK | 40% | Manual div charts instead of Recharts, hardcoded data |
| **Units Page** | ❌ WEAK | 40% | No detail page, no spatial view, "Vacant" not actionable |
| **Enterprise Admin** | ⚠️ PARTIAL | 67% | 19 modules, best accessibility, sidebar-inside-content |
| **Settings Page** | ❌ PLACEHOLDER | 37% | Empty placeholder only |
| **Command Palette** | ⚠️ PARTIAL | 61% | V2 only, partial coverage |
| **V1 vs V2 Split** | ❌ CONFLICTING | 30% | Two design languages in same app — teal/glass vs black/white |
| **Performance** | ❌ UNKNOWN | 30% | No performance metrics, no bundle analysis, no Core Web Vitals |
| **Responsiveness** | ❌ FAIL | 34% | No breakpoint adaptation, breaks below 1200px |
| **Mock Data** | ❌ NOT MIGRATED | 40% | All hooks still return mock data, real backend client exists but unused |

---

## 4. Backend Maturity

| Area | Status | Score | Details |
|------|--------|-------|---------|
| **Framework** | ✅ GOOD | 85% | NestJS 10, Node 20+, TypeScript, 56 modules |
| **ORM** | ✅ GOOD | 85% | Prisma 6.19.3, 20+ models, proper migrations |
| **Auth** | ✅ GOOD | 80% | JWT, Passport, 7 role RBAC, guards, decorators |
| **Error Handling** | ✅ GOOD | 85% | ErrorEnvelope, global exception filter, correlation middleware |
| **Audit Log** | ✅ GOOD | 85% | Append-only, interceptor, decorator, 21 tests |
| **API Versioning** | ✅ GOOD | 90% | `/api/v1` prefix, Swagger UI, OpenAPI JSON |
| **Validation** | ✅ GOOD | 85% | class-validator DTOs, whitelist, ValidationPipe |
| **Module Coverage** | ⚠️ PARTIAL | 65% | 18 core endpoints operational, billing stubs exist |
| **Billing Engine** | ⚠️ PARTIAL | 40% | Invoice generate/issue/adjustment stubs exist but not full billing logic |
| **Reading Engine** | ⚠️ PARTIAL | 60% | CRUD + validation + review queue, no auto-polling |
| **Settlement Engine** | ❌ MISSING | 0% | Not started |
| **Solar Wallet** | ❌ MISSING | 0% | Not started |
| **Chilled Water (BTU)** | ❌ MISSING | 0% | Not started |
| **PDF Generation** | ❌ MISSING | 0% | Not started |
| **Bill Cycle Engine** | ❌ MISSING | 0% | Not started |
| **Tariff Engine** | ⚠️ PARTIAL | 35% | Basic CRUD exists, no versioning, no date-aware queries, no approval workflow |
| **Collections Engine** | ⚠️ PARTIAL | 50% | Dashboard KPIs + aging endpoints operational |
| **Reports Engine** | ⚠️ PARTIAL | 25% | Endpoints exist, async job lifecycle not implemented |
| **Search** | ⚠️ PARTIAL | 50% | Search endpoint exists, cross-entity search not implemented |
| **Notifications** | ⚠️ PARTIAL | 50% | Basic notification CRUD, no real-time push |
| **Tickets/Support** | ⚠️ PARTIAL | 50% | Basic CRUD, no escalation workflow |
| **CQRS** | ⚠️ PARTIAL | 50% | Pattern documented in 3 modules, not consistent |
| **DDD** | ⚠️ PARTIAL | 50% | Entity-layer in some modules, not consistent |
| **PrismaService Pattern** | ⚠️ PARTIAL | 60% | 20 controllers still use raw PrismaService (ARCH-006) |
| **Docker Compose** | ✅ GOOD | 90% | PostgreSQL 16 + Redis 7 + Backend + Frontend + DB Admin |

### Backend API Coverage (from Comprehensive API Audit)

| Endpoint | Status |
|----------|--------|
| GET /health | ✅ 200 |
| GET /projects | ✅ 200 |
| GET /meters | ✅ 200 |
| GET /readings | ✅ 200 |
| GET /invoices | ✅ 200 |
| GET /payments | ✅ 200 |
| GET /tariffs | ✅ 200 |
| GET /periods | ✅ 200 |
| GET /sim-cards | ✅ 200 |
| GET /notifications | ✅ 200 |
| GET /reports | ✅ 200 |
| GET /tickets | ✅ 200 |
| GET /support | ✅ 200 |
| GET /settings | ✅ 200 |
| GET /search | ✅ 200 |
| GET /collections/dashboard | ✅ 200 |
| GET /collections/aging | ✅ 200 |
| POST /invoices/generate | ✅ 202 (stub) |
| POST /invoices/:id/issue | ✅ 200 (stub) |
| POST /invoices/:id/adjustments | ✅ 201 (stub) |
| Total: 20 endpoints | **18/20 pass** |

---

## 5. Design Maturity

| Element | Status | Score | Details |
|---------|--------|-------|---------|
| **Design Tokens (V2)** | ✅ STRONG | 85% | 128-line tokens.css — elevation, space, font, motion, color scales |
| **Design Tokens (V1)** | ⚠️ ADEQUATE | 60% | CSS custom properties with `--color-*`, 3 themes |
| **Typography** | ⚠️ MIXED | 60% | V1: Hanken Grotesk + JetBrains Mono. V2: Inter. Disagreement between versions |
| **Icon System** | ⚠️ MIXED | 55% | V1: Material Symbols Outlined. V2: Lucide React. Two icon sets in one app |
| **Motion Language** | ✅ GOOD | 80% | V2 motion.css with premium curves (ease-out, ease-spring) |
| **Color System** | ⚠️ MIXED | 55% | V1: Teal/green brand (#00BFA5). V2: Black/white brand (#000). Contradictory |
| **Elevation System** | ✅ GOOD | 80% | V2: 9-level elevation scale. V1: Glass-card with backdrop-blur |
| **Component Library** | ⚠️ ADEQUATE | 70% | 55+ Radix-based components. Some use native HTML instead (select, input filters) |
| **Pattern Library** | ❌ MISSING | 30% | No documented patterns for list/detail/dashboard/wizard pages |
| **Design Bible** | ✅ DOCUMENTED | 90% | 751-line METERVERSE-DESIGN-BIBLE.md with 19 sections |
| **Consistency Across Pages** | ⚠️ MIXED | 60% | V1/V2 split, two sidebar implementations, SCADA dark hero breaks pattern |
| **Empty/Loading/Error States** | ⚠️ PARTIAL | 52% | Three components exist but lack three-tier taxonomy and actionable errors |

---

## 6. Testing Maturity

| Area | Status | Score | Details |
|------|--------|-------|---------|
| **Backend Unit Tests** | ✅ GOOD | 85% | 287/287 passing (34 suites) at last checkpoint |
| **Backend Integration Tests** | ⚠️ PARTIAL | 60% | Reading-validation (7 tests), API audit (18/20) |
| **Contract Tests (TDD)** | ⚠️ PARTIAL | 50% | 6 spec files, ~70 tests, 7 expected TDD failures |
| **Frontend Tests** | ❌ MINIMAL | 10% | No frontend unit tests. E2E Playwright exists but framework-only |
| **Playwright E2E** | ⚠️ PARTIAL | 20% | Browser MCP configured, some spec files, limited coverage |
| **Compliance Tests** | ⚠️ PARTIAL | 40% | 21 compliance JSON reports exist, 10/17 baseline |
| **Security Tests** | ❌ MINIMAL | 10% | Auth required confirmed, no pentest, no SAST/DAST |
| **Performance/Load Tests** | ❌ MISSING | 0% | No k6/artillery/scenario |
| **Visual Regression** | ❌ MISSING | 0% | No screenshot comparison |
| **Accessibility Tests** | ❌ MISSING | 0% | No axe/pa11y integration |
| **Test CI Pipeline** | ❌ MISSING | 0% | Tests only run locally |
| **Mutation Testing** | ❌ MISSING | 0% | No stryker or similar |

---

## 7. Security Maturity

| Control | Status | Score | Details |
|---------|--------|-------|---------|
| **JWT Authentication** | ✅ GOOD | 90% | Passport JWT strategy, token validation, configurable expiry |
| **RBAC Authorization** | ⚠️ PARTIAL | 60% | 7 of 16 roles implemented, action-level permissions not audited |
| **Correlation Middleware** | ✅ GOOD | 85% | x-correlation-id header, auto-generated fallback |
| **Error Envelope** | ✅ GOOD | 85% | No stack traces leaked, structured error codes |
| **API Auth Enforcement** | ✅ GOOD | 90% | 401 returned without token on all protected endpoints |
| **Input Validation** | ✅ GOOD | 85% | class-validator DTOs, whitelist, forbidNonWhitelisted |
| **Append-Only Audit** | ✅ GOOD | 85% | AuditService only exposes create(), interceptor for mutating ops |
| **Secrets Management** | ❌ WEAK | 30% | .env files gitignored but no vault/secret manager |
| **SSL/TLS** | ❌ MISSING | 0% | No HTTPS in production |
| **Rate Limiting** | ❌ MISSING | 0% | No throttling |
| **CORS** | ⚠️ PARTIAL | 50% | Configured but no production restrictions |
| **SQL Injection Prevention** | ✅ GOOD | 90% | Prisma ORM parameterized queries |
| **XSS Protection** | ✅ GOOD | 80% | Next.js auto-escapes, React JSX safe |
| **CSRF** | ⚠️ PARTIAL | 50% | CSRF guard exists, integration not verified |
| **Security Scan (CI)** | ❌ MISSING | 0% | Trivy + TruffleHog jobs defined in `.github/workflows/ci.yml` but never run |
| **SAST/DAST** | ❌ MISSING | 0% | No Semgrep, SonarQube, or similar |
| **Secrets Scan** | ❌ MISSING | 0% | TruffleHog in CI but never executed |
| **Dependency Audit** | ❌ MISSING | 0% | npm audit not in regular pipeline |
| **Security Audit** | ❌ MISSING | 0% | No formal security audit conducted |
| **GDPR/Compliance** | ❌ NOT REVIEWED | 0% | No privacy review for customer data |

---

## 8. Performance Maturity

| Metric | Status | Score | Details |
|--------|--------|-------|---------|
| **Frontend Build Time** | ✅ GOOD | 85% | Next.js 16 Turbopack, sub-minute builds |
| **Backend Compilation** | ✅ GOOD | 85% | TypeScript, clean builds |
| **Bundle Size Analysis** | ❌ MISSING | 0% | No bundle analyzer, no code splitting audit |
| **Core Web Vitals** | ❌ UNKNOWN | 0% | No Lighthouse scores, no real-user monitoring |
| **API Response Times** | ❌ UNKNOWN | 0% | No APM, no request timing instrumentation |
| **Database Query Performance** | ❌ UNKNOWN | 0% | No query analysis, no index review |
| **Caching Strategy** | ❌ NOT IMPLEMENTED | 0% | Redis 7 configured in docker-compose but not used in app |
| **CDN/Asset Optimization** | ❌ NOT CONFIGURED | 0% | Static assets served from Next.js, no CDN |
| **Image Optimization** | ⚠️ PARTIAL | 40% | Next.js Image component available, usage not audited |
| **Lazy Loading** | ⚠️ PARTIAL | 50% | React.lazy available, systematic audit not done |
| **Memory Profiling** | ❌ NOT DONE | 0% | No heap snapshots, no memory leak analysis |
| **Stress Testing** | ⚠️ PARTIAL | 20% | f8-stress-results.json exists for settlement engine only |
| **Load Testing** | ❌ NOT DONE | 0% | No k6/artillery scenarios |
| **Performance Budget** | ❌ NOT DEFINED | 0% | No budgets for bundle size, API latency, or render time |

---

## 9. Accessibility Maturity

| WCAG Criterion | Status | Score | Details |
|----------------|--------|-------|---------|
| **Keyboard Navigation** | ❌ FAIL | 25% | V2 partial (Cmd+K, arrow keys in admin). V1 has none. No Tab order management |
| **Focus Management** | ❌ FAIL | 20% | No visible focus rings. Tab order not verified |
| **ARIA Attributes** | ❌ FAIL | 15% | No aria-labels on icon buttons. No aria-expanded on collapse. No role attributes |
| **Screen Reader Support** | ❌ FAIL | 10% | No aria-live regions. No announcements for dynamic content |
| **Color Contrast** | ⚠️ PARTIAL | 50% | V2 light/dark themes exist but contrast not measured against WCAG AA |
| **Text Resizing** | ❌ FAIL | 20% | Fixed layouts break at zoom >125% |
| **Reduced Motion** | ⚠️ PARTIAL | 50% | Theme store has `reducedMotion` setting, not verified in components |
| **High Contrast Mode** | ⚠️ PARTIAL | 50% | Theme store has `highContrast` mode, not verified |
| **Alt Text on Images** | ⚠️ PARTIAL | 50% | Usage varies, systematic audit not done |
| **Form Labeling** | ✅ GOOD | 70% | Most inputs have labels/aria-labels, some native selects missing |
| **Error Announcements** | ❌ MISSING | 0% | No inline error announcements for screen readers |
| **Skip Navigation** | ❌ MISSING | 0% | No skip-to-content link |
| **Page Language** | ✅ GOOD | 90% | `<html lang="ar" dir="rtl">` correctly set |
| **Accessibility Tests** | ❌ MISSING | 0% | No axe/pa11y integration |
| **WCAG 2.1 AA Compliance** | ❌ NOT ACHIEVED | 34% | Compliance report avg score across all pages |

---

## 10. API Maturity

| Aspect | Status | Score | Details |
|--------|--------|-------|---------|
| **RESTful Design** | ✅ GOOD | 85% | Resource-oriented, proper HTTP methods |
| **API Versioning** | ✅ GOOD | 90% | `/api/v1` global prefix |
| **OpenAPI Documentation** | ✅ GOOD | 85% | Swagger UI + JSON spec, JWT bearer pre-configured |
| **Error Envelope** | ✅ GOOD | 85% | Consistent `{code, message, details, correlationId}` |
| **Correlation IDs** | ✅ GOOD | 85% | x-correlation-id in request/response |
| **Validation** | ✅ GOOD | 85% | class-validator DTOs, 422 on P2002 |
| **Authentication** | ✅ GOOD | 90% | JWT Bearer, 401 enforcement verified |
| **Authorization** | ⚠️ PARTIAL | 60% | 7 roles, guards in place, action-level permissions not complete |
| **Rate Limiting** | ❌ MISSING | 0% | No throttling guard |
| **Pagination** | ⚠️ PARTIAL | 50% | Some endpoints support pagination, not universal |
| **Filtering/Sorting** | ⚠️ PARTIAL | 50% | Available on some endpoints, not consistent |
| **HATEOAS** | ❌ NOT IMPLEMENTED | 0% | No hypermedia links in responses |
| **Webhooks** | ❌ NOT IMPLEMENTED | 0% | No event-driven API |
| **API Versioning Strategy** | ✅ GOOD | 85% | URI-based versioning, clear strategy |
| **Deprecation Policy** | ❌ NOT DEFINED | 0% | No sunset headers, no deprecation notice pattern |
| **API Audit Logging** | ✅ GOOD | 85% | Global interceptor for mutating operations |
| **Rate Limit Headers** | ❌ MISSING | 0% | No X-RateLimit-* headers |
| **OpenAPI Contract Tests** | ⚠️ PARTIAL | 50% | 6 contract spec files, 70 tests, mapped to operationIds |

---

## 11. Database Maturity

| Aspect | Status | Score | Details |
|--------|--------|-------|---------|
| **ORM** | ✅ GOOD | 85% | Prisma 6.19.3, proper migration pipeline |
| **Schema Design** | ⚠️ PARTIAL | 55% | Single schema `sim_system` only. Multi-schema designed but not implemented |
| **Migrations** | ✅ GOOD | 80% | Prisma migrations with proper history |
| **Indexes** | ⚠️ UNKNOWN | 40% | Prisma auto-generates some, no manual index optimization |
| **Query Performance** | ❌ UNKNOWN | 30% | No EXPLAIN ANALYZE, no slow query log |
| **Connection Pooling** | ❌ NOT CONFIGURED | 20% | Default Prisma pool, no PgBouncer |
| **Backup Strategy** | ❌ NOT DEFINED | 10% | No automated backup, no pg_dump script in production |
| **Disaster Recovery** | ❌ NOT DEFINED | 5% | No failover, no replication, no point-in-time recovery |
| **Data Seeding** | ✅ GOOD | 80% | Seed data for 3 customers, 3 meters, readings, invoices, payments |
| **Migration Strategy** | ⚠️ PARTIAL | 45% | Multi-schema migration planned but not executed |
| **Database Monitoring** | ❌ NOT IMPLEMENTED | 0% | No pg_stat_statements, no monitoring |
| **Connection Security** | ❌ NOT CONFIGURED | 10% | No SSL for DB connections |
| **Schema Documentation** | ⚠️ PARTIAL | 50% | Prisma schema documents models, table relationships not fully documented |

---

## 12. Repository Maturity

| Aspect | Status | Score | Details |
|--------|--------|-------|---------|
| **Version Control** | ⚠️ PARTIAL | 50% | Git with 1 commit on main. Multiple feature branches exist but never merged |
| **Branch Strategy** | ❌ NOT DEFINED | 10% | No git-flow, no trunk-based, no PR workflow |
| **CI/CD Pipeline** | ⚠️ DEFINED BUT NOT RUN | 30% | `.github/workflows/ci.yml` exists with 4 jobs but never executed |
| **Commit Convention** | ⚠️ PARTIAL | 40% | `TXXX: description` pattern used inconsistently |
| **Code Review Process** | ❌ NOT DEFINED | 0% | No PR template, no review checklist |
| **Environment Management** | ⚠️ PARTIAL | 40% | .env.example files exist, dev/prod split not defined |
| **Docker Support** | ✅ GOOD | 80% | docker-compose.yml with 6 services, Dockerfile exists |
| **Infrastructure as Code** | ❌ NOT IMPLEMENTED | 0% | No Terraform, no Ansible, no Pulumi |
| **Monitoring/Alerting** | ❌ NOT IMPLEMENTED | 0% | No Datadog, Grafana, Sentry, or PagerDuty |
| **Logging** | ⚠️ PARTIAL | 50% | NestJS logger configured, centralized logging not implemented |
| **Documentation** | ⚠️ EXCESSIVE | 85% | There are more docs than code. 220+ report files, 44 docs files. Documentation drift is a risk |
| **Secrets Management** | ❌ WEAK | 20% | .env in gitignore, no vault, no CI/CD secrets configured |
| **Release Strategy** | ❌ NOT DEFINED | 0% | No semantic versioning, no changelog automation, no release process |
| **Issue Tracking** | ❌ NOT USED | 0% | No GitHub Issues, no Jira, no Linear integration |
| **Repository Structure** | ⚠️ MESSY | 35% | Root D:\meter has 30+ entries. Main source lives under /Meter/. Legacy files everywhere |

---

## 13. Remaining Work

### 13.1 Immediate P0 Fixes (Must Do Before Any Feature Work)

| ID | Task | Area | Effort | Source |
|----|------|------|--------|--------|
| P0-001 | Replace placeholder content in Customer tabs (Wallet, Consumption, Ledger) | Frontend | 2 days | UX Gap Analysis |
| P0-002 | Replace manual div charts with Recharts on Financial Dashboard | Frontend | 1 day | UX Gap Analysis |
| P0-003 | Replace manual div charts with Recharts on Collections Dashboard | Frontend | 1 day | UX Gap Analysis |
| P0-004 | Choose V1 or V2 design language and unify ALL pages | Design | 3 weeks | UX Gap Analysis |
| P0-005 | Implement 3 density modes (Comfortable/Normal/Compact) | Frontend | 1 week | Design Compliance Report |
| P0-006 | Add WCAG 2.1 AA accessibility (aria-labels, focus rings, keyboard nav) | Frontend | 3 weeks | Design Compliance Report |
| P0-007 | Add responsive breakpoints (3 breakpoints per Design Bible) | Frontend | 2 weeks | Design Compliance Report |
| P0-008 | Fix CustomerWorkspace floating FAB → toolbar button | Frontend | 1 day | UX Gap Analysis |
| P0-009 | Replace native `<select>`/`<input>` filters with design system components | Frontend | 3 days | UX Gap Analysis |
| P0-010 | Remove code block from home dashboard, replace with business KPIs | Frontend | 1 day | UX Gap Analysis |
| P0-011 | Make quick actions real (not toast-based) — Simulate, Import, etc. | Frontend | 3 days | UX Gap Analysis |
| P0-012 | Add filter bars to Invoices and Payments pages (match Customers/Meters) | Frontend | 1 day | UX Gap Analysis |
| P0-013 | Replace manual tab buttons with Radix Tabs component on Readings page | Frontend | 1 day | UX Gap Analysis |
| P0-014 | Add test/live mode toggle in global header | Frontend | 3 days | UX Gap Analysis |
| P0-015 | Migrate T086 — Core DB schema (15 tables) | Database | 1 week | AGENTS.md |
| P0-016 | Implement Solar Wallet backend | Backend | 2 weeks | Operational Reality Report |
| P0-017 | Implement Chilled Water (BTU) backend | Backend | 2 weeks | Operational Reality Report |
| P0-018 | Implement PDF Generation backend | Backend | 3 weeks | Operational Reality Report |
| P0-019 | Implement Bill Cycle Governance backend | Backend | 2 weeks | Operational Reality Report |
| P0-020 | Implement Settlement Engine backend | Backend | 3 weeks | Operational Reality Report |
| P0-021 | Add 9 missing RBAC roles (implement 16-profile system) | Backend | 1 week | AGENTS.md |
| P0-022 | Build production CI/CD pipeline (GitHub Actions) | DevOps | 1 week | Final Remediation Plan |
| P0-023 | Configure SSL/TLS + Nginx reverse proxy | DevOps | 3 days | Production Deployment Guide |
| P0-024 | Set up production PostgreSQL with backup strategy | DevOps | 3 days | Production Deployment Guide |
| P0-025 | Rebuild Explorer per Design Bible §14 spec | Frontend | 2 weeks | Design Compliance Report |
| P0-026 | Build Inspector per Design Bible §13 spec | Frontend | 1 week | Design Compliance Report |
| P0-027 | Implement Settings page | Frontend | 1 week | Design Compliance Report |

### 13.2 P1 — Should Do Before Launch

| ID | Task | Area | Effort | Source |
|----|------|------|--------|--------|
| P1-001 | Add command palette to ALL V1 pages | Frontend | 1 week | UX Gap Analysis |
| P1-002 | Add global search header bar | Frontend | 1 week | UX Gap Analysis |
| P1-003 | Add column management to tables (hide/show, reorder, density) | Frontend | 1 week | UX Gap Analysis |
| P1-004 | Add keyboard shortcuts to all pages | Frontend | 2 weeks | UX Gap Analysis |
| P1-005 | Add scope/tenant selector in header (multi-area) | Frontend | 1 week | UX Gap Analysis |
| P1-006 | Fill V2 panel placeholders (Explorer tree, Inspector tabs) | Frontend | 1 week | UX Gap Analysis |
| P1-007 | Add bulk selection + batch actions to list pages | Frontend | 1 week | UX Gap Analysis |
| P1-008 | Add export to CSV/PDF on all list pages | Frontend | 1 week | UX Gap Analysis |
| P1-009 | Add inline row actions (three-dot context menu) | Frontend | 1 week | UX Gap Analysis |
| P1-010 | Add notification center in header | Frontend | 1 week | UX Gap Analysis |
| P1-011 | Add revenue breakdown charts to Financial page | Frontend | 3 days | UX Gap Analysis |
| P1-012 | Add reading trend chart to Readings/Meter detail | Frontend | 3 days | UX Gap Analysis |
| P1-013 | Add tariff comparison and simulation | Frontend | 1 week | UX Gap Analysis |
| P1-014 | Add time-series reading chart to Meter detail | Frontend | 3 days | UX Gap Analysis |
| P1-015 | Implement customer detail page `/units/[id]` | Frontend | 3 days | UX Gap Analysis |
| P1-016 | Add three-tier error/empty/loading states | Frontend | 1 week | Design Compliance Report |
| P1-017 | Remove `animate-section` page transition animations | Frontend | 3 days | Design Compliance Report |
| P1-018 | Add undo toasts for destructive actions | Frontend | 1 week | Design Compliance Report |
| P1-019 | Implement tariff version engine (backend) | Backend | 2 weeks | Master Roadmap Alignment |
| P1-020 | Implement customer ledger engine (backend) | Backend | 1 week | Master Roadmap Alignment |
| P1-021 | Implement data migration scripts (SBill, Collection Tracker) | Backend | 3 weeks | AGENTS.md |
| P1-022 | Implement T048a — approve/reject/correct review actions | Backend | 1 week | AGENTS.md |
| P1-023 | Implement T049 — FE-030 Readings API migration | Frontend | 1 week | AGENTS.md |
| P1-024 | Add backend unit tests for missing modules | Backend | 2 weeks | Testing Maturity |
| P1-025 | Add Playwright E2E tests for all critical paths | Frontend | 2 weeks | Testing Maturity |
| P1-026 | Configure Sentry or similar error monitoring | DevOps | 3 days | Final Remediation Plan |
| P1-027 | Set up automated DB backups | DevOps | 2 days | Production Deployment Guide |
| P1-028 | Add Consumptions view API + frontend migration | Both | 1 week | Final Remediation Plan |
| P1-029 | Fix contract test timeouts (12 tests at 35s) | Backend | 1 day | Final Remediation Plan |
| P1-030 | Ratify Constitution template | Docs | 1 day | Final Remediation Plan |

### 13.3 P2 — Nice to Have for Launch

| ID | Task | Area | Effort | Source |
|----|------|------|--------|--------|
| P2-001 | Add geospatial map view for meters | Frontend | 2 weeks | UX Gap Analysis |
| P2-002 | Add aging escalation cues on invoices | Frontend | 2 days | UX Gap Analysis |
| P2-003 | Add column-level filtering in table headers | Frontend | 1 week | UX Gap Analysis |
| P2-004 | Add inline status change (click badge → dropdown) | Frontend | 3 days | UX Gap Analysis |
| P2-005 | Add invoice preview/receipt visual in detail | Frontend | 3 days | UX Gap Analysis |
| P2-006 | Add payment method breakdown chart | Frontend | 2 days | UX Gap Analysis |
| P2-007 | Add bulk reconciliation for payments | Frontend | 3 days | UX Gap Analysis |
| P2-008 | Add tariff calculator (input consumption → calculate cost) | Frontend | 3 days | UX Gap Analysis |
| P2-009 | Add tariff version diff comparison | Frontend | 3 days | UX Gap Analysis |
| P2-010 | Add tariff approval workflow | Both | 1 week | UX Gap Analysis |
| P2-011 | Add collection forecast to Collections page | Backend | 1 week | UX Gap Analysis |
| P2-012 | Add anomaly detection cues on readings | Frontend | 3 days | UX Gap Analysis |
| P2-013 | Add predictive maintenance indicator on meters | Backend | 1 week | UX Gap Analysis |
| P2-014 | Add context menus and overflow menus globally | Frontend | 1 week | Design Compliance Report |
| P2-015 | Add customer timeline as default tab | Frontend | 2 days | UX Gap Analysis |
| P2-016 | Implement auto-polling reading ingestion adapter | Backend | 1 week | AGENTS.md |
| P2-017 | Implement Symbiot bridge phase 1 | Backend | 3 weeks | AGENTS.md |
| P2-018 | Add Redis caching layer | Backend | 1 week | Performance Maturity |
| P2-019 | Add API rate limiting | Backend | 3 days | Security Maturity |
| P2-020 | Add dependency audit to CI pipeline | DevOps | 2 days | Security Maturity |
| P2-021 | Add Lighthouse CI for performance budget | DevOps | 2 days | Performance Maturity |
| P2-022 | Add k6 load test scenarios | DevOps | 1 week | Performance Maturity |
| P2-023 | Unify documentation into single-source-of-truth | Docs | 2 weeks | Repository Maturity |
| P2-024 | Clean up legacy files from repository | DevOps | 1 week | Repository Maturity |
| P2-025 | Set up GitHub Issues for task tracking | DevOps | 1 day | Repository Maturity |

### 13.4 P3 — Post-Launch Enhancement

| ID | Task | Area | Effort | Source |
|----|------|------|--------|--------|
| P3-001 | Implement multi-schema database (Core + Features + 15 Areas) | Database | 4 weeks | AGENTS.md |
| P3-002 | Implement 3 availability plans (Full/Safety/Failover) | Infrastructure | 4 weeks | AGENTS.md |
| P3-003 | Implement Symbiot bridge full (10 TCP × 100 HTTP) | Backend | 6 weeks | AGENTS.md |
| P3-004 | Implement webhooks/event-driven API | Backend | 2 weeks | API Maturity |
| P3-005 | Add HATEOAS links to API responses | Backend | 2 weeks | API Maturity |
| P3-006 | Implement full data migration from legacy systems | Backend | 4 weeks | AGENTS.md |
| P3-007 | Implement 32 JasperReports templates | Backend | 3 weeks | AGENTS.md |
| P3-008 | Add mutation testing (Stryker) | Backend | 1 week | Testing Maturity |
| P3-009 | Add visual regression testing (Playwright) | Frontend | 1 week | Testing Maturity |
| P3-010 | Add formal security audit + penetration test | Security | 2 weeks | Security Maturity |
| P3-011 | Implement Infrastructure as Code (Terraform) | DevOps | 3 weeks | Repository Maturity |
| P3-012 | Implement multi-language i18n beyond Arabic/English | Frontend | 2 weeks | AGENTS.md |
| P3-013 | Add digital twin visualization for meters | Frontend | 4 weeks | UX Gap Analysis |
| P3-014 | Add SCADA-style grid overview (Siemens pattern) | Frontend | 4 weeks | UX Gap Analysis |
| P3-015 | Add AI anomaly detection for readings | Backend | 3 weeks | UX Gap Analysis |
| P3-016 | Add IoT device management for Symbiot meters | Backend | 4 weeks | AGENTS.md |
| P3-017 | Implement mobile app (React Native) | Mobile | 8 weeks | Future |
| P3-018 | Add offline mode for field workers | Mobile | 4 weeks | Future |

---

## 14. Implementation Order

The implementation order is defined by dependencies. Work is organized into 9 waves:

### Wave 0: Stabilize & Unify (Weeks 1-2)
*No new features. Fix the critical UX and infrastructure defects first.*

| Order | Task ID | Description | Days |
|-------|---------|-------------|------|
| 1 | P0-004 | Choose V2 design language, plan V1→V2 migration | 2 |
| 2 | P0-002 | Replace manual charts with Recharts | 1 |
| 3 | P0-003 | Replace manual charts with Recharts (Collections) | 1 |
| 4 | P0-009 | Replace native selects/inputs with DS components | 3 |
| 5 | P0-010 | Remove code block, add business KPIs to dashboard | 1 |
| 6 | P0-008 | Fix floating FAB | 1 |
| 7 | P0-013 | Replace manual tabs with Radix Tabs | 1 |
| 8 | P0-012 | Add missing filter bars | 1 |
| 9 | P0-011 | Make quick actions real | 3 |
| 10 | P1-029 | Fix contract test timeouts | 1 |
| 11 | P1-030 | Ratify Constitution | 1 |

### Wave 1: Backbone & Missing Engines (Weeks 3-6)
*Implement the 5 critical missing backend engines.*

| Order | Task ID | Description | Days |
|-------|---------|-------------|------|
| 12 | P0-015 | T086 — Core DB schema (15 tables) | 5 |
| 13 | P0-021 | Add 9 missing RBAC roles | 5 |
| 14 | P0-016 | Solar Wallet backend | 10 |
| 15 | P0-017 | Chilled Water BTU backend | 10 |
| 16 | P0-020 | Settlement Engine | 15 |
| 17 | P0-019 | Bill Cycle Governance | 10 |
| 18 | P0-018 | PDF Generation | 15 |
| 19 | P1-019 | Tariff version engine | 10 |
| 20 | P1-020 | Customer ledger engine | 5 |

### Wave 2: Design Overhaul (Weeks 5-8)
*Runs in parallel with Wave 1 (frontend team).*

| Order | Task ID | Description | Days |
|-------|---------|-------------|------|
| 21 | P0-025 | Rebuild Explorer (Design Bible §14) | 10 |
| 22 | P0-026 | Build Inspector (Design Bible §13) | 5 |
| 23 | P0-027 | Implement Settings page | 5 |
| 24 | P0-001 | Replace all placeholder tab content | 2 |
| 25 | P1-016 | Three-tier error/empty/loading states | 5 |
| 26 | P1-018 | Undo toasts for destructive actions | 5 |
| 27 | P0-005 | Implement 3 density modes | 5 |
| 28 | P0-007 | Add responsive breakpoints | 10 |
| 29 | P0-006 | WCAG 2.1 AA accessibility | 15 |

### Wave 3: Frontend Feature Parity (Weeks 7-10)
*Parallel with Wave 2.*

| Order | Task ID | Description | Days |
|-------|---------|-------------|------|
| 30 | P1-022 | T048a — approve/reject/correct review | 5 |
| 31 | P1-023 | T049 — Readings API migration | 5 |
| 32 | P1-028 | Consumption view API + migration | 5 |
| 33 | P0-014 | Test/live mode toggle | 3 |
| 34 | P1-001 | Command palette on all pages | 5 |
| 35 | P1-002 | Global search header bar | 5 |
| 36 | P1-004 | Keyboard shortcuts everywhere | 10 |
| 37 | P1-005 | Scope/tenant selector | 5 |
| 38 | P1-006 | Fill V2 panel placeholders | 5 |
| 39 | P1-007 | Bulk selection + batch actions | 5 |
| 40 | P1-008 | Export CSV/PDF on list pages | 5 |
| 41 | P1-009 | Inline row actions (three-dot menu) | 5 |
| 42 | P1-010 | Notification center header | 5 |

### Wave 4: Data & Analytics (Weeks 9-11)
| Order | Task ID | Description | Days |
|-------|---------|-------------|------|
| 43 | P1-011 | Revenue breakdown charts | 3 |
| 44 | P1-012 | Reading trend chart | 3 |
| 45 | P1-013 | Tariff comparison + simulation | 5 |
| 46 | P1-014 | Time-series chart Meter detail | 3 |
| 47 | P1-015 | Unit detail page | 3 |
| 48 | P1-017 | Remove animate-section transitions | 3 |
| 49 | P2-001 | Geospatial map for meters | 10 |
| 50 | P2-002 | Aging escalation cues | 2 |
| 51 | P2-003 | Column-level filtering | 5 |
| 52 | P2-005 | Invoice preview/receipt | 3 |

### Wave 5: Infrastructure & DevOps (Weeks 10-12)
| Order | Task ID | Description | Days |
|-------|---------|-------------|------|
| 53 | P0-022 | Production CI/CD pipeline | 5 |
| 54 | P0-023 | SSL/TLS + Nginx | 3 |
| 55 | P0-024 | Production PostgreSQL + backup | 3 |
| 56 | P1-024 | Backend unit tests for missing modules | 10 |
| 57 | P1-025 | Playwright E2E critical paths | 10 |
| 58 | P1-026 | Sentry error monitoring | 3 |
| 59 | P1-027 | Automated DB backups | 2 |
| 60 | P2-018 | Redis caching layer | 5 |
| 61 | P2-020 | Dependency audit CI | 2 |
| 62 | P2-022 | k6 load test scenarios | 5 |
| 63 | P2-023 | Documentation consolidation | 10 |
| 64 | P2-024 | Legacy file cleanup | 5 |

### Wave 6: Data Migration (Weeks 12-15)
| Order | Task ID | Description | Days |
|-------|---------|-------------|------|
| 65 | P1-021 | SBill data migration scripts | 15 |
| 66 | P1-021 | Collection Tracker migration | 15 |

### Wave 7: Hardening (Weeks 14-16)
| Order | Task ID | Description | Days |
|-------|---------|-------------|------|
| 67 | P2-012 | Reading anomaly detection | 3 |
| 68 | P2-013 | Predictive maintenance | 5 |
| 69 | P2-014 | Context/overflow menus | 5 |
| 70 | P2-016 | Auto-polling ingestion | 5 |
| 71 | P2-025 | GitHub Issues setup | 1 |
| 72 | P2-021 | Lighthouse CI | 2 |
| 73 | P2-019 | API rate limiting | 3 |

### Wave 8: Post-Launch — Availability & Scale (Weeks 17+)
| Order | Task ID | Description | Weeks |
|-------|---------|-------------|-------|
| 74 | P3-001 | Multi-schema database | 4 |
| 75 | P3-003 | Symbiot bridge full | 6 |
| 76 | P3-002 | 3 availability plans | 4 |
| 77 | P3-006 | Full data migration | 4 |
| 78 | P3-010 | Security audit + pentest | 2 |
| 79 | P3-011 | Infrastructure as Code | 3 |
| 80 | P3-005 | HATEOAS/hypermedia API | 2 |

---

## 15. Critical Path

The critical path is defined by task dependencies. Delays on any critical-path task delay the launch.

```
Wave 0 ─────────────────────────────────────────────┐
(Stabilize)                                          │
                                                     ▼
Wave 1 ─── P0-015 (Core DB) ───P0-021 (16 RBAC)────►│
(Backbone)                         │                 │
                                   ▼                 │
                          P0-016/017/019/020         │
                          (Missing Engines)          │
                                   │                 │
                                   ▼                 ▼
Wave 2 ───────────────────── P0-025 (Explorer) ────►│
(Design)                          │                  │
                                  ▼                  │
                         P0-005/006/007              │
                         (Density/Access/Resp)       │
                                  │                  │
                                  ▼                  ▼
Wave 3 ───────────────────── Frontend Feature Parity►│
(FE Parity)                                          │
                                                     ▼
Wave 4 ───────────────────── Data & Analytics ──────►│
(Data)                                               │
                                                     ▼
Wave 5 ───────────────────── Infrastructure ────────►│
(DevOps)                                             │
                                                     ▼
Wave 6 ───────────────────── Data Migration ────────►│
(Migration)                                          │
                                                     ▼
Wave 7 ───────────────────── Hardening ─────────────►│
(Hardening)                                          │
                                                     ▼
                                          LAUNCH GATE
```

### Critical Path Tasks (Any Delay = Launch Delay)

| Rank | Task | Weeks | Dependencies | Slack |
|------|------|-------|--------------|-------|
| 1 | P0-015 Core DB schema | 1 | None | 0 |
| 2 | P0-021 16 RBAC roles | 1 | P0-015 | 0 |
| 3 | P0-016 Solar Wallet | 2 | P0-015, P0-021 | 0 |
| 4 | P0-017 Chilled Water BTU | 2 | P0-015, P0-021 | 0 |
| 5 | P0-019 Bill Cycle | 2 | P0-015, P0-021 | 0 |
| 6 | P0-020 Settlement Engine | 3 | P0-015, P0-021 | 0 |
| 7 | P0-018 PDF Generation | 3 | P0-015 | 1 week |
| 8 | P0-025 Explorer rebuild | 2 | P0-004 (Wave 0) | 1 week |
| 9 | P0-007 Responsive breakpoints | 2 | P0-004 | 1 week |
| 10 | P0-006 WCAG accessibility | 3 | P0-004 | 1 week |
| 11 | P0-022 CI/CD pipeline | 1 | None (parallel) | 2 weeks |
| 12 | P0-024 Production DB | 3 days | None (parallel) | 3 weeks |
| 13 | P1-021 Data migration | 3 | P0-015, P0-016, P0-017, P0-020 | 1 week |

**Critical Path Duration**: 15 weeks (from Wave 1 start)  
**Shortest Possible Launch**: 16 weeks from today (Wave 0 + critical path)

---

## 16. Risk Matrix

| ID | Risk | Probability | Impact | Score | Mitigation |
|----|------|------------|--------|-------|------------|
| R01 | Design language conflict (V1 vs V2) causes rebuild of existing pages | High (80%) | High (3 weeks delay) | **24** | Decision must be made in Wave 0. Recommend V2 as the survivor |
| R02 | Missing backend engines (Solar, BTU, Settlement) require more time than estimated | Medium (50%) | Critical (6-10 weeks total) | **20** | Start Wave 1 immediately. Use stub-first approach to unblock frontend |
| R03 | Accessibility retrofit requires rebuilding UI components | High (70%) | Medium (3 weeks) | **21** | Start accessibility audit in Wave 0. Add aria-labels incrementally |
| R04 | RBAC expansion (7→16 roles) breaks existing auth | Medium (40%) | High (2 weeks if regression) | **16** | Write regression tests before expansion. Feature-flag new roles |
| R05 | No CI/CD means manual deployment errors in production | High (80%) | High (production outage) | **24** | Build CI/CD in Wave 5 as parallel track. Do not launch without it |
| R06 | Database multi-schema migration from single schema risks data loss | Medium (40%) | Critical (data loss) | **20** | Do NOT attempt multi-schema in P0/P1. Defer to P3. Work in single schema for launch |
| R07 | Documentation drift — 220+ report files contradict each other | High (70%) | Medium (wasted effort) | **21** | Consolidate all plans into THIS document as single source of truth. Archive old reports |
| R08 | No performance baseline — unknown if system handles production load | High (60%) | High (production crash) | **18** | Add k6 load testing in Wave 5. Set performance budget |
| R09 | No security audit before launch — compliance risk | Medium (40%) | Critical (legal/reputational) | **16** | At minimum run CI security jobs (Trivy, TruffleHog, npm audit) before launch |
| R10 | Team size (1-2 devs) insufficient for parallel work streams | High (70%) | High (schedule slip) | **21** | Prioritize ruthlessly. No P2/P3 work until P0/P1 complete |
| R11 | 91 existing test failures (from operational reality report) indicate regression risk | Medium (50%) | High (broken features) | **15** | Stabilize tests in Wave 0 before adding new features |
| R12 | No backup/DR strategy — single point of failure for production DB | High (70%) | Critical (data loss) | **28** | Configure automated pg_dump in Wave 5. Defer replication to P3 |

### Risk Response Plan

| Score | Category | Response |
|-------|----------|----------|
| >= 20 | **RED** — Must mitigate before launch | R01, R05, R07, R10, R12 |
| 15-19 | **AMBER** — Mitigate during Waves 1-5 | R02, R03, R04, R06, R08, R09, R11 |
| < 15 | **GREEN** — Accept and monitor | Lower-priority risks |

---

## 17. Estimated Completion Percentage

### By Domain

| Domain | Current | After Wave 0 | After Wave 1 | After Wave 3 | Launch (Wave 7) |
|--------|---------|-------------|-------------|-------------|-----------------|
| Architecture | 25% | 25% | 35% | 40% | 60% |
| Frontend | 55% | 65% | 65% | 85% | 90% |
| Backend | 50% | 50% | 75% | 80% | 85% |
| Design | 60% | 65% | 65% | 80% | 85% |
| Testing | 35% | 40% | 40% | 50% | 70% |
| Security | 40% | 40% | 40% | 45% | 60% |
| Performance | 10% | 10% | 10% | 15% | 40% |
| Accessibility | 20% | 25% | 25% | 60% | 75% |
| API | 60% | 60% | 70% | 75% | 80% |
| Database | 40% | 40% | 55% | 55% | 60% |
| Repository | 30% | 35% | 35% | 40% | 55% |
| **Overall** | **38%** | **42%** | **48%** | **59%** | **70%** |

### By Priority

| Priority | Total Tasks | Completed | In Progress | Not Started | Completion % |
|----------|-------------|-----------|-------------|-------------|--------------|
| P0 | 27 | 0 | 0 | 27 | 0% |
| P1 | 30 | 0 | 0 | 30 | 0% |
| P2 | 25 | 0 | 0 | 25 | 0% |
| P3 | 18 | 0 | 0 | 18 | 0% |
| **Total** | **100** | **0** | **0** | **100** | **0%** |

*Note: Existing work from T001-T054 is reflected in domain maturity % above. This plan covers remaining work only.*

### Completion Trajectory

```
100% ┤
     │                              ┌────────── P3: 18 tasks
 80% ┤                              │
     │                    ┌──────────┤ P2: 25 tasks
 60% ┤                    │          │
     │          ┌─────────┤          │ P1: 30 tasks
 40% ┤          │         │          │
     │ ┌────────┤         │          │ P0: 27 tasks
 20% ┤ │        │         │          │
     │ │        │         │          │
  0% ┤─┴────────┴─────────┴──────────┴──────────
     Today   Wave 2    Wave 4     Launch
     (0%)    (25%)     (50%)      (70%)
```

---

## 18. Estimated Weeks Remaining

### By Wave

| Wave | Description | Duration | Parallel | Elapsed Weeks | Cumulative |
|------|-------------|----------|----------|---------------|------------|
| 0 | Stabilize & Unify | 2 weeks | 1 team | 2 | 2 |
| 1 | Backbone & Missing Engines | 4 weeks | Backend team | 4 | 6 |
| 2 | Design Overhaul | 4 weeks | Frontend team | 4 | 6 |
| 3 | Frontend Feature Parity | 4 weeks | Frontend team | 4 | 10 |
| 4 | Data & Analytics | 3 weeks | Frontend team | 3 | 13 |
| 5 | Infrastructure & DevOps | 3 weeks | Parallel 2nd track | 3 | 13 |
| 6 | Data Migration | 4 weeks | Backend team | 4 | 17 |
| 7 | Hardening | 3 weeks | Full team | 3 | 20 |
| 8 | Post-Launch (P3) | 17+ weeks | Post-launch | — | — |

### Timeline (Best Case)

```
Week  0  2  4  6  8  10  12  14  16  18  20
       │  │  │  │  │   │   │   │   │   │   │
Wave 0 [══╣
Wave 1 │  ╔══╦══╦══╗  │   │   │   │   │   │
Wave 2 │  ║══╦══╦══╬══╗   │   │   │   │   │
Wave 3 │  ║  ║  ║  ║══╬══╦══╗   │   │   │
Wave 4 │  ║  ║  ║  ║  ║  ║══╬══╗   │   │
Wave 5 │  ║  ║  ║  ║  ║  ║══╬══╬══╗   │
Wave 6 │  ║  ║  ║  ║  ║  ║  ║  ║══╬══╗   │
Wave 7 │  ║  ║  ║  ║  ║  ║  ║  ║  ║══╬══╗
       │  │  │  │  │   │   │   │   │   │   │
       │  │  │  │  │   │   │   │   │   │   │
       L0 L1 L2 L3 L4  L5  L6  L7  L8  L9 L10
```

### Summary

| Metric | Best Case | Likely Case | Worst Case |
|--------|-----------|-------------|------------|
| Wave 0-7 duration | 20 weeks | 24 weeks | 30 weeks |
| Launch readiness | 70% | 65% | 55% |
| P0 tasks complete | 100% | 90% | 75% |
| P1 tasks complete | 80% | 65% | 50% |
| P2 tasks complete | 40% | 25% | 15% |
| Estimated completion | **70% at launch** | **65% at launch** | **55% at launch** |

### Blocking Factors

1. **Single developer bottleneck**: Waves 1 and 2 can run in parallel IF a second developer handles frontend. Without parallel execution, timeline doubles to 40 weeks.
2. **Missing engine complexity**: Settlement Engine (P0-020, 3 weeks) and PDF Generation (P0-018, 3 weeks) are the longest single tasks and are on the critical path.
3. **Data migration scope**: SBill + Collection Tracker migration (P1-021, 3 weeks) requires deep domain knowledge of legacy systems.

---

## 19. Priority P0 — Must Do Before Launch

| ID | Task | Wave | Weeks | Dependencies |
|----|------|------|-------|-------------|
| P0-001 | Replace placeholder content in Customer tabs | 2 | 0.4 | None |
| P0-002 | Replace manual div charts with Recharts (Financial) | 0 | 0.2 | None |
| P0-003 | Replace manual div charts with Recharts (Collections) | 0 | 0.2 | None |
| P0-004 | Choose V2 design language, plan V1→V2 migration | 0 | 0.4 | None |
| P0-005 | Implement 3 density modes | 2 | 1.0 | P0-004 |
| P0-006 | Add WCAG 2.1 AA accessibility | 2 | 3.0 | P0-004 |
| P0-007 | Add responsive breakpoints | 2 | 2.0 | P0-004 |
| P0-008 | Fix CustomerWorkspace floating FAB | 0 | 0.2 | None |
| P0-009 | Replace native selects/inputs with DS components | 0 | 0.6 | None |
| P0-010 | Remove code block, add business KPIs to dashboard | 0 | 0.2 | None |
| P0-011 | Make quick actions real (not toast-based) | 0 | 0.6 | None |
| P0-012 | Add filter bars to Invoices and Payments pages | 0 | 0.2 | None |
| P0-013 | Replace manual tab buttons with Radix Tabs | 0 | 0.2 | None |
| P0-014 | Add test/live mode toggle | 3 | 0.6 | None |
| P0-015 | T086 — Core DB schema (15 tables) | 1 | 1.0 | None |
| P0-016 | Implement Solar Wallet backend | 1 | 2.0 | P0-015 |
| P0-017 | Implement Chilled Water BTU backend | 1 | 2.0 | P0-015 |
| P0-018 | Implement PDF Generation backend | 1 | 3.0 | P0-015 |
| P0-019 | Implement Bill Cycle Governance backend | 1 | 2.0 | P0-015 |
| P0-020 | Implement Settlement Engine backend | 1 | 3.0 | P0-015 |
| P0-021 | Add 9 missing RBAC roles (16-profile system) | 1 | 1.0 | P0-015 |
| P0-022 | Build production CI/CD pipeline | 5 | 1.0 | None |
| P0-023 | Configure SSL/TLS + Nginx reverse proxy | 5 | 0.6 | None |
| P0-024 | Set up production PostgreSQL with backup strategy | 5 | 0.6 | None |
| P0-025 | Rebuild Explorer per Design Bible §14 spec | 2 | 2.0 | P0-004 |
| P0-026 | Build Inspector per Design Bible §13 spec | 2 | 1.0 | P0-004 |
| P0-027 | Implement Settings page | 2 | 1.0 | P0-004 |

---

## 20. Priority P1 — Should Do Before Launch

| ID | Task | Wave | Weeks | Dependencies |
|----|------|------|-------|-------------|
| P1-001 | Add command palette to all V1 pages | 3 | 1.0 | P0-004 |
| P1-002 | Add global search header bar | 3 | 1.0 | None |
| P1-003 | Add column management to tables | 3 | 1.0 | P0-009 |
| P1-004 | Add keyboard shortcuts to all pages | 3 | 2.0 | None |
| P1-005 | Add scope/tenant selector | 3 | 1.0 | P0-015 |
| P1-006 | Fill V2 panel placeholders | 3 | 1.0 | P0-025, P0-026 |
| P1-007 | Add bulk selection + batch actions | 3 | 1.0 | P0-009 |
| P1-008 | Add export CSV/PDF on list pages | 3 | 1.0 | P0-018 |
| P1-009 | Add inline row actions (three-dot menu) | 3 | 1.0 | P0-009 |
| P1-010 | Add notification center in header | 3 | 1.0 | None |
| P1-011 | Add revenue breakdown charts | 4 | 0.6 | P0-002 |
| P1-012 | Add reading trend chart | 4 | 0.6 | P0-002 |
| P1-013 | Add tariff comparison and simulation | 4 | 1.0 | P1-019 |
| P1-014 | Add time-series chart to Meter detail | 4 | 0.6 | P0-002 |
| P1-015 | Create unit detail page `/units/[id]` | 4 | 0.6 | None |
| P1-016 | Add three-tier error/empty/loading states | 2 | 1.0 | None |
| P1-017 | Remove `animate-section` page transitions | 4 | 0.6 | None |
| P1-018 | Add undo toasts for destructive actions | 2 | 1.0 | None |
| P1-019 | Implement tariff version engine | 1 | 2.0 | P0-015 |
| P1-020 | Implement customer ledger engine | 1 | 1.0 | P0-015 |
| P1-021 | Implement data migration scripts | 6 | 3.0 | P0-016, P0-017, P0-020 |
| P1-022 | T048a — approve/reject/correct review actions | 3 | 1.0 | None |
| P1-023 | T049 — FE-030 Readings API migration | 3 | 1.0 | None |
| P1-024 | Add backend unit tests for missing modules | 5 | 2.0 | P0-016 through P0-020 |
| P1-025 | Add Playwright E2E tests for critical paths | 5 | 2.0 | None |
| P1-026 | Configure Sentry error monitoring | 5 | 0.6 | None |
| P1-027 | Set up automated DB backups | 5 | 0.4 | P0-024 |
| P1-028 | Add Consumption view API + frontend | 3 | 1.0 | None |
| P1-029 | Fix contract test timeouts | 0 | 0.2 | None |
| P1-030 | Ratify Constitution | 0 | 0.2 | None |

---

## 21. Priority P2 — Nice to Have for Launch

| ID | Task | Wave | Weeks | Dependencies |
|----|------|------|-------|-------------|
| P2-001 | Add geospatial map view for meters | 4 | 2.0 | None |
| P2-002 | Add aging escalation cues on invoices | 4 | 0.4 | None |
| P2-003 | Add column-level filtering in table headers | 4 | 1.0 | P1-003 |
| P2-004 | Add inline status change (click badge → dropdown) | 4 | 0.6 | None |
| P2-005 | Add invoice preview/receipt visual | 4 | 0.6 | P0-018 |
| P2-006 | Add payment method breakdown chart | 4 | 0.4 | P0-002 |
| P2-007 | Add bulk reconciliation for payments | 4 | 0.6 | None |
| P2-008 | Add tariff calculator | 4 | 0.6 | P1-019 |
| P2-009 | Add tariff version diff comparison | 4 | 0.6 | P1-019 |
| P2-010 | Add tariff approval workflow | 4 | 1.0 | P1-019 |
| P2-011 | Add collection forecast | 4 | 1.0 | P0-003 |
| P2-012 | Add anomaly detection on readings | 7 | 0.6 | None |
| P2-013 | Add predictive maintenance on meters | 7 | 1.0 | None |
| P2-014 | Add context and overflow menus globally | 7 | 1.0 | None |
| P2-015 | Add customer timeline as default tab | 7 | 0.4 | P0-001 |
| P2-016 | Implement auto-polling reading ingestion | 7 | 1.0 | None |
| P2-017 | Implement Symbiot bridge phase 1 | 7 | 3.0 | P0-015 |
| P2-018 | Add Redis caching layer | 5 | 1.0 | None |
| P2-019 | Add API rate limiting | 7 | 0.6 | None |
| P2-020 | Add dependency audit to CI pipeline | 5 | 0.4 | P0-022 |
| P2-021 | Add Lighthouse CI for performance budget | 5 | 0.4 | None |
| P2-022 | Add k6 load test scenarios | 5 | 1.0 | None |
| P2-023 | Unify documentation single-source-of-truth | 5 | 2.0 | None |
| P2-024 | Clean up legacy files from repository | 5 | 1.0 | None |
| P2-025 | Set up GitHub Issues for task tracking | 5 | 0.2 | None |

---

## 22. Priority P3 — Post-Launch Enhancement

| ID | Task | Wave | Weeks | Dependencies |
|----|------|------|-------|-------------|
| P3-001 | Implement multi-schema database (Core + Features + 15 Areas) | 8 | 4.0 | P0-015 |
| P3-002 | Implement 3 availability plans (Full/Safety/Failover) | 8 | 4.0 | P3-001 |
| P3-003 | Implement Symbiot bridge full (10 TCP × 100 HTTP) | 8 | 6.0 | P0-015 |
| P3-004 | Implement webhooks/event-driven API | 8 | 2.0 | None |
| P3-005 | Add HATEOAS links to API responses | 8 | 2.0 | None |
| P3-006 | Implement full data migration from legacy systems | 8 | 4.0 | P1-021 |
| P3-007 | Implement 32 JasperReports templates | 8 | 3.0 | P0-018 |
| P3-008 | Add mutation testing (Stryker) | 8 | 1.0 | None |
| P3-009 | Add visual regression testing (Playwright) | 8 | 1.0 | None |
| P3-010 | Add formal security audit + penetration test | 8 | 2.0 | None |
| P3-011 | Implement Infrastructure as Code (Terraform) | 8 | 3.0 | None |
| P3-012 | Implement multi-language i18n beyond Arabic/English | 8 | 2.0 | None |
| P3-013 | Add digital twin visualization for meters | 8 | 4.0 | None |
| P3-014 | Add SCADA-style grid overview (Siemens pattern) | 8 | 4.0 | None |
| P3-015 | Add AI anomaly detection for readings | 8 | 3.0 | None |
| P3-016 | Add IoT device management for Symbiot meters | 8 | 4.0 | P3-003 |
| P3-017 | Implement mobile app (React Native) | 8 | 8.0 | None |
| P3-018 | Add offline mode for field workers | 8 | 4.0 | P3-017 |

---

## Appendix: Reference Sources

This plan consolidates data from the following reports:

| Report | Source | Key Data Used |
|--------|--------|---------------|
| AGENTS.md | `Meter/AGENTS.md` | Task history T001-T150, v2.0.0 phases, next actions |
| ENTERPRISE_UX_GAP_ANALYSIS.md | `ENTERPRISE_UX_GAP_ANALYSIS.md` | UX comparison vs 11 platforms, page-by-page gaps |
| DESIGN_COMPLIANCE_REPORT.md | `reports/DESIGN_COMPLIANCE_REPORT.md` | 17-page design scores (avg 60/100), dimension gaps |
| Operational Reality Report | `reports/operational-reality-master-report.md` | Overall readiness 23%, 12 working flows, 32 gaps |
| Comprehensive API Audit | `Meter/reports/audit-comprehensive.md` | 18/20 API endpoints passing, auth enforcement |
| Final Remediation Plan | `reports/final-remediation-plan.md` | 3-sprint remediation, effort estimates |
| Master Roadmap Alignment | `Meter/reports/master-roadmap-alignment.md` | Phase plan for SBill parity, tariff/ledger engine specs |
| Production Deployment Guide | `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` | System requirements, env vars, startup sequence |
| Design Bible | `docs/METERVERSE-DESIGN-BIBLE.md` | 751-line design specification, 19 sections |
| T001-T022 Finished Tasks | `Meter/T001-T022-FINISHED-TASKS.md` | Completed task registry |
| Performance Report | `Frontend/meterverse-ui/e2e/reports/performance-report.md` | Bundle/Lighthouse data |
| Accessibility Report | `Frontend/meterverse-ui/e2e/reports/accessibility-report.md` | WCAG compliance data |
| Sprint Summary | `Frontend/meterverse-ui/SPRINT_SUMMARY.md` | Sprint progress data |
| Security Roadmap | `Meter/documentation/markdown/security-roadmap.md` | Security controls inventory |

---

*This document is the single source of truth for all MeterVerse execution planning. All previous reports, roadmaps, and plans are superseded by this document. Do not create additional planning documents.*
