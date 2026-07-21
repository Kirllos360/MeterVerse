# Phase 39 — Customer Domain Implementation Roadmap

**Date:** 2026-07-21  
**Based on:** `PHASE39_CUSTOMER_DOMAIN_ANALYSIS.md`  
**Goal:** Transform Customers from a mock-data list into a fully operational enterprise domain

---

## Epic 1 — Customer Domain Foundation

**Objective:** Fix the existing admin customers page, create the user-facing page, wire CRUD forms

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 1.1 | Fix admin customers config — change API from `/api/admin/users` to `/api/meterverse/customers` | `page-configs.ts` | Low |
| 1.2 | Create user-facing Customers page at `/dashboard/customers` with GenericAdminPage | `src/app/dashboard/customers/page.tsx` | Low |
| 1.3 | Add Customers nav entry to `nav-config.ts` under Overview group | `nav-config.ts` | Low |
| 1.4 | Wire GenericAdminPage Sheet onSubmit — actual API calls for create/update | `GenericAdminPage.tsx` | Medium |
| 1.5 | Add save success/error toast notifications | `GenericAdminPage.tsx` | Low |
| 1.6 | Add customer detail page at `/dashboard/customers/[id]` | New page + component | High |
| 1.7 | Add `requireRole("customers:*")` authorization to all backend customer routes | `customers.js` | Low |

**Estimated files:** 6–8  
**Risk:** Medium (detail page is new territory)  
**Dependencies:** None  
**Acceptance Criteria:**
- ✅ Admin customers page shows real customer data (not users)
- ✅ User-facing customers page exists at `/dashboard/customers`
- ✅ Customers link visible in sidebar
- ✅ Create customer actually creates in database
- ✅ Edit customer actually updates in database
- ✅ Success/error toasts on all mutations
- ✅ Customer detail page shows full profile with tabs

**Business Value:** Corrects data source bug, enables customer management for all users  
**Tech Debt Prevented:** Eliminates duplicate data mapping, incorrect API references

---

## Epic 2 — Meter Assignment

**Objective:** Enable assigning/unassigning meters to customers with full lifecycle tracking

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 2.1 | Create `MeterAssignment` Prisma model (customerId, meterId, startDate, endDate, status) | `schema.prisma` | Low |
| 2.2 | Create `POST /api/customers/:id/meters` — assign meter | `customers.js` | Low |
| 2.3 | Create `DELETE /api/customers/:id/meters/:meterId` — unassign | `customers.js` | Low |
| 2.4 | Create `GET /api/customers/:id/meters` — list assigned meters | `customers.js` | Low |
| 2.5 | Create BFF proxy routes for meter assignment | BFF routes | Low |
| 2.6 | Add "Meters" tab to customer detail page with assign/unassign UI | Customer detail component | High |
| 2.7 | Add meter assignment dropdown/selector component | New component | Medium |
| 2.8 | Add "Customer" column/info to meter list page | Meter page config | Low |

**Estimated files:** 10–12  
**Risk:** High (complex UI for assignment flow)  
**Dependencies:** Epic 1 (customer detail page must exist)  
**Acceptance Criteria:**
- ✅ Meters can be assigned to customers from customer detail
- ✅ Meters can be unassigned from customers
- ✅ Assignment history tracked with dates
- ✅ A meter appears on the customer's meter list
- ✅ The meter's customerId updates on assignment
- ✅ Cannot assign already-assigned meter without unassigning first

**Business Value:** Core operational workflow — connects infrastructure to customers  
**Tech Debt Prevented:** Eliminates manual meter-customer tracking

---

## Epic 3 — Customer Reading History

**Objective:** Show all meter readings across all customer's meters in one unified view

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 3.1 | Create `GET /api/customers/:id/readings` — union of readings across all meters | `customers.js` | Medium |
| 3.2 | Add "Readings" tab to customer detail page | Customer detail component | Low |
| 3.3 | Add reading chart (consumption over time) | Chart component | Medium |
| 3.4 | Add reading table with sort/filter by meter | Table component | Low |
| 3.5 | Add reading status badges (valid, estimated, anomalous) | Badge variants | Low |

**Estimated files:** 5–7  
**Risk:** Medium (cross-meter query performance)  
**Dependencies:** Epic 1 (detail page), Epic 2 (meter assignment ensures meters are linked)  
**Acceptance Criteria:**
- ✅ All readings from all customer's meters shown in one timeline
- ✅ Readings filterable by meter, date range, status
- ✅ Consumption chart shows daily/weekly/monthly trends
- ✅ Anomalous readings highlighted

