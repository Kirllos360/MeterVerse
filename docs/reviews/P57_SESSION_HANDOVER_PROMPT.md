# METERVERSE OS — FULL SESSION HANDOVER PROMPT
**Version:** 1.0 · **Date:** 2026-08-03 · **Purpose:** Give a NEW AI session complete knowledge of the MeterVerse OS project as of this session, so it can continue without re-discovering from scratch. Read fully before any work.

---

## 0. HOW TO USE THIS PROMPT
This is a complete context handover. Read every section. Then follow the EVIDENCE files (Section 11) for deeper detail. Treat the repo as the source of truth — re-verify any claim before acting on it.

---

## 1. PROJECT IN 30 SECONDS
MeterVerse OS = enterprise utility metering + billing platform (meters, customers, readings, invoices, payments, collections, finance, AI). Enterprise monorepo: ONE Next.js frontend source, ONE Express backend source, ONE PostgreSQL, but **two standalone runtime profiles** (Admin console + Customer portal) running simultaneously on separate ports with separate build dirs.

---

## 2. ARCHITECTURE (verified live)
- **Admin Frontend** → `localhost:3535` (Admin console at root `/`)
- **Admin Backend** → `localhost:3131` (full enterprise API)
- **Portal Frontend** → `localhost:3030` (user/customer version)
- **Portal Backend** → `localhost:3003` (customer API, gates admin routes → 404)
- **PostgreSQL** → `localhost:5433` (single `meter_pulse` DB — **NOTE: 5433, not 5432**)
- Profile controlled by `PORTAL_MODE=1` + `NEXT_PUBLIC_PORTAL_MODE=1` (portal), plus **port-based detection** (see Section 4)
- Separate build dirs: `.next` (admin) vs `.next-portal` (portal) via `distDir`
- Monorepo: `apps/` (4 deployable profiles) + `packages/` (shared-types, auth, api-client, runtime)

---

## 3. CRITICAL FIXES DONE THIS SESSION (know these — they changed the app)

### 3a. PERMANENT admin/portal separation (commit `2b27c274`)
**The bug:** `:3030` and `:3535` BOTH showed the SAME admin data (portal FE started without PORTAL_MODE env → page.tsx rendered admin on both).
**The fix (PERMANENT, port-based):**
- `Frontend/src/app/page.tsx`: `window.location.port === "3030"` → portal; else admin (env fallback)
- `Frontend/src/app/layout.tsx` (server): reads request `host`/port header → `:3030` = portal (green `data-profile`), else admin (red)
- **Result:** the two ports can NEVER show the same profile again, regardless of launch/env mistakes.

### 3b. DB port fix (critical — `.env`)
**The bug:** `backend/.env` `DATABASE_URL` pointed to `:5432` but PostgreSQL serves on `:5433` → `db: disconnected` → API tests failed (14).
**The fix:** `.env` now `localhost:5433`. Also ran `prisma db push` (recreated schema) + `node scripts/seed.js` (seeded roles/admin/settings). **Backend tests now 292/292 pass.**

### 3c. Green→Red sweep in ADMIN (commit `1d141152`)
Deep sweep across the ENTIRE admin system — zero green accent (light or dark):
- `page.tsx` home `SystemDashboard brandColor "#059669"` → `#DC2626` (this was the green in the workspace)
- 43 files swept: database, tickets, monitoring, security, accounting (journal/trial/ledger/accounts), alerts, bill-cycle, collections, connection-settings, connectivity-center, customer-settings, database-*, documents, home, location, migration, monitoring-view, payment, report, sync, tariff, upload*, users-permissions, workflows, InspectorPanel, ChatTab, ComponentLab, AuditViewer, SystemHealth, ConfigCenterPage, ChartComponents
- `globals.css` alert-toast.success → `var(--brand)`
- Removed dead green in SystemDashboard
- **Portal `SystemLayout` reverted** (portal keeps its green — correct)
- **Browser-verified:** admin :3535 → reds present, greens=0

### 3d. Dark mode: all sections dark gray (commit `5f48e63d`)
Deep black-audit found black in the 3 vertical sections:
- `--surface-base` dark `#000000` → `#1A1A1E`
- `--surface-sunken` dark `#141416` → `#1A1A1E`
- `admin/login` `#0A0A0A` → `#1A1A1E`
- **Result (dark mode):** ALL 3 vertical sections (sidebar/workspace/topbar) + root = uniform `#1A1A1E` dark gray, text `#F2F2F5` white, red accents.
- **Browser-verified** (forced dark): rootBg rgb(26,26,30), all surface tokens #1A1A1E, text white.

### 3e. Admin 3-tab-row restructure (AdminLayout)
- Removed the decorative static `SYSTEM_TABS` row (Admin/Dashboard/Analytics/System — had no content function)
- **Top row = OPEN-PAGES tabs** (from sidebar), always visible
- **Second row = SUB-PAGE tabs**, always present (even if a page has a single view; shows page label)
- **Search bar in header** moved right (`ml-auto`)
- Removed the breadcrumb trail (Admin | October | Phase) — header "Select Area" dropdown retained
- Workspace fills the space

---

