# G013-C — Task Inventory Expansion

**Date:** 2026-06-17
**Status:** EXPANSION DOCUMENTED
**Action:** Insert Phase 7 (Governance & Remediation) into tasks.md after Phase 6

---

## Task Insertion Summary

| Task | Priority | Dependency | Story | Added |
|------|----------|-----------|-------|-------|
| T200 | P0 | None | Governance | ✅ |
| T201 | P0 | T202 | Document Output | ✅ |
| T202 | P0 | None | Document Output | ✅ |
| T203 | P1 | T009, T010 | Billing Operations | ✅ |
| T204 | P1 | T032 | Billing Fix | ✅ |
| T205 | P2 | T047, T038 | Frontend Migration | ✅ |
| T206 | P1 | None | Database Fix | ✅ |
| T207 | P2 | T063, T010 | Billing Fix | ✅ |
| T208 | P1 | T203, T206 | Billing Fix | ✅ |
| T209 | P0 | T211 | Security | ✅ |
| T210 | P1 | T211, T081 | DevOps | ✅ |
| T211 | P0 | None | Infrastructure | ✅ |
| T212 | P1 | T201 | Document Output | ✅ |
| T213 | P1 | T201, T063 | Document Output | ✅ |
| T214 | P2 | T062, T061 | Billing Fix | ✅ |
| T215 | P2 | T080 | Quality | ✅ |
| T216 | P1 | T084a | Operations | ✅ |

---

## Insertion Point

After line 773 (end of Phase 6 / T085) and before the `---` separator at line 774.

## Phase 7 Content to Insert

