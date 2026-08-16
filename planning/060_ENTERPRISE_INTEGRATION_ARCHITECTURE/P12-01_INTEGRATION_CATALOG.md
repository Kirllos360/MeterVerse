# P12-01 — INTEGRATION CATALOG

**Date:** 2026-08-15 · **Gate:** P12-01 · **HEAD:** 5ce0e2c1

Condensed evidence record for each material integration. Full §6 fields captured where evidence exists; UNVERIFIED where not.

| ID | Name | Source→Dest | Purpose | Protocol | Auth | Tenancy | Idempotency | Correlation | Retry | Failure mode | Class |
|----|------|-------------|---------|----------|------|---------|-------------|-------------|-------|--------------|-------|
| INT-001 | Admin FE→BE | Next→Express | admin ops | REST /api | JWT | requireAccess | — | — | — | 4xx/5xx surface | A |
| INT-002 | Portal FE→BE | Next→Express | customer ops | REST /api | JWT | requireAccess | — | — | — | 4xx/5xx | A |
| INT-003 | Auth→RBAC | auth.js→security.js | identity→permission | middleware | JWT | area claims | — | — | — | 401/403 | A |
| INT-004 | Tenancy | security.js→routes | area/project scope | middleware | JWT | fail-closed | — | — | — | DENY | A |
| INT-005 | Symbiot transport | TCP:9000/HTTP:9001 | meter data in | TCP/HTTP | none (bridge) | meter-owned | append | **UUID (P60.7)** | — | reject 4xx | A |
| INT-006 | Ingestion persist | bridge→Reading | reading store | service | bridge | meter.areaId | append | UUID | — | fail-closed | A |
| INT-007 | Reading→billing | readings→billing-engine | consumption | service | RBAC | scopeWhere | — | — | — | — | B |
| INT-008 | Billing→invoice | billing→invoices | charges | service | RBAC | scope | — | — | — | — | B |
| INT-009 | Invoice→payment | invoices→payments | settle | REST | RBAC | scope | alloc-cap | — | — | 400 | A |
| INT-010 | Payment→GL | payments→posting-engine | journal | event | RBAC | scope | — | — | — | audit-fail | B |
| INT-011 | Settlement | settlements→engine | apply | REST/service | RBAC | scope | invoice-guard | — | — | 400 | A |
| INT-012 | Cheque | cheque→engine | lifecycle | REST | RBAC | clamp | idempotent-clear | — | — | 400 | A |
| INT-013 | Solar compute | solar→wallet | net metering | service | RBAC | scope | — | — | — | — | A |
| INT-014 | Import Excel | imports→engine | bulk load | multer/xlsx | documents.* | scope | per-row tx | — | — | 422 | A |
| INT-015 | Template | templates→gen | download | xlsx | documents.* | scope | — | — | — | 400 | A |
| INT-016 | Notifications | engine→models | alert | service | RBAC | scope | — | — | — | — | B |
| INT-017 | Webhooks | dispatcher→ext | outbound | HTTP | secret | — | — | — | retry | dead-letter | B |
| INT-018 | Event bus | event-bus.js | domain events | in-proc | n/a | — | — | — | — | emit-fail | A |
| INT-019 | Scheduler | scheduler-engine | jobs | cron | n/a | — | — | — | — | job-fail | B |
| INT-020 | PDF | pdf-engine | docs | pdfkit | RBAC | scope | — | — | — | — | B |
| INT-021 | Jasper | jasper-bridge | reports | HTTP | external | — | — | — | — | external-gated | C |
| INT-022 | AI agents | intelligence routes | analytics | REST | RBAC | scope | — | — | — | — | B |
| INT-023 | Connections | connection-manager | ext DB | TCP/HTTP | vault | — | — | — | — | breaker | B |
| INT-024 | WebSocket | websocket-gateway | realtime | ws | token | — | — | — | — | — | B |
| INT-025 | Sync | polling-ingestion | meter sync | poll | bridge | — | — | — | — | — | B |
| INT-026 | Jobs | QueueJob/ImportJob | async | models | RBAC | scope | status-guard | — | — | job-state | A |
| INT-027 | SEP transport/auth | — | — | — | — | — | — | — | — | — | F/I |
| INT-028 | OBIS capture | — | — | — | — | — | — | — | — | — | D |
| INT-029 | ERP/utility | — | — | — | — | — | — | — | — | — | E |
| INT-030 | Bank/payment ext | — | — | — | — | — | — | — | — | — | E/F |
| INT-031 | GIS/SCADA/IoT | — | — | — | — | — | — | — | — | — | E/F |

## Key gaps (from catalog)
1. **Correlation IDs only on Symbiot ingestion** — other integrations lack correlation tracing (§6 requirement).
2. **Retry/idempotency documented for import + cheque only** — others UNVERIFIED.
3. **SEP/ERP/bank/GIS = E/F** (external evidence required).
4. **Jasper = C** (code exists, external report service evidence-gated).
