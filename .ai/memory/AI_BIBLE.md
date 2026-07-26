# ═══════════════════════════════════════════════════════════════════════════════
#  METERVERSE — AI AGENT BIBLE (Permanent Operating DNA)
#  These rules CANNOT be overridden. They are the foundation of all work.
# ═══════════════════════════════════════════════════════════════════════════════

## 🚨 RULE 0 — UNIFIED TOOL COMPLIANCE SYSTEM (THE ONLY RULE 0) 🚨

### 0.1 — Execution Lock
Before ANY task: Capability Discovery first. No execution without discovery.
If discovery hasn't happened → respond ONLY "CAPABILITY DISCOVERY REQUIRED".

### 0.2 — Pre-Flight Checklist (RUN BEFORE EVERY TASK)
```
☐ CAPABILITY DISCOVERY — Check ALL tools
☐ MCP CHECK — 10 MCPs active
☐ CLI CHECK — lighthouse, axe-core, puppeteer
☐ RUNTIME CHECK — Node, Java, Docker, PostgreSQL
☐ BACKEND CHECK — :3002/api/health = 200
☐ TESTS CHECK — vitest run passes
☐ TYPESCRIPT CHECK — 0 errors
☐ GIT CHECK — clean tree
```
If ANY check fails → STOP. Fix. Restart checklist.

### 0.3 — Emoji Declaration
Every tool use starts with 🧰 **tool-name** — description.

### 0.4 — Evidence Requirement
Never say "completed/fixed/verified/tested" without tool execution evidence.

### 0.5 — Tool Registry
**10 MCPs:** sequential-thinking, git, filesystem, postgres, playwright, memory, openapi, storybook, MCP_DOCKER, lovable
**60+ CLIs:** lighthouse v13.4.1, axe-core v4.12.1, puppeteer v25.3, artillery v2.0.33, snyk v1.1305.0, dependency-cruiser v18, madge v8, knip v26, typedoc v0.28, serena v0.0.1, context7 v1.0.3, and 50+ more
**Runtimes:** Node v24.15, Java 21, Docker 29.5, PostgreSQL 16, Prisma 7.8
**Built-in:** read, edit, write, bash, glob, grep, task, todowrite, webfetch, question, skill
**User-provided:** Serena 🧠, Context7 📚, Chrome DevTools 🔍, Lighthouse 📊, axe-core ♿, Codebase Memory 💾, Graphical MCP 📈, deepseek-eyes 👁️ (Cloudflare AI Vision, v2.0.0)

---

## RULE 1 — TASK LIFECYCLE (9 STEPS, NO SKIPPING)

```
1. PRE-FLIGHT → Checklist + discovery
2. COLLECT    → Context, architecture, deps
3. PLAN       → Risks, edge cases, rollback
4. IMPLEMENT  → With evidence, never guess APIs
5. COMPILE    → tsc --noEmit = 0 errors
6. TEST       → vitest run = ALL pass
7. VERIFY     → Curl endpoints, check DB
8. REPORT     → Evidence summary + tool log
9. COMMIT     → git commit (WITHOUT --no-verify)
```
If 5, 6, or 7 fails → STOP. Fix. Restart from 5.

---

## RCA INTELLIGENCE MODULES (Phase 20 completed)

```
src/intelligence/rca/
  engine/RCACaseEngine.js        — 7-state case lifecycle (NEW→LEARNED)
  evidence/EvidenceCollector.js  — 5 evidence types (meter, readings, events, SIMs, assignments)
  analysis/FiveWhysEngine.js     — AI-powered 5 Whys generation (NEW in Phase 20.3)
  recommendation/RecommendationEngine.js — AI + pattern-based recommendations (NEW in Phase 20.4-5)
  learning/ResolutionLearner.js   — Persistent pattern storage, similarity search, effectiveness tracking (NEW in Phase 20.6-10)
```

**RCA Flow:** Create case → Auto-collect evidence → Auto-generate 5 Whys (AI) → Find similar past patterns → Generate recommendations → Human review → Approve → Resolve → Learn (pattern persisted)

**Backend routes:** `POST /cases/:id/auto-analyze`, `GET /patterns/similar`, `POST /patterns/:id/effectiveness`, `PUT /cases/:id/preventive`

---

## RULE 2 — ENGINEERING STANDARDS

**PowerWindow:** Before starting ANY service → kill old by title FIRST. Never `taskkill /F /IM node.exe`.
**Git:** Pre-commit hook runs tsc + vitest. If it fails → fix before commit. Never use `--no-verify`.
**Error handling:** Every async route uses try/catch + next(err). No silent 500s.
**Soft delete:** Every DELETE route uses archivedAt. No hard deletes.
**Audit:** Every mutation calls auditLog(). No blind mutations.
**Zod:** Every POST/PUT uses .parse(req.body). No raw input.

---

## RULE 3 — VERIFICATION GATES

A task is COMPLETE only if ALL apply:
- Capability discovery run ✅
- Pre-flight checklist passed ✅
- All applicable tools used ✅
- tsc = 0 errors ✅
- vitest = ALL pass ✅
- Critical APIs = 200 ✅
- Evidence exists for every claim ✅
- No `--no-verify` used ✅

If any gate fails → task is BLOCKED. Not complete.
