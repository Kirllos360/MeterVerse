# P49.5 — Enterprise Capability Matrix

**Date:** 2026-08-01 · Compares MeterVerse against all other repositories.
Legend: ✅ MeterVerse has it · ⚠️ Partial in MeterVerse · 🔴 Missing in MeterVerse

| Capability | MeterVerse status | Meter Pulse (Abady) | Mete | collection-tracker | Missing? | Recommended action |
|---|---|---|---|---|---|---|
| Auth / JWT / MFA | ✅ | ✅ | ✅ | ✅ | No | Reuse MeterVerse |
| RBAC / permissions | ✅ | ✅ (8 roles × 40 perms) | ✅ | ✅ (27 perms) | No | — |
| Org / Area / Project hierarchy | ✅ | ✅ | ✅ | ✅ | No | — |
| Meter lifecycle | ✅ | ✅ (state machine) | ✅ | ⚠️ (customer-focused) | No | — |
| Combined channel (5.8.0) | ✅ (MPRTFk SQL) | ❌ | ❌ | ❌ | No | MeterVerse unique |
| SIM lifecycle + cooldown | ✅ (sim routes) | ✅ | ✅ | ❌ | No | — |
| Reading intake + validation | ✅ | ✅ (threshold/spike) | ✅ | ⚠️ (solar) | No | Adopt spike/threshold profiles |
| Water-balance / NRW | ✅ (water-balance.js) | ✅ (main−Σchild) | ✅ | ❌ | No | Adopt variance model |
| Tariff engine | ✅ (versioned) | ✅ (tiered+charges) | ✅ | ✅ (tiered 4 utilities) | No | — |
| Billing cycle / batch invoices | ✅ | ✅ (batch, approval>10k) | ✅ | ✅ | No | — |
| Invoice immutability + QR/hash | ⚠️ (issued immutable) | ✅ (hash+QR) | ✅ (InvoiceHash/QR) | ❌ | ⚠️ | Adopt invoice hash/QR |
| Payment allocation (oldest-due) | ✅ (payments route) | ✅ ($transaction) | ✅ | ✅ | No | — |
| Ledger / running balance | ✅ (GL) | ✅ (ledger.service) | ✅ | ✅ | No | — |
| **Collections intelligence** | ✅ (C13-W04) | ✅ (aging/actions) | ✅ (aging/dashboard) | ✅ (KPIs/debtors) | No | **Adopt collection-tracker KPIs** |
| **Settlement / wallet / chilled-water / gas** | ❌ | ❌ | ✅ (full modules) | ⚠️ (chilled/solar) | 🔴 | **Extract from Mete** (future phase) |
| **Bank reconciliation** | ❌ (W05 not built) | ❌ | ❌ | ⚠️ (kashier) | 🔴 | Planned C13-W05 |
| Revenue assurance / leakage | ✅ (15 rules) | ❌ | ❌ | ❌ | No | MeterVerse unique |
| Financial AI (forecast/MC) | ✅ | ❌ | ❌ | ❌ | No | MeterVerse unique |
| Financial reporting (P&L/BS/CF) | ✅ | ⚠️ (reports) | ✅ (reports/jasper) | ✅ (reports) | No | Adopt Jasper templates |
| Workflow / BPM | ✅ (C23) | ❌ | ❌ | ❌ | No | MeterVerse unique |
| Multi-tenant (C22) | ✅ | ❌ | ❌ | ✅ (area schemas) | No | — |
| Audit + hashed audit | ✅ (audit) | ✅ (hashed) | ✅ | ✅ | No | Adopt hashed-chain |
| Idempotency / CSRF | ✅ (idempotency.js) | ✅ (both) | ⚠️ | ✅ (CSRF) | No | — |
| Notifications (email/sms/push) | ⚠️ (engine, smtp placeholder) | ✅ | ✅ | ✅ (alerts/chat) | ⚠️ | Wire real delivery (C25) |
| **Tickets / support / claims** | ⚠️ (tickets placeholder) | ✅ | ✅ (Ticket/Claim) | ❌ | 🔴 | **Extract from Abady/Mete** (C14) |
| **Documents / records governance** | ⚠️ (legacy StoredFile) | ❌ | ✅ (DocumentTemplate) | ✅ (attachments) | 🔴 | C24 build (planned) |
| **Excel import/export + validation** | ⚠️ (crud-service) | ⚠️ | ✅ | ✅ (robust) | ⚠️ | **Adopt collection-tracker import** |
| **PDF receipts / statements / batch ZIP** | ⚠️ (pdf-engine basic) | ✅ (jasper) | ✅ (60+ jrxml) | ✅ (fpdf2) | ⚠️ | **Adopt Jasper templates** |
| **Per-area data isolation** | ✅ (per-DB SQL Server) | ⚠️ | ✅ (area schema) | ✅ (8 schemas) | No | — |
| OpenAPI contract | ⚠️ (swagger.js) | ✅ (full yaml) | ⚠️ | ❌ | ⚠️ | **Adopt OpenAPI contract** |
| Password policy / login lockout | ✅ (lockout) | ✅ (policy service) | ✅ | ✅ (LoginAttempt) | No | — |
| SMS/OTP | ✅ (sms-engine) | ✅ | ✅ (OTP) | ❌ | No | — |
| Bulk operations / search | ✅ (search/crud) | ✅ | ✅ | ✅ | No | — |
| i18n AR/EN + RTL | ✅ (next-intl) | ⚠️ | ⚠️ | ✅ (87 KB dict) | No | — |

## Summary

- **MeterVerse is the most complete** — unique on combined channels, revenue assurance, financial AI, workflows, multi-tenant, C13 collections.
- **Top extraction candidates (missing in MeterVerse):**
  1. **Settlement / wallet / chilled-water / gas** (from Mete) — real modules MeterVerse lacks.
  2. **Tickets / support / claims** (from Abady/Mete) — needed for C14 user portal.
  3. **JasperReports templates + PDF receipts** (from Mete) — 60+ report definitions.
  4. **Excel import/export validation** (from collection-tracker) — robust import center.
  5. **Invoice hash/QR immutability** (from Abady/Mete).
  6. **OpenAPI contract** (from Abady001).
  7. **collection-tracker collection KPIs** (rate, top-debtors).
- **Bank reconciliation (C13-W05)** remains the only planned gap across all repos.
