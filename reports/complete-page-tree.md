# Meter Verse — Complete Application Tree

## 🔐 AUTHENTICATION (Standalone — No AppShell)

```
/login                  ─── Login page (2-panel, dark/light, RTL)
  ├── Language toggle   ─── Arabic / English
  ├── Theme toggle      ─── Dark / Light mode
  ├── Area selector     ─── Loaded from /areas API
  ├── Remember Me       ─── localStorage persistence
  └── Progressive lockout ─── 3→5min, 6→24h, 9→permanent

/register               ─── Registration form
  ├── First Name, Last Name, Phone, Email
  ├── Area, Project, Department
  └── Direct Manager, Area Manager (optional)
```

## 🏠 MAIN APP (Authenticated — AppShell Wrapper)

### DASHBOARDS
```
/dashboard ───────────────────────────────── Main Dashboard
  ├── Stat cards: Customers, Meters, Invoices
  ├── Charts: Revenue, Consumption, Collection
  └── Quick links to all sub-dashboards

/executive-dashboard ─── Executive KPIs
  ├── Revenue, Collection Rate, Outstanding
  ├── Top Projects, Top Debtors
  ├── Aging Analysis (0-30, 31-60, 61-90, 90+)
  └── AI Insights panel

/operations-dashboard ─── Operations Metrics
  ├── Meter Health (Active/Inactive/Faulty)
  ├── Reading Performance
  └── Service Tickets

/billing-dashboard ─── Billing Summary
  ├── Invoice Status Breakdown
  └── Revenue by Utility

/collections-dashboard-plus ─── Collections+
  ├── Collection KPIs
  ├── Aging Buckets
  ├── Top Debtors
  └── Recovery Tracking

/utility-dashboard ─── Utility Overview
  ├── 7 tabs: Electricity, Water, Solar, Gas, Chilled Water, Outdoor Unit, Settlement
  └── Per-utility stats

/solar-dashboard ─── Solar KPIs
  ├── Generation, Export, Import
  └── Wallet Balance
```

### 👥 CUSTOMERS
```
/customers ─────────────────── Customer List
  ├── CRUD: Create, View, Edit, Delete
  ├── Search by name/phone/code
  └── Click → /customer-detail

/customer-detail ───────────── Enterprise Customer Card
  ├── Overview ─── Profile, Stats, Recent Invoices
  ├── Units ─── Assigned units & locations
  ├── Meters ─── All meters (Elec, Water, Solar, etc.)
  ├── Invoices ─── Invoice history
  ├── Payments ─── Payment history
  ├── Ledger ─── Running balance (CustomerLedgerEntry)
  ├── Wallet ─── Customer wallet (credit/debit)
  ├── Solar Wallet ─── Solar credits
  ├── Settlements ─── Settlement history
  ├── Tickets ─── Support tickets
  └── Notes ─── Internal notes
```

### 🏗️ PROJECTS
```
/projects ───────────────── Project List
  ├── CRUD: Create, View, Edit, Delete
  ├── Form dialog with area/status
  └── Click → /project-detail

/project-detail ──────────── Project Detail View

/locations ───────────────── Unit/Location Management
  ├── Buildings, Floors, Units
  └── Status tracking
```

### ⚡ METERS
```
/meters ─────────────────── Meter List
  ├── CRUD: Create, View, Edit, Delete
  ├── Types: Electricity, Water, Solar, Gas, Chilled Water, Outdoor Unit
  ├── Status: Available, Assigned, Active, Faulty, Replaced, Terminated
  └── Click → /meter-detail

/meter-detail ───────────── Meter Detail

/meters/assign ──────────── Assign meter to unit/customer
/meters/replace ─────────── Replace meter (old → new)
/meters/terminate ───────── Terminate meter connection
```

### 📟 SIM CARDS
```
/sim-cards ──────────────── SIM Card Management
  ├── CRUD
  ├── Status: Available, Assigned
  └── Assignment to meters
```

### 📊 READINGS
```
/readings ───────────────── Reading List
  ├── Filter by meter/status/date
  ├── Review queue (approve/reject)
  └── Click → reading detail

/readings/new ───────────── New Reading Entry
  ├── Meter selection
  ├── Reading value + date
  └── Source: manual/import/automatic
```

### 💰 BILLING
```
/invoices ───────────────── Invoice List
  ├── Columns: Number, Customer, Project, Meter, Type, Period
  ├── Consumption, Subtotal, Tax, Total, Paid, Remaining
  ├── Status: Draft, Issued, Paid, Overdue, Cancelled
  ├── Sortable by any column
  ├── Search by invoice number
  └── Actions: View PDF, Issue, Cancel, Adjust

/invoice-detail ─────────── Invoice Detail
  └── PDF download via Puppeteer

/payments ───────────────── Payment Management
  ├── CRUD: Create, View, Reverse
  ├── Methods: Cash, Bank Transfer, Card, Online, Cheque
  └── Allocation to invoices

/balances ───────────────── Customer Balances
  └── Aging analysis

/consumption ────────────── Consumption Analysis
/water-balance ──────────── Water Balance Tracking
```

### 📋 REPORTS
```
/reports ────────────────── Report Center (10 types)
  ├── Invoices Summary ─── Totals, counts, collection rate
  ├── Payments Report ─── By method, date range
  ├── Customer Statement ─── Per customer with running balance
  ├── Monthly Consumption ─── By month
  ├── Monthly Finance ─── Revenue by month
  ├── Meters Status ─── By type and status
  ├── Active Tariffs ─── Current tariff plans
  ├── Aging Report ─── Overdue buckets
  ├── Canceled Invoices ─── Voided/cancelled
  └── Audit Log ─── System activity
```

