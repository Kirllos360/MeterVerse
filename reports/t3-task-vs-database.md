# Task vs Database

**Date:** 2026-06-17
**Auditor:** OpenCode (DeepSeek V4 Flash)

## Database Audit

**Tables in DB:** 22
- _prisma_migrations
- audit_log
- billing_periods
- customer_ledger_entries
- customer_unit_assignments
- customers
- idempotency_records
- invoice_adjustments
- invoice_lines
- invoices
- location_nodes
- meter_assignments
- meters
- payment_allocations
- payments
- projects
- reading_reviews
- readings
- report_jobs
- sim_assignments
- sim_cards
- tariff_plans

**Total columns:** 263

**Missing from DB (in Prisma but not migrated):**
- project_thresholds
- refresh_tokens
- login_attempts


### Task-to-Table Mapping
| Task | Table(s) | Status |
|------|----------|--------|
| T013 | projects, location_nodes, customers, customer_unit_assignments | ✅ EXISTS |
| T014 | meters, sim_cards, meter_assignments, sim_assignments | ✅ EXISTS |
| T015 | readings, reading_reviews, tariff_plans, billing_periods | ✅ EXISTS |
| T016 | invoices, invoice_lines, invoice_adjustments | ✅ EXISTS |
| T017 | payments, payment_allocations, customer_ledger_entries | ✅ EXISTS |
| T018 | audit_log, report_jobs | ✅ EXISTS |
| T019 | customer_statement_view, meter_assignment_active_view, sim_assignment_active_view | ✅ EXISTS |
| T046 | project_thresholds | ❌ MISSING |
| T009 | (JWT auth uses .env, no user table) | ✅ CONFIGURED |
| T008 | idempotency_records | ✅ EXISTS |
| T066-T067 | payment_reversal/statement endpoints | ❌ NOT IMPLEMENTED |
