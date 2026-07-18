# RP5 — Generated Task Pack

**Date:** 2026-06-17
**Source:** RP1 gap mapping, RP4 wave planning
**Mode:** Enterprise Planning — No Implementation

---

## Executive Summary

17 new tasks defined: T200–T216. Tasks follow existing tasks.md spec format (What/Why/Story/Epic/Dependencies/Priority/Effort/Actionable Steps).

---

## T200 — Create SYSTEM_DNA.md

| Field | Value |
|-------|-------|
| **Type** | Governance |
| **Gap** | G001 (HIGH/MISSING) |
| **Priority** | P0 |
| **Effort** | 2d |
| **Wave** | 1 |
| **Dependencies** | None |
| **Story** | Governance |
| **Epic** | Project Foundation |

**What:** Create `specs/SYSTEM_DNA.md` — the primary architectural authority describing every domain, schema, endpoint, frontend page, PDF requirement, and deployment architecture.

**Why:** Missing primary authority means all architectural decisions are ad-hoc. Every gap in OR1-OR11 traces back to the absence of SYSTEM_DNA.md.

**Actionable Steps:**
1. Compile domain descriptions from OR1-OR9 certification reports
2. Extract schema definitions from existing migrations
3. Inventory API endpoints from NestJS controllers
4. Map frontend pages from React component tree
5. Document PDF/template requirements from Flask Collection System reference
6. Document deployment architecture
7. Cross-reference with tasks.md to ensure task coverage completeness

---

## T201 — PDF Generation Engine

| Field | Value |
|-------|-------|
| **Type** | Feature |
| **Gap** | G005 (HIGH) |
| **Priority** | P0 |
| **Effort** | 2w |
| **Wave** | 1 |
| **Dependencies** | T202 (Template Engine) |
| **Story** | Document Output |
| **Epic** | v2.0.0 Phase 3 |

**What:** Implement PDF generation service that takes rendered HTML templates and produces PDF documents with Arabic RTL support, QR codes, and security metadata.

**Why:** Zero PDF capability exists. No XML/PDF library in package.json. Collection System Flask uses WeasyPrint — must port to NestJS equivalent (Puppeteer or PDFKit).

**Actionable Steps:**
1. Evaluate and select PDF tech stack (Puppeteer vs PDFKit vs WeasyPrint via subprocess)
2. Create `PdfService` with configurable rendering options
3. Implement Arabic RTL rendering support
4. Implement amount-in-words (Arabic) utility
5. Implement document metadata (author, title, subject)
6. Implement encryption/password protection (P0 security requirement)
7. Create PDF generation pipeline: Template → HTML → PDF
8. Write service unit tests

---

## T202 — Template Engine V3 (NestJS Port)

| Field | Value |
|-------|-------|
| **Type** | Feature |
| **Gap** | G006 (HIGH) |
| **Priority** | P0 |
| **Effort** | 2w |
| **Wave** | 1 |
| **Dependencies** | None (parallel track) |
| **Story** | Document Output |
| **Epic** | v2.0.0 Phase 3 |

**What:** Port the Flask Jinja2 template system to NestJS. Must support invoice, statement, settlement, and report templates with Arabic RTL layout.

**Why:** Template Engine V3 exists in Flask Collection System (certified OR). No template capability exists in NestJS backend. PDF engine (T201) depends on it.

**Actionable Steps:**
1. Extract template schema from Flask Collection System reference
2. Select NestJS template engine (EJS, Handlebars, or custom)
3. Implement template registry service
4. Port Invoice template: subject, date, project info, customer section, breakdown table, settlement, summary, payment/QR, footer
5. Port Statement template: header, beginning balance, transactions, ending balance
6. Port Settlement template: period, project, customer, settlement lines, totals, signatures
7. Port Report template: header, table, totals, footer
8. Write template rendering unit tests

---

## T203 — Bill Cycle Governance

