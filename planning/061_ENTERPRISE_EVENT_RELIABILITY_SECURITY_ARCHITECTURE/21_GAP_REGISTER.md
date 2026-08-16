# P12-02-21 — GAP REGISTER (event reliability scope)

Permanent register (§27). Updates G-014/015/016/017/021 from P12-01 (now designed).

| ID | Description | Severity | Source | Evidence | Dependency | Decision | Required artifact | Phase | Verify | Status |
|----|-------------|----------|--------|----------|------------|----------|-------------------|-------|--------|--------|
| G-016 | No persistent outbox | HIGH | P12-01 | event-bus in-proc, no outbox model | PG (impl) | **DESIGNED (P12-02)** | 02,10,12 | P12.2-D/E | design done |
| G-021 | Event/outbox reliability | HIGH | P12-01 | same | — | **DESIGNED** | 08,12,14 | P12.2-E/F | design done |
| G-014 | Correlation not universal | MED | P12-01 | only symbiot has correlationId | — | **DESIGNED** | 05 | P12.2-B | design done |
| G-015 | Idempotency not universal | MED | P12-01 | guards only import/cheque/alloc | — | **DESIGNED** | 04 | P12.2-C | design done |
| G-017 | No service-to-service auth | HIGH | P12-01 | bridge no creds | — | **DESIGNED** | 06 | P12.2-G | design done |
| G-022 (new) | AuditEntry lacks correlationId | MED | P12-02 | audit schema | — | DESIGNED | 10 | P12.2-B | design done |
| G-023 (new) | Financial replay safety | HIGH | P12-02 | no replay guard | — | **DESIGNED** | 18 | P12.2-J | design done |
| G-024 (new) | Retry/dead-letter absent for events | MED | P12-02 | only webhook retry | — | DESIGNED | 08 | P12.2-F | design done |
| G-025 (new) | Dispatcher/worker absent | MED | P12-02 | no outbox dispatcher | — | DESIGNED | 12 | P12.2-E | design done |
| G-026 (new) | Event observability metrics | MED | P12-02 | metrics lacks outbox | — | DESIGNED | 13 | P12.2-H | design done |
| G-001 | PostgreSQL runtime | CRITICAL | env | 0xC0000142 | RAM | PENDING | recovery doc | — | fingerprint | BLOCKED_ENV |
| G-003 | OBIS capture | HIGH | approval | P60.7 | approval | PENDING | OBIS audit | — | — | APPROVAL |
| G-004 | SEP evidence | HIGH | external | no spec | external | PENDING | SEP matrix | — | — | EVIDENCE |

## Summary
- **P12-02-designed gaps (now unblocked for implementation):** G-014,015,016,017,021,022,023,024,025,026 (10)
- **Still blocked:** G-001 (PG env), G-003 (OBIS), G-004 (SEP)
