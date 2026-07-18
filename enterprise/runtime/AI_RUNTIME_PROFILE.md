# MeterVerse AI Runtime Profile
**Version 1.0.0 | Generated 2026-07-12 | Phase 02 — AI Runtime & Orchestration**

## Project Identity
- **Name:** MeterVerse
- **Organization:** MeterVerse Enterprise
- **Root:** `D:\meter`
- **Description:** Enterprise Utility Operating System — multi-tenant metering, billing, and energy management

## Architecture Stack
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Backend Framework | NestJS | 10 | Monorepo at `Meter/backend/` |
| Frontend Framework | Next.js | 16 | Two clients: `Meter/Frontend/` and `Frontend/meterverse-ui/` |
| UI Library | shadcn/ui + Radix | Latest | Tailwind CSS v4 |
| State Management | Zustand + TanStack Query | Latest | |
| ORM | Prisma | 6 | Active schema: `Meter/backend/prisma/schema.prisma` |
| Database | PostgreSQL | 16 | Via Prisma |
| Cache | Redis | 8.0.5 | WSL Ubuntu |
| Auth | Passport + JWT | Latest | |
| API Style | REST + WebSocket | | |
| Container | Docker + Compose | 29.5.2 | Daemon not running |
| CI/CD | GitHub Actions | | 5 jobs in `.github/workflows/ci.yml` |
| Design System | Figma + Storybook | | Connected via MCP |

## Runtime Versions (Locked)
See `versions.lock.json` for complete list. Key runtimes:
- Node.js `24.15.0` | npm `11.12.1` | pnpm `11.11.0`
- TypeScript `7.0.2` | ESLint `10.7.0` | Prettier `3.9.5`
- Python `3.11.9` | Go `1.26.5` | Java `21.0.11` | Rust `1.97.0`
- Docker `29.5.2` | Git `2.54.0` | GitHub CLI `2.92.0`
- Playwright `1.61.1` | Snyk `1.1305.0` | Trivy `0.70.0`

## Quality Gates (Mandatory Pre-Deployment)
1. `npx tsc --noEmit` — Zero errors
2. `eslint . --ext .ts,.tsx` — Zero errors
3. `depcruise src --output-type err` — No violations
4. `madge --circular src/index.ts` — No circular deps
5. `npx playwright test` — All passing
6. `npm audit` — No high/critical
7. Semgrep + Trivy + Snyk + Spectral — All pass
8. TruffleHog — No secrets
9. Lighthouse + Axe — Score >= 90

## MCP Layer (12 Servers)
| Server | Purpose | Status |
|--------|---------|--------|
| Notion | Documentation & Knowledge | Active |
| Odoo | ERP Integration | Active |
| Playwright | Browser Automation | Active |
| Chrome DevTools | Debugging | Active |
| Context7 | Web Search | Active |
| Serena | AI Assistance | Active |
| Codebase Memory | RAG Memory | Active |
| Figma | Design System | Active |
| Storybook | Component Catalog | Active |
| Filesystem | File Ops | Available |
| GitLab | Git Management | Available |
| PostgreSQL | Database Query | Available |

## AI Role System
See `roles/` directory for full definitions:
- **Chief Architect:** Architecture decisions, ADR creation, quality gates
- **Senior Developer:** Feature implementation, code review, testing
- **QA:** Test writing, coverage tracking, bug reporting
- **Security Engineer:** Vulnerability scanning, SAST/DAST, secrets
- **DevOps:** CI/CD, containers, deployment
- **Technical Writer:** Documentation, API docs, ADRs
- **Release Manager:** Versioning, changelog, releases

## Tool Routing (Task → Tools → Validation)
See `AI_TOOL_ROUTER.md` for complete routing table. Key routes:
- Architecture Review → depcruise + madge + knip → 80% certification
- Security Audit → snyk + trivy + checkov + semgrep → zero high/critical
- Implementation → ast-grep + jscodeshift → tsc + eslint pass
- Testing → playwright + artillery → 100% critical paths

## Execution Pipeline
See `pipelines/` directory:
1. SpecKit/Requirements → 2. Runtime Profile → 3. Tool Registry → 4. Task Type → 5. Tools → 6. Analysis → 7. Validation → 8. Implementation → 9. Tests → 10. Documentation → 11. ADR → 12. Knowledge Graph → 13. Certification → 14. Report