| Field | Value |
|-------|-------|
| **Type** | Feature |
| **Gap** | G007 (MEDIUM) |
| **Priority** | P1 |
| **Effort** | 1w |
| **Wave** | 2 |
| **Dependencies** | T009 (RBAC), T010 (Audit) |
| **Story** | Billing Operations |
| **Epic** | v2.0.0 Phase 2 |

**What:** Implement full bill cycle governance: OPEN→CLOSE approval workflow, CANCELLED with mandatory reason, same-month/same-service overlap guard, and audit trail for all transitions.

**Why:** Bill cycle currently has enum statuses but no transition logic. No guard prevents duplicate cycles.

**Actionable Steps:**
1. Define status machine: OPEN → CLOSED, CANCELLED (from any state)
2. Implement OPEN route with same-month/same-service validation
3. Implement CLOSE route with RBAC approval gate
4. Implement CANCELLED route with mandatory reason field
5. Add audit logging for all transitions
6. Write integration tests for transition validation

---

## T204 — Fix Customer/Unit Resolution

| Field | Value |
|-------|-------|
| **Type** | Bug Fix |
| **Gap** | G012 (MEDIUM) |
| **Priority** | P1 |
| **Effort** | 1d |
| **Wave** | 2 |
| **Dependencies** | T032 (Meter Assignment Logic) |
| **Story** | Billing Fix |
| **Epic** | Phase 6 — Polish |

**What:** Replace hardcoded customer_id='system' and unit_id='system' with active meter assignment resolution at billing period date.

**Why:** Invoice generation currently hardcodes customer and unit to 'system'. Real billing requires resolving the active meter→unit→customer assignment as of the billing period.

**Actionable Steps:**
1. Locate hardcoded 'system' references in invoice generation
2. Implement assignment lookup: meter_id + billing_period_start → active assignment
3. Update invoice create to use resolved customer_id, unit_id
4. Handle edge case: unassigned meter during billing period
5. Write test with known assignment history

---

## T205 — Wire Meter Detail Page to Live API

| Field | Value |
|-------|-------|
| **Type** | Bug Fix |
| **Gap** | G015 (LOW) |
| **Priority** | P2 |
| **Effort** | 1d |
| **Wave** | 3 |
| **Dependencies** | T047 (Readings API), T038 (Meters API) |
| **Story** | Frontend Migration |
| **Epic** | US1 Polish |

**What:** Replace mock data on MeterDetailPage with live API calls.

**Why:** OR5 certification found MeterDetail page uses mock data for readings list.

**Actionable Steps:**
1. Identify all mock data placeholders in MeterDetailPage
2. Wire tabs to corresponding API endpoints
3. Remove mock data after API wiring confirmed working

---

## T206 — DB Unique Constraint for Invoice Dedup

| Field | Value |
|-------|-------|
| **Type** | Database |
| **Gap** | G016 (MEDIUM) |
| **Priority** | P1 |
| **Effort** | 4h |
| **Wave** | 2 |
| **Dependencies** | None |
| **Story** | Database Fix |
| **Epic** | Phase 6 — Polish |

**What:** Add database-level unique constraint on (meter_id, billing_period_id, utility_type) to prevent duplicate invoice generation.

**Why:** No DB constraint exists. Duplicate invoices can be generated for same meter/period/utility.

**Actionable Steps:**
1. Audit existing invoice data for duplicates
2. Create migration with unique constraint
3. Resolve any existing duplicates before applying constraint
4. Update invoice generation to use upsert pattern

---

## T207 — Cancel Invoice Endpoint

| Field | Value |
|-------|-------|
| **Type** | Feature |
| **Gap** | G017 (LOW) |
| **Priority** | P2 |
| **Effort** | 1d |
| **Wave** | 3 |
| **Dependencies** | T063 (Invoice Issue), T010 (Audit) |
| **Story** | Billing Fix |
| **Epic** | Phase 6 — Polish |

**What:** Implement PATCH /invoices/:id/cancel endpoint with reason and audit.

