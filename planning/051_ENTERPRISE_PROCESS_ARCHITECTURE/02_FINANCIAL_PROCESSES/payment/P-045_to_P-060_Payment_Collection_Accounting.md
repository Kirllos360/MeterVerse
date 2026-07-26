# Payment, Collection & Accounting Process Specifications (P-045 to P-060)

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/02_FINANCIAL_PROCESSES/payment/P-045_to_P-060_Payment_Collection_Accounting.md`

---

## P-045: Payment Registration

**Business Purpose:** Record a payment received from a customer through any channel (cash, card, bank transfer, portal, wallet).  
**Business Owner:** Finance Director | **Priority:** P0 — Critical  
**Trigger:** Customer makes payment, Portal payment, Bank reconciliation  
**Preconditions:** Customer must exist. Payment amount must be positive.  
**Inputs:** Customer ID, Amount, Method (cash/card/bank/wallet), Reference (transaction ID, check number), Notes  
**Outputs:** Payment record created. Auto-allocation triggered (P-046).  
**Primary Actor:** Cashier (staff), System (portal/bank), Customer (self-service)  
**Permissions:** `payments.*` | **Validation:** Amount > 0. Customer exists. Method valid.  
**Business Rules:** Overpayment creates credit on account. Underpayment auto-allocated to oldest invoice first.  
**SLA:** < 3 seconds for processing | **KPI:** Payment capture rate > 99.99%  
**Dependencies:** P-021 (Customer exists), P-046 (Auto-allocation downstream)  
**Related APIs:** POST /api/payments, POST /api/payments/:id/reverse  
**DB Tables:** Payment, PaymentTransaction, Invoice (paidAmount)  
**Events:** PaymentReceived, PaymentAllocated  
**Risk:** Payment recorded but allocation fails → Dead letter queue, manual reconciliation  
**Performance:** 500 payments/hour | **Availability:** 99.99%  
**Sessions:** 3

---

## P-046: Payment Allocation

**Business Purpose:** Automatically allocate received payment to outstanding invoices (oldest first by default).  
**Business Owner:** Finance Director | **Priority:** P0 — Critical  
**Trigger:** Payment recorded (P-045)  
**Inputs:** Payment ID, Customer ID, Amount  
**Outputs:** Invoice paidAmounts updated. Payment status → ALLOCATED or PARTIALLY_ALLOCATED.  
**Primary Actor:** System (Allocation Engine) | **Validation:** Sum of allocations must not exceed payment amount.  
**Decision Points:** Full payment? → All invoices fully or partially paid. Overpayment? → Remaining balance → customer ledger credit.  
**Sessions:** 3

---

## P-047: Partial Payment

**Business Purpose:** Handle a payment that is less than the total outstanding balance.  
**Priority:** P0 — Critical | **Allocation:** Amount allocated to oldest invoice first. Remaining invoices remain overdue.  
**Sessions:** 1

---

## P-048: Refund

**Business Purpose:** Return funds to a customer due to overpayment, dispute resolution, or cancellation.  
**Priority:** P1 — High | **Trigger:** Customer request, Credit balance on account  
**Permissions:** payments.* (supervisor for large amounts) | **Sessions:** 2

---

## P-049: Credit Note

**Business Purpose:** Issue a credit note to reduce or cancel an invoice amount. | **Priority:** P1  
**Trigger:** Invoice dispute resolved in customer favor, Billing error correction, Service credit  
**Sessions:** 2

---

## P-050: Debit Note

**Business Purpose:** Issue a debit note to increase an invoice amount (undercharge correction). | **Priority:** P1  
**Sessions:** 2

---

## P-051: Collection Assignment

**Business Purpose:** Assign an overdue invoice to a collection officer for follow-up.  
**Business Owner:** Collection Director | **Priority:** P0 — Critical  
**Trigger:** Invoice overdue past threshold (typically 30/60/90 days)  
**Preconditions:** Invoice is in OVERDUE status. All auto-notifications sent.  
**Inputs:** Invoice ID, Customer ID, Outstanding amount, Aging bucket (30/60/90/120+), Assigned collector  
**Outputs:** CollectionCase created. Invoice status → IN_COLLECTIONS. Collector notified.  
**Primary Actor:** System (auto-assignment) | **Secondary Actors:** Collection Manager (manual override)  
**Permissions:** collections.* | **Allocation:** Round-robin by collector workload OR priority-based for high-value accounts.  
**Decision Points:** High-value customer? → Senior collector assigned. Medical hardship? → Special handling workflow.  
**Sessions:** 2

---

## P-052: Collection Visit

**Business Purpose:** Field visit to customer premises for payment collection or disconnection.  
**Priority:** P0 — Critical | **Trigger:** Assignment received (P-051)  
**Primary Actor:** Collection Officer | **Sessions:** 3

---

## P-053: Collection Completion

**Business Purpose:** Close a collection case when payment is received or case resolved. | **Priority:** P0  
**Trigger:** Full payment received, Payment arrangement completed, Case resolved (write-off/legal)  
**Outputs:** CollectionCase status → CLOSED. Resolution documented. | **Sessions:** 1

---

## P-054: Collection Escalation

**Business Purpose:** Escalate unresolved collection cases to higher authority (manager, legal, external agency).  
**Priority:** P1 — High | **Trigger:** Case unresolved after threshold (configurable: 90/120/150 days)  
**Decision Points:** Amount > threshold? → Legal escalation. Amount < threshold? → Write-off or external agency.  
**Sessions:** 2

---

## P-055: Customer Ledger Update

**Business Purpose:** Update the customer's financial ledger with any transaction (invoice, payment, adjustment, credit).  
**Priority:** P0 — Critical | **Trigger:** Any financial transaction  
**Primary Actor:** System | **Sessions:** 2

---

## P-056: General Ledger Posting

**Business Purpose:** Post financial transactions to the General Ledger for accounting and reporting.  
**Business Owner:** Finance Director | **Priority:** P0 — Critical  
**Trigger:** Invoice issued, Payment recorded, Adjustment posted, Month-end close  
**Preconditions:** Chart of Accounts must exist. Account mapping rules must be configured.  
**Inputs:** Transaction type (invoice/payment/adjustment), Amount, Customer/invoice reference  
**Outputs:** GeneralLedgerEntry records created. Account balances updated.  
**Primary Actor:** System (GL Engine) | **Permissions:** finance.admin  
**Validation:** Every posting must have equal debits and credits. Account must exist and be active.  
**Decision Points:** Revenue account? → Credit. Receivable account? → Debit. Cash account? → Debit.  
**Business Rules:** GL posting is irrevocable after period close. Corrections require reversing entry.  
**Dependencies:** P-013 (Accounting domain), Chart of Accounts configured  
**Sessions:** 5

---

## P-057: Journal Posting

**Business Purpose:** Create and post manual journal entries for adjustments, corrections, and non-standard transactions.  
**Priority:** P0 — Critical | **Permissions:** finance.admin (post), finance.director (approve)  
**Sessions:** 3

---

## P-058: Bank Reconciliation

**Business Purpose:** Match bank statement transactions against system payment records.  
**Priority:** P1 — High | **Trigger:** Bank statement imported, Monthly close  
**Sessions:** 4

---

## P-059: Month Close

**Business Purpose:** Close the financial period, posting all adjustments and generating period-end reports.  
**Business Owner:** Finance Director | **Priority:** P0 — Critical  
**Trigger:** Last day of month  
**Preconditions:** All invoices issued. All payments allocated. All journal entries posted. Bank reconciled.  
**Activities:** Post adjustments, Run trial balance, Review anomalies, Generate reports (P&L, Balance Sheet), Lock period  
**Primary Actor:** Finance (System-assisted) | **Permissions:** finance.director  
**SLA:** < 5 business days after month end | **KPI:** Close within 5 days > 95%  
**Sessions:** 5

---

## P-060: Year Close

**Business Purpose:** Close the fiscal year with annual adjustments, audit preparation, and financial report generation.  
**Priority:** P0 — Critical | **Trigger:** December 31 / Fiscal year end  
**SLA:** < 15 business days after year end | **Sessions:** 8
