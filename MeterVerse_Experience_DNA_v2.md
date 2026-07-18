# MeterVerse Experience DNA v2

**The Single Design Authority**  
**Enterprise Utility Operating System**  
**Version**: 2.0  
**Status**: Ratified  

---

## Preamble

This document is the sole design authority for MeterVerse. Every component, every interaction, every animation, every layout must conform to this specification. Nothing is hardcoded. Everything is metadata-driven, registry-driven, SDK-driven, plugin-ready, theme-ready, animation-ready, multilingual, RTL-compatible, keyboard-accessible, virtualized, responsive, and enterprise-grade.

---

# PART 1: VISUAL LANGUAGE

---

## 1.1 Color Philosophy

MeterVerse uses color to communicate system state, data health, and hierarchy — not decoration. Every color has semantic meaning. Every color adapts to light and dark modes automatically via CSS variables.

### Brand Colors (Fixed — Never Change)
```
--brand-primary:    #00BFA5    /* Teal — primary brand identity, active states, primary actions */
--brand-secondary:  #00917A    /* Darker teal — hover states, secondary brand */
--brand-tertiary:   #064E3B    /* Deep pine — sidebar backgrounds, dark panels */
```

### Semantic Colors (Status Communication)
```
--status-success:   #059669    /* Emerald — operational, active, healthy, live */
--status-warning:   #D97706    /* Amber — degraded, caution, attention needed */
--status-error:     #DC2626    /* Red — critical, offline, fault, anomaly */
--status-pending:   #F59E0B    /* Gold — in-progress, awaiting, scheduled */
--status-info:      #3B82F6    /* Blue — informational, system message, neutral */
```

### Energy Data Colors (Utility-Specific)
```
--energy-import:    #F59E0B    /* Amber — imported energy, purchased power */
--energy-export:    #3B82F6    /* Blue — exported energy, sold-back power */
--energy-combined:  #00BFA5    /* Teal — combined/calculated total */
--energy-consumption: #10B981  /* Emerald — actual consumption */
--energy-loss:      #DC2626    /* Red — system losses, theft, anomalies */
```

### Surface Hierarchy (Light Mode Default)
```
--surface-base:      oklch(0.98 0 0)      /* Page background */
--surface-raised:    oklch(1 0 0)         /* Cards, panels, elevated content */
--surface-sunken:    oklch(0.94 0 0)      /* Inputs, search bars, depressed areas */
--surface-topbar:    oklch(1 0 0)         /* Top toolbar background */
--surface-tableHeader: oklch(0.96 0 0)    /* Table header row */
```

### Surface Hierarchy (Dark Mode)
```
--surface-base:      oklch(0.12 0.02 160)
--surface-raised:    oklch(0.16 0.025 160)
--surface-sunken:    oklch(0.10 0.02 160)
--surface-topbar:    oklch(0.14 0.015 160)
--surface-tableHeader: oklch(0.18 0.02 160)
```

### Text Hierarchy
```
--text-primary:      oklch(0 0 0) / oklch(0.93 0 0)       /* Headings, primary content */
--text-secondary:    oklch(0.4 0 0) / oklch(0.65 0 0)     /* Body text */
--text-tertiary:     oklch(0.64 0 0) / oklch(0.45 0 0)    /* Meta, labels, placeholders */
--text-inverse:      oklch(1 0 0)                          /* Text on dark backgrounds */
--text-link:         #00BFA5                                /* Links, clickable text */
```

### Border Hierarchy
```
--border-default:    oklch(0.9 0 0) / oklch(1 0 0 / 10%)
--border-strong:     oklch(0.8 0 0) / oklch(1 0 0 / 15%)
--border-focus:      #00BFA5
--border-input:      oklch(0.85 0 0) / oklch(1 0 0 / 12%)
```

---

## 1.2 Elevation

Elevation communicates hierarchy. Higher elements cast deeper shadows.

| Level | Use Case | Light Shadow | Dark Shadow |
|-------|----------|-------------|-------------|
| 0 | Surface, base | None | None |
| 1 | Cards, panels | `0 1px 3px rgba(0,0,0,0.06)` | `0 1px 3px rgba(0,0,0,0.3)` |
| 2 | Dropdowns, popovers | `0 4px 12px rgba(0,0,0,0.08)` | `0 4px 12px rgba(0,0,0,0.4)` |
| 3 | Modals, dialogs | `0 8px 25px rgba(0,0,0,0.12)` | `0 8px 25px rgba(0,0,0,0.5)` |
| 4 | Toasts, notifications | `0 12px 35px rgba(0,0,0,0.15)` | `0 12px 35px rgba(0,0,0,0.6)` |
| X | Hover state | `0 8px 25px rgba(0,191,165,0.15)` | `0 8px 25px rgba(0,191,165,0.2)` |
| Y | Active glow | `0 0 20px rgba(0,191,165,0.2)` | `0 0 20px rgba(0,191,165,0.3)` |

