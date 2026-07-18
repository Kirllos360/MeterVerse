# 06 — Backend Integration Audit

**Date:** 2026-07-11
**Mode:** Read-Only Audit
**Scope:** Frontend ↔ NestJS ↔ Prisma ↔ REST API integration readiness

---

## 1. Architecture Overview

```
Frontend (Next.js 14)
  ├── V1: src/lib/api/http-client.ts → backend.ts → hooks/*.ts (mock)
  ├── V2: src/v2/lib/api/client.ts → repositories/*.ts → query/*.ts (mock)
  └── Both: All data currently returns mock, no real API calls
         ↓
Backend (NestJS 10, port 3001)
  ├── 47 domain modules + 13 common modules + 5 sub-modules = 65 modules
  ├── Controllers: 30+ REST controllers at /api/v1/*
  ├── Services: 60+ service files
  ├── Guards: GlobalAuthGuard, RolesGuard, PermissionsGuard, AreaGuard
  └── Prisma ORM
         ↓
PostgreSQL 16 (port 5433)
  ├── schema: sim_system (40 models)
  ├── schema: core (19 models)
  ├── schema: features (34 models)
  └── schema: area (36 models)
```

## 2. Integration Status by Entity

### 2.1 Customer Entity

| Layer | Status | Details |
|-------|--------|---------|
| Frontend V1 | MOCK | 3 mock customers via `useCustomersList()` |
| Frontend V2 | MOCK | 5 mock customers via `CustomerRepository` |
| Backend Controller | ✅ COMPLETE | `customers.controller.ts` — CRUD + search |
| Backend Service | ✅ COMPLETE | `customers.service.ts` + `customers.repository.ts` |
| Prisma Model | ✅ COMPLETE | `sim_system.Customer` + `area.AreaCustomer` |
| REST Endpoints | Defined | `GET /customers`, `GET /customers/:id`, `POST /customers`, `PUT /customers/:id`, `DELETE /customers/:id` |
| DTOs | ✅ COMPLETE | create-customer.dto.ts, update-customer.dto.ts, customer-response.dto.ts, search-customer-query.dto.ts |
| **Integration Gap** | ⚠️ | Frontend V1 `backend-client.ts` maps customers list/detail/create/update/delete endpoints, but V1/V2 return mock data. No real API call is ever made. |

### 2.2 Meter Entity

| Layer | Status | Details |
|-------|--------|---------|
| Frontend V1 | MOCK | 3 mock meters |
| Frontend V2 | MOCK | 5 mock meters |
| Backend Controller | ✅ COMPLETE | `meters.controller.ts` |
| Backend Service | ✅ COMPLETE | `meters.service.ts` + `meters.repository.ts` + `meter-state.service.ts` |
| Prisma Model | ✅ COMPLETE | `sim_system.Meter` + `area.AreaCustomerMeter` |
| REST Endpoints | Defined | `GET /meters`, `GET /meters/:id`, `POST /meters`, `POST /meters/assign`, `POST /meters/terminate` |
| DTOs | ✅ COMPLETE | 8 DTOs (create, update, response, query, assign, assignment, terminate, transition) |
| **Integration Gap** | ⚠️ | V2 `MeterRepository` has full child-entity accessors but backend equivalents exist only partially. |

### 2.3 Invoice Entity

| Layer | Status | Details |
|-------|--------|---------|
| Frontend V1 | MOCK | 2 mock invoices |
| Frontend V2 | MOCK | 5 mock invoices + InvoiceCommandCenter (602L) |
| Backend Controller | ✅ COMPLETE | `invoices.controller.ts` |
| Backend Service | ✅ COMPLETE | `invoice-query.service.ts`, `invoice-template.service.ts`, `invoice-renderer.service.ts` |
| Prisma Model | ✅ COMPLETE | `sim_system.Invoice`, `InvoiceLine`, `InvoiceAdjustment` + `features.BillingCycle` |
| REST Endpoints | Defined | `GET /invoices`, `GET /invoices/:id` (via billing) |
| **Integration Gap** | ⚠️ | V2 InvoiceCommandCenter has 10+ sections (line items, tariff breakdown, payment history, ledger, adjustments, notes, attachments, audit, approvals, workflow, chart, readings). Backend may not serve all these in a single endpoint. |

### 2.4 Payment Entity

| Layer | Status | Details |
|-------|--------|---------|
| Frontend V1 | MOCK | 1 mock payment |
| Frontend V2 | MOCK | 5 mock payments + PaymentWorkspace (610L) |
| Backend Controller | ✅ COMPLETE | `payments.controller.ts` |
| Backend Service | ✅ COMPLETE | `payments.service.ts` + `payments.repository.ts` + `payment-receipt.service.ts` |
| Prisma Model | ✅ COMPLETE | `sim_system.Payment`, `PaymentFee`, `Cheque`, `PaymentAllocation` |
| REST Endpoints | Defined | `GET /payments`, `PUT /payments/:id`, `POST /payments/:id/reverse` |
| **Integration Gap** | ⚠️ | V2 PaymentWorkspace has 12+ sections. Backend has fewer payment endpoints than needed for full display. |

