# IMPLEMENTATION_PROTOCOL.md

**Version:** 1.0.0  
**Status:** PERMANENT AUTONOMOUS EXECUTION PROTOCOL — DOCUMENTATION ONLY  
**Date:** 2026-08-01  
**Operational source of truth:** `MASTER_PLANNING_INDEX.md` + `P40_EXECUTION_TRACKER.md`  
**Scope:** Governs all MeterVerse implementation sessions. No architecture change, no new program, no dependency change, no production code in this document.

---

## 1. Startup Procedure

Every implementation session MUST load, in this exact order:

```
 1. .ai/memory/P00_CONSTITUTION.md
 2. .ai/memory/AI_BIBLE.md
 3. MASTER_PLANNING_INDEX.md
 4. .ai/memory/PROJECT_STATE.md
 5. P40_Enterprise_Implementation_Master_Program.md
 6. P40_EXECUTION_TRACKER.md
 7. Latest certification document (P42 or newer)
 8. Latest execution plan (P43 or newer)
 9. Only the planning documents required for the active implementation wave.
```

Rules:
- Load order is mandatory and sequential.
- Step 9 is **wave-scoped**: load only the C-series documents for the active wave per P40/P43 mapping. Do not load future-wave documents.
- If any file in steps 1-8 is missing, stop and report (missing dependency condition).

---

## 2. Autonomous Execution Rules

For every implementation increment, execute in order:

| Step | Action |
|------|--------|
| 1 | Determine current wave (from `P40_EXECUTION_TRACKER.md` + latest execution plan). |
| 2 | Determine next unfinished task (from tracker + active wave plan). |
| 3 | Verify dependencies (per MASTER_PLANNING_INDEX Dependency column; per P40 wave order). |
| 4 | Implement only approved scope (from the active wave's C-series/P-series documents). |
| 5 | Run required tests (C20 gates: tsc 0, vitest, coverage thresholds, contract, integration, Playwright, security, regression as applicable). |
| 6 | Update `P40_EXECUTION_TRACKER.md` (coverage %, per-program status). |
| 7 | Update implementation status (status blocks in planning docs where applicable). |
| 8 | Record observations (OBS-nnn in tracker per Rule 5-7). |
| 9 | Commit (documentation/implementation within scope; no `--no-verify`). |
| 10 | Push to `origin` (Kirllos360/MeterVerse). |
| 11 | Continue to the next approved task. |

Hard rules:
- **Never redesign architecture.**
- **Never skip dependency validation.**
- **Never implement future waves early.**
- **Never create new C-series or P-series programs.**
- **Never modify approved design.**
- **Web-only UI. No native mobile application.**
- **No autonomous financial mutation** (C13 AI: human approval + confidence gates).
- Feature-flag gating (P40 P-04/P-05); additive-only migrations (P40 P-04); API versioning (P40 P-07).

---

## 3. Stop Conditions

Stop automatically and report ONLY when any of the following is true:

- **A dependency is missing** (prerequisite program/model/service not present).
- **A certification gate fails** (C20 quality gate or C21 governance checkpoint not met).
- **A breaking change is required** (would violate approved architecture or additive-migration policy).
- **Human approval is explicitly required** by the approved architecture (e.g., C13 financial actions, AI approval points, C21 governance decisions).

Otherwise **continue automatically** to the next approved task without pausing.

---

## 4. Completion Output

After every increment, report:

- **Files changed**
- **Tests executed** (counts + result)
- **Coverage** (current %)
- **Tracker percentage** (overall implementation % from P40_EXECUTION_TRACKER.md)
- **Commit hash**
- **Remaining task** (current wave)
- **Next task**

---

## 5. Repository Status

- **`MASTER_PLANNING_INDEX.md`** is the canonical repository index (document locations, program mapping, status, load order).
- **`P40_EXECUTION_TRACKER.md`** is the live implementation coverage registry (per-program %, observations, milestones).
- Together they are the **operational source of truth for autonomous execution**.
- All planning decisions remain in the approved C-series and P-series documents.

This document is documentation only. No production code is implemented by this protocol file.

---

*Documentation artifact. No architecture, program, dependency, or code change.*
*IMPLEMENTATION_PROTOCOL.md — Permanent Autonomous Execution Protocol.*
