# Financial Model

## Current Knowledge
**From data analysis:**
- Customer ledger: opening balance + monthly invoices - payments = closing balance
- Payment center: collections via POS, Cash, Bank Transfer, Online
- Ledger tracks per customer per month

**Schema:**
- Invoice, Payment, InvoiceItem models exist
- No dedicated CustomerLedger or AccountantLedger model
- No wallet/balance model

## Unknown
- Whether double-entry accounting is needed
- Whether general ledger (GL) codes are needed
- Whether financial period closing is needed
- Whether receivables aging is needed

## Assumptions
- Customer ledger can be calculated (not stored) as running balance
- Full accounting integration is Wave 07 scope

## Confidence
- Current financial schema: 60%
- Full requirements: Unknown
