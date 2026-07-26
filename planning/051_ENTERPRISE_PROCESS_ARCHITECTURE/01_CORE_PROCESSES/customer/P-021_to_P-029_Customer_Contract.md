# Customer & Contract Process Specifications (P-021 to P-029)

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/01_CORE_PROCESSES/customer/P-021_to_P-029_Customer_Contract.md`

---

## P-021: Customer Registration

**Business Purpose:** Onboard a new customer into the MeterVerse platform with all required identity and contact details.  
**Business Owner:** CRM Director | **Priority:** P0 — Critical  
**Preconditions:** Customer identity verified. No duplicate record exists.  
**Inputs:** Customer name, Email (unique), Phone, Address, Tax ID (corporate), Customer type (individual/corporate/govt)  
**Outputs:** Customer record created. Welcome notification sent.  
**Primary Actor:** Customer Service | **Secondary Actors:** Customer (self-registration via portal)  
**Roles:** customers.create (staff), Public (self-registration)  
**Permissions:** `customers.create`  
**Validation Rules:** Email format valid. Phone number format valid. Tax ID required for corporate.  
**Decision Points:** Corporate customer? → Collect tax ID, company registration. Government? → Special terms apply.  
**Exception Paths:** Duplicate email → Merge with existing (P-024). Invalid ID → Request resubmission.  
**SLA:** 30 minutes for staff registration. Instant for self-registration. | **KPI:** Registration accuracy > 99%  
**Business Rules:** Email must be unique across active customers. Government customers have special payment terms.  
**Dependencies:** None (entry point) | **Downstream:** P-002 (Meter Assignment), P-026 (Contract Creation)  
**Related APIs:** POST /api/customers, GET /api/customers  
**DB Tables:** Customer, CustomerGroup (via GroupMember)  
**UI:** /admin/customers (Add button), /register (public)  
**Notifications:** Welcome email, Verify email  
**Events:** CustomerCreated  
**Wave:** 01 | **Sessions:** 2

---

## P-022: Customer Restore

**Business Purpose:** Reactivate an archived customer record. | **Priority:** P1 — High  
**Trigger:** Customer returns, Accidental archive correction, Legal requirement  
**Preconditions:** Customer must be in ARCHIVED status  
**Inputs:** Customer ID, Restore reason  
**Outputs:** Customer status → ACTIVE. ArchivedAt → NULL.  
**Permissions:** `customers.create` | **SLA:** 1 hour | **Sessions:** 1

---

## P-023: Customer Archive

**Business Purpose:** Soft-delete a customer record with all safeguards. | **Priority:** P1  
**Trigger:** Customer request, Death, Business closure, Legal requirement  
**Preconditions:** No active meters. No unpaid invoices. No active contracts. All assignments ended.  
**Guard:** Cannot archive with active meters (MTR-005). Cannot archive with unpaid invoices (CST-002).  
**Permissions:** `customers.delete` | **Sessions:** 1

---

## P-024: Customer Merge

**Business Purpose:** Merge duplicate customer records into a single record, preserving all related data. | **Priority:** P2  
**Trigger:** Duplicate detected, Customer request (multiple properties), Corporate restructuring  
**Preconditions:** Source and target customers identified. All related records reviewed.  
**Inputs:** Source customer ID (to be archived), Target customer ID (surviving), Merge rules (which records to reassign)  
**Outputs:** All meters, contracts, invoices, payments reassigned to target. Source customer archived.  
**Primary Actor:** Customer Service (supervisor) | **Sessions:** 3

---

## P-025: Customer Migration

**Business Purpose:** Move a customer from one area/project to another, preserving all history. | **Priority:** P2  
**Trigger:** Customer moves to new location, Area reassignment  
**Inputs:** Customer ID, Target area/project, New unit ID (if applicable)  
**Dependencies:** P-002 (Meter Assignment), P-026 (Contract) | **Sessions:** 3

---

## P-026: Contract Creation

**Business Purpose:** Establish a formal service agreement between the utility and the customer.  
**Business Owner:** Legal & Contracts Director | **Priority:** P0 — Critical  
**Preconditions:** Customer must exist. Contract template must exist.  
**Inputs:** Customer ID, Contract type (standard/corporate/government), Start date, End date (if term), Terms (JSON), Auto-renew flag, Signed by/at (optional)  
**Outputs:** Contract created. MeterAssignment can now reference this contract.  
**Primary Actor:** Customer Service | **Secondary Actors:** Customer (sign), Legal (review for non-standard)  
**Permissions:** `contracts.create` | **Validation:** Start date before end date. Required terms present.  
**SLA:** 1 business day | **Sessions:** 2

---

## P-027: Contract Renewal

**Business Purpose:** Renew a contract at end of term, with optional terms update. | **Priority:** P1  
**Trigger:** Contract end date approaching (auto-renew), Customer request (manual renew)  
**Preconditions:** Current contract must not be cancelled. Auto-renew flag checked.  
**Decision Points:** Auto-renew enabled? → Generate renewal automatically. Manual renew? → Customer service initiates.  
**Sessions:** 2

---

## P-028: Contract Suspension

**Business Purpose:** Temporarily suspend a contract (e.g., seasonal vacancy, renovations). | **Priority:** P1  
**Preconditions:** Contract in ACTIVE status. All invoices paid to date.  
**Outputs:** Contract status → SUSPENDED. Billing paused. Meter may be disconnected.  
**Sessions:** 1

---

## P-029: Contract Cancellation

**Business Purpose:** Permanently terminate a contract before end of term. | **Priority:** P1  
**Trigger:** Customer request, Breach of terms, Move-out  
**Preconditions:** All outstanding invoices paid. Final reading taken. Meter disconnected (if applicable).  
**Guard:** Cannot cancel with unpaid balance. Early termination fee may apply.  
**Permissions:** contracts.delete | **Sessions:** 2
