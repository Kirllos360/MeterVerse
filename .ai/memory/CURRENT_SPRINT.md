# MeterVerse - Current Sprint

## P12.2-B Correlation + Request-Identity Middleware (2026-08-17)

**Goal:** server-authoritative correlation/causation middleware over the applied P12.2-A schema (P12-02-05 spec §3).  
**Status:** COMPLETE — 7 tests + live certified

| Item | Result |
|------|--------|
| Middleware | correlationMiddleware upgraded in-place (errorHandler.js): full-UUID requestId; correlationId accepted ONLY if valid UUID else regenerated (server-authoritative, spoof-proof); X-Causation-ID validated passthrough |
| Propagation | req.correlationId → auditLog (AuditEntry.correlationId col) → response headers X-Correlation-ID/X-Request-ID/X-Causation-ID |
| Tests | +7 unit (valid preserve / invalid regen / absent gen / headers / causation passthrough+ignore / req propagation) |
| Live cert | login 200: spoofed header regenerated to UUID, valid header preserved, causation echoed |
| Suite | 448 (430/18) |
| Verified | Graph 12/0/0, SpecKit 100%, FE tsc 0 |
| Next | P12.2-C (enqueueEvent outbox producer) or Solar G01 register input |
| Solar (P13.8) | REAL history loaded (65 inv + 23 pay, totals exact); bilingual PDF certified; registers remain external |


