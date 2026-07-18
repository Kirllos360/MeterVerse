# ECG-01R-011 — Create Query DTOs for 42 Endpoint Parameters

**Platform:** Validation Platform (Phase 1)  
**Priority:** P2  
**Estimated Effort:** 2 days  
**Depends on:** None  

## Objective

Create class-validator DTOs for all 42 `@Query('paramName')` parameters currently using primitive types.

## Scope

Create DTOs for these 19 controllers (42 parameters grouped by endpoint):

| Controller | Endpoint | Parameters | DTO to create |
|---|---|---|---|
| `billing.controller.ts` | `GET /tariff-plans` | `projectId` | Add to existing `ListInvoicesQueryDto` or create `QueryTariffPlanDto` |
| `billing.controller.ts` | `GET /periods` | `projectId` | `QueryPeriodDto` |
| `tariff-studio.controller.ts` | `GET /tariffs` | `utility` | `QueryTariffDto` with `@IsIn(['water','electric','gas','solar'])?` |
| `readings.controller.ts` | `GET /readings` | `projectId` | Add to existing `ReadingQueryDto` |
| `readings.controller.ts` | `GET /exceptions` | `meterId` | New `ReadingExceptionQueryDto` |
| `water-balance.controller.ts` | `GET /` | `from`, `to` | Add to existing `WaterBalanceQueryDto` |
| `search.controller.ts` | `GET /search` | `q`, `limit` | New `SearchQueryDto` |
| `kpi.controller.ts` | 3 endpoints | `projectId` each | New `KpiQueryDto` |
| `customer-search.controller.ts` | `GET /search` | 5 params (name, phone, email, meterSerial, unitNo) | New `CustomerSearchQueryDto` |
| `payments.controller.ts` | `GET /payments` | `projectId`, `customerId` | New `PaymentQueryDto` |
| `notifications.controller.ts` | `GET /notifications` | 5 params | New `NotificationQueryDto` |
| `customers.controller.ts` | `GET /:id/statement` | `from`, `to` | New `StatementQueryDto` |
| `settlement.controller.ts` | `GET /settlement` | `customerId` | New `SettlementQueryDto` |
| `settlement.controller.ts` | `GET /adjustments` | `invoiceId` | Add to above or new |
| `registration.controller.ts` | `GET /requests` | `status` | New `RegistrationQueryDto` |
| `gas.controller.ts` | `GET /meters` | `projectId` | New `GasMeterQueryDto` |
| `solar.controller.ts` | `GET /dashboard` | `period` | New `SolarDashboardQueryDto` |
| `dashboard.controller.ts` | `GET /activity` | `limit` | New `ActivityQueryDto` |
| `invoices.controller.ts` | `GET /invoices` | `projectId`, `limit` | New `InvoiceListQueryDto` |
| `engineering.controller.ts` | 3 endpoints | 6 params | New scaffold/release/changelog DTOs |
| `observability.controller.ts` | 2 endpoints | 4 params | New alert/SLA query DTOs |
| `tenant.controller.ts` | `GET /tenants` | `includeInactive` | New `TenantQueryDto` |

Each DTO should use class-validator decorators:
- `@IsOptional()` for all
- `@IsUUID()` for entity IDs
- `@IsDateString()` or `@IsISO8601()` for dates
- `@IsIn()` for enum parameters
- `@IsInt()` + `@Min(1)` + `@Max(100)` for numeric limits
- `@IsBooleanString()` for boolean flags

## Verification

- `npx tsc --noEmit` — 0 errors
- All 19 controllers use DTO classes for query parameters
- Invalid query parameters return appropriate 400 errors
- Existing valid queries continue to work
