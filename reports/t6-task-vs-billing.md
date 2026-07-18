# Task vs Billing

**Date:** 2026-06-17
**Auditor:** OpenCode (DeepSeek V4 Flash)

## Billing Engine Audit

### Implemented
| Feature | Status | Evidence |
|---------|--------|----------|
| Tariff management (T061) | ✅ | tariff.service.ts, period.service.ts |
| Invoice generation (T062) | ✅ | billing.controller.ts (generateInvoices) |
| Water difference handling (T062a) | ✅ | Integrated into generateInvoices |
| Invoice issue + immutability (T063) | ✅ | billing.controller.ts (issueInvoice) |
| Invoice adjustments (T064) | ✅ | billing.controller.ts (addAdjustment) |
| Payments + allocation (T065) | ✅ | billing.controller.ts (createPayment) |
| Contract tests (T053-T056) | ✅ | All 4 contract test files pass |
| Integration tests (T057-T060) | ✅ | All 4 integration test files pass |

### Missing
| Feature | Status | Evidence |
|---------|--------|----------|
| Payment reversal (T066) | ❌ | No POST /payments/:id/reverse endpoint |
| Customer statement (T067) | ❌ | No GET /customers/:id/statement endpoint |
| Ledger statement view | ❌ | customer_statement_view exists in DB but no API |

### Billing Variance: 0 (no discrepancies found between implemented and expected)
- Invoice amounts correctly computed (subtotal + tax = total)
- Payment allocation oldest-due-first implemented
- Ledger append-only with running balance
- Invoice immutability enforced (immutable_at)
