# MeterVerse Command Palette DNA

**Defines the command palette (Ctrl+K) — the primary keyboard-driven navigation and action interface.**

---

## 1. Trigger

- **Keyboard:** Ctrl+K (Cmd+K on Mac)
- **Mouse:** Click search icon in TopNav
- **Scope:** Available everywhere in the application

## 2. Command Palette Content

| Section | Content |
|---------|---------|
| Quick Actions | Common tasks (Create customer, Add meter, Generate invoice) |
| Navigation | All navigable pages (role-filtered) |
| Recent Pages | Last 10 visited pages |
| Entity Search | Search across customers, meters, invoices |
| Keyboard Shortcuts | Available shortcuts reference |

## 3. Command Palette UX

| Element | Behavior |
|---------|----------|
| Overlay | Semi-transparent backdrop, centered panel |
| Search input | Auto-focused, placeholder "Search pages, actions, entities..." |
| Results | Categorized with section headers |
| Selection | Arrow keys + Enter |
| Close | Esc or click outside |
| Width | 640px (desktop), full width (mobile) |
| Max height | 480px with scroll |

## 4. Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| Ctrl+K | Open command palette |
| Ctrl+N | Create new entity (context-dependent) |
| Ctrl+S | Save current form |
| Ctrl+F | Focus table search |
| Esc | Close overlay / Cancel action |
| / | Focus global search |
| ? | Show keyboard shortcuts |
| Alt+1-9 | Quick switch between sidebar sections |

## 5. Command Palette Rules

| Rule | Implementation |
|------|---------------|
| Role-filtered | Users only see actions they can perform |
| Context-aware | Some commands change based on current page |
| Search-first | Type to filter, don't show full list |
| Fuzzy search | Matches partial terms |
| Recent first | Recently used commands appear at top |
| Learnable | New users see "Press Ctrl+K to search" prompt |