### 2.5 Reading Entity

| Layer | Status | Details |
|-------|--------|---------|
| Frontend V1 | MOCK | 3 mock readings |
| Frontend V2 | MOCK | 5+ mock readings + ReadingWorkspace (636L) |
| Backend Controller | ✅ COMPLETE | `readings.controller.ts` |
| Backend Service | ✅ COMPLETE | `readings.service.ts` + `readings.repository.ts` + water-balance, polling sub-modules |
| Prisma Model | ✅ COMPLETE | `sim_system.Reading`, `ReadingReview` + `area.AreaMeterReading` |
| REST Endpoints | Defined | `GET /readings`, `GET /readings/:id`, `POST /readings` + review/validate/approve/upload |
| **Integration Gap** | ⚠️ | V2 ReadingWorkspace includes neighbor comparison, weather correlation, AI predictions — none of which exist in backend. Frontend features exceed backend capability. |

### 2.6 Enterprise Admin

| Layer | Status | Details |
|-------|--------|---------|
| Frontend V1 | N/A | No V1 enterprise admin |
| Frontend V2 | MOCK | 19 modules, 766L, 100+ mock records |
| Backend Controller | ❌ MISSING | No enterprise controller |
| Backend Service | ❌ MISSING | No enterprise service |
| Prisma Model | ❌ MISSING | No enterprise-specific models (projects/areas/users/roles/permissions/tariffs/bill-cycles are in core/sim_system schemas but not as unified "enterprise" domain) |
| REST Endpoints | ❌ MISSING | No enterprise API |
| **Integration Gap** | ❌ | Enterprise Admin Center has no backend counterpart at all. 19 modules would need new controllers, services, DTOs. |

### 2.7 Auth & Security

| Layer | Status | Details |
|-------|--------|---------|
| Frontend | ⚠️ PARTIAL | `http-client.ts` has `setToken()`, `backend-client.ts` has `auth.login()`. No auth pages exist. |
| Backend | ✅ COMPLETE | JWT auth, refresh tokens, 5 guards, password policy, login attempts |
| **Integration Gap** | ⚠️ | Frontend never calls auth endpoints. No login/session UI. Backend auth is fully ready but disconnected. |

### 2.8 Other Entities

| Entity | Frontend | Backend | Prisma | Gap |
|--------|----------|---------|--------|-----|
| Tariff | V1 TariffStudio (mock) | `tariff-studio.service.ts` (partial) | `features.Tariff`, `TariffVersion`, `TariffCharge`, `TariffChargeDetail` | ⚠️ |
| Bill Cycle | V2 Enterprise (mock) | `bill-cycle.controller.ts` | `features.BillingCycle` + sub-models | ⚠️ |
| Collections | V1 CollectionDashboard (mock) | `collections.service.ts` | `area.AreaCollectionAction` | ⚠️ |
| Wallet | None | `wallet.service.ts` | `features.WalletAccount` + sub-models | ❌ No frontend |
| Solar | None | `solar-wallet.service.ts` | `area.AreaSolarWalletTransaction` | ❌ No frontend |
| Chilled Water | None | `chilled-water.service.ts` | `features.ChilledWater*` (5 models) | ❌ No frontend |
| Gas | None | `gas.controller.ts` | `features.GasReading` | ❌ No frontend |
| SIM Cards | None | `sim-cards.service.ts` | `sim_system.SIMCard`, `SIMAssignment` + area | ❌ No frontend |
| Reports | None | `reports.service.ts` | `sim_system.ReportJob`, `features.ReportDefinition` | ❌ No frontend |
| Notifications | V1 Toast/notification | `notifications.service.ts` | `sim_system.Notification` | ⚠️ |
| KPI/Dashboard | V1 FinancialDashboard | `kpi.service.ts` | Computed from models | ⚠️ |
| Settings | V2 settings route (placeholder) | `settings.service.ts` | `sim_system.SystemSetting`, `core.CoreSystemConfig` | ⚠️ |

---

## 3. API Contract Coverage

### 3.1 Defined in API Spec (meter-pulse-api.yaml)

The external OpenAPI 3.1.0 spec at `docs/previous-plans/specs/001/contracts/meter-pulse-api.yaml` defines:

| Tag | Operations | Status |
|-----|-----------|--------|
| Health | `healthCheck` | ✅ Backend has health check |
| Meters | `assignMeter` | ✅ Backend controller |
| Billing | (Implied in backend) | ✅ Multiple controllers |
| Payments | (Implied) | ✅ Backend controller |
| Readings | (Implied) | ✅ Backend controller |
| Reports | (Implied) | ✅ Backend controller |
| SIM | (Implied) | ✅ Backend controller |
| Statements | (Implied) | ✅ Backend controller |
| System | (Implied) | ✅ Backend controller |

