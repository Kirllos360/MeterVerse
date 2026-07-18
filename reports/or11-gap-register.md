# OR11 — Operational Gap Register

**Date:** 2026-06-17
**Source:** OR0-OR10 Operational Reality Certification

---

## Gap Index

| ID | Area | Severity | Priority |
|----|------|----------|----------|
| G001 | SYSTEM_DNA.md missing | HIGH | P0 |
| G002 | Solar Wallet — no implementation | HIGH | P0 |
| G003 | Chilled Water — no implementation | HIGH | P0 |
| G004 | Settlement Engine — no implementation | HIGH | P0 |
| G005 | PDF Generation — no capability | HIGH | P0 |
| G006 | Template Engine V3 — not ported | HIGH | P0 |
| G007 | Bill Cycle Governance — no workflow | HIGH | P1 |
| G008 | Contract tests — 91 timeouts | MEDIUM | P1 |
| G009 | No CI/CD pipeline | MEDIUM | P1 |
| G010 | No security audit | MEDIUM | P1 |
| G011 | No load testing | MEDIUM | P1 |
| G012 | Invoice — hardcoded customer/unit IDs | MEDIUM | P1 |
| G013 | Tasks.md out of date (5 tasks) | LOW | P2 |
| G014 | No frontend spec tests | LOW | P2 |
| G015 | Meter Detail Page — mock data only | LOW | P2 |
| G016 | No bill cycle duplicate prevention DB constraint | MEDIUM | P1 |
| G017 | No cancel invoice endpoint | LOW | P2 |
| G018 | Invoice generation deletes before recreating | MEDIUM | P1 |
| G019 | No HTTPS/SSL configured | HIGH | P0 |
| G020 | No monitoring/alerting | MEDIUM | P1 |
| G021 | No production environment provisioned | HIGH | P0 |
| G022 | Only 7 roles (16 required for v2.0.0) | MEDIUM | P2 |
| G023 | Single schema (15 area DBs not created) | HIGH | P0 |
| G024 | No QR code generation | MEDIUM | P1 |
| G025 | No invoice hash/verification code | MEDIUM | P1 |
| G026 | Invoice due date not set during generation | LOW | P2 |
| G027 | Smoke script environment failure (bunx PATH) | LOW | P3 |
| G028 | No Playwright UAT .spec.ts files | MEDIUM | P1 |
| G029 | No RTL/responsive testing in UAT | LOW | P2 |
| G030 | No Symbiot bridge implementation | HIGH | P0 |
| G031 | No data migration scripts | HIGH | P0 |
| G032 | No backup automation (beyond DR scripts) | MEDIUM | P1 |

---

## Detailed Gap Records

### G001 — SYSTEM_DNA.md Missing
- **Area:** Governance
- **Description:** The primary architecture authority document does not exist anywhere in the repository.
- **Severity:** HIGH
- **Impact:** No canonical source of truth for architecture decisions, business rules, or integration contracts.
- **Risk:** Undocumented assumptions propagate across phases, causing rework and integration failures.
- **Evidence:** Searched `**/SYSTEM_DNA*` — zero results across entire repo.
- **Recommended Fix:** Create SYSTEM_DNA.md from existing architecture docs (plan.md, spec.md, data-model.md, ROUTE_OF_DATA.md) and ratify with stakeholders.
- **Estimated Effort:** 2 days
- **Dependencies:** None
- **Priority:** P0

### G002 — Solar Wallet Not Implemented
- **Area:** Billing
- **Description:** Entire Solar Wallet feature is unbuilt. No solar meter type, no solar readings, no wallet calculation, no wallet ledger, no solar invoice.
- **Severity:** HIGH
- **Impact:** Cannot bill solar customers. Missing core business requirement.
- **Risk:** 100% of solar customer revenue cannot be processed through new system.
- **Evidence:** Zero `solar` references in Prisma schema, backend source, or frontend components. Only payment method enum has `wallet` (mobile wallet, not solar wallet).
- **Recommended Fix:** Implement under T107 (v2.0.0). Port `SolarWalletTransaction` model, wallet calculation, and wallet ledger from Collection System reference.
- **Estimated Effort:** 2 weeks
- **Dependencies:** T088 (Area DB template), T098 (readings with solar registers)
- **Priority:** P0

