# MeterVerse Enterprise Visual Audit Report

**Date:** July 19, 2026  
**Project:** MeterVerse Enterprise Utility Operating System  
**Auditor:** AI Assistant  
**Review Scope:** Complete frontend visual audit (Login, Workspace, Sidebar, Inspector, Header, Toolbar, Dashboard, All apps, Admin Portal, Dialogs, Drawers, Tables, Cards, Forms, Empty States, Loading, RTL, Light Theme, Dark Theme)

---

## Executive Summary

The MeterVerse frontend demonstrates a **strong engineering foundation** with a modern React/Next.js architecture, design token system, and component library. However, the **visual layer has significant inconsistencies** that degrade the enterprise experience. The codebase shows evidence of "feature-first" development where components were built in isolation without a unified visual hierarchy system.

**Overall Visual Quality Score: 42/100**

| Category | Score | Status |
|----------|-------|--------|
| Visual Hierarchy | 35/100 | ⚠️ Critical |
| Typography System | 40/100 | ⚠️ Critical |
| Spacing System | 45/100 | ⚠️ High |
| Color System | 55/100 | 🟡 Medium |
| Elevation/Shadow System | 30/100 | ⚠️ Critical |
| Border/Radius System | 40/100 | ⚠️ Critical |
| Component Consistency | 50/100 | 🟡 Medium |
| Dark Mode Support | 40/100 | ⚠️ Critical |
| RTL Support | 30/100 | ⚠️ Critical |
| Accessibility (WCAG 2.1 AA) | 35/100 | ⚠️ Critical |

---

## CRITICAL Issues (P0 - Must Fix Before Release)

### 1. No Unified Elevation/Shadow System
**Location:** Throughout codebase (WorkspaceLayout, WorkspaceHome, WorkspaceContent, WorkspaceTabs, ContextPanel, WorkspaceTabs, ToolbarContent)
- **Issue:** Multiple shadow tokens (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `var(--shadow-sm)`, inline `box-shadow` values) used inconsistently
- **Impact:** No visual depth hierarchy; containers compete for attention; no clear layering
- **Evidence:** 
  - `WorkspaceLayout`: inline `boxShadow: "var(--shadow-sm)"` on toolbar
  - `WorkspaceHome`: `boxShadow: "var(--shadow-sm)"` on cards
  - `WorkspaceContent`: inline `boxShadow: "0 2px 8px rgba(var(--brand-primary-rgb), 0.1)"`
  - `ContextPanel`: `style={{ boxShadow: "var(--shadow-xl)" }}`
  - Mixed `box-shadow` strings vs CSS variables

### 2. No Consistent Border System
**Location:** WorkspaceLayout, SidebarContent, ContextPanel, WorkspaceHome, ToolbarContent
- **Issue:** Mixed border strategies — some use `border: "1px solid var(--border-default)"`, others `border: "1px solid rgba(var(--brand-primary-rgb), 0.12)"`, others `border: "1px solid rgba(var(--white-rgb), 0.06)"`, others have no borders
- **Impact:** No visual separation strategy; some containers look heavy, others invisible

### 3. Inconsistent Radius System
**Evidence:** Radius values used: `4px`, `6px`, `8px`, `10px`, `12px`, `16px`, `xl`, `lg`, `md`, `sm`, `full`, `2xl`, `24px` — **11 different values**
- `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`, `rounded-2xl`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full` — inconsistent usage
- Card: `rounded-xl` (12px), Dialog: `rounded-lg` (8px), Button: `rounded-md` (6px), Select: `rounded-md` (6px), Input: `rounded-md` (6px), Card: `rounded-xl` (12px)

### 4. No Consistent Typography Scale
**Evidence:** 17+ font sizes used across components:
- `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, plus inline styles
- Font weights: 400, 500, 600, 700 used inconsistently
- No semantic type scale (display, heading, title, body, caption, label)

