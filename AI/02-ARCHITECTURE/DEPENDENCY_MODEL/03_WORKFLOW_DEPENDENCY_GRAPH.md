# 03 — Workflow Dependency Graph

**Version:** 1.0.0  
**Purpose:** Every workflow, its inputs, blocking conditions, errors, rollback, and affected components.

---

## 1. Customer Registration

| Property | Value |
|----------|-------|
| **Required Inputs** | Unit ID, Customer name (AR/EN), Phone, Email, Customer type |
| **Required Entities** | Project, Area, Unit |
| **Blocking Conditions** | Unit already occupied, Project archived, Duplicate phone/email |
| **Warnings** | No tariff assigned, No meter available in project |
| **Errors** | Unit not found, Project not active, Validation failure |
| **Rollback Strategy** | If customer created but meter assignment fails → customer remains with error flag |
| **Approval Rules** | None (operator can create) |
| **Generated Data** | Customer record, Initial ledger entry (if balance>0), Welcome notification |
| **Affected Pages** | Customer Explorer, Customer Workspace, Unit Explorer |
| **Affected Dashboards** | Executive (customer count), Operations (new registrations) |
| **Affected KPIs** | Total customers, Occupancy rate |
| **Affected Notifications** | Welcome notification to customer, New customer alert to admin |

## 2. Meter Installation

| Property | Value |
|----------|-------|
| **Required Inputs** | Meter serial, Type, Brand, Unit ID, Customer ID |
| **Required Entities** | Project, Area, Unit, Customer |
| **Blocking Conditions** | Unit already has active meter of same type, Serial duplicate, Customer inactive |
| **Warnings** | No SIM available, No tariff for this utility type |
| **Errors** | Meter not found in inventory, Unit not found |
| **Rollback Strategy** | Transactional: meter assignment + unit update in one DB transaction |
| **Approval Rules** | Operator can install. Admin approval needed for non-standard meter types. |
| **Generated Data** | Meter (status: installed), MeterAssignment, Installation event in timeline |
| **Affected Pages** | Meter Explorer, Meter Workspace, Customer Workspace, Unit Explorer |
| **Affected Dashboards** | Operations (active meters), Field (installations today) |
| **Affected KPIs** | Active meters, Installation rate |
| **Affected Notifications** | Customer notified of meter activation, Technician task closed |

## 3. Reading Capture & Validation

| Property | Value |
|----------|-------|
| **Required Inputs** | Meter ID, Reading value, Reading date, Source (manual/auto/imported) |
| **Required Entities** | Meter (active status), Customer, UtilityAccount |
| **Blocking Conditions** | Meter is not active, Reading already exists for this meter+date, Reading value < last value |
| **Warnings** | Reading value >3x last value, High consumption detected, Zero consumption detected |
| **Errors** | Meter offline, Communication failure, Invalid value format |
| **Rollback Strategy** | Reading saved with status. If validation fails, status=`suspicious`. No rollback needed. |
| **Approval Rules** | Suspicious readings require admin approval. Normal readings auto-approved. |
| **Generated Data** | Reading record, Consumption calculation, ReadingReview (if suspicious), ReadingAnomalyDetected event |
| **Affected Pages** | Reading Explorer, Reading Workspace, Meter Workspace, Customer Workspace |
| **Affected Dashboards** | Operations (readings today), Monitoring (anomaly count) |
| **Affected KPIs** | Reading success rate, Readings captured, Anomaly rate |
| **Affected Notifications** | Anomaly alert to operator, Approval request to admin |

## 4. Invoice Generation

| Property | Value |
|----------|-------|
| **Required Inputs** | Customer ID, Period (month/year), Utility type |
| **Required Entities** | Customer, Meter(s), Reading(s) for period, Tariff |
| **Blocking Conditions** | No reading for period, No tariff for utility type, Meter inactive during period, Billing period closed |
| **Warnings** | Estimated reading used, Consumption >2x average, No payment since last invoice |
| **Errors** | Tariff calculation error, Missing tariff charge configuration |
| **Rollback Strategy** | Invoice created as `draft`. Can be deleted before `issue`. After issue, must be cancelled/reversed. |
| **Approval Rules** | Invoices >10,000 EGP require admin approval. Auto-approve below threshold. |
| **Generated Data** | Invoice, InvoiceLine(s), Ledger entry, InvoiceGenerated event |
| **Affected Pages** | Invoice Explorer, Invoice Workspace, Customer Workspace, Billing Dashboard |
| **Affected Dashboards** | Billing (new invoices), Executive (revenue) |
| **Affected KPIs** | Revenue, Invoices generated, Average invoice amount |
| **Affected Notifications** | New invoice notification to customer, Large invoice alert to finance |

