# RP0-B — Process Flow Reconstruction

**Date:** 2026-06-17
**Source:** tasks.md, source code analysis (all controllers/services), OR certifications, Phase D-H reports
**Mode:** DISCOVERY ONLY — No Implementation

---

## 1. Customer Creation Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│ POST /projects│────→│ POST /projects│────→│ POST /projects/  │────→│ POST /customers│
│   (create)   │     │ /:pid/locatio│     │ :pid/customers   │     │ /:cid/         │
│              │     │ ns (create   │     │ (create customer) │     │ assignments    │
│              │     │    unit)     │     │                  │     │ (assign to     │
│              │     │              │     │                  │     │    unit)       │
└──────────────┘     └──────────────┘     └──────────────────┘     └────────────────┘

Implemented: ✅ FULLY
API routes: 5 (projects) + 5 (locations) + 5 (customers: CRUD + assignment)
DB models: Project, LocationNode, Customer, CustomerUnitAssignment
```

## 2. Meter Creation + Assignment Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ POST /meters │────→│ POST /sim-   │────→│ POST /meters/:id/    │────→│ MeterAssignment   │
│ (register    │     │ cards        │     │ assign (assign meter │     │ created (active)  │
│  meter)      │     │ (register    │     │  + SIM to customer   │     │ SIMAssignment     │
│              │     │  SIM)        │     │  + unit)             │     │ created (active)  │
└──────────────┘     └──────────────┘     └──────────────────────┘     └──────────────────┘

Implemented: ✅ FULLY
API routes: 5 (meters CRUD) + 5 (SIM CRUD) + 2 (assign/terminate) + eligibility
DB models: Meter, SIMCard, MeterAssignment, SIMAssignment
Validation: Partial unique index prevents double-active assignments
Risk: customerId/unitId hardcoded as 'system' in invoice generation (G012)
```

## 3. Meter Termination + SIM Reuse Flow

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│ POST /meters/:id │────→│ Final reading check  │────→│ Meter status →   │────→│ SIM status →      │
│ /terminate       │     │ Reason required      │     │ terminated       │     │ reusable          │
│                  │     │                      │     │ Assignments→ended│     │ (cooldown may     │
│                  │     │                      │     │                  │     │  apply)           │
└──────────────────┘     └──────────────────────┘     └──────────────────┘     └───────────────────┘

Implemented: ✅ FULLY
Validation: Final reading required, reason required, atomic transaction
Edge cases: Cooldown period for SIM before reuse
```

## 4. Reading Entry Flow

```
┌──────────────┐     ┌──────────────┐     ┌────────────────┐     ┌────────────────┐
│ Reading       │────→│ Find previous│────→│ Compute        │────→│ Validate vs    │
│ submitted     │     │ reading for  │     │ consumption =  │     │ thresholds:    │
│ (manual/      │     │ same meter   │     │ current -      │     │ • negative?    │
│  import/auto) │     │              │     │ previous       │     │ • spike?       │
│               │     │              │     │                │     │ • zero?        │
└──────────────┘     └──────────────┘     └────────────────┘     └───────┬────────┘
                                                                        │
                                                        ┌───────────────┴───────────────┐
                                                        │                               │
                                              ┌──────────────────┐          ┌──────────────────────┐
                                              │ PASS: status=     │          │ FAIL: status=        │
                                              │ valid             │          │ suspicious/          │
                                              │                   │          │ pending_review       │
                                              └──────────────────┘          └──────────────────────┘
                                                                                      │
                                                                                      ▼
                                                                             ┌──────────────────┐
                                                                             │ Review queue     │
                                                                             │ (GET review-     │
                                                                             │  queue)          │
                                                                             └──────────────────┘

Implemented: ✅ FULLY (readings + validation) 
⏳ PARTIAL (review actions approve/reject/correct — T048a not implemented)
API routes: POST /readings, GET /readings/review-queue
DB models: Reading, ReadingReview, ProjectThreshold
```

## 5. Invoice Generation Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Billable readings│────→│ Resolve tariff   │────→│ Calculate via    │────→│ Invoice created  │
│ filtered by      │     │ (ratePerUnit ×   │     │ consumption ×    │     │ (status: draft)  │
│ meter/period     │     │ meterType)       │     │ ratePerUnit      │     │ customerId:      │
│                  │     │                  │     │ subtotal = rate  │     │ 'system' (G012)  │
│                  │     │                  │     │ × consumption    │     │ unitId: 'system' │
│                  │     │                  │     │ tax = subtotal   │     │                  │
│                  │     │                  │     │ × taxRate        │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                                                     │
                                                                    ┌────────────────┴────────────────┐
                                                                    │                                 │
                                                           ┌──────────────────┐          ┌──────────────────────┐
                                                           │ Electricity: ✅  │          │ Water: ✅             │
                                                           │ UtilityType:     │          │ UtilityType: water   │
                                                           │ electricity      │          │ Water diff policy    │
                                                           │                  │          │ applied if billable  │
                                                           └──────────────────┘          └──────────────────────┘

Missing invoice types: Solar (❌), Chilled Water (❌), Settlement (❌)
Missing features: Due date (G026), Cancel endpoint (G017), PDF output (G005)
Risk: Destructive regeneration (G018) — deletes before recreating
```

