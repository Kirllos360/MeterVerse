# P58 — MOCK / STATIC / FUNCTION AUDIT REPORT
**Date:** 2026-08-12 · **Scope:** 112 admin page.tsx files · **HARD requirement:** a page must not be certified operational merely because it renders

## TOTALS
| Verdict | Count |
|---------|-------|
| MOCK (hardcoded data, no backend) | 9 |
| STATIC/UNWIRED (apiEndpoint:"", empty table + dead Add) | 11 |
| STATIC (demo shells) | 2 |
| MIXED (hardcoded primary + partial real) | 10 |
| REAL (verified backend wiring) | ~80 |

## MOCK PAGES (fake UI — highest risk)
| PAGE | Route | Fake behavior | Recommendation |
|------|-------|---------------|----------------|
| upload | /admin/upload | MOCK_UPLOADS; Browse button no handler | Wire to /api/imports or remove |
| documents | /admin/documents | hardcoded DOCUMENTS; +Upload inert | Wire /api/documents or remove |
| sync | /admin/sync | MOCK_STATUS; Trigger Sync = setTimeout 3s (no call) | Wire real sync API or remove |
| balances | /admin/balances | hardcoded EGP 0.00 cards | Wire statement endpoint or remove |
| bill-cycle | /admin/bill-cycle | ACTIVE_CYCLES hardcoded; Save inert | Wire /api/domain/bill-cycles or remove (settings page real) |
| monitoring | /admin/monitoring | hardcoded charts | Wire /api/monitor/* or remove (monitoring-view real) |
| accounting/accounts | /admin/accounting/accounts | ACCOUNT_TREE hardcoded; Create inert | Wire /api/accounting/accounts or remove |
| database | /admin/database | full mock CRUD grid presented as DB browser | Remove or real data-browser (no backend route) |
| database-management | /admin/database-management | "Query executed (simulated)"; INITIAL_ROWS hardcoded | Wire SQL tab or strip to events-only |

## STATIC/UNWIRED (GenericAdminPage apiEndpoint:"")
api, api-management, integrations, localization, notifications, plugins, promotions, sms, smtp, themes, translations — all render empty table + dead Add. **Correction:** P57 said 17 empty configs; actual = **15**.

## DEMO SHELLS
runtime (RuntimeEngine on sampleEntities), tables (EnterpriseTable on 200 fake rows, edit → console.log)

## MIXED (half-wired — wire remaining tabs, don't delete)
bill-cycle-settings, upload-settings, tariff-settings, payment-settings, customer-settings, meter-settings, location-settings, migration-uploads, users-permissions, report-settings — primary data hardcoded; events/errors/settings-save genuinely hit backend.

## REAL (~80)
All GenericAdminPage with non-empty endpoints (customers, meters, readings, invoices, payments, projects, zones, units, sim, tariffs, audit, api-keys, webhooks, sessions, queue, scheduler, storage, health, etc.) + custom pages (tasks, alerts, collections, communication, connectivity-center, rca-workspace, reports, reporting, security, services, ai*, workflows, documents-governance, revenue-assurance, financial-ai, accounting/*, monitoring-view, home, database-connections, connection-settings, crud).

## FUNCTION/BUTTON AUDIT (representative)
- Login/Logout/Session: REAL (verified live, incl. /me restore fix)
- Customer/Meter CRUD via GenericAdminPage: REAL (add/edit/delete POST to live endpoints)
- Create-customer persistence: verified 201 → DB row
- Mock functions confirmed: upload Browse, sync Trigger, bill-cycle Save, accounting Create, database CRUD

## ACTION
Wire or remove the 22 mock/static pages before certifying admin "operational". Priority: the 9 MOCK pages (fake UI is a certification violation).
