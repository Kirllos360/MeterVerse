# Business Domain Analysis — 8 Excel Files

**Date:** 2026-07-23
**Source:** Real business data from MeterVerse operations

---

## Summary of Findings

These 8 Excel files are the **current manual tracking system**. They reveal the true scope of MeterVerse:

### The Business
Property management / utility billing company managing multiple areas:
- **Golf Extension** (villas)
- **October** (Smart Water)
- **Palm Central** (BTU + Water)
- **The Crown** (Electricity + Water)

### What Each File Contains

| File | Rows | Columns | Business Entity |
|------|------|---------|-----------------|
| Golf Invoices Tracking | 2,857 | 80 | Customer invoices per meter + monthly consumption |
| October Smart Water | 3,073 | 67 | Customer invoices per meter + monthly consumption |
| Palm Central Water BTU | 52 | 33 | Commercial BTU + Water meter invoices |
| Solar Tracking Sheet Golf | 215 | 78 | Solar meter invoices per customer |
| Crown Electricity | 1,205 | 75 | Electricity invoice tracking |
| Crown Water | 1,102 | 70 | Water invoice tracking |
| **Water Collection** | **1,047,034** | 8 | Monthly payment collections |
| **Electricity Collection** | **~500,000** | 8 | Monthly payment collections |

### Data Structure

**Invoice Tracking files** (6 files) — column structure:
| Column | Meaning |
|--------|---------|
| Customer Name | Name in Arabic |
| Project / Unit | Area and villa/unit number |
| Meter Serial | Unique meter identifier |
| Type | Water/Electricity/Solar/BTU |
| Phone | Customer contact |
| Billing Status | Yes/No (active/inactive) |
| Opening Balance | Starting balance |
| Date columns (44227...) | Monthly invoice amounts (date serial numbers) |

**Collection files** (2 files) — 1.5M+ combined rows:
| Column | Meaning |
|--------|---------|
| Date | Payment date (Excel serial) |
| Billing Months | Which months the payment covers |
| Customer Name | Name in Arabic |
| Unit | Area and unit number |
| Amount Paid | Payment amount |
| Payment Method | POS / Cash / Online / Bank Transfer |
| Notes | Additional info |

### What This Reveals About Required Features

1. **Customer Ledger** — Running balance per customer (opening balance + invoices - payments)
2. **Accountant Ledger** — Journal entries for financial tracking
3. **Payment Center** — Multi-method payment processing (POS, cash, online, bank transfer)
4. **Meter Readings → Invoice Pipeline** — Monthly amounts pre-calculated and stored
5. **High-volume transaction processing** — The Water Collection file alone has 1M+ rows
6. **Multi-area, multi-project hierarchy** — Each area has its own customers, meters, rates
7. **Unit/Villa management** — Customers are assigned to physical units
8. **Billing status management** — Active/inactive customers
9. **Opening balance tracking** — Historical debt carried forward
10. **Arabic language support** — All customer names in Arabic

### What This Means for the System

The current Prisma schema (78 models) covers about 40% of what these Excel files reveal. Missing:
- **Customer Ledger** — Not just invoices but running balance with opening balance
- **Payment reconciliation** — Matching payments to specific invoice periods
- **Collection reports** — Per-method, per-period collection summaries
- **Unit/Villa master data** — Physical unit registry per project/area
- **High-volume optimization** — 1M+ rows needs proper indexing and pagination
- **Arabic language UI** — Names and interface in Arabic
- **Payment method tracking** — POS terminal, bank transfer, cash, online

This adds approximately **15-20 new features** not yet in any wave or phase.