### 📤 UPLOAD CENTER
```
/upload-center ──────────── Excel Import (9 types)
  ├── Readings ─── Meter Serial, Date, Value
  ├── Solar Readings ─── With 1.8.0/2.8.0 columns
  ├── Meters ─── Type, Serial, Name, Model
  ├── Customers ─── 45 columns (Arabic/English names, contacts)
  ├── Payments ─── Date, Meter Serial, Amount, Type
  ├── Settlements ─── Meter Serial, Amount, Months
  ├── SIM Cards ─── Provider, IMEI, Phone, IP
  ├── Delete Readings ─── Meter Serial + Date
  └── Migration ─── Historical monthly data
```

### ⚙️ TARIFF STUDIO
```
/tariff-studio ──────────── Tariff Management
  ├── Charge modes: STEPS / FLAT / STATIC / PER_UNIT / ZERO
  ├── Tier editor for STEPS mode
  ├── Simulation engine
  └── Create/Edit/Delete tariffs
```

### 🔄 BILL CYCLE (API)
```
POST  /api/v1/bill-cycle ─────────── Create cycle (OPEN)
GET   /api/v1/bill-cycle ─────────── List cycles
GET   /api/v1/bill-cycle/:id ─────── Get cycle
POST  /api/v1/bill-cycle/:id/start ─ Start (LOCKED)
POST  /api/v1/bill-cycle/:id/generate ─ Generate invoices (APPROVED)
POST  /api/v1/bill-cycle/:id/post ── Post (CLOSED)
POST  /api/v1/bill-cycle/:id/cancel ─ Cancel (CANCELLED)
```

### 💳 WALLET (API)
```
GET   /api/v1/wallet/:customerId ──── Get wallet
POST  /api/v1/wallet/:id/credit ───── Credit
POST  /api/v1/wallet/:id/debit ────── Debit
POST  /api/v1/wallet/transfer ─────── Transfer
GET   /api/v1/wallet/:id/history ──── Transaction history
GET   /api/v1/wallet/:id/balance ──── Balance
```

### ⚖️ SETTLEMENTS
```
/settlements ────────────── Settlement Management
  ├── List/Create/Edit/Delete
  └── Adjustments per invoice
```

### 🏢 WORKPLACE
```
/workplace ──────────────── Team Workspace
  ├── Tasks
  ├── Activity
  └── Quotes
```

### 🔔 NOTIFICATIONS
```
/notifications ──────────── Notification Center
  ├── Unread count badge
  ├── Mark read / Mark all read
  └── Delete
```

### 🎫 TICKETS & SUPPORT
```
/tickets ────────────────── Ticket Management
  ├── CRUD
  ├── Comments per ticket
  └── Status workflow

/support ────────────────── Support Requests
  ├── Create
  ├── Escalate
  └── Resolve
```

### ⚠️ ALERTS
```
/alerts ─────────────────── System Alerts
```

### 🗄️ DATABASE ADMIN (Port 4001)
```
http://localhost:4001 ───── Standalone DB Admin Tool
  ├── Schema selector: sim_system / core / features
  ├── Table selector with column count
  ├── Excel-like editable grid
  │   ├── Double-click cell to edit
  │   ├── Checkbox to mark for delete
  │   └── Add new row button
  ├── Dependency check before delete
  ├── Sort by any column
  └── Batch Apply (transactional — all or nothing)
```

### ⚙️ SETTINGS (16 Tabs)
```
/settings ───────────────── System Settings
  ├── General ─── System name, tax rate, etc.
  ├── Users ─── CRUD, assign role, reset password
  ├── Areas ─── Add/Edit/Delete areas
  ├── Unit Types ─── Unit classifications
  ├── Permissions ─── Interactive matrix (V/A/E/D per role)
  ├── User Groups ─── Group-based permissions
  ├── Customer Groups ─── Customer grouping
  ├── Payment Centers ─── Collection points
  ├── Bank Accounts ─── Company bank accounts
  ├── POS ─── POS terminal management
  ├── Holidays ─── Holiday scheduling
  ├── Unit Zones ─── Zone classifications
  ├── Settlement Types ─── Tariff Diff, Consumption Settlement
  ├── Reading ─── Reading configuration
  ├── Notifications ─── Notification settings
  └── Theme ─── Dark/Light mode toggle
```

## 📊 SYSTEM STATISTICS

```
Total Pages:    37
E2E Tests:     26/26 PASS
API Routes:    156
DB Models:     128
Controllers:   29
Services:      32
Settings Tabs: 16
Reports:       10
Upload Types:  9
Auth Bypasses: 0
```

## 🔗 PAGE CONNECTIONS

```
Login → Dashboard (all sub-dashboards) → nested content
Login → Customers → Customer Detail → Units/Meters/Invoices/Payments/Ledger/Wallet
Login → Projects → Project Detail
Login → Meters → Meter Detail → Assign/Replace/Terminate
Login → Billing → Invoices → Invoice Detail → PDF
Login → Billing → Payments → Receipt PDF
Login → Billing → Balances / Consumption / Water Balance
Login → Reports → 10 report types
Login → Upload Center → 9 import types
Login → Tariff Studio → Tariff CRUD → Simulation
Login → Settlements
Login → Workplace
Login → Notifications / Tickets / Support / Alerts
Login → Settings → 16 configuration tabs
Login → Database Admin (external: port 4001)

Bill Cycle (API) → Invoice Generation → TariffEngine → Ledger → Payment → Wallet
```