## 6. Invoice Issue Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ POST /invoices/  │────→│ High-risk check  │────→│ Set immutableAt  │────→│ Ledger entry     │
│ :id/issue        │     │ • manual adjust? │     │ (timestamp)      │     │ created:         │
│                  │     │ • over-threshold?│     │ Status → issued  │     │ invoice_charge   │
│                  │     │ • flagged?       │     │                  │     │ + audit log      │
│                  │     │ If high-risk:    │     │                  │     │                  │
│                  │     │ → 409 (requires  │     │                  │     │                  │
│                  │     │     approval)    │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘

Implemented: ✅ FULLY
Validation: Immutability enforced after issue — only adjustments allowed
```
## 7. Payment Collection + Allocation Flow

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ POST /payments   │────→│ Allocation:          │────→│ Invoice          │────→│ Ledger entry:    │
│ (amount, method, │     │ oldest-due-first by  │     │ remainingAmount  │     │ payment_credit   │
│  customer,       │     │ default, or explicit │     │ -= allocatedAmt  │     │ running_balance  │
│  optional notes) │     │ invoice allocation   │     │ Status update if │     │ updated          │
│                  │     │                      │     │ → fully paid     │     │                  │
└──────────────────┘     └──────────────────────┘     └──────────────────┘     └──────────────────┘

Implemented: ✅ FULLY
Payment methods: cash, bank_transfer, card, online, cheque, wallet (mobile)
Validation: No over-allocation, sum(allocation) = payment amount
```

## 8. Payment Reversal Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ POST /payments/  │────→│ Super_admin      │────→│ Payment status→  │────→│ Ledger entry:    │
│ :id/reverse      │     │ role check       │     │ reversed           │     │ payment_reversal │
│ (reason required)│     │ (else 403)       │     │ Allocations        │     │ running_balance  │
│                  │     │                  │     │ reversed           │     │ recalculated     │
│                  │     │                  │     │ Invoice remaining  │     │ + audit log      │
│                  │     │                  │     │ restored           │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘

Implemented: ✅ FULLY
Guard: Server-side role check (not UI-only)
Validation: Mandatory reason field
```

## 9. Customer Statement Flow

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│ GET /customers/  │────→│ customer_statement_   │────→│ Returns:         │
│ :id/statement    │     │ view (DB view):       │     │ • opening balance│
│ (with date       │     • opening_balance       │     │ • entries (list) │
│  range filter)   │     • running_balance       │     │ • closing balance│
│                  │     • ledger entries         │     │ • running total  │
└──────────────────┘     └──────────────────────┘     └──────────────────┘

Implemented: ✅ FULLY
DB: customer_statement_view (derived view T019)
Ledger: Append-only, deterministic running balance
```

## 10. Solar Wallet Flow (Reference Only — NOT IMPLEMENTED)

```
Flask Collection System reference:
┌──────────────┐     ┌────────────────┐     ┌────────────────┐     ┌─────────────────┐
│ Solar meter  │────→│ Production     │────→│ Wallet          │────→│ Wallet balance  │
│ (electricity │     │ reading (kWh   │     │ calculation:   │     │ applied to      │
│  meter with  │     │ generated)     │     │ consumption -  │     │ invoice charges │
│  solar flag) │     │ Register 180/  │     │ production =   │     │ Excess carried  │
│              │     │ 280 tracking   │     │ net metering   │     │ forward         │
└──────────────┘     └────────────────┘     └────────────────┘     └─────────────────┘

Status: ❌ NOT IMPLEMENTED IN METER VERSE
Reference: `reference/collection-system/app/routes_transactions.py`, `charge_engine.py`
```

## 11. Chilled Water Billing Flow (Reference Only — NOT IMPLEMENTED)

```
Flask Collection System reference (Phase F certified):
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ BTU meter        │────→│ BTU reading      │────→│ Consumption =    │────→│ Invoice:         │
│ (chilled water)  │     │ (from meter,     │     │ current -        │     │ Total = Consump. │
│                  │     │  parsed from     │     │ previous         │     │ × Rate (3.0 EGP │
│                  │     │  notes field)    │     │                  │     │ / BTU default)   │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                                                     │
                                                                            ┌──────────────────┐
                                                                            │ Settlement:      │
                                                                            │ Config → Calc →  │
                                                                            │ Approve (DRAFT→  │
                                                                            │ APPROVED)        │
                                                                            │ Carry-forward,   │
                                                                            │ versioning       │
                                                                            └──────────────────┘

Status: ❌ NOT IMPLEMENTED IN METER VERSE
Certified reference: Phase F (206 BTU invoices + 15 settlements, 100% match, 1,000 stress cycles)
Formula: Total = Consumption (BTU) × Rate_per_BTU (default 3.0 EGP, custom 2.44 for AirZon)
```

