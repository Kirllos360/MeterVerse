# MeterVerse — Enterprise Domain Blueprint

**Date:** 2026-07-21  
**Version:** 1.0  
**Author:** Enterprise Architecture Review  
**Classification:** Internal — Architecture Decision Record

---

## Table of Contents

1. [Current Architecture](#1-current-architecture)
2. [Business Domains](#2-business-domains)
3. [Domain Relationships](#3-domain-relationships)
4. [Business Workflows](#4-business-workflows)
5. [Service Connection Analysis](#5-service-connection-analysis)
6. [Database Review](#6-database-review)
7. [API Review](#7-api-review)
8. [Frontend Review](#8-frontend-review)
9. [Sidebar Review](#9-sidebar-review)
10. [Permissions Matrix](#10-permissions-matrix)
11. [Enterprise Workspace Design](#11-enterprise-workspace-design)
12. [Enterprise Missing Features](#12-enterprise-missing-features)
13. [Implementation Order](#13-implementation-order)
14. [Acceptance Criteria](#14-acceptance-criteria)
15. [Generated Reports](#15-generated-reports)

---

## 1. Current Architecture

### 1.1 Frontend Architecture

**Framework:** Next.js 16.2.6 with App Router, Turbopack  
**Language:** TypeScript 5.7 (strict mode)  
**Styling:** Tailwind CSS v4 + CSS custom properties  
**Components:** shadcn/ui (New York style) + Base UI primitives  
**Icons:** Tabler Icons via centralized `Icons` registry  
**Animations:** Framer Motion 11.x (spring physics)

#### Application Layers
```
Runtime Kernel (Zustand stores, lifecycle, registries)
    ↓
Workspace Engine (sidebar, toolbar, inspector, tabs)
    ↓
Feature Pages (customers, meters, readings, invoices, payments)
    ↓
Enterprise Components (EnterpriseTable, GenericAdminPage, etc.)
    ↓
shadcn/ui Components (Card, Button, Table, Dialog, Sheet, etc.)
    ↓
Design Tokens (--brand, --surface, --text, --border, --elevation)
```

#### State Management Architecture
| Concern | Technology | Usage |
|---------|-----------|-------|
| UI State | Zustand 5.x | Sidebar, inspector, workspace, theme |
| Server State | TanStack React Query | Data fetching, caching, mutations |
| URL State | nuqs | Search params, pagination, filters |
| Form State | TanStack Form + Zod | Form validation and submission |

#### Route Structure
```
/app
  /admin/*          → 48 page directories (Admin panel)
  /dashboard/*      → 15 page directories (User dashboard)
  /api/*            → BFF proxy routes (100+ endpoints)
  /api/meterverse/* → MeterVerse domain BFF (customers, meters, readings, invoices, payments)
  /workspace        → Runtime workspace shell
  /login            → Authentication page
  /customer         → Empty placeholder
```

#### BFF Pattern (Backend-For-Frontend)
```
Frontend Component
    → fetch(/api/meterverse/customers)
    → src/app/api/meterverse/customers/route.ts
    → apiBackend("/customers")  [checks NEXT_PUBLIC_API_URL]
        ├── If backend available → proxies to localhost:3001
        └── If unavailable → returns mock data
```

#### Admin vs User System
| Aspect | Admin (/admin/*) | User (/dashboard/*) |
|--------|-----------------|-------------------|
| Theme | Dark (red accent #DC2626, black bg) | Light (teal brand #00BFA5) |
| Layout | WorkspaceLayout (sidebar, toolbar, tabs, inspector) | AppSidebar + PageContainer |
| Pages | 48 config-driven (GenericAdminPage) | Feature-based (custom components) |
| Auth | Admin-only (future: Clerk) | Clerk (organizations, subscriptions) |
| Sidebar | 15 nav items, Dynamic Island glass morphism | Grouped nav (Overview, Elements, Account) |

### 1.2 Backend Architecture

**Runtime:** Node.js 22, Express.js  
**ORM:** Prisma 6.x (PostgreSQL)  
**Validation:** Zod 3.x  
**Auth:** JWT (jsonwebtoken), bcryptjs  
**Security:** Helmet.js, CORS, express-rate-limit

#### Route Files (15)
| File | Endpoints | Purpose |
|------|-----------|---------|
| `auth.js` | 3 | Login, register, session |
| `customers.js` | 5 | Customer CRUD |
| `meters.js` | 5 | Meter CRUD |
| `readings.js` | 4 | Reading CRUD + bulk |
| `invoices.js` | 4 | Invoice CRUD |
| `payments.js` | 3 | Payment CRUD |
| `admin.js` | 30+ | Admin operations |
| `services.js` | 16 | Platform services |
| `reports.js` | 14 | Reporting endpoints |
| `security.js` | 5 | Security audit |
| `ai.js` | 9 | AI agent endpoints |
| `business.js` | 2 | Pipeline status |
| `crud.js` | 1 | Generic CRUD |
| `domain.js` | 18 | Domain data access |
| `monitor.js` | 4 | Monitoring |

**Total endpoints:** 128  
**Middleware chain:** `helmet()` → `cors()` → `rateLimit()` → `express.json()` → `authenticate()` → route handler → `errorHandler()`

### 1.3 Database Architecture

**Engine:** PostgreSQL 16  
**ORM:** Prisma 6.x  
**Models:** 41 (32 production + 9 service)

#### Model Categories
| Category | Models | Count |
|----------|--------|-------|
| Core Business | User, Customer, Meter, Reading, Invoice, Payment | 6 |
| Administration | Role, Permission, PermissionOnRole, AuditEntry | 4 |
| Configuration | SystemSetting, FeatureFlag, ApiKey, License, BrandingConfig | 5 |
| Organization | Organization, Project, Session | 3 |
| Integration | Webhook, NotificationTemplate, Notification | 3 |
| Platform | Backup, CacheEntry, QueueJob, ScheduledTask, StoredFile | 5 |
| Services | ActivityStream, EmailLog, SmsLog, ImportJob, ExportJob | 10 |
| Reporting | PushNotification, OcrJob, PdfJob, ExcelJob, ReportDefinition | 5 |
| Analytics | KpiDefinition, KpiSnapshot, ScheduledReport, ExportLog | 4 |

**Total:** 41 models, ~280 fields

### 1.4 Authentication & Authorization

| Feature | Implementation | Status |
|---------|---------------|--------|
| Password auth | bcryptjs + JWT | ✅ Live |
| JWT tokens | jsonwebtoken with issuer/audience | ✅ Live |
| Token refresh | Not implemented | ❌ Missing |
| OAuth/SSO | Not implemented | ❌ Missing |
| MFA | Schema field exists, no enforcement | ⚠️ Partial |
| Role-based access | `requireRole()` middleware exists | ⚠️ Not wired to routes |
| Permission check | `requirePermission()` middleware | ⚠️ Not wired |
| Route guard | Frontend RouteGuard component | ✅ Live |
| Permission guard | Frontend PermissionGuard component | ✅ Live |

### 1.5 Runtime Architecture

```
Kernel (lifecycle, context, session)
  ├── Registry (apps, commands, permissions, events, services, plugins)
  ├── Event Bus (publish, subscribe, replay, versioning)
  ├── Data Engine (cache, offline queue, optimistic updates)
  ├── Workflow Engine (state machine, approval, scheduling)
  └── Service Layer (auth, navigation, notifications, audit)
```

**Runtime modules:** 26 modules across 48 files  
**Registries:** 11 (app, command, permission, event, service, plugin, theme, locale, shortcut, panel, inspector)

### 1.6 BFF Architecture

```
Frontend Component
    → fetch(/api/meterverse/entity)
    → Route Handler (Next.js)
        → apiBackend(path) from @/lib/api-client
            ├── NEXT_PUBLIC_API_URL set → proxy to backend
            └── No backend → return mock/empty data
```

**BFF Routes:** 20+ under `src/app/api/`  
**Proxy Target:** `http://localhost:3001` (Express backend)  
**Auth forwarding:** Bearer token passed through from frontend

### 1.7 Theme Architecture

**Token system:** 38+ CSS custom properties  
**Brand color:** `--brand: #00BFA5` (teal)  
**Admin color:** `--admin-accent: var(--status-error)` (red)  

#### Theme Loading Chain
```
globals.css
  → @import 'tailwindcss'
  → @import 'tw-animate-css'
  → @import './theme.css' (MeterVerse tokens + all theme imports)
  → @import './dark-mode.css' (dark overrides)
```

**Available themes:** 10 (vercel, claude, neobrutualism, supabase, mono, notebook, light-green, zen, astro-vista, whatsapp)  
**Default theme:** whatsapp (teal/green)

### 1.8 CI/CD Architecture

**Platform:** GitHub Actions  
**Workflows:** 4 jobs in `ci.yml`

```
Push/PR → Build (TypeScript + next build)
           Frontend (install + lint + test)
           Security (CodeQL + Semgrep + TruffleHog)
           Docker (backend + frontend containers)
           Playwright E2E (chromium)
           Visual Regression (pixelmatch)
           AI Review (DeepSeek, 8 reports)
           Reports → commit to docs/reviews/
```

### 1.9 Testing Status

| Type | Coverage | Status |
|------|----------|--------|
| Backend unit tests | 0% | ❌ Missing |
| Frontend component tests | 0% | ❌ Missing |
| E2E tests (Playwright) | 4 tests pass | ⚠️ Partial |
| Visual regression | 57 comparison points | ✅ Complete |
| Security audit | CodeQL + Semgrep | ✅ Complete |
| Performance testing | 10-sample avg | ⚠️ Partial |
| Accessibility | 0 violations on 25 routes | ✅ Complete |

### 1.10 Deployment Architecture

```
Development: npx next dev -p 7400 (Frontend)
                              + docker compose up -d postgres (Database)
                              + node server.js (Backend, port 3001)

Production: Dockerfile (multi-stage Next.js build)
                     + Dockerfile.backend (Node 22 Alpine)
                     + _tools/Deploy.cmd (6-step)
                     + _tools/DisasterRecovery.cmd (6-step)
                     + _tools/MainControl.cmd (self-healing)
```

### 1.11 AI Workflow

```
Every PR:
  1. Build → Compile check
  2. Tests → Playwright + Vitest
  3. Screenshots → 95 screenshots across 5 viewports
  4. Visual Regression → pixelmatch comparison
  5. DeepSeek Review → Architecture, UI, UX, a11y, perf, security, quality, debt
  6. Reports → Commit to docs/reviews/
  7. PR Summary → Auto-generated comment
```

---

## 2. Business Domains

### 2.1 Domain Inventory

| # | Domain | Status | Priority | Description |
|---|--------|--------|----------|-------------|
| D01 | **Customer** | 🟡 Partial | 🔴 | Individuals/entities receiving utility services |
| D02 | **CustomerGroup** | 🔴 Missing | 🟡 | Customer segmentation (residential, commercial, industrial) |
| D03 | **Contract** | 🔴 Missing | 🔴 | Service agreements with terms and conditions |
| D04 | **Organization** | ✅ Live | — | Multi-tenant hierarchy (parent orgs, subsidiaries) |
| D05 | **Project** | ✅ Live | — | Group meters/customers by project phase |
| D06 | **Area** | 🔴 Missing | 🟡 | Geographic zones (October, New Cairo, SODIC) |
| D07 | **Building** | 🔴 Missing | 🟢 | Physical structure containing units |
| D08 | **Unit** | 🔴 Missing | 🟢 | Individual apartment/shop within a building |
| D09 | **ServiceConnection** | 🔴 Missing | 🔴 | Link between customer and physical infrastructure |
| D10 | **Meter** | 🟡 Partial | 🔴 | Measuring device (water, electricity, gas) |
| D11 | **MeterType** | 🔴 Missing | 🟡 | Meter classification (LP2, M1, S1, AMI) |
| D12 | **MeterAssignment** | 🔴 Missing | 🔴 | Customer × Meter relationship with dates |
| D13 | **MeterEvent** | 🔴 Missing | 🟡 | Installation, removal, maintenance log |
| D14 | **SIMCard** | 🔴 Missing | 🟡 | Cellular connectivity for AMI meters |
| D15 | **Gateway** | 🔴 Missing | 🟡 | Data concentrator for meter networks |
| D16 | **Reading** | 🟡 Partial | 🔴 | Consumption measurement from a meter |
| D17 | **ReadingValidation** | 🔴 Missing | 🔴 | Rules engine for reading quality |
| D18 | **Consumption** | 🔴 Missing | 🔴 | Calculated consumption from reading deltas |
| D19 | **Tariff** | 🔴 Missing | 🔴 | Rate structure for billing |
| D20 | **TariffRate** | 🔴 Missing | 🔴 | Specific rate within a tariff (tiers, TOU) |
| D21 | **BillCycle** | 🔴 Missing | 🔴 | Billing schedule and cutoff dates |
| D22 | **BillRun** | 🔴 Missing | 🔴 | Batch invoice generation process |
| D23 | **Charge** | 🔴 Missing | 🔴 | Line item on an invoice (consumption, fixed fee, tax) |
| D24 | **Invoice** | 🟡 Partial | 🔴 | Billing document with charges |
| D25 | **InvoiceItem** | 🔴 Missing | 🔴 | Individual line on an invoice |
| D26 | **Payment** | 🟡 Partial | 🔴 | Payment transaction against invoices |
| D27 | **PaymentAllocation** | 🔴 Missing | 🟡 | Payment split across multiple invoices |
| D28 | **Ledger** | 🔴 Missing | 🟡 | Double-entry accounting entries |
| D29 | **Collection** | 🔴 Missing | 🟡 | Overdue payment recovery process |
| D30 | **Notification** | ✅ Live | — | System-generated alerts and messages |
| D31 | **NotificationTemplate** | ✅ Live | — | Reusable notification content |
| D32 | **Report** | ✅ Live | — | Generated business reports |
| D33 | **ScheduledReport** | ✅ Live | — | Automated report generation |
| D34 | **Audit** | ✅ Live | — | System-wide audit trail |
| D35 | **Workflow** | 🔴 Missing | 🟡 | State machine for business processes |
| D36 | **User** | ✅ Live | — | System users and administrators |
| D37 | **Role** | ✅ Live | — | User role definitions |
| D38 | **Permission** | ✅ Live | — | Granular permission definitions |
| D39 | **Session** | ✅ Live | — | User authentication sessions |
| D40 | **APIKey** | ✅ Live | — | Programmatic access keys |
| D41 | **Webhook** | ✅ Live | — | Event-driven HTTP callbacks |
| D42 | **FeatureFlag** | ✅ Live | — | Feature toggle management |
| D43 | **SystemSetting** | ✅ Live | — | Application configuration |
| D44 | **Backup** | ✅ Live | — | Database backup management |
| D45 | **Cache** | ✅ Live | — | Cache entry management |
| D46 | **Queue** | ✅ Live | — | Background job queue |
| D47 | **Scheduler** | ✅ Live | — | Cron job management |
| D48 | **Storage** | ✅ Live | — | File storage management |
| D49 | **License** | ✅ Live | — | Software license management |
| D50 | **Branding** | ✅ Live | — | White-label configuration |

### 2.2 Domain Status Summary

| Status | Count | Domains |
|--------|-------|---------|
| ✅ Live | 22 | Organization, Project, User, Role, Permission, Session, APIKey, Webhook, FeatureFlag, SystemSetting, Backup, Cache, Queue, Scheduler, Storage, License, Branding, Notification, NotificationTemplate, Report, ScheduledReport, Audit |
| 🟡 Partial | 5 | Customer, Meter, Reading, Invoice, Payment |
| 🔴 Missing | 23 | CustomerGroup, Contract, Area, Building, Unit, ServiceConnection, MeterType, MeterAssignment, MeterEvent, SIMCard, Gateway, ReadingValidation, Consumption, Tariff, TariffRate, BillCycle, BillRun, Charge, InvoiceItem, PaymentAllocation, Ledger, Collection, Workflow |

**Total domains:** 50  
**Live:** 22 (44%)  
**Partial:** 5 (10%)  
**Missing:** 23 (46%)

---

## 3. Domain Relationships

### 3.1 Complete Entity Relationship Diagram (Text)

```
Organization 1──M Project
Organization 1──M User

CustomerGroup 1──M Customer

Customer 1──M ServiceConnection
Customer 1──M Contract
Customer 1──M Invoice
Customer 1──M Payment
Customer M──M Meter (via MeterAssignment)
Customer M──1 CustomerGroup

Area 1──M Building
Building 1──M Unit
Unit 1──M ServiceConnection

ServiceConnection 1──1 Meter
ServiceConnection 1──1 Customer
ServiceConnection 1──1 Tariff
ServiceConnection M──1 Unit

MeterType 1──M Meter
Meter 1──M MeterAssignment
Meter 1──M MeterEvent
Meter 1──M Reading
Meter M──1 Gateway
Meter 1──1 SIMCard

Reading 1──1 ReadingValidation
Reading M──1 Meter

Consumption M──1 Reading
Consumption M──1 TariffRate

Tariff 1──M TariffRate
Tariff 1──M ServiceConnection

BillCycle 1──M BillRun
BillRun 1──M Invoice

Invoice 1──M InvoiceItem
Invoice 1──M PaymentAllocation
Invoice M──1 Customer
Invoice M──1 BillRun

InvoiceItem M──1 Consumption
InvoiceItem M──1 TariffRate
InvoiceItem M──1 Charge

Payment 1──M PaymentAllocation
Payment M──1 Customer

Ledger M──1 Invoice
Ledger M──1 Payment

Workflow M──1 Entity (polymorphic)
Workflow M──1 User (actor)

AuditEntry M──1 Entity (polymorphic)

Notification M──1 NotificationTemplate
Notification M──1 User (recipient)

Role M──M Permission (via PermissionOnRole)
User M──1 Role

Session M──1 User
APIKey M──1 User
Webhook M──1 Organization
```

### 3.2 Relationship Types

| Type | Count | Examples |
|------|-------|----------|
| **One-to-One** | 4 | ServiceConnection→Meter, Meter→SIMCard, Reading→ReadingValidation, Consumption→TariffRate |
| **One-to-Many** | 28 | Customer→Invoice, Meter→Reading, Organization→Project |
| **Many-to-Many** | 2 | Customer↔Meter (via MeterAssignment), Role↔Permission (via PermissionOnRole) |
| **Polymorphic** | 2 | AuditEntry→Entity, Workflow→Entity |
| **Self-referential** | 1 | CustomerGroup→parentId |

### 3.3 Critical Relationship Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| No MeterAssignment entity | Cannot track which meters belong to which customer over time | 🔴 |
| No ServiceConnection entity | Customer and Meter are directly linked — breaks when a meter is replaced | 🔴 |
| No InvoiceItem entity | Invoice amounts are flat values with no line-item detail | 🔴 |
| No Consumption entity | Reading values are used directly without validation/adjustment | 🔴 |
| No TariffRate entity | Invoice charges have no rate reference | 🔴 |
| No PaymentAllocation | Payment cannot be split across multiple invoices | 🟡 |
| No Ledger entity | No double-entry accounting trail | 🟡 |

---

## 4. Business Workflows

### 4.1 Customer Onboarding

```
1. Prospect created (status: prospect)
2. Customer details collected (name, address, contact, ID)
3. Credit check performed (external integration)
4. Contract created (terms, tariff, start date)
5. Service connection created (customer + address + tariff)
6. Meter assigned (existing inventory or new order)
7. Meter installed (site visit, reading baseline)
8. Status → Active
9. Welcome notification sent
10. First bill cycle enrolled
```

**Current state:** Steps 1 and 2 partially exist. Steps 3-10 are missing.  
**Missing entities:** Contract, ServiceConnection, MeterAssignment  
**Missing automations:** Credit check, welcome notification, bill cycle enrollment

### 4.2 Meter Installation

```
1. Meter ordered (procurement)
2. Meter received → inventory
3. Meter assigned to service connection
4. Site visit scheduled
5. Installation performed (technician)
6. Baseline reading recorded
7. Meter status → Active
8. MeterEvent logged (installation)
9. Customer notification sent
```

**Current state:** Step 2 exists (Meter CRUD). Steps 1, 3-9 are missing.  
**Missing entities:** MeterEvent  
**Missing automations:** Installation scheduling, baseline reading

### 4.3 Meter Replacement

```
1. Replacement triggered (fault, upgrade, end-of-life)
2. Old meter status → Retired
3. MeterEvent: Removal logged (final reading)
4. New meter selected from inventory
5. MeterEvent: Installation logged (baseline reading)
6. ServiceConnection updated to new meter
7. Customer notification sent
```

**Current state:** Completely missing.  
**Missing entities:** MeterEvent, MeterAssignment (to handle re-assignment)

### 4.4 Meter Assignment

```
1. Customer selects meter (new connection or replacement)
2. Validate meter availability (not assigned elsewhere)
3. Create MeterAssignment (customerId, meterId, startDate)
4. Update meter.customerId
5. Log MeterEvent: Assignment
6. If previous assignment exists → endDate on old, startDate on new
```

**Current state:** No MeterAssignment entity. Meter.customerId is overwritten directly.  
**Missing entities:** MeterAssignment, MeterEvent

### 4.5 Reading Validation

```
1. Reading submitted (manual, AMI, import)
2. Validation rules applied:
   a. Range check (0 < value < max)
   b. Delta check (|prev - current| < threshold)
   c. Trend check (consistent with historical pattern)
   d. Seasonality adjustment
3. If all pass → status: Validated
4. If any fail → status: Flagged → manual review
5. Flagged reading assigned to reviewer
6. Reviewer: Accept (override) or Reject (re-read required)
7. Validated reading enters consumption calculation pipeline
```

**Current state:** Reading CRUD exists. No validation rules, no review workflow.  
**Missing entities:** ReadingValidation, ValidationRule  
**Missing automations:** Validation engine, flagging, assignment

### 4.6 Invoice Generation

```
1. Bill cycle opens (cutoff date)
2. All active meters read for cycle
3. Consumption calculated (current - previous for each meter)
4. Tariff applied (consumption × rate with tier/TOU logic)
5. Charges generated (consumption charge + fixed fees + taxes)
6. Invoice assembled (all line items)
7. Invoice status → Issued
8. Customer notification sent (email, SMS, in-app)
9. Invoice posted to customer account
10. Ledger entry created (accounts receivable)
```

**Current state:** Invoice CRUD exists with flat amount. Steps 1-10 are missing.  
**Missing entities:** BillCycle, BillRun, Tariff, TariffRate, Charge, InvoiceItem, Ledger  
**Missing automations:** Reading collection, consumption calc, tariff engine, notification

### 4.7 Payment Allocation

```
1. Payment received (amount, method, reference)
2. Find unpaid invoices for customer (oldest first)
3. Allocate payment across invoices:
   a. Full payment → invoice status: Paid
   b. Partial → invoice status: Partial, remaining tracked
   c. Overpayment → credit balance on account
4. Create PaymentAllocation records
5. Update invoice paid amounts
6. Ledger entry (cash receipt, AR reduction)
7. Receipt generated (PDF)
8. Customer notification sent
```

**Current state:** Payment CRUD exists with flat amount to single invoice. No allocation.  
**Missing entities:** PaymentAllocation, Ledger  
**Missing automations:** Allocation engine, receipt generation

### 4.8 Ledger Update

```
1. Transaction event (invoice, payment, adjustment, credit note)
2. Double-entry created:
   a. Invoice → Debit AR, Credit Revenue
   b. Payment → Debit Cash, Credit AR
   c. Adjustment → Debit/Credit appropriate accounts
3. Account balances updated
4. General ledger entry persisted
5. Trial balance updated
```

**Current state:** Completely missing. No financial accounting.  
**Missing entities:** Ledger, Account, JournalEntry

### 4.9 Disconnect / Reconnect

```
Disconnect:
1. Triggered (non-payment, customer request, violation)
2. Customer status → Suspended
3. ServiceConnection status → Disconnected
4. Meter(s) disabled for reading
5. MeterEvent logged (disconnect)
6. Notification sent to customer

Reconnect:
1. Triggered (payment received, issue resolved)
2. Customer status → Active
3. ServiceConnection status → Connected
4. Meter(s) re-enabled
5. MeterEvent logged (reconnect)
6. Notification sent to customer
```

**Current state:** Customer status can be changed via GenericAdminPage dropdown. No side effects.  
**Missing entities:** ServiceConnection, MeterEvent  
**Missing automations:** Meter suspend/enable, notification

### 4.10 Termination

```
1. Triggered (contract end, final bill, request)
2. Final reading taken
3. Final invoice generated
4. Outstanding balance collected
5. Customer status → Terminated
6. ServiceConnection status → Closed
7. Meter(s) retired or reassigned
8. MeterEvent logged (termination)
9. Documents archived
10. Customer data retained per policy (soft delete)
```

**Current state:** Customer status can be set to Terminated. No workflow enforced.  
**Missing entities:** ServiceConnection, MeterEvent  
**Missing automations:** Final reading, final invoice, balance collection, meter retirement

### 4.11 Audit Logging

```
Every mutation:
1. Pre-change snapshot (old values)
2. Mutation executed
3. Post-change snapshot (new values)
4. AuditEntry created:
   - actor, action, entity, entityId
   - oldValues (JSON), newValues (JSON)
   - timestamp, IP address, userAgent
   - status (success/failure)
```

**Current state:** AuditEntry model exists. `auditLog()` middleware exists in security.js. **Neither is wired** to any route. Audit hooks in frontend also never called.

### 4.12 Notification

```
Every business event:
1. Event occurs (customer created, invoice generated, payment received)
2. Determine recipients (customer, admin, operator)
3. Determine channels (in-app, email, SMS, push)
4. Load notification template by event type
5. Render template with event data
6. Send via each channel
7. Log notification delivery status
8. Handle failures (retry, fallback channel)
```

**Current state:** Notification model, template model, and service endpoints exist. Not wired to business events.

---

## 5. Service Connection Analysis

### 5.1 Current Design Flaw

MeterVerse currently links **Customer directly to Meter**:

```
Customer 1──M Meter
```

This is **incorrect** for an enterprise utility platform.

### 5.2 The Service Connection Pattern

In real utility systems, the hierarchy is:

```
Customer 1──M ServiceConnection 1──1 Meter
```

A **ServiceConnection** represents:
- The contract between a customer and the utility for a specific service
- A physical address/location where service is delivered
- The meter currently installed at that location
- The tariff applied to that service
- Historical meters that have served that location

### 5.3 Why Service Connection Must Be Central

| Scenario | Current (Customer→Meter) | Enterprise (ServiceConnection) |
|----------|------------------------|-------------------------------|
| Meter replacement | Overwrite customer.meterId | New meter on same ServiceConnection |
| Customer moves | Break all meter history | ServiceConnection stays with premises |
| Multiple meters per customer | Customer.meters[] | Multiple ServiceConnections |
| One meter, multiple tenants | Impossible | ServiceConnections by unit |
| Meter history | Meter.readings only | ServiceConnection tracks all meters |
| Billing address different from service address | Not supported | Separate fields on ServiceConnection |
| Temporarily disconnected | Manual status change | ServiceConnection status lifecycle |
| Contract per service point | Not supported | Contract → ServiceConnection |

### 5.4 Recommendation

**MeterVerse MUST revolve around ServiceConnection.**

```
Organization
    ↓
Project (phase/development)
    ↓
Area (geographic zone)
    ↓
Building (physical structure)
    ↓
Unit (apartment, shop, office)  ← Future
    ↓
ServiceConnection  ← CENTRAL ENTITY
    ├── 1──1 Customer (who pays)
    ├── 1──1 Meter (what measures)
    ├── 1──1 Tariff (how priced)
    ├── 1──M Contract (agreement terms)
    ├── 1──M MeterAssignment (history of meters)
    ├── 1──M Reading (all readings at this point)
    ├── 1──M Invoice (all bills for this service)
    └── 1──M MeterEvent (installation, removal, maintenance)
```

### 5.5 Implementation Impact

| Change | Impact |
|--------|--------|
| New Prisma model: ServiceConnection | +15 fields, +4 relations |
| Meter.customerId becomes optional | Migration needed |
| Customer.meters[] becomes Customer.serviceConnections[] | API + UI changes |
| All reading queries go through ServiceConnection | Query path change |
| Invoicing uses ServiceConnection (not Customer) | Billing architecture change |
| MeterAssignment tracks connection history | New entity required |

### 5.6 Migration Strategy

1. **Phase 1**: Create ServiceConnection model alongside existing Customer→Meter link
2. **Phase 2**: Migrate existing Customer→Meter pairs into ServiceConnections
3. **Phase 3**: Update all queries to go through ServiceConnection
4. **Phase 4**: Remove direct Customer→Meter link (deprecate after verification)

---

## 6. Database Review

### 6.1 Current Schema Assessment

**Total models:** 41 (32 core + 9 service)  
**Average completion score:** 39% (per DATABASE_COMPLETION.md)

### 6.2 Missing Models (23)

| # | Model | Priority | Dependencies | Fields Estimate |
|---|-------|----------|-------------|----------------|
| M01 | ServiceConnection | 🔴 | Customer, Area, Tariff, Meter | 15 |
| M02 | CustomerGroup | 🟡 | Customer (self) | 6 |
| M03 | Contract | 🔴 | Customer, ServiceConnection, Tariff | 18 |
| M04 | ContractTerm | 🟡 | Contract | 8 |
| M05 | ContractVersion | 🟢 | Contract | 6 |
| M06 | MeterType | 🟡 | Meter | 5 |
| M07 | MeterAssignment | 🔴 | Meter, ServiceConnection | 8 |
| M08 | MeterEvent | 🟡 | Meter, ServiceConnection | 10 |
| M09 | SIMCard | 🟡 | Meter | 8 |
| M10 | Gateway | 🟡 | Meter | 10 |
| M11 | Area | 🟡 | Building | 8 |
| M12 | Building | 🟢 | Area | 10 |
| M13 | Unit | 🟢 | Building | 8 |
| M14 | ReadingValidation | 🔴 | Reading | 8 |
| M15 | ValidationRule | 🟡 | ReadingValidation | 10 |
| M16 | Consumption | 🔴 | Reading, TariffRate | 8 |
| M17 | Tariff | 🔴 | TariffRate, ServiceConnection | 12 |
| M18 | TariffRate | 🔴 | Tariff | 10 |
| M19 | BillCycle | 🔴 | BillRun | 8 |
| M20 | BillRun | 🔴 | BillCycle, Invoice | 8 |
| M21 | Charge | 🔴 | InvoiceItem, TariffRate | 8 |
| M22 | InvoiceItem | 🔴 | Invoice, Charge, Consumption | 8 |
| M23 | PaymentAllocation | 🟡 | Payment, Invoice | 6 |
| M24 | LedgerEntry | 🟡 | Invoice, Payment | 12 |
| M25 | Account | 🟡 | LedgerEntry | 8 |
| M26 | CollectionCase | 🟡 | Customer, Invoice | 12 |
| M27 | WorkflowState | 🟡 | Polymorphic entity | 10 |
| M28 | WorkflowTransition | 🟢 | WorkflowState | 6 |

**Total missing models:** 28  
**Target total:** 69 models (+28 from current 41)

### 6.3 Field-Level Issues by Model

#### Customer (currently 8 fields, needs 20+)
| Field | Type | Status | Reason |
|-------|------|--------|--------|
| code | String (unique) | ❌ Missing | Human-readable customer ID (CUST-2026-00001) |
| type | Enum | ❌ Missing | Residential, Commercial, Industrial, Government |
| groupId | String? (FK) | ❌ Missing | CustomerGroup membership |
| tags | String[] | ❌ Missing | Flexible categorization |
| notes | String? | ❌ Missing | Internal comments |
| taxId | String? | ❌ Missing | Tax/VAT registration |
| creditLimit | Float? | ❌ Missing | Billing credit control |
| avatar | String? | ❌ Missing | Profile photo URL |
| createdBy | String? (FK) | ❌ Missing | Audit trail |
| updatedBy | String? (FK) | ❌ Missing | Audit trail |
| deletedAt | DateTime? | ❌ Missing | Soft delete |
| deletedBy | String? (FK) | ❌ Missing | Soft delete |

#### Meter (currently 9 fields, needs 20+)
| Field | Type | Status | Reason |
|-------|------|--------|--------|
| model | String? | ❌ Missing | Manufacturer model number |
| firmware | String? | ❌ Missing | Firmware version for AMI meters |
| installDate | DateTime? | ❌ Missing | Installation tracking |
| lastReading | Float? | ❌ Missing | Last known reading value |
| lastReadingAt | DateTime? | ❌ Missing | Last reading timestamp |
| simCardId | String? (FK) | ❌ Missing | Cellular connectivity |
| gatewayId | String? (FK) | ❌ Missing | Data concentrator |
| meterTypeId | String? (FK) | ❌ Missing | Meter classification |
| manufacturer | String? | ❌ Missing | Manufacturer name |
| warrantyEnd | DateTime? | ❌ Missing | Warranty tracking |

#### Reading (currently 7 fields, needs 15+)
| Field | Type | Status | Reason |
|-------|------|--------|--------|
| delta | Float? | ❌ Missing | Change from previous reading |
| consumption | Float? | ❌ Missing | Calculated consumption |
| estimated | Boolean | ❌ Missing | True if estimated (not actual) |
| anomalyScore | Float? | ❌ Missing | AI anomaly detection score |
| validatedBy | String? (FK) | ❌ Missing | Who validated |
| validatedAt | DateTime? | ❌ Missing | When validated |
| correctionId | String? (FK) | ❌ Missing | If corrected, link to correction |
| source | Enum | ❌ Missing | AMI, Manual, Import, Calculated |
| seasonalityFactor | Float? | ❌ Missing | Seasonal adjustment |

#### Invoice (currently 10 fields, needs 20+)
| Field | Type | Status | Reason |
|-------|------|--------|--------|
| items | InvoiceItem[] | ❌ Missing | Line-item detail |
| subtotal | Float | ❌ Missing | Before tax |
| taxAmount | Float | ❌ Missing | Tax total |
| discountAmount | Float | ❌ Missing | Discount total |
| paidAmount | Float | ❌ Missing | Running total of payments |
| balanceDue | Float | ❌ Missing | Remaining amount |
| billCycleId | String? (FK) | ❌ Missing | Which bill cycle |
| billRunId | String? (FK) | ❌ Missing | Which bill run |
| serviceConnectionId | String? (FK) | ❌ Missing | Billed service point |
| pdfPath | String? | ❌ Missing | Generated PDF invoice |
| notes | String? | ❌ Missing | Invoice notes |

#### Payment (currently 7 fields, needs 15+)
| Field | Type | Status | Reason |
|-------|------|--------|--------|
| reference | String? | ❌ Missing | External payment reference |
| gatewayResponse | Json? | ❌ Missing | Payment gateway response log |
| feeAmount | Float? | ❌ Missing | Processing fee |
| netAmount | Float? | ❌ Missing | Amount after fees |
| receiptPath | String? | ❌ Missing | Generated receipt PDF |
| allocatedAmount | Float | ❌ Missing | Amount allocated to invoices |
| unallocatedAmount | Float | ❌ Missing | Remaining to allocate |

### 6.4 Missing Indexes

| Table | Index | Type | Priority |
|-------|-------|------|----------|
| Customer | idx_customer_status | Single | 🔴 |
| Customer | idx_customer_area | Single | 🔴 |
| Customer | idx_customer_code | Unique | 🔴 |
| Customer | idx_customer_type | Single | 🟡 |
| Customer | idx_customer_createdAt | Single | 🟡 |
| Customer | idx_customer_groupId | Single | 🟡 |
| Customer | idx_customer_status_area | Composite | 🟡 |
| Customer | idx_customer_createdAt_status | Composite | 🟡 |
| Meter | idx_meter_serial | Unique | 🔴 |
| Meter | idx_meter_customerId | Single | 🔴 |
| Meter | idx_meter_status | Single | 🟡 |
| Meter | idx_meter_type | Single | 🟡 |
| Meter | idx_meter_area | Single | 🟡 |
| Reading | idx_reading_meterId | Single | 🔴 |
| Reading | idx_reading_timestamp | Single | 🔴 |
| Reading | idx_reading_status | Single | 🟡 |
| Reading | idx_reading_meterId_timestamp | Composite | 🔴 |
| Invoice | idx_invoice_customerId | Single | 🔴 |
| Invoice | idx_invoice_status | Single | 🔴 |
| Invoice | idx_invoice_dueDate | Single | 🟡 |
| Invoice | idx_invoice_customerId_status | Composite | 🟡 |
| Payment | idx_payment_invoiceId | Single | 🔴 |
| Payment | idx_payment_customerId | Single | 🔴 |
| Payment | idx_payment_paidAt | Single | 🟡 |

**Current indexes:** 4 (id PKs, serial unique, email unique, number unique)  
**Required indexes:** 24  
**Missing:** 20

### 6.5 Missing Constraints

| Constraint | Model | Purpose | Priority |
|------------|-------|---------|----------|
| Unique (name + area) | Customer | Prevent duplicate customers in same area | 🔴 |
| Unique (serial) | Meter | ✅ Already exists | — |
| Unique (number) | Invoice | ✅ Already exists | — |
| Check (value > 0) | Reading | Prevent negative readings | 🔴 |
| Check (amount > 0) | Invoice | Prevent negative invoices | 🔴 |
| Check (status IN [...]) | All | Enforce valid status values | 🟡 |
| Cascade delete | All FK relations | Prevent orphan records | 🟡 |
| Default values | All status fields | Ensure non-null status | 🟡 |

### 6.6 Missing Soft Delete

| Model | Current | Required |
|-------|---------|----------|
| Customer | Hard delete | deletedAt, deletedBy |
| Meter | Hard delete | deletedAt, deletedBy |
| Invoice | Hard delete | deletedAt, deletedBy |
| Payment | Hard delete | deletedAt, deletedBy |

**All 41 models lack soft delete capability.**

### 6.7 Missing Audit Trail

| Model | Current | Required |
|-------|---------|----------|
| All models | No audit | createdBy, updatedBy, deletedBy |

**No model tracks who created or modified records.**

### 6.8 Missing Versioning

| Model | Current | Required |
|-------|---------|----------|
| Tariff | ❌ Missing | Version history for rate changes |
| Contract | ❌ Missing | Amendment tracking |
| Invoice | ❌ Missing | Adjustment history |

### 6.9 Missing Timestamps

| Model | Missing updatedAt | Impact |
|-------|------------------|--------|
| Reading | ❌ | Cannot tell when reading was last modified |
| Payment | ❌ | Cannot tell when payment record was edited |

---

## 7. API Review

### 7.1 Endpoint Inventory

| Domain | GET (list) | GET (:id) | POST | PUT | DELETE | Total |
|--------|-----------|-----------|------|-----|--------|-------|
| Auth | ❌ | ✅ (me) | ✅ (login, register) | ❌ | ❌ | 3 |
| Customers | ✅ | ✅ | ✅ | ✅ | ✅ | 5 |
| Meters | ✅ | ✅ | ✅ | ✅ | ✅ | 5 |
| Readings | ✅ | ❌ | ✅ (single + bulk) | ❌ | ❌ | 4 |
| Invoices | ✅ | ✅ | ✅ | ✅ | ❌ | 4 |
| Payments | ✅ | ❌ | ✅ | ❌ | ❌ | 3 |
| **Subtotal** | **4/6** | **4/6** | **7/6** | **3/6** | **2/6** |

### 7.2 Missing Endpoints by Domain

#### Customer
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

#### Meter
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/meters/:id/readings | GET | Reading history for meter | 🔴 |
| /api/meters/:id/events | GET | Meter event history | 🟡 |
| /api/meters/:id/assign | POST | Assign to customer | 🔴 |
| /api/meters/:id/unassign | POST | Remove from customer | 🔴 |
| /api/meters/stats | GET | KPI aggregation | 🟡 |
| /api/meters/bulk | POST | Bulk operations | 🟡 |
| /api/meters/export | GET | CSV/Excel export | 🟡 |
| /api/meters/import | POST | CSV/Excel import | 🟡 |

#### Reading
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/readings/:id | GET | Single reading detail | 🔴 |
| /api/readings/:id | PUT | Update reading | 🔴 |
| /api/readings/:id | DELETE | Remove reading | 🔴 |
| /api/readings/:id/validate | POST | Trigger validation | 🔴 |
| /api/readings/bulk/validate | POST | Bulk validation | 🟡 |
| /api/readings/stats | GET | KPI aggregation | 🟡 |
| /api/readings/export | GET | CSV export | 🟡 |

#### Invoice
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/invoices/:id | DELETE | Cancel/void invoice | 🔴 |
| /api/invoices/:id/items | GET | Line items | 🔴 |
| /api/invoices/generate | POST | Generate from readings | 🔴 |
| /api/invoices/:id/pdf | GET | Download PDF | 🟡 |
| /api/invoices/:id/send | POST | Send to customer | 🟡 |
| /api/invoices/bulk/generate | POST | Batch invoice generation | 🔴 |
| /api/invoices/stats | GET | KPI aggregation | 🟡 |
| /api/invoices/export | GET | CSV/Excel export | 🟡 |

#### Payment
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| /api/payments/:id | GET | Single payment detail | 🔴 |
| /api/payments/:id | PUT | Update payment | 🔴 |
| /api/payments/:id | DELETE | Void payment | 🔴 |
| /api/payments/:id/receipt | GET | Download receipt PDF | 🟡 |
| /api/payments/stats | GET | KPI aggregation | 🟡 |
| /api/payments/export | GET | CSV/Excel export | 🟡 |

### 7.3 Missing API Features

| Feature | Covered | Missing |
|---------|---------|---------|
| Pagination | ✅ Customers, Meters, Readings, Invoices, Payments | — |
| Search (text) | ✅ Customers, Meters | ❌ Readings, Invoices, Payments |
| Filtering | ⚠️ Readings (meterId, status), Invoices (status) | ❌ Most endpoints |
| Sorting | ✅ CreatedAt on most | ❌ Multi-column sort |
| Field selection | ❌ All | ❌ |
| Expansion (include) | ✅ Customers (:id includes meters+invoices), Meters (:id includes readings) | ❌ Other endpoints |
| Bulk operations | ✅ Readings (bulk create) | ❌ Create, update, delete |
| Export | ❌ All | ❌ |
| Import | ❌ All | ❌ |
| Soft delete | ❌ All (hard delete only) | ❌ |
| Audit logging | ❌ All | ❌ |
| Validation (Zod) | ✅ Auth, Customers | ❌ Meters, Readings, Invoices, Payments |
| Rate limiting | ✅ Global + Auth | ❌ Per-endpoint |
| Caching headers | ❌ All | ❌ |
| Webhook triggers | ❌ All | ❌ |

---

## 8. Frontend Review

### 8.1 Page Inventory

#### Admin Pages (48 — all live via GenericAdminPage)
active-devices, ai, ai-diagnostics, api, api-keys, areas, audit, backup, branding, business, cache, crud, customers, dashboard, database, domains, feature-flags, health, home, integrations, license, localization, login, logs, monitoring, notifications, notification-templates, organizations, permissions, plugins, projects, queue, reports, roles, runtime, scheduler, security, services, sessions, settings, sms, smtp, storage, tables, themes, translations, users, webhooks

#### User Dashboard Pages (15)
billing, chat, elements, exclusive, forms, kanban, notifications, overview, product, profile, react-query, settings, users, workspace, workspaces

#### MeterVerse Workspace Pages (5 workspace apps)
Customers, Meters, Readings, Invoices, Payments

### 8.2 Missing Pages

| Page | Route | Domain | Priority | Reason |
|------|-------|--------|----------|--------|
| Customer Detail | /dashboard/customers/[id] | Customer | 🔴 | No way to view full customer profile |
| Customer Detail | /admin/customers/[id] | Customer | 🔴 | No admin customer detail view |
| Meter Detail | /dashboard/meters/[id] | Meter | 🔴 | No way to view meter history |
| Meter Detail | /admin/meters/[id] | Meter | 🔴 | No admin meter detail view |
| Reading Detail | /dashboard/readings/[id] | Reading | 🟡 | No reading validation view |
| Invoice Detail | /dashboard/invoices/[id] | Invoice | 🔴 | No invoice line-item view |
| Invoice Detail | /admin/invoices/[id] | Invoice | 🔴 | No admin invoice detail |
| Payment Detail | /dashboard/payments/[id] | Payment | 🟡 | No payment receipt view |
| Customer Groups | /admin/customer-groups | CustomerGroup | 🟡 | Group management |
| Tariff Manager | /admin/tariffs | Tariff | 🔴 | Rate structure management |
| Bill Cycles | /admin/bill-cycles | BillCycle | 🔴 | Billing schedule management |
| Contract Manager | /admin/contracts | Contract | 🟡 | Contract lifecycle |
| Collection Cases | /admin/collections | Collection | 🟡 | Overdue management |
| Workflow Builder | /admin/workflows | Workflow | 🟢 | Visual workflow designer |
| Area Manager | /admin/areas-2 | Area | 🟡 | Geographic zone management |
| Service Connections | /admin/service-connections | ServiceConnection | 🔴 | Connection point management |

### 8.3 Duplicate Pages

| Page | Locations | Issue |
|------|-----------|-------|
| Customers | /admin/customers, workspace app, /dashboard/customers (missing) | Admin and workspace show different data from different APIs |
| Meters | /admin/meters, workspace app | Same data, different UI patterns |
| Readings | /admin/readings, workspace app | Same data, different UI patterns |
| Invoices | /admin/invoices, workspace app | Same data, different UI patterns |
| Payments | /admin/payments, workspace app | Same data, different UI patterns |

### 8.4 Wrong Navigation

| Issue | Current | Should Be |
|-------|---------|-----------|
| Admin customers fetches from `/api/admin/users` | Shows user data instead of customer data | `/api/meterverse/customers` |
| No Customers in user sidebar | nav-config.ts missing customer entry | Add under Overview group |
| Empty /customer directory | Confuses developers | Either implement or remove |

### 8.5 Missing Operations

| Operation | Admin | User Workspace | Priority |
|-----------|-------|---------------|----------|
| Customer Create (wired) | ❌ (Sheet has no onSubmit) | ❌ | 🔴 |
| Customer Edit (wired) | ❌ (Sheet has no onSubmit) | ❌ | 🔴 |
| Customer Detail | ❌ | ❌ | 🔴 |
| Meter Assignment | ❌ | ❌ | 🔴 |
| Reading Validation | ❌ | ❌ | 🔴 |
| Invoice Generation | ❌ | ❌ | 🔴 |
| Payment Recording | ❌ | ❌ | 🔴 |
| Import Customers | ❌ | ❌ | 🟡 |
| Export Customers | ❌ | ❌ | 🟡 |
| Bulk Operations | ❌ | ❌ | 🟡 |

### 8.6 Missing Dashboards

| Dashboard | Purpose | Priority |
|-----------|---------|----------|
| Customer KPI Dashboard | Customer growth, churn, segments | 🔴 |
| Meter Operations Dashboard | Active meters, reading success rate | 🔴 |
| Billing Dashboard | Invoices generated, collection rate | 🔴 |
| Financial Dashboard | Revenue, AR aging, cash flow | 🔴 |
| Operations Dashboard | System health, queue depth | 🟡 |

### 8.7 Missing Workspaces

The workspace system (runtime kernel) has 5 apps registered. Missing workspaces:

| Workspace | Entity | Priority |
|-----------|--------|----------|
| Customer Workspace | Customer (detail + meters + readings + invoices + payments) | 🔴 |
| Meter Workspace | Meter (detail + readings + events + assignments) | 🔴 |
| Reading Workspace | Reading (validation + consumption) | 🔴 |
| Invoice Workspace | Invoice (items + payments + PDF) | 🔴 |
| Payment Workspace | Payment (allocation + receipts) | 🟡 |

---

## 9. Sidebar Review

### 9.1 Admin Sidebar (Current)

**15 items in flat list:**
```
Home, Users, Roles, Audit, Customers, Meters, Readings, Invoices,
Payments, Settings, Reports, Services, Security, AI, Monitor
```

**Issues:**
| Issue | Impact | Priority |
|-------|--------|----------|
| Flat list with 15 items | Information overload, scrolling | 🟡 |
| No hierarchy | Related items not grouped | 🟡 |
| "Services" and "Security" low priority | Should be under Settings | 🟢 |
| Missing: Customer detail paths | Cannot deep-link | 🟡 |

### 9.2 User Sidebar (Current)

**3 groups in nav-config.ts:**
```
Overview: Dashboard, Workspaces, Teams, Product, Users, Kanban, Chat
Elements: Forms, React Query, Icons
Account: Pro, Exclusive, Profile, Notifications, Billing, Login
```

**Issues:**
| Issue | Impact | Priority |
|-------|--------|----------|
| Missing: Customers | No customer management in user system | 🔴 |
| Missing: Meters | No meter management in user system | 🔴 |
| Missing: Readings, Invoices, Payments | Core domains missing | 🔴 |
| "Kanban" and "Chat" are demo pages | Not enterprise relevant | 🟢 |
| No MeterVerse-specific grouping | Generic starter template layout | 🟡 |

### 9.3 Proposed Enterprise Navigation

#### Admin Navigation
```
MeterVerse Administration
├── Dashboard
│   ├── Home (overview)
│   ├── Health (system status)
│   └── Monitoring (observability)
│
├── Operations
│   ├── Customers
│   ├── Meters
│   ├── Readings
│   ├── Invoices
│   └── Payments
│
├── Configuration
│   ├── Settings
│   ├── Tariffs
│   ├── Bill Cycles
│   ├── Feature Flags
│   └── Branding
│
├── Security
│   ├── Users
│   ├── Roles
│   ├── Permissions
│   ├── Sessions
│   ├── API Keys
│   └── Audit Logs
│
├── Platform
│   ├── Services
│   ├── Webhooks
│   ├── Notifications
│   ├── Queue
│   ├── Scheduler
│   └── Storage
│
├── Data
│   ├── Reports
│   ├── Backups
│   ├── Cache
│   ├── Import/Export
│   └── Database
│
└── System
    ├── License
    ├── Localization
    ├── Themes
    ├── Translations
    ├── Logs
    └── AI Diagnostics
```

#### User Navigation
```
MeterVerse
├── Overview
│   ├── Dashboard
│   └── Activity
│
├── Customers ← NEW (replaces CRM demo)
│   ├── All Customers
│   └── Customer Groups
│
├── Operations
│   ├── Meters
│   ├── Readings
│   └── Service Connections
│
├── Billing
│   ├── Invoices
│   ├── Payments
│   └── Tariffs
│
├── Reports
│   ├── Standard Reports
│   └── Custom Reports
│
└── Account
    ├── Profile
    ├── Notifications
    ├── Billing
    └── Settings
```

### 9.4 Pages to Remove

| Page | Reason | Priority |
|------|--------|----------|
| Admin / Plugins | Placeholder, no content | 🟢 |
| Admin / Tables | Developer demo, not enterprise | 🟢 |
| Dashboard / Kanban | Demo page, not MeterVerse | 🟢 |
| Dashboard / Chat | Demo page, not MeterVerse | 🟢 |
| Dashboard / React Query | Developer demo | 🟢 |
| Dashboard / Elements / Icons | Developer reference | 🟢 |
| Empty /customer directory | Placeholder | 🟢 |

### 9.5 Pages to Rename

| Current | Proposed | Reason |
|---------|----------|--------|
| Monitor → Monitoring | Consistent naming | 🟢 |
| AI → AI Agents | Clarify purpose | 🟢 |
| Logs → System Logs | Clarify scope | 🟢 |
| Services → Platform Services | Clarify scope | 🟢 |

---

## 10. Permissions Matrix

### 10.1 RBAC Architecture

**Current state:** `requireRole()` middleware exists but is not applied to any route. Admin access is unrestricted.

### 10.2 Proposed Permission Model

#### Roles
| Role | Scope | Description |
|------|-------|-------------|
| **Super Admin** | System-wide | Full access to everything |
| **Admin** | System-wide | All administration, no billing override |
| **Operations Manager** | Area-scoped | Customer, meter, reading operations |
| **Operator** | Area-scoped | Daily operations, read-only financials |
| **Billing Manager** | System-wide | Invoices, payments, tariffs, adjustments |
| **Billing Specialist** | Area-scoped | Invoice generation, payment processing |
| **Customer Service** | Customer-scoped | Customer view, issue resolution |
| **Viewer** | System-wide | Read-only access to all |
| **Auditor** | System-wide | Read-only + audit log access |
| **API** | Programmatic | Token-based, scoped permissions |

#### Permission Categories

##### Customer Permissions
| Permission | Super Admin | Admin | Ops Mgr | Operator | Billing Mgr | Billing Spec | CS | Viewer | Auditor |
|------------|:-----------:|:-----:|:--------:|:--------:|:-----------:|:------------:|:--:|:------:|:-------:|
| customers:create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| customers:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| customers:update | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| customers:delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| customers:assign-meter | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| customers:change-status | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| customers:export | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| customers:import | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

##### Meter Permissions
| Permission | Super Admin | Admin | Ops Mgr | Operator | Billing Mgr | Billing Spec | CS | Viewer | Auditor |
|------------|:-----------:|:-----:|:--------:|:--------:|:-----------:|:------------:|:--:|:------:|:-------:|
| meters:create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| meters:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| meters:update | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| meters:delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| meters:assign | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| meters:calibrate | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

##### Reading Permissions
| Permission | Super Admin | Admin | Ops Mgr | Operator | Billing Mgr | Billing Spec | CS | Viewer | Auditor |
|------------|:-----------:|:-----:|:--------:|:--------:|:-----------:|:------------:|:--:|:------:|:-------:|
| readings:create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| readings:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| readings:update | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| readings:delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| readings:validate | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| readings:bulk-create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

##### Invoice Permissions
| Permission | Super Admin | Admin | Ops Mgr | Operator | Billing Mgr | Billing Spec | CS | Viewer | Auditor |
|------------|:-----------:|:-----:|:--------:|:--------:|:-----------:|:------------:|:--:|:------:|:-------:|
| invoices:create | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| invoices:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| invoices:update | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| invoices:delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| invoices:generate | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| invoices:send | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| invoices:adjust | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| invoices:void | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

##### Payment Permissions
| Permission | Super Admin | Admin | Ops Mgr | Operator | Billing Mgr | Billing Spec | CS | Viewer | Auditor |
|------------|:-----------:|:-----:|:--------:|:--------:|:-----------:|:------------:|:--:|:------:|:-------:|
| payments:create | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| payments:read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| payments:update | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| payments:delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| payments:refund | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| payments:allocate | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |

##### System Permissions
| Permission | Super Admin | Admin | Ops Mgr | Operator | Billing Mgr | Billing Spec | CS | Viewer | Auditor |
|------------|:-----------:|:-----:|:--------:|:--------:|:-----------:|:------------:|:--:|:------:|:-------:|
| users:manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| roles:manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings:manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| audit:read | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| reports:generate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| webhooks:manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| api-keys:manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 10.3 Permission Enforcement Points

| Layer | Enforcement | Current |
|-------|-------------|---------|
| Backend routes | `requireRole()` / `requirePermission()` middleware | ❌ Not wired |
| Frontend navigation | `useFilteredNavItems()` hook | ✅ In nav-config |
| Frontend actions | `PermissionGuard` component | ✅ Exists |
| Frontend API calls | Role check before fetch | ❌ Not implemented |
| BFF proxy | Forward user role to backend | ❌ Not implemented |

---

## 11. Enterprise Workspace Design

### 11.1 Workspace Architecture

Every major entity in MeterVerse should have a **Workspace** — a unified view with the following sections:

```
Entity Workspace
├── Overview (KPI cards, summary stats)
├── List (searchable, filterable, paginated table)
├── Detail (full entity profile)
│   ├── Summary tab
│   ├── Related Entities tab (meters, invoices, etc.)
│   ├── Timeline tab (activity feed)
│   ├── Documents tab
│   ├── History tab (audit trail)
│   └── Settings tab (entity-specific config)
├── Analytics (charts, trends, KPIs)
├── Reports (generate, schedule, export)
└── Actions (create, edit, delete, status change, bulk)
```

### 11.2 Customer Workspace

```
Customer Workspace
├── Overview
│   ├── KPI cards: Total customers, Active, New (month), Churned (month)
│   ├── Growth chart (new vs churned over time)
│   └── Status distribution pie chart
│
├── Customer List
│   ├── Search (name, email, code, phone, address)
│   ├── Filters (status, area, type, group, date range)
│   ├── Columns: Code, Name, Email, Phone, Status, Area, Type, Group, Created
│   ├── Sort: Any column, multi-column
│   ├── Pagination: 10/25/50/100 per page
│   ├── Bulk actions: Export, Status change, Delete, Assign meter
│   └── Row actions: View, Edit, Delete, Activate, Deactivate
│
├── Customer Detail [id]
│   ├── Summary: Name, code, status, type, area, group, credit limit, balance
│   ├── Contacts: Phone, email, address, billing address
│   ├── Meters: Assigned meters with status, last reading, actions
│   ├── Readings: Consolidated reading history across all meters
│   ├── Invoices: Invoice list with status, amounts, due dates
│   ├── Payments: Payment history with allocation
│   ├── Contracts: Active and expired contracts
│   ├── Documents: Uploaded files (contracts, IDs, photos)
│   ├── Timeline: Activity feed (created, meter assigned, invoice generated)
│   ├── Notes: Internal notes with author and timestamp
│   └── Audit: Full change history with before/after values
│
├── Analytics
│   ├── Customer growth (daily/weekly/monthly new signups)
│   ├── Churn analysis (termination reasons, trends)
│   ├── ARPU (average revenue per user over time)
│   ├── Customer lifetime value distribution
│   ├── Customer by area/type/group segmentation
│   └── Top customers by revenue
│
├── Reports
│   ├── Customer list report
│   ├── Customer aging report
│   ├── Customer growth report
│   ├── Churn analysis report
│   └── Scheduled report delivery
│
└── Settings
    ├── Customer group management
    ├── Customer status workflow configuration
    ├── Credit limit policies
    └── Auto-notification preferences
```

### 11.3 Meter Workspace

```
Meter Workspace
├── Overview
│   ├── KPI: Total meters, Active, In maintenance, Retired, Reading success %
│   ├── Meters by type chart
│   └── Meters by area chart
│
├── Meter List
│   ├── Search (serial, ID, customer name, area)
│   ├── Filters (status, type, area, customer, installation date)
│   ├── Columns: Serial, Type, Status, Area, Customer, Last Reading, Install Date
│   └── Row actions: View, Edit, Assign/Unassign, Calibrate, Retire
│
├── Meter Detail [id]
│   ├── Summary: Serial, type, model, firmware, status, location
│   ├── Customer: Current assignee, assignment history
│   ├── Readings: Reading history with chart
│   ├── Events: Installation, removal, maintenance, calibration log
│   ├── Connectivity: SIM card, gateway, signal strength
│   └── Audit: Change history
│
├── Analytics
│   ├── Reading success rate over time
│   ├── Meter failure rate by type/model
│   ├── Installation trends
│   └── Area coverage analysis
│
└── Reports
    ├── Meter inventory report
    ├── Meter aging report
    ├── Reading success rate report
    └── Meter maintenance schedule
```

### 11.4 Reading Workspace

```
Reading Workspace
├── Overview
│   ├── KPI: Total readings, Validated %, Anomalous %, Estimated %
│   ├── Readings over time chart
│   └── Validation status distribution
│
├── Reading List
│   ├── Search (meter ID, customer name)
│   ├── Filters (meter, status, date range, source)
│   ├── Columns: Meter, Value, Unit, Timestamp, Status, Source, Validated By
│   └── Row actions: View, Validate, Flag, Correct, Delete
│
├── Reading Detail [id]
│   ├── Reading value + timestamp
│   ├── Meter info (serial, type, customer)
│   ├── Validation info (rules passed/failed, score)
│   ├── Previous reading delta
│   ├── Consumption calculation
│   └── Correction history
│
├── Validation Rules
│   ├── Rule list (name, condition, severity, enabled)
│   └── Rule test interface
│
└── Reports
    ├── Reading volume report
    ├── Validation success rate report
    └── Anomaly report
```

### 11.5 Invoice Workspace

```
Invoice Workspace
├── Overview
│   ├── KPI: Total invoices, Paid %, Overdue %, Avg value, Collection rate
│   ├── Revenue over time chart
│   └── Invoice status distribution
│
├── Invoice List
│   ├── Search (number, customer name, amount)
│   ├── Filters (status, customer, date range, bill cycle)
│   ├── Columns: Number, Customer, Amount, Status, Due Date, Paid Date, Balance
│   └── Row actions: View, Send, Download PDF, Record Payment, Void
│
├── Invoice Detail [id]
│   ├── Header: Number, customer, status, dates
│   ├── Line items: Description, consumption, rate, amount
│   ├── Summary: Subtotal, tax, discounts, total
│   ├── Payments: Payment allocation against this invoice
│   ├── Timeline: Generation, sending, payment, follow-up events
│   └── PDF preview
│
├── Generation
│   ├── Bill cycle management
│   ├── Batch generation interface
│   ├── Preview before finalize
│   └── Generation log
│
└── Reports
    ├── Invoice aging report
    ├── Revenue report
    ├── Collection effectiveness report
    └── Tax report
```

### 11.6 Payment Workspace

```
Payment Workspace
├── Overview
│   ├── KPI: Total collected, Failed %, Avg payment, Refund rate
│   ├── Collection over time chart
│   └── Payment method distribution
│
├── Payment List
│   ├── Search (reference, customer, invoice number)
│   ├── Filters (status, method, customer, date range)
│   ├── Columns: Reference, Customer, Amount, Method, Status, Date
│   └── Row actions: View, Allocate, Refund, Download Receipt
│
├── Payment Detail [id]
│   ├── Payment info: Amount, method, reference, gateway
│   ├── Allocation: Which invoices paid, amounts
│   ├── Customer: Current balance after payment
│   └── Receipt: Downloadable receipt PDF
│
└── Reports
    ├── Collection report
    ├── Payment method analysis
    ├── Refund report
    └── Cash flow report
```

---

## 12. Enterprise Missing Features

### 12.1 Complete Missing Features List

#### Infrastructure (14)
| # | Feature | Priority |
|---|---------|----------|
| F01 | HTTP request logging (morgan/pino) | 🟡 |
| F02 | OpenAPI/Swagger documentation | 🟡 |
| F03 | API versioning (/v1/, /v2/) | 🟢 |
| F04 | Database connection pooling config | 🟡 |
| F05 | Redis caching layer | 🟡 |
| F06 | WebSocket real-time updates | 🟡 |
| F07 | Server-Sent Events for streaming | 🟢 |
| F08 | Health check endpoint with dependencies | ✅ Done |
| F09 | Prometheus metrics endpoint | 🟡 |
| F10 | Structured JSON logging | 🟡 |
| F11 | Rate limiting per user/endpoint | ⚠️ Partial |
| F12 | IP allowlist/blocklist | 🟢 |
| F13 | Audit log retention policy | 🟡 |
| F14 | Backup encryption | 🟢 |

#### Customer Domain (14)
| # | Feature | Priority |
|---|---------|----------|
| F15 | Customer code auto-generation | 🔴 |
| F16 | Customer groups/segments | 🟡 |
| F17 | Customer contracts | 🔴 |
| F18 | Customer meter assignment | 🔴 |
| F19 | Customer timeline/activity feed | 🟡 |
| F20 | Customer documents | 🟡 |
| F21 | Customer KPI dashboard | 🔴 |
| F22 | Customer import/export | 🟡 |
| F23 | Customer duplicate detection | 🟡 |
| F24 | Customer credit limit | 🟡 |
| F25 | Customer notes (internal) | 🟡 |
| F26 | Customer tags/categories | 🟡 |
| F27 | Customer address history | 🟢 |
| F28 | Customer communication log | 🟡 |

#### Meter Domain (12)
| # | Feature | Priority |
|---|---------|----------|
| F29 | Meter type catalog | 🟡 |
| F30 | Meter model/firmware tracking | 🟡 |
| F31 | Meter installation workflow | 🔴 |
| F32 | Meter replacement workflow | 🔴 |
| F33 | Meter calibration schedule | 🟡 |
| F34 | Meter warranty tracking | 🟢 |
| F35 | SIM card management | 🟡 |
| F36 | Gateway management | 🟡 |
| F37 | Meter event log | 🟡 |
| F38 | Meter reading schedule | 🔴 |
| F39 | Meter health monitoring | 🟡 |
| F40 | Battery level monitoring (for battery-powered meters) | 🟢 |

#### Reading Domain (10)
| # | Feature | Priority |
|---|---------|----------|
| F41 | Reading validation rules engine | 🔴 |
| F42 | Automated reading (AMI integration) | 🔴 |
| F43 | Manual reading entry (field worker) | 🟡 |
| F44 | Reading estimation (when no actual reading) | 🟡 |
| F45 | Reading correction/adjustment | 🟡 |
| F46 | Bulk reading import | 🟡 |
| F47 | Reading anomaly detection (AI) | ⚠️ Partial |
| F48 | Consumption calculation from delta | 🔴 |
| F49 | Seasonal adjustment factors | 🟢 |
| F50 | Reading quality scoring | 🟢 |

#### Billing Domain (16)
| # | Feature | Priority |
|---|---------|----------|
| F51 | Tariff management (tiers, TOU, flat) | 🔴 |
| F52 | Tariff versioning/history | 🟡 |
| F53 | Bill cycle management | 🔴 |
| F54 | Bill run automation | 🔴 |
| F55 | Charge rule engine | 🔴 |
| F56 | Invoice line items | 🔴 |
| F57 | Tax calculation | 🔴 |
| F58 | Discount application | 🟡 |
| F59 | Invoice PDF generation | 🟡 |
| F60 | Invoice email delivery | 🟡 |
| F61 | Credit note / debit note | 🟡 |
| F62 | Recurring charges (fixed fees) | 🟡 |
| F63 | Minimum charge guarantee | 🟢 |
| F64 | Late payment penalty | 🟡 |
| F65 | Deposit management | 🟢 |
| F66 | Rebate/refund processing | 🟢 |

#### Payment Domain (8)
| # | Feature | Priority |
|---|---------|----------|
| F67 | Payment gateway integration | 🔴 |
| F68 | Payment allocation (multi-invoice) | 🟡 |
| F69 | Partial payment handling | 🔴 |
| F70 | Overpayment credit balance | 🟡 |
| F71 | Receipt generation (PDF) | 🟡 |
| F72 | Refund processing | 🟡 |
| F73 | Payment retry logic | 🟢 |
| F74 | Recurring payment (auto-pay) | 🟡 |

#### Financial Domain (8)
| # | Feature | Priority |
|---|---------|----------|
| F75 | Double-entry ledger | 🟡 |
| F76 | Chart of accounts | 🟡 |
| F77 | Accounts receivable aging | 🔴 |
| F78 | General ledger export | 🟢 |
| F79 | Trial balance | 🟢 |
| F80 | Revenue recognition | 🟢 |
| F81 | Deferred revenue tracking | 🟢 |
| F82 | Financial period close | 🟢 |

#### Collections Domain (7)
| # | Feature | Priority |
|---|---------|----------|
| F83 | Collection case management | 🟡 |
| F84 | Dunning level configuration | 🟡 |
| F85 | Automated dunning (reminder emails) | 🟡 |
| F86 | Promise-to-pay tracking | 🟢 |
| F87 | Disconnect/reconnect workflow | 🔴 |
| F88 | Collection agency integration | 🟢 |
| F89 | Write-off processing | 🟢 |

#### Notification Domain (6)
| # | Feature | Priority |
|---|---------|----------|
| F90 | Event-triggered notifications (wired) | 🔴 |
| F91 | Notification preference per customer | 🟡 |
| F92 | Email delivery tracking (opens, clicks) | 🟢 |
| F93 | SMS delivery status | 🟢 |
| F94 | Push notification (mobile) | 🟢 |
| F95 | Notification template editor (UI) | 🟡 |

#### Reporting Domain (8)
| # | Feature | Priority |
|---|---------|----------|
| F96 | Real data in reports (not mock) | 🔴 |
| F97 | Report scheduling with delivery | ✅ Done |
| F98 | Report export (CSV, Excel, PDF) | ⚠️ Partial |
| F99 | Custom report builder | 🟡 |
| F100 | Dashboard drill-down | 🟡 |
| F101 | Report sharing (email link) | 🟢 |
| F102 | Report permissions | 🟡 |
| F103 | Report version history | 🟢 |

#### Administration Domain (8)
| # | Feature | Priority |
|---|---------|----------|
| F104 | Admin activity dashboard | ✅ Done |
| F105 | System health monitoring | ✅ Done |
| F106 | Backup automation | ⚠️ Partial |
| F107 | Audit log viewer with search | ✅ Done |
| F108 | Bulk user import | 🟡 |
| F109 | Session management (force logout) | ✅ Done |
| F110 | Maintenance mode | 🟢 |
| F111 | System announcements | 🟢 |

#### Development/Platform (7)
| # | Feature | Priority |
|---|---------|----------|
| F112 | Plugin system | ⚠️ Partial (placeholder) |
| F113 | Webhook event types (all domains) | ⚠️ Partial |
| F114 | API rate limit per key | 🟡 |
| F115 | API usage analytics | 🟢 |
| F116 | SDK/client libraries | 🟢 |
| F117 | Change data capture (CDC) feed | 🟢 |
| F118 | Integration test suite | 🟡 |

### 12.2 Feature Completion Summary

| Category | Total | ✅ Done | ⚠️ Partial | ❌ Missing | % Complete |
|----------|-------|---------|------------|------------|------------|
| Infrastructure | 14 | 1 | 1 | 12 | 7% |
| Customer Domain | 14 | 0 | 2 | 12 | 7% |
| Meter Domain | 12 | 0 | 0 | 12 | 0% |
| Reading Domain | 10 | 0 | 1 | 9 | 5% |
| Billing Domain | 16 | 0 | 0 | 16 | 0% |
| Payment Domain | 8 | 0 | 0 | 8 | 0% |
| Financial Domain | 8 | 0 | 0 | 8 | 0% |
| Collections Domain | 7 | 0 | 0 | 7 | 0% |
| Notification Domain | 6 | 0 | 1 | 5 | 8% |
| Reporting Domain | 8 | 1 | 1 | 6 | 12% |
| Administration | 8 | 4 | 1 | 3 | 50% |
| Development/Platform | 7 | 0 | 2 | 5 | 14% |

**Total features:** 118  
**✅ Complete:** 6 (5%)  
**⚠️ Partial:** 9 (8%)  
**❌ Missing:** 103 (87%)

---

## 13. Implementation Order

### 13.1 Epic Dependency Graph

```
Epic 1: Customer Domain Foundation
  └── Epic 2: Meter Assignment (depends on 1)
       └── Epic 3: Reading History (depends on 1, 2)
            └── Epic 4: Billing Integration (depends on 1, 3)
                 └── Epic 5: Payment Integration (depends on 4)
                      └── Epic 10: Customer Reports (depends on 4, 5)
       └── Epic 6: Customer Timeline (depends on 1)
            └── Epic 9: Customer Notifications (depends on 4, 5, 6)
Epic 7: Customer Analytics (depends on 1)
Epic 8: Customer Documents (depends on 1)
Epic 11: Groups & Contracts (depends on 1)
Epic 12: Performance (depends on all)
```

### 13.2 Implementation Roadmap

#### Sprint 39a — Customer Foundation (Week 1)
| Epic | Tasks | Est. Files | Risk | Value |
|------|-------|-----------|------|-------|
| **Epic 1** | Fix admin API, add user page, detail view, wired forms | 8 | Medium | 🔴 Critical |

**Deliverable:** Customers page works end-to-end in both admin and user interfaces.

#### Sprint 39b — Meter Assignment (Week 2)
| Epic | Tasks | Est. Files | Risk | Value |
|------|-------|-----------|------|-------|
| **Epic 2** | ServiceConnection model, MeterAssignment, assign UI | 12 | High | 🔴 Critical |

**Deliverable:** Meters can be assigned/unassigned to customers with full history.

#### Sprint 39c — Reading & Timeline (Week 3)
| Epic | Tasks | Est. Files | Risk | Value |
|------|-------|-----------|------|-------|
| **Epic 3** | Cross-meter reading history, consumption chart | 7 | Medium | 🟡 High |
| **Epic 6** | Customer timeline, activity feed | 8 | Medium | 🟡 High |

**Deliverable:** Customer detail shows all readings across meters + full activity timeline.

#### Sprint 40a — Billing Engine (Week 4-5)
| Epic | Tasks | Est. Files | Risk | Value |
|------|-------|-----------|------|-------|
| **Epic 4** | Tariff, BillCycle, BillRun, Charge, InvoiceItem, generation | 10 | High | 🔴 Critical |

**Deliverable:** Invoices are generated from readings × tariff with line items.

#### Sprint 40b — Payments & Reports (Week 6)
| Epic | Tasks | Est. Files | Risk | Value |
|------|-------|-----------|------|-------|
| **Epic 5** | Payment allocation, balance tracking, receipt | 7 | Medium | 🟡 High |
| **Epic 10** | Customer reports (PDF, CSV) | 8 | Medium | 🟡 High |

**Deliverable:** End-to-end Reading→Invoice→Payment pipeline.

#### Sprint 41a — Groups & Notifications (Week 7)
| Epic | Tasks | Est. Files | Risk | Value |
|------|-------|-----------|------|-------|
| **Epic 11** | CustomerGroup, Contract models + CRUD | 14 | High | 🟡 High |
| **Epic 9** | Event-triggered notifications | 7 | Low | 🟡 High |

**Deliverable:** Customer segmentation + automated communication.

#### Sprint 41b — Analytics & Documents (Week 8)
| Epic | Tasks | Est. Files | Risk | Value |
|------|-------|-----------|------|-------|
| **Epic 7** | KPI dashboard, charts, trends | 10 | Medium | 🟡 High |
| **Epic 8** | Document upload, storage, preview | 10 | Medium | 🟢 Medium |

**Deliverable:** Executive dashboard + document management.

#### Sprint 42 — Performance (Week 9)
| Epic | Tasks | Est. Files | Risk | Value |
|------|-------|-----------|------|-------|
| **Epic 12** | Indexes, caching, pagination, load testing | 8 | Medium | 🟡 High |

**Deliverable:** System handles 100K+ customers with sub-second response.

### 13.3 Resource Estimate

| Resource | Per Sprint | Total (9 weeks) |
|----------|-----------|-----------------|
| Backend engineers | 1-2 | — |
| Frontend engineers | 1-2 | — |
| Database engineer | 0.5 | — |
| QA engineer | 0.5 | — |
| Total estimated files | 84 | 84 |
| Estimated lines of code | ~12,000 | ~12,000 |
| New database models | 28 | 28 |
| New API endpoints | ~40 | ~40 |
| New frontend pages | ~15 | ~15 |

---

## 14. Acceptance Criteria

### 14.1 Definition of Ready (Sprint Level)

A sprint is ready when:
- [ ] All Epic dependencies are resolved
- [ ] Prisma schema changes are reviewed and approved
- [ ] API contracts are documented
- [ ] UI mockups/wireframes are approved
- [ ] Acceptance criteria are defined for every story
- [ ] Test data/seeds are available
- [ ] Database migration plan is reviewed
- [ ] Rollback plan exists

### 14.2 Definition of Done (Epic Level)

An Epic is done when:
- [ ] All acceptance criteria pass
- [ ] Backend unit tests pass (>80% coverage for new routes)
- [ ] Frontend component tests pass
- [ ] E2E tests pass (Playwright)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Production build succeeds
- [ ] API contracts are finalized
- [ ] Database migrations are applied
- [ ] Audit logging is wired for all new mutations
- [ ] Permissions are enforced for all new endpoints
- [ ] Error handling is implemented (loading, empty, error states)
- [ ] Responsive design verified (mobile + desktop)
- [ ] Accessibility checked (no new violations)
- [ ] Documentation updated (API reference, user guide)

### 14.3 Epic-Specific Acceptance Criteria

#### Epic 1: Customer Domain Foundation
- [ ] Admin `/admin/customers` shows customer data from `/api/meterverse/customers` (not users)
- [ ] User `/dashboard/customers` page exists and shows customer list
- [ ] Customers link visible in user sidebar navigation
- [ ] "Add Customer" form creates customer via API
- [ ] "Edit Customer" form updates customer via API
- [ ] Success/error toasts shown on all mutations
- [ ] Customer detail page exists at `/dashboard/customers/[id]`
- [ ] Detail page shows: name, email, phone, address, status, area, created date
- [ ] Detail page has tabs: Overview, Meters, Readings, Invoices, Payments
- [ ] Soft delete implemented (deletedAt, deletedBy)
- [ ] All mutations audited via AuditEntry
- [ ] Loading skeleton, empty state, error state implemented
- [ ] Responsive layout verified

#### Epic 2: Meter Assignment
- [ ] ServiceConnection model created with all fields
- [ ] Meters can be assigned to customers via customer detail UI
- [ ] Meters can be unassigned from customers
- [ ] Assignment history tracked with start/end dates
- [ ] Cannot assign already-assigned meter
- [ ] Meter list shows assigned customer
- [ ] MeterAssignment created on assign, ended on unassign
- [ ] Unassigning preserves historical assignment record
- [ ] Audit trail for all assignment/unassignment actions

#### Epic 3: Reading History
- [ ] Customer detail shows readings from ALL assigned meters
- [ ] Readings displayed in reverse chronological order
- [ ] Readings filterable by meter, date range, status
- [ ] Consumption chart shows daily/weekly/monthly trends
- [ ] Anomalous readings highlighted in red
- [ ] Pagination for reading list

#### Epic 4: Billing Integration
- [ ] Tariff model exists with tiered/TOU rate support
- [ ] BillCycle model exists with schedule configuration
- [ ] BillRun model exists with status tracking
- [ ] Invoice generation creates line items from consumption × tariff
- [ ] Invoice line items include: description, consumption, rate, amount
- [ ] Invoice PDF generated on creation
- [ ] Invoice summary includes subtotal, tax, total
- [ ] Overdue invoices highlighted in list

#### Epic 5: Payment Integration
- [ ] Payment allocation: payment can be split across invoices
- [ ] Partial payment recorded correctly
- [ ] Overpayment creates credit balance
- [ ] Outstanding balance calculated as sum(invoices) - sum(payments)
- [ ] Receipt PDF generated on payment
- [ ] Payment list filterable by customer, date, method, status

#### Epic 6: Customer Timeline
- [ ] Every customer mutation creates a timeline entry
- [ ] Timeline shows: action, actor, timestamp, details
- [ ] Timeline filterable by event type
- [ ] Timeline sorted reverse chronological
- [ ] Timeline persisted in database (not in-memory)
- [ ] Timeline entries show icons for event type

#### Epic 7: Customer Analytics
- [ ] KPI cards show: total, active, new (month), churned (month)
- [ ] Customer growth chart (area chart, monthly)
- [ ] Churn analysis chart
- [ ] Customer by status distribution (pie chart)
- [ ] Customer by area/type segmentation
- [ ] Date-range selector affects all KPIs
- [ ] All charts have loading, empty, and error states

#### Epic 8: Customer Documents
- [ ] Documents can be uploaded via drag-drop or file picker
- [ ] Supported types: PDF, images (JPG, PNG), DOCX
- [ ] File size limit enforced (10MB default)
- [ ] Documents listed with name, type icon, date, size
- [ ] Documents can be previewed in-browser
- [ ] Documents can be deleted
- [ ] Upload progress bar shown

#### Epic 9: Customer Notifications
- [ ] Welcome notification sent on customer create
- [ ] Status change notification sent
- [ ] Invoice generated notification sent
- [ ] Payment received notification sent
- [ ] Notifications appear in-app and can be sent via email
- [ ] Notification preferences respected (opt-in/opt-out)

#### Epic 10: Customer Reports
- [ ] Customer list export (CSV) works
- [ ] Customer detail export (PDF) works
- [ ] Customer aging report (PDF + CSV)
- [ ] Customer growth report (PDF + CSV)
- [ ] Export has proper formatting and branding
- [ ] Large exports (>10K rows) handle pagination

#### Epic 11: Customer Groups & Contracts
- [ ] CustomerGroup CRUD works
- [ ] Customers can be assigned to groups
- [ ] Group-based filtering works in customer list
- [ ] Contract CRUD works
- [ ] Contract has start/end dates, terms, tariff reference
- [ ] Contract expiry warnings shown
- [ ] Group-based reporting available

#### Epic 12: Performance
- [ ] Customer list loads <500ms with 100K records
- [ ] Customer detail loads <200ms
- [ ] Search returns results <1s
- [ ] KPI calculations complete <2s
- [ ] All queries use indexes (verified via EXPLAIN ANALYZE)
- [ ] Seed script generates 10K+ realistic records
- [ ] Lighthouse performance score >80
- [ ] Lighthouse accessibility score >90

### 14.4 Regression Checklist (Every Epic)

Before marking an Epic complete:
- [ ] All existing E2E tests still pass
- [ ] All existing unit tests still pass
- [ ] Admin pages not modified by the Epic still render correctly
- [ ] User dashboard pages not modified still render correctly
- [ ] No new TypeScript errors introduced
- [ ] No new ESLint warnings introduced
- [ ] Production build succeeds
- [ ] All 48 admin pages accessible and rendering
- [ ] Theme toggle works (light/dark mode)
- [ ] RTL mode works for all new pages
- [ ] Mobile responsive for all new pages

---

## 15. Generated Reports

### 15.1 Files Created

| Report | Path | Purpose |
|--------|------|---------|
| Enterprise Domain Blueprint | `docs/reviews/ENTERPRISE_DOMAIN_BLUEPRINT.md` | This document |
| Customer Domain Analysis | `docs/reviews/PHASE39_CUSTOMER_DOMAIN_ANALYSIS.md` | Customer domain deep dive |
| Implementation Roadmap | `docs/reviews/PHASE39_IMPLEMENTATION_ROADMAP.md` | 12-Epic execution plan |

### 15.2 Recommendations Summary

1. **Fix the data source** — Admin customers page fetches wrong API (P1 critical)
2. **Create user-facing Customers page** — Replace empty CRM demo in sidebar
3. **Add ServiceConnection entity** — The core architectural change needed
4. **Wire the forms** — GenericAdminPage sheets have no onSubmit handlers
5. **Implement soft delete** — Before any real customer data is managed
6. **Add 28 missing database models** — In priority order
7. **Add 40+ missing API endpoints** — Complete the CRUD matrix
8. **Wire RBAC** — `requireRole()` middleware exists, apply it
9. **Wire audit logging** — `auditLog()` middleware exists, apply it
10. **Connect to real backend** — 87% of features currently use mock data

### 15.3 Key Numbers

| Metric | Current | Target |
|--------|---------|--------|
| Database models | 41 | 69 |
| API endpoints | 128 | ~170 |
| Admin pages | 48 | ~55 |
| User pages | 15 + 5 workspace | ~25 |
| Business domains | 50% complete | 100% |
| Business workflows | <20% automated | 100% |
| Feature completion | 5% | 100% |
| Database indexes | 4 | 28 |
| RBAC permissions | 0 enforced | 60+ |
| Mock data pages | 87% | 0% |
| Unit test coverage | 0% | >80% |

---

*End of Enterprise Domain Blueprint. Next step: Implementation Phase 39 begins.*
