# STAB-04 — API Wiring Certification (Refresh)

Updates original Phase 11 report to reflect STAB-01, STAB-02, STAB-03 changes.

## Module-by-Module

### Customers
| Operation | UI Hook | API Endpoint | DB | Status |
|-----------|---------|-------------|----|--------|
| List | `useCustomersList` → `apiGet` | `GET /projects/:pid/customers` | `prisma.customer.findMany` | ✅ WIRED |
| Detail | `useCustomerDetail` → `apiGet` | `GET /projects/:pid/customers/:id` | `prisma.customer.findUnique` | ✅ WIRED |
| Create | `useCreateCustomer` → `apiPost` | `POST /projects/:pid/customers` | `prisma.customer.create` | ✅ WIRED |
| Update | `useUpdateCustomer` → `apiPatch` | `PATCH /projects/:pid/customers/:id` | `prisma.customer.update` | ✅ WIRED |
| Delete | `useDeleteCustomer` → `apiDelete` | `DELETE /projects/:pid/customers/:id` | `prisma.customer.update(status:deleted)` | ✅ WIRED |

### Meters
| Operation | Status |
|-----------|--------|
| List | ✅ WIRED — `useMetersList` → `GET /meters` |
| Detail | ✅ WIRED — `useMeterDetail` → `GET /meters/:id` |
| Replace | ✅ WIRED — `useReplaceMeter` → `POST /meters/:id/terminate` |
| Terminate | ✅ WIRED — `useTerminateMeter` → `POST /meters/:id/terminate` |
| Assign | ❌ NOT WIRED — MeterAssignPage is entirely mock (221-line wizard) |
| Create/Edit/Delete | ❌ NOT WIRED — no hooks exist |

### Readings
| Operation | Status |
|-----------|--------|
| List | ✅ WIRED — `useReadingsList` → `GET /readings` |
| Detail | ✅ WIRED (inline `GET /readings/:id` route exists) |
| Create | ✅ WIRED — `useCreateReading` → `POST /readings` |
| Review Queue | ✅ WIRED — `GET /readings/review-queue` |
| Approve/Reject | ❌ NOT WIRED — no UI hooks, backend approve/reject missing |

### Locations (STAB-01 fixed)
| Operation | Status |
|-----------|--------|
| List | ✅ WIRED — `useLocationsList` → `GET /projects/:pid/locations` |
| Create | ✅ WIRED (NEW) — `useCreateLocation` → `POST /projects/:pid/locations` |
| Update | ✅ WIRED (NEW) — `useUpdateLocation` → `PATCH /projects/:pid/locations/:id` |
| Delete | ✅ WIRED (NEW) — `useDeleteLocation` → `DELETE /projects/:pid/locations/:id` |

### Invoices (STAB-02 fixed)
| Operation | Status |
|-----------|--------|
| List | ✅ WIRED — `useInvoicesList` → `GET /invoices` |
| Detail | ✅ WIRED — `useInvoiceDetail` → `GET /invoices/:id` |
| Generate | ✅ WIRED — `POST /invoices/generate` (live certified) |
| Issue | ✅ WIRED — `POST /invoices/:id/issue` (returns `approval_required` for >10000) |
| Adjustments | ⚠️ BACKEND EXISTS — no UI hook wired |
| Cancel | ❌ NOT WIRED — no UI hook |

### Payments
| Operation | Status |
|-----------|--------|
| List | ✅ WIRED — `usePaymentsList` → `GET /payments` |
| Record | ❌ NOT WIRED — dialog is toast stub |
| Reverse | ❌ NOT WIRED — no UI hook |
| Detail | ❌ NOT WIRED — no UI hook |

### Projects
| Operation | Status |
|-----------|--------|
| List | ✅ WIRED — `useProjectsList` → `GET /projects` |
| Detail | ✅ WIRED — `useProjectDetail` → `GET /projects/:id` |
| Create/Update/Delete | ❌ NOT WIRED — no hooks exist |

### Sim Cards
| Operation | Status |
|-----------|--------|
| List | ✅ WIRED — `useSimCardsList` → `GET /sim-cards` |
| Create/Update/Delete | ❌ NOT WIRED — no hooks exist |

### Feature Flags (Updated)
```
projects.list     = api ✓
projects.readings = api ✓
locations.list    = api ✓
customers.list    = api ✓
meters.list       = api ✓
sims.list         = api ✓
readings.list     = api ✓
billing.list      = api ✓
invoices.list     = api ✓
payments.list     = api ✓
reports.list      = mock (no backend)
alerts.list       = mock (no backend)
tickets.list      = mock (no backend)
```

## Summary Matrix

| Module | Read | Create | Update | Delete | Special |
|--------|------|--------|--------|--------|---------|
| Customers | ✅ | ✅ | ✅ | ✅ | Detail ✅ |
| Meters | ✅ | ❌ | ❌ | ❌ | Replace ✅, Terminate ✅, Assign ❌ |
| Readings | ✅ | ✅ | ❌ | ❌ | Review Queue ✅ |
| Locations | ✅ | ✅ | ✅ | ✅ | (STAB-01) |
| Invoices | ✅ | ✅ | ❌ | ❌ | Generate ✅, Issue ✅, Adjust ⚠️ |
| Payments | ✅ | ❌ | ❌ | ❌ | |
| Projects | ✅ | ❌ | ❌ | ❌ | |
| Sim Cards | ✅ | ❌ | ❌ | ❌ | |
| Dashboard | ✅ | — | — | — | KPIs, consumption, activity |

## Verdict

**API_CERTIFIED = NO**

While 10/13 flags are now `api` and most read operations are wired, 5 modules lack create/update/delete hooks:
- Meters (no create/edit, no assign wizard)
- Readings (no approve/reject)
- Payments (no record/reverse)
- Projects (no CRUD at all)
- Sim Cards (no create/update/delete)

Full certification requires all CRUD operations for every module to have a UI hook → API → DB chain without mock fallback.
