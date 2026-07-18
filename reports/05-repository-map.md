# 05 — Repository Map

**Date:** 2026-07-11
**Mode:** Read-Only Audit
**Scope:** All data access layers (V1 API hooks, V2 repositories)

---

## 1. V1 Data Layer

### 1.1 HTTP Client (`lib/api/http-client.ts`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `api.get<T>(path)` | GET | Fetch with JSON response |
| `api.post<T>(path, body?)` | POST | Create |
| `api.put<T>(path, body)` | PUT | Full update |
| `api.patch<T>(path, body)` | PATCH | Partial update |
| `api.delete<T>(path)` | DELETE | Remove |
| `api.upload<T>(path, formData)` | POST | File upload (FormData) |

**Features:** Bearer token, X-Correlation-ID, error envelope `{ error: { code, message } }`

### 1.2 Backend Endpoints (`lib/api/backend-client.ts`)

| Group | Endpoints | Type |
|-------|-----------|------|
| `auth` | login | POST `/auth/login` |
| `customers` | list, detail, create, update, delete | CRUD `/customers` |
| `meters` | list, detail | GET `/meters` |
| `invoices` | list, detail | GET `/invoices` |
| `payments` | list | GET `/payments` |
| `dashboard` | summary | GET `/dashboard/summary` |

**Status:** Minimal endpoint coverage, all return `any` type, no DTO validation.

### 1.3 Mock Data (`lib/api/mock-data.ts`)

| Entity | Records | Quality |
|--------|---------|---------|
| Projects | 3 | Simple objects |
| Units | 3 | Simple objects |
| Customers | 3 | 2 active, 1 suspended |
| Meters | 3 | 2 active, 1 faulty |
| Readings | 3 | 2 approved, 1 suspicious |
| Invoices | 2 | 1 paid, 1 overdue |
| Payments | 1 | Completed, cash |
| Ledger | 3 | 3 entries |
| SIM Cards | 2 | 1 assigned, 1 available |

**Status:** Minimal, used only by V1 domain components. 3 customers is insufficient for realistic testing.

### 1.4 V1 Hooks (`lib/api/hooks.ts`, `hooks-customers.ts`, `hooks-financial.ts`)

| Hook File | Hooks | Data Source | Pattern |
|-----------|-------|-------------|---------|
| `hooks.ts` | 13 hooks | `mock-data.ts` | `useMemo` wrappers, returns `{ data, loading: false, error: null }` |
| `hooks-customers.ts` | 3 hooks | `mock-data.ts` | Same + customer health score |
| `hooks-financial.ts` | 10 hooks | `mock-data.ts` | Same + hardcoded tariffs (3), collections aging (5 buckets) |

**Consumers:**
| Component | Hooks Used |
|-----------|------------|
| UnitExplorer | `useUnitsList()` |
| MeterExplorer | `useMetersList()` |
| MeterDetail | `useMeterDetail()`, `useMeterReadings()` |
| CustomerExplorer | `useCustomersList()` |
| CustomerDetail | `useCustomerDetail()`, `useCustomerLedger()` |
| CustomerWorkspace | `useCustomerFull()` |
| ReadingExplorer | `useReadingsList()` |
| InvoiceExplorer | `useInvoicesList()` |
| InvoiceWorkspace | `useInvoiceDetail()` |
| PaymentExplorer | `usePaymentsList()` |
| PaymentWorkspace | `usePaymentDetail()` |
| FinancialDashboard | `useFinancialDashboard()`, `useCollectionsData()` |
| TariffStudio | `useTariffsList()` |
| CollectionDashboard | `useCollectionsData()` |

---

## 2. V2 Data Layer

### 2.1 ApiClient (`v2/lib/api/client.ts`)

| Property | Value |
|----------|-------|
| **Class** | `ApiClient` (134 lines) |
| **Singleton** | `api` |
| **Features** | Bearer token refresh, retry with backoff, timeout, AbortSignal merging |

### 2.2 Query Framework (`v2/lib/query/`)

| File | Lines | Exports | Description |
|------|-------|---------|-------------|
| `client.ts` | 177 | `QueryClient` (class), `useQuery`, `useMutation`, `queryClient` | Custom query framework: in-flight dedup, cache-first with stale/fresh, retry, subscriber notification |
| `cache.ts` | 71 | `CacheManager`, `queryCache` | Entry-level TTL, fresh/stale/expiry lifecycle, invalidation listeners |
| `index.ts` | 76 | `useCustomers`, `useCustomer`, `useCustomerInvoices`, `useCustomerPayments`, `useCustomerMeters`, `useCustomerAlerts`, `useCustomerAudits`, `useCreateCustomer`, `useMeters`, `useMeter`, `useMeterReadings`, `useMeterAlarms`, `useInvoices`, `useInvoice`, `usePayments`, `invalidateCustomers`, `invalidateCustomer`, `invalidateMeters`, `invalidateMeter`, `invalidateAll` | Entity query hooks — thin wrappers around QueryClient for Customers, Meters, Invoices, Payments |