## 5. Payment Recording

| Property | Value |
|----------|-------|
| **Required Inputs** | Customer ID, Amount, Method, Date, Invoice(s) to allocate |
| **Required Entities** | Customer, Invoice(s), Payment method configuration |
| **Blocking Conditions** | Customer suspended, Amount <= 0, Total allocation > amount + 10%, Invoice already paid fully |
| **Warnings** | Overpayment (amount > invoice balance), Multiple invoices selected, Payment from non-customer |
| **Errors** | Payment processor failure, Invoice not found |
| **Rollback Strategy** | Payment + allocation in single transaction. Full rollback on failure. |
| **Approval Rules** | Finance can record. Super-admin approval for payments >50,000 or reversals. |
| **Generated Data** | Payment record, PaymentAllocation(s), Ledger entry, Receipt, PaymentReceived event |
| **Affected Pages** | Payment Explorer, Payment Workspace, Invoice Workspace, Customer Workspace |
| **Affected Dashboards** | Collections (collections today), Finance (cash flow) |
| **Affected KPIs** | Collection rate, Payment count, Average payment amount |
| **Affected Notifications** | Payment confirmation to customer, Large payment alert to finance |

## 6. Ownership Transfer

| Property | Value |
|----------|-------|
| **Required Inputs** | Source customer ID, Target customer ID, Reason |
| **Required Entities** | Source customer, Target customer, Project |
| **Blocking Conditions** | Same customer (source = target), Source inactive, Target inactive, Different projects |
| **Warnings** | Source has unpaid invoices, Source has open tickets, Source has alerts |
| **Errors** | Customer not found, Source has no units to transfer |
| **Rollback Strategy** | Not transactional by default. Dry-run preview available before execution. |
| **Approval Rules** | Requires admin approval. Manager for same-area transfers. |
| **Generated Data** | CustomerTransferred event, Updated MeterAssignment, Updated Ledger references |
| **Affected Pages** | Customer Workspace, Customer Explorer |
| **Affected Dashboards** | Operations (transfer count) |
| **Affected KPIs** | Customer transfers |
| **Affected Notifications** | Transfer confirmation to both customers, Notification to area manager |

## 7. Meter Replacement

| Property | Value |
|----------|-------|
| **Required Inputs** | Old meter ID, New meter ID, Reason, Final reading, Date |
| **Required Entities** | Old meter (active/assigned), New meter (available), Customer, Unit |
| **Blocking Conditions** | Old meter not active, New meter not available, Final reading < last reading |
| **Warnings** | Old meter has unpaid invoices, Old meter has open alerts |
| **Errors** | Meter not found, New meter already assigned |
| **Rollback Strategy** | Full transaction: terminate old + assign new. Rollback both on failure. |
| **Approval Rules** | Requires admin approval for high-value customers (balance >10,000). |
| **Generated Data** | Old meter terminated, New meter assigned, Final reading on old, Opening reading on new |
| **Affected Pages** | Meter Workspace, Customer Workspace, Meter Explorer |
| **Affected Dashboards** | Operations (replacements today), Field (technician tasks) |
| **Affected KPIs** | Replacement rate, Meter health |
| **Affected Notifications** | Customer notified of replacement, Technician assigned |

## 8. Bulk Data Import (CSV/Excel)

| Property | Value |
|----------|-------|
| **Required Inputs** | File (CSV/Excel), Entity type (readings/meters/customers/payments etc.) |
| **Required Entities** | Project, Area (context-dependent) |
| **Blocking Conditions** | Invalid file format, Missing required columns, Duplicate records |
| **Warnings** | Partial success (some rows fail), Data type mismatches |
| **Errors** | File not parseable, Database connection failure |
| **Rollback Strategy** | Row-level: valid rows import, invalid rows logged. No rollback of valid rows. |
| **Approval Rules** | Admin+ can import. Operator cannot import (except readings). |
| **Generated Data** | ImportRecord, Created/updated entities, ImportFailed events for errors |
| **Affected Pages** | Upload Center, affected entity explorers |
| **Affected Dashboards** | Operations (imports today) |
| **Affected KPIs** | Import success rate |
| **Affected Notifications** | Import complete notification, Error report to admin |
