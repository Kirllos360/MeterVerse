# P48 — Enterprise UX Rules

**Version:** 1.0 · The enforceable rules for every surface. These are gates, not guidelines.

## Mandatory Rules

### R1 — No full-page reloads
The workspace is an SPA. Navigation changes state, never the document.

### R2 — No simulated persistence
Every form/action writes to the real backend, commits, and reflects the result. No mock/sample data in production surfaces.

### R3 — No orphan screens or dead links
Every nav item resolves. No `#` placeholders except intentional parents with children. Every backend route has a consuming surface (or is removed).

### R4 — Context-scoped by default
Every app reads the Runtime Context (Area/Project/Role/Permission/Tenant) and renders scoped data. No hardcoded scope.

### R5 — Every mutation is audited
All create/update/delete produce an AuditEntry (actor, action, resource, before/after, result). Failures are also logged.

### R6 — Permission-gated everywhere
API requires permission; menu filters by role; direct URL denied with 403 + audit.

### R7 — One DNA
Consistent tokens, shadcn/ui components, icon registry, motion, PageContainer headers, TanStack Form + Zod. No bespoke styling bypassing tokens.

### R8 — Accessibility & i18n
AA contrast, keyboard complete, focus visible, ARIA. en + ar (RTL). No hardcoded English strings.

### R9 — Feedback on every action
Toast on success/error; activity stream on mutation; optimistic where safe but server-confirmed.

### R10 — AI is read-only by default
AI assistants never mutate without explicit human approval. Confidence + explainability required.

## Enforcement

- **Search-before-build** (P48 Rule 9): if a component/service exists, wire it — never duplicate.
- **Multi-verification** (P48 Rule 10): static, tsc, build, lint, unit, integration, contract, API, DB, permission, audit, runtime, regression, UX review, business scenario.
- **No ship without certification.**

## Anti-patterns (reject in review)

| Anti-pattern | Reject because |
|---|---|
| New page collection outside workspace | breaks One Shell |
| Hardcoded area/project | breaks context |
| Mock data in a live surface | breaks trust |
| New icon import not via registry | breaks consistency |
| Un-audited mutation | breaks accountability |
| Duplicate shell/duplicate page | breaks reuse (P47) |
