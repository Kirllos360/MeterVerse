# ECG-01R-021 — Fix Header Injection in PDF Filenames

**Platform:** Security (Header Injection)  
**Priority:** P2  
**Estimated Effort:** 0.5 day  
**Depends on:** None  

## Objective

Sanitize filenames used in `Content-Disposition` headers to prevent header injection.

## Scope

### `src/downloads/downloads.service.ts`

**Line 10** — `generateTablePdf()`:
- Add sanitization: `const safeFilename = filename.replace(/[^a-zA-Z0-9\-_.]/g, '_')`
- (Line 33's `generateCsv()` already has this — replicate the same pattern)

### `src/invoices/invoice-renderer.service.ts`

**Lines 42, 53, 66** — PDF download filenames:
- Sanitize `data.invoiceNumber` before using in `Content-Disposition`
```typescript
const safeInvoiceNumber = String(data.invoiceNumber).replace(/[^a-zA-Z0-9\-_]/g, '_');
res.setHeader('Content-Disposition', `attachment; filename=invoice-${safeInvoiceNumber}.pdf`);
```

### `src/payments/payment-receipt.service.ts`

**Lines 32, 38** — Receipt PDF filenames:
- Sanitize `d.receiptNumber` before using in `Content-Disposition`
```typescript
const safeReceipt = String(d.receiptNumber).replace(/[^a-zA-Z0-9\-_]/g, '_');
res.setHeader('Content-Disposition', `attachment; filename=receipt-${safeReceipt}.pdf`);
```

## Verification

- `npx tsc --noEmit` — 0 errors
- Filename with newline characters is sanitized (no header injection)
- Filename with special characters works safely
- Normal filenames unchanged