### G003 — Chilled Water Not Implemented
- **Area:** Billing
- **Description:** No BTU meter type, no chilled water readings, no chilled water invoice, no BTU rate configuration.
- **Severity:** HIGH
- **Impact:** Cannot bill chilled water customers. Missing core business requirement.
- **Risk:** 100% of chilled water revenue cannot be processed.
- **Evidence:** No `chilled_water` or `BTU` references in schema, backend, or frontend. Phase F certification validated the reference Flask implementation only.
- **Recommended Fix:** Port ChilledWaterConfig, ChilledWaterSettlement models, BTU reading/invoice flow, and settlement approval from Flask reference. Certified formula: Total = Consumption × Rate_per_BTU.
- **Estimated Effort:** 3 weeks
- **Dependencies:** T088 (Area DB template), T097 (invoice page support)
- **Priority:** P0

### G004 — Settlement Engine Not Implemented
- **Area:** Billing
- **Description:** No settlement types (fixed/percentage/one-time), no settlement approval workflow, no versioning, no carry-forward.
- **Severity:** HIGH
- **Impact:** Cannot process contractual settlements. Missing core business requirement.
- **Risk:** Revenue leakage from unprocessed settlements.
- **Evidence:** No settlement models, routes, or UI. Phase F certification validated reference Flask implementation only.
- **Recommended Fix:** Port settlement engine from `reference/collection-system/app/routes_chilled_settlement.py` and `models.py` (ChilledWaterConfig, ChilledWaterSettlement). Implement DRAFT→APPROVED workflow with versioning.
- **Estimated Effort:** 3 weeks
- **Dependencies:** G003 (Chilled Water), T088 (Area DB template)
- **Priority:** P0

### G005 — PDF Generation Not Available
- **Area:** Document Output
- **Description:** No PDF generation capability exists in the NestJS backend. No PDF libraries installed.
- **Severity:** HIGH
- **Impact:** Cannot produce customer-facing invoices, statements, or reports in PDF format.
- **Risk:** Regulatory non-compliance (invoices must be printable/deliverable as PDF).
- **Evidence:** Checked `backend/package.json` for pdfkit, pdfmake, puppeteer, handlebars, ejs — none present. No PDF generation code found.
- **Recommended Fix:** Port `template_v3.py` from Flask reference (Jinja2 HTML + WeasyPrint PDF). Choose NestJS-compatible approach: either Puppeteer/Playwright (HTML→PDF) or PDFKit (programmatic PDF).
- **Estimated Effort:** 2 weeks
- **Dependencies:** G006 (Template Engine), T068 (invoice frontend)
- **Priority:** P0

### G006 — Template Engine V3 Not Ported
- **Area:** Document Output
- **Description:** Template rendering engine exists in Flask (`template_v3.py`) but has not been ported to NestJS.
- **Severity:** HIGH
- **Impact:** Cannot render invoice templates, statement templates, or any document layout.
- **Risk:** All document output blocked until template engine is available.
- **Evidence:** Flask `template_v3.py` = 5,367 bytes with Jinja2 HTML→WeasyPrint PDF pipeline. NestJS backend has 0 template files.
- **Recommended Fix:** Port template engine to NestJS. Options: (1) `handlebars` + `puppeteer`, (2) `ejs` + `playwright`, or (3) native NestJS template rendering with `@nestjs/axios` to a PDF microservice.
- **Estimated Effort:** 2 weeks
- **Dependencies:** G005 (PDF Generation)
- **Priority:** P0