## 4. COLOR PALETTE (the design spec — ADMIN)
| Token | Dark mode | Light mode |
|---|---|---|
| All 3 sections (sidebar/workspace/topbar) + root | `#1A1A1E` dark gray | `#F2F2F5` off-white |
| Secondary | `#DC2626` red | `#DC2626` red |
| Text | `#F2F2F5` white | `#1C1C1E` black |
| Hover | `rgba(220,38,38,0.10)` light red | `rgba(220,38,38,0.06)` light red |
| Borders | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` |
- **Auto theme by clock:** `themeMode="auto"` → light 6am–6pm, dark otherwise (AdminLayout line ~95)
- **NO green in admin** (light or dark). Portal is green (`#059669`).
- Remaining greens are ONLY semantic/portal tokens (`--status-success`, `--brand-user`, `[data-profile="portal"]`) — correct by design.

---

## 5. RUNTIME TOPOLOGY (live now)
All 4 services currently running:
- Admin FE :3535 (200) · Admin BE :3131 (200, db connected)
- Portal FE :3030 (200) · Portal BE :3003 (200, db connected)
- Launch via `_tools/Start.cmd` (all 4) or per-profile `.cmd` wrappers in temp.

---

## 6. REPOSITORY STATE
- Branch `main` — 0 ahead/behind origin, clean tree
- HEAD: `5f48e63d` (dark-gray sweep)
- ~19k tracked files · 63 backend route files · 94 admin pages · 187 Prisma models · 15 migration dirs
- DB: 7 users, 5 roles, 30 permissions, 4 areas, 23 projects (post-reseed: roles/settings re-seeded; customer/meter data needs operational seed re-run if empty)

---

## 7. STARTUP / TOOLS
- `_tools/Start.cmd` launches all 4 services with health checks + logs
- `_tools/config.cmd` sets ADMIN_*/PORTAL_* ports + log paths
- Launcher env: admin = no PORTAL_MODE; portal = `PORTAL_MODE=1 NEXT_PUBLIC_PORTAL_MODE=1`
- **Known dev fragility:** Turbopack dev-cache corrupts periodically when both FEs run on shared source (CSS parse errors, routes.d.ts corruption) → clean `.next` + `.next-portal` dev/cache dirs + restart

---

## 8. OPEN DECISIONS AWAITING CHATGPT/KIMI (from P56)
1. **Q1 DB separation** — do Admin + Portal share the SAME business data (customers/meters/invoices) or separate tenancies? THE blocker. My lean: keep ONE DB now, add per-profile roles later.
2. **Q2 Shared login** — decided: SAME login UI, profile-aware backend. Sign-out routing still needs implementation (currently broken).
3. **Q3 Two kirllos accounts** — `kirllos` / `kirllos.hany@epower.com.eg` / `K14455`, full permissions, in both systems. Modeling undefined.
4. **Q4 Sign-out** → shared `/login` + profile-aware POST.
5. **Q5 Area/Project/User wiring** via roles + permissions (`PermissionOnRole`).
6. **Q6 Tooling** — prisma migrate (currently db-push), Playwright E2E + Lighthouse in CI.

---

## 9. KEY FILES (read these)
- `Frontend/src/app/page.tsx` (port-based profile), `layout.tsx` (data-profile)
- `Frontend/src/admin/layout/AdminLayout.tsx` (themeVars, tab rows, nav)
- `Frontend/src/features/admin-settings/components/LocationSelector.tsx` (breadcrumb removed)
- `backend/src/server.js` (PORTAL_MODE gating), `backend/.env` (PORT 3131, DB 5433)
- `_tools/config.cmd`, `_tools/Start.cmd`
- `packages/shared-types/src/index.ts` (SERVICE_PORTS)

## 10. EVIDENCE REPORTS
- `docs/reviews/P57_MASTER_RECOVERY_CERTIFICATION.md`
- `docs/reviews/P57_PORT_AND_FRONTEND_PLANNING_REFERENCE.md`
- `docs/reviews/P57_CHATGPT_PLAN_ADJUSTMENT.md`
- `docs/reviews/P56_CHATGPT_BRAIN_PROMPT.md` + `P56_KIMI_CONTEXT_PROMPT.md`
- `docs/reviews/P55_FORENSIC_GAP_ANALYSIS.md` + `P55_CHATGPT_HANDOVER.md`
- `.ai/memory/PROJECT_STATE.md` (v10.8.0), `P40_EXECUTION_TRACKER.md` (OBS-070..078)

## 11. RECENT COMMITS
`5f48e63d` (dark-gray sweep) · `1d141152` (green→red admin) · `2b27c274` (permanent separation) · `3d66d335` (visual identity) · `dbb0700b` (stale ports) · `30a63fb7` (P56) · `0b95d390` (P55)

## 12. NEXT ACTIONS (after reading)
1. Verify services live + DB on 5433
2. Await ChatGPT/Kimi decisions on Q1–Q6
3. Implement shared login + sign-out → kirllos accounts → area/project/user wiring
4. Wave 4 (C15 → C26 → C17) per P40

**END OF HANDOVER.** You now have full context. Start from a verified state.
