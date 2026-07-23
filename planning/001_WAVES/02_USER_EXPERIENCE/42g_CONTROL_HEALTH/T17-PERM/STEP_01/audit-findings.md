# T17 Step 01 — Audit Finding: Routes Using requireRole()

## Current State

| Route File | Status | Import Source | Replace With |
|-----------|--------|---------------|-------------|
| admin.js | requireRole("admin","super_admin") | security.js | requirePermission("admin.*") |
| ai.js | requireRole("admin","super_admin") | auth.js | requirePermission("ai.*") |
| business.js | requireRole("admin","super_admin") | security.js | requirePermission("business.*") |
| crud.js | requireRole("admin","super_admin") | security.js | requirePermission("admin.*") |
| domain.js | requireRole("admin","super_admin") | security.js | requirePermission("*.list", "*.read", "*.create", etc) |
| meter-assignments.js | requireRole() | security.js | requirePermission("meter_assignments.*") |
| monitor.js | requireRole() | security.js | requirePermission("monitor.*") |
| notifications.js | requireRole() | security.js | requirePermission("notifications.*") |
| reports.js | requireRole() | security.js | requirePermission("reports.*") |
| security.js | define + export requireRole | — | Keep for backward compat, mark deprecated |
| services.js | Mixed (some requireRole, some none) | security.js | requirePermission("services.*") |
| preferences.js | authenticate only — NO role check | auth.js | requirePermission("preferences.*") |

## Routes Already Using requirePermission() (8)
customers.js, invoices.js, meters.js, payments.js, readings.js, tasks.js, alerts.js, search.js

## Required Permission Keys to Add
- ai.*, business.*, monitor.*, notifications.*, reports.*, services.*, preferences.*
- admin.* may need expansion

## Total Routes to Update: 12
