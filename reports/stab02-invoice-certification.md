# STAB-02 Invoice Certification

## Status: CERTIFIED

| Criterion | Result | Evidence |
|-----------|--------|----------|
| `POST /invoices/generate` creates invoice | ✅ | 202, `generatedCount: 1`, invoice in DB |
| Invoice contains correct lines | ✅ | 3 lines, consumption 1266 × 12.5 = 15825 |
| `GET /invoices` returns list | ✅ | 200, nested lines array |
| `GET /invoices/:id` returns detail | ✅ | 200, full invoice with lines |
| `POST /invoices/:id/issue` validates | ✅ | Returns `approval_required` for >10000 (by design) |
| DB persistence verified | ✅ | Invoice + lines in `sim_system.invoices` + `sim_system.invoice_lines` |

## INVOICES_CERTIFIED = YES