## 12. Settlement Lifecycle Flow (Reference Only — NOT IMPLEMENTED)

```
Flask Collection System reference:
┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ ChilledWater   │────→│ ChilledWater   │────→│ Approval       │────→│ Invoice        │
│ Config         │     │ Settlement     │     │ (DRAFT→        │     │ (settlement    │
│ (base_btu_rate,│     │ (version=x,    │     │  APPROVED)     │     │  amount added  │
│  monthly_fixed │     │  FIXED/        │     │ Edit → new     │     │  to invoice)   │
│  amount)       │     │  PERCENTAGE/   │     │ version (x+1)  │     │                │
│                │     │  ONE_TIME)     │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘

3 Settlement Types: FIXED (monthly fixed amount), PERCENTAGE (% of charges), ONE_TIME (single charge)
Status: ❌ NOT IMPLEMENTED IN METER VERSE
```

## 13. Bill Cycle Governance Flow (NOT IMPLEMENTED)

```
Current state (no governance):
BillingPeriod: open → closed (direct status set, no workflow)

Required governance:
┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ OPEN cycle     │────→│ Approval by    │────→│ CLOSED cycle   │────→│ CANCELLED      │
│ (with same-    │     │ authorized     │     │ (blocks new    │     │ (mandatory     │
│  month/        │     │ role)          │     │  invoice gen)  │     │  reason +      │
│  service guard)│     │                │     │                │     │  audit)        │
└────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘

Status: ❌ NOT IMPLEMENTED
Missing: OPEN→CLOSE→CANCELLED workflow, approval gate, duplicate prevention, same-month guard, audit
```

## 14. PDF/Template Pipeline (NOT IMPLEMENTED)

```
Current state: Pipeline stops at Service layer (OR8 finding)

Reference pipeline (Flask template_v3.py):
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Database │───→│    API   │───→│   DTO    │───→│ Service  │───→│ Template │───→│   PDF    │
│ (24      │    │ (11      │    │ (partial │    │ (exists) │    │ (Jinja2  │    │(WeasyPrint│
│  models) │    │  control │    │  class-  │    │          │    │  HTML)   │    │ HTML→PDF)│
│          │    │  lers)   │    │  valid.) │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
Status:    ✅        ✅          ⚠️            ✅              ❌              ❌
```

## 15. End-to-End Billing Cycle (Current Working Flow)

```
Month Opening:
  Project Admin → Create BillingPeriod (OPEN)

Mid-Month Operations:
  Operator → Enter readings (manual/import/automatic)
  System → Validate readings against thresholds
  Reviewer → Review flagged readings (approve/reject/correct) ⏳ partial

Month End Billing:
  Finance → Generate invoices (POST /invoices/generate) → Draft
  Finance → Issue invoices (POST /invoices/:id/issue) → Issued
  System → Write ledger entries (invoice_charge)
  
Payment Operations:
  Collector → Record payment (POST /payments) → oldest-due-first allocation
  System → Update invoice remaining amounts
  System → Update ledger running balance
  
Reversal (exceptional):
  Super Admin → POST /payments/:id/reverse (with reason)
  System → Reverse allocations, restore invoice balance
  
Customer Service:
  Support → View customer statement (GET /customers/:id/statement)
  Support → View invoice detail + payment history
  Support → Create adjustment (POST /invoices/:id/adjustments)
```

## Key: Implemented Processes (Verified Working)

| Flow | Status | Verification Source |
|------|--------|-------------------|
| Customer → Unit creation + assignment | ✅ | T029, E2E acceptance |
| Meter → SIM registration + assignment | ✅ | T030-T032, E2E acceptance |
| Meter termination → SIM reuse | ✅ | T033, E2E acceptance |
| Reading entry → consumption calc | ✅ | T047, E2E acceptance |
| Reading validation + review queue | ✅ | T046, T048, E2E acceptance |
| Invoice generation (electricity + water) | ✅ | T062, E2E acceptance, 12/12 |
| Invoice issue + immutability | ✅ | T063, E2E acceptance |
| Invoice adjustments | ✅ | T064 |
| Payment recording + allocation | ✅ | T065, E2E acceptance |
| Payment reversal (super_admin) | ✅ | T066 |
| Customer statement + ledger | ✅ | T067, E2E acceptance |
| Water balance (main-vs-sub) | ✅ | T048a, T062a |

## Key: Missing Processes (Not Working)

| Flow | Dependencies | Est. Effort |
|------|-------------|-------------|
| Solar wallet calculation + ledger | T107 | 2w |
| Solar register tracking (180/280) | T107 | 2w |
| Chilled water BTU reading + invoicing | T088, T097 | 3w |
| Settlement config → calc → approve | T088 | 3w |
| Bill cycle OPEN→CLOSE→CANCEL | T203 | 1w |
| Invoice → PDF → QR → Hash | T201, T212, T213 | 3w |
| Report generation (async jobs) | T073 | 2w |
