# Billing & Invoice Process Specifications (P-030 to P-044)

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/02_FINANCIAL_PROCESSES/billing/P-030_to_P-044_Billing_Invoice.md`

---

## P-030: Bill Cycle Creation

**Business Purpose:** Define a billing period for a group of meters/customers based on their bill cycle configuration.  
**Business Owner:** Billing Director | **Priority:** P0 — Critical  
**Trigger:** Scheduled (monthly), Manual creation for off-cycle billing  
**Preconditions:** BillCycle configuration exists. Previous cycle completed (if regular).  
**Inputs:** BillCycle ID, Period start/end dates, Description  
**Outputs:** BillRun record created in PENDING status  
**Permissions:** `billing.*` | **Validation:** Period cannot overlap with existing BillRun for same cycle.  
**SLA:** N/A (scheduled) | **Sessions:** 1

---

## P-033: Invoice Generation

**Business Purpose:** Create invoice records from calculated consumption and applied charges for a customer/meter.  
**Business Owner:** Billing Director | **Priority:** P0 — Critical  
**Trigger:** Bill cycle execution, Individual invoice request  
**Preconditions:** Consumption calculated (P-018). Tariff applied. Customer and meter valid.  
**Inputs:** Customer ID, Meter IDs, Period, Consumption values, Tariff rates, Applied charges, Discounts, Tax rates  
**Outputs:** Invoice record with InvoiceItem, InvoiceTax, DiscountRule records.  
**Primary Actor:** System (Billing Engine) | **Permissions:** invoices.create  
**Validation:** Invoice amount must equal sum of items. Tax must be correctly calculated.  
**Decision Points:** Water difference mode triggered? → Apply configured action (report/warn/block).  
**Exception Paths:** Tariff not found for meter type → Use default tariff. Missing reading → Estimate consumption.  
**SLA:** 2 hours for full bill run | **KPI:** Invoice generation accuracy > 99.9%  
**Business Rules:** Invoice number must be unique. Invoice items must balance to total. Immutable after issue.  

---

## P-034: Invoice Approval

**Business Purpose:** Review and approve generated invoices before issuing to customers.  
**Priority:** P0 — Critical | **Trigger:** Invoice generated in PENDING_APPROVAL status  
**Permissions:** invoices.approve | **Sessions:** 2

---

## P-035: Invoice Version Update

**Business Purpose:** Update invoice details before issuance (corrections, adjustments).  
**Priority:** P1 — High | **Restriction:** Only allowed before invoice is issued (immutable after)  
**Sessions:** 1

---

## P-036: Invoice Distribution

**Business Purpose:** Deliver invoices to customers through their preferred channel (portal, email, SMS, print).  
**Priority:** P0 — Critical | **Trigger:** Invoice issued  
**Primary Actor:** System (Distribution Engine) | **Sessions:** 3

---

## P-037: Invoice Email

**Business Purpose:** Send invoice as PDF attachment via email. | **Priority:** P0  
**Related APIs:** POST /api/invoices/:id/email | **Sessions:** 2

---

## P-038: Invoice SMS

**Business Purpose:** Send invoice notification via SMS with payment link. | **Priority:** P1  
**Related APIs:** POST /api/invoices/:id/sms | **Sessions:** 1

---

## P-039: Settlement Upload

**Business Purpose:** Upload meter settlement data from head-end system (EDI-867, CSV, custom format).  
**Priority:** P1 | **Trigger:** Periodic settlement cycle, Dispute resolution  
**Sessions:** 3

---

## P-040: Settlement Approval

**Business Purpose:** Review and approve uploaded settlement data before posting to customer accounts.  
**Priority:** P1 | **Sessions:** 2

---

## P-041: Settlement Rollback

**Business Purpose:** Reverse a settlement that was posted in error. | **Priority:** P2  
**Guard:** Cannot rollback if invoices generated from settlement data. | **Sessions:** 2

---

## P-042: Discount Upload

**Business Purpose:** Upload or create discount rules for specific customers, groups, or meters.  
**Priority:** P1 | **Sessions:** 2

---

## P-043: Discount Approval

**Business Purpose:** Approve discount rules before they take effect. | **Priority:** P1  
**Permissions:** discounts.approve | **Sessions:** 1

---

## P-044: Discount Rollback

**Business Purpose:** Reverse a discount that was applied in error. | **Priority:** P2  
**Sessions:** 1
