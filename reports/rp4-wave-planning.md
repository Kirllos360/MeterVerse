# RP4 — Wave Planning

**Date:** 2026-06-17
**Source:** RP1 mapping + RP3 dependency matrix
**Mode:** Enterprise Planning — No Implementation

---

## Wave Strategy

### Wave 1 — Foundation & Governance (P0 first)
*Minimum viable foundation before any feature work*

| Order | Task | Description | Effort | Depends On | Risk |
|-------|------|-------------|--------|------------|------|
| 1 | T200 | SYSTEM_DNA.md | 2d | — | Governance blocker |
| 2 | T086 | Core DB Schema | 1w | — | Foundation for everything |
| 3 | T202 | Template Engine V3 (port) | 2w | — | Parallel track to DB |
| 4 | T087 | Features DB Schema | 2w | T086 | Migration risk |
| 5 | T211 | Production Environment | 1w | — | Provisioning lead time |
| 6 | T209 | SSL/HTTPS | 2d | T211 | Certificate setup |
| 7 | T088 | Area DB Template (×15) | 4w | T087 | **Critical path most expensive** |
| 8 | T091 | Symbiot Bridge | 4w | T086 | Windows packaging |
| 9 | T201 | PDF Generation Engine | 2w | T202 | Tech stack choice |
| 10 | T116 | CI/CD Pipeline | 3d | T211 | DevOps prerequisite |
| **Total** | | | **~17w** | **Parallel tracks A+B+F** | **~10w critical path** |

### Wave 2 — Billing & Operations (P1)
*Production-critical billing fixes + quality*

| Order | Task | Description | Effort | Depends On |
|-------|------|-------------|--------|------------|
| 1 | T203 | Bill Cycle Governance | 1w | T009, T010 |
| 2 | T204 | Fix Customer/Unit Resolution | 1d | T032 |
| 3 | T206 | DB Unique Constraint | 4h | — |
| 4 | T208 | Safe Invoice Regeneration | 2d | T203, T206 |
| 5 | T212 | QR Code Generation | 2d | T201 |
| 6 | T213 | Invoice Hash/Verification | 2d | T201, T063 |
| 7 | T083 | Contract Reconciliation | 2d | T012 |
| 8 | T080 | E2E Coverage Expansion | 1w | T079 |
| 9 | T112 | Security Audit | 1w | — |
| 10 | T113 | Load Test | 3d | T062, T065 |
| 11 | T210 | Monitoring/Alerting | 3d | T211, T081 |
| 12 | T216 | Backup Automation | 1d | T084a |
| 13 | T214 | Invoice Due Date | 1d | T062, T061 |
| **Total** | | | **~5w** | **~3w sequential** |

### Wave 3 — Standard Features (P2)
*Feature completion + polish*

| Order | Task | Description | Effort | Depends On |
|-------|------|-------------|--------|------------|
| 1 | T089 | 16-Profile RBAC | 1w | T086 |
| 2 | T207 | Cancel Invoice Endpoint | 1d | T063, T010 |
| 3 | T205 | Meter Detail API Wiring | 1d | T047, T038 |
| 4 | T215 | RTL/Responsive Tests | 2d | T080 |
| 5 | T102 | 32 Reports (port from Jasper) | 4w | T073, T202 |
| 6 | G013 | Tasks.md update | 1h | — |
| **Total** | | | **~5w** | **~4w sequential** |

### Wave 4 — Migration & Cutover (P0/P1)
*Production cutover — depends on Waves 1-3*

| Order | Task | Description | Effort | Depends On |
|-------|------|-------------|--------|------------|
| 1 | T107 | Solar Wallet Migration | 2w | T088, T086 |
| 2 | T108 | SBill Palm Hills Migration | 2w | T088, T086 |
| 3 | T109 | SBill Estates Migration | 2w | T088, T086 |
| 4 | T110 | Collection Tracker Migration | 2w | T088, T086 |
| **Total** | | | **~8w** | **Can parallelize** |

---

## Wave Timeline (Calendar View)

```
    WEEK    1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
   ─────────────────────────────────────────────────────────────────────
   WAVE 1:
   T200     ██
   T086     ████████
   T202     ████████████████
   T087         ████████████████
   T211         ████████
   T209                       ██
   T088               ████████████████████████████████
   T091               ████████████████████████████████
   T201                           ████████████████
   T116                                    ██
   
   WAVE 2:
   T203                                     ████████
   T204                                     █
   T206                                     █
   T208                                       ███
   T212                                       ████████
   T213                                       ████████
   T083                                       ██
   T080                                         ████████
   T112                                         ████████
   T113                                             ██
   T210                                             ██
   T216                                             █
   T214                                       █
   
   WAVE 3:
   T089                                                 ████████
   T207                                                 █
   T205                                                 █
   T215                                                   ███
   T102                                                     ████████████████████████████████
   G013                                                   █
   
   WAVE 4:
   T107                                                                    ████████████████
   T108                                                                    ████████████████
   T109                                                                    ████████████████
   T110                                                                    ████████████████
```

## Total Timeline

| Wave | Tasks | Duration | Cumulative |
|------|-------|----------|------------|
| Wave 1 | 10 tasks | ~10 weeks (critical path) | Week 10 |
| Wave 2 | 13 tasks | ~3 weeks | Week 13 |
| Wave 3 | 6 tasks | ~4 weeks | Week 17 |
| Wave 4 | 4 tasks | ~8 weeks | Week 25 |

**Estimated total: 25 weeks (~6 months)**