### 3.2 Contract Tests (`test/contract/` — 12 files)

| Test File | Entity | Status |
|-----------|--------|--------|
| `meter-assign.contract.spec.ts` | Meter | ✅ |
| `meter-terminate.contract.spec.ts` | Meter | ✅ |
| `sim-eligibility.contract.spec.ts` | SIM | ✅ |
| `reading-create.contract.spec.ts` | Reading | ✅ |
| `reading-review-queue.contract.spec.ts` | Reading | ✅ |
| `invoice-generate.contract.spec.ts` | Invoice | ✅ |
| `invoice-issue.contract.spec.ts` | Invoice | ✅ |
| `invoice-adjustment.contract.spec.ts` | Invoice | ✅ |
| `payments.contract.spec.ts` | Payment | ✅ |
| `statement.contract.spec.ts` | Customer | ✅ |
| `setup.ts` / `setup.spec.ts` | Infrastructure | ✅ |

---

## 4. Integration Readiness Score

| Entity | Backend Readiness | Frontend Readiness | Integration Status | Priority |
|--------|-------------------|--------------------|--------------------|----------|
| Customer | ✅ 100% | ⚠️ 50% (mock only) | 🔴 Not wired | P0 |
| Meter | ✅ 100% | ⚠️ 50% (mock only) | 🔴 Not wired | P0 |
| Invoice | ✅ 90% | ⚠️ 50% (mock only) | 🔴 Not wired | P0 |
| Payment | ✅ 90% | ⚠️ 50% (mock only) | 🔴 Not wired | P0 |
| Reading | ✅ 100% | ⚠️ 50% (mock only) | 🔴 Not wired | P0 |
| Auth | ✅ 100% | ⚠️ 10% (no pages) | 🔴 Not wired | P0 |
| Tariff | ✅ 70% | ⚠️ 40% (mock only) | 🔴 Not wired | P1 |
| Bill Cycle | ✅ 60% | ⚠️ 20% (in enterprise) | 🔴 Not wired | P1 |
| Collections | ✅ 60% | ⚠️ 30% (mock only) | 🔴 Not wired | P1 |
| Reports | ✅ 80% | ❌ 0% (no frontend) | 🔴 Not wired | P2 |
| Wallet | ✅ 80% | ❌ 0% (no frontend) | 🔴 Not wired | P2 |
| Solar | ✅ 60% | ❌ 0% (no frontend) | 🔴 Not wired | P2 |
| Chilled Water | ✅ 80% | ❌ 0% (no frontend) | 🔴 Not wired | P2 |
| SIM Cards | ✅ 80% | ❌ 0% (no frontend) | 🔴 Not wired | P2 |
| Notifications | ✅ 70% | ⚠️ 30% (V1 only) | 🔴 Not wired | P2 |
| KPI/Dashboard | ✅ 70% | ⚠️ 30% (mock only) | 🔴 Not wired | P2 |
| Enterprise Admin | ❌ 10% | ⚠️ 60% (mock only) | 🔴 No backend yet | P1 |
| Settings | ✅ 70% | ⚠️ 10% (placeholder) | 🔴 Not wired | P2 |

**Overall Integration Score: 0%** — No frontend component makes a real API call to the backend. All data is mock.

---

## 5. Specific Gaps

### 5.1 Missing API Endpoints (Frontend needs, Backend doesn't have)

1. `GET /enterprise/*` — Enterprise admin needs 19 entity endpoints (none exist)
2. `GET /customers/:id/full` — V1 CustomerWorkspace uses `useCustomerFull()` which aggregates 7 entity types in a single hook
3. `GET /invoices/:id/command-center` — V2 InvoiceCommandCenter needs 10+ sections from a single endpoint
4. `GET /payments/:id/workspace` — V2 PaymentWorkspace needs 12+ sections
5. `GET /readings/:id/workspace` — V2 ReadingWorkspace needs neighbor/weather/AI data (backend doesn't have these)
6. `GET /dashboard/full` — V2 Dashboard needs KPI + area metrics + revenue trend + system health + events + alerts + incidents + pipeline + schedule + zones + heatmap + trends

### 5.2 Frontend Over-Build (features backend cannot serve)

1. **Reading AI predictions** — `ReadingWorkspace` shows anomaly predictions and weather correlation; backend has no such service
2. **Payment risk flags** — `PaymentWorkspace` shows risk flags; backend has no payment risk engine
3. **Neighbor comparison for readings** — Backend has no neighbor data model
4. **Enterprise Admin 19 modules** — Backend has no enterprise controller or unified enterprise API

### 5.3 Authentication Disconnect

Backend has full JWT auth with refresh tokens, role/permission guards, area-scoped access. Frontend has no login page, no token management UI, no session handling. The `setToken()` function exists but is never called.
