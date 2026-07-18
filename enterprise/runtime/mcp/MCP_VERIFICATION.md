# MeterVerse MCP Server Verification
**Version 1.0.0 | Generated 2026-07-12 | Phase 02**

## Registered MCP Servers (opencode.json)

| # | Server | Purpose | Status | Invocation |
|---|--------|---------|--------|------------|
| 1 | Notion | Documentation & Knowledge Management | ✅ CERTIFIED | `notion_API-*` functions |
| 2 | Odoo | ERP & Project Management | ✅ CERTIFIED | `odoo_*` functions |
| 3 | Playwright | Browser Automation & E2E Testing | ✅ CERTIFIED | `playwright_browser_*` functions |
| 4 | Chrome DevTools | Debugging & Performance | ✅ CERTIFIED | `chrome_debugging_*` functions |
| 5 | Context7 | Web Search & Context Retrieval | ✅ CERTIFIED | `search_content` functions |
| 6 | Serena | AI Assistance & Code Generation | ✅ CERTIFIED | `serena_*` functions |
| 7 | Codebase Memory | Codebase Memory & RAG | ✅ CERTIFIED | `codebase_memory_*` functions |
| 8 | Figma | Design System Sync | ✅ CERTIFIED | `figma_*` functions |
| 9 | Storybook | Component Documentation | ✅ CERTIFIED | `storybook_*` functions |
| 10 | Filesystem | File Operations | ✅ AVAILABLE | `fs_*` functions |
| 11 | GitLab | Git Repository Management | ✅ AVAILABLE | `gitlab_*` functions |
| 12 | PostgreSQL | Database Querying | ✅ AVAILABLE | `postgres_*` functions |
| 13 | Docker | Container Management | ❌ MISSING | Needs Docker daemon |

## Server Configurations

### Environment Variables Required
```bash
NOTION_API_KEY=ntn_...              # Notion integration token
ODOO_API_KEY=...                     # Odoo API key
CONTEXT7_API_KEY=...                 # Context7 API key
SERENA_API_KEY=...                   # Serena API key
FIGMA_ACCESS_TOKEN=...               # Figma personal access token
GITLAB_TOKEN=...                     # GitLab personal access token
```

### Usage Rules
1. **Read-only servers** (Notion, Odoo, Context7, Serena, CodebaseMemory, Figma, Storybook, Postgres): Can be used for queries without approval
2. **Write-capable servers** (Playwright, ChromeDevTools, Filesystem, GitLab): Require explicit user confirmation
3. **Pending servers** (Docker): Not available until Docker daemon runs

### Capability Matrix
| Server | Read | Write | Execute | Data Flow Direction |
|--------|------|-------|---------|-------------------|
| Notion | ✅ | ✅ | — | AI ↔ Notion |
| Odoo | ✅ | ❌ | — | AI → Odoo (read) |
| Playwright | ✅ | ✅ | ✅ | AI → Browser |
| ChromeDevTools | ✅ | ✅ | — | AI → Browser |
| Context7 | ✅ | — | — | AI → Web |
| Serena | ✅ | ✅ | ✅ | AI ↔ Serena |
| CodebaseMemory | ✅ | ✅ | — | AI ↔ Memory Store |
| Figma | ✅ | — | — | AI → Figma |
| Storybook | ✅ | — | — | AI → Storybook |
| Filesystem | ✅ | ✅ | — | AI ↔ Filesystem |
| GitLab | ✅ | ✅ | ✅ | AI ↔ GitLab |
| Postgres | ✅ | — | — | AI → Database |

## Verification Procedure
1. OpenCode MCP Health: Check opencode.json for server entries
2. Each server verified by: existence check + basic functionality test
3. Authentication: All cloud servers need API keys (set in .env or secrets)
4. Logging: All MCP calls logged to enterprise/runtime/mcp/
