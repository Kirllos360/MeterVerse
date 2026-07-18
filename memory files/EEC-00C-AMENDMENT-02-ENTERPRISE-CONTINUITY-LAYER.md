# EEC-00C — Amendment-02: Enterprise Continuity Layer (ECL-01)

**Status:** RATIFIED  
**Date:** 2026-07-02  
**Authority:** EEC-00C Section 3 (Amendment Protocol) — Chief Architect  
**Prerequisite:** EEC-00C Final Ratification (52% baseline)  

---

## WP1 — Amendment Scope

This amendment adds the **Enterprise Continuity Layer (ECL-01)** — a handshake and continuity system — as an operational artifact within EEC-00C governance. It does NOT create a new governance framework. It adds one operational document (`HANDSHAKE.md`) and one procedure (Session Handoff Protocol) to the existing EEC-00C apparatus.

### What Changes

| Artifact | Type | Added To |
|----------|------|----------|
| `HANDSHAKE.md` | Operational document | EEC-00C Artifact Registry |
| Session Handoff Protocol | Procedure | EEC-00C Workflow (VR-08) |
| Update Rules | Rules | EEC-00C Implementation Rules (IR-01) |
| Stale Handoff Validation | Validation rule | EEC-00C Verification Rules (VR-01) |

### What Does NOT Change

- EEC-00C governance hierarchy (Prevention Rules, Implementation Rules, Verification Rules, Certification Rules)
- EEC-00C Responsibility Matrix
- Any existing Amendment-01 provisions
- Wave ordering or scope

---

## WP2 — HANDSHAKE.md Schema

Every `HANDSHAKE.md` MUST follow this exact schema. No fields may be omitted. Fields marked `[auto]` are populated by the framework; `[manual]` are populated by the AI.

```yaml
# Section 1: Project Identity [auto/manual, set once]
Project Name:
Repository:
Author:
Engine:
Created:

# Section 2: Current State [auto, updated by wave completion]
Enterprise Readiness:
Current Stage:
Current Wave:
Current Root Cause:
Previous Wave Result:

# Section 3: Current Objective [manual, set at start of each wave/task]
Objective:
Scope:
Deliverables:
Exit Criteria:

# Section 4: Active Governance [auto, updated by amendment]
Active Governance Documents:
Active Amendments:
Active Rules:

# Section 5: Next Action [manual, updated after every completed task]
Next Action:
Blocked By:
Dependencies:

# Section 6: Risks [manual, updated at wave start and when new risks appear]
Current Risks:
  - id:
    description:
    severity:
    mitigation:
    status:

# Section 7: Forbidden Actions [manual, updated when governance restricts behavior]
Forbidden Actions:
  - id:
    description:
    consequence:
    enforcement:

# Section 8: AI Session Context [auto/manual, updated per session]
Current AI Session:
  model:
  session_id:
  started:
  role:
Agent Instructions:
Handoff Notes:

# Section 9: Confidence Levels [manual, updated after verification]
Confidence Levels:
  Architecture:
  Implementation:
  Verification:
  Adoption:
  Certification:

# Section 10: Runtime Evidence Status [auto, updated by compliance tests]
Pipeline Operations Executed:
Domain Events Published:
Policies Evaluated:
Validators Executed:
Services Using EnterpriseService:
Controllers Using PrismaService:

# Section 11: Certification Status [auto, updated by certification waves]
Certification Status:
  overall:
  waves_certified:
  waves_pending:
  last_certification_date:

# Section 12: Decision Log [manual, append-only]
Decisions:
  - id:
    date:
    title:
    rationale:
    impact:
    decided_by:

# Section 13: Change Log [auto, append-only]
Changes:
  - id:
    date:
    type: [task | implementation | verification | wave | governance]
    description:
    file:
    status:

# Section 14: Resume Instructions [manual, written at end of session]
Resume Instructions:
  next_step:
  context:
  warnings:
  files_to_read:
```

---

## WP3 — Update Rules

### Rule UR-01: After Every Task

The AI MUST update `HANDSHAKE.md`:

- `Next Action` → set to the next task in sequence
- `Change Log` → append entry with type `task`, status `completed`
- `Current AI Session` → update session_id if changed

### Rule UR-02: After Every Implementation

The AI MUST update `HANDSHAKE.md`:

- `Change Log` → append entry with type `implementation`, listing files changed
- `Runtime Evidence Status` → update any counters affected
- `Current Risks` → review and update any risk statuses
- `Confidence Levels` → re-evaluate implementation confidence

### Rule UR-03: After Every Verification

The AI MUST update `HANDSHAKE.md`:

- `Change Log` → append entry with type `verification`, including result
- `Confidence Levels` → update verification confidence
- `Previous Wave Result` → update if this is a wave-level verification
- `Runtime Evidence Status` → update from verification findings

### Rule UR-04: After Every Wave

The AI MUST update `HANDSHAKE.md`:

