# Wave-08 — Enterprise UX Rebirth

**Problem**: Architecture 92/100, Visual UX 35/100  
**Goal**: "Feels like Azure or Linear, built for utility operations"

---

## Phase 1: Design Token System Rewrite

### Current (Broken)
```css
--text-primary: oklch(0.15 0.005 160);
--sidebar-text: #FFFFFF;
--inspector-text: #FFFFFF;
```
Multiple sources of truth for text color. Sidebar `#FFFFFF` conflicts when background is also white.

### Target
```css
/* Hierarchy tokens — one source of truth */
--elevation-0: transparent;        /* background */
--elevation-1: var(--surface);      /* panels */
--elevation-2: var(--surface-raise);/* cards */
--elevation-3: var(--surface-pop);  /* modals */

/* Border usage: 80% reduction */
--border-panel: none;              /* containers have no border */
--border-card: 1px solid var(--border-subtle);
--border-control: 1px solid var(--border-default);

/* Typography scale — strict */
--text-display: 32px/700;
--text-heading: 24px/600;
--text-title: 20px/600;
--text-body: 16px/400;
--text-caption: 14px/400;
--text-label: 12px/500;

/* Spacing scale — strict */
--space-4: 4px;  --space-8: 8px;  --space-12: 12px;
--space-16: 16px; --space-24: 24px; --space-32: 32px; --space-48: 48px;

/* Radii — minimal */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;

/* Brand — minimal palette */
--brand: #00BFA5;
--brand-hover: #00A88F;
--neutral: oklch(...);
--semantic-success: #059669;
--semantic-warning: #D97706;
--semantic-error: #DC2626;
```

---

## Phase 2: Application Shell Rebuild

### Current (Fragmented)
```
┌─────────────────────────────────────────────────────┐
│ [Sidebar w/borders] │ [Content w/borders] │ [Inspector] │
│  ┌──────────────┐  │  ┌──────────────────┐ │  ┌──────┐ │
│  │ pill         │  │  │ bordered card    │ │  │      │ │
│  │ pill         │  │  │ bordered card    │ │  │ text │ │
│  │ pill         │  │  │ bordered card    │ │  │      │ │
│  └──────────────┘  │  └──────────────────┘ │  └──────┘ │
│  everything border │  everything border    │  border    │
└─────────────────────────────────────────────────────┘
```

### Target (Hierarchical)
```
┌─────────────────────────────────────────────────────┐
│ [Top Bar — minimal]                                  │
│  Logo | Breadcrumb | Search | Notif | Theme | Avatar │
├────────┬──────────────────────────────────┬──────────┤
│ Nav    │ Content Canvas                    │ Inspector│
│ icon   │ ┌────────────────────────────┐   │ (hidden  │
│ icon   │ │ elevation hierarchy here   │   │  until   │
│ icon   │ │ no borders on containers   │   │  select) │
│ icon   │ └────────────────────────────┘   │          │
│        │  Tables (default for data)       │          │
│ 72px   │  Cards (only for assets)         │ 320px    │
└────────┴──────────────────────────────────┴──────────┘
```

### Changes
1. **Sidebar**: Remove all borders from nav items. Only active item gets a subtle left accent bar. Width: 72 collapsed, 260 expanded (not 340).
2. **Inspector**: Collapsed by default. Opens to 320px max when item selected. Never shows empty.
3. **Content Canvas**: No borders on the canvas itself. Elevation comes from component depth.
4. **Top Bar**: Logo left → Breadcrumb → Center Search → Right: Notifications, Theme, Language, Profile. Remove cramping.

---

## Phase 3: Sidebar Navigation Redesign

### Current
```
┌──────────────────────────┐
│  ▼ Collapse              │
│                          │
│  🟢 CE┌ DASHBOARD        │  ← pill with border
│  🟢 CE│ CUSTOMERS        │  ← pill with border  
│  🟢 CE│ METERS           │  ← pill with border
│  🟢 CE│ READINGS         │  ← pill with border
│                          │
│  ▼ OPERATIONS            │
│  🟢 CE│ BILLING          │  ← pill with border
│  🟢 CE│ PAYMENTS         │  ← pill with border
│                          │
│  [Collapse]              │
└──────────────────────────┘
```

### Target
```
┌──────────────────────┐
│ ○ Dashboard          │  ← no border, icon + label
│ ○ Customers          │  ← hover: subtle bg
│ ○ Meters             │  ← active: left accent bar
│ ○ Readings           │
│                      │
│ ∇ Operations         │  ← collapsible section
│   ○ Billing          │  ← indented
│   ○ Payments         │
│                      │
│ ○ Settings           │
└──────────────────────┘
```

