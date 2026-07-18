# MeterVerse MVEOS Enterprise Coverage Matrix & Page Tree

## 01. AUTHENTICATION & IDENTITY
- [PAGE] Login (`/auth/login`)
- [PAGE] Forgot Password (`/auth/forgot-password`)
- [PAGE] Reset Password (`/auth/reset-password`)
- [PAGE] MFA Challenge (`/auth/mfa`)
- [DIALOG] Session Timeout Warning
- [PAGE] Registration / Invite Accept (`/auth/invite/:id`)

## 02. EXECUTIVE & STRATEGIC
- [PAGE] Executive Command Center (`/executive/command-center`) [IMPLEMENTED: SCREEN_31/36/50/51]
- [PAGE] CEO Strategic Overview (`/executive/ceo`)
- [PAGE] Financial Performance Dashboard (`/executive/financial`)
- [PAGE] Regional Operations Analytics (`/executive/operations`)
- [PAGE] ESG & Carbon Offset Tracking (`/executive/esg`)

## 03. CUSTOMER WORKSPACE (CRM)
- [PAGE] Customer Explorer (`/workspace/customers`) [IMPLEMENTED: SCREEN_52/58]
- [PAGE] Customer Workspace (`/workspace/customers/:id`) [IMPLEMENTED: SCREEN_37/44]
- [PAGE] Customer Timeline & Audit (`/workspace/customers/:id/timeline`)
- [PAGE] Customer Ledger & Wallet (`/workspace/customers/:id/ledger`)
- [PAGE] Customer Document Center (`/workspace/customers/:id/documents`)
- [DIALOG] Create/Edit Customer
- [DIALOG] Transfer Ownership
- [DIALOG] Update Contract Terms

## 04. METER & ASSET INFRASTRUCTURE
- [PAGE] Meter Explorer (`/workspace/meters`) [IMPLEMENTED: SCREEN_10/15/40]
- [PAGE] Meter Workspace (`/workspace/meters/:id`) [IMPLEMENTED: SCREEN_27/53/66]
- [PAGE] Installation & Commissioning Logic (`/workspace/meters/:id/commission`)
- [PAGE] Maintenance & Calibration History (`/workspace/meters/:id/maintenance`)
- [PAGE] SIM Card & Telemetry Management (`/workspace/meters/:id/telemetry`)
- [DIALOG] Provision New Meter
- [DIALOG] Replace/Swap Meter
- [DIALOG] Firmware Update Push

## 05. READINGS & CONSUMPTION
- [PAGE] Reading Explorer (`/operations/readings`) [IMPLEMENTED: SCREEN_46 (Wizard)]
- [PAGE] Reading Validation & Approval Workflow (`/operations/readings/validation`)
- [PAGE] Manual Reading Entry Batch (`/operations/readings/manual`)
- [PAGE] Consumption Analysis Workspace (`/operations/consumption`)
- [DIALOG] Correct Individual Reading
- [WIZARD] Bulk Import & Conflict Resolution [IMPLEMENTED: SCREEN_46]

## 06. BILLING & FINANCIALS
- [PAGE] Invoice Explorer (`/financial/invoices`) [IMPLEMENTED: SCREEN_11/64]
- [PAGE] Invoice Workspace & Settlement Engine (`/financial/invoices/:id`) [IMPLEMENTED: SCREEN_24/30/59]
- [PAGE] Tariff & Price Book Management (`/financial/tariffs`)
- [PAGE] Discount & Penalty Approval Queue (`/financial/approvals`)
- [PAGE] Payment Explorer & Allocation (`/financial/payments`)
- [DIALOG] Issue Credit Note
- [DIALOG] Apply Waiver/Discount

## 07. COLLECTIONS & RECOVERY
- [PAGE] Collection Command Center (`/collections/dashboard`)
- [PAGE] Collector Performance & Route Planning (`/collections/routes`)
- [PAGE] Promises to Pay & Recovery Tracking (`/collections/promises`)
- [PAGE] Legal & Dispute Management (`/collections/disputes`)

## 08. IMPORT & MIGRATION CENTER
- [PAGE] Import Dashboard (`/center/import`)
- [PAGE] Legacy Data Migration Hub (`/center/migration`)
- [PAGE] Validation Rules Engine (`/center/rules`)

## 09. MONITORING & SYSTEM HEALTH
- [PAGE] System Health Dashboard (`/monitoring/health`) [IMPLEMENTED: SCREEN_6]
- [PAGE] Live Grid Operational Map (`/monitoring/grid-map`) [IMPLEMENTED: SCREEN_18/63/65]
- [PAGE] API & Database Telemetry (`/monitoring/telemetry`)
- [PAGE] Background Job & Worker Logs (`/monitoring/workers`)
- [PAGE] Real-time Security & Audit Log (`/monitoring/audit`)

## 10. ADMINISTRATION & CONFIGURATION
- [PAGE] User & Access Control (`/admin/users`) [IMPLEMENTED: SCREEN_62]
- [PAGE] Role & Permission Matrix (`/admin/roles`)
- [PAGE] Organization & Hierarchy Management (`/admin/org`)
- [PAGE] Global System Settings (`/admin/settings`)
- [PAGE] Localization & Theme Engine (`/admin/themes`) [IMPLEMENTED: SCREEN_41/60]

## 11. REPORTING & ANALYTICS
- [PAGE] Report Dashboard & Scheduler (`/reports/dashboard`)
- [PAGE] Jasper Report Previewer (`/reports/preview`)
- [PAGE] Custom Report Builder (`/reports/builder`)
