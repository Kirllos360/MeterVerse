# MeterVerse — Complete Environment Setup Guide & Tool/Library Inventory

**Purpose:** Everything needed to rebuild the MeterVerse development environment on a fresh machine/partition, with zero gaps. Use this together with `MEMORY.md`, `AI_BIBLE.md`, and `FULL_HANDOVER_PROMPT.md`.

**Last updated:** 2026-08-17 (migration handover)

---

## 1. Operating System & Base Requirements

| Requirement | Value |
|-------------|-------|
| OS | Windows (current machine uses Windows with PowerShell 5.1) |
| Architecture | x64 |
| RAM | ≥ 16 GB recommended (8 GB current machine is at its limit) |
| Disk | ≥ 50 GB free for the project + node_modules + PostgreSQL data + backups |
| Storage target | **Separate partition** recommended (user intends to move project there) |

---

## 2. Core Runtimes (install FIRST — in this order)

| Tool | Version (current) | Installer / Source | Why needed |
|------|-------------------|--------------------|------------|
| **Node.js** | v24.15.0 (engines: `>=20 <25`) | https://nodejs.org | Backend (Express), Frontend build (Next.js), all tooling |
| **npm** | 11.12.1 | ships with Node | Package manager |
| **PostgreSQL** | 16.4 (PG16, service `postgresql`, port **5433**) | https://www.postgresql.org/download/windows/ | THE authoritative MeterVerse DB (meter_pulse). NOT 5434 (PG18 is unrelated). |
| **Python** | 3.12.13 | https://www.python.org | Collection system (Flask), data-forensics (sqlite3), MCP servers (uvx) |
| **Git** | (latest) | https://git-scm.com | Version control, GitHub |

> **IMPORTANT PostgreSQL note:** The active instance is **PG16 on port 5433** with DB `meter_pulse` (owner `meter_pulse`). There is ALSO a PG18 on :5434 — it is **unrelated and must NOT be used** for MeterVerse. Native PG only — **Docker is OFF** (do not rely on Docker for the DB).

---

## 3. Global CLI Tools (install via npm -g or system)

| Tool | Install | Purpose |
|------|---------|---------|
| `opencode` | `npm i -g opencode-ai` | The AI CLI used for all MeterVerse work (DeepSeek execution) |
| `npx` | ships with npm | Run any npm package ad-hoc |
| `uvx` | via `pip install uv` or `uv` | Runs python-based MCP servers (postgres-mcp, serena) |
| `bun` (optional) | `npm i -g bun` | Next.js package manager (Frontend supports bun) |
| `oxlint` / `oxfmt` | in Frontend devDeps | Lint / format (Frontend scripts use them) |
| `lighthouse` (`@lhci/cli`) | `npm i -g @lhci/cli` | Performance scoring (P0 gate) |
| `tsc` | via Frontend typescript dep | TypeScript type-check |

---

## 4. Project Dependencies (installed via `npm install` in each package dir)

### 4a. Backend (`backend/package.json`) — production deps
`@prisma/client`, `bcryptjs`, `cors`, `express`, `express-rate-limit`, `helmet`, `jsonwebtoken`, `multer`, `nodemailer`, `pdfkit`, `pino`, `qrcode`, `socket.io`, `socket.io-client`, `speakeasy`, `swagger-jsdoc`, `swagger-ui-express`, `uuid`, `xlsx`, `zod`

### 4b. Backend — devDeps
`@vitest/coverage-v8`, `pdf-parse`, `pino-pretty`, `prisma`, `supertest`, `vitest`

### 4c. Frontend (`Frontend/package.json`) — production deps
`@base-ui/react`, `@clerk/nextjs`, `@dnd-kit/core|modifiers|sortable|utilities`, `@playwright/test`, `@sentry/nextjs`, `@tabler/icons-react`, `@tailwindcss/postcss`, `@tanstack/react-form`, `@tanstack/react-query`, `@tanstack/react-query-devtools`, `@tanstack/react-table`, `class-variance-authority`, `clsx`, `cmdk`, `date-fns`, `input-otp`, `kbar`, `lucide-react`, `match-sorter`, `motion`, `next`, `next-intl`, `nextjs-toploader`, `next-themes`, `nuqs`, `playwright`, `postcss`, `react`, `react-day-picker`, `react-dom`, `react-dropzone`, `react-resizable-panels`, `react-responsive`, `recharts`, `sharp`, `sonner`, `sort-by`, `tailwindcss`, `tailwindcss-animate`, `tailwind-merge`, `typescript`, `uuid`, `vaul`, `zod`, `zustand`