### G007 — Bill Cycle Governance Missing
- **Area:** Operations
- **Description:** No OPEN/CLOSE/CANCELLED workflow for billing periods. No approval gate. No duplicate prevention at DB level.
- **Severity:** HIGH
- **Impact:** Risk of double-billing or generating invoices for closed periods. No audit trail for cycle state changes.
- **Risk:** Financial errors from ungoverned cycle transitions.
- **Evidence:** `BillingPeriod` model has `active/closed/cancelled` enum but no governance logic around transitions. Invoice generation deletes prior invoices instead of blocking generation for CLOSED periods.
- **Recommended Fix:** Implement bill cycle governance: OPEN→CLOSE transition with approval, CANCELLED with reason+audit, DB unique constraint on `(meterId, billingPeriodId, utilityType)`, generation blocked on CLOSED periods.
- **Estimated Effort:** 1 week
- **Dependencies:** T010 (audit), T009 (RBAC)
- **Priority:** P1

### G008 — 91 Contract Test Timeouts
- **Area:** Quality
- **Description:** 91 contract test assertions fail due to 35-second timeout. Root cause likely missing DB mocks.
- **Severity:** MEDIUM
- **Impact:** Cannot validate API contract compliance. CI pipeline cannot go green.
- **Risk:** Undetected API drift from `meter-verse-api.yaml` contract.
- **Evidence:** `npm test` shows 91 failures all with timeout at 35s. Contract tests attempt real DB operations without proper mocking.
- **Recommended Fix:** Add proper Prisma mocks to contract test setup. Increase timeout or implement in-memory DB for contract tests.
- **Estimated Effort:** 2 days
- **Dependencies:** T012 (contract harness), T083 (contract reconciliation)
- **Priority:** P1

### G009 — No CI/CD Pipeline
- **Area:** DevOps
- **Description:** No GitHub Actions, no automated build/test/deploy pipeline.
- **Severity:** MEDIUM
- **Impact:** Every deployment is manual. No quality gates between commits and production.
- **Risk:** Human error in deployment, no reproducible builds.
- **Evidence:** Checked `.github/workflows/`, `ci-cd/` — no CI/CD configuration files.
- **Recommended Fix:** Create GitHub Actions workflow: backend test → build → push Docker image, frontend lint → build → push. Add quality gates (test pass, lint pass, build pass).
- **Estimated Effort:** 3 days
- **Dependencies:** G009a (Dockerfile for production)
- **Priority:** P1

### G010 — No Security Audit
- **Area:** Security
- **Description:** No formal security audit, penetration testing, or OWASP scanning performed.
- **Severity:** MEDIUM
- **Impact:** Unknown vulnerability surface. Cannot certify production readiness.
- **Risk:** SQL injection, XSS, CSRF, or authentication bypass could exist undetected.
- **Evidence:** No security audit reports. No `.semgrep-rules.yaml`. No `npm audit` in CI.
- **Recommended Fix:** Run OWASP ZAP scan, SAST scan (Semgrep), dependency audit (`npm audit`), and manual penetration testing on auth/billing paths.
- **Estimated Effort:** 1 week
- **Dependencies:** None
- **Priority:** P1

### G011 — No Load Testing
- **Area:** Performance
- **Description:** No load testing performed. Scalability characteristics unknown.
- **Severity:** MEDIUM
- **Impact:** Unknown whether system can handle peak billing cycles (month-end generation across thousands of meters).
- **Risk:** System crash during first production billing run.
- **Evidence:** No `k6` or `artillery` scripts in repo. No load test reports.
- **Recommended Fix:** Create k6 load test script simulating: invoice generation (100 concurrent), payment recording (50 concurrent), statement retrieval (200 concurrent). Target: API < 500ms P95.
- **Estimated Effort:** 3 days
- **Dependencies:** T062/T065 (invoice/payment endpoints)
- **Priority:** P1