**Business Value:** Single-pane view of customer consumption — essential for customer service  
**Tech Debt Prevented:** Eliminates need to manually check each meter

---

## Epic 4 — Billing Integration

**Objective:** Show customer invoices, enable invoice generation from readings

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 4.1 | Create `GET /api/customers/:id/invoices` — customer invoices | `customers.js` | Low |
| 4.2 | Create `POST /api/customers/:id/invoices/generate` — trigger bill run for customer | `invoices.js` | High |
| 4.3 | Add "Invoices" tab to customer detail page | Customer detail component | Low |
| 4.4 | Add invoice status badges, amount formatting, due date highlighting | UI components | Low |
| 4.5 | Add "Generate Invoice" action button on customer detail | Action button | Low |
| 4.6 | Create invoice detail view (line items, charges, taxes) | Invoice detail page | Medium |

**Estimated files:** 8–10  
**Risk:** High (invoice generation is complex business logic)  
**Dependencies:** Epic 3 (readings must exist for invoice generation), Tariff domain (Sprint 39–40)  
**Acceptance Criteria:**
- ✅ All customer invoices shown in chronological order
- ✅ Invoice statuses visible (paid, overdue, pending, cancelled)
- ✅ Invoice generation creates line items from consumption × tariff
- ✅ Invoice detail shows itemized charges
- ✅ Overdue invoices highlighted

**Business Value:** Core revenue workflow — connects consumption to billing  
**Tech Debt Prevented:** Replaces manual Excel-based billing

---

## Epic 5 — Payment Integration

**Objective:** Track payments against invoices, show payment history per customer

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 5.1 | Create `GET /api/customers/:id/payments` — payment history | `customers.js` | Low |
| 5.2 | Add "Payments" tab to customer detail page | Customer detail component | Low |
| 5.3 | Add payment method badges, amount formatting, receipt links | UI components | Low |
| 5.4 | Add outstanding balance calculation (invoices - payments) | Backend helper | Medium |
| 5.5 | Add "Record Payment" action on customer detail | Action modal | Medium |

**Estimated files:** 5–7  
**Risk:** Medium (balance calculation needs transaction handling)  
**Dependencies:** Epic 4 (invoices must exist)  
**Acceptance Criteria:**
- ✅ All customer payments shown
- ✅ Outstanding balance calculated correctly
- ✅ Payments link to invoices
- ✅ Record Payment updates invoice status
- ✅ Overdue balance triggers warning

**Business Value:** Financial visibility — essential for collections  
**Tech Debt Prevented:** Eliminates separate payment tracking

---

## Epic 6 — Customer Timeline

**Objective:** Activity feed showing every significant event in the customer lifecycle

### Events to Track
- Customer created
- Customer details updated
- Customer status changed
- Meter assigned/unassigned
- Invoice generated
- Payment received
- Reading uploaded
- Contract created/expired

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 6.1 | Create `CustomerTimeline` Prisma model | `schema.prisma` | Low |
| 6.2 | Create `POST /api/customers/:id/timeline` — add event | `customers.js` | Low |
| 6.3 | Create `GET /api/customers/:id/timeline` — get events | `customers.js` | Low |
| 6.4 | Wire timeline logging into all customer mutations | All customer routes | Medium |
| 6.5 | Add "Timeline" tab to customer detail page | Customer detail component | Low |
| 6.6 | Add timeline visualization (vertical timeline with icons) | Timeline component | Medium |

**Estimated files:** 6–8  
**Risk:** Medium (wiring into all mutations requires careful integration)  
**Dependencies:** Epic 1 (detail page must exist)  
**Acceptance Criteria:**
- ✅ Every customer mutation creates a timeline entry
- ✅ Timeline shows chronological activity with icons
- ✅ Timeline filterable by event type
- ✅ Timeline persists across page reloads
- ✅ Timeline entries show actor name and timestamp

**Business Value:** Full auditability of customer lifecycle — critical for customer service  
**Tech Debt Prevented:** Eliminates need for separate audit log queries

---

## Epic 7 — Customer Activity Analytics

**Objective:** KPI dashboard showing customer health metrics

