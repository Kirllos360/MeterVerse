# RP1 — Gap-to-Task Reconciliation

**Date:** 2026-06-17
**Source:** OR11 Gap Register + tasks.md (T001-T120)
**Mode:** Enterprise Planning — No Implementation

---

## Reconciliation Matrix

| Gap ID | Gap Description | Severity | Mapped Task | Missing Task | Story | Epic | Dependency | Priority | Effort | Area |
|--------|----------------|----------|-------------|--------------|-------|------|------------|----------|--------|------|
| G001 | SYSTEM_DNA.md missing | HIGH | — | **T200** | Governance | Project Foundation | None | P0 | 2d | Governance |
| G002 | Solar Wallet — no implementation | HIGH | T107 (planned) | — | v2.0.0 Migration | v2.0.0 Phase 4 | T088, T098 | P0 | 2w | Billing |
| G003 | Chilled Water — no implementation | HIGH | T088 (Area DB), T097 (Invoices) | — | v2.0.0 Infrastructure/Pages | v2.0.0 Phase 0/2 | T087 | P0 | 3w | Billing |
| G004 | Settlement Engine — no implementation | HIGH | T088 (Area DB) | — | v2.0.0 Infrastructure | v2.0.0 Phase 0 | G003 (Chilled Water) | P0 | 3w | Billing |
| G005 | PDF Generation — no capability | HIGH | — | **T201** | Document Output | v2.0.0 Phase 3 | G006 (Template Engine) | P0 | 2w | Document Output |
| G006 | Template Engine V3 — not ported | HIGH | — | **T202** | Document Output | v2.0.0 Phase 3 | None (parallel with G005) | P0 | 2w | Document Output |
| G007 | Bill Cycle Governance — no workflow | HIGH | — | **T203** | Billing Operations | v2.0.0 Phase 2 | T009, T010 | P1 | 1w | Billing |
| G008 | Contract tests — 91 timeouts | MEDIUM | T083 (existing) | — | Polish | Phase 6 | T012 | P1 | 2d | Quality |
| G009 | No CI/CD pipeline | MEDIUM | T116 (planned) | — | v2.0.0 Quality | v2.0.0 Phase 5 | Production Dockerfile | P1 | 3d | DevOps |
| G010 | No security audit | MEDIUM | T112 (planned) | — | v2.0.0 Quality | v2.0.0 Phase 5 | None | P1 | 1w | Security |
| G011 | No load testing | MEDIUM | T113 (planned) | — | v2.0.0 Quality | v2.0.0 Phase 5 | T062, T065 | P1 | 3d | Performance |
| G012 | Hardcoded customer/unit IDs in invoice gen | MEDIUM | — | **T204** | Billing Fix | Phase 6 — Polish | T032 | P1 | 1d | Billing |
| G013 | Tasks.md out of date (5 tasks) | LOW | — | (governance) | Governance | Project Foundation | None | P2 | 1h | Governance |
| G014 | No frontend spec tests | LOW | T079 (existing) | — | Polish | Phase 6 | T035-T078 | P2 | 1w | Quality |
| G015 | Meter Detail Page — mock data only | LOW | — | **T205** | Frontend Migration | US1 Polish | T047, T038 | P2 | 1d | Frontend |
| G016 | No DB duplicate prevention for invoices | MEDIUM | — | **T206** | Database Fix | Phase 6 — Polish | None | P1 | 4h | Database |
| G017 | No cancel invoice endpoint | LOW | — | **T207** | Billing Fix | Phase 6 — Polish | T063, T010 | P2 | 1d | Billing |
| G018 | Destructive invoice regeneration | MEDIUM | — | **T208** | Billing Fix | Phase 6 — Polish | G007, G016 | P1 | 2d | Billing |
| G019 | No HTTPS/SSL | HIGH | — | **T209** | Security | Infrastructure | Deployment infra | P0 | 2d | DevOps |
| G020 | No monitoring/alerting | MEDIUM | — | **T210** | DevOps | Infrastructure | G009, T081 | P1 | 3d | DevOps |
| G021 | No production environment | HIGH | — | **T211** | Infrastructure | Infrastructure | G009, G019 | P0 | 1w | DevOps |
| G022 | Only 7 of 16 roles | MEDIUM | T089 (planned) | — | v2.0.0 Foundation | v2.0.0 Phase 0 | T086 | P2 | 1w | Auth/RBAC |
| G023 | Single schema — 15 Area DBs missing | HIGH | T088 (planned) | — | v2.0.0 Foundation | v2.0.0 Phase 0 | T087 | P0 | 4w | Database |
| G024 | No QR code generation | MEDIUM | — | **T212** | Document Output | v2.0.0 Phase 3 | G005 (PDF Gen) | P1 | 2d | Document Output |
| G025 | No invoice hash/verification code | MEDIUM | — | **T213** | Document Output | v2.0.0 Phase 3 | G005, T063 | P1 | 2d | Document Output |
| G026 | Invoice due date not set | LOW | — | **T214** | Billing Fix | Phase 6 — Polish | T062, T061 | P2 | 1d | Billing |
| G027 | Smoke script fails (bunx PATH) | LOW | — | (ops fix) | Ops | — | None | P3 | 1h | DevOps |
| G028 | No Playwright UAT .spec.ts files | MEDIUM | T080 (existing) | — | Polish | Phase 6 | T079 | P1 | 1w | Quality |
| G029 | No RTL/responsive testing | LOW | — | **T215** | Quality | Phase 6 — Polish | G028 | P2 | 2d | Quality |
| G030 | No Symbiot bridge | HIGH | T091 (planned) | — | v2.0.0 Infrastructure | v2.0.0 Phase 1 | T086 | P0 | 4w | Integration |
| G031 | No data migration scripts | HIGH | T107-T110 (planned) | — | v2.0.0 Migration | v2.0.0 Phase 4 | T088, G023 | P0 | 6w | Migration |
| G032 | No backup automation | MEDIUM | — | **T216** | Operations | Infrastructure | T084a | P1 | 1d | Operations |

