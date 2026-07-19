# MeterVerse Business Capabilities

**Date:** 2026-07-19  
**Scope:** All business capabilities across the enterprise utility platform  

---

## Capability Maturity Model

| Level | Definition | Count |
|-------|------------|-------|
| ✅ **Live** | Working with real data, full backend | 0 |
| 🟡 **Partial** | UI exists with mock data, backend planned | 8 |
| 🔶 **Scaffold** | Schema/model exists, no UI or API | 3 |
| 🔴 **Missing** | Not implemented at any layer | 47 |
| **Total** | | **58** |

---

## 1. Customer Management

| Capability | Status | Backend | Frontend | Priority |
|-----------|--------|---------|----------|----------|
| Customer CRUD | 🟡 Partial | ✅ Route exists | ✅ AppPage (mock) | 🔴 |
| Customer Groups | 🔴 Missing | ❌ | ❌ | 🟡 |
| Organizations | 🔴 Missing | ❌ | ❌ | 🟡 |
| Projects | 🔴 Missing | ❌ | ❌ | 🟡 |
| Areas/Zones | 🔴 Missing | ❌ | ❌ | 🟡 |
| Buildings | 🔴 Missing | ❌ | ❌ | 🟢 |
| Units | 🔴 Missing | ❌ | ❌ | 🟢 |
| Contracts | 🔶 Scaffold | ❌ | ❌ | 🔴 |

**Purpose:** Manage utility customers from residential to industrial  
**Owner:** Customer Service / Operations  
**Lifecycle:** Prospect → Active → Suspended → Closed  
**KPIs:** Active customers, New signups, Churn rate, Avg revenue per customer

---

## 2. Meter Management

| Capability | Status | Backend | Frontend | Priority |
|-----------|--------|---------|----------|----------|
| Meter CRUD | 🟡 Partial | ✅ Route exists | ✅ AppPage (mock) | 🔴 |
| Meter Types | 🔴 Missing | ❌ | ❌ | 🟡 |
| Meter Assignments | 🔴 Missing | ❌ | ❌ | 🔴 |
| Main Water Meters | 🔴 Missing | ❌ | ❌ | 🟡 |
| Child Water Meters | 🔴 Missing | ❌ | ❌ | 🟡 |
| Electricity | 🔴 Missing | ❌ | ❌ | 🟡 |
| Gas (future) | 🔴 Missing | ❌ | ❌ | 🟢 |
| SIM Cards | 🔴 Missing | ❌ | ❌ | 🟡 |
| Gateways | 🔴 Missing | ❌ | ❌ | 🟡 |

**Purpose:** Track all meter types, assignments, and connectivity  
**Owner:** Meter Operations  
**Lifecycle:** Ordered → Delivered → Installed → Active → Retired  
**KPIs:** Total meters, Active vs inactive, Installation rate, Reading success rate

---

## 3. Readings

| Capability | Status | Backend | Frontend | Priority |
|-----------|--------|---------|----------|----------|
| Reading CRUD | 🟡 Partial | ✅ Route exists | ✅ AppPage (mock) | 🔴 |
| Reading Validation | 🔴 Missing | ❌ | ❌ | 🔴 |
| Reading Corrections | 🔴 Missing | ❌ | ❌ | 🟡 |
| Automated reading (AMI) | 🔴 Missing | ❌ | ❌ | 🔴 |

**Purpose:** Collect, validate, and process meter readings  
**Owner:** Meter Operations / Billing  
**Lifecycle:** Scheduled → Collected → Validated → Billed → Archived  
**KPIs:** Reading success %, Validation pass rate, Estimated readings %, Time to bill

---

## 4. Billing & Tariffs