### KPIs to Track
- Total customers
- Active customers
- New customers (this month, this quarter)
- Churned customers (this month)
- Customer growth rate (MoM, YoY)
- Average revenue per customer (ARPU)
- Customer lifetime value (LTV)
- Customers by status distribution
- Customers by area/zone
- Top customers by revenue

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 7.1 | Create `GET /api/customers/stats` — aggregated KPI data | `customers.js` | Medium |
| 7.2 | Add KPI cards to customers list page header | List page config | Low |
| 7.3 | Add customer growth chart (area chart) | Chart component | Medium |
| 7.4 | Add customer segmentation pie/bar chart | Chart component | Medium |
| 7.5 | Add customer status distribution visualization | Chart component | Low |
| 7.6 | Add top customers table | Table component | Low |
| 7.7 | Add date-range selector for KPI calculations | Date filter component | Low |

**Estimated files:** 8–10  
**Risk:** Medium (KPI calculation performance with large datasets)  
**Dependencies:** Epic 1 (basic customer data must exist)  
**Acceptance Criteria:**
- ✅ KPI cards show real aggregated data
- ✅ Charts render correctly with tooltips
- ✅ Date-range filter affects all KPIs
- ✅ KPIs update on data changes (with caching)
- ✅ All charts have loading and empty states

**Business Value:** Executive visibility into customer health — essential for business decisions  
**Tech Debt Prevented:** Eliminates manual KPI spreadsheet tracking

---

## Epic 8 — Customer Documents

**Objective:** Upload, store, and manage customer documents (contracts, IDs, photos)

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 8.1 | Create `CustomerDocument` Prisma model (id, customerId, name, type, url, uploadedAt, uploadedBy) | `schema.prisma` | Low |
| 8.2 | Create `POST /api/customers/:id/documents` — upload | `customers.js` | Medium |
| 8.3 | Create `DELETE /api/customers/:id/documents/:docId` — delete | `customers.js` | Low |
| 8.4 | Create `GET /api/customers/:id/documents` — list | `customers.js` | Low |
| 8.5 | Add "Documents" tab to customer detail page | Customer detail component | Medium |
| 8.6 | Add file upload component with drag-drop | Upload component | Medium |
| 8.7 | Add document preview (PDF/image viewer) | Preview component | Medium |

**Estimated files:** 8–10  
**Risk:** Medium (file upload/storage infrastructure)  
**Dependencies:** Epic 1 (detail page), Storage service (F57)  
**Acceptance Criteria:**
- ✅ Documents can be uploaded via drag-drop
- ✅ Documents shown in list with type icon
- ✅ Documents can be previewed in-browser
- ✅ Documents can be deleted
- ✅ File type/size validation enforced
- ✅ Upload progress shown

**Business Value:** Centralized document management — eliminates paper-based filing  
**Tech Debt Prevented:** Eliminates scattered file storage

---

## Epic 9 — Customer Notifications

**Objective:** Automated notifications triggered by customer lifecycle events

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 9.1 | Create notification templates for customer events | Templates config | Low |
| 9.2 | Wire welcome notification on customer create | Backend hook | Low |
| 9.3 | Wire status change notifications | Backend hook | Low |
| 9.4 | Wire invoice/payment notifications | Backend hook | Low |
| 9.5 | Add notification preference per customer | Customer model field | Low |
| 9.6 | Add in-app notification display | Notification component | Low |

**Estimated files:** 5–7  
**Risk:** Low  
**Dependencies:** None (Notification service exists at F53)  
**Acceptance Criteria:**
- ✅ Welcome notification sent on customer create
- ✅ Status change notifications sent
- ✅ Invoice/payment notifications sent
- ✅ Notifications appear in-app
- ✅ Notification preferences respected

**Business Value:** Automated customer communication — reduces manual outreach  
**Tech Debt Prevented:** N/A

---

## Epic 10 — Customer Reports

**Objective:** Printable and exportable customer reports

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 10.1 | Create customer list report (PDF/CSV) | Report generator | Medium |
| 10.2 | Create customer detail report (PDF) | Report generator | Medium |
| 10.3 | Create customer aging report | Report generator | Low |
| 10.4 | Create customer growth report | Report generator | Low |
| 10.5 | Add "Export" button to customers list | List page | Low |
| 10.6 | Add "Print" button to customer detail | Detail page | Low |

**Estimated files:** 6–8  
**Risk:** Medium (PDF generation complexity)  
**Dependencies:** Epic 1, Epic 7 (data must exist)  
**Acceptance Criteria:**
- ✅ CSV export of customer list works
- ✅ PDF export of customer detail works
- ✅ Reports have proper formatting and branding
- ✅ Large exports don't timeout
- ✅ Export progress shown

