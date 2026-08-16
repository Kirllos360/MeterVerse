# P12-01 — GAP REGISTER

**Date:** 2026-08-15 · **Gate:** P12-01 · **Severity:** CRITICAL / HIGH / MEDIUM / LOW / DEBT / EXTERNAL-BLOCKED / ENVIRONMENT-BLOCKED / DECISION-REQUIRED

| ID | Description | Evidence | Severity | Impact | Resolution | Prereq | Blocking | Wave | Verification |
|----|-------------|----------|----------|--------|------------|--------|----------|------|--------------|
| G-001 | PostgreSQL :5433 down (memory) | 0xC0000142, 1MB RAM | CRITICAL | all live | free RAM + net start | RAM | yes | — | fingerprint |
| G-002 | Financial live cert | checklist ready | HIGH | finance | PG recovery | G-001 | yes | W3 | 12-step checklist |
| G-003 | OBIS directional capture | P60.7 OBIS audit | HIGH | solar | additive model | OBIS approval | yes | W4 | unit+API |
| G-004 | SEP transport/auth | P60.7 SEP matrix | HIGH | solar E2E | SEP spec | external | yes | W4 | unit+live |
| G-005 | AI/ingestion cross-tenant live | no live tests | MED | security | PG + negative tests | G-001 | no | W3 | negative |
| G-006 | Cross-tenant live tests | no live | MED | tenancy | PG | G-001 | no | W3 | negative |
| G-007 | POS/CurrencyType | no models | MED | data | business evidence | evidence | no | W4 | — |
| G-008 | Chilled-water settlement | evidence-gated | MED | data | business | evidence | no | W4 | unit |
| G-009 | Cross-root type:module | backend.log warning | DEBT | build | move/type:module | none | no | W3 | tsc |
| G-010 | apiClient double-prefix | api-client.ts | DEBT | FE hygiene | normalize | none | no | W4 | tsc |
| G-011 | Linux launcher | _tools Windows-only | DEBT | deploy | systemd | none | no | W4 | smoke |
| G-012 | Invoice→close→payment popup | UI linkage | MED | finance UX | wire + live verify | G-001 | no | W3 | browser |
| G-013 | Jasper external contract | jasper-bridge C | MED | reports | external evidence | external | no | W4 | — |
| G-014 | Correlation IDs (non-ingestion) | catalog | MED | observability | add to key integrations | none | no | W4 | tests |
| G-015 | Retry/idempotency coverage | catalog | MED | resilience | extend patterns | none | no | W4 | tests |
| G-016 | Persistent event/outbox | event-bus in-proc | HIGH | finance audit | outbox design | P12-02 | no | W4 | unit |
| G-017 | Service-to-service auth (bridge) | bridge no creds | HIGH | security | SEP evidence | SEP spec | yes | W4 | — |
| G-018 | Webhook outbound auth/rotation | webhook dispatcher | MED | security | secret rotation | none | no | W4 | — |
| G-019 | Jasper service evidence | no external contract | MED | reports | external | external | no | W4 | — |
| G-020 | apiClient double-prefix (dup of G-010) | — | DEBT | — | merged into G-010 | — | — | — | — |
| G-021 | Financial event persistence | posting-engine | HIGH | finance | outbox (with G-016) | P12-02 | no | W4 | unit |
| G-022 | Reconciliation/idempotency records | DB audit | MED | finance | additive models | P12-02 | no | W4 | — |

## Summary
- **CRITICAL: 1** (G-001 PG) · **HIGH: 5** (G-002,003,004,016,017,021) · **MED: 9** · **DEBT: 4** · **EXTERNAL-BLOCKED: 4** · **ENVIRONMENT-BLOCKED: 1**
- **Blocking: 4** (G-001,002,003,004,017) · **Non-blocking: rest**
