# P12-01 — SOURCE-OF-TRUTH DISCREPANCY REGISTER

**Date:** 2026-08-15 · **Gate:** P12-01 · **Method:** §3 rule — documentation-vs-code conflicts recorded (not silently corrected)

## Precedence (applied)
Running code > DB schema > API/service implementation > tests > config/deploy > governance > architecture docs > planning > historical

## Discrepancies found
| # | Documented state | Actual state | Discrepancy | Authoritative evidence | Required correction |
|---|------------------|--------------|-------------|------------------------|---------------------|
| D-01 | apiClient used with `/api/...` paths | produces `/api/api/...` (double prefix) | FE doc implies single /api | api-client.ts line 61 (BASE_URL+endpoint); backend tolerates path-strip | Callers use apiBackend or drop `/api`; doc hygiene (G-010) |
| D-02 | event-bus "durable" implied in some planning | in-process, NOT durable across restart | planning overstates | event-bus.js (in-proc emit only) | Update planning: in-proc, outbox pending (G-016) |
| D-03 | "Migration via db push" (old docs) | deploy now uses migrate deploy (P60.7 §12) | docs lag | MeterVerse.cmd deploy block | Docs updated to migrate deploy (P60.7 done) |
| D-04 | PG18 postgresql-x64-18 implied as :5433 | PG18 is :5434; MeterVerse DB = PG16 :5433 | tool doc conflict (fixed P60.3) | postgresql.conf both versions | Resolved in P60.3 (config.cmd/MeterVerse.cmd/StartAll.cmd) |
| D-05 | P09/P10/P11 planning status for financial/solar | financial+solar IMPLEMENTED in repo | planning lags | routes/services verified | Reconciliation doc (P12-01) records DONE |
| D-06 | jasper-bridge "integrated" | code exists, external report service unverified | overstates | jasper-bridge.js + no external evidence | Class C; evidence-gated (G-013/019) |

## Rule compliance
- **NO silent corrections made.** Each discrepancy recorded with documented/actual/evidence/required-fix.
- Discrepancies D-03/D-04 already resolved by prior gates (recorded for traceability, not re-opened).
- D-01/D-02/D-05/D-06 remain open as documented gaps (G-010, G-016, reconciliation, G-013/019).
