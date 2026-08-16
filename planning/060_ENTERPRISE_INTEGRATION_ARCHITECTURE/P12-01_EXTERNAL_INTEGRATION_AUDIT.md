# P12-01 — EXTERNAL INTEGRATION AUDIT

**Date:** 2026-08-15 · **Gate:** P12-01 · **Method:** repo-first; evidence-gated marked honestly

| External | Status | Evidence | Class |
|----------|--------|----------|-------|
| Symbiot (meter data transport) | **real** (TCP :9000 + HTTP :9001 bridge + ingestion) | symbiot-bridge.js, 13 tests | A |
| SEP (Symbiot Energy Platform auth/protocol) | **evidence-gated** — no MeterVerse SEP spec; Collection symbiot_client.py = auth pattern | P60.7 SEP matrix | I |
| OBIS (meter registers) | **designed** (additive model) — approval-gated | P60.7 OBIS audit | D |
| Jasper (reports) | **code exists** (jasper-bridge) but external report service evidence-gated | jasper-bridge.js | C |
| ERP (Oracle/etc.) | **planned only** | planning C15 | E |
| Payment/bank (Paymob/Fawry/NBE) | **planned only** | planning C15 | E/F |
| GIS/SCADA/IoT | **planned only** | planning C15/C34 | E/F |
| Email/SMS | **real** (email-engine, sms-engine) | services | B |
| Notifications (Twilio/etc.) | **real** (notification-engine) | services | B |
| DB connections (external meter DBs) | **real** (connection-profiles/manager/pool) | services + models | B |
| Credential vault | **real** | credential-vault.js | A |
| Webhooks (outbound) | **real** (webhook-dispatcher) | service | B |

## Findings
1. **Real external integrations:** Symbiot transport, email/SMS, notifications, external DB connections, webhooks, credential vault, Jasper (code, external-gated).
2. **Evidence-gated (no external spec in repo):** SEP auth/protocol, OBIS mapping, Jasper report service contract.
3. **Planned (no implementation):** ERP, bank/payment providers, GIS/SCADA/IoT.
4. **No external integration is documented-only-without-code** except the planned E-class items (correctly planned, not claimed).

## Gap
- **G-019:** Jasper bridge is C (code exists, no external service evidence/tests). Needs the Jasper report-service contract before it can be verified.
