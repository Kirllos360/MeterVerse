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
☐ MCP CHECK — 12 MCPs active (including postgres-mcp and playwright-mcp)
☐ CLI CHECK — lighthouse, axe-core, puppeteer
☐ RUNTIME CHECK — Node, Java, Docker, PostgreSQL
☐ BACKEND CHECK — :3131/api/health = 200 (Admin API; Portal API :3003)
☐ TESTS CHECK — vitest run passes
☐ TYPESCRIPT CHECK — 0 errors
☐ GIT CHECK — clean tree
☐ CI CONFIG CHECK — Cross-reference .github/workflows/*.yml before declaring any fix
```
If ANY check fails → STOP. Fix. Restart checklist.

### 0.3 — Emoji Declaration
Every tool use starts with 🧰 **tool-name** — description.

### 0.4 — Evidence Requirement
Never say "completed/fixed/verified/tested" without tool execution evidence.

### 0.5 — Tool Registry
**12 MCPs:** sequential-thinking, git, filesystem, postgres-mcp, playwright, memory, openapi, storybook, MCP_DOCKER, lovable, serena, chrome-devtools
**60+ CLIs:** lighthouse v13.4.1, axe-core v4.12.1, puppeteer v25.3, artillery v2.0.33, snyk v1.1305.0, dependency-cruiser v18, madge v8, knip v26, typedoc v0.28, serena v0.0.1, context7 v1.0.3, and 50+ more
**Runtimes:** Node v24.15, Java 21, Docker 29.5, PostgreSQL 16, Prisma 7.8
**Built-in:** read, edit, write, bash, glob, grep, task, todowrite, webfetch, question, skill
**User-provided:** Serena 🧠, Context7 📚, Chrome DevTools 🔍, Lighthouse 📊, axe-core ♿, Codebase Memory 💾, Graphical MCP 📈, deepseek-eyes 👁️ (Cloudflare AI Vision, v2.0.0), Postgres MCP Pro 🐘 (Crystal DBA — health, indexing, explain, SQL execution)

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

---

## RULE 4 — CI CROSS-REFERENCE PROTOCOL (G01 LEARNED)

**Before declaring any fix complete, you MUST:**

1. Read `.github/workflows/*.yml` — understand exactly what CI runs
2. Run ALL CI steps locally in the exact same order:
   - Backend: `npm test` + `npm run test:coverage` + `npm audit --audit-level=high`
   - Frontend: `npx tsc --noEmit` + `npm test` (build if time permits)
   - Git: `git status --porcelain` must be clean
3. Match CI coverage thresholds — don't assume local success = CI success
4. CI has different requirements than pre-commit hooks — never rely on hooks alone

## RULE 5 — MULTI-VERIFICATION (5× CONSECUTIVE PASS)

**After fixing CI issues, run the full CI-compatible test suite 5 times:**

- 10–30 seconds between attempts for local testing (same environment, no infra variability)
- 1–3 minutes between attempts for CI testing (catches runner-specific transient failures)
- All 5 must pass consecutively. If any round fails → restart count from 0.
- Each round verifies:
  - Backend unit + API tests (82+ tests)
  - Backend coverage (thresholds from CI config)
  - Security audit (npm audit, 0 high+ vulns)
  - Frontend TypeScript (0 errors)
  - Frontend tests (44+ tests)
  - Git status clean (only gitignored files allowed)

**Why 5 rounds?** Cathes transient failures, race conditions, flaky tests, and environment-specific bugs that a single run would miss. This is the gold standard — not optional.

## P60.1 Durable Learnings (2026-08-15)

1. **Runtime truth over banners:** a health endpoint returning 200 is NOT proof the DB is reachable or login works. Always probe DB separately (psql :5433) before certifying runtime. PostgreSQL failure shows as 0xC0000142 (STATUS_DLL_INIT_FAILED) under memory exhaustion - verify `Free RAM` BEFORE starting PG.
2. **PostgreSQL instance identity:** MeterVerse DB :5433 = PG16 service `postgresql` (C:\Program Files\PostgreSQL\16). `postgresql-x64-18` = PG18 on :5434 (different instance). NEVER start the wrong service.
3. **Template generation reuse:** Collection System `routes_import.py` downloadable templates are reusable business logic. MeterVerse equivalent = `import-engine.generateTemplate(type)` + `GET /api/imports/templates/:type/download`. Round-trip (generate->parse) MUST pass for every type - template must match the parser schema.
4. **Start-Process env propagation:** env vars set before `Start-Process cmd /c` do NOT reach the node child. Launch `node src/server.js` directly (env set in parent) when env vars matter.
5. **ALLOW_DEV_BYPASS** requires ALL of: env true + X-Dev-Mode:true + NODE_ENV!==production. Production restarts must NEVER carry it.
6. **Memory constraint:** this 8GB host runs with ~1MB free under OpenCode+Edge+Defender. Heavy `next build` needs `--max-old-space-size=2048` + pagefile; PG may be unable to start until RAM is freed. Budget for it.
