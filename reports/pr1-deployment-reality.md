# PR1 — Deployment Reality Audit

**Date**: 2026-06-18
**Auditor**: Automated investigation

---

## 1. Repository Structure

### Root Repository (`D:\meter\.git`)

| Property | Value |
|----------|-------|
| **HEAD** | `c12e486 fix: move dependabot.yml to repo root` |
| **Branch** | `master` (single branch) |
| **Total commits** | 1 |
| **Status** | Contains only shell files — the actual project is invisible |

### Nested Repository (`D:\meter\Meter\.git`)

| Property | Value |
|----------|-------|
| **HEAD** | `007aa0a T088: Create Area DB template (42 tables)` |
| **Current branch** | `feature/t055-payments-contract` |
| **Total branches** | 51 |
| **Remote** | `origin https://github.com/Kirllos360/Meter.git` |
| **Commits** | 200+ (full T061–T088 history) |

### Stale Copy (`D:\meter\Meter-\.git`)

A duplicate git repository, likely from a failed rename/restructure. Also has its own `.git`.

---

## 2. Branch Analysis

| Branch | Status | Contains app code? |
|--------|--------|-------------------|
| `master` (root repo) | ✅ Active | ❌ No (shell only) |
| `feature/t055-payments-contract` (nested) | ✅ Currently running | ✅ Yes |
| `main` (nested) | ✅ Exists | ✅ Yes (behind by 68 commits) |

**The running application is on `feature/t055-payments-contract`**, NOT `main`. The `main` branch has only generic CI/gh workflow commits and is 68 commits behind.

---

## 3. Working Tree State

### Modified Files (76 total)

Every stabilization fix made in earlier sessions is **uncommitted**:

```
Stabilization fixes (uncommitted):
- Frontend/src/components/layout/AppShell.tsx      ← SPA route mapping
- Frontend/src/components/layout/AppSidebar.tsx    ← Sidebar items
- Frontend/src/components/layout/LoginPage.tsx     ← Auth fix (await)
- Frontend/src/components/readings/ReadingsPage.tsx ← B-01 fix
- Frontend/src/components/readings/ReadingNewPage.tsx ← B-02 fix
- backend/src/auth/auth.controller.ts              ← DTO validation
- backend/src/main.ts                              ← CORS config
- Frontend/src/lib/feature-flags.ts                ← Flag updates
- Frontend/src/lib/mock-auth.ts                    ← Mock auth
+ 66 other modified files (Dashboard, Billing, Customers, etc.)
```

### Untracked Files (43 total)

New files never added to git:
```
- Frontend/src/components/layout/LocaleLayout.tsx
- Frontend/src/components/shared/ProtectedAction.tsx
- Frontend/src/hooks/use-balances.ts, use-consumption.ts, use-invoices.ts, use-payments.ts
- Frontend/src/lib/action-permissions.ts
- Frontend/src/lib/i18n/                    ← Full i18n system
- reports/c1 through c8/                    ← Governance reports
- reports/d1 through d7/                    ← Pre-T088 reports
- specs/002-meter-verse-core/               ← Core specs
- specs/003-symbiot-integration/            ← Symbiot specs
- specs/004-migration-plans/               ← Migration specs
- docs/planning/                            ← Planning docs
+ backend additions (DR scripts, e2e tests)
```

---

## 4. Running Services

| Service | Type | PID | Working Dir | Started |
|---------|------|-----|-------------|---------|
| Next.js dev server | bun | 44052 | `Meter\Frontend` | 05:33 |
| Next.js server | node | 33900 | `Meter\Frontend` | 05:33 |
| Backend (NestJS) | node | 7428 | `Meter\backend` | 06:23 |
| Backend (NestJS) | node | 43120 | `Meter\backend` | 06:23 |
| Docker Desktop | docker | 29120 | — | 06:23 |

### Docker Containers

| Container | Image | Status | Ports |
|-----------|-------|--------|-------|
| `playwright-mcp` | mcp/playwright:latest | Up 3 days | 8080 |
| `meter-pulse-db` | postgres:16-alpine | Up 4 days (healthy) | 5432 |
| `portainer` | portainer/portainer-ce | Up 5 days | 9000 |

---

## 5. Build Artifacts

| Artifact | Timestamp | Notes |
|----------|-----------|-------|
| `.next/build/` | 2026-06-18 06:18 | From manual `bun run build` in this session |
| `.next/server/` | 2026-06-18 06:18 | Same build |
| `.next/standalone/` | 2026-06-18 06:19 | Standalone output |
| Turbopack cache | 2026-06-18 05:33 | Dev server startup |

**The `.next/` build is NOT reproducible from git HEAD.** Building from the committed source would produce different output because 76 modified files contain uncommitted changes.

---

## 6. Deployment Drift Summary

| Check | Actual | Expected | Status |
|-------|--------|----------|--------|
| Branch | `feature/t055-payments-contract` | `main` | ❌ **DRIFT** |
| Committed matches running | 76 modified files not committed | All changes in git | ❌ **DRIFT** |
| Repository of record | `D:\meter\Meter\.git` | `D:\meter\.git` | ❌ **DRIFT** |
| Build reproducible | No (uncommitted changes) | Yes | ❌ **DRIFT** |
| Sidebar matches source | Uncommitted AppSidebar.tsx | Committed version | ❌ **DRIFT** |
| Latest pages visible | Uncommitted components | Committed version | ❌ **DRIFT** |
| i18n system | Untracked (`?` files) | Should be tracked | ❌ **DRIFT** |

---

## 7. Root Cause of "Old Navigation" Report

**EXACT CAUSE**: 76 uncommitted modified files + 43 untracked files. The `AppSidebar.tsx`, `AppShell.tsx`, and all new page components exist only in the working tree. Running `git checkout main` or pulling from origin would restore the OLD sidebar without any of the restructuring work.

The `Meter/` subtree being a nested git repo means:
1. Root `git status` sees `Meter/` as untracked — invisible
2. All stabilization + restructuring work is on a feature branch, not `main`
3. 76 modified files could be lost if the working tree is cleaned

---

## Board

```
DEPLOYMENT_MATCHES_REPOSITORY = NO ❌
```