| Capability | Status | Backend | Frontend | Priority |
|-----------|--------|---------|----------|----------|
| Tariffs | 🔴 Missing | ❌ | ❌ | 🔴 |
| Tariff Versions | 🔴 Missing | ❌ | ❌ | 🟡 |
| Bill Cycles | 🔴 Missing | ❌ | ❌ | 🔴 |
| Charges | 🔴 Missing | ❌ | ❌ | 🔴 |
| Invoice Generation | 🔴 Missing | ❌ | ❌ | 🔴 |
| Invoices | 🟡 Partial | ✅ Route | ✅ AppPage (mock) | 🔴 |
| Credit Notes | 🔴 Missing | ❌ | ❌ | 🟡 |

**Purpose:** Calculate consumption charges and generate invoices  
**Owner:** Billing  
**Lifecycle:** Cycle opens → Readings collected → Consumption calc → Tariff applied → Invoice generated  
**KPIs:** Invoices per cycle, Avg invoice value, Billing accuracy, Cycle completion rate

---

## 5. Payments & Financial

| Capability | Status | Backend | Frontend | Priority |
|-----------|--------|---------|----------|----------|
| Payments | 🟡 Partial | ✅ Route | ✅ AppPage (mock) | 🔴 |
| Receipts | 🔴 Missing | ❌ | ❌ | 🟡 |
| Ledger | 🔴 Missing | ❌ | ❌ | 🟡 |
| Bank Accounts | 🔴 Missing | ❌ | ❌ | 🟢 |
| Payment Centers | 🔴 Missing | ❌ | ❌ | 🟢 |
| Payment Gateway | 🔴 Missing | ❌ | ❌ | 🔴 |

**Purpose:** Process and track payments across all channels  
**Owner:** Finance  
**Lifecycle:** Invoice sent → Payment due → Payment received → Reconciled → Ledger updated  
**KPIs:** Collection rate, Avg payment time, Payment method mix, Outstanding AR

---

## 6. Reporting & Analytics

| Capability | Status | Backend | Frontend | Priority |
|-----------|--------|---------|----------|----------|
| Reports | 🔴 Missing | ❌ | ✅ (stub app) | 🟡 |
| KPIs | 🟡 Partial | ❌ | ✅ (home page) | 🟡 |
| Exports (CSV/PDF) | 🔴 Missing | ❌ | ❌ | 🟡 |
| Dashboard | 🟡 Partial | ❌ | ✅ (mock data) | 🟡 |

**Purpose:** Business intelligence and operational reporting  
**Owner:** Management / Operations

---

## 7. System & Infrastructure

| Capability | Status | Backend | Frontend | Priority |
|-----------|--------|---------|----------|----------|
| Notifications | 🔴 Missing | ❌ | ✅ (component) | 🔴 |
| Files/Attachments | 🔴 Missing | ❌ | ✅ (FileUpload) | 🟡 |
| Activities/Timeline | 🔴 Missing | ❌ | ✅ (UI mock) | 🟡 |
| Audit Logs | 🔴 Missing | ❌ | ✅ (admin shell) | 🔴 |
| Search | 🟡 Partial | ❌ | ✅ (components) | 🟡 |
| Approval Workflow | 🔴 Missing | ❌ | ❌ | 🟡 |
| Import (bulk) | 🔴 Missing | ❌ | ❌ | 🟡 |

---

## Summary

| Status | Count | % |
|--------|-------|---|
| 🟡 Partial (UI + mock) | 8 | 14% |
| 🔶 Scaffold (schema only) | 3 | 5% |
| 🔴 Missing | 47 | 81% |
| ✅ Live | 0 | 0% |
| **Total** | **58** | **100%** |

## Next Priority Order (by business impact)

| Rank | Capability | Why |
|------|-----------|-----|
| 1 | Contracts | Legal foundation for all billing |
| 2 | Tariffs + Bill Cycles | Core billing engine |
| 3 | Reading Validation | Data quality before billing |
| 4 | Invoice Generation | Auto-generate from readings + tariffs |
| 5 | Payment Gateway | Collect actual payments |
| 6 | Audit Logs | Compliance requirement |
| 7 | Notifications | Customer communication |
