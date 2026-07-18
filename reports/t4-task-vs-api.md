# Task vs API

**Date:** 2026-06-17
**Auditor:** OpenCode (DeepSeek V4 Flash)

## API Endpoint Audit

### Registered Routes (verified from backend startup log)
| Method | Route | Controller | Status |
|--------|-------|------------|--------|
| GET | /api/v1/health | AppController | ✅ |
| POST | /api/v1/auth/refresh | AuthController | ✅ |
| GET | /api/v1/meters | MetersController | ✅ |
| POST | /api/v1/meters | MetersController | ✅ |
| GET | /api/v1/meters/:id | MetersController | ✅ |
| PATCH | /api/v1/meters/:id | MetersController | ✅ |
| DELETE | /api/v1/meters/:id | MetersController | ✅ |
| POST | /api/v1/meters/:meterId/assign | MetersController | ✅ |
| POST | /api/v1/meters/:meterId/terminate | MetersController | ✅ |
| GET | /api/v1/sim-cards | SimCardsController | ✅ |
| POST | /api/v1/sim-cards | SimCardsController | ✅ |
| GET | /api/v1/sim-cards/:id | SimCardsController | ✅ |
| PATCH | /api/v1/sim-cards/:id | SimCardsController | ✅ |
| DELETE | /api/v1/sim-cards/:id | SimCardsController | ✅ |
| GET | /api/v1/sim-cards/:simId/eligibility | SimCardsController | ✅ |
| GET | /api/v1/projects | ProjectsController | ✅ |
| POST | /api/v1/projects | ProjectsController | ✅ |
| GET | /api/v1/projects/:id | ProjectsController | ✅ |
| PATCH | /api/v1/projects/:id | ProjectsController | ✅ |
| DELETE | /api/v1/projects/:id | ProjectsController | ✅ |
| GET | /api/v1/projects/:projectId/customers | CustomersController | ✅ |
| POST | /api/v1/projects/:projectId/locations | LocationsController | ✅ |
| GET | /api/v1/projects/:projectId/locations | LocationsController | ✅ |
| GET | /api/v1/projects/:projectId/dashboard/kpis | DashboardController | ✅ |
| GET | /api/v1/projects/:projectId/dashboard/consumption | DashboardController | ✅ |
| GET | /api/v1/projects/:projectId/dashboard/activity | DashboardController | ✅ |
| GET | /api/v1/projects/:projectId/water-balance | WaterBalanceController | ✅ |
| POST | /api/v1/readings | ReadingsController | ✅ |
| GET | /api/v1/readings/review-queue | ReadingsController | ✅ |
| POST | /api/v1/invoices/generate | BillingController | ✅ |
| POST | /api/v1/invoices/:id/issue | BillingController | ✅ |
| POST | /api/v1/invoices/:id/adjustments | BillingController | ✅ |
| POST | /api/v1/payments | BillingController | ✅ |
| GET | /api/v1/tariffs | BillingController | ✅ |
| GET | /api/v1/periods | BillingController | ✅ |

### Missing Endpoints (per tasks.md)
- POST /api/v1/payments/:paymentId/reverse (T066) — NOT IMPLEMENTED
- GET /api/v1/customers/:customerId/statement (T067) — NOT IMPLEMENTED
- POST /api/v1/reports/exports (T073) — NOT IMPLEMENTED
- GET /api/v1/reports/exports/:jobId (T073) — NOT IMPLEMENTED

### API Count: 34+ routes registered, 4 missing