**Why:** No cancel invoice endpoint exists. Only super_admin can delete via hard DELETE.

**Actionable Steps:**
1. Create cancel endpoint with invoice_id + reason body
2. Validate invoice status (can only cancel draft/issued)
3. Log cancellation to audit trail
4. Return cancellation confirmation

---

## T208 — Safe Invoice Regeneration

| Field | Value |
|-------|-------|
| **Type** | Feature |
| **Gap** | G018 (MEDIUM) |
| **Priority** | P1 |
| **Effort** | 2d |
| **Wave** | 2 |
| **Dependencies** | T203 (Bill Cycle), T206 (Unique Constraint) |
| **Story** | Billing Fix |
| **Epic** | Phase 6 — Polish |

**What:** Replace destructive regeneration (delete + re-create) with safe upsert that cancels existing invoice and creates new one.

**Why:** Current regeneration deletes then re-creates, losing audit trail and risking data loss.

**Actionable Steps:**
1. Replace DELETE+CREATE with CANCEL+CREATE pattern
2. Implement upsert by meter_id + billing_period_id + utility_type
3. Preserve original invoice reference in new invoice
4. Add idempotency key to prevent double-regeneration

---

## T209 — SSL/HTTPS Configuration

| Field | Value |
|-------|-------|
| **Type** | Infrastructure |
| **Gap** | G019 (HIGH) |
| **Priority** | P0 |
| **Effort** | 2d |
| **Wave** | 1 |
| **Dependencies** | T211 (Production Environment) |
| **Story** | Security |
| **Epic** | Infrastructure |

**What:** Configure SSL/TLS certificates and enforce HTTPS on production environment.

**Why:** No HTTPS — all traffic is unencrypted HTTP. Zero production security posture.

