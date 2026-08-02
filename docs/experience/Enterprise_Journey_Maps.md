# P48 — Enterprise Journey Maps

**Version:** 1.0 · The complete user journeys through the Operating System.

## Journey 1 — Platform Admin (Control Center)

```
Login → Workspace (red) → Context (Area/Project) →
  [Users] create user → assign role → assign scope → audit
  [Security] review sessions → revoke → MFA verify
  [Connection] create TCP profile → test (TCP/TLS) → activate → ingestion polls
  [Monitoring] health → runtime → scheduler → failover → diagnostics
  [Audit] browse entries → filter by actor/action
Logout
```

## Journey 2 — Operations (meter lifecycle)

```
Login → Operations Center → Context (Area=October, Project=Phase 1) →
  [Meters] register meter → assign to customer → activate
  [Readings] receive reading → validate → store → approved
  [Monitoring] verify meter health → reading gap alert
Logout
```

## Journey 3 — Billing/Finance

```
Login → Admin → Accounting →
  [Tariffs] create tariff → add version → activate
  [Billing] run billing cycle → generate invoices → issue
  [Payments] receive payment → invoice marked paid
  [GL] journal posted → ledger updated → trial balance
  [Reports] P&L → balance sheet → cash flow → aging
  [Financial AI] forecast → Monte Carlo → scenario → health score
Logout
```

## Journey 4 — Collections

```
Login → Collections →
  [Aging] view buckets → identify 90+ exposure
  [Dunning] run dunning → cases created → actions
  [PTP] create promise → keep/broken → risk score updates
  [Write-off] request → approve → execute → GL
Logout
```

## Journey 5 — Customer Operations (User Center)

```
Login → Operations Center (green) →
  [Customers] open customer → view meters/bills/ledger
  [Meters] view meter → recent readings/consumption
  [Invoices] view bill → payment status
  [Tickets] create ticket → assign → resolve (C14)
  [Notifications] inbox → alerts (C14)
Logout
```

## Journey 6 — AI / Analyst

```
Login → Admin → AI Command Center →
  [RCA] open case → auto-analyze → root cause → recommendation → learn
  [Revenue Assurance] run rules → findings → investigate → confirm
  [Forecasting] forecast → scenario → Monte Carlo → health
  [Knowledge] search articles → similar incidents
Logout
```

## Journey Maps → Requirements

Each journey maps to: persona, apps used, context, permissions, data needed, audit events, success criteria. Every Wave 3–10 app must satisfy at least one journey end-to-end.
