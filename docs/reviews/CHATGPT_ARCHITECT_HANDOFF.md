# ChatGPT — Enterprise Architect Handoff

**Date:** 2026-07-21  
**Project:** MeterVerse Enterprise Utility Operating System  
**Repository:** https://github.com/Kirllos360/MeterVerse  
**Branch:** clean-main → main  
**Current Phase:** Phase 38 Complete — Enterprise Certified at 94.4%  
**Next Phase:** Phase 39 — Customer Domain Completion  

---

## Executive Summary

MeterVerse is a Next.js 16 + Express + PostgreSQL utility management platform at v8.0.0-RC2. It has 48 admin pages, 41 Prisma models, 128 API endpoints, and 10 route files. The system is architecturally sound (enterprise certified 94.4%) but functionally incomplete — 87% of business features are missing, 41/50 business domains are partial or missing, and all frontend pages use mock data.

**The strategic shift:** MeterVerse is NOT a billing application. It is an **Enterprise Utility Operating System**. Billing is one application inside the platform. The immediate priority is completing the Customer domain: fixing its data source, creating a user-facing page, adding customer detail views, and building meter assignment workflows.

---

## Current Maturity Scores

| Dimension | Score | Status |
|-----------|-------|--------|
| **Architecture** | 85% | Solid foundation, BFF pattern, runtime kernel, registry-driven |
| **Business** | 8% | 6/118 features complete; 103 missing |
| **UI/UX** | 72% | Enterprise UX certified; admin polished, user system incomplete |
| **Backend** | 45% | 128 endpoints but missing validation, audit, bulk, export on most |
| **Database** | 39% | 41 models but 28 missing; no indexes, soft delete, or audit fields |
| **Security** | 90% | JWT, RBAC middleware exists but not wired; CSP, CORS, rate limit active |
| **Performance** | 40% | No caching, no pagination on most pages, no query optimization |
| **Enterprise** | 15% | Admin complete (37/37) but core MeterVerse domains mostly missing |

**Overall Enterprise Readiness:** ~38%

---

## Complete Repository Inventory

### Pages

