# OR6 — Invoice Generation Certification

**Date:** 2026-06-17
**Classification:** ⚠️ PARTIAL

---

## Sample Invoice Support

| Invoice Type | Status | Evidence |
|-------------|--------|----------|
| Electricity | ✅ GENERATES | `utilityType: 'electricity'` in `generateInvoices()`. Tested via E2E acceptance (12/12 passing). |
| Water | ✅ GENERATES | `utilityType: 'water'` in `generateInvoices()`. Water difference policy applied for main meters. Tested. |
| Solar | ❌ MISSING | No `solar` utility type. No `solar` meter type. |
| Chilled Water | ❌ MISSING | No `chilled_water` utility type. No BTU meter type. |
| Settlement | ❌ MISSING | No settlement routes, no settlement invoice lines. |

## Charge Components

| Component | Status | Evidence |
|-----------|--------|----------|
| Tariffs | ✅ | Applied via `tariffService.getEffectiveTariff()`. Only `ratePerUnit` multiplier. No tiered/step pricing. |
| Charges | ⚠️ PARTIAL | Only single rate × consumption. No charge modes (STEPS/FLAT/STATIC/PER_UNIT/ZERO). |
| Wallet Usage | ❌ | No solar wallet integration. |
| Taxes | ✅ | Applied via `taxRate = project.taxRate / 100` when `project.taxEnabled`. |
| Fees | ❌ | No fee/charge models in schema. |
| Customer Service Fees | ❌ | No customer service fee logic. |
| Administrative Fees | ❌ | No admin fee logic. |

## PDF Output

| Item | Status | Evidence |
|------|--------|----------|
| PDF Generation | ❌ | No PDF library in backend `package.json`. No PDF generation code. |
| Hash | ❌ | No invoice hash/checksum. |
| Verification Code | ❌ | No verification code. |
| QR Code | ❌ | No QR code generation. |

## Invoice Lifecycle

| Step | Status | Evidence |
|------|--------|----------|
| Draft | ✅ | Invoice created with `status: 'draft'` |
| Issue | ✅ | `POST /invoices/:id/issue` — sets `immutableAt`, writes ledger |
| Adjustment | ✅ | `POST /invoices/:id/adjustments` — credit/debit with reason |
| Cancel | ❌ | No cancel endpoint |
| Overdue detection | ❌ | No overdue logic |
| PDF download | ❌ | No PDF generation |

## Sample Invoice Data (from generateInvoices)

```
Invoice:
  invoiceNumber: INV-{periodCode}-{meterId[0:8]}
  utilityType: electricity | water
  status: draft
  subtotalAmount: consumption × ratePerUnit
  taxAmount: subtotal × taxRate
  totalAmount: subtotal + tax
  remainingAmount: totalAmount
  paidAmount: 0

InvoiceLines:
  description: "Consumption {date}"
  quantity: consumptionValue
  unitPrice: ratePerUnit
  lineAmount: consumptionValue × ratePerUnit
```

## Field Coverage

| Field | Generated? | PDF Visible? | Notes |
|-------|-----------|-------------|-------|
| Invoice number | ✅ | N/A | Format: INV-{period}-{meterId} |
| Customer name | ❌ | N/A | Hardcoded `customerId: 'system'` |
| Unit info | ❌ | N/A | Hardcoded `unitId: 'system'` |
| Meter serial | ✅ | N/A | Via meter reference |
| Utility type | ✅ | N/A | electricity/water |
| Consumption | ✅ | N/A | From readings |
| Rate | ✅ | N/A | From tariff |
| Subtotal | ✅ | N/A | |
| Tax | ✅ | N/A | |
| Total | ✅ | N/A | |
| Due date | ❌ | N/A | Not set during generation |
| QR/Verification | ❌ | N/A | |
| Amount in words | ❌ | N/A | |

## Classification

| Criterion | Result |
|-----------|--------|
| Electricity invoice generation | ✅ PASS |
| Water invoice generation | ✅ PASS |
| Solar/Chilled/Settlement invoice | ❌ MISSING |
| PDF output | ❌ MISSING |
| QR/Verification/Hash | ❌ MISSING |
| Charge modes (beyond flat rate) | ❌ MISSING |
| Customer/Unit info in invoice | ❌ MISSING (hardcoded) |
| Tax support | ✅ PASS |
| Due date logic | ❌ MISSING |

**Verdict: PARTIAL — Invoice generation works for electricity and water with flat-rate tariffs and tax. However, it lacks: solar/chilled water/settlement invoice types, all PDF output (with QR/verification/hash), proper customer/unit attribution (hardcoded to 'system'), charge modes beyond simple rate×consumption, due date logic, and cancel workflow. 7/18 (39%) charge components and lifecycle steps implemented.**
