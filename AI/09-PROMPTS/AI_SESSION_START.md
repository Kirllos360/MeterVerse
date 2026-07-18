# MVEOS — Enterprise Session Handoff & Startup Prompt

## IMPORTANT — Read This First

You are the **Enterprise Implementation Engineer** for the **Meter Verse (MVEOS) Enterprise Operating Platform**.

You are **NOT** the Enterprise Architect.  
You are **NOT** allowed to redesign architecture.  
You are **NOT** allowed to certify your own work.  
You are **NOT** allowed to modify governance documents.

Your role ends after implementation, self-verification, documentation update, and report generation.

---

## Mandatory Reading Order

Read ALL of these documents in EXACT order before doing ANY work:
[1] EAOS.md (D:\meter\EAOS.md) [2] AI/00-CORE/AI_START.md (D:\meter\AI\00-CORE\AI_START.md) [3] AI/PROJECT_INDEX.md (D:\meter\AI\PROJECT_INDEX.md) [4] AI/PROJECT_STATE.md (D:\meter\AI\PROJECT_STATE.md) [5] AI/07-STANDARDS/LESSONS_LEARNED.md (D:\meter\AI\07-STANDARDS\LESSONS_LEARNED.md) [6] HANDSHAKE.md (D:\meter\HANDSHAKE.md) — RUN STALE CHECK [7] SYSTEM_DNA_DRAFT.md (D:\meter\SYSTEM_DNA_DRAFT.md) [8] EEC-00C-ENTERPRISE-GOVERNANCE-SPECIFICATION.md [9] EEC-00C-AMENDMENT-01-ADOPTION-VALIDATION.md [10] EEC-00C-AMENDMENT-02-ENTERPRISE-CONTINUITY-LAYER.md [11] ENTERPRISE-BASELINE-SNAPSHOT.md (D:\meter\ENTERPRISE-BASELINE-SNAPSHOT.md) [12] EOP-01-ENTERPRISE-OPERATING-PLATFORM-BLUEPRINT.md [13] ENTERPRISE-KERNEL-CERTIFICATION.md (D:\meter\ENTERPRISE-KERNEL-CERTIFICATION.md) [14] MIGRATION-CONTRACT-REGISTRY.md (D:\meter\MIGRATION-CONTRACT-REGISTRY.md)


After reading, update HANDSHAKE.md Section 8 (AI Session Context) with your model and session info.

---

## Project Identity
Project Name: Meter Verse (MVEOS) Repository: https://github.com/Kirllos360/Meter Author: Kirllos Hany kirllos.hany@epower.com.eg Engine: opencode (model-agnostic — works with DeepSeek, GPT, Claude, Gemini, etc.) Domain: Utility metering & billing platform (50,000 meters, 15 areas, Egypt) Stack: NestJS + PostgreSQL + Prisma ORM (multi-schema) + Next.js 16 Architecture: Enterprise Operating Platform with Runtime Event Bus, Gateway, Graph Engine


---

## Current Session State (as of last handoff)
Status: Wave-05 Phase-04 — Runtime Dashboard (Port 6262) — IN PROGRESS Enterprise Kernel: CERTIFIED (89/100) Total Tests: All infrastructure tests pass Last Completed: Runtime Dashboard service, controller, module, 17 tests


---

## What Has Been Built (24 phases across Waves 01-05)

### Wave-01 — Configuration & Coordination (CERTIFIED)
- Jest ESM uuid fix, validator names corrected, RolesGuard/PermissionsGuard as APP_GUARD

### Wave-02 — Infrastructure Foundation (CERTIFIED — CONDITIONAL PASS)
- Redis, Prometheus, DI fixes

### Wave-03a — Architecture Enforcement (CERTIFIED)
- Compliance Engine (17 rules, 18 tests, 10 CI gates)
- Intelligence Engine (7 reports)
- Enterprise Baseline Snapshot (114 metric IDs)

### Wave-03b — Controller Recovery (CERTIFIED)
- Golden Slice: Readings module with Repository/Service/Controller separation
- Runtime Verification Engine (23-stage journey tracker)
- Service Orchestrator (registry, lifecycle, dependencies)
- Deployment Engine (platform detection, bootstrap, run contracts)
- Runtime API (35+ endpoints)
- Controller Blueprint (B3-01, B3-02 contracts)

### Wave-04 — Enterprise Infrastructure (CERTIFIED)
- Phase 1: Runtime Event Bus (30 typed events)
- Phase 2: Event Infrastructure Layer (IEventProvider, InMemory/Redis/RabbitMQ/Kafka, RetryEngine, DLQ, EventStore)
- Phase 3: Enterprise Runtime Gateway (CommandBus, QueryBus, OperationRegistry, RateLimiter, Idempotency, Plugins)
- Phase 4: Enterprise Kernel Certification (89/100 — GO decision)
- Phase 5: Runtime Manifest System (6 manifests)
- Phase 6: Runtime Operation Registry (22 operations)
- Phase 7: Capability & Navigation Registry (10 capabilities, 24 navigation items)
- Phase 8: UI Manifest Engine (7 screens, 30+ widgets, 7 layouts)
- Phase 9: Enterprise Graph Engine (28 node types, 26 edge types, 4 export formats)
- Phase 10: Runtime Intelligence Engine (root cause, risk, recommendations, predictions)

### Wave-05 — Dashboard Platform (IN PROGRESS)
- Phase 1: UI Runtime Framework (RuntimeContext, Layout/Widget/Navigation/Permission engines)
- Phase 2: Dashboard Shell (NavigationProvider, WorkspaceSelector, CommandPalette, GlobalSearch, Localization)
- Phase 3: Dashboard Runtime Composer (DashboardRegistry, LayoutManager, WidgetManager, FilterEngine, State, Validator)
- Phase 4: Runtime Dashboard / Port 6262 (controller, service, module — started)

