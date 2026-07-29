# C14 — Enterprise Customer Experience & Self-Service Platform (Web Only)
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C10 Connectivity, C12 Identity, C13 Financial Intelligence  
**Constraint:** Web-only responsive portal — NO mobile application  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Customer-Facing Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **Customer** model | `schema.prisma:841` | ✅ Complete | name, email, phone, type, status, groupId, areaId |
| **MeterAssignment** model | `schema.prisma:1273` | ✅ Complete | Links customers to meters with period |
| **MeterAssignmentHistory** | `schema.prisma:1294` | ✅ Complete | Full assignment change log |
| **Contract** model | `schema.prisma:1036` | ✅ Complete | contractNumber, type, status, startDate, endDate |
| **ContractTerm** model | `schema.prisma:1062` | ✅ Complete | Key-value contract terms |
| **ContractAmendment** | `schema.prisma:1074` | ✅ Complete | Amendment history |
| **Invoice** model | `schema.prisma:985` | ✅ Complete | Full lifecycle with items + taxes |
| **Payment** model | `schema.prisma:1013` | ✅ Complete | Full lifecycle with allocation |
| **PaymentTransaction** | `schema.prisma:1456` | ✅ Complete | Gateway transactions |
| **CustomerLedgerEntry** | `schema.prisma:1493` | ✅ Complete | Credits, overpayments, refunds |
| **CustomerGroup** | `schema.prisma:1507` | ✅ Complete | Customer segmentation |
| **Reading** model | `schema.prisma:963` | ✅ Complete | Time-series readings |
| **Meter** model | `schema.prisma:879` | ✅ Complete | Full lifecycle, events |
| **MeterEvent** model | `schema.prisma:1307` | ✅ Complete | Alarm, status changes |
| **Notification** model | `schema.prisma:570` | ✅ Complete | type, title, message, readAt |
| **NotificationTemplate** | `schema.prisma:448` | ✅ Complete | Reusable templates |
| **KnowledgeArticle** | `schema.prisma:771` | ✅ Complete | title, content, tags, category, views |
| **Ticket** | `routes/tickets.js` | ✅ Basic | Customer support tickets |
| **Dispute** model | Planned (W04) | ❌ W04 | Invoice/case disputes |
| **C12 Identity** | Complete | ✅ Full | JWT auth, RBAC, MFA, sessions |
| **C13 Financial** | Designed | ❌ Not impl | Billing→GL, revenue, tariffs, etc. |

### 1.2 Existing Frontend Pages

| Page | Route | Status | Quality |
|------|-------|--------|---------|
| Login | `/login` | ✅ Exists | Basic auth form |
| Dashboard | `/dashboard` | ✅ Exists | Basic overview |
| User Profile | `/user` | ✅ Exists | Basic profile |
| Tickets | `/tickets` | ✅ Exists | Basic CRUD |
| Payments | `/payments` | ✅ Exists | Basic payment list |
| Tracking | `/tracking` | ✅ Exists | Basic tracker |
| Info Guide | `/info-guide` | ✅ Exists | Static guide |
| Admin Portal | `/admin` | ✅ Full | 17 sidebar items, 88 pages |

### 1.3 Gap Analysis

| Capability | Current | C14 Target |
|------------|---------|------------|
| **Unified customer dashboard** | ❌ Basic | Real-time overview of all accounts |
| **Invoice center** | ❌ Admin-only | Customer-facing browse, pay, download |
| **Online payment** | ❌ Basic form | Full gateway integration with history |
| **Consumption analytics** | ❌ None | Daily/weekly/monthly charts, comparison |
| **Bill explanation** | ❌ None | Tariff breakdown, usage vs cost |
| **Estimated next bill** | ❌ None | Projection based on current usage |
| **High-consumption alerts** | ❌ None | Threshold-based notifications |
| **Communication center** | ❌ None | Preferences, history, opt-in/out |
| **Service requests** | ❌ Basic tickets | Complaints, disputes, appointments |
| **Document center** | ❌ None | Statements, invoices, reports |
| **Multi-property management** | ❌ None | One account, multiple meters |
| **Delegated access** | ❌ None | Family members, authorized users |
| **Knowledge center** | ❌ Static guide | Searchable FAQ, articles |
| **AI Customer Assistant** | ❌ None | Read-only guidance chatbot |
| **Multi-language** | ❌ English only | Arabic/English toggle |
| **Responsive design** | ❌ Basic | Desktop + tablet + mobile browser |

---