- `Enterprise Readiness` → update to new score
- `Current Wave` → advance to next wave
- `Current Root Cause` → update to next root cause target
- `Previous Wave Result` → set to result of completed wave
- `Certification Status` → update waves_certified/pending
- `Change Log` → append entry with type `wave`, status `completed` or `failed`
- `Decision Log` → append any wave-level governance decisions

### Rule UR-05: After Every Governance Decision

The AI MUST update `HANDSHAKE.md`:

- `Active Amendments` → add or remove
- `Active Governance Documents` → update list
- `Active Rules` → update rule set
- `Forbidden Actions` → add or remove
- `Decision Log` → append the governance decision with rationale

### Rule UR-06: Session Start (Mandatory Read)

Any AI starting a session MUST:

1. Read `HANDSHAKE.md` first
2. Read `SYSTEM_DNA_DRAFT.md` second
3. Compare `Current AI Session.started` with `Change Log` latest entry date
4. If `HANDSHAKE.md` is stale (see validation rules below), STOP and report

After reading, the AI MUST update:

- `Current AI Session.model` → its own model name
- `Current AI Session.session_id` → new session ID
- `Current AI Session.started` → current timestamp
- `Current AI Session.role` → its role for this session

### Rule UR-07: Session End (Mandatory Write)

Before the session ends, the AI MUST update:

- `Resume Instructions` → complete next_step, context, warnings, files_to_read
- `Change Log` → final entry for this session
- `Current AI Session` → verify accuracy
- `Decision Log` → any decisions made this session

---

## WP4 — Session Handoff Protocol

### SHP-01: Handoff Trigger

A handoff occurs when:

- AI model changes (e.g., DeepSeek v4 Flash → Claude Opus 4)
- AI model version changes
- Session times out and a new session resumes
- A different AI role takes over (e.g., Implementation Engineer → Independent Verifier)

### SHP-02: Outgoing AI Protocol (OLD AI)

Before handing off, the OLD AI MUST:

1. **Run the Stale Check** (see WP5)
2. **Update all pending Change Log entries** — close any open entries
3. **Write Resume Instructions** — be explicit enough for a new AI to continue without context loss:
   - `next_step`: the exact file/command/decision needed
   - `context`: what the current state is and why
   - `warnings`: any landmines, known failures, or broken tests
   - `files_to_read`: ordered list of files the new AI must read (HANDSHAKE.md is automatic)
4. **Finalize Decision Log** — ensure all session decisions are recorded
5. **Update Current AI Session** — set model and session_id to indicate handoff
6. **Signal handoff** — write `HANDSHAKE_SIGNAL: HANDOFF_INITIATED` at the top of HANDSHAKE.md

### SHP-03: Incoming AI Protocol (NEW AI)

Before doing ANY work, the NEW AI MUST:

1. **Read `HANDSHAKE.md`** — entire file, all sections
2. **Read `SYSTEM_DNA_DRAFT.md`** — entire file
3. **Detect handoff signal** — check for `HANDSHAKE_SIGNAL: HANDOFF_INITIATED`
4. **Run the Stale Check** (see WP5)
5. **Verify Resume Instructions exist** — if missing or empty, treat as incomplete handoff
6. **Update Current AI Session** — set its own model, session_id, started timestamp, role
7. **Remove handoff signal** — clear `HANDSHAKE_SIGNAL` line
8. **Read listed files** from Resume Instructions
9. **Confirm readiness** — write confirmation in Change Log

### SHP-04: Role Handoff Protocol

When the AI role changes (e.g., Implementation → Verification), the protocol adds:

| Step | Implementation Engineer | Independent Verifier |
|------|------------------------|---------------------|
| Before | Produce implementation + write evidence | Request handoff from IE |
| During | Update Implementation Confidence | Update Verification Confidence |
| After | Yield to Verifier | Sign off or reject |
| Handoff note | Must include evidence location | Must include findings summary |

---

## WP5 — Stale Handoff Validation Rules

### SVR-01: Timestamp Staleness

A HANDSHAKE.md is stale if:

- **`Current AI Session.started`** is more than one working day (24 hours) before now
- **`Change Log`** latest entry date is more than one week before now
- **`Resume Instructions`** contains `next_step` that references a task already completed according to other evidence

Action: STOP and report staleness. Do not proceed. The human operator must acknowledge.

### SVR-02: State Mismatch Validations

A HANDSHAKE.md is stale if ANY of these checks fail:

| Check ID | Field | Validation | Failure Action |
|----------|-------|------------|---------------|
| SV-01 | `Current Wave` | Must match ERP-00 wave sequence | STOP — wave drift |
| SV-02 | `Enterprise Readiness` | Must be between 0-100 | STOP — corrupted |
| SV-03 | `Current AI Session.model` | Must not be empty | STOP — missing session |
| SV-04 | `Previous Wave Result` | If wave is certified, must be `completed` or `failed` | STOP — ambiguous state |
| SV-05 | `Certification Status.waves_certified + waves_pending` | Must equal total waves | STOP — inconsistency |
| SV-06 | `Change Log` | Last entry must not be `in_progress` for more than 48 hours | WARN — possible hang |
| SV-07 | `Resume Instructions` | Must exist and have at least 2 of 4 fields populated | WARN — incomplete handoff |
| SV-08 | `Forbidden Actions` | Must be checked against current EEC-00C rules | STOP — may violate governance |

