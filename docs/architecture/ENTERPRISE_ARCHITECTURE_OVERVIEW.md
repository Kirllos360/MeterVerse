# MeterVerse Enterprise Architecture Overview

**Author:** Enterprise Chief Architect  
**Date:** 2026-07-23  
**Status:** LIVE — Both systems operational

---

## System Context

MeterVerse is a dual-product enterprise utility billing platform:

- **System A**: Enterprise Admin — Configuration, business rules, billing engine, monitoring
- **System B**: User Workspace — Daily operations, customer/meter/reading/invoice/payment management

Both systems share a common core and run as a single deployment differentiated by authentication scope and UI routing.

---

## Layer-by-Layer Architecture

### Business Layer

| Domain | System A (Admin) | System B (User) | Shared |
|--------|-----------------|-----------------|--------|
| Customer Management | ✅ CRUD + Export + Detail | ✅ Dashboard list | Customer model |
| Meter Management | ✅ CRUD + Export + Detail | ✅ Dashboard list | Meter model |
| Reading Collection | ✅ CRUD + Bulk Import | ✅ Dashboard view | Reading model |
| Invoice Generation | ✅ Generate + CRUD + Export | ✅ Dashboard view | Invoice model |
| Payments | ✅ CRUD + Export | ✅ Dashboard view | Payment model |
| Contract Management | ✅ Via domain CRUD | ❌ Not exposed | Contract model |
| Billing Engine | ✅ billing-engine.js | Uses same | ChargeRule + BillRun |
| Tariff Management | ✅ Via domain CRUD | ❌ Not exposed | Tariff model |
| Task Management | ❌ Not implemented | ❌ Not implemented | — |
| Search | ❌ Not implemented | ❌ Not implemented | — |
| Command Palette | ❌ Not implemented | ❌ Not implemented | — |
| Document Management | ✅ StoredFile model | ❌ No UI | StoredFile |
| AI Assistant | ✅ /api/ai route | ❌ Not wired | ai-engine service |

### Database Layer (78 Models)

```
Core Business: Customer, Meter, Reading, Invoice, Payment, Contract
Billing:       Tariff, TariffRate, TariffTier, ChargeRule, BillRun, InvoiceItem
Auth:          User, Role, Permission, PermissionOnRole, Session, ApiKey
Monitoring:    AuditEntry, ActivityStream, Alert, AlertRule
Comms:         Notification, NotificationTemplate, EmailLog, SmsLog
Config:        SystemSetting, FeatureFlag, BrandingConfig, License
Runtime:       QueueJob, ScheduledTask, CacheEntry, Webhook
Reports:       ReportDefinition, KpiDefinition, KpiSnapshot
Collections:   CollectionCase, CollectionAction, PromiseToPay
SLA:           SLA, SLABreach, SLAEscalation, GroupSLA
Groups:        CustomerGroup, GroupMember, GroupPricing
Validation:    ValidationRule, ValidationResult
Workflow:      WorkflowState, WorkflowTransition
```

**Indexes:** 68 @@index directives across 39 models  
**Uniques:** 22 constraints (11 @unique + 11 @@id)

### Backend Layer (17 Route Files)

```
/api/auth         — Shared login (system_type: admin/user/mobile)
/api/customers    — CRUD + Export + Stats
/api/meters       — CRUD + Export + Detail with readings
/api/readings     — CRUD + Bulk + Export
/api/invoices     — CRUD + Generate + Export
/api/payments     — CRUD + Export
/api/contracts    — Via domain CRUD
/api/notifications — User notifications + Template admin
/api/alerts       — Alert list + resolve
/api/monitor      — Health + Prometheus metrics
/api/admin        — 58 endpoints for system configuration
/api/services     — 29 endpoints for integrations
/api/security     — Session + API key management
/api/reports      — 15 endpoints for reporting
/api/ai           — AI assistant endpoint
/api/domain       — Generic CRUD for 18 domain entities
/api/business     — Business rules execution
```

**Total: 179+ endpoints**  
**Auth:** 17/17 route files have authentication  
**Permissions:** 5 core route files use requirePermission()  
**Validation:** 15/17 route files use Zod

### Frontend Admin Layer (53 Pages)

