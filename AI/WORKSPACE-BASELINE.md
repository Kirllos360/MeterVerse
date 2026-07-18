# AI Workspace — Baseline Record

**Purpose:** Permanent baseline record of the AI Workspace after EAW-02 normalization. Future changes must be tracked against this baseline.

**Workspace Version:** 1.0  
**Baseline Date:** 2026-07-02  
**Certification ID:** EAW-02  
**Workspace Checksum:** *(calculated by counting: 19 files, 11 directories)*  
**Freeze Authority:** Chief Enterprise AI Architect — EAW-02 final certification  

---

## Baseline Manifest

### Permanent Documents (Root — 7 files)

| File | Role | Immutable? |
|------|------|------------|
| `EAOS.md` | AI Operating System | YES — cannot be amended |
| `HANDSHAKE.md` | Operational memory | No — updated every session |
| `EEC-00C-ENTERPRISE-GOVERNANCE-SPECIFICATION.md` | Canonical governance | No — amendments only |
| `EEC-00C-AMENDMENT-01-ADOPTION-VALIDATION.md` | Governance amendment | No — additive only |
| `EEC-00C-AMENDMENT-02-ENTERPRISE-CONTINUITY-LAYER.md` | Governance amendment | No — additive only |
| `SYSTEM_DNA_DRAFT.md` | Architecture SOT | No — updated per architecture changes |
| `STAGE-0-ENTERPRISE-MIGRATION-BLUEPRINT.md` | Migration blueprint | No — superseded by Stage-1 |

### AI Workspace (`AI/` — 19 files)

| File | Section | Owner |
|------|---------|-------|
| `README.md` | Root | Chief Architect |
| `PROJECT_INDEX.md` | Root | Chief Architect |
| `PROJECT_STATE.md` | Root | Chief Architect |
| `AI-WORKSPACE-VALIDATION-REPORT.md` | Root | Auditor (historical) |
| `WORKSPACE-BASELINE.md` | Root | Chief Architect |
| `00-CORE/README.md` | Core | Chief Architect |
| `00-CORE/AI_START.md` | Core | Chief Architect |
| `01-GOVERNANCE/README.md` | Governance | Chief Architect |
| `02-ARCHITECTURE/README.md` | Architecture | Chief Architect |
| `03-RECOVERY/README.md` | Recovery | Chief Architect |
| `04-ROOTCAUSE/README.md` | Root Cause | Chief Architect |
| `05-WAVES/README.md` | Waves | Chief Architect |
| `06-RUNTIME/README.md` | Runtime | Chief Architect |
| `07-STANDARDS/README.md` | Standards | Chief Architect |
| `07-STANDARDS/PROJECT_GLOSSARY.md` | Standards | Chief Architect |
| `07-STANDARDS/LESSONS_LEARNED.md` | Standards | Chief Architect |
| `08-HISTORY/README.md` | History | Chief Architect |
| `09-PROMPTS/README.md` | Prompts | Chief Architect |
| `10-MEMORY/README.md` | Memory | Chief Architect |

### Legacy Documents (Superseded — 2 files)

| File | Superseded By | Has Banner? |
|------|---------------|-------------|
| `ECG-09D-HANDOFF.md` | HANDSHAKE.md | ✅ Added EAW-02 |
| `docs/execution/IPO-FRAMEWORK.md` | EEC-00C governance | ✅ Added EAW-02 |

---

## Baseline Rules

### What Frozen Means

The workspace structure and content at this baseline are stable. Future changes must follow:

1. **Documentation changes** — must be tracked in HANDSHAKE.md Change Log
2. **New documents** — must be registered in PROJECT_INDEX.md
3. **Superseded documents** — must receive a banner, never deleted
4. **Workspace version** — increments only on structural changes (not content edits)
5. **Re-baseline** — only after successful re-certification

### What Is NOT Frozen

- HANDSHAKE.md (updated every session)
- PROJECT_STATE.md (updated every wave)
- PROJECT_INDEX.md (updated on document change)
- LESSONS_LEARNED.md (updated on mistake discovery)
- EEC-00C amendments (can be added)

---

## Baseline Certification

```
I confirm that the AI Workspace at version 1.0, baseline date 2026-07-02,
is internally consistent, has a single authoritative reading order,
all referenced governance documents exist on disk,
and all legacy documents carry supersession banners.

Signed: Chief Enterprise AI Architect
Date:   2026-07-02
```
