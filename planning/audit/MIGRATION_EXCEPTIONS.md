# Migration Exceptions Register

**Purpose:** Items intentionally deferred from Prompt 03 to Prompt 04.

| ID | Exception | Reason | Impact | Deferred To |
|:--:|-----------|--------|--------|:-----------:|
| EX-001 | old_tasks.md NestJS tasks (T001-T005, T027-T034, T043-T052, T061-T067) | Different architecture (NestJS vs Express.js) — needs rewrite | Rewrite effort: 38 tasks | Prompt 04 |
| EX-002 | Data migration tasks (T107-T111) | Requires production database access | Launch blocker | Wave 08 |
| EX-003 | Production deployment (T117-T120, T209, T211) | Requires production environment provisioning | Launch blocker | Wave 04 Phase 45f extension |
| EX-004 | 16-profile RBAC expansion (T089) | Architecture decision pending (confirm role count) | Feature scope decision | Prompt 04 |
| EX-005 | i18n 676 AR/EN keys (T090) | Arabic support exists but keys not inventoried | Localization coverage | Wave 09 |
| EX-006 | Load testing (T113) | Requires baseline performance metrics first | Performance baseline | Wave 04 Phase 45a extension |
| EX-007 | Security penetration testing (T112) | Requires production-like environment | Security compliance | Wave 04 Phase 45b extension |
| EX-008 | Graphiti 1000-node certification (T114) | Current graph has 366 entries — needs more code | Knowledge graph completeness | Wave 04 Phase 45f extension |
| EX-009 | SpeckIt loop testing (T115) | SpeckIt tool not installed or documented | Process automation | Wave 04 Phase 45f extension |
| EX-010 | Constitution ratification (T085) | Requires stakeholder review | Governance | Prompt 04 |
