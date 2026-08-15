# THREE-PROFILE OPERATING MODEL — GAP MATRIX (P59-C/LR-7 · §11)

**Date:** 2026-08-14 · **Purpose:** honestly classify every operational element for Profile 0/1/2.
**Legend:** IMPLEMENTED / DESIGNED / PARTIAL / MISSING / DANGEROUS / REQUIRES BUSINESS DECISION

| Element | Profile 0 (Normal) | Profile 1 (Failover) | Profile 2 (Emergency) | Gap / Note |
|---------|--------------------|-----------------------|-----------------------|------------|
| Source of truth | IMPLEMENTED (meter_pulse) | REQUIRES DECISION (replica vs snapshot) | REQUIRES DECISION (frozen snapshot) | no replication strategy chosen |
| Database strategy | IMPLEMENTED (PG16) | DESIGNED (replica) | DESIGNED (read-only snapshot) | — |
| Replication | N/A | MISSING | MISSING | no streaming/periodic replication implemented |
| Synchronization | IMPLEMENTED (live) | MISSING | MISSING | — |
| Activation | IMPLEMENTED (normal boot) | DESIGNED (detection→fence→activate) | DESIGNED (only if P0+P1 down) | no infra |
| Deactivation | IMPLEMENTED (stop) | DESIGNED | DESIGNED | — |
| Fencing | N/A | DESIGNED (write token) | DESIGNED | no implementation |
| Split-brain prevention | IMPLEMENTED (single DB writer) | DESIGNED (single write owner rule) | DESIGNED | single-writer invariant encoded in graph R5 |
| Stale-data handling | N/A | DESIGNED (reads_stale edge) | DESIGNED (read_only edge) | — |
| Write policy | IMPLEMENTED (auth'd writes) | DESIGNED (read-mostly) | DESIGNED (read-only) | — |
| Read policy | IMPLEMENTED (auth'd reads) | DESIGNED | DESIGNED | — |
| Audit continuity | IMPLEMENTED (auditLog) | DESIGNED (audit on each profile) | DESIGNED | — |
| Recovery | IMPLEMENTED (restart) | DESIGNED | DESIGNED | — |
| Reconciliation | N/A | MISSING | MISSING | no post-failover reconcile job |
| RPO | N/A | **REQUIRES BUSINESS DECISION** | **REQUIRES BUSINESS DECISION** | not defined |
| RTO | N/A | **REQUIRES BUSINESS DECISION** | **REQUIRES BUSINESS DECISION** | not defined |
| Health checks | IMPLEMENTED (health + scheduler heartbeat) | DESIGNED (readiness probes) | DESIGNED | — |
| Operator authorization | IMPLEMENTED (RBAC) | DESIGNED | DESIGNED | — |
| Auto vs manual activation | IMPLEMENTED (manual) | DESIGNED (manual recommended) | DESIGNED (manual + safety) | auto-activation is DANGEROUS without fencing |
| Rollback | IMPLEMENTED (git + restore) | DESIGNED | DESIGNED | — |
| Authentication | IMPLEMENTED (JWT) | DESIGNED (JWT on each profile) | DESIGNED (emergency JWT) | — |
| Tenancy on failover | IMPLEMENTED (fail-closed) | DESIGNED (must preserve) | DESIGNED (must preserve) | rule R4 in master graph |

## Summary
- **Fully IMPLEMENTED:** Profile 0 (all elements) + single-writer invariant + audit + RBAC + JWT.
- **DESIGNED only (not implemented):** Profile 1 activation/fencing, Profile 2 emergency, replication, reconciliation.
- **REQUIRES BUSINESS DECISION:** RPO, RTO, replication strategy, auto-vs-manual activation, max emergency operating time.
- **DANGEROUS (do NOT implement without fencing):** automatic Profile 1/2 activation, multi-writer failover.

## Next executable step (dependency-safe)
Implement Profile 0 health-check hardening (already exists) → document a **manual failover runbook** (decision-authority + step sequence) → implement read-only Profile 2 mode flag (a `readOnly` env guard that blocks writes) — both safe, no infra change.
