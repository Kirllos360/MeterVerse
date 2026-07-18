# PROJECT_GLOSSARY — Domain & Project Terminology

**Purpose:** Definitive reference for project-specific terminology. Every AI reads this to ensure consistent language usage across sessions. Prevents terminology drift between different AI models.

**Owner:** Chief Enterprise AI Architect  
**Source of Truth:** Cross-referenced from SYSTEM_DNA_DRAFT.md, ERP-00, EV-13  
**Related Documents:** SYSTEM_DNA_DRAFT.md, EAOS.md, HANDSHAKE.md  
**Last Updated:** 2026-07-02  
**Update Trigger:** New term introduced in governance, architecture, or wave documentation  
**Validation Method:** Cross-reference with SYSTEM_DNA_DRAFT.md before adding terms

---

## A — Governance & Process Terms

| Term | Definition | Source |
|------|------------|--------|
| **Adoption Validation** | Process of verifying that implemented code is actually executed in runtime, not just present in the codebase | Amendment-01 |
| **Amendment** | A modification to EEC-00C governance. Cannot delete rules, only add or clarify. Each amendment is additive. | EEC-00C |
| **Certification** | Formal sign-off that a wave meets all exit criteria. Requires Implementation → IV → Adoption → Regression → Sign-off. | EEC-00C CR-02 |
| **CONDITIONAL PASS** | Certification status where implementation is complete and verified, but adoption validation is incomplete or confidence is 50-79%. Conditions must be tracked until resolved. | EEC-00C CR-06 |
| **EEC-00C** | Enterprise Governance Specification — the single canonical governance framework. All rules defined here. | EEC-00C |
| **ECL-01** | Enterprise Continuity Layer — the handshake and continuity system (Amendment-02) | Amendment-02 |
| **ERP-00** | Enterprise Recovery Plan — master implementation contract defining all 8+ waves | ERP-00 |
| **EV-13** | Enterprise Root Cause Master Report — consolidated root cause analysis of ~98 findings | EV-13 |
| **Independent Verification (IV)** | Verification performed by a different AI agent than the one that implemented the change. Required for certification. | EEC-00C VR-03 |
| **Prevention Rule (PR)** | EEC-00C rule class that prevents undesirable states. Takes priority over all other rules. | EEC-00C |
| **Root Cause First** | Methodology requiring that symptoms are never fixed before their root cause. All fixes must target root causes. | EAOS.md Ch2 |
| **Runtime Evidence** | Proof that code actually executes in production. Measured by pipeline counters, event counts, audit records. Distinguished from static evidence (code presence). | Amendment-01 |
| **Stale Check** | Validation that HANDSHAKE.md reflects current project state. Uses SVR-01 through SVR-04 rules. | EEC-00C Amendment-02 |
| **Wave** | A bounded implementation unit with defined deliverables, exit criteria, and certification. Waves are sequential. | ERP-00 |

---

## B — Architecture Terms

| Term | Definition | Source |
|------|------------|--------|
| **Area** | A tenant isolation unit. 15 areas (october, new_cairo, sodic_ednc, etc.). Each area has its own database schema. | SYSTEM_DNA |
| **EnterpriseService** | Abstract base class that services must extend to use the enterprise pipeline. Currently 2 of 101 services extend it. | enterprise-service.ts |
| **EnterprisePipeline** | Core execution pipeline with 7 stages: validation → policies → approval → transaction → events → audit → metrics. 266 lines. | enterprise-pipeline.ts |
| **getAreaProjectFilter()** | Shared helper that scopes database queries to the current area's projects. Currently called inline in 15+ controllers. | area-filter.helper.ts |
| **Multi-schema** | PostgreSQL multi-schema architecture: `sim_system` (shared), `core` (auth/shared), `features` (billing/reports), `area_N` (per-tenant data) | SYSTEM_DNA |
| **Operation Registry** | Registry of 23 named operations with associated policies, validators, approvals, and audit levels. | operation-registry.ts |
| **Policy Engine** | Evaluates 8 policies (Billing, Customer, Meter, Payment, Collection, Tariff, Area, Approval) before operations execute. | base-policy.ts |
| **Runtime Coordinator** | Activates the enterprise runtime on module init. Initializes metrics engine, health monitoring, lifecycle tracking. | runtime-coordinator.ts |
| **Three-Plan Architecture** | Plan 1 (Full — all modules), Plan 2 (Safety — metering only), Plan 3 (Failover — read-only). Determines availability mode. | SYSTEM_DNA |

---

## C — Business Domain Terms

| Term | Definition | Source |
|------|------------|--------|
| **Billing Period** | A time window for which invoices are generated. Statuses: open, in_review, closed. | schema.prisma |
| **Customer Transfer** | Moving a customer from one project to another. Requires MANAGER approval. | operation-registry.ts |
| **Ledger Entry** | Append-only financial record. Types: invoice_charge, adjustment_debit, payment_credit, etc. | schema.prisma |
| **Meter Lifecycle** | Status transition: available → assigned → active → (offline) → terminated → retired. Enforced by MeterPolicy. | enterprise-policies.ts |
| **Meter Type** | Electricity, water_main, water_child, solar, gas, chilled_water, outdoor_unit. | schema.prisma |
| **Review Queue** | Pending-readings review workflow. Readings with suspicious status require manual approval/rejection/correction. | readings.service.ts |
| **Symbiot Bridge** | Planned integration bridge: 10 TCP × 100 HTTP channels connecting to Symbiot SEP system. | AGENTS.md |

---

## D — AI Workspace Terms

| Term | Definition |
|------|------------|
| **EAOS** | Enterprise AI Operating System — immutable document defining AI reasoning and behavior |
| **HANDSHAKE.md** | Live operational memory — updated every session, every task, every verification |
| **AI Workspace** | The `AI/` directory — single entry point for all AI assistants |
| **Session Continuity** | The property that a different AI model can resume work without context loss, guaranteed by HANDSHAKE.md + EAOS.md |
| **Unknown Unknown Declaration** | Mandatory declaration at session start: what the AI knows, what it knows it doesn't know, and what it doesn't know it doesn't know |

---

## E — Document Prefixes

| Prefix | Meaning | Count |
|--------|---------|-------|
| **EAOS** | Enterprise AI Operating System | 1 (immutable) |
| **EEC** | Enterprise Enterprise Certification | 1 master + 2 amendments |
| **ERP** | Enterprise Recovery Plan | 6 (00 through 02A) |
| **EV** | Enterprise Verification | 13 (01 through 13) |
| **ECG** | Enterprise Certification (pre-EEC-00C) | ~30 |
| **ALPHA** | Engineering platform certification | 3 |
| **CHG** | HANDSHAKE.md Change Log entry | Sequential |
| **DEC** | HANDSHAKE.md Decision Log entry | Sequential |
| **SC** | Stop Condition (EAOS.md Chapter 9) | 10 (SC-01–SC-10) |
| **SV** | Stale Validation Rule | 4 (SVR-01–SVR-04) |
| **UR** | Update Rule (Amendment-02) | 7 (UR-01–UR-07) |
| **SHP** | Session Handoff Protocol | 4 (SHP-01–SHP-04) |
| **FA** | Forbidden Action (EAOS.md Chapter 19) | 15 (FA-01–FA-15) |
