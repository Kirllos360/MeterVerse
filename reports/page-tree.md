# Meter Verse — Complete Page Tree

## Authentication
```
/login                    → Login page (standalone, no AppShell)
/register                 → Registration form (standalone)
```

## Dashboard (6 pages)
```
/dashboard                → Main dashboard
/executive-dashboard      → Executive KPIs
/operations-dashboard     → Operations metrics
/billing-dashboard        → Billing summary
/collections-dashboard-plus → Collections + aging
/utility-dashboard        → Utility overview
/solar-dashboard          → Solar KPIs
```

## Customers (2 pages)
```
/customers                → Customer list (CRUD)
/customer-detail          → Enterprise customer card (units, meters, invoices, payments, ledger, wallet, solar, settlements, tickets, notes)
```

## Projects (2 pages)
```
/projects                 → Project list (CRUD)
/project-detail           → Project detail
```

## Locations
```
/locations                → Unit/location management
```

## Meters (4 pages)
```
/meters                   → Meter list (CRUD)
/meter-detail             → Meter detail
/meters/assign            → Assign meter to unit
/meters/replace           → Replace meter
/meters/terminate         → Terminate meter
```

## SIM Cards
```
/sim-cards                → SIM card management
```

## Readings (2 pages)
```
/readings                 → Reading list
/readings/new             → New reading entry
```

## Billing (6 pages)
```
/invoices                 → Invoice list
/invoice-detail           → Invoice detail + PDF download
/payments                 → Payment management
/balances                 → Customer balances + aging
/consumption              → Consumption analysis
/water-balance            → Water balance tracking
```

## Reports
```
/reports                  → Report center (10 report types)
```

## Upload Center
```
/upload-center            → Excel import (9 template types)
```

## Tariff Studio
```
/tariff-studio            → Tariff management (5 charge modes)
```

## Bill Cycle
```
/api/v1/bill-cycle        → Bill cycle management (API only)
```

## Settlements
```
/settlements              → Settlement management
```

## Wallet
```
/api/v1/wallet            → Wallet API (credit/debit/transfer/history)
```

## Workplace
```
/workplace                → Team workspace
```

## Notifications
```
/notifications            → Notification center
```

## Tickets & Support
```
/tickets                  → Ticket management
/support                  → Support requests
```

## Alerts
```
/alerts                   → System alerts
```

## Database Admin
```
/admin                    → Database table browser + CRUD + SQL query + dependency check
```

## Settings (16 tabs)
```
/settings                 → General | Users | Areas | Unit Types | Permissions
                            User Groups | Customer Groups | Payment Centers
                            Bank Accounts | POS | Holidays | Unit Zones
                            Settlement Types | Reading | Notifications | Theme
```

## Total: 37 pages
All verified: **26/26 E2E PASS**