---

## 1.3 Glass

Glass-morphism is used for floating panels, context panels, and the inspector.

```
--glass-bg:          rgba(255, 255, 255, 0.7)    /* Light mode */
--glass-bg-dark:     oklch(0.16 0.025 160)        /* Dark mode */
--glass-border:      rgba(255, 255, 255, 0.15)
--glass-blur:        12px
--glass-radius:      12px
```

Glass elements must:
- Use `backdrop-filter: blur(var(--glass-blur))`
- Use `-webkit-backdrop-filter: blur(var(--glass-blur))` for Safari
- Have a semi-transparent background
- Have a subtle border (1px, semi-transparent white)
- Not be used for primary content areas (only floating/overlay elements)

---

## 1.4 Lighting

Lighting comes from the top-left (in LTR) or top-right (in RTL). Shadows follow the light source.

- Cards: light from top → bottom shadow heavier
- Dropdowns: light from top → bottom shadow
- Modals: light from center → edge shadow
- Glow: light emanates from the element center → edge glow

---

## 1.5 Borders

| Style | Width | Color | Use |
|-------|-------|-------|-----|
| Default | 1px | `--border-default` | Panel edges, dividers |
| Strong | 1px | `--border-strong` | Active panels, focused sections |
| Input | 1px | `--border-input` | Form fields, search bars |
| Focus | 2px | `--border-focus` | Focus ring on interactive elements |
| Status | 1.5px | Status color | Status-indicated elements |
| Active | 1.5px | Brand color | Selected/highlighted items |
| Snake | 2px | Animated gradient | Active sidebar items, hovered cards |

Border radius scale:
```
--radius-sm:    4px    /* Badges, small indicators */
--radius-md:    8px    /* Buttons, inputs, cards */
--radius-lg:    12px   /* Panels, modals, dropdowns */
--radius-xl:    16px   /* Large containers, dialogs */
--radius-full:  9999px /* Pills, avatars, status dots */
```

---

## 1.6 Spacing