### 2.3 Base Repository (`v2/repositories/base.ts`)

| Property | Value |
|----------|-------|
| **Class** | `BaseRepository<T>` (abstract, 121 lines) |
| **Methods** | `find()`, `findById(id)`, `search(query)`, `filter(criteria)`, `paginate(params)`, `count(criteria?)`, `exists(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `bulkCreate(data[])`, `bulkUpdate(updates[])`, `bulkDelete(ids[])` |
| **Cache** | Integrated with `RepositoryCache` |

### 2.4 Entity Repositories (`v2/repositories/index.ts`)

| Repository | Lines | Methods | Overrides Mock Data | Consumers |
|------------|-------|---------|-------------------|-----------|
| `CustomerRepository` | Inline | Base + getInvoices, getPayments, getMeters, getAlerts, getAudits | `mockCustomers`, `mockCustomerInvoices`, `mockCustomerPayments`, `mockCustomerMeters`, `mockAlerts`, `mockAudits` | `useCustomers`, `useCustomer`, `useCustomerInvoices` |
| `MeterRepository` | Inline | Base + getReadings, getAlarms, getCommands, getComms, getWorkOrders, getMaintenance, getAudits | `mockMeters`, `mockMeterReadings`, `mockMeterAlarms`, `mockMeterCommands`, `mockMeterComms`, `mockMeterWorkOrders`, `mockMeterMaintenance`, `mockMeterAudits` | `useMeters`, `useMeter`, `useMeterReadings`, `useMeterAlarms` |
| `InvoiceRepository` | Inline | Base + getDetails | `mockInvoices`, `mockInvoiceDetails` | `useInvoices`, `useInvoice` |
| `PaymentRepository` | Inline | Base + getDetails, getAllocations, getBankTransactions, getCashierSessions, getLedger, getOutstanding, getRiskFlags, getTimeline, getAudit, getNotes, getAttachments, getMatchingLog, getReconciliation | `mockPayments`, `mockPaymentDetails` | `usePayments` |
| `ReadingRepository` | Inline | Base + getDetails, getValidations, getFlags, getAnomalies, getNeighborComparison, getWeatherCorrelation, getAIPredictions, getComparisons, getTimeline, getAudit, getNotes | `mockReadings`, `mockReadingDetails` | V2 ReadingWorkspace |
| `DashboardRepository` | Inline | getKPI, getAreaMetrics, getRevenueTrend, getCollectionRate, getSystemHealth, getUpcomingEvents, getAlerts, getActivities, getIncidents, getJobs, getApprovals, getPipeline, getSchedule, getInfrastructureZones, getHeatmap, getTrends | `mockDashboardData`, `mockOperatingCenterData` | Dashboard |

### 2.5 Enterprise Repository (`v2/repositories/enterprise.ts`)

| Property | Value |
|----------|-------|
| **Class** | `EnterpriseRepository` (25 lines) |
| **Methods** | getProjects, getAreas, getUsers, getRoles, getPermissions, getTariffs, getBillCycles, getChargeEngines, getHolidays, getTemplates, getIntegrations, getApiKeys, getSystemHealth, getAuditLogs, getFeatureFlags, getConfigEntries, getRuntimeMetrics, getQueueItems, getJobs |
| **Data** | All from `enterprise-mock.ts` (100+ records, 19 entities) |
| **Consumers** | `EnterpriseAdminCenter` |

### 2.6 Repository Cache (`v2/repositories/cache.ts`)

| Property | Value |
|----------|-------|
| **Class** | `RepositoryCache` (41 lines) |
| **Features** | Map-based cache with TTL, invalidation, pattern-based clear |
| **Key builders** | `entityKey(type, id)`, `listKey(type)`, `searchKey(type, query)` |

---

## 3. Repository Comparison: V1 vs V2

| Aspect | V1 | V2 |
|--------|-----|-----|
| Pattern | Hooks that return mock data via `useMemo` | Repository pattern with abstract base + entity-specific repos |
| Mock Data | Minimal (3-5 records per entity) | Rich (5 customers, 5 meters, full sub-entity trees) |
| API Client | Simple fetch wrapper | Feature-rich (retry, timeout, token refresh) |
| Query Framework | None (synchronous mock) | Custom QueryClient with cache, dedup, stale/fresh |
| Backend Ready? | Hooks are synchronous mocks only | Repository pattern designed for backend swap |
| Cache | None | RepositoryCache with TTL + invalidation |
| Type Safety | `any` return from backend-client | Strongly typed via model interfaces |

---

## 4. Backend Readiness Matrix

| Frontend Entity | Backend Module | Prisma Model | API Controller | API Service | REST Endpoints | Readiness |
|----------------|----------------|--------------|----------------|-------------|----------------|-----------|
| Customer | `customers/` | `Customer` | `customers.controller.ts` | `customers.service.ts` | `GET/POST/PUT/DELETE /customers` | ✅ COMPLETE |
| Meter | `meters/` | `Meter` | `meters.controller.ts` | `meters.service.ts` | `GET/POST /meters` | ✅ COMPLETE |
| Invoice | `invoices/` | `Invoice` | `invoices.controller.ts` | `invoice-query.service.ts` | `GET /invoices` | ✅ COMPLETE |
| Payment | `payments/` | `Payment` | `payments.controller.ts` | `payments.service.ts` | `GET /payments` | ✅ COMPLETE |
| Reading | `readings/` | `Reading` | `readings.controller.ts` | `readings.service.ts` | `GET/POST /readings` | ✅ COMPLETE |
| Project | `projects/` | `Project` | `projects.controller.ts` | `projects.service.ts` | `GET/POST/PUT /projects` | ✅ COMPLETE |
| User | `users/` | `CoreUser` | `users.controller.ts` | `users.service.ts` | `GET/POST/PUT /users` | ✅ COMPLETE |
| Auth | `auth/` | `CoreUser`, `RefreshToken` | `auth.controller.ts` | `auth.service.ts` | `POST /auth/*` | ✅ COMPLETE |
| Tariff | `billing/` | `Tariff`, `TariffPlan` | `tariff-studio.controller.ts` | `tariff-studio.service.ts` | Via billing | ✅ COMPLETE |
| BillCycle | `bill-cycle/` | `BillingCycle` | `bill-cycle.controller.ts` | — | `GET /bill-cycle` | ✅ COMPLETE |
| Audit | `audit/` | `AuditLog`, `CoreAuditLog` | `audit.controller.ts` | `audit.service.ts` | Via audit | ✅ COMPLETE |
| Collections | `collections/` | `AreaCollectionAction` | `collections.controller.ts` | `collections.service.ts` | Via collections | ✅ COMPLETE |
| Reports | `reports/` | `ReportJob`, `ReportDefinition` | `reports.controller.ts` | `reports.service.ts` | Via reports | ✅ COMPLETE |
| Notifications | `notifications/` | `Notification` | `notifications.controller.ts` | `notifications.service.ts` | Via notifications | ✅ COMPLETE |
| Search | `search/` | (cross-entity) | `search.controller.ts` | `search.service.ts` | `GET /search` | ✅ COMPLETE |
| Enterprise | `enterprise/` | Enterprise models in sim_system | — | — | — | ❌ NOT IMPLEMENTED |
| Area | `areas/` | `CoreArea` | `areas.controller.ts` | `areas.service.ts` | Via areas | ✅ COMPLETE |
| Wallet | `wallet/` | `WalletAccount` | `wallet.controller.ts` | `wallet.service.ts` | Via wallet | ✅ COMPLETE |
| ChilledWater | `chilled-water/` | `ChilledWaterConfig` | `chilled-water.controller.ts` | `chilled-water.service.ts` | Via chilled-water | ✅ COMPLETE |
| Solar | `solar/` | `AreaSolarWalletTransaction` | `solar.controller.ts` | `solar-wallet.service.ts` | Via solar | ✅ COMPLETE |
| Settings | `settings/` | `SystemSetting` | `settings.controller.ts` | `settings.service.ts` | Via settings | ✅ COMPLETE |
| KPI | `kpi/` | (computed) | `kpi.controller.ts` | `kpi.service.ts` | Via kpi | ✅ COMPLETE |
| SIM Cards | `sim-cards/` | `SIMCard` | `sim-cards.controller.ts` | `sim-cards.service.ts` | Via sim-cards | ✅ COMPLETE |

---

## 5. Key Findings

1. **Backend has 20+ fully implemented controllers/services** but **no V2 repository uses them** — all V2 repos return mock data
2. **V1 backend-client.ts** only defines 6 endpoint groups; the backend has 47 modules
3. **Enterprise module** has no backend controller or service — only `enterprise.module.ts` + registry/pipeline/integration stubs
4. **V2 `ApiClient`** is ready for real API calls but needs endpoint URLs mapped to repositories
5. **Repository pattern is complete** — swap mock data with `api.get(...)` calls in each repository method
