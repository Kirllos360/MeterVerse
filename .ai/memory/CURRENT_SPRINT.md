# MeterVerse - Current Sprint

## P13.6 Solar Invoice Vertical — INTERNAL GATE COMPLETION (2026-08-17)

**Goal:** Finish and certify every solar vertical gate not blocked by the external register source.  
**Status:** COMPLETE (internal) — G01/G07 remain external; gate matrix in planning/063_SOLAR_VERTICAL_GATE_MATRIX.md

| Item | Result |
|------|--------|
| Migration | 20260817000000_add_invoice_billing_period — applied LIVE (migrate deploy), columns verified, client regenerated |
| Engine | persistSolarInvoice honors full contract; deterministic business-key number (SOLAR-{serial}-{period}); period fields persisted |
| Tenancy (G22) | invoice areaId derived from customer.areaId (client input ignored) — horizontal-privilege fix |
| RBAC (G21) | solar gate billing.* → invoices.create (area_manager/billing enabled) |
| Idempotency | Invoice.number unique constraint = authoritative dedupe; P2002 → 409 DUPLICATE |
| PDF (G16) | 4 unit tests w/ PDFParse text extraction; renderer = pdfkit (no Jasper in MeterVerse) |
| Tests | Suite 428 (410/18): +26 solar unit/route, +4 pdf |
| Live cert | API compute reproduces REAL 36.10 from derived 54.26 kWh (read-only) |
| Graph/SpecKit | 12/0/0 + 100% |
| External blocker | G01/G07: real register source (Symbiot endpoint+credentials OR file OR derived authorization) |
| Next | resolve G01 → real invoice+PDF vertical; or P12.2-B |


