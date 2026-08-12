# P58 — DUPLICATION / SPLIT-BRAIN REPORT
**Date:** 2026-08-12

## RESOLVED THIS PHASE (P57/P58)
| Item | Canonical | Duplicate | Status |
|------|-----------|-----------|--------|
| Auth system | `AuthRuntime` (zustand) | `auth-context.tsx` (mock, always-true) + IdentityContext | ✅ REMOVED auth-context; unified to AuthRuntime |
| Permission system | `PermissionRuntime` (zustand) | `permission-context` mock provider | ✅ Mock provider removed from layout; permission-context now delegates |
| /admin/login (fake) | /login (real) | /admin/login (800ms fake) | ✅ redirects to /login |
| /auth/* (dead Clerk) | /login | /auth/sign-in, /auth/sign-up | ✅ /auth → /login redirect |

## OPEN DUPLICATIONS
| Item | Canonical | Duplicate | Risk | Recommendation |
|------|-----------|-----------|------|----------------|
| Admin shell | `AdminLayout.tsx` | `SystemLayout.tsx` (88% similar; AdminLayout default export NAMED SystemLayout) | confusion, drift | rename AdminLayout's export; merge or deprecate one |
| Dashboard stacks | Admin console (AdminLayout + app/admin/page.tsx) | `/dashboard` starter island (AppSidebar + nav-config + DashboardPageSwitch) | two full UIs | pick one canonical; move starter to `/dashboard` demo only |
| api-client | `src/lib/api-client.ts` (130+ importers) | `src/services/api-client.ts` (0 importers) | dead | delete services copy |
| AppShell | none | `layouts/AppShell.tsx` + `app-framework/shell/AppShell.tsx` (both 0 importers) | dead | delete both |
| Dialog | ui/dialog (live) | enterprise/dialog (dead) | dead | delete |
| Drawer | ui/drawer (live) | enterprise/drawer (both ~unused) | dead | consolidate |
| CommandPalette | admin-settings version | enterprise/command-palette (dead) | dead | delete |
| Breadcrumbs | — | components/breadcrumbs + admin-settings Breadcrumbs (both dead) | dead | delete |
| event-bus | core/event-bus (live) | runtime/events/event-bus (dead) | dead | delete |
| application-registry | app-framework (live) | runtime/application (dead) | dead | delete |
| SessionManager | AuthRuntime | identity/session/SessionManager (0 importers) | dead | delete |
| AdminPageSwitch | app/admin/page.tsx | admin/components/AdminPageSwitch (0 importers) | dead | delete |
| data-table types | config/data-table | lib/data-table + types/data-table (triple) | drift | consolidate |
| workspace-persistence | workspace/persistence | runtime/persistence (77% similar) | drift | consolidate |
| runtime contracts/kernel program | one | two near-dupes | drift | consolidate |
| Login surfaces | /login | /admin/login (redirect), /auth/* (dead) | low | remove redirect stubs later |

## NESTED CLONE
- `D:\meter\Meter\` — 24.9 GB, 268k files, gitignored, no own .git, plain folder copy. Contains reference systems (collection-system, sbill, symbiot, energy-360, meter-department, ims, all-last-update) + the old full project copy.
- **Backup in progress (tar, ~9 GB so far).** After backup completes → user decision to delete.
- 3 orphaned scripts reference `Meter/reference/`: migration_engine.py, phase-g-*.py, phase-h0-certification.py (self-referenced only; not in any launcher/CI)

## NEVER DELETE WITHOUT DEPENDENCY ANALYSIS
All deletions above were checked for importers before flagging (0 importers = safe to remove after code review). Do not delete live files listed as canonical.
