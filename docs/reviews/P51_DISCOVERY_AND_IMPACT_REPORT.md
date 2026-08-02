# P51 Discovery & Impact Report — MeterVerse OS Enterprise Monorepo

**Date:** 2026-08-02 · **Branch:** feature/p51-meterverse-os-platform · **Tag:** meterverse-before-p51

## 1. Current Architecture (discovered)
- **Monolith 2-service runtime:**
  - `Frontend/` — Next.js 16 SPA (admin + user/portal routes coexist), dev on **7400**, `NEXT_PUBLIC_API_URL=http://localhost:3002`
  - `backend/` — Express + Prisma, dev on **3002**, `PORT=3002`, CORS/websocket origin `http://localhost:7400`
  - **One PostgreSQL** `meter_pulse` on `localhost:5432` (compose maps `5432:5432`; Start.cmd uses `5433`)
- **`Meter/` legacy tree is UNTRACKED** (0 git files) — out of scope.
- Root `package.json` = minimal (playwright + @prisma/client only; **no workspaces**).

## 2. Target Architecture (P51-ARCHITECTURE-CORRECTION)
**Enterprise Monorepo — ONE repo, ONE DB, 4 deployable services, shared packages, ZERO duplicated logic:**
- Admin Frontend → **3030**
- Admin Backend → **3131**
- Portal Frontend → **3535**
- Portal Backend → **3003**

**STOP CONDITION applied:** physically cloning into 4 isolated codebases would duplicate business logic/runtime/auth/validators (violates the mandate). Optimal architecture:
- Keep ONE Next.js source (admin + portal routes coexist) → two **runtime profiles** (`admin` / `portal`): Next dev on 3030 (admin) + 3535 (portal), same source.
- Keep ONE Express source → two **runtime profiles** (`admin` / `portal`): PORT 3131 + 3003.
- Extract shared libraries into `packages/` (auth, shared-types, validation, permissions, utilities, runtime, business, api-client, ui, design-system, common-components) imported by both profiles — no duplication.
- ONE DB, ONE Prisma schema, ONE migration history.

## 3. Impact Surface (files referencing old ports/branding)
**Ports 7400/3002 (and 3001 legacy in Start.cmd):** ~40 tracked files —
`.env`, `server.js`, `websocket-gateway.js`, `security.js`, `qr-engine.js`, `next.config.ts`, `package.json`, `playwright.config.ts`, `api-client.ts`, `proxy.ts`, `auth-service.ts`, `docker-compose.yml`, `.github/workflows/ci.yml`, `Start.cmd`, `_tools/*.cmd`, docs ×20, tests ×15, `configs/tool-usage-log.json`.

**Branding (Meter Pulse / Meter System / legacy):** ~20 tracked files — `.opencode/opencode.json`, `backend/docs/reports/*`, `scripts/*`, `configs/mcp-registry.json`, docs ×6, `graphiti/index.json`.

## 4. Themes
- Admin: White/Red/Black (light), Black/Red/White (dark)
- Portal: White/Green/Black (light), Black/Green/White (dark)
- 10 theme CSS files exist (`src/styles/themes/*.css`); theme registry in `src/components/themes/theme.config.ts`. Audit-only color normalization; no layout/typography change.

## 5. Startup
- `Start.cmd` (root) + `_tools/*.cmd` + docs. Requires rewrite to 4-port master launcher with health checks.

## 6. Connectivity
- CORS + websocket origin: `http://localhost:7400` → must become both admin `3030` + portal `3535`.
- Next rewrites `destination: http://localhost:3002/api/*` → `3131`.
- CI `cache-dependency-path: backend/package-lock.json`, `working-directory: backend` — unchanged paths (monorepo keeps dirs).

## 7. Database
- Single `meter_pulse` DB confirmed appropriate. Do NOT split. Audit indexes/FKs/migrations (Phase 7).

## 8. Milestones (commit after each)
1. Discovery report + git safety ✅ (tag/branch done)
2. Monorepo structure + workspaces + packages scaffolding
3. Port migration (3030/3131/3535/3003) — all deps
4. Branding → MeterVerse OS
5. Theme audit (admin red, portal green)
6. Startup automation (master launcher)
7. Connectivity + DB audit
8. Repair + full validation (tsc/eslint/tests/playwright)
9. Certification + governance + push