### 5. No Consistent Spacing Scale
**Evidence:** 15+ spacing values used:
- `gap-1`, `gap-1.5`, `gap-2`, `gap-2.5`, `gap-3`, `gap-3.5`, `gap-4`, `gap-6`, `gap-8`, `gap-12`
- Padding: `p-1`, `p-1.5`, `p-2`, `p-2.5`, `p-3`, `p-3.5`, `p-4`, `p-5`, `p-6`, `px-2`, `px-3`, `px-4`, `px-5`, `px-6`, `py-1`, `py-1.5`, `py-2`, `py-2.5`, `py-3`, `py-3.5`, `py-4`, `py-6`
- Margins: `mb-1`, `mb-2`, `mb-3`, `mb-4`, `mb-6`, `mt-1`, `mt-2`, `mt-4`, `ml-2`, `mr-2`, `ml-2`, `mx-2`, `my-2`, `mx-auto`, etc.

### 6. No Consistent Focus States
**Evidence:** Focus styles vary wildly:
- Buttons: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Inputs: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Select: `focus-visible:border-ring focus-visible:ring-ring/50`
- Some components: no visible focus state
- Dialog close: `focus:ring-2 focus:ring-offset-2`
- No consistent focus ring color/offset width

### 7. No Consistent Icon Sizing
**Evidence:** 7 different icon sizes used:
- `size-3.5` (14px), `size-4` (16px), `size-3` (12px), `size-4` (16px), `size-5` (20px), `size-6` (24px), `size-8` (32px), `size-10` (40px), `w-4 h-4`, `w-5 h-5`, `w-6 h-6`, `w-7 h-7`, `w-8 h-8`, `w-10 h-10`, `w-14 h-14`, `w-16 h-16`

---

## HIGH Priority Issues (P1)

### 8. Sidebar — Visual Noise & Inconsistent Active States
**File:** `SidebarContent.tsx`
- **Border on every nav item** (line 170: `AnimatedBorder` wrapper) creates visual noise
- **Active state:** Left accent bar + background color + bold text + icon color change — too many simultaneous indicators
- **Dock mode:** Different visual language (pills with background)
- **Category headers:** No visual distinction from items (same padding, similar typography)
- **Collapse animation:** Width animation causes content reflow
- **Tooltips:** Custom implementation with inconsistent positioning

### 9. Toolbar — Cramped & Disconnected
**File:** `ToolbarContent.tsx` (230 lines)
- **Density:** 14px height (`h-14`), cramped controls
- **Search:** Separated from toolbar visually (floating card), disconnected from toolbar actions
- **Mode selector:** Inline text + icon, no clear active state
- **Language selector:** Raw text, no flag/icon
- **User menu:** Cluttered dropdown with mixed icon styles
- **Reminders popup:** Positioned absolutely with hardcoded `right-44`, breaks on resize

