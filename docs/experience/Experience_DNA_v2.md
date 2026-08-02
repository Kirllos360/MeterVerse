# P48 — Experience DNA v2 (Enterprise OS)

**Version:** 2.0 (supersedes v1.0; consolidates `AI/10_EXPERIENCE/EXPERIENCE_DNA_ENTERPRISE.md`)
**Authority:** permanent — governs every surface in the Operating System.

## 1. Product Truth

MeterVerse is an **Enterprise Utility Operating System**: one workspace, context-driven, real data, workflow-continuous, role-scoped. Two centers (Admin Control / User Operations) share one DNA.

## 2. Experience Pillars (v2)

1. **Operating-System Mentality** — not pages; system functions in a workspace.
2. **Context-Reactive** — Area/Project/Role/Permission drive everything.
3. **Workflow-Continuous** — no dead-ends; every action has a next step + a result.
4. **Trustworthy** — every write persists and is audited. No simulation.
5. **One DNA** — consistent tokens, motion, interaction, accessibility everywhere.

## 3. Visual Language

- **Brand duality:** Control Center = red (#DC2626); Operations Center = green (#059669). Same tokens, different accent.
- **Tokens:** `--brand`, `--brand-rgb`, surface/ border/text variables; 10 themes.
- **Layout:** Toolbar + Sidebar + Canvas + Tabs + Inspector + Status (workspace model).
- **Typography:** font.config (inter/arabic), hierarchy via PageContainer.
- **Motion:** subtle, purposeful (framer-motion), 150-250ms, respect reduced-motion.

## 4. Interaction Language

- **Keyboard-first:** Command Palette (Cmd+K), shortcuts, focus visible.
- **Feedback:** toast on success/error; optimistic where safe.
- **Bulk actions:** tables with selection + bulk operations.
- **Progressive disclosure:** drill into details in-context (inspector), not new pages.

## 5. Component Language

- **shadcn/ui (New York)** base; enterprise extensions (PageShell, EntityCrudDialog, EmptyState, LoadingState, ContextMenu, FileUpload).
- **Icon registry** (`components/icons.tsx`) — never raw tabler imports.
- **Tables:** TanStack Table + config-driven columns.
- **Forms:** TanStack Form via `useAppForm`; Zod validation.

## 6. Accessibility & Localization

- **A11y:** contrast AA, keyboard nav, focus management, aria.
- **i18n:** next-intl, en + ar (RTL); per-user + per-tenant language.
- **Responsive:** desktop/tablet/mobile browser (no native app).

## 7. Anti-Patterns (never)

- Full-page reloads · simulated persistence · orphan screens · dead links · per-tenant code forks · hardcoded scope · duplicated shells (user `/` vs `/user`).

## 8. Governance

Every Wave 3–10 implementation is certified against this DNA (multi-verification: static, tsc, tests, contract, persistence, permission, audit, UX review, business scenario).
