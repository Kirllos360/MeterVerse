# PROJECT_INDEX — Searchable Navigation Hub

**Purpose:** Master index of every significant document in the project. Enables any AI to find information without scanning the repository. This is the primary navigation tool after reading AI_START.md.

**Owner:** Chief Enterprise AI Architect  
**Source of Truth:** Self (indexing document)  
**Related Documents:** Every document listed below, AI_START.md  
**Last Updated:** 2026-07-02  
**Update Trigger:** Document added, removed, or relocated in the project  
**Validation Method:** Cross-reference with `git ls-files '*.md'` or directory listing

---

## Section A: AI Workspace (`AI/`)

| File | Purpose | Priority |
|------|---------|----------|
| `00-CORE/AI_START.md` | Entry point — mandatory read sequence | MANDATORY |
| `README.md` | AI workspace overview | MANDATORY |
| `PROJECT_STATE.md` | Authoritative "where are we now" | MANDATORY |
| `PROJECT_INDEX.md` | THIS FILE — navigation hub | MANDATORY |
| `07-STANDARDS/PROJECT_GLOSSARY.md` | Domain terminology | REFERENCE |
| `07-STANDARDS/LESSONS_LEARNED.md` | Permanent mistake record | MANDATORY |
| `01-GOVERNANCE/README.md` | Governance document index | REFERENCE |
| `02-ARCHITECTURE/README.md` | Architecture document index | REFERENCE |
| `03-RECOVERY/README.md` | Recovery plan index | REFERENCE |
| `04-ROOTCAUSE/README.md` | Root cause document index | REFERENCE |
| `05-WAVES/README.md` | Wave document index | REFERENCE |
| `06-RUNTIME/README.md` | Runtime evidence index | REFERENCE |
| `08-HISTORY/README.md` | Session history index | REFERENCE |
| `09-PROMPTS/README.md` | Prompt templates | OPTIONAL |
| `10-MEMORY/README.md` | Long-term memory | REFERENCE |

---

## Section B: Permanent Operating Documents (root `D:\meter\`)

| File | Purpose | Section |
|------|---------|---------|
| `EAOS.md` | **IMMUTABLE** — Enterprise AI Operating System | CORE |
| `HANDSHAKE.md` | Live operational memory — updated every session | RUNTIME |
| `SYSTEM_DNA_DRAFT.md` | Architecture single source of truth (787 lines) | ARCHITECTURE |
| `EEC-00C-AMENDMENT-02-ENTERPRISE-CONTINUITY-LAYER.md` | Continuity layer amendment | GOVERNANCE |
| `STAGE-0-ENTERPRISE-MIGRATION-BLUEPRINT.md` | Migration execution blueprint | WAVES |
| `ERP-00-ENTERPRISE-RECOVERY-PLAN.md` | Master implementation contract (8 waves) | RECOVERY |

---

## Section C: Root Cause Analysis

| File | Description | Findings |
|------|-------------|----------|
| `EV-13-ROOT-CAUSE-MASTER-REPORT.md` | Master root cause correlation (4 RCs, 86% of 98 findings) | 98 findings |
| `EV-12-ENTERPRISE-MASTER-CERTIFICATION.md` | Pre-EV-13 consolidation (36% baseline) | 3 RCs, 76 findings |
| `EV-01-INDEPENDENT-SECURITY-VERIFICATION.md` | Security verification | 9 findings |
| `EV-02-INDEPENDENT-INFRASTRUCTURE-VERIFICATION.md` | Infrastructure verification | 9 findings |
| `EV-03-INDEPENDENT-ARCHITECTURE-VERIFICATION.md` | Architecture verification | 7 findings |
| `EV-04-INDEPENDENT-DOMAIN-VERIFICATION.md` | Domain layer verification | 6 findings |
| `EV-05-RUNTIME-EXECUTION-VERIFICATION.md` | Runtime execution verification | 6 findings |
| `EV-06-INDEPENDENT-DATABASE-VERIFICATION.md` | Database verification | 10 findings |
| `EV-07-INDEPENDENT-API-VERIFICATION.md` | API verification | 7 findings |
| `EV-09-INDEPENDENT-PERFORMANCE-VERIFICATION.md` | Performance verification | 10 findings |
| `EV-10-INDEPENDENT-MAINTAINABILITY-VERIFICATION.md` | Maintainability verification | 10 findings |
| `EV-11-EOS-FRONTEND-READINESS-VERIFICATION.md` | Frontend readiness | 18 findings |

---

## Section D: Wave Implementation & Certification

### Wave-01 (Configuration & Coordination)

| File | Type |
|------|------|
| `ERP-00A-RECOVERY-READINESS-CERTIFICATION.md` | Pre-wave readiness |
| `ERP-00B-WAVE01-EXECUTION-CONTRACT.md` | Execution contract |
| `ERP-00C-WAVE01-READINESS-AUDIT.md` | Readiness audit |
| `ERP-01A-WAVE01-IMPLEMENTATION-CERTIFICATION.md` | **Certification (CERTIFIED)** |

### Wave-02 (Infrastructure Foundation)

| File | Type |
|------|------|
| `ERP-02A-WAVE02-IMPLEMENTATION-CERTIFICATION.md` | **Certification (CERTIFIED)** |
| `ERP-02A-POST-WAVE-VERIFICATION.md` | Post-wave verification |

### Historical ECG Certifications (pre-EEC-00C governance)

