# AI_START — Enterprise AI Entry Point

**Purpose:** This is the SECOND document every AI reads (after EAOS.md). It defines the single canonical startup sequence for the Meter Verse project. No other reading order exists.

**Owner:** Chief Enterprise AI Architect  
**Source of Truth:** EAOS.md (`../../EAOS.md`)  
**Related Documents:** HANDSHAKE.md, PROJECT_INDEX.md, PROJECT_STATE.md, LESSONS_LEARNED.md, SYSTEM_DNA_DRAFT.md  
**Last Updated:** 2026-07-02  
**Update Trigger:** EAOS.md Chapter 4 change, workspace reorganization  
**Validation Method:** Cross-reference with EAOS.md Chapter 4 — both must list identical sequence

---

## Canonical Startup Sequence

Per EAOS.md Chapter 4, every AI MUST read these documents in EXACT order. This sequence is defined in ONE place (this document) and referenced by all others.

```
[ 1] EAOS.md                              ← Permanent AI Operating System (immutable)
[ 2] AI_START.md                          ← THIS FILE — entry point, startup sequence
[ 3] PROJECT_INDEX.md                     ← Navigation hub — find any document
[ 4] PROJECT_STATE.md                     ← Authoritative "where are we now"
[ 5] LESSONS_LEARNED.md                   ← Permanent mistake record
[ 6] HANDSHAKE.md                         ← Live operational memory + stale validation
[ 7] SYSTEM_DNA_DRAFT.md                  ← Architecture single source of truth
[ 8] EEC-00C + Amendments                 ← Governance framework (3 files)
[ 9] STAGE-0-ENTERPRISE-MIGRATION-BLUEPRINT.md ← Current execution blueprint
[10] EV-13-ROOT-CAUSE-MASTER-REPORT.md    ← Root cause analysis
[11] ERP-00-ENTERPRISE-RECOVERY-PLAN.md   ← Wave definitions
[12] ERP-02A-WAVE02-IMPLEMENTATION-CERTIFICATION.md ← Previous wave result
```

### Document Locations

| Order | Document | Location |
|-------|----------|----------|
| 1 | EAOS.md | `../../EAOS.md` |
| 2 | AI_START.md | This file |
| 3 | PROJECT_INDEX.md | `../PROJECT_INDEX.md` |
| 4 | PROJECT_STATE.md | `../PROJECT_STATE.md` |
| 5 | LESSONS_LEARNED.md | `../07-STANDARDS/LESSONS_LEARNED.md` |
| 6 | HANDSHAKE.md | `../../HANDSHAKE.md` |
| 7 | SYSTEM_DNA_DRAFT.md | `../../SYSTEM_DNA_DRAFT.md` |
| 8 | EEC-00C governance | `../../EEC-00C-ENTERPRISE-GOVERNANCE-SPECIFICATION.md` |
| 8a | Amendment-01 | `../../EEC-00C-AMENDMENT-01-ADOPTION-VALIDATION.md` |
| 8b | Amendment-02 | `../../EEC-00C-AMENDMENT-02-ENTERPRISE-CONTINUITY-LAYER.md` |
| 9 | Stage-0 Blueprint | `../../STAGE-0-ENTERPRISE-MIGRATION-BLUEPRINT.md` |
| 10 | EV-13 Root Cause | `../../EV-13-ROOT-CAUSE-MASTER-REPORT.md` |
| 11 | ERP-00 Recovery Plan | `../../ERP-00-ENTERPRISE-RECOVERY-PLAN.md` |
| 12 | ERP-02A Wave-02 Cert | `../../ERP-02A-WAVE02-IMPLEMENTATION-CERTIFICATION.md` |

---

## Session Start Protocol

After completing the reading sequence, the AI MUST:

1. **Run HANDSHAKE stale check** (SVR-01 through SVR-04 per Amendment-02)
2. **Update HANDSHAKE.md** Section 8 (Current AI Session) with model, session_id, started, role
3. **Declare Unknown Unknowns** (EAOS.md Chapter 7 format)
4. **Cross-reference** HANDSHAKE.md with SYSTEM_DNA_DRAFT.md and Stage-0 Blueprint
5. **Confirm readiness** by writing confirmation in HANDSHAKE.md Session Confirmation section

If any step fails, STOP and escalate.

---

## Navigation

After completing startup, use `../PROJECT_INDEX.md` as the primary navigation hub. Do NOT scan the repository manually.

---

## Quick Reference

| Resource | Link |
|----------|------|
| AI Operating System | `../../EAOS.md` |
| Project Navigation | `../PROJECT_INDEX.md` |
| Current State | `../PROJECT_STATE.md` |
| Terminology | `../07-STANDARDS/PROJECT_GLOSSARY.md` |
| Lessons Learned | `../07-STANDARDS/LESSONS_LEARNED.md` |
| AI Workspace | `../README.md` |
