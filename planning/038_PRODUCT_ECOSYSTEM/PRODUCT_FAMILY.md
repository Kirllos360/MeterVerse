# Enterprise Product Ecosystem — Planning

## Core Platform (Shared Services)
```
[Auth] [Permissions] [Audit] [Notifications] [Workflow] [Integration]
                     │
         ┌───────────┼───────────┬───────────┬───────────┐
         ▼           ▼           ▼           ▼           ▼
    [Collection]  [Billing]  [Analytics]    [AI]     [Mobile]
    [Meter Mgmt]  [Invoices] [Reports]   [Forecast]  [Field Ops]
    [Readings]    [Payments] [KPI]       [Anomaly]   [Portal]
    [Validation]  [Tariffs]  [Dashboard] [Agent]     [Self-Svc]
```

## Product Catalog

| Product | Description | Depends On | Target Revenue |
|:--------|:------------|:-----------|:--------------:|
| **MeterVerse Core** | Meter management + readings | — | Subscription |
| **MeterVerse Collection** | Full meter data pipeline + SYMBIOT bridge | Core | Per-meter/month |
| **MeterVerse Billing** | Invoice + payment + collections | Core | Transaction fee |
| **MeterVerse Analytics** | Dashboards + reports + AI insights | Core + Billing | Premium add-on |
| **MeterVerse AI** | Agents + forecasting + anomaly detection | Analytics | Premium add-on |
| **MeterVerse Mobile** | Field operator + customer apps | Core | Per-user/month |
| **MeterVerse Workforce** | Technician dispatch + workflow | Core + Mobile | Per-user/month |
| **MeterVerse Asset** | Meter lifecycle + SIM management | Core | Per-meter/month |
| **MeterVerse SCADA** | Real-time meter gateway | Core | Hardware + subscription |
| **MeterVerse Portal** | Customer self-service | Billing | Included |
| **MeterVerse Executive** | C-suite dashboard + strategy | Analytics | Premium |