---

## Task Status Summary

### Existing Tasks Reused (from tasks.md)

| Existing Task | Description | Gaps Covered | Current Status |
|--------------|-------------|--------------|----------------|
| T079 | Frontend contract + integration tests | G014 | [ ] Planned |
| T080 | E2E coverage expansion | G028 | [ ] Planned |
| T083 | Contract reconciliation | G008 | [ ] Planned |
| T088 | Area DB template (45 tables) | G003, G004, G023 | [ ] Planned |
| T089 | 16-profile RBAC | G022 | [ ] Planned |
| T091 | Symbiot bridge | G030 | [ ] Planned |
| T107 | Solar wallet migration | G002 | [ ] Planned |
| T108 | SBill Palm Hills migration | G031 | [ ] Planned |
| T109 | SBill Estates migration | G031 | [ ] Planned |
| T110 | Collection Tracker migration | G031 | [ ] Planned |
| T112 | Security audit | G010 | [ ] Planned |
| T113 | Load test | G011 | [ ] Planned |
| T116 | CI/CD pipeline | G009 | [ ] Planned |

### New Tasks Required

| New Task | Description | Gaps Covered | Effort |
|----------|-------------|--------------|--------|
| T200 | Create SYSTEM_DNA.md from existing docs | G001 | 2d |
| T201 | PDF Generation Engine (port from Flask) | G005 | 2w |
| T202 | Template Engine V3 (port to NestJS) | G006 | 2w |
| T203 | Bill Cycle Governance (OPEN/CLOSE/CANCEL + approval) | G007 | 1w |
| T204 | Fix invoice generation — resolve real customer/unit IDs | G012 | 1d |
| T205 | Wire Meter Detail Page to live API | G015 | 1d |
| T206 | Add DB unique constraint for invoice dedup | G016 | 4h |
| T207 | Implement cancel invoice endpoint | G017 | 1d |
| T208 | Replace destructive invoice regeneration with safe upsert | G018 | 2d |
| T209 | SSL/HTTPS configuration | G019 | 2d |
| T210 | Monitoring and alerting setup | G020 | 3d |
| T211 | Provision production environment | G021 | 1w |
| T212 | QR code generation for invoices | G024 | 2d |
| T213 | Invoice hash/verification code | G025 | 2d |
| T214 | Set invoice due date during generation | G026 | 1d |
| T215 | RTL/responsive Playwright tests | G029 | 2d |
| T216 | Scheduled backup automation | G032 | 1d |

---

## Gap Count by Status

| Category | Count |
|----------|-------|
| Total Gaps | 32 |
| Mapped to existing task | 13 |
| Requires new task | 16 |
| Governance/ops fix (no new task) | 3 (G013, G027, G032 partial) |

## Priority Distribution

| Priority | Count | Cumulative Effort |
|----------|-------|-------------------|
| P0 | 10 | ~18 weeks |
| P1 | 11 | ~4 weeks |
| P2 | 9 | ~2.5 weeks |
| P3 | 2 | ~1 hour |
| **Total** | **32** | **~24.5 weeks** |