### G012 — Hardcoded Customer/Unit IDs in Invoice Generation
- **Area:** Billing
- **Description:** Invoice generation uses `'system'` for `customerId` and `unitId` instead of resolving actual customer/unit from meter assignment.
- **Severity:** MEDIUM
- **Impact:** Invoices cannot be attributed to real customers. Statement endpoint cannot filter by customer.
- **Risk:** Financial misattribution.
- **Evidence:** `billing.controller.ts` line 92: `customerId: dto.customerIds?.[0] ?? 'system'`, line 93: `unitId: 'system'`
- **Recommended Fix:** Resolve `customerId` and `unitId` from `MeterAssignment` with `endAt IS NULL` for the meter at the billing period date.
- **Estimated Effort:** 1 day
- **Dependencies:** T032 (meter assignment logic)
- **Priority:** P1

### G013 — Tasks.md Out of Date
- **Area:** Governance
- **Description:** 5 tasks marked [ ] (not done) in tasks.md have been implemented in code.
- **Severity:** LOW
- **Impact:** Project tracker shows 84.6% completion when actual MVP completion is ~90%.
- **Risk:** Inaccurate progress reporting to stakeholders.
- **Evidence:** T066, T067, T071a, T077, T085 all implemented but marked [ ] in tasks.md.
- **Recommended Fix:** Update tasks.md to mark T066, T067, T071a, T077, T085 as [X]. Recalculate completion percentages.
- **Estimated Effort:** 1 hour
- **Dependencies:** None
- **Priority:** P2

### G014 — No Frontend Spec Tests
- **Area:** Quality
- **Description:** Zero `.spec.ts` or `.test.ts` files exist in the Frontend project.
- **Severity:** LOW
- **Impact:** No automated UI assertion layer. Changes to frontend components cannot be regression-tested.
- **Risk:** UI regressions undetected until manual smoke test.
- **Evidence:** Searched `Frontend/` for `*.spec.ts` — zero results. Only `smoke-all-pages.mjs` exists (Playwright script, not Jest/Vitest test).
- **Recommended Fix:** Add Jest/Vitest with React Testing Library. Start with critical component tests (SmartTable, StatusBadge, ProtectedAction, PageHeader).
- **Estimated Effort:** 1 week
- **Dependencies:** T079 (frontend contract tests task)
- **Priority:** P2

### G015 — Meter Detail Page Uses Mock Data
- **Area:** Frontend
- **Description:** MeterDetailPage.tsx uses `mockMeterReadings` and `mockMeterAssignments` instead of API hooks.
- **Severity:** LOW
- **Impact:** Meter detail shows stale/mock data. No reading history from live data.
- **Risk:** Users see incorrect meter information during pilot.
- **Evidence:** `MeterDetailPage.tsx` imports from `@/lib/mock-data`. No `useMeterReadings()` or `useMeterDetail()` hook used.
- **Recommended Fix:** Create `useMeterReadings(meterId)` and `useMeterDetail(meterId)` hooks, wire MeterDetailPage to API, keep mock fallback via feature flag.
- **Estimated Effort:** 1 day
- **Dependencies:** T047 (readings API), T038 (meters API)
- **Priority:** P2

### G016 — No DB-Level Duplicate Prevention for Invoices
- **Area:** Database
- **Description:** No unique constraint on `(meterId, billingPeriodId, utilityType)` in Invoice table.
- **Severity:** MEDIUM
- **Impact:** Race conditions could create duplicate invoices for same meter/period/utility.
- **Risk:** Double-billing if two generation requests race.
- **Evidence:** `Invoice` model in schema.prisma — no composite unique constraint on these three fields. Only `invoiceNumber` is unique.
- **Recommended Fix:** Add composite unique index: `@@unique([meterId, billingPeriodId, utilityType])` on Invoice model.
- **Estimated Effort:** 4 hours
- **Dependencies:** None
- **Priority:** P1

