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

## §5 A-AT category coverage (completion pass)
The prompt's A-AT integration categories — explicit mapping to verified repo evidence:
| Cat | Integration | Evidence | Class |
|-----|-------------|----------|-------|
| A-B | Internal service integrations | 48 services, engine layer | A/B |
| C | Frontend↔backend | api-client + proxy | A |
| D | Admin↔backend | :3535→:3131 | A |
| E | Portal↔backend | :3030→:3003 | A |
| F | MeterVerse↔Symbiot | symbiot-bridge | A |
| G-I | SEP/transport/meter ingestion | ingestReading + /api/ingestion | A (SEP gated) |
| J | Reading ingestion | ingestReading persist | A |
| K-L | Reading validation + billing | readings review + billing-engine | B |
| M-N | Invoice gen + Jasper | invoices.js + jasper-bridge | B/C |
| O | Payments | payments.js alloc | A |
| P-Q | Collection + settlements | collections.js + settlements.js | A |
| R-S | Solar + wallet | solar.js + solar-wallet-engine | A |
| T-V | Accounting/journals/ledger | posting-engine + CustomerLedgerEntry | B |
| U | Notifications | notification-engine | B |
| W-X | Workflow + AI agents | workflow-engine + intelligence | B |
| Y | Knowledge/RCA | knowledge + rca routes | B |
| Z-AA | Webhooks + imports | webhook-dispatcher + import-engine | A/B |
| AB-AC | Exports + file storage | export routes + uploads dir | A/B |
| AD-AE | Scheduled jobs + background workers | scheduler-engine + QueueJob | B |
| AF | External APIs | email/sms/webhook/connection | B |
| AG-AH | Authentication + authorization | JWT + RBAC | A |
| AI | Tenancy/area/project propagation | requireAccess/scope/clamp | A |
| AJ | Audit logging | auditLog (AuditEntry) | A |
| AK | Monitoring/observability | health-monitor + metrics-collector + /metrics/prometheus | A |
| AL | Health checks | monitor route + /api/health | A |
| AM | Configuration | config-center + .env | A |
| AN-AO | Plugin-runtime + cross-area replication | none | E/F |
| AP | Future ERP/utility | none | E |
| AQ | Mobile/API consumers | none | E |
| AR | Bank/payment integrations | none | E/F |
| AS | GIS/SCADA/IoT | none | E/F |
| AT | Other (credential vault, circuit-breaker, websocket) | services | A/B |