**Business Value:** Shareable customer data for stakeholders  
**Tech Debt Prevented:** Eliminates manual report creation

---

## Epic 11 — Customer Groups & Contracts

**Objective:** Organize customers into groups, manage contracts

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 11.1 | Create `CustomerGroup` model + CRUD API | Backend | Low |
| 11.2 | Create `Contract` model + CRUD API | Backend | High |
| 11.3 | Add customer group selector to customer form | Frontend | Low |
| 11.4 | Add contract management to customer detail | Frontend | Medium |
| 11.5 | Add group listing page | Frontend | Low |
| 11.6 | Add group-based reporting | Backend | Medium |

**Estimated files:** 10–14  
**Risk:** High (Contract domain is complex — terms, versions, amendments)  
**Dependencies:** Epic 1  
**Acceptance Criteria:**
- ✅ Customer groups can be created and managed
- ✅ Customers can be assigned to groups
- ✅ Contracts can be created with start/end dates
- ✅ Contract terms defined
- ✅ Group-based filtering works in list and reports

**Business Value:** Customer segmentation for targeted billing, reporting, and service  
**Tech Debt Prevented:** Eliminates ad-hoc customer classification

---

## Epic 12 — Performance & Production Readiness

**Objective:** Ensure customer domain scales to 100K+ records

### Tasks
| # | Task | Files | Risk |
|---|------|-------|------|
| 12.1 | Add database indexes for all customer query patterns | Prisma migration | Low |
| 12.2 | Add Redis caching layer for customer list/KPI queries | Backend | Medium |
| 12.3 | Implement cursor-based pagination for large datasets | Backend + Frontend | Medium |
| 12.4 | Add database connection pooling config | Backend | Low |
| 12.5 | Load test with 10K/50K/100K records | Test script | Low |
| 12.6 | Add query performance monitoring | Backend | Low |
| 12.7 | Add customer DB seed script (10K sample records) | Seed script | Low |

**Estimated files:** 6–8  
**Risk:** Medium (caching layer adds complexity)  
**Dependencies:** All earlier Epics (performance matters when data exists)  
**Acceptance Criteria:**
- ✅ Customer list loads <500ms with 100K records
- ✅ Customer detail loads <200ms
- ✅ KPI calculations complete <2s
- ✅ Search returns results <1s
- ✅ All queries use indexes (verified via EXPLAIN ANALYZE)
- ✅ Seed script generates realistic customer data

**Business Value:** System scales to enterprise customer volumes  
**Tech Debt Prevented:** Prevents performance crisis at 10K+ customers

---

## Summary

| Epic | Theme | Files | Risk | Depends On | Business Value |
|------|-------|-------|------|------------|---------------|
| 1 | Customer Domain Foundation | 6–8 | Medium | None | Correct data + user access |
| 2 | Meter Assignment | 10–12 | High | Epic 1 | Core operational workflow |
| 3 | Reading History | 5–7 | Medium | Epic 1, 2 | Customer consumption view |
| 4 | Billing Integration | 8–10 | High | Epic 3, Tariffs | Revenue workflow |
| 5 | Payment Integration | 5–7 | Medium | Epic 4 | Financial visibility |
| 6 | Customer Timeline | 6–8 | Medium | Epic 1 | Lifecycle auditability |
| 7 | Customer Analytics | 8–10 | Medium | Epic 1 | Executive KPIs |
| 8 | Customer Documents | 8–10 | Medium | Epic 1, Storage | Centralized docs |
| 9 | Customer Notifications | 5–7 | Low | None | Automated communication |
| 10 | Customer Reports | 6–8 | Medium | Epic 1, 7 | Shareable data |
| 11 | Groups & Contracts | 10–14 | High | Epic 1 | Customer segmentation |
| 12 | Performance | 6–8 | Medium | All Epics | Enterprise scalability |

**Total estimated files:** 83–110  
**Overall Risk:** Medium-High (meter assignment and billing are complex)  
**Recommended sprint order:** Epic 1 → Epic 2 → Epic 3 → Epic 6 → Epic 7 → Epic 9 → Epic 5 → Epic 4 → Epic 10 → Epic 8 → Epic 11 → Epic 12

---

*Ready for implementation. Start with Epic 1 — the foundation.*
