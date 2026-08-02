# P48 — Admin Experience Guide (Enterprise Control Center)

**Portal:** `/admin` · **Brand:** red (#DC2626) · **Shell:** AdminLayout

## 1. Identity

The Admin is the **Enterprise Control Center** — the operator of the operating system. The Admin governs the platform: who can do what, how the system is wired, whether it is healthy, and whether every action is accountable.

## 2. Responsibilities (from P47 responsibility matrix)

- **Govern** — identity, RBAC, scopes, sessions, MFA.
- **Configure** — settings, feature flags, branding, themes, localization, connections/TCP.
- **Operate** — meters, readings, monitoring, scheduler, runtime, backup, queue.
- **Manage** — customers, tariffs, billing cycles, invoices, payments, collections.
- **Account** — accounting, GL, reports, financial AI, revenue assurance.
- **Protect** — audit, security, API keys, webhooks, health, license.
- **Intelligence** — AI command center, RCA, knowledge, forecasts.

## 3. Navigation Model (Control Center)

Workspace shell with **system tabs** (Admin / Dashboard / Analytics / System) and **module navigation**:
Home · Monitoring · Connection · Database · Migrations · Location · Users & Permissions · Customers · Meters · Readings · Tariffs · Billing Cycles · Invoices · Payments · Settings · Audit · Reports.

## 4. Key Workflows

| Workflow | Path |
|---|---|
| Grant a user access | Users → create user → assign role → assign scope → verify (audit) |
| Wire a meter source | Connection → create profile → test (TCP/TLS) → activate → ingestion polls |
| Run billing | Billing cycles → generate invoices → issue → payments → GL posting |
| Manage debt | Collections → aging → dunning → PTP → write-off |
| Oversee health | Monitoring → runtime/scheduler/health → diagnostics → failover |

## 5. Admin UX Rules

- **Always know who you are and what you can do** — role + permission visible.
- **Always see context** — active Area/Project in toolbar.
- **Every destructive action confirms + audits.**
- **System health is one glance away** (monitoring tab).
- **Drill, don't hop** — details open in context, not new pages.

## 6. Admin App Map (current → target)

Current: 93 admin views (53 config-driven, ~43 custom, 12 placeholders).
Target: all views wired to live endpoints; placeholders (alerts, balances, bill-cycle, documents, upload, monitoring, accounting sub-pages, collections) resolved.
