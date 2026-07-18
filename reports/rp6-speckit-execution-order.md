# RP6 — SpecKit Execution Order

**Date:** 2026-06-17
**Source:** RP4 wave planning + RP3 dependency matrix
**Mode:** Enterprise Planning — No Implementation

---

## SpecKit Sequence (One Task At A Time)

Each item represents a complete SpecKit cycle:
1. Read all prior specs
2. Read SYSTEM_DNA.md (once created)
3. Read tasks.md
4. Implement task
5. Write spec update
6. Run tests
7. Update tasks.md
8. Commit

---

### Sprint 1 — Foundation (Week 1-2)

| Order | Task | Why First |
|-------|------|-----------|
| 1 | **T200** — SYSTEM_DNA.md | Primary authority — all subsequent decisions reference it |
| 2 | **G013** — Update tasks.md | Reflect T066/T067/T071a/T077/T085 as completed |
| 3 | **T086** — Core DB Schema | Foundation for all database work |
| 4 | **T202** — Template Engine V3 | Foundation for all document output |

### Sprint 2 — Database + PDF (Week 3-4)

| Order | Task | Why Here |
|-------|------|----------|
| 5 | **T087** — Features DB Schema | Must follow T086 |
| 6 | **T211** — Production Environment | Provisioning lead time — start early |
| 7 | **T201** — PDF Generation Engine | Depends on T202 |

### Sprint 3 — Area DB (Week 5-8)

| Order | Task | Why Here |
|-------|------|----------|
| 8 | **T088** — Area DB Template (×15) | Largest effort — start as soon as T086+T087 complete |
| 9 | **T209** — SSL/HTTPS | Depends on T211 |
| 10 | **T116** — CI/CD Pipeline | Depends on T211 |

### Sprint 4 — Billing Core (Week 9-10)

| Order | Task | Why Here |
|-------|------|----------|
| 11 | **T203** — Bill Cycle Governance | Billing reliability |
| 12 | **T204** — Fix Customer/Unit | Correct billing attribution |
| 13 | **T206** — DB Unique Constraint | Pre-dupe data integrity |
| 14 | **T208** — Safe Invoice Regeneration | Depends on T203+T206 |
| 15 | **T214** — Invoice Due Date | Quick win |

### Sprint 5 — Document Output (Week 11-12)

| Order | Task | Why Here |
|-------|------|----------|
| 16 | **T212** — QR Code Generation | Depends on T201 |
| 17 | **T213** — Invoice Hash | Depends on T201+T063 |

### Sprint 6 — Quality (Week 13-14)

| Order | Task | Why Here |
|-------|------|----------|
| 18 | **T083** — Contract Reconciliation | Before production |
| 19 | **T080** — E2E Coverage Expansion | Before T215 |
| 20 | **T112** — Security Audit | Before production |
| 21 | **T113** — Load Test | Before production |
| 22 | **T210** — Monitoring/Alerting | Before production |
| 23 | **T216** — Backup Automation | Before production |
| 24 | **G027** — Smoke Script PATH Fix | Before any production testing |

### Sprint 7 — Polish (Week 15-16)

| Order | Task | Why Here |
|-------|------|----------|
| 25 | **T091** — Symbiot Bridge | Parallel track completes |
| 26 | **T089** — 16-Profile RBAC | Required before opening access |
| 27 | **T207** — Cancel Invoice Endpoint | Polish — after core billing |
| 28 | **T205** — Wire Meter Detail Page | Polish — after APIs mature |
| 29 | **T215** — RTL/Responsive Tests | Polish — after E2E framework |
| 30 | **T102** — 32 Reports | Long tail — port from Jasper |

### Sprint 8-11 — Migration (Week 17-25)

| Order | Task | Why Here |
|-------|------|----------|
| 31 | **T107** — Solar Wallet Migration | Depends on T088 |
| 32 | **T108** — SBill Palm Hills Migration | Depends on T088 |
| 33 | **T109** — SBill Estates Migration | Depends on T088 |
| 34 | **T110** — Collection Tracker Migration | Depends on T088 |

---

## SpecKit Execution Flow

```
SpecKit Cycle:
┌─────────────┐     ┌──────────────┐     ┌────────────┐     ┌─────────────┐
│ Read Prior  │────→│ Read Current │────→│ Implement  │────→│ Update Spec │
│ Specs/Report│     │ Task Spec    │     │ + Test     │     │ + tasks.md  │
└─────────────┘     └──────────────┘     └────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
                                                             ┌────────────┐
                                                             │   Commit   │
                                                             └────────────┘
```

## Key Rules

1. **Never skip SYSTEM_DNA.md** — always read before any task
2. **T200 must complete before any other P0 implementation** — governance blocker
3. **T086 before T087 before T088** — database dependency chain is rigid
4. **T202 before T201** — template engine must exist before PDF generation
5. **T203 + T206 before T208** — bill cycle + unique constraint before safe regeneration
6. **T201 + T063 before T212 + T213** — PDF engine + issue before QR/hash
7. **No production deployment before T209 (SSL)** — security requirement
8. **No production deployment before T210 (monitoring)** — observability requirement