### SVR-03: Cross-Reference Validation

An AI MUST cross-reference at least two sources before trusting HANDSHAKE.md state:

- Source A: `HANDSHAKE.md`
- Source B: One of: `SYSTEM_DNA_DRAFT.md`, `ERP-00-ENTERPRISE-RECOVERY-PLAN.md`, `EV-13-ROOT-CAUSE-MASTER-REPORT.md`, `STAGE-0-ENTERPRISE-MIGRATION-BLUEPRINT.md`

If there is a discrepancy between sources, the HANDSHAKE.md is considered stale and the following escalation applies:

1. Log the discrepancy
2. Stop implementation
3. Report which fields conflict and between which sources
4. Await human confirmation

### SVR-04: Ghost Session Detection

If an AI finds `HANDSHAKE_SIGNAL: HANDOFF_INITIATED` but no other evidence of a previous session (e.g., no Resume Instructions, empty Change Log), treat as a **ghost session**. Do NOT proceed. Request human verification.

---

## WP6 — Integration with EEC-00C Governance

### Mapping to Existing Rules

| EEC-00C Rule | ECL-01 Integration |
|-------------|-------------------|
| **PR-01** (Single Source of Truth) | HANDSHAKE.md becomes the operational SOT for session state |
| **PR-02** (Evidence Required) | HANDSHAKE.md Decision Log provides evidence of governance compliance |
| **PR-03** (Independence Required) | SHP-04 enforces role separation at session level |
| **IR-01** (Test-First) | Update Rule UR-02 requires HANDSHAKE.md update after implementation |
| **IR-02** (Wave Dependency) | Update Rule UR-04 enforces wave sequencing via HANDSHAKE.md |
| **VR-01** (Verification Mandatory) | SVR-01 through SVR-04 enforce verification of handoff state |
| **VR-03** (Independent Verification) | SHP-04 implements role handoff between IE and IV |
| **VR-08** (Adoption Validation) | HANDSHAKE.md Section 10 tracks runtime evidence |
| **CR-01** (Certification Required) | HANDSHAKE.md Section 11 tracks certification status |
| **CR-02** (5-Stage Certification) | HANDSHAKE.md Change Log tracks each stage |

### Amendment Hierarchy

```
EEC-00C (Canonical Governance)
├── Amendment-01 (Adoption Validation, Root Cause Graph, Automated Enforcement)
│   └── AV-01 through AV-08, RC-01 through RC-10, CC-14 through CC-16
├── Amendment-02 (Enterprise Continuity Layer)  ← THIS DOCUMENT
│   ├── HANDSHAKE.md (operational artifact)
│   ├── Update Rules UR-01 through UR-07
│   ├── Session Handoff Protocol SHP-01 through SHP-04
│   └── Stale Validation Rules SVR-01 through SVR-04
└── Amendment-N (future)
```

---

## WP7 — Compliance & Enforcement

### Automated Checks

The following HANDSHAKE.md validations can be automated if CI/CD is available:

| Check | Implementation | Priority |
|-------|---------------|----------|
| Timestamp staleness (SVR-01) | Compare `started` field with current time | HIGH |
| Wave sequence (SVR-02 SV-01) | Parse `Current Wave`, validate against ERP-00 | HIGH |
| Readiness range (SVR-02 SV-02) | Validate 0-100 numeric | MEDIUM |
| Certified waves sum (SVR-02 SV-05) | Sum certification status fields | MEDIUM |
| Change Log completeness (SVR-02 SV-06) | Check last entry is not `in_progress` > 48h | LOW |

### Manual Checks (Human-in-the-Loop)

| Check | Frequency | Required By |
|-------|-----------|-------------|
| Cross-reference validation (SVR-03) | Every session start | AI |
| Ghost session detection (SVR-04) | Every session start | AI |
| Governance rule compliance | Every wave transition | Human |

---

## WP8 — Deliverables

| # | Deliverable | Location | Status |
|---|-------------|----------|--------|
| 1 | HANDSHAKE.md template | `HANDSHAKE.md` (template form) | ✅ |
| 2 | Session Handoff Protocol | This document, WP4 | ✅ |
| 3 | Update Rules | This document, WP3 | ✅ |
| 4 | Stale Validation Rules | This document, WP5 | ✅ |
| 5 | EEC-00C Integration Map | This document, WP6 | ✅ |
| 6 | Example populated HANDSHAKE.md | `HANDSHAKE.md` (populated) | ✅ |

---

## Sign-off

**Ratified by:** Chief Architect — Independent Enterprise Review Board  
**Effective:** Immediately  
**Supersedes:** Nothing — additive amendment to EEC-00C  
**Next review:** After Wave-03a completion or if handoff corruption is detected
