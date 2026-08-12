# P58 — ADMIN / PORTAL BOUNDARY REPORT
**Date:** 2026-08-12

## PHILOSOPHY
**ADMIN SHOULD GOVERN AND CONFIGURE. PORTAL SHOULD OPERATE.**

## CURRENT BOUNDARY (verified live)
| Aspect | Admin :3535 | Portal :3030 |
|--------|-------------|--------------|
| Profile | data-profile="admin" (red) | data-profile="portal" (green) |
| API backend | :3131 (full API) | :3003 (customer-facing only) |
| Admin routes access | full | **404 blocked** (verified) |
| Customer routes | full | 200 (verified) |
| Nav | full admin (Home, Monitoring, Connection, DB Mgmt, Migration, Location, Users & Permissions, Customer, Meter, Readings, Tariff, Bill Cycle, Invoices, Payment, Settings, Audit, Reports) | user-operational only (Home, Monitoring, Location, Customer, Meter, Readings, Tariff, Invoices, Payment) |

## ISSUE: FEATURE OVERLAP (duplication)
Many pages exist in BOTH admin and portal with the SAME operational UI (customers, meters, invoices, payments, readings). Per the philosophy, Admin should CONFIGURE/GOVERN these, Portal OPERATES.

## ADMIN PAGE CLASSIFICATION (from 10_P58_MOCK_STATIC_FUNCTION_REPORT.md)
- **22 mock/static/unwired pages** — these are the admin pages that claim operational features but don't persist: upload, documents, sync, balances, bill-cycle, monitoring, accounting/accounts, database, database-management (MOCK); api, api-management, integrations, localization, notifications, plugins, promotions, sms, smtp, themes, translations (STATIC); runtime, tables (demo)
- **~80 REAL pages** — verified backend wiring

## RECOMMENDED BOUNDARY REFINEMENT
| Domain | Admin (govern/config) | Portal (operate) |
|--------|----------------------|------------------|
| Customer | customer-settings: models, fields, categories, rules, templates, validation, area/project assignment | customer operations, cards, statements |
| Meter | meter-settings, meter-types, assignments, SIM config | meter view, readings |
| Billing | bill-cycle-settings, tariff-settings, charge rules | invoices, payments |
| Reports | report-settings, audit, health, logs, monitoring | consume configured business reports |
| Users | users, roles, permissions, sessions, api-keys | own profile only |

## ACTIONS
1. **Wire or remove the 22 mock/static pages** — a page must not be "certified operational" while static (P58 §12 HARD requirement)
2. **Reduce duplicate operational UI in Admin** — Admin should reference Portal-operator features via links/config, not duplicate full CRUD where it has no governance purpose
3. **Enforce boundary in API** — portal :3003 already blocks admin routes; verify admin :3131 cannot be reached from portal FE (already separated by port + rewrite)

## RISK
The biggest boundary risk is NOT the URL/port (verified separated) but the **data boundary**: without OD-01 enforcement, both surfaces read all areas. Fixing tenancy (OD-01) is the true boundary guarantee.