## PART 2: CUSTOMER PORTAL ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER EXPERIENCE & SELF-SERVICE PLATFORM (Web Only)                        │
│                                                                                                   │
│  BROWSER (Responsive)                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  Next.js 16 App Router  |  Tailwind CSS  |  Recharts  |  Zustand  |  React Query          │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │    │
│  │  │ Dashboard │ │Invoices   │ │ Payments  │ │Consumption│ │ Profile   │ │Knowledge  │    │    │
│  │  │ Overview  │ │ & Billing │ │ & History │ │Analytics  │ │ & Settings│ │ & Support │    │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  BFF LAYER (Backend-For-Frontend — existing pattern)                                       │    │
│  │  /src/app/api/customer/*  →  proxies to backend  |  response shaping  |  aggregate calls    │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  BACKEND SERVICES (existing — reused, not rebuilt)                                         │    │
│  │                                                                                            │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐    │    │
│  │  │ C12  │ │Cust  │ │Invoice│ │Paymnt│ │Meter │ │Reading│ │Notif │ │Ticket │ │C13 Fin │    │    │
│  │  │ Auth │ │omers │ │       │ │      │ │      │ │      │ │       │ │      │ │(future)│    │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  C14-SPECIFIC NEW SERVICES                                                                 │    │
│  │                                                                                            │    │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐   │    │
│  │  │ Customer Portal   │ │ Consumption       │ │ Bill Explanation  │ │ AI Customer      │   │    │
│  │  │ Service (aggregate)│ │ Analytics Service │ │ Engine            │ │ Assistant        │   │    │
│  │  └───────────────────┘ └───────────────────┘ └───────────────────┘ └──────────────────┘   │    │
│  │                                                                                            │    │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐   │    │
│  │  │ Service Request   │ │ Communication     │ │ Multi-Language    │ │ Document Center  │   │    │
│  │  │ Engine            │ │ Preference Center │ │ Engine            │ │ Service          │   │    │
│  │  └───────────────────┘ └───────────────────┘ └───────────────────┘ └──────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Portal Navigation Structure

```
PORTAL (responsive web — desktop/tablet/mobile)
│
├── 🔐 AUTHENTICATION (C12 Identity)
│   ├── Login (email + password + optional MFA)
│   ├── Register (new customer self-signup)
│   ├── Forgot Password (reset flow)
│   └── Logout
│
├── 🏠 DASHBOARD
│   ├── Account overview (balance, due date, status)
│   ├── Quick actions (pay now, submit reading, view invoice)
│   ├── Recent activity (last payment, last reading, notifications)
│   ├── Consumption summary (current month vs prior)
│   ├── Alert banner (overdue, high usage, outage)
│   └── Multi-property selector (if multiple meters)
│
├── 📄 INVOICES & BILLING
│   ├── Invoice list (filter: status, date range, property)
│   ├── Invoice detail (items, taxes, charges)
│   ├── Download PDF
│   ├── Pay now (online payment gateway)
│   ├── Auto-pay enrollment
│   ├── Payment history
│   ├── Statement generation (custom date range)
│   └── Bill explanation breakdown
│       ├── Usage vs charge correlation
│       ├── Tariff applied + rate explanation
│       ├── Tax breakdown
│       └── Estimated next bill
│
├── 📊 CONSUMPTION ANALYTICS
│   ├── Daily usage chart (bar)
│   ├── Weekly/monthly trend (line)
│   ├── Year-over-year comparison
│   ├── Cost analysis (EGP per period)
│   ├── Usage by time-of-day (if smart meter data available)
│   ├── High-consumption alerts
│   └── Download data (CSV)
│
├── 👤 PROFILE & SETTINGS
│   ├── Personal information (name, email, phone)
│   ├── Change password
│   ├── MFA setup (C12)
│   ├── Notification preferences
│   │   ├── Bill reminder (SMS/Email/In-app)
│   │   ├── Payment confirmation
│   │   ├── High usage alert
│   │   ├── Outage notification
│   │   └── Marketing (opt-in/out)
│   ├── Language preference (Arabic/English)
│   ├── Multi-property management
│   ├── Delegated access (authorize family/others)
│   └── Close account request
│
├── 📋 SERVICE & SUPPORT
│   ├── Submit reading (manual meter reading)
│   ├── Service requests
│   │   ├── New connection
│   │   ├── Disconnection
│   │   ├── Meter replacement
│   │   ├── Billing inquiry
│   │   └── General inquiry
│   ├── Complaint management
│   │   ├── New complaint (type: billing, meter, service)
│   │   ├── Track status
│   │   └── History
│   ├── Dispute workflow
│   │   ├── Dispute invoice
│   │   ├── Upload evidence
│   │   └── Track resolution
│   ├── Appointment scheduling
│   │   ├── Choose service type
│   │   ├── Select date/time slot
│   │   ├── Confirmation + reminder
│   │   └── Reschedule/cancel
│   └── Ticket tracking
│       ├── My tickets
│       ├── Ticket detail
│       └── Communication history
│
├── 📚 KNOWLEDGE CENTER
│   ├── FAQ (categorized)
│   ├── Knowledge articles (searchable)
│   ├── Guides & tutorials
│   ├── Video tutorials
│   ├── Glossary of terms
│   └── Contact us (form + phone + email)
│
├── 📎 DOCUMENTS
│   ├── Invoices (downloadable PDFs)
│   ├── Statements (custom period)
│   ├── Contract documents
│   ├── Meter installation certificates
│   └── Correspondence history
│
└── 🤖 AI CUSTOMER ASSISTANT
    ├── Chat bubble (floating, persistent)
    ├── Guided Q&A (read-only, no autonomous actions)
    ├── FAQ suggestions
    ├── Bill explanation requests
    ├── Usage queries ("How much did I use last month?")
    └── Escalation to human support
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 CustomerPreference (NEW)

**Purpose:** Store customer communication and portal preferences.

```
CustomerPreference
├── id: String (UUID, PK)
├── customerId: String (FK, UNIQUE)
├── language: String @default("en")            ← en | ar
├── theme: String @default("light")            ← light | dark | system
├── timezone: String @default("Africa/Cairo")
├── billReminder: Boolean @default(true)
├── billReminderChannel: String @default("EMAIL")  ← EMAIL | SMS | BOTH
├── billReminderDaysBefore: Int @default(5)
├── paymentConfirmation: Boolean @default(true)
├── paymentConfirmationChannel: String @default("EMAIL")
├── highUsageAlert: Boolean @default(true)
├── highUsageThreshold: Float?                  ← kWh threshold
├── outageNotification: Boolean @default(true)
├── marketingOptIn: Boolean @default(false)
├── autoPay: Boolean @default(false)
├── autoPayMethod: String?                      ← PaymentGateway.id
├── autoPayMinBalance: Float?                   ← Auto-pay when due > this
├── createdAt, updatedAt

Relation:
  customer → Customer
```

### 3.2 DelegatedAccess (NEW)

**Purpose:** Allow customers to grant portal access to family members or authorized users.

```
DelegatedAccess
├── id: String (UUID, PK)
├── customerId: String (FK → Customer)
├── delegateEmail: String
├── delegateName: String
├── relationship: String                       ← FAMILY | ASSISTANT | ACCOUNTANT | TENANT
├── permissions: String (JSON)                 ← ["invoices.view", "payments.create", "readings.submit"]
├── status: String @default("PENDING")         ← PENDING | ACTIVE | REVOKED
├── expiresAt: DateTime?
├── invitedAt: DateTime
├── acceptedAt: DateTime?
├── revokedAt: DateTime?
├── revokedBy: String? (FK → User)
├── createdAt, archivedAt

Index:
  @@index([customerId, status])
  @@index([delegateEmail, status])
```

### 3.3 ServiceRequest (NEW)

**Purpose:** Customer service requests with tracking.

```
ServiceRequest
├── id: String (UUID, PK)
├── customerId: String (FK → Customer)
├── type: String                              ← NEW_CONNECTION | DISCONNECTION | METER_REPLACEMENT |
│                                                 BILLING_INQUIRY | GENERAL_INQUIRY
├── subject: String
├── description: String
├── status: String @default("SUBMITTED")      ← SUBMITTED | IN_REVIEW | APPROVED | SCHEDULED | COMPLETED | CANCELLED
├── priority: String @default("NORMAL")       ← LOW | NORMAL | HIGH | URGENT
├── assignedTo: String? (FK → User)
├── preferredDate: DateTime?
├── preferredTimeSlot: String?                ← MORNING | AFTERNOON | EVENING
├── scheduledDate: DateTime?
├── completedAt: DateTime?
├── notes: String?
├── rating: Int?                              ← Customer satisfaction 1-5
├── createdAt, archivedAt, updatedAt

Relations:
  customer → Customer
  messages → ServiceRequestMessage[]
```

### 3.4 ServiceRequestMessage (NEW)

```
ServiceRequestMessage
├── id, requestId (FK), sender: String (CUSTOMER | AGENT), message: String
├── attachmentUrl: String?, createdAt

Index: [requestId, createdAt]
```

### 3.5 CustomerDocument (NEW)

**Purpose:** Store customer-facing documents (invoices, statements, contracts).

```
CustomerDocument
├── id: String (UUID, PK)
├── customerId: String (FK → Customer)
├── type: String                              ← INVOICE | STATEMENT | CONTRACT | CERTIFICATE | CORRESPONDENCE
├── title: String
├── referenceId: String?                      ← Link to source (Invoice.id, Contract.id)
├── fileUrl: String
├── fileSize: Int
├── mimeType: String @default("application/pdf")
├── generatedAt: DateTime
├── expiresAt: DateTime?
├── createdAt, archivedAt

Indexes:
  @@index([customerId, type])
  @@index([customerId, createdAt])
```

### 3.6 CustomerSession (NEW — extends C12 Session concept)

**Purpose:** Track customer portal sessions with device/browser info for analytics.

```
CustomerSession (could extend existing Session model)
├── id, customerId, token, ip, userAgent, device, location
├── isActive, lastUsedAt, expiresAt
├── portalVersion: String?                   ← Track portal deployment version
├── language: String?
├── createdAt
```

### 3.7 New Models Summary

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | CustomerPreference | ~20 | Communication + portal preferences |
| 2 | DelegatedAccess | ~18 | Family/delegate account access |
| 3 | ServiceRequest | ~20 | Customer service requests |
| 4 | ServiceRequestMessage | ~8 | Request conversation thread |
| 5 | CustomerDocument | ~14 | Customer-facing documents |
| **Total** | **5 new models** | **~80 lines** | |

**Existing models reused directly:** Customer, Invoice, Payment, Reading, Meter, MeterAssignment, Contract, Notification, KnowledgeArticle, Ticket, Dispute (W04)

---

## PART 4: CUSTOMER PORTAL PAGES

### 4.1 Dashboard (`/portal/dashboard`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  🏠 Dashboard                                                      [Property ▼]  [🔔 3] [👤]  │
│                                                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                          │
│ │ Current      │ │ Due Date     │ │ Est. Next    │ │ Account      │                          │
│ │ Balance      │ │              │ │ Bill         │ │ Status       │                          │
│ │ EGP 1,250.00 │ │ Aug 15, 2026 │ │ EGP 845.00   │ │ ● Active     │                          │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘                          │
│                                                                                               │
│ 🔴 Payment overdue: EGP 450.00 — due Jul 15, 2026                                    [Pay Now]│
│                                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ QUICK ACTIONS                                                                             │  │
│ │ [Pay Now] [Submit Reading] [View Invoice] [Report Problem] [Schedule Visit]               │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌─────────────────────────┐ ┌───────────────────────────────────────────────────────────┐    │
│ │ CONSUMPTION THIS MONTH   │ │ RECENT ACTIVITY                                            │    │
│ │                         │ │                                                           │    │
│ │ ████████████████ 450 kWh │ │ 📄 Jul 25 — Invoice INV-2026-0789 issued — EGP 1,250.00 │    │
│ │ ▲ 12% vs last month      │ │ 💳 Jul 20 — Payment EGP 850.00 received — Thank you!     │    │
│ │                         │ │ 📊 Jul 15 — Meter reading submitted — 450 kWh            │    │
│ │ [View Full Analytics →] │ │ 📬 Jul 10 — Bill reminder — due Aug 15                  │    │
│ └─────────────────────────┘ └───────────────────────────────────────────────────────────┘    │
│                                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ UPCOMING SCHEDULES                                                                        │  │
│ │ 📅 Aug 01 — Meter maintenance — your area                                                │  │
│ │ 📅 Aug 15 — Payment due — EGP 1,250.00                                                   │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Invoice Center (`/portal/invoices`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  📄 Invoices & Billing                               [Filter: All ▼] [Search...]              │
│                                                                                               │
│ ┌──────┬────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐   │
│ │ #    │ Date       │ Period   │ Amount   │ Status   │ Due      │ Property │ Actions      │   │
│ │ INV- │ Jul 25     │ Jul 2026 │1,250.00  │ ● Issued │ Aug 15   │ Main     │ [Pay] [PDF] │   │
│ │ 0789 │            │          │          │          │          │          │              │   │
│ │ INV- │ Jun 25     │ Jun 2026 │1,180.00  │ ● Paid   │ Jul 15   │ Main     │ [View] [PDF]│   │
│ │ 0741 │            │          │          │          │          │          │              │   │
│ │ INV- │ May 25     │ May 2026 │ 950.00   │ ● Paid   │ Jun 15   │ Main     │ [View] [PDF]│   │
│ │ 0693 │            │          │          │          │          │          │              │   │
│ └──────┴────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘   │
│                                                                                               │
│ ┌─── INVOICE DETAIL ───────────────────────────────────────────────────────────────────────┐ │
│ │ Invoice INV-2026-0789                                              [Download PDF] [Print] │ │
│ │ Issued: Jul 25, 2026  |  Due: Aug 15, 2026  |  Status: ● Issued                        │ │
│ │                                                                                          │ │
│ │ Meter: MTR-4512 (Water)                    Period: Jul 1 - Jul 31, 2026                  │ │
│ │                                                                                          │ │
│ │ ┌───────────────────────────────────────────────────────────────────────────────────┐   │ │
│ │ │ CHARGES                                                                           │   │ │
│ │ │ Service Charge (Monthly)                         1 × EGP 25.00         EGP 25.00  │   │ │
│ │ │ Meter Rental (Monthly)                           1 × EGP 10.00         EGP 10.00  │   │ │
│ │ │ Water Consumption (Tier 1: 0-30 m³)             30 × EGP 1.50         EGP 45.00  │   │ │
│ │ │ Water Consumption (Tier 2: 31-60 m³)            20 × EGP 3.00         EGP 60.00  │   │ │
│ │ │ Sewage Fee (60% of water charges)                60% × EGP 105.00     EGP 63.00  │   │ │
│ │ │ Subtotal                                                              EGP 203.00  │   │ │
│ │ │ VAT (14%)                                                              EGP 28.42  │   │ │
│ │ │ TOTAL                                                                 EGP 231.42  │   │ │
│ │ └───────────────────────────────────────────────────────────────────────────────────┘   │ │
│ │                                                                                          │ │
│ │ [Pay Now — EGP 231.42]                                                                  │ │
│ │                                                                                          │ │
│ │ ┌─── BILL EXPLANATION ──────────────────────────────────────────────────────────────┐   │ │
│ │ │ 📈 Your usage of 50 m³ is 15% lower than last month (59 m³).                       │   │ │
│ │ │ 💰 Your average daily cost is EGP 7.46.                                            │   │ │
│ │ │ 📊 Estimated next bill: EGP 215.00 (based on current usage trend)                  │   │ │
│ │ │ 📋 Tariff applied: Residential Water Tariff (v4) — effective Jan 2026              │   │ │
│ │ └────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Consumption Analytics (`/portal/consumption`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 Consumption Analytics                                 [Property ▼]  [Period: Month ▼]     │
│                                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ DAILY USAGE — July 2026                                                                   │  │
│ │  kWh                                                                                      │  │
│ │ 20 ┤      ██        ██    ██                                                              │  │
│ │ 15 ┤   ██ ██ ██  ██ ██ ██ ██ ██                                                          │  │
│ │ 10 ┤██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██                                                  │  │
│ │  5 ┤██████████████████████████████████████████████████████████████                        │  │
│ │    └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──    │  │
│ │      1  3  5  7  9 11 13 15 17 19 21 23 25 27 29 31                                      │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────────────────────────┐    │
│ │ MONTHLY COMPARISON    │ │ COST ANALYSIS         │ │ USAGE INSIGHTS                      │    │
│ │                      │ │                        │ │                                     │    │
│ │ Jul ████████ 450 kWh │ │ Jul:     EGP 231.42   │ │ 📈 Highest day: Jul 15 — 18 kWh    │    │
│ │ Jun ███████  400 kWh │ │ Jun:     EGP 210.00   │ │ 📉 Lowest day:  Jul 3  — 8 kWh     │    │
│ │ May ███████  410 kWh │ │ May:     EGP 215.50   │ │ 📊 Avg daily:  14.5 kWh             │    │
│ │ Apr ██████   380 kWh │ │ Apr:     EGP 190.00   │ │ ▲ 12% vs last month                 │    │
│ │ Mar ██████   390 kWh │ │ Mar:     EGP 195.00   │ │ 🔔 Alert: Jul 15 consumption > 2×   │    │
│ │                      │ │                        │ │    average — possible leak?         │    │
│ │ ▼ 12% from last month│ │ Cost per kWh: EGP 0.51│ │                                     │    │
│ └──────────────────────┘ └──────────────────────┘ └─────────────────────────────────────┘    │
│                                                                                               │
│ [Download Data (CSV)]  [Download Report (PDF)]                                                 │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Profile & Settings (`/portal/profile`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  👤 Profile & Settings                                                                         │
│                                                                                               │
│ ┌─── PERSONAL INFORMATION ─────────────────────────────────────────────────────────────────┐  │
│ │ Name:          Ahmed Mohamed                                         [Edit]              │  │
│ │ Email:         ahmed@example.com                                      [Change Email]      │  │
│ │ Phone:         +20 100 123 4567                                       [Change Phone]      │  │
│ │ Password:      ***************                                        [Change Password]   │  │
│ │ MFA:           ✅ Two-factor enabled                                   [Manage MFA]       │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌─── NOTIFICATION PREFERENCES ────────────────────────────────────────────────────────────┐  │
│ │                                                                                          │  │
│ │ Bill Reminder                  [✅ Email] [✅ SMS] [✅ In-app]  Days before: [5 ▼]      │  │
│ │ Payment Confirmation           [✅ Email] [⬜ SMS] [✅ In-app]                           │  │
│ │ High Usage Alert               [✅ Email] [✅ SMS] [✅ In-app]  Threshold: [500 kWh ▼]  │  │
│ │ Outage Notification            [⬜ Email] [✅ SMS] [✅ In-app]                           │  │
│ │ Marketing / Promotions         [⬜ Email] [⬜ SMS]                                       │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌─── LANGUAGE & REGIONAL ─────────────────────────────────────────────────────────────────┐  │
│ │ Language:    [🇬🇧 English ▼]  or  [🇪🇬 العربية]                                            │  │
│ │ Timezone:    [Africa/Cairo (UTC+2) ▼]                                                    │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌─── DELEGATED ACCESS ────────────────────────────────────────────────────────────────────┐  │
│ │ Grant portal access to family members or authorized users:                                │  │
│ │                                                                                          │  │
│ │ ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐             │  │
│ │ │ Name         │ Email        │ Relationship │ Permissions  │ Status       │             │  │
│ │ │ Sara Ahmed   │ sara@ex.com  │ Family       │ View + Pay   │ ✅ Active    │ [Revoke]   │  │
│ │ │ Omar Ali     │ omar@ex.com  │ Accountant   │ View Only    │ ⚠ Pending   │ [Resend]   │  │
│ │ └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘             │  │
│ │ [Invite New Delegate]                                                                     │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌─── PROPERTIES & METERS ─────────────────────────────────────────────────────────────────┐  │
│ │ ┌────────────┬────────────┬────────────┬────────────┬────────────┬────────────┐          │  │
│ │ │ Property   │ Meter      │ Type       │ Status     │ Last Read  │ Contract   │          │  │
│ │ │ Main Home  │ MTR-4512   │ Water      │ ● Active   │ Jul 28     │ Standard   │          │  │
│ │ │ Apartment  │ MTR-8912   │ Electric   │ ● Active   │ Jul 28     │ Standard   │          │  │
│ │ │ Villa      │ MTR-3341   │ Water+El   │ ● Active   │ Jul 27     │ Premium    │          │  │
│ │ └────────────┴────────────┴────────────┴────────────┴────────────┴────────────┘          │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.5 AI Customer Assistant (`/portal/assistant`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  🤖 Customer Assistant                                                    [English ▼] [🗕 —]  │
│                                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ Hello! I'm MeterVerse Assistant. I can help you with:                                     │  │
│ │ • Understanding your bill                                                                  │  │
│ │ • Checking account balance and payments                                                   │  │
│ │ • Viewing your consumption and usage trends                                                │  │
│ │ • Explaining tariffs and charges                                                           │  │
│ │ • Finding answers in our knowledge center                                                  │  │
│ │ • Submitting meter readings                                                                │  │
│ │                                                                                            │  │
│ │ ⚠ I'm a read-only assistant — I can't make changes to your account or process payments.   │  │
│ │   For account changes, please visit Profile Settings.                                      │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ You: How much was my last bill?                                                           │  │
│ │                                                                                            │  │
│ │ Assistant: Your last invoice (INV-2026-0789) was EGP 1,250.00, issued on July 25, 2026.   │  │
│ │ It's due on August 15, 2026. Would you like to see the detailed breakdown?                │  │
│ │                                                                                            │  │
│ │ ┌────────────────┐                                                                        │  │
│ │ │ 📄 View Invoice│                                                                        │  │
│ │ └────────────────┘                                                                        │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ You: Why is my bill higher than last month?                                               │  │
│ │                                                                                            │  │
│ │ Assistant: Your July bill (EGP 1,250.00) is EGP 150.00 higher than June (EGP 1,100.00).   │  │
│ │                                                                                            │  │
│ │ The main reason is increased consumption:                                                 │  │
│ │ • You used 450 kWh in July vs 380 kWh in June (+18%)                                      │  │
│ │ • The higher consumption pushed you into Tier 2 pricing for 50 kWh                        │  │
│ │ • No tariff rate changes occurred between periods                                         │  │
│ │                                                                                            │  │
│ │ Tips to reduce your bill:                                                                 │  │
│ │ • Peak usage was between 4-8 PM — consider shifting usage to off-peak                     │  │
│ │ • Your AC usage increased 30% — check for efficiency                                      │  │
│ │                                                                                            │  │
│ │ ┌────────────────────┐  ┌──────────────────┐                                              │  │
│ │ │ 📊 View Analytics  │  │ 📋 Usage Tips     │                                              │  │
│ │ └────────────────────┘  └──────────────────┘                                              │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ Type your question here...                                              [Send]  [🎤]         │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 5: AI CUSTOMER ASSISTANT — GOVERNANCE

### 5.1 Assistant Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **CA-1** | Read-only — cannot execute any mutations | Application guard on all actions |
| **CA-2** | Cannot access other customers' data | Row-level security via JWT customerId |
| **CA-3** | Cannot expose sensitive data (passwords, MFA codes) | Response filtering |
| **CA-4** | Every interaction logged to AuditEntry | `auditLog("assistant.query", ...)` |
| **CA-5** | Cannot process payments | Redirect to payment portal |
| **CA-6** | Cannot modify account settings | Redirect to profile settings |
| **CA-7** | Escalate to human support on uncertainty | Threshold-based handoff |
| **CA-8** | Responses include confidence + source links | Explainable AI |

### 5.2 Assistant Capabilities

| Capability | Data Source | Read-Only |
|------------|-------------|-----------|
| Account balance | CustomerLedgerEntry + Invoice | ✅ |
| Invoice details | Invoice + InvoiceItem + InvoiceTax | ✅ |
| Payment history | Payment + PaymentTransaction | ✅ |
| Consumption data | Reading (time-series) | ✅ |
| Usage comparison | Reading aggregated by period | ✅ |
| Bill explanation | Invoice + Tariff + Rates | ✅ |
| Tariff information | Tariff + TariffVersion + Rates | ✅ |
| Estimated next bill | Historical consumption × current tariff | ✅ |
| Knowledge articles | KnowledgeArticle (filtered) | ✅ |
| FAQ answers | KnowledgeArticle where category=FAQ | ✅ |
| Service request status | ServiceRequest | ✅ |
| Appointment info | ServiceRequest where scheduled | ✅ |

### 5.3 Escalation Flow

```
Customer Query
    │
    ├── AI Assistant can answer with confidence > 0.85
    │   → Answer directly with evidence links
    │
    ├── AI Assistant can answer with confidence 0.50-0.85
    │   → Answer + suggest related articles + offer escalation
    │
    └── AI Assistant cannot answer or confidence < 0.50
        → Apologize + offer to create support ticket
        → Pre-fill ticket form with conversation context
        → Escalate to human agent
```

---

## PART 6: MULTI-LANGUAGE ARCHITECTURE

### 6.1 Strategy

```
Next.js i18n routing:
  /portal/en/dashboard
  /portal/ar/dashboard
  
Implementation:
  - next-intl for internationalization
  - Translation files: messages/en.json, messages/ar.json
  - RTL support for Arabic (Tailwind RTL plugins)
  - Language persisted in CustomerPreference + cookie
  - Default: browser detection → CustomerPreference override

Translation coverage:
  Phase 1: Core pages (Dashboard, Invoices, Payments, Profile) — 500+ keys
  Phase 2: Analytics, Service Requests, Knowledge Center — 300+ keys
  Phase 3: AI Assistant responses — dynamic, but UI labels static
```

### 6.2 RTL Support

```
Arabic layout considerations:
  - All pages support RTL via dir="rtl" on <html>
  - Tailwind: `start`/`end` instead of `left`/`right`
  - Charts: Recharts supports RTL natively
  - Forms: Input direction auto-detected by language
  - Icons: Flipped for RTL where directional
  - Testing: Chromatic + Playwright with Arabic locale
```

---

## PART 7: ACCESSIBILITY & RESPONSIVE DESIGN

### 7.1 WCAG Compliance

| Level | Requirement | Implementation |
|-------|-------------|----------------|
| **A** | All non-text content has text alternative | aria-labels on all icons, charts |
| **A** | All functionality via keyboard | Tab order, focus trapping modals |
| **A** | Info and relationships preserved in structure | Semantic HTML (nav, main, section) |
| **AA** | Contrast ratio ≥ 4.5:1 | Design tokens enforce contrast |
| **AA** | Resize text to 200% without loss | Responsive units (rem, %, vw) |
| **AA** | Multiple ways to find content | Navigation + search + sitemap |
| **AA** | Headings and labels describe purpose | Every form has label, every section has heading |
| **AAA** | Sign language (deferred) | Not in scope |
| **AAA** | Extended audio description (deferred) | Not in scope |

### 7.2 Responsive Breakpoints

| Device | Breakpoint | Layout |
|--------|------------|--------|
| Desktop | > 1024px | Full sidebar + content |
| Tablet | 768-1024px | Collapsed sidebar, stacked cards |
| Mobile | < 768px | Bottom navigation, single column, hamburger menu |

### 7.3 Mobile Browser Considerations (No App)

```
Progressive Web App capabilities (browser only, no native):
  - manifest.json for "Add to Home Screen"
  - Service worker for offline-cached knowledge base
  - Push notifications (browser API)
  - Responsive viewport meta tag
  - Touch-friendly targets (min 44px tap area)
```

---

## PART 8: INTEGRATION STRATEGY

### 8.1 Backend Services Reused

| Service | Used For | Existing Route |
|---------|----------|----------------|
| C12 Auth | Login, MFA, sessions, password reset | `routes/auth.js` |
| Customers | Profile data, CRUD | `routes/customers.js` |
| Invoices | Browse, detail, download | `routes/invoices.js` |
| Payments | History, pay, auto-pay | `routes/payments.js` |
| Readings | Consumption data | `routes/readings.js` |
| Meters | Meter info, assignments | `routes/meters.js` |
| Tariffs | Rate information (read-only) | `routes/tariffs.js` |
| Notifications | In-app, preferences | `routes/notifications.js` |
| Tickets | Support tickets | `routes/tickets.js` |
| Knowledge Articles | FAQ, search | `routes/knowledge-articles.js` |
| C13 Financial | Invoice→GL, revenue data (future) | W01-W07 |

### 8.2 BFF Endpoints (New — customer-specific)

| Endpoint | Purpose | Aggregates |
|----------|---------|------------|
| `GET /api/customer/dashboard` | Portal dashboard data | Customer + Invoices + Payments + Readings + Notifications |
| `GET /api/customer/consumption` | Usage analytics | Readings aggregated by period |
| `GET /api/customer/bill-explanation/:id` | Breakdown + explanation | Invoice + Items + Tax + Tariff + Usage comparison |
| `GET /api/customer/estimated-bill` | Next bill projection | Current consumption × tariff rate |
| `GET /api/customer/statements` | Custom statement generation | Invoices filtered by date range |

### 8.3 Notification Triggers

| Trigger | Channel | Template | Timing |
|---------|---------|----------|--------|
| Invoice issued | Email, In-app | `invoice.issued` | On issue |
| Payment due reminder | Email, SMS, In-app | `payment.reminder` | 5 days before due |
| Payment received | Email, In-app | `payment.received` | On payment |
| High consumption alert | Email, SMS, In-app | `consumption.high` | When threshold exceeded |
| Outage notification | SMS, In-app | `outage.notice` | On outage event |
| Service request update | Email, In-app | `service.updated` | On status change |
| Appointment reminder | Email, SMS | `appointment.reminder` | 24h before |
| Knowledge article suggestion | In-app | `knowledge.suggest` | Weekly digest |

---

## PART 9: TESTING STRATEGY — C14 (120 Tests)

### 9.1 Portal Rendering Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | Dashboard loads with customer data | All widgets populated |
| 2 | Dashboard shows correct balance | Matches backend |
| 3 | Invoice list paginates correctly | 20 per page |
| 4 | Invoice detail shows line items | All items present |
| 5 | Payment history shows all payments | Chronological |
| 6 | Consumption chart renders correctly | Recharts renders |
| 7 | Profile settings form loads | All fields editable |
| 8 | Knowledge center search works | Results filtered |
| 9 | AI Assistant opens and responds | Chat bubble works |
| 10 | Service request form submits | Correct status |

### 9.2 Authentication Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Login with valid credentials → dashboard | Redirect |
| 2 | Login with invalid credentials → error | Error shown |
| 3 | MFA challenge on MFA-enabled accounts | Code prompt |
| 4 | Invalid MFA code → error | Error shown |
| 5 | Forgot password → reset email sent | Email sent |
| 6 | Password reset → new password works | Login succeeds |
| 7 | Session expiry → redirect to login | Auto-redirect |
| 8 | Unauthenticated access → login page | Guard |
| 9 | Delegate login → limited access | Scoped permissions |
| 10 | Logout → session destroyed | Clean state |

### 9.3 Online Payment Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Pay full invoice → payment processed | Success |
| 2 | Pay partial amount → partial payment | Partial |
| 3 | Pay multiple invoices → batch allocation | All paid |
| 4 | Payment fails → error + retry option | Graceful |
| 5 | Payment gateway redirect → returns to portal | Correct redirect |
| 6 | Payment history → new payment appears | Real-time update |
| 7 | Auto-pay enrollment → preference saved | Updated |
| 8 | Receipt download → valid PDF | Downloadable |
| 9 | Zero invoice → disabled pay button | Guard |
| 10 | Already paid → shows "paid" status | Correct state |

### 9.4 Consumption Analytics Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Daily chart renders 31 days | Complete month |
| 2 | Monthly comparison shows 12 months | Year view |
| 3 | Year-over-year comparison works | 2 years |
| 4 | CSV export downloads correctly | Valid CSV |
| 5 | Cost analysis matches invoice total | Consistent |
| 6 | Cost per kWh calculated correctly | Formula |
| 7 | High-consumption alert at threshold | Alert shown |
| 8 | Zero consumption period → chart handles | Graceful |
| 9 | Multi-meter → per-property consumption | Property filter |

### 9.5 Multi-Language Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | English → all UI text in English | Correct locale |
| 2 | Arabic → all UI text in Arabic (RTL) | Correct locale |
| 3 | Switch language → persistent preference | Saved |
| 4 | RTL layout → correct alignment | Right-aligned |
| 5 | RTL charts → correct axis orientation | Flipped |
| 6 | Arabic numbers → Hindi numerals | Locale-aware |
| 7 | Missing translation → fallback to English | Graceful |
| 8 | Date format → locale-appropriate | dd/mm/yyyy vs yyyy/mm/dd |
| 9 | Currency format → locale-appropriate | Symbol placement |
| 10 | AI Assistant responds in selected language | Matched locale |

### 9.6 Responsive Design Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Desktop 1920px → full layout | Sidebar visible |
| 2 | Desktop 1366px → full layout | Sidebar visible |
| 3 | Tablet 1024px → collapsed sidebar | Hamburger menu |
| 4 | Tablet 768px → stacked cards | Single column |
| 5 | Mobile 375px → bottom navigation | Mobile nav |
| 6 | Mobile 414px → bottom navigation | Mobile nav |
| 7 | Zoom to 200% → all content accessible | No overlap |
| 8 | Keyboard navigation → focus visible | Tab order |
| 9 | Screen reader → ARIA labels present | All interactive |
| 10 | Touch targets ≥ 44px → all buttons pass | No tiny buttons |

### 9.7 AI Assistant Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | "How much is my bill?" → correct response | Reads invoice amount |
| 2 | "Why is my bill high?" → explanation with reasons | Analyzes usage |
| 3 | "Pay my bill" → redirect to payment (no auto-action) | Read-only enforced |
| 4 | Unknown question → offer escalation | Handoff |
| 5 | Arabic question → Arabic response | Language match |
| 6 | Empty query → prompt for input | Guidance |
| 7 | Rapid consecutive queries → rate limited | 10/min |
| 8 | All responses include confidence | Transparency |
| 9 | Conversation history in session | Context retained |
| 10 | Escalate to ticket → pre-filled form | Context carried |

### 9.8 Integration Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Portal login uses C12 auth | Same JWT |
| 2 | Portal RBAC uses existing permissions | Customer role |
| 3 | Portal creates audit entries | Audit trail |
| 4 | Portal notifications use Notification service | In-app + email |
| 5 | Portal payment uses PaymentGateway | Existing gateway |
| 6 | Portal readings use Reading service | Existing validation |
| 7 | Portal meters show assignments via MeterAssignment | Correct data |
| 8 | Portal invoices match GL (C13 W01) | Consistent totals |
| 9 | Portal knowledge uses KnowledgeArticle | Existing articles |
| 10 | Portal AI Assistant logs to C12 AIRecommendation | Audit |

---

## PART 10: C14 DEFINITION OF DONE

```
C14 — CUSTOMER EXPERIENCE & SELF-SERVICE PLATFORM
CERTIFICATION CHECKLIST

□ PORTAL PAGES — 7 SECTIONS COMPLETE
   □ Dashboard (balance, due date, quick actions, activity)
   □ Invoices & Billing (list, detail, PDF, pay, history, statements)
   □ Consumption Analytics (daily/weekly/monthly charts, comparison, cost)
   □ Profile & Settings (info, password, MFA, notifications, language)
   □ Service & Support (reading submit, requests, complaints, disputes, appointments)
   □ Knowledge Center (FAQ, articles, search, guides)
   □ AI Customer Assistant (read-only chat, explainable, escalation)

□ NEW MODELS — 5 CREATED
   □ CustomerPreference (communication + portal preferences)
   □ DelegatedAccess (family/delegate account access)
   □ ServiceRequest (customer service requests)
   □ ServiceRequestMessage (conversation thread)
   □ CustomerDocument (customer-facing documents)

□ AUTHENTICATION — C12 INTEGRATION
   □ Login + MFA (existing C12 auth reused)
   □ Forgot password / reset flow
   □ Delegate access (scoped permissions)
   □ Session management

□ ONLINE PAYMENT
   □ Pay single invoice
   □ Pay partial amount
   □ Batch payment (multi-invoice)
   □ Auto-pay enrollment
   □ Receipt download
   □ Payment history

□ CONSUMPTION ANALYTICS
   □ Daily usage chart (bar)
   □ Monthly trend (line)
   □ Year-over-year comparison
   □ Cost analysis
   □ CSV data export
   □ High-consumption alerting

□ MULTI-LANGUAGE — ARABIC + ENGLISH
   □ Full RTL support for Arabic
   ✅ 500+ translation keys (core)
   □ Language persisted in preferences
   □ Locale-aware dates, numbers, currency

□ RESPONSIVE DESIGN — 3 BREAKPOINTS
   □ Desktop (1024px+)
   □ Tablet (768-1024px)
   □ Mobile (< 768px, browser only)
   □ Touch-friendly targets (44px)
   □ WCAG AA compliance

□ AI CUSTOMER ASSISTANT
   □ Read-only — no autonomous actions
   □ Account balance + invoice queries
   □ Consumption + usage comparison queries
   □ Bill explanation requests
   □ Confidence-gated responses
   □ Human escalation flow
   □ Audit logging

□ INTEGRATIONS
   □ C12 Identity (auth, RBAC, MFA)
   □ Customer service (existing)
   ✅ Invoice + Payment (existing)
   ✅ Reading + Meter (existing)
   ✅ Tariff (existing)
   ✅ Notification (existing)
   □ C13 Financial (future — bill explanation with GL data)

□ SECURITY
   □ Row-level security (customer sees own data only)
   □ Delegated access with scoped permissions
   □ AI Assistant read-only enforcement
   □ All actions audited
   □ Rate limiting on API endpoints

□ TESTS — 120 PASSING
   □ Portal rendering: 25 tests
   □ Authentication: 15 tests
   □ Online payment: 15 tests
   □ Consumption analytics: 15 tests
   □ Multi-language: 15 tests
   □ Responsive design: 15 tests
   □ AI Assistant: 10 tests
   □ Integration: 10 tests

C14 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: C14 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +80 lines (5 new models) |
| 2 | Migration: customer_portal | CREATE | Standard |
| 3 | `backend/src/services/customer-portal.js` | **CREATE** | ~200 lines (dashboard aggregation) |
| 4 | `backend/src/services/customer-analytics.js` | **CREATE** | ~150 lines (consumption analytics) |
| 5 | `backend/src/services/bill-explanation.js` | **CREATE** | ~120 lines (bill breakdown engine) |
| 6 | `backend/src/services/customer-ai-assistant.js` | **CREATE** | ~180 lines (read-only assistant) |
| 7 | `backend/src/routes/customer-portal.js` | **CREATE** | ~250 lines (portal BFF endpoints) |
| 8 | `backend/src/server.js` | MODIFY | +2 lines |
| 9 | `Frontend/src/app/portal/layout.tsx` | **CREATE** | ~80 lines (portal shell with nav) |
| 10 | `Frontend/src/app/portal/dashboard/page.tsx` | **CREATE** | ~200 lines |
| 11 | `Frontend/src/app/portal/invoices/page.tsx` | **CREATE** | ~200 lines |
| 12 | `Frontend/src/app/portal/invoices/[id]/page.tsx` | **CREATE** | ~200 lines |
| 13 | `Frontend/src/app/portal/payments/page.tsx` | **CREATE** | ~150 lines |
| 14 | `Frontend/src/app/portal/consumption/page.tsx` | **CREATE** | ~200 lines |
| 15 | `Frontend/src/app/portal/profile/page.tsx` | **CREATE** | ~250 lines |
| 16 | `Frontend/src/app/portal/service-requests/page.tsx` | **CREATE** | ~150 lines |
| 17 | `Frontend/src/app/portal/knowledge/page.tsx` | **CREATE** | ~150 lines |
| 18 | `Frontend/src/app/portal/assistant/page.tsx` | **CREATE** | ~150 lines |
| 19 | `Frontend/messages/en.json` | **CREATE** | ~500 translation keys |
| 20 | `Frontend/messages/ar.json` | **CREATE** | ~500 translation keys |

**Total estimated new code:** ~3,200 lines
**Total estimated tests:** 120 tests

## APPENDIX B: C14 DEPENDENCY GRAPH

```
C12 Identity ────────────┐
C01-C10 Connectivity ────┤
C13 Financial (future) ──┤
Customer service (exist) ─┤
Invoice + Payment ────────┤
Reading + Meter ─────────┤
Notification ────────────┤
KnowledgeArticle ────────┤
Ticket ──────────────────┤
                          ▼
               ┌────────────────────┐
               │  C14 CUSTOMER       │
               │  PORTAL (Web Only)  │
               └────────────────────┘
                     │
                     ├──→ Customer Portal Service (aggregation)
                     ├──→ Consumption Analytics
                     ├──→ Bill Explanation Engine
                     ├──→ AI Customer Assistant
                     ├──→ 8 frontend portal pages
                     └──→ 5 new models
```

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C14 — Customer Experience & Self-Service Platform (Web Only). READ ONLY. GOVERNANCE PLANNING ONLY.*