| File | Relevance |
|------|-----------|
| `ECG-09-RUNTIME-ACTIVATION-CERTIFICATION.md` | Pre-gov runtime activation |
| `ECG-09D-RUNTIME-COMPLETION-CERTIFICATION.md` | Pre-gov runtime completion |
| `ECG-09D-PRODUCTION-READINESS.md` | Pre-gov production readiness |
| `ECG-09D-HANDOFF.md` | **⚠ SUPERSEDED** (banner added) — use HANDSHAKE.md |
| `ECG-09E-INDEPENDENT-ENTERPRISE-CERTIFICATION.md` | Pre-gov enterprise cert |
| `ECG-04-CERTIFICATION.md` through `ECG-04R-WAVE-04-CERTIFICATION.md` | Pre-gov wave certs |
| `ECG-01-SECURITY-CERTIFICATION.md` + 22 ECG-01R-* remediations | Pre-gov security |
| `ECG-02-PERFORMANCE-CERTIFICATION.md` | Pre-gov performance |
| `ECG-03/03R/03S` series | Pre-gov integration/enterprise |

---

## Section E: Remediation Reports (ECG-01R Series)

| Doc ID | Topic |
|--------|-------|
| ECG-01R-001 | SQL Injection |
| ECG-01R-002 | Dev Login |
| ECG-01R-003 | CSRF |
| ECG-01R-004 | Secrets Isolation |
| ECG-01R-005 | Invoice N+1 |
| ECG-01R-006 | DB Indexes |
| ECG-01R-007 | Not Found Exceptions |
| ECG-01R-008 | Secret Rotation |
| ECG-01R-009 | Admin Mass Assignment |
| ECG-01R-010 | Connection Pool |
| ECG-01R-011 | Query DTOs |
| ECG-01R-012 | Business Rules |
| ECG-01R-013 | MeterState Dead Code |
| ECG-01R-014 | Event Consumers |
| ECG-01R-015 | Frontend Fetch |
| ECG-01R-016 | RolesGuard |
| ECG-01R-017 | Guard Bypass |
| ECG-01R-018 | Error Boundaries |
| ECG-01R-019 | Sync File IO |
| ECG-01R-020 | DTO Exclude |
| ECG-01R-021 | Header Injection |
| ECG-01R-022 | Area Isolation |

---

## Section F: Reports (`reports/`)

| Report Prefix | Theme | Count |
|---------------|-------|-------|
| `z0`-`z6` | Governance, database, test, repo audits | 7 |
| `t0`-`t13` | Task certification, gap analysis | 14 |
| `rp0`-`rp8` | Business domains, wave planning, remediation | 14 |
| `g1`-`g13` | Master data, reading, billing, UAT, stability | 14 |
| `f1`-`f4` + `f-final` | Chilled water certification | 5 |
| `b0`-`b3` | System DNA, reconciliation | 4 |
| `r1`-`r7` | Readings certification, blockers | 7 |
| `stab01`-`stab05` | Stabilization, deployment, invoice recovery | 5 |
| `h0`-`h0j` + `h-phase` | Final cutover, UI, security, rollback | 12 |
| `readings-*` | Readings root cause + certification | 3 |
| misc | governance-baseline, operational-reality, complete-page-tree | 3 |

**Total reports:** ~85+  
**Note:** Reports are historical artifacts from pre-EEC-00C governance. They contain operational evidence but may be inconsistent with current governance framework.

---

## Section G: Application Source Code

| Path | Description |
|------|-------------|
| `Meter/backend/src/` (43 subdirectories) | NestJS API backend |
| `Meter/backend/prisma/schema.prisma` (3223 lines) | Database schema |
| `Meter/Frontend/src/` | Next.js 16 frontend |
| `reference/collection-system/` | Flask reference billing system |

For detailed code index, see `SYSTEM_DNA_DRAFT.md` or the `AGENTS.md` file at `Meter/AGENTS.md`.

---

## Section H: Miscellaneous

| File | Purpose |
|------|---------|
| `ALPHA-004-CERTIFICATION.md` | Pre-gov engineering platform cert |
| `ALPHA-004-EVIDENCE-AUDIT.md` | Evidence audit |
| `ALPHA-004-FINAL-CERTIFICATION.md` | Final cert |
| `CHATGPT-SUMMARY.md` | Historical conversation summary |
| `certification_log.md` | Historical cert log |
| `epower-design-report.md` | External design review |
| `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` | Production deployment |
| `docs/DISASTER_RECOVERY_GUIDE.md` | Disaster recovery |
| `docs/execution/IPO-FRAMEWORK.md` | IPO framework — **⚠ SUPERSEDED** by EEC-00C governance |
| `docs/execution/program-portfolio.md` | Program portfolio |
| `docs/execution/work-package-template.md` | Work package template |
| `docs/execution/work-packages/ALPHA/` (6 files) | ALPHA work packages |
| `docs/main-plan/ALPHA-004R-*.md` (2 files) | ALPHA completion reports |

---

## Cross-Reference: Priority Categories

| Priority | Documents | Action |
|----------|-----------|--------|
| **MANDATORY** | EAOS.md, HANDSHAKE.md, AI_START.md, SYSTEM_DNA.md, EEC-00C-Amendment-02, Stage-0 Blueprint, EV-13, LESSONS_LEARNED.md, PROJECT_STATE.md | Read every session |
| **REQUIRED** | ERP-00, ERP-02A, PROJECT_INDEX.md | Read when referenced |
| **REFERENCE** | EV-01 through EV-11, ECG series, ERP series, All reports | Read when task-relevant |
| **HISTORICAL** | ECG-09D-HANDOFF.md, pre-EEC-00C certifications, CHATGPT-SUMMARY.md | Superseded — read only for traceability |