Based on a 4px grid:

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
```

Consistent application:
- Card padding: `--space-4` (16px)
- Panel padding: `--space-5` (20px)
- Section spacing: `--space-6` (24px)
- Page padding: `--space-6` (24px)
- Grid gap: `--space-3` (12px)
- Toolbar height: 44px
- Status bar height: 28px
- Tab bar height: 36px
- Sidebar icon size: 18px
- Minimum touch target: 44px

---

## 1.7 Typography

### Font Family
```
--font-sans:  'Inter', 'Geist', system-ui, -apple-system, sans-serif    /* English */
--font-arabic: 'Cairo', 'Noto Sans Arabic', 'Tajawal', sans-serif        /* Arabic */
--font-mono:  'JetBrains Mono', 'Geist Mono', 'Fira Code', monospace    /* Code, data */
```

The font-family switches automatically based on language:
- English → `--font-sans` (Inter)
- Arabic → `--font-arabic` (Cairo)

### Type Scale
```
--text-xs:   0.75rem  (11px)  — Badges, meta, timestamps
--text-sm:   0.8125rem (13px) — Table cells, form labels, secondary text
--text-base: 0.875rem (14px)  — Body text, buttons, inputs
--text-lg:   1rem     (16px)  — Card titles, section headers
--text-xl:   1.125rem (18px)  — Panel headers, modal titles
--text-2xl:  1.5rem   (24px)  — Page titles
--text-3xl:  1.875rem (30px)  — Dashboard hero numbers
```

### Weight Scale
```
--weight-normal:  400
--weight-medium:  500
--weight-semibold: 600
--weight-bold:    700
```

### Line Height
```
--leading-tight:   1.2    /* Headings */
--leading-normal:  1.5    /* Body text */
--leading-relaxed: 1.75   /* Long-form content */
```

---

## 1.8 Iconography

- **Single icon library**: All icons from `@tabler/icons-react`, re-exported through `src/components/icons.tsx`
- **Never import directly**: Components import `{ Icons } from '@/components/icons'` — never from `@tabler/icons-react`
- **Consistent stroke**: 2px stroke width, `strokeLinecap="round"`, `strokeLinejoin="round"`
- **Size standard**: 15-18px for toolbar/action icons, 20-24px for standalone icons, 32-48px for empty states
- **Semantic naming**: `Icons.search`, `Icons.add`, `Icons.trash` — never `IconSearch`, `IconPlus`
- **Animated icons**: Use `futuristic.rotateIcon` preset for hover-rotate effects on action icons

---

## 1.9 Animation

### Duration Scale
```
--duration-micro:   80ms     /* Feedback, state changes */
--duration-fast:    120ms    /* Hover, focus, tap */
--duration-normal:  200ms    /* Transitions, toggles */
--duration-slow:    300ms    /* Panel open/close, page transitions */
--duration-slower:  500ms    /* Complex animations, staggered entrances */
--duration-glacial: 1000ms   /* Ambient animations, background effects */
```

### Easing Presets
```
--ease-default:     cubic-bezier(0.4, 0, 0.2, 1)
--ease-entrance:    cubic-bezier(0.16, 1, 0.3, 1)   /* Springy entrance */
--ease-exit:        cubic-bezier(0.4, 0, 1, 1)       /* Quick exit */
--ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1) /* Elastic, bouncy */
--ease-emphasized:  cubic-bezier(0.2, 0, 0, 1)       /* Smooth, premium */
```

### Spring Physics
```
--spring-stiff:     stiffness: 400, damping: 15    /* Buttons, small elements */
--spring-normal:    stiffness: 300, damping: 20    /* Cards, panels */
--spring-gentle:    stiffness: 200, damping: 25    /* Large panels, modals */
--spring-elastic:   stiffness: 150, damping: 12    /* Bounce effects */
```

### Animation Presets
All animations must use the centralized `futuristic` presets from `@/design-system/motion.ts`:
- `futuristic.pageEntrance` — fade + slide up + scale + blur on page/tab change
- `futuristic.waveButton` — spring scale + glow on button hover/tap
- `futuristic.glowPulse` — box-shadow pulse for status indicators (3s cycle)
- `futuristic.neonGlow` — multi-layer glow for active elements (2s cycle)
- `futuristic.cardHover` — elevation increase + scale on card hover
- `futuristic.shimmer` — background-position slide for loading skeletons
- `futuristic.staggerList` — children stagger at 50ms intervals
- `futuristic.bounceIn` — spring scale entrance for emphasized elements
- `futuristic.progressGlow` — animated gradient for progress bars
- `futuristic.notificationPulse` — badge/notification dot pulse (1.5s)

---

## 1.10 Motion Philosophy

Motion in MeterVerse serves three purposes:
1. **Feedback**: Confirm user actions (button press → scale, toast slide-in)
2. **Hierarchy**: Show relationships (panel opens → spring animation, modal zooms in)
3. **Status**: Communicate state (pulse = live/active, breathing border = idle/waiting)

Motion must never be purely decorative. Every animation has a purpose. Users can disable animations via `prefers-reduced-motion` media query.

---

## 1.11 Depth

Depth is created through three mechanisms:
1. **Shadow**: Elevation levels (0-4 + hover + active glow)
2. **Z-index stacking**: Base(0) → Surface(1) → Raised(10) → Overlay(100) → Modal(1000) → Toast(1100)
3. **Blur**: Background blur on floating elements creates perceived depth

---

## 1.12 Blur

```
--blur-sm:    4px    /* Subtle glass, hover backgrounds */
--blur-md:    8px    /* Standard glass panels */
--blur-lg:    12px   /* Heavy glass, context panels */
--blur-xl:    16px   /* Maximum blur, modal backdrops */
```

---

## 1.13 Hover

| Element | Hover Effect | Duration |
|---------|-------------|----------|
| Button | Scale 1.02-1.04 + shadow increase | 120ms spring |
| Icon button | Scale 1.1 + color shift | 120ms spring |
| Card | TranslateY(-2px) + shadow increase | 200ms spring |
| Table row | Background highlight | 80ms ease |
| Sidebar item | Background tint + text brighten | 120ms ease |
| Tab | Bottom border slide | 200ms ease |
| Link | Color shift + underline | 200ms ease |
| Chip/tag | Scale 1.02 + shadow | 120ms spring |

---

## 1.14 Focus

- **Visible on all interactive elements**: Custom focus ring using `:focus-visible` pseudo-class
- **Ring style**: 2px solid `--border-focus` (#00BFA5), 2px offset from element
- **Only on keyboard focus**: Mouse clicks do NOT show focus ring (`:focus-visible` behavior)
- **Input fields**: Focus border color shift to `--border-focus` + 1px box-shadow in brand color

---

## 1.15 Selection

- **Text selection**: Brand color background (`rgba(0,191,165,0.2)`), darkens text for readability
- **Table row selection**: Checkbox column + highlighted row background (brand color at 8% opacity)
- **Multi-select**: Shift+click for range, Ctrl/Cmd+click for individual
- **Active nav item**: Brand color tint background + brighter text + right accent bar

---

## 1.16 States

Every interactive element must define these states:

| State | Requirement |
|-------|-------------|
| **Default** | Base styling, no interaction |
| **Hover** | Visual feedback on mouse enter (120ms) |
| **Active/Pressed** | Visual feedback on mousedown (80ms) |
| **Focus** | Keyboard focus indicator (visible only via keyboard nav) |
| **Disabled** | Reduced opacity (0.5), no hover effects, `cursor: not-allowed` |
| **Loading** | Spinner or shimmer, disable interaction |
| **Error** | Red border + error message for inputs, error toast for actions |
| **Success** | Green checkmark or toast for completed actions |
| **Empty** | Friendly illustration + message + CTA for no-data states |

---

## 1.17 Micro Interactions

Micro-interactions are the details that make MeterVerse feel alive:

1. **Sort arrow flip**: Click sort header → arrow rotates 180° (120ms)
2. **Chevron rotate**: Expand/collapse → chevron rotates 90° (200ms)
3. **Tab underline slide**: Active tab underline slides horizontally (200ms spring)
4. **Row expand**: Expandable row content slides down (200ms ease)
5. **Heart-rate pulse**: Status bar at bottom of cards pulses (2.5s cycle)
6. **Snake light**: Active sidebar items have a light crawling along the border (2.5s cycle)
7. **Badge pulse**: Notification badge pulses (1.5s cycle)
8. **Number count-up**: KPI values count from 0 to target (frame-based animation)
9. **Progress fill**: Progress bars animate width/rotation (500ms)
10. **Toast stack**: Toasts stack with slide-in animation, new on top

---

## 1.18 Enterprise Color System

### Admin Platform (Port 7500)
```
--admin-primary:    #EF4444    /* Red — administration brand */
--admin-bg:         #050505    /* Near-black background */
--admin-surface:    #0A0A0A    /* Card/panel background */
--admin-border:     #1A1A1A    /* Border color */
```

### Status Indicator System
```
--dot-live:         #00BFA5    /* Green pulse — connected, active */
--dot-warning:      #D97706    /* Amber pulse — degraded, caution */
--dot-offline:      #DC2626    /* Red — disconnected, error */
--dot-unknown:      #6B7280    /* Gray — status unknown */
```

---

# PART 2: WORKSPACE LANGUAGE

---

## 2.1 Explorer

The Explorer is the primary navigation interface. It displays the full hierarchy of registered apps organized by category.

**Behavior**:
- Categories are collapsible sections
- Each category shows app count badge
- Apps display with first-letter icon, title, optional badge (notification count)
- Active app highlighted with brand accent + snake-light border animation
- Hover on collapsed items shows tooltip with app name
- Keyboard navigation: Arrow keys to move, Enter to open
- Right-click context menu: Pin to favorites, Open in new tab, Copy link

**DNA Rules**:
- All items come from the AppRegistry — NEVER hardcoded
- Categories defined in metadata, not JSX
- Badge counts come from registry metadata (not hardcoded)
- Beta/Experimental tags come from registry status field

---

## 2.2 Workspace

The Workspace is the main content area. It renders the active program (tab content).

**Behavior**:
- Each tab corresponds to a registered program from the AppRegistry
- Tab content is determined by `activeTabId` — renders the matching program
- URL stays at `/` (main system) or `/admin/*` (admin platform) — never changes for navigation
- Programs have lifecycle: mount → activate → render → deactivate → unmount
- State persists across tab switches (tabs keep their state)

**DNA Rules**:
- Content routing by tab ID, not URL
- Program rendering uses registry metadata (title, description, icon)
- All programs share the workspace shell (sidebar + toolbar + tabs + status bar)
- Programs can register their own toolbar actions

---

## 2.3 Context Panel

The Context Panel (Inspector) shows details of the currently selected entity.

**Behavior**:
- Opens from right edge with spring animation (width: 280-512px)
- Entity-type-aware: shows different sections for meters, customers, invoices, etc.
- Sections are plugins registered for entity types
- Each section is collapsible independently
- Header shows entity icon, name, contextual actions
- Resizable: drag left edge to resize

**DNA Rules**:
- Sections are NOT hardcoded — registered via plugin system
- Entity configs in metadata, not JSX
- Plugins have lifecycle hooks
- Third-party plugins can register custom sections

---

## 2.4 Dock

The Dock is the sidebar in its collapsed/minimized state.

**Behavior**:
- Shows only app first-letter icons
- Hover shows tooltip with full name
- Click opens the app (expands sidebar if needed)
- Drag to reorder favorite apps
- Auto-hide mode: sidebar auto-hides, appears on mouse hover to left edge

---

## 2.5 Notification Center

Accessible from the bell icon in the toolbar.

**Behavior**:
- Drawer slides in from right (over content, above inspector)
- Groups notifications by severity: Critical → Warning → Info
- Each notification shows: icon, title, description, timestamp, status
- Click notification → navigates to relevant context
- Mark as read: single or bulk
- Clear all: removes all read notifications
- Badge on bell icon shows unread count with pulse animation

---

## 2.6 Toolbar

The toolbar is the command center of the workspace.

**Layout** (left to right in LTR, right to left in RTL):
1. **Breadcrumb**: Current location path
2. **Global Search**: Smart search bar (center, most prominent)
3. **Quick Actions**: View mode toggle, inspector toggle
4. **System Controls**: Notifications, theme mode, language
5. **Workspace Controls**: Area selector (hidden on mobile)

**DNA Rules**:
- Breadcrumb comes from navigation hierarchy
- Search is always visible, always accessible
- System controls are persistent across all tabs
- Programs can register custom toolbar buttons

---

## 2.7 Status Bar

The status bar shows system-level information at the bottom.

**Layout** (left to right):
1. **Connection status**: Colored dot + "API" label + latency in ms
2. **Version**: MeterVerse version number
3. **Area**: Current active area (October, New Cairo, SODIC)
4. **Language**: Current locale (EN/AR)
5. **Performance**: System health percentage

---

## 2.8 Quick Actions

Floating action button (FAB) for common tasks.

**Behavior**:
- Positioned in the bottom corner of the main content area
- LTR: bottom-right, before inspector
- RTL: bottom-left, after sidebar
- Shows pulse lines animation when idle
- Click reveals action menu (Add Meter, Add Reading, Generate Invoice, etc.)
- Actions are context-aware (different actions for meters vs customers vs invoices)

---

## 2.9 Command Palette

Cmd+K (Mac) / Ctrl+K (Windows/Linux) opens the command palette.

**Features**:
- Fuzzy search across all commands, apps, entities
- Categories: Navigation, Actions, Search, Settings
- Keyboard shortcuts shown for each command
- Recent commands at top
- Search entities by name, code, serial number
- Execute actions directly from palette

---

## 2.10 Floating Windows

Advanced multitasking via window tear-out.

**Behavior**:
- Drag a tab out of the tab bar → opens in new browser window
- Changes in the popped-out window sync back to the main workspace
- Windows can be re-docked back into the workspace
- Window state persists across sessions

---

## 2.11 Inspector

The inspector is the context panel in its collapsed state.

**Behavior**:
- When collapsed, shows a thin bar (12px) on the right edge with a subtle gradient
- Click the bar or hover to expand
- When expanded, shows full context panel with spring animation
- Dbl-click collapse bar to toggle

---

## 2.12 Workspace Tabs

Tabs are the multitasking interface.

**Behavior**:
- Each opened app creates a new tab
- Tabs show: icon, title, close button, dirty indicator (unsaved changes dot)
- Active tab: brand bottom border, elevated background
- Inactive tabs: subdued text, transparent background
- Drag to reorder tabs
- Right-click context menu: Close, Close Others, Close All, Pin, Duplicate
- Pinned tabs cannot be closed (show pin icon)
- Tabs persist across browser sessions (Zustand persist)

---

## 2.13 Pinned Tabs

Pinned tabs are permanent workspace fixtures.

**Behavior**:
- Pinned tabs show a small pin icon
- Cannot be closed (close button hidden)
- Always appear first in the tab bar
- Examples: Welcome, Dashboard, frequently used meters
- Pin/unpin via right-click context menu or drag to pin area

---

## 2.14 Split View

Split the workspace to view two programs side by side.

**Behavior**:
- Drag a tab to the left/right edge → splits the workspace
- Resize the divider between panels
- Each panel has its own tab bar
- Close split → tabs merge back into main tab bar

---

## 2.15 Preview

Hover-preview for entities.

**Behavior**:
- Hover over a meter serial → tooltip shows: status, last reading, location
- Hover over a customer name → tooltip shows: balance, active meters, last invoice
- Hover over an invoice number → tooltip shows: amount, status, date
- Uses Radix HoverCard primitive
- Preview content is entity-type-specific

---

## 2.16 Window Manager

Centralized state management for all workspace windows.

**State**:
- All open tabs and their state
- Tab order, pinned status, dirty flag
- Split view configuration
- Popped-out window handles
- Layout presets (saved/loaded configurations)

**DNA Rules**:
- Managed by Zustand store with persist middleware
- Tabs are serializable (can be saved/restored)
- Layout presets are JSON-serializable

---

# PART 3: ENTERPRISE COMPONENTS

---

## 3.1 Tables

Tables are the primary data display mechanism.

**Features**:
- Powered by TanStack Table (headless)
- Column visibility toggle
- Sortable columns (single and multi-column)
- Column-based filters (text, dropdown, date range, numeric range)
- Server-side pagination (25/50/100 rows per page)
- Row selection with checkbox column
- Bulk action bar appears when rows selected
- Inline sparkline charts in cells (trend indicators)
- Status badges in status columns
- Export to CSV/Excel/PDF
- Row action dropdown menu
- Row hover highlight
- Striped rows for readability
- Column resize (drag column edges)
- Column reorder (drag columns)

**DNA Rules**:
- Column definitions come from metadata (not hardcoded in JSX)
- Filter options come from metadata
- Sort state persists in URL search params (sharable URLs)

---

## 3.2 Forms

Forms are data input interfaces.

**Features**:
- Powered by React Hook Form + Zod validation
- Field types: text, email, number, password, select, multi-select, date, date-range, switch, checkbox, radio, textarea, file-upload
- Inline validation with error messages below fields
- Dependent fields (show/hide based on other field values)
- Dynamic form sections (add/remove repeated sections)
- Submit button shows loading state during submission
- Success/error toasts after submission
- Keyboard navigation: Tab between fields, Enter to submit

**DNA Rules**:
- Field definitions come from metadata (schema-driven forms)
- Validation rules from Zod schema
- Form layout from metadata (single column, two column, inline)

---

## 3.3 Charts

Charts visualize energy data.

**Supported types**:
- **Line chart**: Time-series consumption, import/export trends, combined energy
- **Area chart**: Cumulative consumption with gradient fill
- **Bar chart**: Period comparison (this month vs last month)
- **Doughnut chart**: Energy mix distribution, status distribution
- **Radial gauge**: Per-meter load percentage (circular progress)
- **Composed chart**: Line + bar combined (consumption vs target)
- **Sparkline**: Mini trend chart inside table cells and cards

**Energy-specific colors**:
- Import: `--energy-import` (#F59E0B)
- Export: `--energy-export` (#3B82F6)
- Combined: `--energy-combined` (#00BFA5)
- Consumption: `--energy-consumption` (#10B981)

**Features**:
- Interactive tooltips (value, timestamp, status on hover)
- Zoom and pan for time-series charts
- Legend toggle (show/hide series)
- Download as image (PNG/SVG)
- Responsive (resize with container)
- Loading skeleton while data loads
- Empty state when no data
- Error state with retry

---

## 3.4 Cards

Cards are used in grid view for entity display.

**Layout**:
- Grid: 3 columns × 5 rows = 15 cards per page
- Each card = one entity
- Cards animate in with stagger (50ms delay per card)

**Card anatomy**:
1. **Header**: Entity icon (first letter in colored circle) + title + status badge
2. **Body**: 2-column key-value grid showing entity properties
3. **Footer**: Status bar with heart-rate pulse animation (color matches entity status)
4. **Border**: Left accent or full border colored by status

**States**:
- Default: glass-morphism background, subtle shadow
- Hover: elevation increase, slight scale, border glow
- Active: selected state with brand border
- Loading: shimmer skeleton

---

## 3.5 Widgets

Widgets are mini-dashboard components.

**Types**:
- **KPI Widget**: Large number + label + trend arrow + sparkline
- **Status Widget**: Colored dot + status label + count
- **Alert Widget**: Recent alerts list with severity indicators
- **Quick Action Widget**: Icon + label + click action
- **Progress Widget**: Radial gauge + label + percentage
- **Timeline Widget**: Chronological event list with dots
- **Mini Chart Widget**: Small chart with minimal chrome

---

## 3.6 Dialogs

Dialogs are modal overlays for focused tasks.

**Types**:
- **Confirm Dialog**: Action confirmation (Delete, Cancel, Submit)
- **Form Dialog**: Data entry in a modal
- **Alert Dialog**: Important information with acknowledgment
- **Preview Dialog**: Entity preview with details

**Behavior**:
- Opens with scale + fade animation (200ms spring)
- Closes with fade animation (120ms)
- Backdrop click to close (configurable)
- Escape key to close
- Focus trapped inside dialog while open
- Scrollable if content exceeds viewport
- Responsive: full-screen on mobile

---

## 3.7 Dropdowns

Dropdowns present a list of options.

**Types**:
- **Select Dropdown**: Single selection from list
- **Multi-Select Dropdown**: Multiple selections with checkboxes
- **Action Dropdown**: List of actions (with icons)
- **Menu Dropdown**: Nested menu items

**Behavior**:
- Opens with fade + slide animation (120ms)
- Collision-aware: auto-adjusts to viewport boundaries
- Keyboard navigation: Arrow keys, Enter to select, Escape to close
- Click outside to close

---

## 3.8 Selectors

Selectors are compact dropdowns for filtering and choosing.

**Types**:
- **Single Select**: One option at a time
- **Multi-Select**: Multiple options with tag display
- **Searchable Select**: Type to filter options
- **Async Select**: Load options from API on type
- **Date Select**: Calendar picker for single date
- **Date Range Select**: Two calendars for start/end date
- **Color Select**: Color swatches for status/theme selection

---

## 3.9 Data Grid

The data grid is the enterprise-grade table.

**Features**:
- Virtual scrolling for 100K+ rows
- Server-side sorting, filtering, pagination
- Column grouping (e.g., Address → Street + City + Zip)
- Row grouping (e.g., group meters by area)
- Aggregated footer rows (totals, averages)
- Inline cell editing
- Row expansion (show details below row)
- Context menu on right-click
- Drag-and-drop rows for reordering

---

## 3.10 Tree

The tree component shows hierarchical data.

**Use cases**:
- Area → Zone → Building → Floor → Unit → Meter hierarchy
- Organization chart
- Permission tree (roles → permissions)
- Category tree (app registry categories → apps)

**Features**:
- Expand/collapse with chevron animation
- Lazy loading (load children on expand)
- Multi-select with keyboard
- Drag-and-drop to reorganize
- Search within tree (filter visible nodes)
- Context menu on right-click

---

## 3.11 Timeline

The timeline shows chronological events.

**Use cases**:
- Meter event history (installed, assigned, read, maintained, replaced)
- Invoice timeline (generated, issued, paid, reversed)
- Customer activity log
- System audit trail

**Features**:
- Vertical timeline with dots for each event
- Color-coded dots by event type
- Click event → show details in context panel
- Scrollable with "jump to date" navigation
- Loading skeleton while data loads
- Empty state: "No events recorded"

---

## 3.12 Logs

The log viewer shows system and audit logs.

**Features**:
- Real-time log stream (WebSocket)
- Filter by: level (error/warning/info/debug), source, time range
- Search within logs (full-text)
- Severity color coding
- Expand/collapse log details
- Export to CSV/JSON
- Auto-scroll: follow new logs (configurable)
- Pause auto-scroll to examine specific logs
- Log level count badges

---

## 3.13 Metrics

Metrics display system and business KPIs.

**Features**:
- Count-up animation on load
- Trend arrows (up/down/flat) with color
- Sparkline mini-chart below value
- Comparison to previous period (percentage)
- Status indicator (on-track, at-risk, behind)
- Responsive grid layout
- Skeleton loading state

---

## 3.14 Maps

Maps show geographic meter locations.

**Features**:
- MapLibre GL or Leaflet-based (open-source, no API key)
- Meter markers with status-colored pins
- Cluster markers for dense areas
- Click pin → show meter details
- Click cluster → zoom to show individual pins
- Layer toggle (show/hide meter types)
- Search to fly to location
- Dark mode map style

---

## 3.15 Monitoring

Monitoring dashboards show system health.

**Features**:
- Service grid: each service shows name, status, latency
- Status: Live (green), Degraded (amber), Down (red)
- Latency sparkline (last 5 minutes)
- Uptime percentage
- Alert count badge
- CPU/Memory/Disk usage gauges
- Queue depth chart
- Error rate trend

---

## 3.16 Heatmaps

Heatmaps show data density across dimensions.

**Use cases**:
- Consumption by hour of day × day of week
- Anomaly concentration by area × meter type
- Reading frequency by location

**Features**:
- Color intensity scales with value
- Tooltip shows exact values on hover
- Responsive to container size
- Export as image

---

## 3.17 Network Graphs

Network graphs show relationships between entities.

**Use cases**:
- Meter network topology (parent meter → child meters)
- Customer → meters → invoices relationship
- System service dependencies

**Features**:
- Force-directed layout
- Node coloring by type/status
- Edge labeling
- Zoom and pan
- Click node → show details in context panel
- Drag node to reposition

---

## 3.18 Gauge

Gauges show single metrics within a range.

**Use cases**:
- Meter load (0-100%)
- Storage capacity
- Bandwidth usage
- Budget utilization

**Features**:
- Radial (circular) gauge
- Arc fill animates from 0 to target
- Color zones: green (0-70%), amber (70-90%), red (90-100%)
- Center label shows current value
- Label below shows metric name

---

## 3.19 Trend

Trend indicators show direction and magnitude of change.

**Features**:
- Arrow direction: up (positive), down (negative), flat (neutral)
- Color: green (improvement), red (decline), gray (no change)
- Percentage change value
- Sparkline mini-chart for context
- Optional comparison period label

---

## 3.20 Financial Charts

Financial charts for billing and revenue.

**Types**:
- **Revenue line chart**: Daily/weekly/monthly revenue over time
- **Collection rate bar chart**: Invoiced vs collected
- **Aging bar chart**: Outstanding by aging bucket (0-30, 31-60, 61-90, 90+)
- **Payment method doughnut**: Distribution by payment method
- **Revenue composition stacked bar**: Revenue by meter type/area

---

## 3.21 Energy Charts

Energy-specific charts for utility data.

**Types**:
- **Combined energy line chart**: Import + Export = Combined (stacked or separate lines)
- **Consumption area chart**: Consumption with gradient fill
- **Import/Export comparison**: Side-by-side or overlaid bars
- **Load profile**: 24-hour load curve with min/max/average bands
- **Energy flow diagram**: Animated SVG showing import → export → combined flow
- **Meter comparison**: Multi-line chart comparing multiple meters
- **Threshold violation**: Chart highlighting periods exceeding thresholds

---

## 3.22 IoT Charts

IoT device charts for telemetry data.

**Types**:
- **Signal strength gauge**: SIM card signal quality
- **Battery level chart**: Device battery over time
- **Communication frequency**: Message count over time
- **Last communication timeline**: When each device last reported
- **Firmware version distribution**: Doughnut chart of firmware versions
- **Error rate by device**: Scatter plot of error occurrences

---

# PART 4: ENTERPRISE RULES

---

## 4.1 Nothing Hardcoded

- No inline strings — all text through translation system
- No inline colors — all through CSS variables
- No inline spacing — all through spacing scale
- No hardcoded navigation — all from AppRegistry
- No hardcoded columns — all from metadata
- No hardcoded entity configs — all from plugin registry

## 4.2 Everything Metadata-Driven

- App metadata in registry (title, description, icon, category, route)
- Table column definitions in metadata (id, label, sortable, filterable, width)
- Form field definitions in metadata (type, validation, options)
- Entity configs in metadata (sections, properties, actions)
- Chart configurations in metadata (type, series, axes, colors)

## 4.3 Everything Registry-Driven

- AppRegistry: all registered apps
- NavigationRegistry: registered navigation items
- PermissionRegistry: registered permissions
- PluginRegistry: registered plugins
- ThemeRegistry: registered themes
- EntityRegistry: registered entity types

## 4.4 Everything SDK-Driven

- Plugin SDK for context panel sections
- Component SDK for custom workspace programs
- Theme SDK for custom themes
- Entity SDK for custom entity types
- Action SDK for custom toolbar actions

## 4.5 Everything Plugin-Ready

- Context panel sections are plugins
- Toolbar actions can be registered by plugins
- Dashboard widgets can be registered by plugins
- Custom entity types can be registered by plugins
- Custom chart types can be registered by plugins

## 4.6 Everything Theme-Ready

- All colors via CSS variables (not hardcoded values)
- Themes define CSS variable sets
- Light and dark variants per theme
- 10+ themes available, any can be default
- New themes can be added via CSS file + registry entry

## 4.7 Everything Animation-Ready

- All animations via centralized motion tokens
- Duration, easing, spring physics in one file
- Preset variants for common animations
- `prefers-reduced-motion` respected
- Animations can be disabled globally

## 4.8 Everything Multilingual

- All user-facing text via translation keys
- Translation files per locale (en.json, ar.json)
- Translation hook with synchronous loading
- Fallback to English if key missing
- Locale switching without page reload

## 4.9 Everything RTL

- All layouts mirror in RTL mode
- CSS logical properties preferred (margin-inline-start over margin-left)
- Transform animations reverse in RTL (slide-in-right becomes slide-in-left)
- Icons flip horizontally in RTL if directional
- Text alignment respects dir attribute

## 4.10 Everything Keyboard Accessible

- All interactive elements focusable and operable via keyboard
- Tab order follows visual order
- Arrow keys for list navigation
- Enter/Space to activate
- Escape to close/dismiss
- Custom keyboard shortcuts documented and consistent

## 4.11 Everything Virtualized

- Tables with >100 rows use virtual scrolling
- Lists with >50 items use virtual scrolling
- Dropdowns with >20 options use virtual scrolling
- Trees with >100 nodes use virtual scrolling
- Charts with >1000 data points use data decimation

## 4.12 Everything Responsive

- Mobile-first breakpoints: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
- Sidebar collapses to dock on tablet
- Inspector hides on mobile (slide-up panel instead)
- Tables horizontal scroll on narrow viewports
- Charts resize with container
- Fonts scale with viewport

## 4.13 Everything Enterprise

- Role-based access control (7 roles)
- Multi-tenancy (area isolation)
- Audit trail (append-only, integrity-verified)
- Idempotency (duplicate prevention)
- Rate limiting (configurable per route)
- Correlation IDs (cross-service tracing)
- Structured logging (JSON, pino)
- Health checks (deep, dependency-aware)
- Graceful shutdown (in-flight requests)
- Disaster recovery (backups, rollback plans)

---

*End of MeterVerse Experience DNA v2*  
*This document is the sole design authority. All development must conform.*