#### Admin Pages (48 — all live, config-driven via GenericAdminPage)
| # | Page | Status | API Connected | Notes |
|---|------|--------|---------------|-------|
| 1 | active-devices | ✅ Generic | /api/admin/sessions | Shows active sessions |
| 2 | ai | ✅ Custom | /api/ai/* | 9 AI agent chat interfaces |
| 3 | ai-diagnostics | ✅ Generic | /api/admin/ai-diagnostics | Health check results |
| 4 | api | ✅ Generic | None (hardcoded) | Static API overview |
| 5 | api-keys | ✅ Generic | /api/admin/api-keys | API key management |
| 6 | areas | ✅ Generic | None (hardcoded) | Static area list |
| 7 | audit | ✅ Generic | /api/admin/audit | Audit log viewer |
| 8 | backup | ✅ Generic | /api/admin/backups | Backup management |
| 9 | branding | ✅ Generic | /api/admin/branding | Branding config form |
| 10 | business | ✅ Generic | /api/business/pipeline-status | Pipeline metrics |
| 11 | cache | ✅ Generic | /api/admin/cache | Cache management |
| 12 | crud | ✅ Custom | /api/crud | CRUD action runner |
| 13 | customers | ✅ Generic | **WRONG**: /api/admin/users | Should be /api/meterverse/customers |
| 14 | dashboard | ✅ Generic | /api/admin/health | Health dashboard |
| 15 | database | ✅ Generic | None (hardcoded) | Static DB info |
| 16 | domains | ✅ Generic | /api/domain/* | Domain data browser |
| 17 | feature-flags | ✅ Generic | /api/admin/feature-flags | Feature toggle mgmt |
| 18 | health | ✅ Generic | /api/admin/health | Service health checks |
| 19 | home | ✅ Custom | /api/admin/health + /api/business | Dashboard homepage |
| 20 | integrations | ✅ Generic | None (hardcoded) | Static integration list |
| 21 | license | ✅ Generic | /api/admin/license | License management |
| 22 | localization | ✅ Generic | None (hardcoded) | Static locale settings |
| 23 | login | ✅ Custom | /api/auth/login | Auth page (red theme) |
| 24 | logs | ✅ Generic | /api/services/email | System log viewer |
| 25 | monitoring | ✅ Custom | /api/monitor/* | 4-tab monitoring |
| 26 | notifications | ✅ Generic | None (hardcoded) | Static notification list |
| 27 | notification-templates | ✅ Generic | /api/admin/notification-templates | Template management |
| 28 | organizations | ✅ Generic | /api/admin/organizations | Org management |
| 29 | permissions | ✅ Generic | /api/admin/permissions | Permission definitions |
| 30 | plugins | ✅ Generic | None (hardcoded) | Static placeholder |
| 31 | projects | ✅ Generic | /api/admin/projects | Project management |
| 32 | queue | ✅ Generic | /api/admin/queue | Job queue management |
| 33 | reports | ✅ Custom | /api/reports/* | 9-tab reporting |
| 34 | roles | ✅ Generic | /api/admin/roles | Role management |
| 35 | runtime | ✅ Custom | None (local) | Runtime engine demo |
| 36 | scheduler | ✅ Generic | /api/admin/scheduler | Cron job management |
| 37 | security | ✅ Custom | /api/security/* | 3-tab security audit |
| 38 | services | ✅ Custom | /api/services/* | 11-tab service management |
| 39 | sessions | ✅ Generic | /api/admin/sessions | Session management |
| 40 | settings | ✅ Generic | /api/admin/settings | System settings |
| 41 | sms | ✅ Generic | None (hardcoded) | Static SMS config |
| 42 | smtp | ✅ Generic | None (hardcoded) | Static SMTP config |
| 43 | storage | ✅ Generic | /api/admin/storage | File storage management |
| 44 | tables | ✅ Custom | None (local mock) | EnterpriseTable demo |
| 45 | themes | ✅ Generic | None (hardcoded) | Theme manager |
| 46 | translations | ✅ Generic | None (hardcoded) | Translation manager |
| 47 | users | ✅ Generic | /api/admin/users | User management |
| 48 | webhooks | ✅ Generic | /api/admin/webhooks | Webhook management |

#### User Dashboard Pages (15)
| # | Page | Purpose | Notes |
|---|------|---------|-------|
| 1 | /dashboard/overview | Analytics dashboard | Real charts, mock data |
| 2 | /dashboard/workspaces | Organization workspaces | Multi-tenant UI |
| 3 | /dashboard/workspaces/team | Team management | Requires org |
| 4 | /dashboard/product | Product catalog | Mock data |
| 5 | /dashboard/users | User list (non-admin) | Feature-based (React Query) |
| 6 | /dashboard/kanban | Kanban board | Demo page |
| 7 | /dashboard/chat | Messaging UI | Demo page |
| 8 | /dashboard/forms/basic | Form examples | Demo page |
| 9 | /dashboard/forms/multi-step | Multi-step form | Demo page |
| 10 | /dashboard/forms/sheet-form | Sheet form | Demo page |
| 11 | /dashboard/forms/advanced | Advanced forms | Demo page |
| 12 | /dashboard/react-query | React Query demo | Demo page |
| 13 | /dashboard/elements/icons | Icon showcase | Reference page |
| 14 | /dashboard/exclusive | Pro features | Demo page |
| 15 | /dashboard/notifications | Notification center | Notification list |
| 16 | /dashboard/profile | User profile | Profile management |
| 17 | /dashboard/billing | Subscription billing | Requires org |
| 18 | /dashboard/settings | User settings | User preferences |

#### MeterVerse Workspace Pages (5 — all use mock data)
| # | App | Route | API | Notes |
|---|-----|-------|-----|-------|
| 1 | Customers | workspace (app) | /api/meterverse/customers | Mock data, no CRUD wired |
| 2 | Meters | workspace (app) | /api/meterverse/meters | Mock data |
| 3 | Readings | workspace (app) | /api/meterverse/readings | Mock data |
| 4 | Invoices | workspace (app) | /api/meterverse/invoices | Mock data |
| 5 | Payments | workspace (app) | /api/meterverse/payments | Mock data |

### Components

#### shadcn/ui Components (76+)
```
Card, Badge, Button, Input, Table, Tabs, Dialog, Sheet, DropdownMenu,
Select, Switch, Checkbox, RadioGroup, Textarea, Label, Avatar, Tooltip,
Popover, HoverCard, ContextMenu, Menubar, NavigationMenu, Breadcrumb,
Pagination, Accordion, Collapsible, ScrollArea, Separator, Progress,
Skeleton, Spinner, Chart, Sonner (toast), Command, Calendar, Slider,
Toggle, ToggleGroup, InputOTP, InputGroup, ButtonGroup, AlertDialog,
Drawer, Modal, Resizable, AspectRatio, Kbd, Frame, InfoBar, InfoButton,
NotificationCard, Field, FormContext, TanstackForm, DataTable,
DataTableToolbar, DataTablePagination, DataTableColumnHeader,
DataTableFacetedFilter, DataTableDateFilter, DataTableSliderFilter,
DataTableViewOptions, DataTableSkeleton
```

#### Custom Components (key ones)
```
EnterpriseTable — Full-featured data table with pinning, resize, reorder, inline edit
GenericAdminPage — Config-driven admin page template with CRUD, search, pagination, KPI
PageContainer — Standard page layout wrapper with title, description, actions
RuntimeEngine — Metadata-driven CRUD generator
WorkspaceLayout — Sidebar/toolbar/tabs/inspector shell
EmptyState — 5 variants (noData, search, error, permission, offline)
ErrorBoundary — Error boundary with retry
LoadingState — Skeleton loading
SmartSearch — Search with category filters
GlobalSearch — Global search across pages
InspectorPanel — API query runner + command history
AdminToolbar — Header toolbar with theme/lang/user menu
AdminStatusBar — Status bar with inspector toggle
AlertModal — Confirmation dialog
```

#### Icons Registry (centralized in src/components/icons.tsx)
80+ icons: check, close, search, settings, trash, spinner, info, warning, user, teams, chat, notification, phone, edit, add, upload, trash, billing, product, pro, exclusive, sparkles, lock, trendingUp, trendingDown, eyeOff, adjustments, calendar, and more.

### Prisma Models (41)

#### Core Business (6)
| Model | Fields | Relations | Status |
|-------|--------|-----------|--------|
| User | 14 | sessions, apiKeys, notifications | 55% complete |
| Customer | 8 | meters[], invoices[] | 40% complete |
| Meter | 9 | readings[], customer | 45% complete |
| Reading | 7 | meter | 30% complete |
| Invoice | 10 | customer, payments[] | 40% complete |
| Payment | 7 | invoice | 25% complete |

#### Administration (4)
Role (11 fields), Permission (5), PermissionOnRole (2), AuditEntry (13)

#### Configuration (5)
SystemSetting (4), FeatureFlag (5), ApiKey (7), License (10), BrandingConfig (5)

#### Organization (3)
Organization (11), Project (7), Session (8)

#### Integration (3)
Webhook (8), NotificationTemplate (6), Notification (12)

#### Platform (5)
Backup (6), CacheEntry (6), QueueJob (12), ScheduledTask (12), StoredFile (8)

#### Services (10)
ActivityStream (6), EmailLog (6), SmsLog (5), ImportJob (10), ExportJob (8), PushNotification (7), OcrJob (6), PdfJob (6), ExcelJob (6)

#### Reporting/Analytics (5)
ReportDefinition (10), KpiDefinition (10), KpiSnapshot (6), ScheduledReport (12), ExportLog (8)

### API Endpoints (128)

| Route File | Endpoints | Methods |
|-----------|-----------|---------|
| auth.js | 3 | POST login, POST register, GET me |
| customers.js | 5 | GET list, GET :id, POST, PUT :id, DELETE :id |
| meters.js | 5 | GET list, GET :id, POST, PUT :id, DELETE :id |
| readings.js | 4 | GET list, POST, POST bulk, GET :id (missing) |
| invoices.js | 4 | GET list, GET :id, POST, PUT :id |
| payments.js | 3 | GET list, POST, GET :id (missing) |
| admin.js | 30+ | Users, roles, permissions, settings, sessions, etc. |
| services.js | 16 | Email, SMS, push, OCR, PDF, Excel, notifications, etc. |
| reports.js | 14 | Executive, operational, financial, KPI, variance, aging, etc. |
| security.js | 5 | Audit, secrets, dependencies |
| ai.js | 9 | Operator, billing, validator, leak, forecasting, etc. |
| business.js | 2 | Pipeline status, simulate |
| crud.js | 1 | Generic CRUD executor |
| domain.js | 18 | All domain data endpoints |
| monitor.js | 4 | Health deep, performance, audit, analytics |

### BFF Proxy Routes (20+ under src/app/api/)
```
/api/auth/login, /api/auth/logout, /api/auth/me, /api/auth/register
/api/meterverse/customers, /api/meterverse/meters, /api/meterverse/readings
/api/meterverse/invoices, /api/meterverse/payments
/api/admin/* (health, users, roles, permissions, audit, settings, etc.)
/api/business/pipeline, /api/business/pipeline-status
/api/reports/* (executive, operational, financial, KPI, variance, etc.)
/api/services/* (notifications, email, sms, push, ocr, pdf, excel, etc.)
/api/security/* (audit, audit-secrets, audit-dependencies)
/api/ai/* (operator, billing, validator, leak, forecasting, etc.)
/api/monitor/* (health-deep, performance, audit-explorer, analytics)
/api/domain/* (contracts, tariffs, bill-cycles, etc. - 18 sub-endpoints)
/api/crud
```

### Route Files (15 backend + 20+ frontend BFF)

**Backend:** auth.js, customers.js, meters.js, readings.js, invoices.js, payments.js, admin.js, services.js, reports.js, security.js, ai.js, business.js, crud.js, domain.js, monitor.js

**Frontend BFF:** 20+ route.ts files under src/app/api/

### Reports in docs/reviews/ (18 total)

| Report | Focus |
|--------|-------|
| FOUNDATION_AUDIT.md | Runtime, routing, auth, theme |
| BUSINESS_CAPABILITIES.md | 58 capability maturity model |
| DOMAIN_MODEL.md | Existing + missing domain models |
| DATABASE_COMPLETION.md | Prisma schema audit (39% score) |
| DATABASE_GAP.md | Database gaps and fixes |
| BACKEND_COMPLETION.md | Express API audit (45% score) |
| BACKEND_GAP.md | Backend missing features |
| FRONTEND_COMPLETION.md | Frontend page audit (28% score) |
| FRONTEND_GAP.md | Frontend issues catalog |
| INTEGRATION_MATRIX.md | Full-stack data flow tracing (22%) |
| INTEGRATION_MAP.md | Integration layer mapping |
| ENTERPRISE_CERTIFICATION.md | 94.4% pass (51/54 checks) |
| ENTERPRISE_READINESS.md | Enterprise maturity assessment |
| SPRINT_REPORT_PHASE38.md | Sprint 38 completion report |
| ROADMAP_SPRINTS_39_45.md | Strategic 7-sprint roadmap |
| BUSINESS_WORKFLOW_REVIEW.md | Workflow completeness |
| DATA_MODEL_REVIEW.md | Data model issues |
| MOCK_DATA_AUDIT.md | All pages using mock data |
| MISSING_MODULES.md | Missing enterprise modules |
| FUNCTIONAL_GAP_ANALYSIS.md | Functional gaps by domain |
| PLATFORM_SERVICES.md | 15 services completion |
| REPORTING_COMPLETION.md | 9 reporting capabilities |
| SECURITY_REVIEW.md | 12 security capabilities |
| PRODUCTION_READINESS.md | 14 production capabilities |
| SYSTEM_ADMIN_COMPLETION.md | Admin completion audit |
| SYSTEM_ADMIN_REVIEW.md | Admin system review |
| EPIC7_ADMIN_COMPLETION_SUMMARY.md | Admin epic wrap-up |
| EPIC8_BACKEND_WIRING.md | Backend wiring epic |
| FINAL_VERIFICATION_REPORT.md | 61/61 tests pass |
| FINAL_SUMMARY_REPORT.md | All verification checks pass |
| SIDEBAR_INFORMATION_ARCHITECTURE.md | Sidebar IA audit |
| PHASE39_CUSTOMER_DOMAIN_ANALYSIS.md | Customer domain deep dive |
| PHASE39_IMPLEMENTATION_ROADMAP.md | 12-Epic execution plan |
| ENTERPRISE_DOMAIN_BLUEPRINT.md | Complete 15-section architecture |
| CHATGPT_ARCHITECT_HANDOFF.md | THIS DOCUMENT |

### Screenshots
95 screenshots across 19 routes × 5 viewports (stored in docs/screenshots/)

### Workflows (GitHub Actions)

**ci.yml** (4 jobs):
1. **build-backend** — TypeScript check + lint (continue-on-error: true)
2. **build-frontend** — Next.js production build
3. **security-audit** — CodeQL + Semgrep + TruffleHog
4. **docker-build** — Build backend + frontend containers

### CI/CD Pipeline (Configured but not fully active)
```
Push/PR → Build (TypeScript + next build)
           Frontend (install + lint + test)
           Security (CodeQL + Semgrep + TruffleHog)
           Docker (backend + frontend containers)
           Playwright E2E (chromium) — 4 tests pass
           Visual Regression (pixelmatch) — 57 comparison points
           AI Review (DeepSeek) — 8 reports
           Reports → commit to docs/reviews/
```

---

## Every Discovered Issue

### Critical (5)

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| C01 | Admin customers page fetches from `/api/admin/users` instead of `/api/meterverse/customers` | `Frontend/src/admin/tables/page-configs.ts:11` | Users page shows in customers — wrong data entirely |
| C02 | No user-facing Customers page in dashboard sidebar | `Frontend/src/config/nav-config.ts` | Users cannot access customer management from main UI |
| C03 | No customer detail view exists anywhere | All layers | Cannot view customer profile, meters, invoices, or history |
| C04 | GenericAdminPage Sheet forms have no onSubmit handlers | `Frontend/src/admin/tables/GenericAdminPage.tsx:198` | Add/Edit buttons do nothing — no create/update API calls |
| C05 | Hard delete on all models (no soft delete) | `backend/src/routes/*.js`, `backend/prisma/schema.prisma` | Data loss risk — no recovery possible |

### High (15)

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| H01 | No MeterAssignment entity — Meter.customerId overwritten directly | `schema.prisma` + routes | Cannot track meter assignment history |
| H02 | No ServiceConnection entity — Customer→Meter link is too simple | Architecture | Cannot handle meter replacement, moves, or multi-meter |
| H03 | All frontend pages use mock data — none connected to real backend | All workspace + dashboard pages | No real data visible to users |
| H04 | `auditLog()` middleware exists but is never called from any route | `backend/src/middleware/security.js` | No audit trail for any operation |
| H05 | `requireRole()` middleware exists but never applied to any route | `backend/src/routes/*.js` | No RBAC enforcement on any endpoint |
| H06 | No createdBy/updatedBy fields on any model | `schema.prisma` | Cannot track who modified records |
| H07 | 28 missing database models (Contract, Tariff, BillCycle, etc.) | `schema.prisma` | Core business concepts have no data model |
| H08 | 40+ missing API endpoints (bulk, export, import, stats, status) | `backend/src/routes/*.js` | Operations cannot be performed via API |
| H09 | Reading → Invoice → Payment pipeline has no automation | All layers | Billing is entirely manual |
| H10 | No invoice line items — flat amount only | `Invoice` model + routes | No transparency in billing |
| H11 | No tariff/rate engine — invoice amounts are arbitrary | Missing entirely | Cannot calculate correct charges |
| H12 | Zod validation missing on meters, readings, invoices, payments routes | `backend/src/routes/*.js` | Invalid data can enter database |
| H13 | No database indexes beyond PK — 20 indexes missing | `schema.prisma` | Query performance degrades with data growth |
| H14 | Admin status update has empty catch block — errors invisible | `GenericAdminPage.tsx:79` | Failures silently swallowed |
| H15 | Empty `/customer` directory placeholder | `Frontend/src/app/customer/` | Dead route, confuses developers |

### Medium (20)

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| M01 | No debounced search on table pages | GenericAdminPage | Filter re-computes on every keystroke |
| M02 | No data refresh after mutations | GenericAdminPage | User must refresh page to see changes |
| M03 | Tab filter counts not shown | GenericAdminPage | User doesn't know record distribution |
| M04 | No keyboard shortcuts documented | Various | Power users cannot navigate efficiently |
| M05 | Some animation durations inconsistent | Various | Visual inconsistency |
| M06 | No pagination on most workspace pages | Workspace pages | Cannot browse large datasets |
| M07 | No empty state guidance (CTAs) | GenericAdminPage | "No records" with no action to create |
| M08 | No success confirmation after save | GenericAdminPage | Sheet closes silently |
| M09 | No inline form validation | GenericAdminPage | Errors only appear on submit |
| M10 | No permissions on frontend actions | Admin + User pages | Any user can access any feature |
| M11 | No request logging (morgan/pino) | Backend | Cannot debug API issues |
| M12 | No OpenAPI/Swagger docs | Backend | No API reference for developers |
| M13 | No Redis caching layer | Backend | Repeated DB queries for same data |
| M14 | No bulk operations on any entity | All routes | Cannot update/delete multiple records |
| M15 | No import/export on any entity | All routes + pages | Cannot move data in/out of system |
| M16 | No notification wired to business events | All services | No automated customer communication |
| M17 | No contract entity | Missing | No customer agreement tracking |
| M18 | No customer groups | Missing | Cannot segment customers |
| M19 | No reading validation rules engine | Missing | Cannot validate reading quality |
| M20 | No webhook triggers for business events | All routes | Cannot integrate with external systems |

### Low (15)

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| L01 | No mobile-responsive design for admin | Admin pages | Poor mobile experience |
| L02 | No RTL testing for Arabic users | All pages | RTL may break on some components |
| L03 | No aria-labels on action icons | GenericAdminPage | Accessibility gaps |
| L04 | No focus trap in Sheet component | GenericAdminPage | Keyboard navigation broken in forms |
| L05 | No cascading deletes in Prisma | schema.prisma | Orphan records possible |
| L06 | Demo pages in user sidebar (Kanban, Chat, React Query) | nav-config.ts | Confuses users with non-functional pages |
| L07 | No unit tests (0% coverage) | Entire codebase | No regression safety net |
| L08 | Playwright tests not in CI | .github/workflows/ | E2E not automated |
| L09 | Backend requires Docker for PostgreSQL | docker-compose.yml | Cannot develop without Docker |
| L10 | No structured logging (JSON) | Backend | Logs not machine-parseable |
| L11 | No Prometheus metrics endpoint | Backend | No performance monitoring |
| L12 | No API versioning | Backend | Breaking changes affect all clients |
| L13 | No offline support | Frontend | App requires constant connectivity |
| L14 | No WebSocket real-time updates | Backend + Frontend | Data doesn't update without refresh |
| L15 | No accessibilty audit for admin pages | Admin pages | WCAG compliance unknown |

---

## Every Missing Business Capability

### Customer Domain (14 missing)
| Capability | Priority | Reason |
|-----------|----------|--------|
| Customer code auto-generation | 🔴 | No CUST-YYYY-NNNNN format |
| Customer groups/segments | 🟡 | Cannot group residential/commercial/industrial |
| Customer contracts | 🔴 | No agreement terms tracking |
| Customer meter assignment | 🔴 | Cannot operationally assign meters |
| Customer timeline/activity | 🟡 | No audit of customer lifecycle |
| Customer documents | 🟡 | No contract/ID upload |
| Customer KPI dashboard | 🔴 | No growth/churn/segment analytics |
| Customer import/export | 🟡 | No CSV/Excel data movement |
| Customer duplicate detection | 🟡 | Can create same customer twice |
| Customer credit limit | 🟡 | Cannot control billing risk |
| Customer notes (internal) | 🟡 | No internal communication log |
| Customer tags/categories | 🟡 | No flexible grouping |
| Customer address history | 🟢 | No track of address changes |
| Customer communication log | 🟡 | No history of sent notifications |

### Meter Domain (12 missing)
| Capability | Priority |
|-----------|----------|
| Meter type catalog | 🟡 |
| Meter model/firmware tracking | 🟡 |
| Meter installation workflow | 🔴 |
| Meter replacement workflow | 🔴 |
| Meter calibration schedule | 🟡 |
| Meter warranty tracking | 🟢 |
| SIM card management | 🟡 |
| Gateway management | 🟡 |
| Meter event log | 🟡 |
| Meter reading schedule | 🔴 |
| Meter health monitoring | 🟡 |
| Battery level monitoring | 🟢 |

### Reading Domain (10 missing)
| Capability | Priority |
|-----------|----------|
| Reading validation rules engine | 🔴 |
| Automated reading (AMI) | 🔴 |
| Manual reading entry | 🟡 |
| Reading estimation | 🟡 |
| Reading correction/adjustment | 🟡 |
| Bulk reading import | 🟡 |
| Reading anomaly detection (AI) | ⚠️ Partial |
| Consumption calculation | 🔴 |
| Seasonal adjustment factors | 🟢 |
| Reading quality scoring | 🟢 |

### Billing Domain (16 missing)
| Capability | Priority |
|-----------|----------|
| Tariff management (tiers, TOU, flat) | 🔴 |
| Tariff versioning/history | 🟡 |
| Bill cycle management | 🔴 |
| Bill run automation | 🔴 |
| Charge rule engine | 🔴 |
| Invoice line items | 🔴 |
| Tax calculation | 🔴 |
| Discount application | 🟡 |
| Invoice PDF generation | 🟡 |
| Invoice email delivery | 🟡 |
| Credit note / debit note | 🟡 |
| Recurring charges (fixed fees) | 🟡 |
| Minimum charge guarantee | 🟢 |
| Late payment penalty | 🟡 |
| Deposit management | 🟢 |
| Rebate/refund processing | 🟢 |

### Payment Domain (8 missing)
| Capability | Priority |
|-----------|----------|
| Payment gateway integration | 🔴 |
| Payment allocation (multi-invoice) | 🟡 |
| Partial payment handling | 🔴 |
| Overpayment credit balance | 🟡 |
| Receipt generation (PDF) | 🟡 |
| Refund processing | 🟡 |
| Payment retry logic | 🟢 |
| Recurring payment (auto-pay) | 🟡 |

### Financial Domain (8 missing)
| Capability | Priority |
|-----------|----------|
| Double-entry ledger | 🟡 |
| Chart of accounts | 🟡 |
| Accounts receivable aging | 🔴 |
| General ledger export | 🟢 |
| Trial balance | 🟢 |
| Revenue recognition | 🟢 |
| Deferred revenue tracking | 🟢 |
| Financial period close | 🟢 |

### Collections Domain (7 missing)
| Capability | Priority |
|-----------|----------|
| Collection case management | 🟡 |
| Dunning level configuration | 🟡 |
| Automated dunning (reminder emails) | 🟡 |
| Promise-to-pay tracking | 🟢 |
| Disconnect/reconnect workflow | 🔴 |
| Collection agency integration | 🟢 |
| Write-off processing | 🟢 |

---

## Every Missing Entity

### Database Models (28 missing)

| # | Entity | Domain | Fields | Priority |
|---|--------|--------|--------|----------|
| 1 | ServiceConnection | Customer | 15 (customerId, meterId, tariffId, address, status, startDate, endDate, etc.) | 🔴 |
| 2 | CustomerGroup | Customer | 6 (name, description, parentId, createdAt, updatedAt) | 🟡 |
| 3 | Contract | Customer | 18 (customerId, serviceConnectionId, tariffId, startDate, endDate, terms, status, etc.) | 🔴 |
| 4 | ContractTerm | Customer | 8 (contractId, serviceType, rate, duration, etc.) | 🟡 |
| 5 | ContractVersion | Customer | 6 (contractId, version, changes, effectiveDate) | 🟢 |
| 6 | MeterType | Meter | 5 (name, manufacturer, model, formFactor, communication) | 🟡 |
| 7 | MeterAssignment | Meter | 8 (meterId, serviceConnectionId, startDate, endDate, status) | 🔴 |
| 8 | MeterEvent | Meter | 10 (meterId, serviceConnectionId, type, timestamp, technician, notes) | 🟡 |
| 9 | SIMCard | Meter | 8 (iccid, provider, phoneNumber, status, meterId) | 🟡 |
| 10 | Gateway | Meter | 10 (serial, name, location, ipAddress, status, area) | 🟡 |
| 11 | Area | Geography | 8 (name, code, region, zone, managerId) | 🟡 |
| 12 | Building | Geography | 10 (name, code, areaId, address, coordinates) | 🟢 |
| 13 | Unit | Geography | 8 (buildingId, number, floor, type, size) | 🟢 |
| 14 | ReadingValidation | Reading | 8 (readingId, status, rulesPassed, rulesFailed, validatedBy, validatedAt) | 🔴 |
| 15 | ValidationRule | Reading | 10 (name, condition, severity, enabled, description) | 🟡 |
| 16 | Consumption | Reading | 8 (readingId, tariffRateId, calculatedValue, adjustmentFactor, netValue) | 🔴 |
| 17 | Tariff | Billing | 12 (name, type, effectiveDate, status, description) | 🔴 |
| 18 | TariffRate | Billing | 10 (tariffId, tier, fromValue, toValue, rate, unit) | 🔴 |
| 19 | BillCycle | Billing | 8 (name, frequency, cutoffDay, dueDay, gracePeriod) | 🔴 |
| 20 | BillRun | Billing | 8 (billCycleId, status, startedAt, completedAt, invoiceCount, totalAmount) | 🔴 |
| 21 | Charge | Billing | 8 (invoiceItemId, tariffRateId, consumptionId, description, amount) | 🔴 |
| 22 | InvoiceItem | Billing | 8 (invoiceId, chargeId, consumptionId, description, quantity, rate, amount) | 🔴 |
| 23 | PaymentAllocation | Payment | 6 (paymentId, invoiceId, amount, allocatedAt) | 🟡 |
| 24 | LedgerEntry | Finance | 12 (invoiceId, paymentId, accountId, debit, credit, description, postedAt) | 🟡 |
| 25 | Account | Finance | 8 (code, name, type, balance, currency) | 🟡 |
| 26 | CollectionCase | Collections | 12 (customerId, invoiceId, status, assignedTo, openedAt, dunningLevel) | 🟡 |
| 27 | WorkflowState | Workflow | 10 (entityType, entityId, state, transitions, assignedTo, createdAt) | 🟡 |
| 28 | WorkflowTransition | Workflow | 6 (workflowStateId, fromState, toState, action, triggeredBy) | 🟢 |

---

## Every Missing API

### Customer Domain (12 endpoints)
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/customers/:id/meters | GET | List assigned meters | 🔴 |
| /api/customers/:id/meters | POST | Assign meter | 🔴 |
| /api/customers/:id/meters/:meterId | DELETE | Unassign meter | 🔴 |
| /api/customers/:id/timeline | GET | Activity timeline | 🟡 |
| /api/customers/:id/documents | GET/POST | Document management | 🟡 |
| /api/customers/:id/readings | GET | Cross-meter reading history | 🟡 |
| /api/customers/stats | GET | KPI aggregation | 🟡 |
| /api/customers/bulk | POST | Bulk operations | 🟡 |
| /api/customers/export | GET | CSV/Excel export | 🟡 |
| /api/customers/import | POST | CSV/Excel import | 🟡 |
| /api/customers/:id/status | PUT | Status change with validation | 🔴 |
| /api/customers/:id/contracts | GET/POST | Contract management | 🟡 |

### Meter Domain (8 endpoints)
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/meters/:id/readings | GET | Reading history | 🔴 |
| /api/meters/:id/events | GET | Event history | 🟡 |
| /api/meters/:id/assign | POST | Assign to customer | 🔴 |
| /api/meters/:id/unassign | POST | Unassign from customer | 🔴 |
| /api/meters/stats | GET | KPI aggregation | 🟡 |
| /api/meters/bulk | POST | Bulk operations | 🟡 |
| /api/meters/export | GET | Export to CSV | 🟡 |
| /api/meters/import | POST | Import from CSV | 🟡 |

### Reading Domain (7 endpoints)
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/readings/:id | GET | Single reading detail | 🔴 |
| /api/readings/:id | PUT | Update reading | 🔴 |
| /api/readings/:id | DELETE | Delete reading | 🔴 |
| /api/readings/:id/validate | POST | Trigger validation | 🔴 |
| /api/readings/bulk/validate | POST | Bulk validation | 🟡 |
| /api/readings/stats | GET | KPI aggregation | 🟡 |
| /api/readings/export | GET | CSV export | 🟡 |

### Invoice Domain (8 endpoints)
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/invoices/:id | DELETE | Cancel/void invoice | 🔴 |
| /api/invoices/:id/items | GET | Line items | 🔴 |
| /api/invoices/generate | POST | Generate from readings | 🔴 |
| /api/invoices/:id/pdf | GET | Download PDF | 🟡 |
| /api/invoices/:id/send | POST | Send to customer | 🟡 |
| /api/invoices/bulk/generate | POST | Batch generation | 🔴 |
| /api/invoices/stats | GET | KPI aggregation | 🟡 |
| /api/invoices/export | GET | CSV/Excel export | 🟡 |

### Payment Domain (6 endpoints)
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/payments/:id | GET | Single payment detail | 🔴 |
| /api/payments/:id | PUT | Update payment | 🔴 |
| /api/payments/:id | DELETE | Void payment | 🔴 |
| /api/payments/:id/receipt | GET | Download receipt PDF | 🟡 |
| /api/payments/stats | GET | KPI aggregation | 🟡 |
| /api/payments/export | GET | CSV/Excel export | 🟡 |

---

## Every Missing Frontend Page

| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Customer Detail (user) | /dashboard/customers/[id] | 🔴 | Full profile with meters, readings, invoices, payments tabs |
| Customer Detail (admin) | /admin/customers/[id] | 🔴 | Admin version of customer detail |
| Meter Detail (user) | /dashboard/meters/[id] | 🔴 | Reading history, events, assignments |
| Meter Detail (admin) | /admin/meters/[id] | 🔴 | Admin version of meter detail |
| Reading Detail | /dashboard/readings/[id] | 🟡 | Validation info, consumption, correction history |
| Invoice Detail | /dashboard/invoices/[id] | 🔴 | Line items, payments, PDF download |
| Invoice Detail (admin) | /admin/invoices/[id] | 🔴 | Admin invoice detail |
| Payment Detail | /dashboard/payments/[id] | 🟡 | Allocation breakdown, receipt |
| Customer Groups | /admin/customer-groups | 🟡 | Group CRUD management |
| Tariff Manager | /admin/tariffs | 🔴 | Rate structure CRUD |
| Bill Cycles | /admin/bill-cycles | 🔴 | Billing schedule CRUD |
| Contract Manager | /admin/contracts | 🟡 | Contract lifecycle |
| Collection Cases | /admin/collections | 🟡 | Overdue recovery |
| Service Connections | /admin/service-connections | 🔴 | Connection point management |
| Customer Dashboard (user) | /dashboard/customers | 🔴 | Missing from sidebar — create this page |
| Reading Validation | /admin/reading-validation | 🟡 | Validation rule configuration |

---

## Every Missing Backend Feature

| Feature | Current State | Required | Priority |
|---------|---------------|----------|----------|
| Soft delete | Hard delete | deletedAt, deletedBy on all models | 🔴 |
| Audit logging | Middleware exists, unused | Wire to all route handlers | 🔴 |
| RBAC enforcement | Middleware exists, unused | Apply requireRole() to all routes | 🔴 |
| Zod validation | Only auth + customers | All routes (meters, readings, invoices, payments) | 🔴 |
| Request logging | Not configured | Morgan or Pino | 🟡 |
| OpenAPI/Swagger | Not generated | Auto-generate from route annotations | 🟡 |
| API versioning | No versions | /v1/ prefix for all routes | 🟢 |
| Database connection pooling | Default only | Configure pgBouncer or Prisma connection limit | 🟡 |
| Redis caching | Not implemented | Cache list, detail, KPI queries | 🟡 |
| WebSocket events | Not implemented | Real-time updates on mutations | 🟡 |
| Rate limiting per endpoint | Global only | Custom limits per endpoint group | 🟡 |
| Prometheus metrics | Not implemented | Export request count, latency, error rate | 🟡 |
| Structured logging | Console.log | JSON format with correlation IDs | 🟡 |
| Transaction support | ⚠️ Partial (payments only) | All mutating operations | 🟡 |
| Bulk operations | ⚠️ Partial (readings only) | Bulk create, update, delete on all entities | 🟡 |
| Export endpoints | Not implemented | CSV/Excel/PDF for all entities | 🟡 |
| Import endpoints | Not implemented | CSV/Excel for all entities | 🟡 |
| Webhook triggers | Not implemented | Fire webhooks on business events | 🟡 |
| File upload | ✅ Implemented | Already in storage service | — |
| Background jobs | ⚠️ Partial | Scheduler + queue exist, not wired to business logic | 🟡 |

---

## Every Missing Enterprise Capability

| Capability | Domain | Priority |
|-----------|--------|----------|
| Multi-tenant data isolation | Organization | 🟡 |
| Data retention policies | Compliance | 🟢 |
| GDPR/CCPA compliance | Compliance | 🟢 |
| Audit log export | Compliance | 🟡 |
| Bulk email/marketing | Communication | 🟢 |
| SLA monitoring | Operations | 🟢 |
| Escalation policies | Operations | 🟢 |
| Automated meter reading schedule | Meter Operations | 🔴 |
| Field worker mobile app | Operations | 🟡 |
| Customer self-service portal | Customer | 🟡 |
| Online payment portal | Payment | 🔴 |
| Public API documentation | Developer | 🟡 |
| Plugin/extension marketplace | Developer | 🟢 |
| White-label/branding | Administration | ✅ Done |
| Maintenance mode | Administration | 🟢 |
| System announcements | Administration | 🟢 |
| Rate limiting per API key | Security | 🟡 |
| IP allowlist/blocklist | Security | 🟢 |
| SSO/OIDC integration | Security | 🟡 |
| WebAuthn biometrics | Security | 🟢 |
| Email delivery analytics | Communication | 🟢 |
| SMS delivery status | Communication | 🟢 |

---

## Recommended Implementation Order

### Phase 39a — Customer Foundation (Week 1, 8 files)
```
Epic 1: Customer Domain Foundation
  1. Fix admin customers API endpoint (C01)
  2. Create /dashboard/customers page with sidebar nav entry (C02)
  3. Create customer detail page /dashboard/customers/[id] (C03)
  4. Wire GenericAdminPage Sheet onSubmit handlers (C04)
  5. Add soft delete to Customer model (C05)
  6. Wire auditLog() to customer routes (H04)
```

### Phase 39b — Meter Assignment (Week 2, 12 files)
```
Epic 2: Meter Assignment
  1. Create ServiceConnection model (H02)
  2. Create MeterAssignment model (H01)
  3. Create API: assign/unassign/list meters
  4. Add meter assignment UI to customer detail
  5. Add MeterEvent model + API
```

### Phase 39c — Reading + Timeline (Week 3, 15 files)
```
Epic 3: Customer Reading History
  1. Create GET /api/customers/:id/readings
  2. Add Readings tab to customer detail
  3. Add consumption chart component

Epic 6: Customer Timeline
  1. Create CustomerTimeline model
  2. Wire timeline logging to all customer mutations
  3. Add Timeline tab to customer detail
```

### Phase 40a — Billing Engine (Week 4-5, 10 files)
```
Epic 4: Billing Integration
  1. Create Tariff, TariffRate models
  2. Create BillCycle, BillRun models
  3. Create Charge, InvoiceItem models
  4. Create API: tariff CRUD, bill cycle CRUD
  5. Create POST /api/invoices/generate
  6. Add Invoice detail page with line items
```

### Phase 40b — Payments + Reports (Week 6, 15 files)
```
Epic 5: Payment Integration
  1. Create PaymentAllocation model
  2. Create API: payment allocation
  3. Add balance calculation
  4. Add receipt PDF generation

Epic 10: Customer Reports
  1. Create CSV export for customers
  2. Create PDF export for customer detail
  3. Create customer aging report
```

### Phase 41a — Groups + Notifications (Week 7, 21 files)
```
Epic 11: Customer Groups & Contracts
  1. Create CustomerGroup model + API + UI
  2. Create Contract model + API + UI

Epic 9: Customer Notifications
  1. Wire welcome notification on customer create
  2. Wire status change notifications
  3. Wire invoice/payment notifications
```

### Phase 41b — Analytics + Documents (Week 8, 20 files)
```
Epic 7: Customer Analytics
  1. Create GET /api/customers/stats
  2. Add KPI dashboard to customer list page
  3. Add growth, churn, segmentation charts

Epic 8: Customer Documents
  1. Create CustomerDocument model
  2. Create API: upload/list/delete documents
  3. Add Document tab to customer detail
```

### Phase 42 — Performance (Week 9, 8 files)
```
Epic 12: Performance & Production Readiness
  1. Add 20 database indexes
  2. Implement Redis caching layer
  3. Implement cursor-based pagination
  4. Create 10K customer seed script
  5. Load test with 10K/50K/100K records
```

---

## Potential Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Database requires Docker** | High | Medium | Document docker compose workflow; provide mock data fallback |
| **No unit tests** | Certain | High | Write tests incrementally; start with critical customer routes |
| **ServiceConnection migration** | Medium | High | Phase over 3 releases; maintain backward compatibility |
| **Real API integration** | Medium | Medium | Mock data layer allows frontend dev without backend |
| **Performance with 100K customers** | Low | High | Add indexes early; load test before production |
| **RBAC wiring breaks existing access** | Medium | High | Default-permissive during migration; audit before enforcing |
| **Billing accuracy** | Medium | Critical | Financial calculations need thorough testing and validation rules |
| **Data loss from hard delete** | High (current) | Critical | Implement soft delete BEFORE any production data is managed |
| **Clerk authentication migration** | Future | Medium | Plan for when Clerk is fully configured |
| **Scope creep** | High | Medium | Strict Epic definition; no features added without acceptance criteria |

---

## Files Requiring Modification

### Epic 1 — Customer Domain Foundation (8 files)
```
MODIFY: Frontend/src/admin/tables/page-configs.ts (fix API endpoint)
CREATE: Frontend/src/app/dashboard/customers/page.tsx (user-facing customer list)
CREATE: Frontend/src/app/dashboard/customers/[id]/page.tsx (customer detail)
MODIFY: Frontend/src/config/nav-config.ts (add Customers to sidebar)
MODIFY: Frontend/src/admin/tables/GenericAdminPage.tsx (wire Sheet onSubmit)
MODIFY: backend/prisma/schema.prisma (add deletedAt, deletedBy to Customer)
MODIFY: backend/src/routes/customers.js (soft delete, audit logging)
MODIFY: backend/src/routes/customers.js (wire auditLog middleware)
```

### Epic 2 — Meter Assignment (12 files)
```
CREATE: backend/prisma/migrations/ (ServiceConnection + MeterAssignment + MeterEvent)
MODIFY: backend/prisma/schema.prisma (add 3 new models)
CREATE: backend/src/routes/service-connections.js (new route file)
MODIFY: backend/src/routes/customers.js (add meter assignment endpoints)
CREATE: Frontend/src/app/dashboard/customers/[id]/meters/page.tsx
MODIFY: Frontend/src/admin/tables/page-configs.ts (add meter assignment configs)
```

### Epic 3 — Reading History (7 files)
```
MODIFY: backend/src/routes/customers.js (add reading history endpoint)
MODIFY: Frontend/src/app/dashboard/customers/[id]/page.tsx (add readings tab)
CREATE: Frontend/src/admin/charts/ConsumptionChart.tsx
```

### Epic 4 — Billing Engine (10 files)
```
CREATE: Tariff, TariffRate, BillCycle, BillRun, Charge, InvoiceItem models
CREATE: backend/src/routes/tariffs.js
CREATE: backend/src/routes/bill-cycles.js
MODIFY: backend/src/routes/invoices.js (add generation endpoint)
```

### Epic 5 — Payment Integration (7 files)
```
CREATE: PaymentAllocation model
MODIFY: backend/src/routes/payments.js (add allocation)
CREATE: Frontend/src/app/dashboard/payments/[id]/page.tsx
```

---

## Dependencies

### External Dependencies
| Dependency | Purpose | Status |
|-----------|---------|--------|
| PostgreSQL 16 | Database | Required (Docker) |
| Prisma 6.x | ORM | ✅ Installed |
| Next.js 16 | Framework | ✅ Installed |
| Express.js | Backend | ✅ Installed |
| Zod 3.x | Validation | ✅ Installed |
| jsonwebtoken | JWT auth | ✅ Installed |
| bcryptjs | Password hashing | ✅ Installed |
| Helmet | Security headers | ✅ Installed |
| express-rate-limit | Rate limiting | ✅ Installed |
| framer-motion 11 | Animations | ✅ Installed |
| TanStack React Query | Data fetching | ✅ Installed |
| Zustand 5 | UI state | ✅ Installed |
| nuqs | URL state | ✅ Installed |
| TanStack Form | Forms | ✅ Installed |
| Clerk | Auth (future) | 🔜 Not configured |

### Internal Dependencies (between Epics)
```
Epic 1 ← (no deps)
Epic 2 ← Epic 1
Epic 3 ← Epic 1, Epic 2
Epic 4 ← Epic 1, Epic 3
Epic 5 ← Epic 4
Epic 6 ← Epic 1
Epic 7 ← Epic 1
Epic 8 ← Epic 1
Epic 9 ← Epic 4, Epic 5, Epic 6
Epic 10 ← Epic 1, Epic 7
Epic 11 ← Epic 1
Epic 12 ← All Epics
```

---

## Suggested Epics

### Epic 1 — Customer Domain Foundation
**Files:** 8 | **Risk:** Medium | **Deps:** None | **Value:** 🔴 Critical
**Objective:** Fix data source, add user page, create detail view, wire forms, implement soft delete and audit logging.
**Key deliverables:**
- Admin customers page shows real customer data
- User-facing customers page at /dashboard/customers
- Customer detail page with tabs
- GenericAdminPage forms actually create/update data
- Soft delete Customer model
- Audit logging wired to customer routes

### Epic 2 — Meter Assignment
**Files:** 12 | **Risk:** High | **Deps:** Epic 1
**Objective:** Create ServiceConnection and MeterAssignment models, build assign/unassign API and UI.
**Key deliverables:**
- ServiceConnection entity (central architectural change)
- Assign/unassign meters with full history
- MeterAssignment tracks start/end dates
- Cannot assign already-assigned meter

### Epic 3 — Customer Reading History
**Files:** 7 | **Risk:** Medium | **Deps:** Epic 1, 2
**Objective:** Show all meter readings across all customer meters in one unified view.
**Key deliverables:**
- GET /api/customers/:id/readings endpoint
- Readings tab on customer detail with chart
- Filterable by meter, date range, status

### Epic 4 — Billing Integration
**Files:** 10 | **Risk:** High | **Deps:** Epic 1, 3
**Objective:** Implement tariff engine, bill cycle, invoice generation with line items.
**Key deliverables:**
- Tariff, TariffRate, BillCycle, BillRun, Charge, InvoiceItem models
- POST /api/invoices/generate creates invoices from readings × tariff
- Invoice detail page with line items

### Epic 5 — Payment Integration
**Files:** 7 | **Risk:** Medium | **Deps:** Epic 4
**Objective:** Implement payment allocation, balance tracking, receipt generation.
**Key deliverables:**
- PaymentAllocation model
- Split payments across invoices
- Outstanding balance calculation
- Receipt PDF generation

### Epic 6 — Customer Timeline
**Files:** 8 | **Risk:** Medium | **Deps:** Epic 1
**Objective:** Activity feed showing every significant event in the customer lifecycle.
**Key deliverables:**
- CustomerTimeline model
- Timeline tab on customer detail
- Every mutation creates a timeline entry

### Epic 7 — Customer Analytics
**Files:** 10 | **Risk:** Medium | **Deps:** Epic 1
**Objective:** KPI dashboard with customer growth, churn, segmentation charts.
**Key deliverables:**
- GET /api/customers/stats
- KPI cards, growth chart, churn analysis, segmentation
- Date range selector for KPIs

### Epic 8 — Customer Documents
**Files:** 10 | **Risk:** Medium | **Deps:** Epic 1
**Objective:** Upload, store, and manage customer documents.
**Key deliverables:**
- CustomerDocument model
- File upload with drag-drop
- Document preview and management

### Epic 9 — Customer Notifications
**Files:** 7 | **Risk:** Low | **Deps:** Epic 4, 5, 6
**Objective:** Automated notifications triggered by customer lifecycle events.
**Key deliverables:**
- Welcome notification on customer create
- Status change notifications
- Invoice/payment notifications
- Notification preference per customer

### Epic 10 — Customer Reports
**Files:** 8 | **Risk:** Medium | **Deps:** Epic 1, 7
**Objective:** Printable and exportable customer reports.
**Key deliverables:**
- Customer list CSV export
- Customer detail PDF export
- Customer aging report
- Customer growth report

### Epic 11 — Customer Groups & Contracts
**Files:** 14 | **Risk:** High | **Deps:** Epic 1
**Objective:** Customer segmentation and contract management.
**Key deliverables:**
- CustomerGroup model + CRUD
- Contract model + CRUD
- Group-based filtering and reporting
- Contract expiry warnings

### Epic 12 — Performance & Production Readiness
**Files:** 8 | **Risk:** Medium | **Deps:** All Epics
**Objective:** Ensure customer domain scales to 100K+ records.
**Key deliverables:**
- 20 database indexes
- Redis caching layer
- Cursor-based pagination
- 10K seed script + load test results

---

## Definition of Done

### Definition of Ready (Sprint Level)
- [ ] All Epic dependencies are resolved
- [ ] Prisma schema changes reviewed and approved
- [ ] API contracts documented
- [ ] UI mockups/wireframes approved
- [ ] Acceptance criteria defined for every story
- [ ] Test data/seeds available
- [ ] Database migration plan reviewed
- [ ] Rollback plan exists

### Definition of Done (Epic Level)
- [ ] All acceptance criteria pass
- [ ] Backend unit tests pass (>80% coverage for new routes)
- [ ] Frontend component tests pass
- [ ] E2E tests pass (Playwright)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Production build succeeds (`npx next build`)
- [ ] API contracts finalized
- [ ] Database migrations applied
- [ ] Audit logging wired for all new mutations
- [ ] Permissions enforced for all new endpoints
- [ ] Error handling implemented (loading, empty, error states)
- [ ] Responsive design verified (mobile + desktop)
- [ ] Accessibility checked (no new violations)
- [ ] Documentation updated (API reference, user guide)

### Regression Checklist (Every Epic)
- [ ] All existing E2E tests still pass
- [ ] All existing unit tests still pass
- [ ] Admin pages not modified by the Epic still render correctly
- [ ] User dashboard pages not modified still render correctly
- [ ] No new TypeScript errors
- [ ] No new ESLint warnings
- [ ] Production build succeeds
- [ ] All 48 admin pages accessible
- [ ] Theme toggle works (light/dark)
- [ ] RTL mode works for all new pages
- [ ] Mobile responsive for all new pages

---

*End of handoff. ChatGPT can continue as Enterprise Architect from this document without opening any other report.*
