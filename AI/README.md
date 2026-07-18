# AI Workspace — Meter Verse (MVEOS)

**Purpose:** Single entry point for every AI assistant working on the Meter Verse project. All documentation, governance, and operational state is organized here. No AI should scan the repository directly — use this workspace as the navigation hub.

**Owner:** Chief Enterprise AI Architect  
**Source of Truth:** `AI_START.md` defines the entry sequence  
**Related Documents:** EAOS.md, HANDSHAKE.md, SYSTEM_DNA_DRAFT.md  
**Last Updated:** 2026-07-02  
**Update Trigger:** Workspace reorganization, new AI-required documents  
**Validation Method:** Verify that EAOS.md + HANDSHAKE.md + AI_START.md reading sequence is preserved

---

## Workspace Map

```
AI/
├── 00-CORE/           AI_START.md — entry point, mandatory reading sequence
├── 01-GOVERNANCE/     Governance documents index (EEC-00C, amendments)
├── 02-ARCHITECTURE/   Architecture documents index (SYSTEM_DNA)
├── 03-RECOVERY/       Recovery plan documents index (ERP-00)
├── 04-ROOTCAUSE/      Root cause documents index (EV-13, EV series)
├── 05-WAVES/          Wave documents index (blueprints, certifications)
├── 06-RUNTIME/        Runtime evidence & HANDSHAKE.md reference
├── 07-STANDARDS/      Glossary, lessons learned, coding standards
├── 08-HISTORY/        Session histories
├── 09-PROMPTS/        Prompt templates
├── 10-MEMORY/         Long-term memory, decision archives
│
├── PROJECT_INDEX.md   Master navigation hub (searchable)
├── PROJECT_STATE.md   Authoritative "where are we now"
└── README.md          THIS FILE
```

---

## For Every AI Starting Here

1. Read `00-CORE/AI_START.md` first (it tells you exactly what to do)
2. Follow the mandatory reading sequence from AI_START.md
3. Use `PROJECT_INDEX.md` to find any document
4. Read `PROJECT_STATE.md` to understand current status
5. Read `07-STANDARDS/LESSONS_LEARNED.md` to avoid past mistakes
6. Read `07-STANDARDS/PROJECT_GLOSSARY.md` for terminology

## Critical Files (Root Directory)

These live outside the AI/ workspace but are essential:

- `../EAOS.md` — **FIRST READ** — immutable AI Operating System
- `../HANDSHAKE.md` — **SECOND READ** — live operational memory
- `../SYSTEM_DNA_DRAFT.md` — **THIRD READ** — architecture SOT
