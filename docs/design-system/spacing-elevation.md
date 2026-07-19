# MeterVerse Design System — Spacing & Elevation

## Spacing Scale
```
--space-4:   4px    → Micro spacing (icons, badges)
--space-8:   8px    → Tight gaps (button groups, inline)
--space-12:  12px   → Standard gap (cards, sections)
--space-16:  16px   → Card padding, section margins
--space-24:  24px   → Panel margins
--space-32:  32px   → Section spacing
--space-48:  48px   → Page sections
```

## Radius Scale
```
--radius-sm:  4px    → Inputs, buttons, small controls
--radius-md:  8px    → Cards, panels, modals (shadcn standard)
--radius-lg:  12px   → Dialogs, sheets
```

## Icon Sizes
```
--icon-sm:  16px  → Inline with text, table cells
--icon-md:  20px  → Navigation items
--icon-lg:  24px  → Buttons, empty states, feature icons
```

## Elevation Levels
```
Level 0: transparent             → Background layer
Level 1: surface-base + shadow   → Page content
Level 2: surface-raised + shadow → Cards, panels, dropdowns
Level 3: surface-pop + shadow-lg → Modals, dialogs, toasts
```

## Shadows
```
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04)    → Cards
--shadow-md: 0 2px 8px rgba(0,0,0,0.06)    → Dropdowns
--shadow-lg: 0 8px 24px rgba(0,0,0,0.08)   → Modals
```

## Motion
```
Transition durations:
  75ms   → Hover states, color changes
  150ms  → Element appear/disappear
  200ms  → Sidebar expand/collapse
  300ms  → Dialog open/close
  500ms  → Page transitions

Easing:
  --ease-default:  [0.16, 1, 0.3, 1]  → Standard spring
  --ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1)
  --ease-sharp:    cubic-bezier(0.4, 0, 0.6, 1)
```