### Rules
- No borders on nav items
- No pills
- Active state: 3px left accent bar (brand color) + subtle bg
- Hover: subtle bg change only
- Categories: collapsible with chevron, indented children
- Icons: 20px consistent
- Text: `--text-label` (12px/500) for categories, `--text-body` (16px/400) for items

---

## Phase 4: Remove 80% of Borders

### Current (borders everywhere)
Every panel, card, button, input, and section has a border.

### Target (elevation-based hierarchy)
| Element | Before | After |
|---------|--------|-------|
| Sidebar container | `border: 1px solid brand` | `elevation-1` (no border) |
| Nav items | `border-radius + bg` | No border, bg only on hover/active |
| Cards | `border + shadow + radius` | `elevation-2` (shadow only, no border) |
| Data tables | `border on every cell` | `border-bottom` only on rows |
| Modals | `border + shadow` | `elevation-3` (shadow only) |
| Buttons | `border + bg` | `bg + subtle ring` |
| Inputs | `border + focus-ring` | `border-bottom` only |

---

## Phase 5: Consistent Component Library

### Typography Scale
```
Display:  32px / 700  (page titles)
Heading:  24px / 600  (section headers)
Title:    20px / 600  (card titles)
Body:     16px / 400  (paragraphs, table cells)
Caption:  14px / 400  (secondary text)
Label:    12px / 500  (form labels, metadata)
```

### Icon Sizes
```
16px — inline with text, table cells
20px — navigation items
24px — buttons, empty states
```

### Spacing Scale
```
4, 8, 12, 16, 24, 32, 48  — nothing else
```

### Radii
```
4px  — inputs, buttons, small controls
8px  — cards, panels, modals
12px — dialogs, sheets (max)
```

### Density Modes
```
Comfortable — default, 16px padding
Compact     — 8px padding, smaller text
Dense       — 4px padding, minimal
```

---

## Phase 6: Tables Default for Data Pages

| Page | Current Default | New Default |
|------|----------------|-------------|
| Readings | Cards | Table |
| Invoices | Cards | Table |
| Payments | Cards | Table |
| Logs | Cards | Table |
| Audit | Cards | Table |
| Events | Cards | Table |
| Meters | Cards | Cards (asset) |
| Customers | Cards | Cards (asset) |

---

## Phase 7: Contextual Inspector

- **Collapsed by default** — zero screen space when nothing selected
- **Opens to 320px** when user clicks an item
- **Shows context** — details, activity, notes, timeline
- **Closes** when user clicks canvas or presses Escape
- **Width**: 320px fixed, never resizable
- **Position**: Right side, below top bar

---

## Phase 8: Empty States

Create reusable components for:
```
NoData       — illustration + message + action button
Loading      — skeleton + spinner
Offline      — network error + retry
Permission   — lock icon + message
Error        — error icon + message + retry
Searching    — searching indicator
NoResults    — no results message + clear filter
```

---

## Progress

| Phase | Status | Date |
|-------|--------|------|
| 1. Design token rewrite | ✅ Complete | New elevation, typography, spacing, radii tokens |
| 2. Sidebar redesign | ✅ Complete | No borders, no pills, left accent bar, 72/260px widths |
| 3. App shell rebuild | ✅ Complete | Sidebar no border, inspector contextual, cleaner layout |
| 4. Remove 80% borders | 🔲 Pending | Elevation over borders |
| 5. Component library | 🔲 Pending | Type scale, icon sizes, spacing |
| 6. Tables default | 🔲 Pending | Data pages default to tables |
| 7. Contextual inspector | ✅ Complete | Collapsed default, 320px max |
| 8. Empty states | 🔲 Pending | Reusable empty state components |

## Implementation Order

| Step | What | Files | Effort |
|------|------|-------|--------|
| 1 | Rewrite design token system (hierarchy tokens) | theme.css | 2h |
| 2 | Rebuild sidebar (remove borders, add elevation) | SidebarContent.tsx | 3h |
| 3 | Rebuild top bar (align items, reduce cramping) | ToolbarContent.tsx | 2h |
| 4 | Remove 80% of borders from cards/panels | WorkspaceContent.tsx, cards | 4h |
| 5 | Redesign cards (compress info, remove excess) | enterprise cards | 3h |
| 6 | Make tables default for data pages | readings, invoices, payments | 4h |
| 7 | Make inspector contextual (collapsed default) | WorkspaceLayout.tsx | 2h |
| 8 | Empty states + density modes | New components | 4h |
| 9 | Full audit + SpecKit | verification | 1h |

**Total: ~25h**
