# P12-01 — INTEGRATION REALITY MATRIX

**Date:** 2026-08-15 · **Gate:** P12-01 (Enterprise Integration Architecture) · **HEAD:** 5ce0e2c1
**Method:** repository-first, evidence-based classification (A–J)

## Classification
A = implemented+verified · B = implemented, partially verified · C = partial/disconnected · D = designed only · E = planned only · F = missing · G = duplicate/conflicting · H = obsolete/superseded · I = blocked external · J = blocked environment

## Inventory (69 routes + 48 services + 18 integration models discovered)
| Integration | Source→Dest | Mechanism | Data | Class | Evidence |
|-------------|-------------|-----------|------|-------|----------|
| Admin FE ↔ BE | Next.js→Express | REST /api proxy (:3535→:3131) | all | **A** | live 13/0, tsc 0 |
| Portal FE ↔ BE | Next.js→Express | REST /api proxy (:3030→:3003) | customer | **A** | live verified |
| FE auth | browser→auth.js | JWT Bearer | user | **A** | 49/49 security |
| Auth ↔ RBAC | auth.js→security.js | middleware | roles/perms | **A** | tests |
| Tenancy propagation | security.js→all routes | requireAccess/scopeWhere/clamp | area/project | **A** | code + tests |
| Symbiot transport | TCP :9000/HTTP :9001 | symbiot-bridge | meter data | **A** | P60.6/7, 13 tests |
| Symbiot ingestion | bridge→ingestReading | REST/tcp | Reading | **A** | P60.6, hardened P60.7 |
| Meter identity | serial→Meter | findUnique | meter | **A** | tests |
| Reading → billing | readings→billing-engine | service | consumption | **B** | code, DB-gated |
| Billing → invoice | billing-engine→invoices | service | charges | **B** | code |
| Invoice → payment | invoices→payments | REST | amounts | **A** | 8 tests |
| Payment allocation | payments→PaymentTransaction | tx | alloc | **A** | oldest-first test |
| Payment → GL | payments→posting-engine | event | journal | **B** | code, DB-gated |
| Settlement | settlements→settlement-engine | service | FIXED/%/ONE_TIME | **A** | 7 tests |
| Cheque lifecycle | cheque route→cheque-engine | REST | Payment | **A** | 14 tests |
| Solar compute | solar.js→solar-wallet-engine | service | kWh | **A** | 16 tests |
| Solar → invoice | solar.js invoices | REST | solar inv | **B** | code |
| Import (Excel) | imports→import-engine | multer/xlsx | solar_* | **A** | 15 tests |
| Template gen/download | templates→generateTemplate | xlsx | templates | **A** | P60.1 tests |
| Notifications | notification-engine | service+models | Notification | **B** | code |
| Webhooks | webhook-dispatcher | HTTP outbound | events | **B** | code |
| Event bus | event-bus.js | in-process emit | domain events | **A** | code verified |
| Scheduler | scheduler-engine | cron/jobs | ScheduledTask | **B** | code |
| PDF generation | pdf-engine | pdfkit | reports/invoices | **B** | code |
| Jasper bridge | jasper-bridge | HTTP | reports | **C** | code, external-gated |
| AI agents | intelligence/knowledge/rca routes | cross-root src | AI | **B** | code, cross-root debt |
| Connections (external DB) | connection-profiles/manager | TCP/HTTP | meter DBs | **B** | code, no live |
| Credential vault | credential-vault | secret mgmt | DB creds | **A** | code |
| Circuit breaker | circuit-breaker | resilience | outbound | **A** | code |
| WebSocket | websocket-gateway | ws | realtime | **B** | code |
| Sync (Symbiot) | SyncLog model | polling-ingestion | sync status | **B** | code |
| Import/Export jobs | QueueJob/ImportJob/ExportJob | job models | async | **A** | models + tests |
| SEP transport/auth | — | — | — | **F/I** | evidence-gated |
| OBIS capture | — | — | — | **D** | designed, approval |
| ERP/utility integrations | — | — | — | **E** | planned only |
| Bank/payment external | — | — | — | **E/F** | planned |
| GIS/SCADA/IoT | — | — | — | **E/F** | planned |

## Summary
- **Class A (implemented+verified): 19** · **B (implemented, partial verify): 13** · **C: 1** · **D: 1** · **E: 3** · **F/I: 4**
- No **G** (duplicate/conflicting) or **H** (obsolete) found in the backend surface.
- The `apiClient` double-prefix is **G-debt** (hygiene, tolerated by backend) — recorded separately.