```markdown
## Phase 7: Governance & Remediation (T200-T216)

**Purpose**: Address 32 operational gaps identified in OR11 gap register. Populated by RP5 Generated Task Pack, sequenced per RP6 SpecKit Execution Order. Must complete governance tasks (T200, G013) before P0 implementation tasks.

### Wave 1 — Foundation & Governance

- [ ] T200 Create SYSTEM_DNA.md — primary architectural authority covering every domain, schema, endpoint, frontend page, PDF requirement, and deployment architecture
  - **Dependencies**: None
  - **Area/Files**: `reports/SYSTEM_DNA.md` (draft at SYSTEM_DNA_DRAFT.md)
  - **Acceptance**: SYSTEM_DNA.md ratified as single source of truth; all 20 sections complete
  - **Validation**: Reviewed by stakeholders; commitment to governance rules
  - **Risk**: Governance Rule 1 locked — all future decisions reference this

- [ ] T201 PDF Generation Engine — implement PDF service with Arabic RTL, QR codes, and security metadata
  - **Dependencies**: T202 (Template Engine)
  - **Area/Files**: `backend/src/pdf/`, `qrcode` npm package
  - **Acceptance**: Invoice/statement/settlement PDFs render with proper Arabic RTL, QR codes, document hash, amount-in-words
  - **Validation**: `npm test -- pdf` + visual comparison against Flask WeasyPrint reference
  - **Risk**: PDF tech stack decision (Puppeteer vs PDFKit vs WeasyPrint); run 2-day spike

- [ ] T202 Template Engine V3 (NestJS Port) — port Flask Jinja2 template system to NestJS for invoice/statement/settlement/report templates
  - **Dependencies**: None (parallel track with T086)
  - **Area/Files**: `backend/src/templates/`, template definition storage
  - **Acceptance**: Invoice, statement, settlement, and report templates rendering in NestJS; matching Flask reference output
  - **Validation**: `npm test -- templates` + render comparison against Collection System output
  - **Risk**: Template engine selection (Handlebars, EJS, custom); must support Arabic RTL layout

- [ ] T203 Bill Cycle Governance — implement full OPEN→CLOSE→CANCEL workflow with approval and duplicate prevention
  - **Dependencies**: T009 (RBAC), T010 (Audit)
  - **Area/Files**: `backend/src/billing/cycle/`, bill cycle controller + service
  - **Acceptance**: OPEN validates no duplicate; CLOSE requires approval; CANCELLED requires reason; all transitions audited
  - **Validation**: `npm test -- bill-cycle`
  - **Risk**: Existing invoice generation must respect cycle CLOSED state

- [ ] T204 Fix Customer/Unit Resolution — replace hardcoded 'system' customer_id/unit_id with active meter assignment lookup
  - **Dependencies**: T032 (Meter Assignment)
  - **Area/Files**: `backend/src/billing/invoice-generate.command.ts`
  - **Acceptance**: Invoice customer/unit resolved from active assignment at billing period date
  - **Validation**: `npm test -- invoice-customer-resolution`
  - **Risk**: Unassigned meters during billing period must be handled gracefully

- [ ] T205 Wire Meter Detail Page to Live API — replace mock data with live API calls
  - **Dependencies**: T047 (Readings API), T038 (Meters API)
  - **Area/Files**: `Frontend/src/components/meters/MeterDetailPage.tsx`
  - **Acceptance**: All tabs show live API data; mock fallback removed
  - **Validation**: `graphify query "meter detail live api" && bun run lint && bun run build && bun run test:smoke`
  - **Risk**: API contract mismatch; validate at hook boundary

- [ ] T206 DB Unique Constraint for Invoice Dedup — add DB-level unique constraint on (meter_id, billing_period_id, utility_type)
  - **Dependencies**: None
  - **Area/Files**: `backend/prisma/migrations/*_invoice_dedup/`
  - **Acceptance**: Duplicate invoice generation blocked at DB level
  - **Validation**: `npx prisma migrate dev --name invoice_dedup` + duplicate insert rejected
  - **Risk**: Existing duplicates must be resolved before applying constraint

- [ ] T207 Cancel Invoice Endpoint — implement PATCH /invoices/:id/cancel with reason and audit
  - **Dependencies**: T063 (Invoice Issue), T010 (Audit)
  - **Area/Files**: `backend/src/billing/invoice-cancel.command.ts`
  - **Acceptance**: Only draft/issued invoices cancellable; mandatory reason; audit trail; super_admin guard
  - **Validation**: `npm test -- invoice-cancel`
  - **Risk**: Cancel must not be allowed on paid invoices

- [ ] T208 Safe Invoice Regeneration — replace DELETE+CREATE with CANCEL+CREATE pattern
  - **Dependencies**: T203 (Bill Cycle), T206 (Unique Constraint)
  - **Area/Files**: `backend/src/billing/invoice-generate.command.ts`
  - **Acceptance**: Regeneration cancels existing invoice, creates new one with reference; audit trail preserved
  - **Validation**: `npm test -- safe-regeneration`
  - **Risk**: Must not lose billing history during regeneration

- [ ] T209 SSL/HTTPS Configuration — configure SSL certificates and enforce HTTPS on production
  - **Dependencies**: T211 (Production Environment)
  - **Area/Files**: Nginx config, certificate store
  - **Acceptance**: HTTPS enforced on all production traffic; HSTS configured; SSL Labs grade ≥ B
  - **Validation**: `curl -sI https://[production]/api/v1/health`
  - **Risk**: Certificate renewal automation required

- [ ] T210 Monitoring and Alerting — set up Sentry, uptime monitoring, and alert rules
  - **Dependencies**: T211 (Production Env), T081 (Frontend Observability)
  - **Area/Files**: Sentry config, monitoring dashboard
  - **Acceptance**: Error tracking operational; uptime monitoring pings health endpoint; alerts configured for 5xx > threshold
  - **Validation**: Trigger test error; verify alert received
  - **Risk**: Alert fatigue from noisy errors; tune thresholds

- [ ] T211 Provision Production Environment — provision server, deploy Docker, configure networking
  - **Dependencies**: None
  - **Area/Files**: Docker Compose, Nginx config, firewall rules
  - **Acceptance**: Ubuntu 22.04 server with Docker, PostgreSQL, reverse proxy; health check returns 200
  - **Validation**: `curl http://[production]/api/v1/health`
  - **Risk**: Network latency between Linux API and Windows Symbiot bridge; keep bridge on same LAN

### Wave 2 — Billing & Operations

- [ ] T212 QR Code Generation — generate QR codes for invoice verification and embed in PDF
  - **Dependencies**: T201 (PDF Engine)
  - **Area/Files**: `backend/src/pdf/qr.service.ts`, `qrcode` npm package
  - **Acceptance**: QR code generated per invoice; embedded in PDF; contains verification URL + invoice hash
  - **Validation**: `npm test -- qr` + visual inspection
  - **Risk**: QR data payload must fit within version limits

- [ ] T213 Invoice Hash/Verification Code — generate deterministic SHA-256 hash on invoice issue
  - **Dependencies**: T201 (PDF Engine), T063 (Invoice Issue)
  - **Area/Files**: `backend/src/billing/invoice-hash.service.ts`, invoice model
  - **Acceptance**: Hash computed on issue; stored in invoice record; displayed in PDF and QR; verification endpoint returns match/mismatch
  - **Validation**: `npm test -- invoice-hash` + verify same invoice produces same hash
  - **Risk**: Hash input must be deterministic across all billable scenarios

- [ ] T214 Invoice Due Date — set due_date on invoice generation based on project payment terms
  - **Dependencies**: T062 (Invoice Gen), T061 (Project Config)
  - **Area/Files**: `backend/src/billing/invoice-generate.command.ts`, project config model
  - **Acceptance**: due_date = issue_date + paymentTermsDays; overdue detection via cron
  - **Validation**: `npm test -- invoice-due-date`
  - **Risk**: Legacy invoices without due_date must be backfilled

### Wave 3 — Standard Features

- [ ] T215 RTL/Responsive Playwright Tests — add tests for RTL layout and responsive breakpoints
  - **Dependencies**: T080 (Playwright Specs)
  - **Area/Files**: `Frontend/scripts/`, Playwright test specs
  - **Acceptance**: Mobile/tablet/desktop viewports tested; RTL layout assertions pass; touch interactions work
  - **Validation**: `cd Frontend && bun run test:smoke`
  - **Risk**: Playwright must support viewport emulation

- [ ] T216 Scheduled Backup Automation — automated PostgreSQL backup with retention and restore verification
  - **Dependencies**: T084a (DR Drill)
  - **Area/Files**: `backend/ops/scripts/backup.sh`, `backend/ops/scripts/restore.sh`, cron config
  - **Acceptance**: Daily/weekly/monthly backup schedule; restore verified within RTO (2h); retention policy enforced
  - **Validation**: `bash ops/scripts/restore.sh` against scratch DB
  - **Risk**: Backup size grows with data volume; monitor disk space
```

---

## Tasks.md Update Block

The above Phase 7 section will be inserted into tasks.md after the Phase 6 content (after T085 at line 773) and before the `---` separator at line 774. This preserves all existing numbering and does not conflict with any existing task IDs.