### 4d. Frontend — devDeps
`@faker-js/faker`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/sort-by`, `@types/uuid`, `husky`, `lint-staged`, `oxfmt`, `oxlint`, `pixelmatch`, `pngjs`, `tw-animate-css`, `vitest`

### 4e. Root workspace (`package.json`)
`@prisma/client` (^7.9.0), `playwright` (^1.62.0) + workspaces: `apps/*`, `packages/*`

### 4f. OpenCode `.opencode/package.json`
`@opencode-ai/plugin` (^1.15.10)

---

## 5. MCP Servers (configured in `.opencode/opencode.json` — MUST be re-registered)

| MCP | Command | Enabled | Notes |
|-----|---------|---------|-------|
| notion | `npx -y @notionhq/notion-mcp-server` | yes | needs NOTION_TOKEN |
| odoo | `npx -y @mweinheimer/odoo-mcp-server --stdio` | yes | needs ODOO_URL/DB/USER/PASS |
| playwright | `npx -y @playwright/mcp` | yes | browser automation |
| context7 | `npx -y @upstash/context7-mcp` | yes | needs CONTEXT7_API_KEY |
| figma-context | `npx -y figma-developer-mcp --stdio` | yes | needs FIGMA_API_KEY |
| serena | `uvx serena-agent start-mcp-server --project-from-cwd` | yes | code intelligence |
| chrome-devtools | `npx -y chrome-devtools-mcp` | yes | browser debugging |
| codebase-memory | `npx -y codebase-memory-mcp` | yes | memory |
| ast-grep | `sg --mcp` | yes | semantic search |
| deepseek-eyes | `<venv-python> -m deepseek_eyes` | yes | vision AI (screenshots) |
| storybook-mcp | `npx -y @storybook/mcp` | yes | storybook analysis |
| spectral | `spectral --help` | **disabled** | OpenAPI validation (keep disabled) |
| postgres | `uvx postgres-mcp --access-mode=restricted` | yes | DB tuning/health/schema. **NOTE: DATABASE_URI currently points to `localhost:5432/meter_pulse` — update to :5433 if used.** |
| sequential-thinking | `mcp-server-sequential-thinking` | yes | global config |
| git | `mcp-server-git --repository D:\meter` | yes | global config (update path) |
| filesystem | `mcp-server-filesystem D:\meter` | yes | global config (update path) |
| MCP_DOCKER | `docker mcp gateway run --profile profile` | yes | global (only if Docker used) |
| lovable | http `https://mcp.lovable.dev/` | yes | needs LOVABLE_API_KEY |

**Also used in past sessions:** openapi (`mcp-openapi`). **Skills:** `graphify` (in `~/.config/opencode/skills/graphify`), **plugin:** `.opencode/plugins/graphify.js`, **rules:** `.opencode/rules/toolchain.mdc`.

---

## 6. Runtime Services & Ports (single source: `_tools/config.cmd`)

| Service | Port | How started | Command |
|---------|------|-------------|---------|
| PostgreSQL (PG16) | **5433** | Windows service `postgresql` | `_tools/start-native-pg.cmd` |
| Admin BE | **3131** | scheduled task `MeterVerseAdminBE` OR `_tools/start-admin-be.cmd` | env: `JWT_SECRET`, `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/meter_pulse`, `PORT=3131` |
| Admin FE | **3535** | `_tools/start-admin-fe.cmd` (next start) | `next start -p 3535` |
| Portal BE | **3003** | `_tools/start-portal-be.cmd` | `PORT=3003 PORTAL_MODE=1 node src/server.js` |
| Portal FE | **3030** | `_tools/start-portal-fe.cmd` | `PORTAL_MODE=1 next dev -p 3030` |
| Symbiot bridge | 9000 (TCP) / 9001 (HTTP) | runs inside Admin BE process | auto on BE start |
| Admin API base | http://localhost:3131/api | | |
| Portal API base | http://localhost:3003/api | | |

**Credentials (dev, not secrets):** admin login `admin@meterverse.com` / `Admin@123`. DB postgres user `postgres` / `postgres` (local dev). DB owner `meter_pulse`. JWT_SECRET `dev_secret_meter_pulse_2026`.

**Startup truth (proven):** `schtasks /Run /TN "MeterVerseAdminBE"` is the most reliable BE launch (survives session). Node processes get reaped when the launching shell closes — the scheduled task + `start /b` pattern avoids this.

---

## 7. Frontend Environment (`.env.local`)

- `NEXT_PUBLIC_API_URL` — Admin `http://localhost:3131`, Portal `http://localhost:3003` (via PORTAL_MODE).
- Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) — set per AGENTS.md.
- Sentry optional (`NEXT_PUBLIC_SENTRY_DSN`, etc.).

---

## 8. Migration / Move Instructions (to the new partition)

1. **Copy the whole repo folder** `D:\meter` → `<new-partition>:\meter` (preserve everything; it's the workspace root).
2. Reinstall runtimes (section 2) on the new machine.
3. `npm install` in: `backend/`, `Frontend/`, and repo root (workspaces). If `node_modules` was copied, you may skip but it's safer to reinstall (`npm ci`).
4. Install global tools (sections 3, 5).
5. Set up PostgreSQL 16 on port 5433; create `meter_pulse` DB + user; apply migrations via `npx prisma migrate deploy` from `backend/`; seed if needed (`npm run db:seed`).
6. Update paths that contain `D:\meter`:
   - `.opencode/opencode.json` (postgres MCP DATABASE_URI, deepseek-eyes path)
   - global `~/.config/opencode/opencode.json` (git + filesystem MCP `--repository` / args paths)
   - `_tools/*.cmd` + `_tools/config.cmd` (working dirs)
   - `Meter/.venv` python path references
7. Register the Windows scheduled task `MeterVerseAdminBE` pointing to `_tools/experiment-be.cmd`.
8. Verify with the checklist in section 9.

---

## 9. Post-Move Verification Checklist

- [ ] `node --version` = 24.x · `npm --version` = 11.x
- [ ] PG16 on :5433 UP, DB `meter_pulse` exists, `prisma migrate deploy` OK
- [ ] `cd backend && npm test` → 464 tests (446 pass / 18 skip)
- [ ] `cd Frontend && npx tsc --noEmit` → 0 errors
- [ ] `node docs/architecture/graph/validate-graph.mjs` → 12/0/0
- [ ] `node speckit/validator.mjs` → 100%
- [ ] Admin FE :3535 → HTTP 200 · Admin BE :3131 health 200 · Portal FE :3030 → 200 · Portal BE :3003 → 200
- [ ] Solar invoice download: `GET http://localhost:3131/api/pdf/invoices/22cc2e45-d615-4f98-90d4-76098fea2aac/download` → 200, application/pdf, ~23 KB
- [ ] Git remote `origin` → https://github.com/Kirllos360/MeterVerse (push/pull OK)

---

## 10. Known Environment Quirks (avoid re-discovering)

- **RAM:** Current machine 8 GB. Read `FreePhysicalMemory` as **KB**, divide by 1024 to get MB (the "0 MB free" was a misread — it was 716 MB).
- **Node session-reaping:** any node launched from a shell that closes gets killed. Use scheduled tasks or `start /b`.
- **PDF generation:** renderer = `pdfkit` (NOT Jasper). Bilingual (Arabic) via embedded Tahoma font. `pdf-parse` (v2, `PDFParse` named export) used for PDF text validation.
- **`.gitignore` excludes `**/*.pdf`** — use `git add -f` to commit deliverable PDFs.
- **`next-env.d.ts`** is shared between Admin (`.next`) and Portal (`.next-portal`) — rebuilding one overwrites the other's reference; restore after Admin build if Portal breaks.
- **Backend logs:** `_tools/logs/*.log`; the running BE's stdout is captured by whichever launcher started it (scheduled task vs direct). Don't confuse stale `backend.log` EADDRINUSE entries with the current process.
- **Date:** Environment date is 2026-08-17; commit history is in 2026.

---

*This guide is the environment footprint. Pair with `MEMORY.md` (project state), `AI_BIBLE.md` (governance), and `FULL_HANDOVER_PROMPT.md` (the exact prompt to bootstrap a fresh AI session).*