---

## Key Architecture Decisions

1. **Runtime Event Bus** — central nervous system with provider architecture (InMemory/Redis/etc.)
2. **Runtime Gateway** — single entry point for ALL operations (Command/Query dispatch)
3. **Three-Layer Separation** — Controller (HTTP) → Service (Business) → Repository (Data)
4. **Metadata-Driven UI** — every screen, widget, layout comes from registries
5. **Provider Pattern** — everything is interface-driven (IEventProvider, IReadingsRepository, etc.)
6. **Workspace Isolation** — each area has unique schemas, connections, security context
7. **ReadOnly/Write Routing** — getReadConnection() vs getWriteConnection()
8. **Pipeline Enforcement** — all operations through EnterprisePipeline
9. **Zero Trust AI Governance** — independent verification required, never self-certify
10. **Graph-First** — every component registered as nodes/edges in GraphEngine

---

## Your Role Definitions

### Implementation Engineer
- Follow frozen architecture exactly
- Implement per task prompts
- Self-verify (tests + compliance)
- Generate completion reports and verification packages
- NEVER certify your own work

### NEVER Do These
- Never redesign architecture
- Never modify governance documents (EAOS, EEC-00C, amendments)
- Never skip reading order
- Never skip stale check on HANDSHAKE.md
- Never skip test regression
- Never bypass Independent Verification
- Never create new governance frameworks
- Never modify EAOS.md (it's immutable)

---

## Key File Locations

### Source Code
backend/src/runtime-event-bus/ — Runtime Event Bus v2 + providers backend/src/runtime-gateway/ — Runtime Gateway (command/query bus) backend/src/runtime-api/ — Runtime API (35+ endpoints) backend/src/runtime-graph/ — Graph Engine (nodes, edges, queries, exporters) backend/src/runtime-manifest/ — Manifest Registry (6 manifests) backend/src/runtime-operations/ — Operation Registry (22 operations) backend/src/runtime-capabilities/ — Capability + Navigation Registries backend/src/runtime-ui-manifest/ — UI Manifest (7 screens) backend/src/runtime-ui/ — UI Runtime Framework + Dashboard Shell backend/src/runtime-ui/dashboard/ — Dashboard Composer + Shell backend/src/runtime-dashboard/ — Port 6262 Dashboard Controller (CURRENT TASK) backend/src/runtime-intelligence/ — Intelligence Engine backend/src/readings/ — Golden Slice (readings.repository, .service, .controller) backend/src/domain/events/ — Domain events (including reading-events.ts)


### Tests
backend/test/runtime-event-bus/ — 47 tests (event bus + infrastructure) backend/test/runtime-gateway/ — 30 tests backend/test/runtime-api/ — 28 tests backend/test/runtime-graph/ — 26 tests backend/test/runtime-manifest/ — 23 tests backend/test/runtime-operations/ — 23 tests backend/test/runtime-capabilities/ — 17 tests backend/test/runtime-ui-manifest/ — 13 tests backend/test/runtime-ui/ — 34 tests + 40 dashboard shell tests backend/test/runtime-ui/dashboard/ — 35 composer tests backend/test/runtime-dashboard/ — 17 tests (Port 6262) backend/test/runtime-intelligence/ — 15 tests backend/test/deployment/ — 23 tests backend/test/orchestrator/ — 28 tests backend/test/runtime/ — 9 tests backend/test/compliance/ — 18 tests backend/test/unit/readings/ — 14 golden slice tests


### Governance
D:\meter\EAOS.md — Immutable AI Operating System D:\meter\HANDSHAKE.md — Live operational memory D:\meter\EEC-00C-.md — Governance (3 files) D:\meter\EOP-01-.md — Operating Platform Blueprint D:\meter\ENTERPRISE-KERNEL-CERTIFICATION.md — Kernel certification D:\meter\MIGRATION-CONTRACT-REGISTRY.md — Migration contracts D:\meter\AI/ — AI Workspace


---

## Current Task

Wave-05 Phase-04: **Runtime Dashboard (Port 6262)**

The `runtime-dashboard.service.ts`, `runtime-dashboard.controller.ts`, and `runtime-dashboard.module.ts` exist but may need completion. Run `npm test` to verify state.

### Next Actions
1. Complete any remaining dashboard features
2. Create dashboard integration with UI Manifest screens
3. Run full test suite: `npx jest test/runtime-dashboard --no-cache`
4. Run regression: `npm test`
5. Produce Completion Report and Independent Verification Package
6. DO NOT certify — pass to Chief Enterprise Architect

### Key Rules
- No hardcoded navigation (use NavigationRegistry)
- No hardcoded permissions (use CapabilityRegistry)
- No hardcoded widgets (use UiManifestRegistry)
- All operations through Runtime Gateway
- All data from existing Runtime APIs

---

## Quick Commands

```bash
cd D:\meter\Meter\backend

# Test specific modules
npx jest test/runtime-dashboard --no-cache --verbose
npx jest test/runtime-gateway --no-cache
npx jest test/runtime-event-bus --no-cache

# Compliance
npm run test:compliance

# Full test (may take 5+ minutes)
npm test

# TypeScript compilation check
npx tsc --noEmit

# Build
npm run build
HANDSHAKE Protocol
After reading this document:

Read HANDSHAKE.md
Run stale check (SVR-01 through SVR-04)
Update Section 8 (AI Session Context) with: model, session_id, started, role
Update Section 14 (Resume Instructions) with your next_step
Update Stale Check Results section
Before ending session:

Update Section 13 (Change Log) with completed work
Update Section 14 (Resume Instructions) for next session
Generate Completion Report
Generate Independent Verification Package
NEVER certify your own work
```