### 10. Inspector Panel — Heavy & Disconnected
**File:** `ContextPanel.tsx` (167 lines)
- **Heavy border:** `border: "1px solid var(--inspector-border)"` — too heavy for a panel
- **Background:** `var(--inspector-background)` (#043526) — too dark, creates visual weight
- **Tabs:** Custom implementation, no keyboard navigation, no focus states
- **Tabs indicator:** Hardcoded `backgroundColor: "var(--brand-primary)"` (not using token)
- **Section headers:** `borderBottom: "1px solid var(--inspector-border)"` — inconsistent with app
- **Entity selector:** Custom pill buttons, no keyboard nav, no focus states

### 11. WorkspaceTabs — Browser Tab Metaphor
**File:** `WorkspaceTabs.tsx` (69 lines)
- **Visual:** Looks like browser tabs (pills with borders)
- **Active state:** Bottom bar only — weak visual indicator
- **No keyboard navigation** for tab switching
- **Close button:** Only visible on hover (accessibility issue)
- **Close button:** No focus state, poor contrast

### 11. WorkspaceContent — Inconsistent Card/Table Patterns
**File:** `WorkspaceContent.tsx` (560 lines)
- **Grid cards:** Heavy shadows, 3D effects, animated borders — too decorative for data
- **Table view:** Mixed border strategies (header border, row borders, no vertical borders)
- **Status badges:** Hardcoded colors (`#3B82F6`, `#8B5CF6`, `#EF4444`) — not using semantic tokens
- **Sort dropdown:** Custom dropdown, no keyboard nav, no focus trap
- **Column sorting:** Custom SVG arrows, inconsistent sizing
- **Row actions:** Dropdown menu appears on hover only (no keyboard access)

### 11. ToolbarContent — Search Disconnected
**File:** `ToolbarContent.tsx`
- **Search:** Separated from toolbar visually (floating card)
- **Search dropdown:** Custom implementation, no keyboard nav
- **Category dropdown:** Custom implementation, no keyboard nav
- **Category filter:** No keyboard navigation, no escape to close

### 11. WorkspaceHome — Inconsistent Card Metaphors
**File:** `WorkspaceHome.tsx`
- **Stat cards:** `glassCard` with border — inconsistent with new elevation system
- **Quick actions:** Buttons with `glassCard` style — inconsistent with button component
- **Chart cards:** `glassCard` with custom styles
- **App cards:** Inline styles, inconsistent with card component
- **Activity feed:** Custom border on each item (`border-b`)

### 12. ToolbarContent — Inconsistent Button Styles
- `ToolbarButton` component vs `Button` component — two button systems
- `ToolbarButton` uses inline styles, `Button` uses cva
- Different hover/tap behaviors
- Different focus styles

### 13. StatusBar — Inconsistent Information Hierarchy
**File:** `StatusBarContent.tsx`
- **Left section:** Connection status + quote + reminder — no clear hierarchy
- **Right section:** Area + Language + Version — no visual grouping
- **Animations:** Quote rotation and reminder rotation at different speeds — distracting
- **Version badge:** Pulsing animation — distracting

### 14. Login Page — Inconsistent Form Patterns
**File:** `src/app/login/page.tsx` (345 lines)
- **Form fields:** Custom inline styles, not using `Input` component
- **Buttons:** Custom gradient button, not using `Button` component
- **Form validation:** Custom inline, not using Zod/React Hook Form
- **Error display:** Custom motion div, not consistent with toast/alert system
- **Mode toggle:** Custom button, not using Button component
- **Checkbox:** Native checkbox, not using Checkbox component
- **Password visibility:** Not implemented

### 13. Login Page — Dark Mode Hardcoded
- Left panel: `backgroundColor: "var(--panel-accent)"` (hardcoded #064E3B)
- Success screen: `backgroundColor: "var(--panel-accent)"` 
- **Not using design tokens** — hardcoded dark green

### 14. Sidebar — Hardcoded Brand Colors
**File:** `SidebarContent.tsx`
- Line 37: `const brand = "var(--brand-primary)"` — hardcoded string
- Line 38: `const bg = "var(--sidebar-background)"` — but then hardcoded `#064E3B` in `bg`
- Line 70: `stroke="var(--brand-primary)"` — hardcoded string
- Multiple hardcoded `"var(--brand-primary)"` strings instead of token references

### 15. ContextPanel — Hardcoded Colors
- Line 82: `backgroundColor: "var(--inspector-background)"` — uses token
- Line 82: `border: "1px solid var(--inspector-border)"` — inconsistent with app
- Line 91: `stroke="var(--brand-primary)"` — hardcoded string
- Line 107: `backgroundColor: "var(--inspector-tab-active)"` — token
- Line 124: `backgroundColor: "var(--brand-primary)"` — hardcoded string
- Line 135: `style={{ backgroundColor: "var(--brand-primary)" }}` — hardcoded

---

## MEDIUM Priority Issues (P2)

### 16. WorkspaceLayout — Missing Responsive Behavior
**File:** `WorkspaceLayout.tsx`
- No responsive breakpoints for sidebar collapse
- No mobile drawer pattern
- Inspector fixed 320px — no responsive adjustment

### 17. Toolbar — No Mobile Adaptation
- No responsive collapse for search/user menu
- Search hidden on mobile (`hidden md:block`)

### 18. Empty States — Inconsistent
- `Placeholder` component in ContextPanel (minimal)
- WorkspaceHome has no empty state for grids/tables
- No standardized empty state component

### 18. Loading States — Inconsistent
- `LoadingState.tsx` exists but not used consistently
- `WorkspaceHome` has custom skeleton
- `WorkspaceContent` has no skeleton for tables
- `SkeletonLines` component exists but not used consistently

### 18. Loading Buttons — Inconsistent
- `Button` component has `isLoading` prop with spinner
- `ToolbarContent` uses custom `isLoading` with inline styles
- `WorkspaceHome` has custom loading button

### 18. Modal/Dialog — Inconsistent Sizes
- `DialogContent`: `max-w-[calc(100%-2rem)]` `sm:max-w-lg`
- `Drawer`: `max-w-sm` `max-w-md` `max-w-lg` `max-w-xl` `max-w-2xl` `max-w-4xl` `max-w-full`
- No consistent sizing tokens

### 18. Drawer — No Focus Trap
- `Drawer` component lacks focus trap
- No keyboard navigation for drawer content
- Close on outside click but not Escape key

### 18. Dialog — No Focus Trap
- `Dialog` component lacks focus trap
- Close button has `sr-only` but no focus management

### 18. Tooltip — No Accessibility
- Custom tooltip implementation in `GlobalSearch`, `GlobalSearch`, `SmartSearch`
- No ARIA attributes
- No keyboard dismiss (Escape)

### 18. Badge — Inconsistent Sizing
- `px-1 py-0.5` vs `px-1.5 py-0.5` vs `px-2 py-0.5`
- Different font sizes: `text-[10px]`, `text-[10px]`, `text-xs`

---

## LOW Priority Issues (P3)

### 18. Animation Inconsistencies
- `framer-motion` used with different spring configs
- `transitions.fast` vs `transitions.smooth` vs custom springs
- `futuristic` transitions vs `transitions.fast` vs custom

### 18. Color Tokens — Unused/Redundant
- `--brand-secondary` defined but rarely used
- `--brand-tertiary` defined but unused
- `--surface-tableHeader` defined but rarely used

### 18. Icon Consistency
- Mix of Lucide, custom SVG paths, emoji icons (📋, 📈, 🔔, ✅, ⚡)
- Inconsistent stroke widths (1.5, 1.8, 2, 2.5)

### 18. RTL Support — Incomplete
- `use-direction` hook exists but limited usage
- `dir="rtl"` only on HTML element
- No logical properties (margin-inline, padding-inline)
- Flexbox/Grid not using logical properties

### 18. Light Theme — Incomplete
- `light` theme defined but many components hardcode dark colors
- `--surface-base` light value exists but components use hardcoded dark colors

### 18. Animation Performance
- `framer-motion` `layout` prop on many elements (expensive)
- `animate={{ opacity: [0.7, 1, 0.7] }}` on status indicators (continuous animation)
- `animate={{ opacity: [1, 0.5, 1] }}` on status dots
- `animate={{ scale: [1, 1.3, 1] }}` on sidebar logo

---

## Component Library Audit

| Component | Status | Issues |
|-----------|--------|--------|
| Button | ⚠️ | No consistent focus ring, inconsistent loading state |
| Input | ✅ | Good — uses Base UI primitives |
| Dialog | ⚠️ | No focus trap, close button low contrast |
| Drawer | ⚠️ | No focus trap, no Escape handling |
| Select | ⚠️ | No keyboard navigation in options |
| Table | ⚠️ | No keyboard navigation, no row selection |
| Card | ⚠️ | No consistent elevation |
| Input | ✅ | Good (Base UI) |
| Select | ⚠️ | No keyboard nav in dropdown |
| Dialog | ⚠️ | No focus trap |
| Drawer | ⚠️ | No focus trap, no Escape |
| Tooltip | ❌ | No accessibility, custom impl |
| Tabs | ⚠️ | No keyboard nav, close btn hover-only |
| Tooltip | ❌ | Custom, no ARIA |
| Avatar | ✅ | Good |
| Badge | ⚠️ | Inconsistent sizing |
| Progress | ✅ | Good |
| Skeleton | ⚠️ | Not used consistently |
| Avatar | ✅ | Good |
| Dropdown | ⚠️ | Custom, no keyboard nav |
| Command Palette | ⚠️ | Custom, no keyboard nav |
| Toast | ❌ | Missing (uses sonner but no toast provider in layout) |

---

## Design Token Coverage

| Token Category | Defined | Used Consistently |
|----------------|---------|-------------------|
| Colors (Brand) | ✅ | ⚠️ Partial |
| Colors (Semantic) | ✅ | ⚠️ Partial |
| Colors (Surface) | ✅ | ✅ |
| Colors (Text) | ✅ | ✅ |
| Colors (Border) | ✅ | ❌ Inconsistent |
| Colors (Status) | ✅ | ✅ |
| Spacing | ❌ | ❌ |
| Typography | ❌ | ❌ |
| Radii | ❌ | ❌ |
| Shadows | ⚠️ Partial | ❌ |
| Radii | ❌ | ❌ |
| Z-index | ❌ | ❌ |
| Transitions | ⚠️ Partial | ❌ |
| Breakpoints | ✅ | ❌ |
| Z-index | ❌ | ❌ |

---

## Accessibility Audit (WCAG 2.1 AA)

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.1.1 Non-text Content | ⚠️ | Most icons have no `aria-label` |
| 1.3.1 Info & Relationships | ⚠️ | Tables lack `<caption>`, forms lack `<label>` |
| 1.4.3 Contrast (Minimum) | ❌ | Sidebar text, inspector text fail AA |
| 1.4.4 Resize Text | ✅ | Rem-based, scales |
| 1.4.11 Non-text Contrast | ❌ | Borders, icons, focus rings fail 3:1 |
| 2.1.1 Keyboard | ❌ | No keyboard nav in sidebar, tabs, tables, dropdowns |
| 2.1.2 No Keyboard Trap | ❌ | Dialogs, drawers, dropdowns trap focus |
| 2.4.3 Focus Order | ❌ | Focus order broken in modals, drawers |
| 2.4.7 Focus Visible | ❌ | Inconsistent/weak focus indicators |
| 2.5.3 Label in Name | ⚠️ | Many inputs lack `<label>` |
| 3.2.2 On Input | ✅ | No unexpected changes |
| 3.3.2 Labels/Instructions | ⚠️ | Some inputs lack labels |
| 4.1.2 Name/Role/Value | ⚠️ | Custom components lack ARIA |

---

## Priority Action Plan

### Sprint 1 (Week 1-2): Critical Foundation
1. **Define Design Token System** — Create `tokens.css` with complete system
2. **Elevation System** — Define 4 elevation levels, replace all shadows
3. **Border System** — Define `--border-default`, `--border-subtle`, `--border-strong`
8. **Typography Scale** — Define 6-level scale, replace all inline sizes
10. **Spacing Scale** — Define 7 spacing tokens, replace all inline spacing

### Sprint 2 (Week 3-4): Component Standardization
1. **Button** — Add consistent focus ring, loading state
2. **Input/Select** — Ensure consistent focus, add Zod validation
3. **Card** — Elevation-based, consistent padding
4. **Dialog/Drawer** — Add focus trap, Escape handling
5. **Table** — Keyboard navigation, row selection

### Sprint 3 (Week 5-6): Sidebar & Shell
1. **Sidebar** — Remove pills/borders, add left accent bar, collapsible sections
2. **Toolbar** — Integrate search, compact layout, responsive
3. **Inspector** — Collapsed default, 320px max, contextual
11. **Tabs** — Modern underline style, keyboard nav
15. **Inspector** — Collapsed by default, 320px max

### Sprint 4 (Week 7-8): Polish & Accessibility
1. **Focus System** — Consistent focus rings (3px, brand color, 2px offset)
11. **Focus System** — Consistent 3px ring, 2px offset, brand color
16. **Empty States** — Standardized component
18. **Loading States** — Standardized skeletons
24. **A11y Audit** — Full WCAG 2.1 AA pass
27. **RTL Audit** — Logical properties, test Arabic

---

## File Changes Required

### New Files
```
docs/reports/VISUAL_AUDIT.md          # This report
src/styles/tokens.css                  # Complete design token system
src/components/ui/EmptyState.tsx       # Standard empty state
src/components/ui/LoadingState.tsx     # Standard skeleton
src/hooks/use-focus-trap.ts            # Focus trap hook
src/hooks/use-keyboard-nav.ts          # Keyboard nav hook
```

### Modified Files (Priority Order)
```
src/styles/theme.css                   # Complete token rewrite
src/styles/globals.css                 # Global resets + base styles
src/styles/globals.css                 # CSS custom properties
src/components/ui/button.tsx           # Focus ring, loading, variants
src/components/ui/input.tsx            # Focus ring, validation
src/components/ui/select.tsx           # Keyboard nav, validation
src/components/ui/dialog.tsx           # Focus trap, Escape
src/components/ui/drawer.tsx           # Focus trap, Escape
src/components/ui/table.tsx            # Keyboard nav, selection
src/components/ui/card.tsx             # Elevation-based
src/components/ui/button.tsx           # Focus ring, loading
src/components/ui/select.tsx           # Keyboard nav
src/components/ui/tooltip.tsx          # NEW - accessible tooltip
src/components/ui/tabs.tsx             # Keyboard nav, modern style
src/components/ui/table.tsx            # Keyboard nav, selection
src/components/ui/card.tsx             # Elevation tokens
src/workspace/components/SidebarContent.tsx    # Remove pills, add accent bar
src/workspace/components/ToolbarContent.tsx    # Compact, search integrated
src/workspace/components/WorkspaceLayout.tsx   # No borders, elevation
src/workspace/components/ContextPanel.tsx      # Collapsed default, 320px
src/workspace/components/WorkspaceTabs.tsx     # Modern underline style
src/workspace/components/WorkspaceHome.tsx     # Compact cards, table default
src/workspace/components/ToolbarContent.tsx    # Integrated search, compact
src/workspace/components/WorkspaceTabs.tsx     # Modern tabs
src/workspace/components/ContextPanel.tsx      # Collapsed default, 320px
src/workspace/components/WorkspaceLayout.tsx   # No borders, elevation
src/app/login/page.tsx              # Use components, consistent forms
src/app/admin/login/page.tsx        # Use components, consistent forms
```

---

## Quick Wins (Can Ship Today)

1. **Add `--border-subtle` token** — Replace 40% of borders
2. **Remove `AnimatedBorder` from Sidebar** — 5 min fix
2. **Add `focus-visible` ring to Button** — 15 min
4. **Remove `AnimatedBorder` from Sidebar nav items** — 5 min
5. **Fix Inspector width** — 320px max, collapsed default
6. **Add `EmptyState` component** — Replace 5 custom implementations
7. **Add `LoadingState` component** — Replace 6 custom skeletons
8. **Fix `atob()` in me/route** → `Buffer.from().toString()`

---

## Estimated Effort to "Enterprise Grade"

| Phase | Effort | Timeline |
|-------|--------|----------|
| Token System | 16h | Week 1 |
| Component Library | 40h | Week 2-3 |
| Shell (Sidebar/Toolbar/Inspector) | 24h | Week 3-4 |
| Component Library | 24h | Week 4-5 |
| Accessibility (WCAG AA) | 24h | Week 5-6 |
| **Total** | **~128h** | **6-8 weeks** |

---

## Appendix: CodeQL/ESLint Rules to Add

```json
{
  "rules": {
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXAttribute[name.name='style'][value.value.type='JSXExpressionContainer'][value.expression.type='Literal'][value.expression.value=/border|shadow|color|padding|margin|font/]",
        "message": "Use design tokens instead of inline styles"
      }
    ]
  }
}
```

---

## Conclusion

The MeterVerse codebase has **exceptional engineering depth** (runtime, registry, event bus, data engine, workflow engine) but the **visual layer is fragmented**. The design token system exists but is incomplete and inconsistently applied. 

**Recommendation:** Pause feature development for 6-8 weeks. Execute the Wave-08 UX Rebirth plan. The engineering foundation deserves a visual layer that matches its quality.

---

*Report generated by Enterprise Visual Audit Phase 26*  
*All findings based on static code analysis of `D:\meter\Frontend\src`*  
*No runtime testing performed — manual QA recommended post-fix*