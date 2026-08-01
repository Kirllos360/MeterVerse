<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] In Progress (basic pages; no /portal) | Certification: [ ] Not Certified | Wave: W3 | Commit: c0a25fa4
====================================================================
-->

# C14 â€” Enterprise Customer Experience & Self-Service Platform (Web Only)
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY â€” GOVERNANCE PLANNING ONLY â€” NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C10 Connectivity, C12 Identity, C13 Financial Intelligence  
**Constraint:** Web-only responsive portal â€” NO mobile application  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Customer-Facing Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **Customer** model | `schema.prisma:841` | âœ… Complete | name, email, phone, type, status, groupId, areaId |
| **MeterAssignment** model | `schema.prisma:1273` | âœ… Complete | Links customers to meters with period |
| **MeterAssignmentHistory** | `schema.prisma:1294` | âœ… Complete | Full assignment change log |
| **Contract** model | `schema.prisma:1036` | âœ… Complete | contractNumber, type, status, startDate, endDate |
| **ContractTerm** model | `schema.prisma:1062` | âœ… Complete | Key-value contract terms |
| **ContractAmendment** | `schema.prisma:1074` | âœ… Complete | Amendment history |
| **Invoice** model | `schema.prisma:985` | âœ… Complete | Full lifecycle with items + taxes |
| **Payment** model | `schema.prisma:1013` | âœ… Complete | Full lifecycle with allocation |
| **PaymentTransaction** | `schema.prisma:1456` | âœ… Complete | Gateway transactions |
| **CustomerLedgerEntry** | `schema.prisma:1493` | âœ… Complete | Credits, overpayments, refunds |
| **CustomerGroup** | `schema.prisma:1507` | âœ… Complete | Customer segmentation |
| **Reading** model | `schema.prisma:963` | âœ… Complete | Time-series readings |
| **Meter** model | `schema.prisma:879` | âœ… Complete | Full lifecycle, events |
| **MeterEvent** model | `schema.prisma:1307` | âœ… Complete | Alarm, status changes |
| **Notification** model | `schema.prisma:570` | âœ… Complete | type, title, message, readAt |
| **NotificationTemplate** | `schema.prisma:448` | âœ… Complete | Reusable templates |
| **KnowledgeArticle** | `schema.prisma:771` | âœ… Complete | title, content, tags, category, views |
| **Ticket** | `routes/tickets.js` | âœ… Basic | Customer support tickets |
| **Dispute** model | Planned (W04) | âŒ W04 | Invoice/case disputes |
| **C12 Identity** | Complete | âœ… Full | JWT auth, RBAC, MFA, sessions |
| **C13 Financial** | Designed | âŒ Not impl | Billingâ†’GL, revenue, tariffs, etc. |

### 1.2 Existing Frontend Pages

| Page | Route | Status | Quality |
|------|-------|--------|---------|
| Login | `/login` | âœ… Exists | Basic auth form |
| Dashboard | `/dashboard` | âœ… Exists | Basic overview |
| User Profile | `/user` | âœ… Exists | Basic profile |
| Tickets | `/tickets` | âœ… Exists | Basic CRUD |
| Payments | `/payments` | âœ… Exists | Basic payment list |
| Tracking | `/tracking` | âœ… Exists | Basic tracker |
| Info Guide | `/info-guide` | âœ… Exists | Static guide |
| Admin Portal | `/admin` | âœ… Full | 17 sidebar items, 88 pages |

### 1.3 Gap Analysis

| Capability | Current | C14 Target |
|------------|---------|------------|
| **Unified customer dashboard** | âŒ Basic | Real-time overview of all accounts |
| **Invoice center** | âŒ Admin-only | Customer-facing browse, pay, download |
| **Online payment** | âŒ Basic form | Full gateway integration with history |
| **Consumption analytics** | âŒ None | Daily/weekly/monthly charts, comparison |
| **Bill explanation** | âŒ None | Tariff breakdown, usage vs cost |
| **Estimated next bill** | âŒ None | Projection based on current usage |
| **High-consumption alerts** | âŒ None | Threshold-based notifications |
| **Communication center** | âŒ None | Preferences, history, opt-in/out |
| **Service requests** | âŒ Basic tickets | Complaints, disputes, appointments |
| **Document center** | âŒ None | Statements, invoices, reports |
| **Multi-property management** | âŒ None | One account, multiple meters |
| **Delegated access** | âŒ None | Family members, authorized users |
| **Knowledge center** | âŒ Static guide | Searchable FAQ, articles |
| **AI Customer Assistant** | âŒ None | Read-only guidance chatbot |
| **Multi-language** | âŒ English only | Arabic/English toggle |
| **Responsive design** | âŒ Basic | Desktop + tablet + mobile browser |

---

## PART 2: CUSTOMER PORTAL ARCHITECTURE

