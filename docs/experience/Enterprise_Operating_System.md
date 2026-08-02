# MeterVerse Enterprise Operating System

**Version:** 1.0 · **Authority:** P48 · **Governs:** all implementation Waves 3–10
**Supersedes:** "application" framing. MeterVerse is an **Operating System**, not an app.

---

## 1. What MeterVerse Is

MeterVerse is an **Enterprise Utility Operating System (EOS)** for utility metering operations:

- It **runs the business** of utility metering end-to-end: meters, readings, tariffs, billing, payments, collections, accounting, intelligence.
- It is a **single workspace** where operators, administrators, and finance teams work in one continuous context — not a collection of pages.
- It is **context-driven**: every screen reflects the active Area → Project → role → permission.

### The operating-system model
| Layer | What it does | MeterVerse equivalent |
|---|---|---|
| Kernel | Runs the platform | Runtime Engine + Scheduler + Event Bus + Ingestion |
| Shell | The workspace | AdminLayout / SystemLayout SPA shells |
| Apps | Domain modules | Admin Center, Meters, Billing, Accounting, Collections, AI |
| Context | Active scope | Area + Project + Role + Permission (global state) |
| Filesystem | Data | Prisma/PostgreSQL + migrations |
| Permissions | Security | RBAC (roles → permissions → scopes) |

## 2. What Problems It Solves

1. **Fragmentation** — one platform for meters→readings→billing→finance→AI, no data silos.
2. **Manual metering** — automated TCP/polling ingestion, validation pipeline, billing.
3. **Revenue leakage** — revenue-assurance engine (15 rules), collections intelligence.
4. **Financial opacity** — GL posting, P&L/Balance Sheet/Cash Flow, financial AI.
5. **Operational control** — real-time monitoring, scheduler, runtime health, audit.

## 3. Who Uses It

| Persona | Portal | Core work |
|---|---|---|
| Platform Admin | Admin (Control Center, red) | Identity, RBAC, config, TCP/connections, system health, audit |
| Operations | Admin/Shared | Meters, readings, monitoring, tasks, workflows |
| Billing/Finance | Admin (Accounting) | Tariffs, invoices, payments, GL, collections, reports |
| Customer Operations | User (Operations Center, green) | Meters, readings, invoices, payments, tickets, notifications |
| AI/Analyst | Admin | RCA, forecasting, revenue assurance, financial AI |

## 4. The Philosophy

- **Operating system, not ERP.** Every capability is a system function, not a page.
- **Context is everything.** Area + Project + Role define what you see and do.
- **Workflows over pages.** Every screen is part of a flow (Login → Workspace → Context → App → Task → Action → Result → Monitor → Report → Logout).
- **Real data only.** No simulated persistence (P45/P46 enforced).
- **One experience DNA.** Every surface follows the same design tokens, motion, and interaction language.

## 5. Experience Flow (end-to-end)

```
Login → Workspace → Select Area → Select Project → Open App
→ Task → Action → Result (persisted+audited) → Monitoring → Reports → Logout
```

## 6. The Two Centers

| Center | Portal | Identity |
|---|---|---|
| **Enterprise Control Center** | Admin `/admin` (red) | Governs: identity, security, config, TCP, system, audit, AI |
| **Enterprise Operations Center** | User `/` (green) | Operates: meters, readings, billing, collections, customers, tickets |

Both share one workspace shell, one DNA, one runtime — differing in **role-scoped capability and brand**, not architecture.