### G017 — No Cancel Invoice Endpoint
- **Area:** Billing
- **Description:** No `POST /invoices/:id/cancel` endpoint exists.
- **Severity:** LOW
- **Impact:** Draft invoices cannot be cancelled through API. Only adjustment (credit/debit) is available for issued invoices.
- **Risk:** Orphaned draft invoices accumulate.
- **Evidence:** `billing.controller.ts` — no cancel route. Frontend invoice detail shows cancel button with `toast.info()` placeholder.
- **Recommended Fix:** Implement cancel endpoint: validate invoice is in draft status, set status to cancelled, add audit log entry.
- **Estimated Effort:** 1 day
- **Dependencies:** T063 (invoice issue), T010 (audit)
- **Priority:** P2

### G018 — Destructive Invoice Regeneration
- **Area:** Billing
- **Description:** Invoice generation deletes existing invoices before recreating them for same meter/period/utility.
- **Severity:** MEDIUM
- **Impact:** If generation fails mid-way, some invoices are deleted and not recreated. Data loss.
- **Risk:** Partial data loss on generation failure.
- **Evidence:** `billing.controller.ts` lines 86-94: `deleteMany({ where: { meterId, billingPeriodId, utilityType } })` before `create()`.
- **Recommended Fix:** Replace delete+recreate with upsert or skip-if-exists logic. Only allow regeneration for draft invoices. Add generation versioning.
- **Estimated Effort:** 2 days
- **Dependencies:** G007 (bill cycle governance), G016 (duplicate prevention)
- **Priority:** P1

### G019 — No SSL/HTTPS
- **Area:** Security
- **Description:** No HTTPS configuration. API serves over HTTP only.
- **Severity:** HIGH
- **Impact:** All traffic is plaintext. Credentials, financial data, and PII transmitted in clear.
- **Risk:** Data interception, regulatory non-compliance (PCI-DSS, GDPR).
- **Evidence:** No SSL certificates in repo. No Nginx config. Backend starts on HTTP.
- **Recommended Fix:** Provision SSL certificate. Configure Nginx reverse proxy with HTTPS termination. Enforce HTTPS via HSTS header.
- **Estimated Effort:** 2 days
- **Dependencies:** G009a (deployment infrastructure)
- **Priority:** P0

### G020 — No Monitoring/Alerting
- **Area:** DevOps
- **Description:** No monitoring dashboards, no error alerting, no uptime monitoring.
- **Severity:** MEDIUM
- **Impact:** Production issues silent until users report them.
- **Risk:** Extended downtime, data loss undetected.
- **Evidence:** No monitoring config files. No uptime check tooling.
- **Recommended Fix:** Set up health check endpoint → uptime monitoring (e.g., UptimeRobot, Pingdom). Add error rate alerting (Sentry, Grafana). Configure log aggregation.
- **Estimated Effort:** 3 days
- **Dependencies:** G009 (CI/CD), T081 (observability frontend)
- **Priority:** P1

### G021 — No Production Environment
- **Area:** DevOps
- **Description:** No production server provisioned. All development runs on local docker-compose.
- **Severity:** HIGH
- **Impact:** Cannot deploy to production. No staging environment for pre-release validation.
- **Risk:** Environment-specific bugs (Windows dev vs Linux prod).
- **Evidence:** Only `docker-compose.yml` exists (PostgreSQL only for local dev). No production deployment scripts.
- **Recommended Fix:** Provision Linux server (Ubuntu 22.04). Set up PostgreSQL cluster. Deploy NestJS backend (PM2 or Docker). Deploy Next.js frontend (standalone output). Configure Nginx reverse proxy.
- **Estimated Effort:** 1 week
- **Dependencies:** G009 (CI/CD), G019 (SSL)
- **Priority:** P0

