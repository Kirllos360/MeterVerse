# MeterVerse Interaction DNA

**Defines how users interact with the platform — navigation patterns, input methods, feedback mechanisms.**

---

## 1. Primary Interaction Model

| Input Method | Support | Notes |
|-------------|---------|-------|
| Mouse/Trackpad | ✅ Full | Point, click, hover, drag |
| Keyboard | ✅ Full | Tab navigation, shortcuts, command palette |
| Touch | ✅ Responsive | Tap, swipe, pinch (tablets) |
| Screen Reader | ✅ WCAG 2.2 AA | ARIA labels, semantic HTML, focus management |

## 2. Navigation Interactions

- **Sidebar navigation** — primary navigation, collapsible to icons-only
- **Top navigation** — workspace/area switcher, global search, notifications, user menu
- **Breadcrumbs** — show current location, clickable for navigation
- **Tab navigation** — for multi-section pages (customer detail, meter detail)
- **Command Palette** — Ctrl+K for keyboard-driven navigation

## 3. Data Interactions

| Action | Interaction Pattern |
|--------|-------------------|
| View data | SmartTable with search, sort, filter, paginate |
| Create entity | Form (inline, dialog, or wizard depending on complexity) |
| Edit entity | Inline edit (simple) or dialog edit (complex) |
| Delete entity | Confirmation dialog with reason required |
| Export data | Button → format selection → download |
| Import data | Upload Center → file selection → mapping → validate → import |

## 4. Feedback Mechanisms

| Feedback Type | Visual | Timing |
|--------------|--------|--------|
| Success | Green toast notification | Immediate |
| Error | Red toast + inline field error | Immediate |
| Warning | Yellow toast with action | Immediate |
| Loading | Skeleton screen (tables) or spinner (actions) | >300ms |
| Progress | Progress bar (uploads, imports, bulk operations) | Ongoing |
| Empty | Illustration + message + CTA | On load |

## 5. Selection Patterns

- **Single select:** Click row → detail view
- **Multi select:** Checkbox in table rows → bulk action bar appears
- **Range select:** Shift+click for contiguous rows in tables
- **Filter select:** Dropdown, search select, multi-select for filters

## 6. Drag and Drop

- **NOT** a primary interaction pattern. Use explicit actions (buttons, forms) for data operations.
- Exception: Reordering items in lists within configuration pages.

## 7. Undo and Recover

- Destructive actions require confirmation with typed reason
- Reversible actions show "Undo" in toast notification for 5 seconds
- Audit log captures all actions for recovery
- "Are you sure?" with entity name and affected data summary
