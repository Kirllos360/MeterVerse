# MeterVerse — Environment Migration Handover Package (INDEX)

**Created:** 2026-08-17 · **Reason:** migrate the MeterVerse development environment off the current laptop (at capacity) to a fresh partition/machine. Nothing is left to chance — this package contains every tool, library, MCP, config, memory, and the exact bootstrap prompt.

---

## 📦 Package Contents

| File | Purpose |
|------|---------|
| `ENVIRONMENT_SETUP_GUIDE.md` | **Everything to install** — runtimes, global tools, all npm dependencies (backend + frontend + root), all MCP servers, ports/services, credentials, move instructions, post-move checklist, environment quirks |
| `AI_BIBLE.md` | **Portable operating constitution** — the system, the execution protocol, project layout, business rules, security/tenancy, quality gates |
| `MEMORY.md` | **Complete project memory** — runtime state, solar vertical (real data + blockers), enterprise foundation, DB, test baselines, open items |
| `prompts/FULL_HANDOVER_PROMPT.md` | **The exact prompt** to give a fresh AI system so it bootstraps the environment and loads continuity with zero gaps |

## 🗺 How to use (5 steps)

1. **Move the repo** to the new partition: copy the whole workspace folder (it IS the repo root) to the new partition. Preserve everything.
2. **Read `ENVIRONMENT_SETUP_GUIDE.md`** and install every tool/library/MCP it lists (runtimes first, then deps, then MCPs).
3. **Set up PostgreSQL 16 on :5433** with `meter_pulse` + apply migrations (`npx prisma migrate deploy`) + generate.
4. **Copy the project files to the new location** and fix absolute paths (`D:\meter` → new path) in `.opencode/opencode.json`, global opencode config, `_tools/*.cmd`, and `.env` files.
5. **Start the new AI session by pasting `prompts/FULL_HANDOVER_PROMPT.md`** verbatim. It will re-verify the environment, load memory/governance, and confirm the Solar download works before any new work.

## ✅ Verification targets after migration
- Backend tests: **464 (446 pass / 18 skip)**
- FE typecheck: **0 errors**
- Graph: **12/0/0** · SpecKit: **100%**
- Services: Admin :3535/:3131 · Portal :3030/:3003 all HTTP 200
- Solar download: `GET http://localhost:3131/api/pdf/invoices/22cc2e45-d615-4f98-90d4-76098fea2aac/download` → 200 application/pdf
- Repo HEAD: `9dec6600`, clean

## 🔒 Data safety
- The `.rar` reference files under `Meter/` are untracked (not in git) — they're tariff/IMS reference archives; move them with the folder but they don't affect the build.
- The real Solar PDF artifact `docs/solar/SOLAR-52051449-2021-01.pdf` is committed (forced-add past the `*.pdf` gitignore).
- Database backup exists in `_tools/backups/` (`meterverse_20261508.sql`).

## ⚠️ Known environment quirks (read the guide for full list)
- Native PG16 :5433 only (Docker off, PG18 :5434 unrelated).
- Node session-reaping → use scheduled task `MeterVerseAdminBE`.
- `next-env.d.ts` shared between Admin/Portal builds.
- `**/*.pdf` gitignored → `git add -f` for deliverable PDFs.
- RAM reports read as KB (divide by 1024).
## NEW — MASTER_HANDOVER.md (READ FIRST)

**MASTER_HANDOVER.md** is the single-file complete handover (created 2026-08-27): full session record, migration control spec, DeepSeek bootstrap prompt, verified state snapshot, and completion signature template. **Read it first** — it supersedes and consolidates this package for the migration.