### 2.1 High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     CUSTOMER EXPERIENCE & SELF-SERVICE PLATFORM (Web Only)                        â”‚
â”‚                                                                                                   â”‚
â”‚  BROWSER (Responsive)                                                                            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  Next.js 16 App Router  |  Tailwind CSS  |  Recharts  |  Zustand  |  React Query          â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚ Dashboard â”‚ â”‚Invoices   â”‚ â”‚ Payments  â”‚ â”‚Consumptionâ”‚ â”‚ Profile   â”‚ â”‚Knowledge  â”‚    â”‚    â”‚
â”‚  â”‚  â”‚ Overview  â”‚ â”‚ & Billing â”‚ â”‚ & History â”‚ â”‚Analytics  â”‚ â”‚ & Settingsâ”‚ â”‚ & Support â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  BFF LAYER (Backend-For-Frontend â€” existing pattern)                                       â”‚    â”‚
â”‚  â”‚  /src/app/api/customer/*  â†’  proxies to backend  |  response shaping  |  aggregate calls    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  BACKEND SERVICES (existing â€” reused, not rebuilt)                                         â”‚    â”‚
â”‚  â”‚                                                                                            â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚ C12  â”‚ â”‚Cust  â”‚ â”‚Invoiceâ”‚ â”‚Paymntâ”‚ â”‚Meter â”‚ â”‚Readingâ”‚ â”‚Notif â”‚ â”‚Ticket â”‚ â”‚C13 Fin â”‚    â”‚    â”‚
â”‚  â”‚  â”‚ Auth â”‚ â”‚omers â”‚ â”‚       â”‚ â”‚      â”‚ â”‚      â”‚ â”‚      â”‚ â”‚       â”‚ â”‚      â”‚ â”‚(future)â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  C14-SPECIFIC NEW SERVICES                                                                 â”‚    â”‚
â”‚  â”‚                                                                                            â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚    â”‚
â”‚  â”‚  â”‚ Customer Portal   â”‚ â”‚ Consumption       â”‚ â”‚ Bill Explanation  â”‚ â”‚ AI Customer      â”‚   â”‚    â”‚
â”‚  â”‚  â”‚ Service (aggregate)â”‚ â”‚ Analytics Service â”‚ â”‚ Engine            â”‚ â”‚ Assistant        â”‚   â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚    â”‚
â”‚  â”‚                                                                                            â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚    â”‚
â”‚  â”‚  â”‚ Service Request   â”‚ â”‚ Communication     â”‚ â”‚ Multi-Language    â”‚ â”‚ Document Center  â”‚   â”‚    â”‚
â”‚  â”‚  â”‚ Engine            â”‚ â”‚ Preference Center â”‚ â”‚ Engine            â”‚ â”‚ Service          â”‚   â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Portal Navigation Structure

```
PORTAL (responsive web â€” desktop/tablet/mobile)
â”‚
â”œâ”€â”€ ðŸ” AUTHENTICATION (C12 Identity)
â”‚   â”œâ”€â”€ Login (email + password + optional MFA)
â”‚   â”œâ”€â”€ Register (new customer self-signup)
â”‚   â”œâ”€â”€ Forgot Password (reset flow)
â”‚   â””â”€â”€ Logout
â”‚
â”œâ”€â”€ ðŸ  DASHBOARD
â”‚   â”œâ”€â”€ Account overview (balance, due date, status)
â”‚   â”œâ”€â”€ Quick actions (pay now, submit reading, view invoice)
â”‚   â”œâ”€â”€ Recent activity (last payment, last reading, notifications)
â”‚   â”œâ”€â”€ Consumption summary (current month vs prior)
â”‚   â”œâ”€â”€ Alert banner (overdue, high usage, outage)
â”‚   â””â”€â”€ Multi-property selector (if multiple meters)
â”‚
â”œâ”€â”€ ðŸ“„ INVOICES & BILLING
â”‚   â”œâ”€â”€ Invoice list (filter: status, date range, property)
â”‚   â”œâ”€â”€ Invoice detail (items, taxes, charges)
â”‚   â”œâ”€â”€ Download PDF
â”‚   â”œâ”€â”€ Pay now (online payment gateway)
â”‚   â”œâ”€â”€ Auto-pay enrollment
â”‚   â”œâ”€â”€ Payment history
â”‚   â”œâ”€â”€ Statement generation (custom date range)
â”‚   â””â”€â”€ Bill explanation breakdown
â”‚       â”œâ”€â”€ Usage vs charge correlation
â”‚       â”œâ”€â”€ Tariff applied + rate explanation
â”‚       â”œâ”€â”€ Tax breakdown
â”‚       â””â”€â”€ Estimated next bill
â”‚
â”œâ”€â”€ ðŸ“Š CONSUMPTION ANALYTICS
â”‚   â”œâ”€â”€ Daily usage chart (bar)
â”‚   â”œâ”€â”€ Weekly/monthly trend (line)
â”‚   â”œâ”€â”€ Year-over-year comparison
â”‚   â”œâ”€â”€ Cost analysis (EGP per period)
â”‚   â”œâ”€â”€ Usage by time-of-day (if smart meter data available)
â”‚   â”œâ”€â”€ High-consumption alerts
â”‚   â””â”€â”€ Download data (CSV)
â”‚
â”œâ”€â”€ ðŸ‘¤ PROFILE & SETTINGS
â”‚   â”œâ”€â”€ Personal information (name, email, phone)
â”‚   â”œâ”€â”€ Change password
â”‚   â”œâ”€â”€ MFA setup (C12)
â”‚   â”œâ”€â”€ Notification preferences
â”‚   â”‚   â”œâ”€â”€ Bill reminder (SMS/Email/In-app)
â”‚   â”‚   â”œâ”€â”€ Payment confirmation
â”‚   â”‚   â”œâ”€â”€ High usage alert
â”‚   â”‚   â”œâ”€â”€ Outage notification
â”‚   â”‚   â””â”€â”€ Marketing (opt-in/out)
â”‚   â”œâ”€â”€ Language preference (Arabic/English)
â”‚   â”œâ”€â”€ Multi-property management
â”‚   â”œâ”€â”€ Delegated access (authorize family/others)
â”‚   â””â”€â”€ Close account request
â”‚
â”œâ”€â”€ ðŸ“‹ SERVICE & SUPPORT
â”‚   â”œâ”€â”€ Submit reading (manual meter reading)
â”‚   â”œâ”€â”€ Service requests
â”‚   â”‚   â”œâ”€â”€ New connection
â”‚   â”‚   â”œâ”€â”€ Disconnection
â”‚   â”‚   â”œâ”€â”€ Meter replacement
â”‚   â”‚   â”œâ”€â”€ Billing inquiry
â”‚   â”‚   â””â”€â”€ General inquiry
â”‚   â”œâ”€â”€ Complaint management
â”‚   â”‚   â”œâ”€â”€ New complaint (type: billing, meter, service)
â”‚   â”‚   â”œâ”€â”€ Track status
â”‚   â”‚   â””â”€â”€ History
â”‚   â”œâ”€â”€ Dispute workflow
â”‚   â”‚   â”œâ”€â”€ Dispute invoice
â”‚   â”‚   â”œâ”€â”€ Upload evidence
â”‚   â”‚   â””â”€â”€ Track resolution
â”‚   â”œâ”€â”€ Appointment scheduling
â”‚   â”‚   â”œâ”€â”€ Choose service type
â”‚   â”‚   â”œâ”€â”€ Select date/time slot
â”‚   â”‚   â”œâ”€â”€ Confirmation + reminder
â”‚   â”‚   â””â”€â”€ Reschedule/cancel
â”‚   â””â”€â”€ Ticket tracking
â”‚       â”œâ”€â”€ My tickets
â”‚       â”œâ”€â”€ Ticket detail
â”‚       â””â”€â”€ Communication history
â”‚
â”œâ”€â”€ ðŸ“š KNOWLEDGE CENTER
â”‚   â”œâ”€â”€ FAQ (categorized)
â”‚   â”œâ”€â”€ Knowledge articles (searchable)
â”‚   â”œâ”€â”€ Guides & tutorials
â”‚   â”œâ”€â”€ Video tutorials
â”‚   â”œâ”€â”€ Glossary of terms
â”‚   â””â”€â”€ Contact us (form + phone + email)
â”‚
â”œâ”€â”€ ðŸ“Ž DOCUMENTS
â”‚   â”œâ”€â”€ Invoices (downloadable PDFs)
â”‚   â”œâ”€â”€ Statements (custom period)
â”‚   â”œâ”€â”€ Contract documents
â”‚   â”œâ”€â”€ Meter installation certificates
â”‚   â””â”€â”€ Correspondence history
â”‚
â””â”€â”€ ðŸ¤– AI CUSTOMER ASSISTANT
    â”œâ”€â”€ Chat bubble (floating, persistent)
    â”œâ”€â”€ Guided Q&A (read-only, no autonomous actions)
    â”œâ”€â”€ FAQ suggestions
    â”œâ”€â”€ Bill explanation requests
    â”œâ”€â”€ Usage queries ("How much did I use last month?")
    â””â”€â”€ Escalation to human support
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 CustomerPreference (NEW)

**Purpose:** Store customer communication and portal preferences.

```
CustomerPreference
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ customerId: String (FK, UNIQUE)
â”œâ”€â”€ language: String @default("en")            â† en | ar
â”œâ”€â”€ theme: String @default("light")            â† light | dark | system
â”œâ”€â”€ timezone: String @default("Africa/Cairo")
â”œâ”€â”€ billReminder: Boolean @default(true)
â”œâ”€â”€ billReminderChannel: String @default("EMAIL")  â† EMAIL | SMS | BOTH
â”œâ”€â”€ billReminderDaysBefore: Int @default(5)
â”œâ”€â”€ paymentConfirmation: Boolean @default(true)
â”œâ”€â”€ paymentConfirmationChannel: String @default("EMAIL")
â”œâ”€â”€ highUsageAlert: Boolean @default(true)
â”œâ”€â”€ highUsageThreshold: Float?                  â† kWh threshold
â”œâ”€â”€ outageNotification: Boolean @default(true)
â”œâ”€â”€ marketingOptIn: Boolean @default(false)
â”œâ”€â”€ autoPay: Boolean @default(false)
â”œâ”€â”€ autoPayMethod: String?                      â† PaymentGateway.id
â”œâ”€â”€ autoPayMinBalance: Float?                   â† Auto-pay when due > this
â”œâ”€â”€ createdAt, updatedAt

Relation:
  customer â†’ Customer
```

### 3.2 DelegatedAccess (NEW)

**Purpose:** Allow customers to grant portal access to family members or authorized users.

```
DelegatedAccess
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ customerId: String (FK â†’ Customer)
â”œâ”€â”€ delegateEmail: String
â”œâ”€â”€ delegateName: String
â”œâ”€â”€ relationship: String                       â† FAMILY | ASSISTANT | ACCOUNTANT | TENANT
â”œâ”€â”€ permissions: String (JSON)                 â† ["invoices.view", "payments.create", "readings.submit"]
â”œâ”€â”€ status: String @default("PENDING")         â† PENDING | ACTIVE | REVOKED
â”œâ”€â”€ expiresAt: DateTime?
â”œâ”€â”€ invitedAt: DateTime
â”œâ”€â”€ acceptedAt: DateTime?
â”œâ”€â”€ revokedAt: DateTime?
â”œâ”€â”€ revokedBy: String? (FK â†’ User)
â”œâ”€â”€ createdAt, archivedAt

Index:
  @@index([customerId, status])
  @@index([delegateEmail, status])
```

### 3.3 ServiceRequest (NEW)

**Purpose:** Customer service requests with tracking.

```
ServiceRequest
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ customerId: String (FK â†’ Customer)
â”œâ”€â”€ type: String                              â† NEW_CONNECTION | DISCONNECTION | METER_REPLACEMENT |
â”‚                                                 BILLING_INQUIRY | GENERAL_INQUIRY
â”œâ”€â”€ subject: String
â”œâ”€â”€ description: String
â”œâ”€â”€ status: String @default("SUBMITTED")      â† SUBMITTED | IN_REVIEW | APPROVED | SCHEDULED | COMPLETED | CANCELLED
â”œâ”€â”€ priority: String @default("NORMAL")       â† LOW | NORMAL | HIGH | URGENT
â”œâ”€â”€ assignedTo: String? (FK â†’ User)
â”œâ”€â”€ preferredDate: DateTime?
â”œâ”€â”€ preferredTimeSlot: String?                â† MORNING | AFTERNOON | EVENING
â”œâ”€â”€ scheduledDate: DateTime?
â”œâ”€â”€ completedAt: DateTime?
â”œâ”€â”€ notes: String?
â”œâ”€â”€ rating: Int?                              â† Customer satisfaction 1-5
â”œâ”€â”€ createdAt, archivedAt, updatedAt

Relations:
  customer â†’ Customer
  messages â†’ ServiceRequestMessage[]
```

### 3.4 ServiceRequestMessage (NEW)

```
ServiceRequestMessage
â”œâ”€â”€ id, requestId (FK), sender: String (CUSTOMER | AGENT), message: String
â”œâ”€â”€ attachmentUrl: String?, createdAt

Index: [requestId, createdAt]
```

### 3.5 CustomerDocument (NEW)

**Purpose:** Store customer-facing documents (invoices, statements, contracts).

```
CustomerDocument
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ customerId: String (FK â†’ Customer)
â”œâ”€â”€ type: String                              â† INVOICE | STATEMENT | CONTRACT | CERTIFICATE | CORRESPONDENCE
â”œâ”€â”€ title: String
â”œâ”€â”€ referenceId: String?                      â† Link to source (Invoice.id, Contract.id)
â”œâ”€â”€ fileUrl: String
â”œâ”€â”€ fileSize: Int
â”œâ”€â”€ mimeType: String @default("application/pdf")
â”œâ”€â”€ generatedAt: DateTime
â”œâ”€â”€ expiresAt: DateTime?
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([customerId, type])
  @@index([customerId, createdAt])
```

### 3.6 CustomerSession (NEW â€” extends C12 Session concept)

**Purpose:** Track customer portal sessions with device/browser info for analytics.

```
CustomerSession (could extend existing Session model)
â”œâ”€â”€ id, customerId, token, ip, userAgent, device, location
â”œâ”€â”€ isActive, lastUsedAt, expiresAt
â”œâ”€â”€ portalVersion: String?                   â† Track portal deployment version
â”œâ”€â”€ language: String?
â”œâ”€â”€ createdAt
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ  Dashboard                                                      [Property â–¼]  [ðŸ”” 3] [ðŸ‘¤]  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                          â”‚
â”‚ â”‚ Current      â”‚ â”‚ Due Date     â”‚ â”‚ Est. Next    â”‚ â”‚ Account      â”‚                          â”‚
â”‚ â”‚ Balance      â”‚ â”‚              â”‚ â”‚ Bill         â”‚ â”‚ Status       â”‚                          â”‚
â”‚ â”‚ EGP 1,250.00 â”‚ â”‚ Aug 15, 2026 â”‚ â”‚ EGP 845.00   â”‚ â”‚ â— Active     â”‚                          â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                          â”‚
â”‚                                                                                               â”‚
â”‚ ðŸ”´ Payment overdue: EGP 450.00 â€” due Jul 15, 2026                                    [Pay Now]â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ QUICK ACTIONS                                                                             â”‚  â”‚
â”‚ â”‚ [Pay Now] [Submit Reading] [View Invoice] [Report Problem] [Schedule Visit]               â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ CONSUMPTION THIS MONTH   â”‚ â”‚ RECENT ACTIVITY                                            â”‚    â”‚
â”‚ â”‚                         â”‚ â”‚                                                           â”‚    â”‚
â”‚ â”‚ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 450 kWh â”‚ â”‚ ðŸ“„ Jul 25 â€” Invoice INV-2026-0789 issued â€” EGP 1,250.00 â”‚    â”‚
â”‚ â”‚ â–² 12% vs last month      â”‚ â”‚ ðŸ’³ Jul 20 â€” Payment EGP 850.00 received â€” Thank you!     â”‚    â”‚
â”‚ â”‚                         â”‚ â”‚ ðŸ“Š Jul 15 â€” Meter reading submitted â€” 450 kWh            â”‚    â”‚
â”‚ â”‚ [View Full Analytics â†’] â”‚ â”‚ ðŸ“¬ Jul 10 â€” Bill reminder â€” due Aug 15                  â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ UPCOMING SCHEDULES                                                                        â”‚  â”‚
â”‚ â”‚ ðŸ“… Aug 01 â€” Meter maintenance â€” your area                                                â”‚  â”‚
â”‚ â”‚ ðŸ“… Aug 15 â€” Payment due â€” EGP 1,250.00                                                   â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.2 Invoice Center (`/portal/invoices`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ“„ Invoices & Billing                               [Filter: All â–¼] [Search...]              â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ #    â”‚ Date       â”‚ Period   â”‚ Amount   â”‚ Status   â”‚ Due      â”‚ Property â”‚ Actions      â”‚   â”‚
â”‚ â”‚ INV- â”‚ Jul 25     â”‚ Jul 2026 â”‚1,250.00  â”‚ â— Issued â”‚ Aug 15   â”‚ Main     â”‚ [Pay] [PDF] â”‚   â”‚
â”‚ â”‚ 0789 â”‚            â”‚          â”‚          â”‚          â”‚          â”‚          â”‚              â”‚   â”‚
â”‚ â”‚ INV- â”‚ Jun 25     â”‚ Jun 2026 â”‚1,180.00  â”‚ â— Paid   â”‚ Jul 15   â”‚ Main     â”‚ [View] [PDF]â”‚   â”‚
â”‚ â”‚ 0741 â”‚            â”‚          â”‚          â”‚          â”‚          â”‚          â”‚              â”‚   â”‚
â”‚ â”‚ INV- â”‚ May 25     â”‚ May 2026 â”‚ 950.00   â”‚ â— Paid   â”‚ Jun 15   â”‚ Main     â”‚ [View] [PDF]â”‚   â”‚
â”‚ â”‚ 0693 â”‚            â”‚          â”‚          â”‚          â”‚          â”‚          â”‚              â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€ INVOICE DETAIL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Invoice INV-2026-0789                                              [Download PDF] [Print] â”‚ â”‚
â”‚ â”‚ Issued: Jul 25, 2026  |  Due: Aug 15, 2026  |  Status: â— Issued                        â”‚ â”‚
â”‚ â”‚                                                                                          â”‚ â”‚
â”‚ â”‚ Meter: MTR-4512 (Water)                    Period: Jul 1 - Jul 31, 2026                  â”‚ â”‚
â”‚ â”‚                                                                                          â”‚ â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚ â”‚
â”‚ â”‚ â”‚ CHARGES                                                                           â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ Service Charge (Monthly)                         1 Ã— EGP 25.00         EGP 25.00  â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ Meter Rental (Monthly)                           1 Ã— EGP 10.00         EGP 10.00  â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ Water Consumption (Tier 1: 0-30 mÂ³)             30 Ã— EGP 1.50         EGP 45.00  â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ Water Consumption (Tier 2: 31-60 mÂ³)            20 Ã— EGP 3.00         EGP 60.00  â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ Sewage Fee (60% of water charges)                60% Ã— EGP 105.00     EGP 63.00  â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ Subtotal                                                              EGP 203.00  â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ VAT (14%)                                                              EGP 28.42  â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ TOTAL                                                                 EGP 231.42  â”‚   â”‚ â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚ â”‚
â”‚ â”‚                                                                                          â”‚ â”‚
â”‚ â”‚ [Pay Now â€” EGP 231.42]                                                                  â”‚ â”‚
â”‚ â”‚                                                                                          â”‚ â”‚
â”‚ â”‚ â”Œâ”€â”€â”€ BILL EXPLANATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚ â”‚
â”‚ â”‚ â”‚ ðŸ“ˆ Your usage of 50 mÂ³ is 15% lower than last month (59 mÂ³).                       â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ ðŸ’° Your average daily cost is EGP 7.46.                                            â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ ðŸ“Š Estimated next bill: EGP 215.00 (based on current usage trend)                  â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ ðŸ“‹ Tariff applied: Residential Water Tariff (v4) â€” effective Jan 2026              â”‚   â”‚ â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.3 Consumption Analytics (`/portal/consumption`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ“Š Consumption Analytics                                 [Property â–¼]  [Period: Month â–¼]     â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ DAILY USAGE â€” July 2026                                                                   â”‚  â”‚
â”‚ â”‚  kWh                                                                                      â”‚  â”‚
â”‚ â”‚ 20 â”¤      â–ˆâ–ˆ        â–ˆâ–ˆ    â–ˆâ–ˆ                                                              â”‚  â”‚
â”‚ â”‚ 15 â”¤   â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ  â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ                                                          â”‚  â”‚
â”‚ â”‚ 10 â”¤â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ                                                  â”‚  â”‚
â”‚ â”‚  5 â”¤â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ                        â”‚  â”‚
â”‚ â”‚    â””â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€    â”‚  â”‚
â”‚ â”‚      1  3  5  7  9 11 13 15 17 19 21 23 25 27 29 31                                      â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ MONTHLY COMPARISON    â”‚ â”‚ COST ANALYSIS         â”‚ â”‚ USAGE INSIGHTS                      â”‚    â”‚
â”‚ â”‚                      â”‚ â”‚                        â”‚ â”‚                                     â”‚    â”‚
â”‚ â”‚ Jul â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 450 kWh â”‚ â”‚ Jul:     EGP 231.42   â”‚ â”‚ ðŸ“ˆ Highest day: Jul 15 â€” 18 kWh    â”‚    â”‚
â”‚ â”‚ Jun â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  400 kWh â”‚ â”‚ Jun:     EGP 210.00   â”‚ â”‚ ðŸ“‰ Lowest day:  Jul 3  â€” 8 kWh     â”‚    â”‚
â”‚ â”‚ May â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  410 kWh â”‚ â”‚ May:     EGP 215.50   â”‚ â”‚ ðŸ“Š Avg daily:  14.5 kWh             â”‚    â”‚
â”‚ â”‚ Apr â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ   380 kWh â”‚ â”‚ Apr:     EGP 190.00   â”‚ â”‚ â–² 12% vs last month                 â”‚    â”‚
â”‚ â”‚ Mar â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ   390 kWh â”‚ â”‚ Mar:     EGP 195.00   â”‚ â”‚ ðŸ”” Alert: Jul 15 consumption > 2Ã—   â”‚    â”‚
â”‚ â”‚                      â”‚ â”‚                        â”‚ â”‚    average â€” possible leak?         â”‚    â”‚
â”‚ â”‚ â–¼ 12% from last monthâ”‚ â”‚ Cost per kWh: EGP 0.51â”‚ â”‚                                     â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                               â”‚
â”‚ [Download Data (CSV)]  [Download Report (PDF)]                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.4 Profile & Settings (`/portal/profile`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ‘¤ Profile & Settings                                                                         â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€ PERSONAL INFORMATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Name:          Ahmed Mohamed                                         [Edit]              â”‚  â”‚
â”‚ â”‚ Email:         ahmed@example.com                                      [Change Email]      â”‚  â”‚
â”‚ â”‚ Phone:         +20 100 123 4567                                       [Change Phone]      â”‚  â”‚
â”‚ â”‚ Password:      ***************                                        [Change Password]   â”‚  â”‚
â”‚ â”‚ MFA:           âœ… Two-factor enabled                                   [Manage MFA]       â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€ NOTIFICATION PREFERENCES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚                                                                                          â”‚  â”‚
â”‚ â”‚ Bill Reminder                  [âœ… Email] [âœ… SMS] [âœ… In-app]  Days before: [5 â–¼]      â”‚  â”‚
â”‚ â”‚ Payment Confirmation           [âœ… Email] [â¬œ SMS] [âœ… In-app]                           â”‚  â”‚
â”‚ â”‚ High Usage Alert               [âœ… Email] [âœ… SMS] [âœ… In-app]  Threshold: [500 kWh â–¼]  â”‚  â”‚
â”‚ â”‚ Outage Notification            [â¬œ Email] [âœ… SMS] [âœ… In-app]                           â”‚  â”‚
â”‚ â”‚ Marketing / Promotions         [â¬œ Email] [â¬œ SMS]                                       â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€ LANGUAGE & REGIONAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Language:    [ðŸ‡¬ðŸ‡§ English â–¼]  or  [ðŸ‡ªðŸ‡¬ Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©]                                            â”‚  â”‚
â”‚ â”‚ Timezone:    [Africa/Cairo (UTC+2) â–¼]                                                    â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€ DELEGATED ACCESS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Grant portal access to family members or authorized users:                                â”‚  â”‚
â”‚ â”‚                                                                                          â”‚  â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”             â”‚  â”‚
â”‚ â”‚ â”‚ Name         â”‚ Email        â”‚ Relationship â”‚ Permissions  â”‚ Status       â”‚             â”‚  â”‚
â”‚ â”‚ â”‚ Sara Ahmed   â”‚ sara@ex.com  â”‚ Family       â”‚ View + Pay   â”‚ âœ… Active    â”‚ [Revoke]   â”‚  â”‚
â”‚ â”‚ â”‚ Omar Ali     â”‚ omar@ex.com  â”‚ Accountant   â”‚ View Only    â”‚ âš  Pending   â”‚ [Resend]   â”‚  â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜             â”‚  â”‚
â”‚ â”‚ [Invite New Delegate]                                                                     â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€ PROPERTIES & METERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚  â”‚
â”‚ â”‚ â”‚ Property   â”‚ Meter      â”‚ Type       â”‚ Status     â”‚ Last Read  â”‚ Contract   â”‚          â”‚  â”‚
â”‚ â”‚ â”‚ Main Home  â”‚ MTR-4512   â”‚ Water      â”‚ â— Active   â”‚ Jul 28     â”‚ Standard   â”‚          â”‚  â”‚
â”‚ â”‚ â”‚ Apartment  â”‚ MTR-8912   â”‚ Electric   â”‚ â— Active   â”‚ Jul 28     â”‚ Standard   â”‚          â”‚  â”‚
â”‚ â”‚ â”‚ Villa      â”‚ MTR-3341   â”‚ Water+El   â”‚ â— Active   â”‚ Jul 27     â”‚ Premium    â”‚          â”‚  â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.5 AI Customer Assistant (`/portal/assistant`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ¤– Customer Assistant                                                    [English â–¼] [ðŸ—• â€”]  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Hello! I'm MeterVerse Assistant. I can help you with:                                     â”‚  â”‚
â”‚ â”‚ â€¢ Understanding your bill                                                                  â”‚  â”‚
â”‚ â”‚ â€¢ Checking account balance and payments                                                   â”‚  â”‚
â”‚ â”‚ â€¢ Viewing your consumption and usage trends                                                â”‚  â”‚
â”‚ â”‚ â€¢ Explaining tariffs and charges                                                           â”‚  â”‚
â”‚ â”‚ â€¢ Finding answers in our knowledge center                                                  â”‚  â”‚
â”‚ â”‚ â€¢ Submitting meter readings                                                                â”‚  â”‚
â”‚ â”‚                                                                                            â”‚  â”‚
â”‚ â”‚ âš  I'm a read-only assistant â€” I can't make changes to your account or process payments.   â”‚  â”‚
â”‚ â”‚   For account changes, please visit Profile Settings.                                      â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ You: How much was my last bill?                                                           â”‚  â”‚
â”‚ â”‚                                                                                            â”‚  â”‚
â”‚ â”‚ Assistant: Your last invoice (INV-2026-0789) was EGP 1,250.00, issued on July 25, 2026.   â”‚  â”‚
â”‚ â”‚ It's due on August 15, 2026. Would you like to see the detailed breakdown?                â”‚  â”‚
â”‚ â”‚                                                                                            â”‚  â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                                                        â”‚  â”‚
â”‚ â”‚ â”‚ ðŸ“„ View Invoiceâ”‚                                                                        â”‚  â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                                        â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ You: Why is my bill higher than last month?                                               â”‚  â”‚
â”‚ â”‚                                                                                            â”‚  â”‚
â”‚ â”‚ Assistant: Your July bill (EGP 1,250.00) is EGP 150.00 higher than June (EGP 1,100.00).   â”‚  â”‚
â”‚ â”‚                                                                                            â”‚  â”‚
â”‚ â”‚ The main reason is increased consumption:                                                 â”‚  â”‚
â”‚ â”‚ â€¢ You used 450 kWh in July vs 380 kWh in June (+18%)                                      â”‚  â”‚
â”‚ â”‚ â€¢ The higher consumption pushed you into Tier 2 pricing for 50 kWh                        â”‚  â”‚
â”‚ â”‚ â€¢ No tariff rate changes occurred between periods                                         â”‚  â”‚
â”‚ â”‚                                                                                            â”‚  â”‚
â”‚ â”‚ Tips to reduce your bill:                                                                 â”‚  â”‚
â”‚ â”‚ â€¢ Peak usage was between 4-8 PM â€” consider shifting usage to off-peak                     â”‚  â”‚
â”‚ â”‚ â€¢ Your AC usage increased 30% â€” check for efficiency                                      â”‚  â”‚
â”‚ â”‚                                                                                            â”‚  â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                              â”‚  â”‚
â”‚ â”‚ â”‚ ðŸ“Š View Analytics  â”‚  â”‚ ðŸ“‹ Usage Tips     â”‚                                              â”‚  â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                              â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                               â”‚
â”‚ Type your question here...                                              [Send]  [ðŸŽ¤]         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 5: AI CUSTOMER ASSISTANT â€” GOVERNANCE

### 5.1 Assistant Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **CA-1** | Read-only â€” cannot execute any mutations | Application guard on all actions |
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
| Account balance | CustomerLedgerEntry + Invoice | âœ… |
| Invoice details | Invoice + InvoiceItem + InvoiceTax | âœ… |
| Payment history | Payment + PaymentTransaction | âœ… |
| Consumption data | Reading (time-series) | âœ… |
| Usage comparison | Reading aggregated by period | âœ… |
| Bill explanation | Invoice + Tariff + Rates | âœ… |
| Tariff information | Tariff + TariffVersion + Rates | âœ… |
| Estimated next bill | Historical consumption Ã— current tariff | âœ… |
| Knowledge articles | KnowledgeArticle (filtered) | âœ… |
| FAQ answers | KnowledgeArticle where category=FAQ | âœ… |
| Service request status | ServiceRequest | âœ… |
| Appointment info | ServiceRequest where scheduled | âœ… |

### 5.3 Escalation Flow

```
Customer Query
    â”‚
    â”œâ”€â”€ AI Assistant can answer with confidence > 0.85
    â”‚   â†’ Answer directly with evidence links
    â”‚
    â”œâ”€â”€ AI Assistant can answer with confidence 0.50-0.85
    â”‚   â†’ Answer + suggest related articles + offer escalation
    â”‚
    â””â”€â”€ AI Assistant cannot answer or confidence < 0.50
        â†’ Apologize + offer to create support ticket
        â†’ Pre-fill ticket form with conversation context
        â†’ Escalate to human agent
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
  - Default: browser detection â†’ CustomerPreference override

Translation coverage:
  Phase 1: Core pages (Dashboard, Invoices, Payments, Profile) â€” 500+ keys
  Phase 2: Analytics, Service Requests, Knowledge Center â€” 300+ keys
  Phase 3: AI Assistant responses â€” dynamic, but UI labels static
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
| **AA** | Contrast ratio â‰¥ 4.5:1 | Design tokens enforce contrast |
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
| C13 Financial | Invoiceâ†’GL, revenue data (future) | W01-W07 |

### 8.2 BFF Endpoints (New â€” customer-specific)

| Endpoint | Purpose | Aggregates |
|----------|---------|------------|
| `GET /api/customer/dashboard` | Portal dashboard data | Customer + Invoices + Payments + Readings + Notifications |
| `GET /api/customer/consumption` | Usage analytics | Readings aggregated by period |
| `GET /api/customer/bill-explanation/:id` | Breakdown + explanation | Invoice + Items + Tax + Tariff + Usage comparison |
| `GET /api/customer/estimated-bill` | Next bill projection | Current consumption Ã— tariff rate |
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

## PART 9: TESTING STRATEGY â€” C14 (120 Tests)

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
| 1 | Login with valid credentials â†’ dashboard | Redirect |
| 2 | Login with invalid credentials â†’ error | Error shown |
| 3 | MFA challenge on MFA-enabled accounts | Code prompt |
| 4 | Invalid MFA code â†’ error | Error shown |
| 5 | Forgot password â†’ reset email sent | Email sent |
| 6 | Password reset â†’ new password works | Login succeeds |
| 7 | Session expiry â†’ redirect to login | Auto-redirect |
| 8 | Unauthenticated access â†’ login page | Guard |
| 9 | Delegate login â†’ limited access | Scoped permissions |
| 10 | Logout â†’ session destroyed | Clean state |

### 9.3 Online Payment Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Pay full invoice â†’ payment processed | Success |
| 2 | Pay partial amount â†’ partial payment | Partial |
| 3 | Pay multiple invoices â†’ batch allocation | All paid |
| 4 | Payment fails â†’ error + retry option | Graceful |
| 5 | Payment gateway redirect â†’ returns to portal | Correct redirect |
| 6 | Payment history â†’ new payment appears | Real-time update |
| 7 | Auto-pay enrollment â†’ preference saved | Updated |
| 8 | Receipt download â†’ valid PDF | Downloadable |
| 9 | Zero invoice â†’ disabled pay button | Guard |
| 10 | Already paid â†’ shows "paid" status | Correct state |

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
| 8 | Zero consumption period â†’ chart handles | Graceful |
| 9 | Multi-meter â†’ per-property consumption | Property filter |

### 9.5 Multi-Language Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | English â†’ all UI text in English | Correct locale |
| 2 | Arabic â†’ all UI text in Arabic (RTL) | Correct locale |
| 3 | Switch language â†’ persistent preference | Saved |
| 4 | RTL layout â†’ correct alignment | Right-aligned |
| 5 | RTL charts â†’ correct axis orientation | Flipped |
| 6 | Arabic numbers â†’ Hindi numerals | Locale-aware |
| 7 | Missing translation â†’ fallback to English | Graceful |
| 8 | Date format â†’ locale-appropriate | dd/mm/yyyy vs yyyy/mm/dd |
| 9 | Currency format â†’ locale-appropriate | Symbol placement |
| 10 | AI Assistant responds in selected language | Matched locale |

### 9.6 Responsive Design Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Desktop 1920px â†’ full layout | Sidebar visible |
| 2 | Desktop 1366px â†’ full layout | Sidebar visible |
| 3 | Tablet 1024px â†’ collapsed sidebar | Hamburger menu |
| 4 | Tablet 768px â†’ stacked cards | Single column |
| 5 | Mobile 375px â†’ bottom navigation | Mobile nav |
| 6 | Mobile 414px â†’ bottom navigation | Mobile nav |
| 7 | Zoom to 200% â†’ all content accessible | No overlap |
| 8 | Keyboard navigation â†’ focus visible | Tab order |
| 9 | Screen reader â†’ ARIA labels present | All interactive |
| 10 | Touch targets â‰¥ 44px â†’ all buttons pass | No tiny buttons |

### 9.7 AI Assistant Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | "How much is my bill?" â†’ correct response | Reads invoice amount |
| 2 | "Why is my bill high?" â†’ explanation with reasons | Analyzes usage |
| 3 | "Pay my bill" â†’ redirect to payment (no auto-action) | Read-only enforced |
| 4 | Unknown question â†’ offer escalation | Handoff |
| 5 | Arabic question â†’ Arabic response | Language match |
| 6 | Empty query â†’ prompt for input | Guidance |
| 7 | Rapid consecutive queries â†’ rate limited | 10/min |
| 8 | All responses include confidence | Transparency |
| 9 | Conversation history in session | Context retained |
| 10 | Escalate to ticket â†’ pre-filled form | Context carried |

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
C14 â€” CUSTOMER EXPERIENCE & SELF-SERVICE PLATFORM
CERTIFICATION CHECKLIST

â–¡ PORTAL PAGES â€” 7 SECTIONS COMPLETE
   â–¡ Dashboard (balance, due date, quick actions, activity)
   â–¡ Invoices & Billing (list, detail, PDF, pay, history, statements)
   â–¡ Consumption Analytics (daily/weekly/monthly charts, comparison, cost)
   â–¡ Profile & Settings (info, password, MFA, notifications, language)
   â–¡ Service & Support (reading submit, requests, complaints, disputes, appointments)
   â–¡ Knowledge Center (FAQ, articles, search, guides)
   â–¡ AI Customer Assistant (read-only chat, explainable, escalation)

â–¡ NEW MODELS â€” 5 CREATED
   â–¡ CustomerPreference (communication + portal preferences)
   â–¡ DelegatedAccess (family/delegate account access)
   â–¡ ServiceRequest (customer service requests)
   â–¡ ServiceRequestMessage (conversation thread)
   â–¡ CustomerDocument (customer-facing documents)

â–¡ AUTHENTICATION â€” C12 INTEGRATION
   â–¡ Login + MFA (existing C12 auth reused)
   â–¡ Forgot password / reset flow
   â–¡ Delegate access (scoped permissions)
   â–¡ Session management

â–¡ ONLINE PAYMENT
   â–¡ Pay single invoice
   â–¡ Pay partial amount
   â–¡ Batch payment (multi-invoice)
   â–¡ Auto-pay enrollment
   â–¡ Receipt download
   â–¡ Payment history

â–¡ CONSUMPTION ANALYTICS
   â–¡ Daily usage chart (bar)
   â–¡ Monthly trend (line)
   â–¡ Year-over-year comparison
   â–¡ Cost analysis
   â–¡ CSV data export
   â–¡ High-consumption alerting

â–¡ MULTI-LANGUAGE â€” ARABIC + ENGLISH
   â–¡ Full RTL support for Arabic
   âœ… 500+ translation keys (core)
   â–¡ Language persisted in preferences
   â–¡ Locale-aware dates, numbers, currency

â–¡ RESPONSIVE DESIGN â€” 3 BREAKPOINTS
   â–¡ Desktop (1024px+)
   â–¡ Tablet (768-1024px)
   â–¡ Mobile (< 768px, browser only)
   â–¡ Touch-friendly targets (44px)
   â–¡ WCAG AA compliance

â–¡ AI CUSTOMER ASSISTANT
   â–¡ Read-only â€” no autonomous actions
   â–¡ Account balance + invoice queries
   â–¡ Consumption + usage comparison queries
   â–¡ Bill explanation requests
   â–¡ Confidence-gated responses
   â–¡ Human escalation flow
   â–¡ Audit logging

â–¡ INTEGRATIONS
   â–¡ C12 Identity (auth, RBAC, MFA)
   â–¡ Customer service (existing)
   âœ… Invoice + Payment (existing)
   âœ… Reading + Meter (existing)
   âœ… Tariff (existing)
   âœ… Notification (existing)
   â–¡ C13 Financial (future â€” bill explanation with GL data)

â–¡ SECURITY
   â–¡ Row-level security (customer sees own data only)
   â–¡ Delegated access with scoped permissions
   â–¡ AI Assistant read-only enforcement
   â–¡ All actions audited
   â–¡ Rate limiting on API endpoints

â–¡ TESTS â€” 120 PASSING
   â–¡ Portal rendering: 25 tests
   â–¡ Authentication: 15 tests
   â–¡ Online payment: 15 tests
   â–¡ Consumption analytics: 15 tests
   â–¡ Multi-language: 15 tests
   â–¡ Responsive design: 15 tests
   â–¡ AI Assistant: 10 tests
   â–¡ Integration: 10 tests

C14 STATUS: â–¡ NOT IMPLEMENTED
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
C12 Identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
C01-C10 Connectivity â”€â”€â”€â”€â”¤
C13 Financial (future) â”€â”€â”¤
Customer service (exist) â”€â”¤
Invoice + Payment â”€â”€â”€â”€â”€â”€â”€â”€â”¤
Reading + Meter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
Notification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
KnowledgeArticle â”€â”€â”€â”€â”€â”€â”€â”€â”¤
Ticket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
                          â–¼
               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
               â”‚  C14 CUSTOMER       â”‚
               â”‚  PORTAL (Web Only)  â”‚
               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚
                     â”œâ”€â”€â†’ Customer Portal Service (aggregation)
                     â”œâ”€â”€â†’ Consumption Analytics
                     â”œâ”€â”€â†’ Bill Explanation Engine
                     â”œâ”€â”€â†’ AI Customer Assistant
                     â”œâ”€â”€â†’ 8 frontend portal pages
                     â””â”€â”€â†’ 5 new models
```

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C14 â€” Customer Experience & Self-Service Platform (Web Only). READ ONLY. GOVERNANCE PLANNING ONLY.*