### G022 — Only 7 of 16 Roles Implemented
- **Area:** Security
- **Description:** Current system has 7 roles. v2.0.0 requires 16 profiles.
- **Severity:** MEDIUM
- **Impact:** Cannot enforce granular permissions for collector, meter_reader, inspector, supervisor, accountant, viewer roles.
- **Risk:** Over-permissioned users in production.
- **Evidence:** `Role` enum in `backend/src/auth/types/role.enum.ts` — only 7 roles match frontend types.
- **Recommended Fix:** Implement 9 additional roles (system_admin, admin, area_manager, team_leader, collector, meter_reader, inspector, supervisor, accountant, viewer). Add area-scoped middleware.
- **Estimated Effort:** 1 week
- **Dependencies:** T089 (16-profile RBAC)
- **Priority:** P2

### G023 — Single Schema Instead of 15 Area DBs
- **Area:** Database
- **Description:** All data stored in single `sim_system` schema instead of 15 per-area databases.
- **Severity:** HIGH
- **Impact:** No tenant isolation. Single point of failure. Cannot scale per customer.
- **Risk:** One customer's data load impacts all others.
- **Evidence:** `schema.prisma` uses `schema: "sim_system"` for all models. No area partitioning.
- **Recommended Fix:** Implement area DB template (45 tables per area). Create migration scripts for each of 15 areas. Add area middleware for query scoping.
- **Estimated Effort:** 4 weeks
- **Dependencies:** T088 (Area DB template)
- **Priority:** P0

### G024 — No QR Code Generation
- **Area:** Document Output
- **Description:** No QR code library or generation capability.
- **Severity:** MEDIUM
- **Impact:** Invoices and documents cannot include QR codes for verification.
- **Risk:** Regulatory non-compliance (some jurisdictions require QR on invoices).
- **Evidence:** `backend/package.json` — no `qrcode` package.
- **Recommended Fix:** Add `qrcode` npm package. Generate QR codes for invoice verification (encode invoice number + amount + date). Embed in PDF output.
- **Estimated Effort:** 2 days
- **Dependencies:** G005 (PDF generation)
- **Priority:** P1

### G025 — No Invoice Hash/Verification Code
- **Area:** Document Output
- **Description:** Invoices have no cryptographic hash or verification code for authenticity.
- **Severity:** MEDIUM
- **Impact:** Cannot verify invoice authenticity. Susceptible to forgery.
- **Risk:** Disputed invoices without cryptographic proof.
- **Evidence:** `Invoice` model has no `hash` or `verificationCode` field. No hash computation in invoice generation.
- **Recommended Fix:** Add `hash` field to Invoice model. Compute SHA-256 of invoice data (number, amount, customer, date, meter). Return hash in API response and embed in PDF.
- **Estimated Effort:** 2 days
- **Dependencies:** G005 (PDF generation), T063 (invoice issue)
- **Priority:** P1

### G026 — Invoice Due Date Not Set
- **Area:** Billing
- **Description:** Invoice generation does not set `dueAt` field.
- **Severity:** LOW
- **Impact:** No due date on invoices. Overdue detection impossible.
- **Risk:** Delayed payments without automated follow-up.
- **Evidence:** `billing.controller.ts` — `dueAt` not set during `invoice.create()`. `Invoice` model has nullable `dueAt?` with no default.
- **Recommended Fix:** Set `dueAt = period.endDate + project.paymentTermsDays` (or default 30 days) during invoice generation. Add overdue detection cron job.
- **Estimated Effort:** 1 day
- **Dependencies:** T062 (invoice generation), T061 (project config)
- **Priority:** P2

### G027 — Smoke Script Fails (bunx PATH)
- **Area:** Quality
- **Description:** Smoke test script fails because `bunx` is not in PATH in current environment.
- **Severity:** LOW
- **Impact:** Cannot run automated frontend smoke tests.
- **Risk:** Pre-existing environment issue, not code defect.
- **Evidence:** `test:smoke` output: `ENOENT: no such file or directory, uv_spawn 'bunx'`
- **Recommended Fix:** Ensure `bun` is installed globally and `bunx` is in PATH. Or modify smoke script to fall back to `npx next start` or `node_modules/.bin/next start`.
- **Estimated Effort:** 1 hour
- **Dependencies:** None
- **Priority:** P3