**Actionable Steps:**
1. Purchase/provision SSL certificate (Let's Encrypt or commercial)
2. Configure reverse proxy (Nginx) with SSL termination
3. Enforce HTTPS redirect
4. Configure HSTS headers
5. Test with SSL Labs

---

## T210 — Monitoring and Alerting

| Field | Value |
|-------|-------|
| **Type** | Infrastructure |
| **Gap** | G020 (MEDIUM) |
| **Priority** | P1 |
| **Effort** | 3d |
| **Wave** | 2 |
| **Dependencies** | T211 (Production Env), T081 (Frontend Observability) |
| **Story** | DevOps |
| **Epic** | Infrastructure |

**What:** Set up application monitoring, error tracking, and alerting for production.

**Why:** Zero monitoring — no way to detect production issues.

**Actionable Steps:**
1. Configure Sentry or similar error tracking for NestJS backend
2. Configure uptime monitoring
3. Set up alert rules (5xx rate > threshold, response time > threshold)
4. Create health check endpoint
5. Set up log aggregation

---

## T211 — Provision Production Environment

| Field | Value |
|-------|-------|
| **Type** | Infrastructure |
| **Gap** | G021 (HIGH) |
| **Priority** | P0 |
| **Effort** | 1w |
| **Wave** | 1 |
| **Dependencies** | None |
| **Story** | Infrastructure |
| **Epic** | Infrastructure |

**What:** Provision production server, configure PostgreSQL, deploy Docker containers, set up networking.

**Why:** No production environment exists. All development is on localhost.

**Actionable Steps:**
1. Provision VPS or cloud instance
2. Install Docker and Docker Compose
3. Configure PostgreSQL with replication
4. Set up reverse proxy (Nginx)
5. Configure firewall and network security
6. Deploy and verify health checks

---

## T212 — QR Code Generation

| Field | Value |
|-------|-------|
| **Type** | Feature |
| **Gap** | G024 (MEDIUM) |
| **Priority** | P1 |
| **Effort** | 2d |
| **Wave** | 2 |
| **Dependencies** | T201 (PDF Engine) |
| **Story** | Document Output |
| **Epic** | v2.0.0 Phase 3 |

**What:** Generate QR codes for invoice verification and embed them in PDF output.

**Why:** No QR code generation exists. Invoice verification requires QR.

**Actionable Steps:**
1. Add qrcode npm package
2. Create QR generation service
3. Embed QR in invoice PDF template
4. Include verification URL + invoice hash in QR data

---

## T213 — Invoice Hash/Verification Code

| Field | Value |
|-------|-------|
| **Type** | Feature |
| **Gap** | G025 (MEDIUM) |
| **Priority** | P1 |
| **Effort** | 2d |
| **Wave** | 2 |
| **Dependencies** | T201 (PDF Engine), T063 (Invoice Issue) |
| **Story** | Document Output |
| **Epic** | v2.0.0 Phase 3 |

**What:** Generate deterministic invoice hash upon issue. Display verification code on invoice and embed in QR.

**Why:** No invoice verification code exists. Invoice authenticity cannot be verified.

**Actionable Steps:**
1. Determine hash input: invoice_id + customer_id + total_amount + issue_date + secret
2. Implement hash computation (SHA-256)
3. Store hash in invoice record
4. Display verification code in invoice PDF
5. Create verification endpoint

---

## T214 — Invoice Due Date

| Field | Value |
|-------|-------|
| **Type** | Bug Fix |
| **Gap** | G026 (LOW) |
| **Priority** | P2 |
| **Effort** | 1d |
| **Wave** | 2 |
| **Dependencies** | T062 (Invoice Gen), T061 (Project Config) |
| **Story** | Billing Fix |
| **Epic** | Phase 6 — Polish |

**What:** Set invoice due_date during generation based on project config (payment terms in days from issue date).

**Why:** Invoice due date is not set during generation.

**Actionable Steps:**
1. Add paymentTermsDays to project configuration
2. Compute due_date = issue_date + paymentTermsDays
3. Set due_date on invoice create
4. Write test

---

## T215 — RTL/Responsive Playwright Tests

| Field | Value |
|-------|-------|
| **Type** | Quality |
| **Gap** | G029 (LOW) |
| **Priority** | P2 |
| **Effort** | 2d |
| **Wave** | 3 |
| **Dependencies** | T080 (Playwright Specs) |
| **Story** | Quality |
| **Epic** | Phase 6 — Polish |

**What:** Add Playwright tests for RTL layout and responsive breakpoints.

**Why:** No RTL/responsive testing exists.

**Actionable Steps:**
1. Define viewport breakpoints (mobile, tablet, desktop)
2. Create RTL layout assertion tests
3. Create responsive element visibility tests
4. Create touch interaction tests

---

## T216 — Scheduled Backup Automation

| Field | Value |
|-------|-------|
| **Type** | Infrastructure |
| **Gap** | G032 (MEDIUM) |
| **Priority** | P1 |
| **Effort** | 1d |
| **Wave** | 2 |
| **Dependencies** | T084a (DR Drill) |
| **Story** | Operations |
| **Epic** | Infrastructure |

**What:** Set up automated PostgreSQL backup with retention policy and restore verification.

**Why:** No backup automation — database has no scheduled backups.

**Actionable Steps:**
1. Create backup script (pg_dump)
2. Schedule via cron/systemd timer
3. Implement retention policy (daily × 7, weekly × 4, monthly × 12)
4. Implement restore verification
5. Document recovery procedure

---

## Tasks.md Update Items

The following existing tasks need status updates in tasks.md:

| Task | Current Status | New Status | Reason |
|------|---------------|------------|--------|
| T066 | [ ] | [x] | Authentication — login/logout/session implemented |
| T067 | [ ] | [x] | customer_statement_view — controller refactored |
| T071a | [ ] | [x] | Consumption view — hook + page created |
| T077 | [ ] | [x] | Action permission gating — lib + component created |
| T085 | [ ] | [x] | Invoice status filter — implemented |
