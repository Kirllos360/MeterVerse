# P48 — Interaction Principles

**Version:** 1.0 · The rules governing every interaction in the Operating System.

## 1. Core Principles

1. **One continuous session** — Login to Logout is one flow; no page-jumping.
2. **Context is king** — the active Area/Project/Role/Peremission drives everything.
3. **Workflow, not page** — every action belongs to a flow with a next step.
4. **Result before decoration** — the outcome (persisted/audited) is the product.
5. **Least surprise** — consistent patterns; no hidden behavior.
6. **Keyboard-first, mouse-friendly** — Command Palette, shortcuts, focus.
7. **Feedback always** — toast on success/error; activity on mutation.
8. **Progressive disclosure** — overview → detail in-context (inspector), not hops.
9. **Optimistic but verifiable** — UI updates fast; server result confirms.
10. **Trust through audit** — every write is traceable.

## 2. Interaction States

| State | Rule |
|---|---|
| Loading | skeleton/shimmer; no full-page spinner |
| Empty | EmptyState with next action |
| Error | inline + toast; retry; no crash |
| Success | toast + activity + audit |
| Permission-denied | 403 + guidance (not blank) |
| Offline/deprecated | degraded with notice |

## 3. Micro-interactions

- **Transitions** 150–250ms; opacity/translate; reduced-motion respected.
- **Hover** reveals affordance (edit, view, actions).
- **Focus** always visible (ring).
- **Drag** only where it adds value (kanban, docking).

## 4. Form Interactions

- TanStack Form + Zod; inline validation; required markers.
- Submit → pending → success/error; disable double-submit.
- **Every form persists** (P45) and audits.

## 5. Table Interactions

- Column sort, filter, pagination (server-side via query keys).
- Row selection + bulk actions.
- Row click → detail in-context (inspector or app tab).

## 6. Command Palette (Cmd+K)

- Global search: apps, entities, actions.
- Context-aware results (scoped to active area/project).
- Fast navigation without mouse.

## 7. Accessibility

- AA contrast; keyboard complete; aria labels; RTL (Arabic) mirrors layout.