### G028 — No Playwright UAT .spec.ts Files
- **Area:** Quality
- **Description:** Zero Playwright test runner spec files. Smoke test is a plain .mjs script.
- **Severity:** MEDIUM
- **Impact:** Cannot run targeted UAT assertions. No test reports. No parallel test execution.
- **Risk:** Inefficient manual UAT. No regression safety net.
- **Evidence:** Zero `.spec.ts` files in `Frontend/`. Smoke script is single-file without test runner.
- **Recommended Fix:** Create Playwright test runner config. Write UAT spec files: login.spec.ts, billing.spec.ts, meter-lifecycle.spec.ts, reading-flow.spec.ts. Integrate with `test:smoke` workflow.
- **Estimated Effort:** 1 week
- **Dependencies:** T080 (E2E coverage expansion)
- **Priority:** P1

### G029 — No RTL/Responsive Testing
- **Area:** Quality
- **Description:** No automated testing for Arabic/RTL rendering or responsive breakpoints.
- **Severity:** LOW
- **Impact:** RTL layout issues may go undetected. Mobile/responsive views untested.
- **Risk:** Poor UX for Arabic-speaking users.
- **Evidence:** `smoke-all-pages.mjs` uses single desktop viewport. No language toggle test.
- **Recommended Fix:** Add Playwright tests with `page.emulateMedia({ language: 'ar' })` and responsive viewport sizes (375px, 768px, 1440px). Assert RTL layout and Arabic text rendering.
- **Estimated Effort:** 2 days
- **Dependencies:** G028 (Playwright spec files)
- **Priority:** P2

### G030 — No Symbiot Bridge Implementation
- **Area:** Integration
- **Description:** The Symbiot bridge for meter communication (10 TCP × 100 HTTP channels) is not implemented.
- **Severity:** HIGH
- **Impact:** No real-time meter communication. Automatic readings collection impossible.
- **Risk:** Cannot replace existing Collection System without Symbiot integration.
- **Evidence:** No `symbiot` module in `backend/src/`. No bridge client. Task T091 at 0%.
- **Recommended Fix:** Implement Symbiot bridge per T091 spec: 10 TCP channels (ports 5010-5019), each supporting 100 concurrent connections, health check every 5s, auto-failover, exponential backoff.
- **Estimated Effort:** 4 weeks
- **Dependencies:** T091 (Symbiot bridge spec)
- **Priority:** P0

### G031 — No Data Migration Scripts
- **Area:** Migration
- **Description:** No scripts for migrating data from SBill, Collection Tracker, or solar wallet historical data.
- **Severity:** HIGH
- **Impact:** Cannot migrate production data. New system starts empty.
- **Risk:** Manual data entry for thousands of customers.
- **Evidence:** No `scripts/migration/` directory. Tasks T107-T110 at 0%.
- **Recommended Fix:** Create migration scripts per source system: Solar wallet (T107), SBill Palm Hills (T108), SBill Estates (T109), Collection Tracker (T110). Include row-count validation and rollback plans.
- **Estimated Effort:** 6 weeks
- **Dependencies:** T088 (Area DB template), G023 (multi-schema)
- **Priority:** P0

### G032 — No Backup Automation
- **Area:** Operations
- **Description:** DR backup/restore scripts exist (`dr-backup.sh`, `dr-backup.ps1`) but no scheduled backup automation.
- **Severity:** MEDIUM
- **Impact:** Backups require manual execution. No automated backup cadence.
- **Risk:** Data loss between manual backups.
- **Evidence:** Scripts exist but no cron job, no scheduled task, no backup monitoring.
- **Recommended Fix:** Schedule `dr-backup.sh` via cron (Linux) or Task Scheduler (Windows) for 15-minute RPO. Add backup monitoring with alert on failure. Test restore quarterly.
- **Estimated Effort:** 1 day
- **Dependencies:** T084a (DR drill)
- **Priority:** P1
