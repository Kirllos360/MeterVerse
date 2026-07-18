# B3 — Next Task Certification

**Date:** 2026-06-17
**Status:** CERTIFIED
**Authority:** SYSTEM_DNA.md (ratified by B0), tasks.md (reconciled by B1), RP6 execution order

---

## Certified Next Task Sequence

The governance baseline phase produces 4 outputs (B0-B4). After these complete, implementation may resume. The next tasks are certified as follows:

---

### Gate: Governance Phase Complete

Before any implementation, these governance actions must be complete:

| # | Action | Status | Report |
|---|--------|--------|--------|
| G1 | SYSTEM_DNA.md ratified | ✅ DONE | B0 |
| G2 | tasks.md modifications documented | ✅ DONE | B1 |
| G2a | tasks.md modifications APPLIED | ❌ PENDING | This gate |
| G3 | Baseline scoreboard established | ✅ DONE | B2 |
| G4 | Next task certified | ✅ DONE | This report |
| G5 | Final governance report | ❌ PENDING | B4 |

**All gates must pass before T086 begins.**

---

### First Action: Apply tasks.md Updates (G013)

| Field | Value |
|-------|-------|
| **Action** | Apply B1 modifications to tasks.md |
| **Changes** | Mark T066, T067, T071a as [X]; mark T078 out of scope; add T200-T216 |
| **Risk** | None — file-only change, no code |
| **Effort** | ~15 min |
| **Evidence** | `reports/b1-task-reconciliation.md` |

---

### First Implementation Task: T086 — Core DB Schema

| Field | Value |
|-------|-------|
| **Task** | T086 — Create Core DB schema (15 tables) |
| **Priority** | P0 |
| **Dependencies** | None (new project) — but governance gate must pass first |
| **RP6 Order** | 3 (after T200 ✅, G013 ⏳) |
| **Wave** | Wave 1 — Foundation & Governance (Week 1-10) |
| **Critical Path** | T086 → T087 → T088 = 10 weeks minimum |
| **Effort** | 1 week |
| **Area/Files** | `backend/prisma/schema.prisma` (core schema) |
| **Acceptance** | 15 Core tables created in `core` schema |
| **SYSTEM_DNA Reference** | §3.1 — Schema Strategy, §3.2 — Current Schema |

#### Why T086 First

1. **Dependency root** — T086 has zero dependencies and is the foundation for T087 (Features DB), T088 (Area DB), T089 (16-Profile RBAC), T091 (Symbiot Bridge), and every v2.0.0 feature
2. **Blocking chain** — T086 → T087 → T088 = critical path (10 weeks). Delaying T086 by 1 week delays the entire program by 1 week
3. **No code conflicts** — New schema in a new project space, no risk of breaking existing MVP code
4. **Reference available** — SYSTEM_DNA.md §3.2 provides the model inventory; existing Prisma schema at `backend/prisma/schema.prisma` is the starting point

---

### Sequence After Governance

```
G013 (Update tasks.md)        — 15 min, governance action
  ↓
T086 (Core DB Schema)         — 1w, P0 implementation start
  ↓
T202 (Template Engine V3)     — 2w, P0 (can start in parallel with T087)
  ↓
T087 (Features DB Schema)     — 2w, P0 (depends on T086)
  ↓
T211 (Production Environment) — 1w, P0 (provisioning lead time)
  ↓
T201 (PDF Generation Engine)  — 2w, P0 (depends on T202)
  ↓
T088 (Area DB Template ×15)   — 4w, P0 (depends on T087)
  ↓
... (continue RP6 execution order)
```

---

### Dependency Evidence

```
T086 ──→ T087 ──→ T088
  │        │        └──→ T107 (Solar Migration)
  │        │        └──→ T108 (SBill PH Migration)
  │        │        └──→ T109 (SBill Estates Migration)
  │        │        └──→ T110 (Collection Tracker Migration)
  │        │
  │        └──→ T100 (Tariffs)
  │        └──→ T102 (32 Reports)
  │
  └──→ T089 (16-Profile RBAC)
  └──→ T090 (i18n)
  └──→ T091 (Symbiot Bridge)
  └──→ T092 (3 Availability Plans)
  └──→ T093-T098 (Core Pages)
```

**Critical Path:** T086(1w) → T087(2w) → T088(4w) = **7 weeks** minimum sequential. With parallel work on T202/T211 during T086/T087, Wave 1 completes in 10 weeks.

---

### Readiness to Begin

| Prerequisite | Status |
|-------------|--------|
| SYSTEM_DNA.md ratified | ✅ B0 complete |
| Tasks.md reconciled | ✅ B1 complete |
| Scoreboard baseline set | ✅ B2 complete |
| Next task certified | ✅ This report |
| Governance rules active | ⏳ After B4 |
| Constitution ratified | ❌ T085 (Phase 6, not blocking T086) |

**Verdict:** ✅ Certified. Begin with G013 (apply tasks.md updates), then proceed to T086 (Core DB Schema).
