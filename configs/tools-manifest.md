# MeterVerse — Tools Manifest

> **AI MUST READ THIS BEFORE EVERY TASK.** Pick tools by task category.
> Violation = no `🧰 Tools activated` block at task start.

---

## 1. MCP Servers (configured in opencode.json)

| Tool | Command | When to use | Purpose |
|------|---------|-------------|---------|
| `sequential-thinking` | `mcp-server-sequential-thinking` | **Any complex multi-step task** — audit, analysis, planning, debugging | Breaks down problems into verifiable sub-steps. Prevents skipping intermediate reasoning. |
| `git` | `mcp-server-git --repository D:\meter` | **Any git operation** — diff, blame, log, status, branch | Verifies what changed vs what was planned. Detects STATUS.yaml inconsistencies via git diff. |
| `filesystem` | `mcp-server-filesystem D:\meter` | **Codebase analysis** — counting files, measuring sizes, finding patterns, Meter/ audit | Filesystem operations beyond glob/grep. Directory tree analysis, size audits. |
| `postgres` | `mcp-server-postgres postgresql://...` | **Database auditing** — running SQL, checking indexes, verifying data, EXPLAIN ANALYZE | Direct DB access without Prisma. Verifies that indexes are actually used. |
| `playwright` | `npx @playwright/mcp@latest` | **UI verification** — screenshots, component rendering, visual regression | Captures evidence of UI changes. Required for T03 GATE_CHECK evidence. |
| `openapi` | `mcp-openapi` | **API documentation** — generating/validating OpenAPI specs | When working on API contracts or route documentation. |

## 2. CLI Tools (installed locally)

| Tool | Location | When to use | Purpose |
|------|----------|-------------|---------|
| `vitest` | `backend/node_modules/.bin/vitest` | **Testing** — running tests, writing test files | Unit tests, integration tests. Required for T05. |
| `prisma` | `backend/node_modules/.bin/prisma` | **Database schema** — migrations, validate, generate | Any schema change, migration, validation. |
| `husky` | `node_modules/.bin/husky` | **Git hooks** — pre-commit, pre-push | Setting up commit hooks. Required for T03-S03. |
| `npx` | System | **Running any npm package** without installing | Ad-hoc tool execution. |

## 3. Project Scripts

| Script | Location | When to use | Purpose |
|--------|----------|-------------|---------|
| `Set-Status.ps1` | `scripts/Set-Status.ps1` | **Every status update** | Standardized STATUS.yaml updater with verification. |
| `Set-PlanningStatus.psm1` | `scripts/Set-PlanningStatus.psm1` | **PowerShell module** for status updates | Importable function for scripts. |
| `scripts/add-indexes.mjs` | `backend/scripts/add-indexes.mjs` | **Schema index changes** | Automated @@index injection. |

## 4. Task-to-Tool Mapping

| Phase/Task | Required Tools | Optional Tools |
|------------|---------------|----------------|
| Phase 42b T03: Wire Notifications | `filesystem`, `git` | `sequential-thinking` |
| Phase 42b T04: Add Export | `filesystem` | — |
| Phase 42c T05: Detail Pages | `playwright` | `sequential-thinking` |
| Phase 42d T03: GATE_CHECK | `sequential-thinking`, `git`, `filesystem` | — |
| Phase 42d T04: page-configs | `filesystem` | `sequential-thinking` |
| Phase 42d T05: Test Foundation | `vitest` | `git` |
| Phase 42d T06: Meter/ Decision | `filesystem`, `sequential-thinking` | `git` |

## 5. Tool Acquisition Protocol

If the task requires a tool not listed above:
1. **Identify** what's needed (MCP server, CLI tool, npm package, Python library)
2. **Install** it (npx, npm install -g, pip install, or download)
3. **Verify** it works with a quick test
4. **Register** it in this manifest under the appropriate category
5. **Declare** it in the 🧰 block along with how it was acquired
6. **Document** why in `LEARNING_ENGINE/LESSONS_LEARNED.md`

Examples of self-directed acquisition:
- `npx @playwright/mcp@latest` — Playwright MCP for UI testing
- `npm install -D @vitest/coverage-v8` — coverage provider
- `pip install graphifyy` — knowledge graph
- `npm install speakeasy` — MFA TOTP library
- Any MCP server that improves reasoning, auditing, or implementation quality

## 6. Self-Improvement Cycle

After every task:
1. **Evaluate**: Could I have done this better with a different tool, MCP, or LLM?
2. **Identify gaps**: What blind spots did my current toolset leave?
3. **Acquire**: Find and install the missing capability
4. **Document**: Update this manifest + LEARNING_ENGINE
5. **Next task**: Use the improved toolset

## 7. Enforcement

1. **Before every task**: AI outputs `🧰 Tools activated: [tool1, tool2, ...]` as FIRST line
2. **During task**: AI uses the declared tools (installing any missing ones)
3. **After task**: AI appends to `configs/tool-usage-log.json`
4. **Self-improvement**: AI evaluates if a better tool exists for future similar tasks
5. **If no `🧰` block appears**: protocol violation — user can detect immediately