```
Uses: GenericAdminPage on 46/53 pages (87% penetration)
Detail pages: 7 (customers, meters, invoices, readings, payments, contracts, assignments)
Dashboard: admin/dashboard entry point
```

### Frontend User Layer (19 Dashboard Pages)

```
Pages: overview, customers, meters, readings, invoices, billing, payments, 
       notifications, settings, profile, workspace, workspaces, product,
       forms, elements, kanban, chat, react-query, exclusive
```

### Runtime Layer

```
Middleware:    authenticate, requirePermission, auditLog, trackRequest, errorHandler
Services:      auth-engine, notification-engine, email-engine, sms-engine,
               billing-engine, validation-engine, alert-engine, kpi-engine,
               ai-engine, crud-service, business-engine
Jobs:          
Events:        auditLog → processEvent → notification dispatch
Caching:       CacheEntry model, express-rate-limit
```

### Security Layer

```
Authentication: JWT with system_type scope (admin/user/mobile)
Authorization:  requireRole() → requirePermission() migration in progress (5/17 routes)
Account Protection: 5 failed attempts = 15min lockout
Password Policy:  8+ chars, uppercase, lowercase, number, special char
MFA:              MFA placeholder in auth-engine
Session Tracking: Session records created on login, Prisma Session model
```

### Infrastructure

```
Database:  PostgreSQL 16 on localhost:5433 (meter_pulse)
Backend:   Express.js on port 3001
Frontend:  Next.js 16 on port 7400
ORM:       Prisma 6.x with 78 models
Auth:      JWT (jsonwebtoken) + bcrypt
CI/CD:     GitHub Actions (ci.yml, enterprise-review.yml, codeql.yml)
```

---

## Shared Components (Single Source of Truth)

| Component | Description |
|-----------|-------------|
| **auth-engine.js** | Single login engine. system_type param determines admin/user/mobile scope |
| **auth.js route** | Single /api/auth/login endpoint. Applications differentiate by system_type |
| **security.js** | Single requirePermission() middleware with role-based wildcard matching |
| **prisma/schema.prisma** | Single database schema — 78 models |
| **notification-engine.js** | Event-driven dispatch to in_app, email, SMS channels |
| **auditLog()** | Every API call logged to AuditEntry |
| **trackRequest()** | Every API call tracked to ActivityStream |
| **Graphiti** | Single knowledge graph — 118 nodes, 103 edges |
| **SpecKit** | Single validation framework — 7 categories |
| **Planning OS** | Single planning system — 8 phases, 35 tasks, 162 steps |

---

## Architecture Health Assessment

### Strengths
- Shared auth system with proper system_type separation
- 87% GenericAdminPage penetration — consistent admin UI
- All routes authenticated and audited
- Knowledge graph populated with actual architecture
- 68 database indexes for query performance
- Planning OS covers 8 phases with 3,452 planning documents

### Risks
1. **User Workspace incomplete**: Tasks, Search, Command Palette, Documents UI missing
2. **Permission migration incomplete**: Only 5/17 route files use requirePermission()
3. **No user-facing BFF**: Dashboard pages call admin API directly
4. **No multi-tenancy**: Organization model exists but not enforced
5. **Email not actually sending**: SMTP config requires environment variables
6. **No real-time updates**: No WebSocket/Socket.IO for live meter data
7. **No mobile API**: System B mobile type defined but no mobile-specific endpoints

### Architecture Rules (Immutable)
1. Never duplicate shared components — always extend
2. Every feature must exist inside the Enterprise Vision
3. System A and System B must never diverge at the shared layer
4. Graphiti must be updated before any phase can complete
5. SpecKit must pass before any step can complete
6. Permission keys must exist before any new endpoint is created

---

## Impact Analysis Template (Mandatory Before Any Change)

Before implementing any feature, complete this analysis:

| Dimension | Assessment |
|-----------|-----------|
| Files affected | |
| Dependencies | |
| Graph changes | |
| Spec changes | |
| Planning changes | |
| Database changes | |
| Frontend Admin changes | |
| Frontend User changes | |
| Backend changes | |
| Testing changes | |
| Deployment changes | |
| Documentation changes | |
| Security impact | |
| Performance impact | |
| Scaling impact | |
| Future Wave impact | |

---

*This document is the single source of truth for architecture decisions.*
*No implementation may proceed without updating this document first.*
