# METERVERSE DNA v2 — Enterprise Utility Operating System Architecture

**Phase**: Research & Evolution  
**Status**: Architecture Documentation  
**Previous**: Phase 15 Complete  
**Target**: World's Best Enterprise Utility Operating System  

---

## PART 1: REFERENCE DEEP ANALYSIS

---

### Reference #1: Abady001/Meter- (Our Canonical Repo)
**Score**: 98/100

**What is Excellent**: Complete NestJS+Next.js monorepo with 14 security controls, 293 tests, knowledge graph (3105 nodes), CI/CD pipeline, branch protection. This IS our baseline architecture.

**What is Good**: Prisma ORM with 4 PostgreSQL schemas (sim_system, core, features, area), 45 controllers, 150+ API endpoints, Swagger docs.

**What is Average**: The frontend is functional but lacks the futuristic polish. Tabs system works but content routing is basic. No virtualization for large datasets.

**What is Bad**: Hardcoded sidebar items (6 items only). No Arabic/RTL implementation in UI. No dark mode. Static dashboard with no real-time data.

**What should NEVER be used**: The old V2 destructive trigger pattern (DeviceSumConfig). Old hardcoded navigation.

**Enterprise ideas worth extracting**: Multi-schema tenant isolation (sim_system/core/features/area), 7 RBAC roles, append-only audit logs, idempotency keys, rate limiting (100 req/min), security audit log.

**Architecture ideas worth extracting**: Module-per-domain (meters, customers, readings, billing), Prisma migrations with CI validation, OpenAPI spec generation, correlation ID tracing.

**How MeterVerse can evolve beyond it**: Add real-time WebSocket for live meter readings, AI-powered anomaly detection, predictive billing, self-healing architecture.

---

### Reference #2: Kirllos360/Meter (Production Deployment)
**Score**: 91/100

**What is Excellent**: JasperReports 7.0.1 integration for PDF/Excel/DOCX/HTML/CSV with AES-256 encryption, digital signatures, watermarking. RabbitMQ bulk processing. Arabic/RTL rendering with ICU4J.

**What is Good**: Release workflow (develop → release → staging → main → tag → Docker → production), semantic versioning, CODEOWNERS.

**What is Average**: 168 unit tests for reporting engine — good coverage but not exhaustive.

**What is Bad**: Legacy Puppeteer HTML→PDF path (deprecated). Single-threaded report generation (replaced by RabbitMQ bulk).

**Enterprise ideas worth extracting**: AES-256 PDF encryption, digital signatures with PKCS12, watermarking for draft/confidential docs, audit logging for PDF operations, concurrent consumer processing (5 workers).

**Architecture ideas worth extracting**: Queue-based bulk processing pattern, template versioning with Git history, template rollback, font extension for Arabic rendering.

**How MeterVerse can evolve beyond it**: Add real-time bill generation streaming, AI-enhanced template design, customer portal self-service report generation.

---

### Reference #3: Lindgo Futuristic Fintech Dashboard (Figma)
**Score**: 88/100

**What is Excellent**: Neon accent colors (cyan/magenta) on dark backgrounds, glass-morphism sidebar with frosted glass active states, KPI cards with animated count-up numbers, sparkline charts inline in table rows.

**What is Good**: Transaction feed with icon+amount+status badges, consistent dark theme, data density for screens with many metrics.

**What is Average**: Layout is fintech-specific (transactions, wallets) not energy-specific.

**Enterprise ideas worth extracting**: Animated KPI counters (count-up on page load), status badge system (success/warning/error with icons), sparkline-in-table for trend visualization.

**Visual ideas worth extracting**: Neon glow on active/hover states, glass-morphism for sidebars and panels, gradient accents (not flat colors).

**Motion ideas worth extracting**: Count-up animation for numbers (spring physics), staggered card entrance, shimmer loading for skeleton states.

**How MeterVerse can evolve beyond it**: Combine the fintech polish with energy-specific data. Add animated energy flow lines between sources.

---

### Reference #4: Energy Management System Dashboard (Figma)
**Score**: 95/100

**What is Excellent**: Real-time energy flow visualization (animated SVG lines between grid→meter→house icons), circular radial gauges for load percentage, multi-tab meter comparison, time-series consumption chart with area fill.

**What is Good**: Alert feed with severity indicators (red/orange/yellow), status dot system, clean data tables.

**Enterprise ideas worth extracting**: Energy flow animation for combined (import+export) channel visualization, radial gauges for per-meter load display, multi-tab comparison for area-by-area energy overview.

**Visual ideas worth extracting**: Time-series area chart (gradient fill from line to bottom), color-coded import(amber)/export(blue)/combined(green), pulsing status indicators for live meters.

**How MeterVerse can evolve beyond it**: Add predictive energy forecasting line (dashed), anomaly highlight zones on charts, threshold violation markers.

---

### Reference #5: Smart Energy Management System (Figma)
**Score**: 93/100

**What is Excellent**: Hierarchical area→zone→meter drill-down navigation, SDG (Sustainable Development Goals) color palette, split-view comparison panels, PDF report preview within dashboard.

**What is Good**: Status indicator system (Live green pulse, Warning amber, Offline red), breadcrumb navigation for drill-down path.

**Enterprise ideas worth extracting**: Hierarchical navigation for multi-area (October→Zone A→Meter 123), split-view comparison for import vs export, report preview with download.

**Visual ideas worth extracting**: SDG greens/blues for energy branding, breadcrumb with clickable ancestors, status indicators with animation.

**How MeterVerse can evolve beyond it**: Add 3D building visualization with meter locations, heat map overlay for consumption density.

---

### Reference #6: Ant Design Pro
**Score**: 87/100

**What is Excellent**: ProTable with built-in search, filters, export, column customization. ProLayout with sidebar+header+breadcrumb. Statistic component with animated counters. Watermark for security. Tour for onboarding.

**What is Good**: Consistent component API, TypeScript support, internationalization (i18n) built-in.

**Enterprise ideas worth extracting**: Table with server-side sorting/filtering/pagination, tour/onboarding system, watermark for production environments, advanced form patterns (dynamic form items, dependent fields).

**Architecture ideas worth extracting**: Layout management pattern (ProLayout handles sidebar/header/content simultaneously), table state management (filters, sort, page in URL).

**How MeterVerse can evolve beyond it**: Add Ant Design's tour system for new user onboarding. Add watermark for staging environment identification.

---

### Reference #7: shadcn/ui + Radix UI
**Score**: 97/100

**What is Excellent**: Copy-paste component model (components are YOUR code), 65+ components built on Radix UI primitives, Data Table (TanStack Table), Chart (Recharts), Sidebar, Command Palette (cmdk), Sonner (toast), Resizable panels.

**What is Good**: Accessible (WAI-ARIA), keyboard navigation, RTL support, collision-aware positioning.

**Enterprise ideas worth extracting**: Data Table for meter readings/customers/invoices, Command Palette for instant search, Sidebar for app navigation, Resizable panels for workspace customization.

**Architecture ideas worth extracting**: Composition pattern (Root→Trigger→Portal→Overlay→Content), headless+styling separation, data attributes for CSS targeting.

**How MeterVerse can evolve beyond it**: We already use shadcn/ui. Add Chart component for energy visualization (not yet installed). Add Resizable panels for workspace.

---

### Reference #8: Mantine
**Score**: 86/100

**What is Excellent**: 100+ components, 80+ hooks, Spotlight (Cmd+K), Notifications system, Charts (Recharts wrapper), built-in dark mode.

**What is Good**: Hooks library (use-form, use-local-storage, use-media-query, use-intersection), comprehensive documentation, TypeScript.

**Enterprise ideas worth extracting**: Spotlight for meter/area/customer search, Notifications for billing alerts, use-form for reading entry forms, use-media-query for responsive breakpoints.

**How MeterVerse can evolve beyond it**: Add Mantine's hooks pattern for our UI state management. Use Spotlight pattern for global meter search.

---

### Reference #9: daisyUI
**Score**: 82/100

**What is Excellent**: 68 pure CSS components, Stat (KPI display), Radial Progress (circular gauge), Diff (comparison slider), Theme Controller (one-checkbox theme switch), Steps (progress stepper), Aura (border glow).

**What is Good**: Zero JS required for basic components, Tailwind-based, theme system.

**Enterprise ideas worth extracting**: Radial Progress for meter load visualization, Steps for billing workflow (invoice generation pipeline), Diff for import/export comparison.

**How MeterVerse can evolve beyond it**: Use daisyUI component CSS patterns (especially Stat and Radial Progress) adapted to our design system.

---

### Reference #10: MUI X / MUI
**Score**: 85/100

**What is Excellent**: MUI X Data Grid with server-side sorting, filtering, virtualization, tree data, export. Theme system with CSS variables, dark/light mode. Date picker with localization.

**What is Good**: Comprehensive component library, accessibility, documentation.

**Enterprise ideas worth extracting**: Virtualized data grid for large reading datasets (100K+ rows), tree data for area→zone→meter hierarchy, theme token system.

**How MeterVerse can evolve beyond it**: Use MUI Data Grid pattern (not the library, the architecture) for our meter reading tables.

---

### Reference #11: PrimeReact
**Score**: 80/100

**What is Excellent**: TreeTable for hierarchical data, DataTable with virtual scrolling, FileUpload with progress, Gantt chart for scheduling, 90+ components.

**What is Good**: Chart.js integration, theme system, TypeScript support.

**Enterprise ideas worth extracting**: TreeTable for area→zone→meter drill-down, FileUpload for CSV reading import with progress, Timeline for activity/event log.

**How MeterVerse can evolve beyond it**: Use TreeTable pattern (not the library) for hierarchical meter navigation.

---

### Reference #12: TanStack Table + Recharts
**Score**: 94/100

**What is Excellent**: TanStack Table = headless table with infinite possibilities (sorting, filtering, pagination, row selection, column ordering, virtualization, grouping). Recharts = declarative charting with React (line, bar, area, pie, radar, scatter, compose).

**What is Good**: Both are framework-agnostic, TypeScript-first, well-documented.

**Enterprise ideas worth extracting**: Server-side pagination for large datasets, column visibility controls, row selection for bulk actions, composed charts (line+bar combo for consumption+target).

**How MeterVerse can evolve beyond it**: We already use TanStack Query. Add TanStack Table for every data grid. Add Recharts for every chart.

---

### Reference #13: React Aria (Adobe)
**Score**: 88/100

**What is Excellent**: 50+ headless accessible components, composable pattern (DatePicker→Label→Group→DateInput→DateSegment→Button→Popover→Dialog→Calendar), style-free architecture, data attributes for CSS targeting.

**What is Good**: WAI-ARIA compliant, keyboard navigation, screen reader tested.

**Enterprise ideas worth extracting**: Date picker for reading date range, ComboBox for area/meter search, Table with keyboard multi-select, Slider for threshold configuration.

**Architecture ideas worth extracting**: Data-attribute-based styling (`[data-pressed]`, `[data-selected]`), composable component API.

**How MeterVerse can evolve beyond it**: Use React Aria patterns for complex form inputs (date range picking for billing periods).

---

### References #14-23: Figma .make Files (Local)
**Score**: 76/100 (collectively)

**What is Excellent**: Button systems, form controls, data tables, navigation patterns from multiple Figma community files. Lindgo fintech + Energy Management + Enterprise OS + Icon sets (Enapter, Iconly, Material-X).

**What is Good**: Icon sets (Energy Icons, Iconly Pro) are directly usable. Enterprise Utility Operating System .make file is our own design system.

**Enterprise ideas worth extracting**: Icon set organization (category-based, consistent stroke width), enterprise OS component hierarchy.

**How MeterVerse can evolve beyond it**: Import icon sets into our Figma workspace. Use the Energy Icon Set for meter type indicators.

---

### Reference #24: Tailwind CSS Plus / Catalyst
**Score**: 84/100

**What is Excellent**: 500+ UI blocks, Catalyst UI Kit (Button, Input, Table, Sidebar, Badge, Pagination, Combobox, Switch, Listbox, Description List), dark mode variants for every component.

**What is Good**: Mobile-first responsive patterns, production-ready code.

**Enterprise ideas worth extracting**: Combobox for meter/area search with keyboard navigation, Pagination for large data sets, Description List for meter details display.

**How MeterVerse can evolve beyond it**: Use Catalyst's pattern for Combobox (searchable dropdown for meter selection).

---

### Reference #25: Radix UI Primitives
**Score**: 95/100

**What is Excellent**: Core primitives (Accordion, Dialog, Dropdown Menu, Popover, Slider, Tabs, Tooltip, Scroll Area, Toggle Group, Switch, Select, Context Menu, Hover Card), collision-aware positioning, WAI-ARIA compliant.

**What is Good**: Unstyled by design, used by Vercel/Supabase/Linear/CodeSandbox.

**Enterprise ideas worth extracting**: Dialog for all modals, Dropdown Menu for row actions, Tabs for multi-view meter details, Tooltip for status explanations.

**Architecture ideas worth extracting**: Composition over configuration, context-based state management, portal-based overlays.

**How MeterVerse can evolve beyond it**: We already use Radix through shadcn. Add Hover Card for meter preview on hover.

---

### Reference #26: cmdk (Command Palette)
**Score**: 89/100

**What is Excellent**: Fast fuzzy search command palette, keyboard-first navigation, groups and separators, loading state, empty state, custom filtering.

**What is Good**: Small bundle size, React/Next.js compatible, accessible.

**Enterprise ideas worth extracting**: Cmd+K for instant meter/area/customer search, search across multiple entities (meters, customers, invoices, readings), keyboard shortcuts for frequent actions.

**How MeterVerse can evolve beyond it**: Add meter-specific commands ("assign meter", "add reading", "generate invoice"), area switching with fuzzy search.

---

### Reference #27: Sonner / react-hot-toast
**Score**: 83/100

**What is Excellent**: Lightweight toast notifications, auto-dismiss, swipe to dismiss, multiple positions, promise handling (loading→success/error), dark mode.

**What is Good**: Accessible (role="status"), keyboard dismiss, stacked toasts.

**Enterprise ideas worth extracting**: Promise toast for async billing operations (show loading during invoice generation, then success/error), stacked notifications for bulk operations.

**How MeterVerse can evolve beyond it**: Add grouped notifications (e.g., "12 meters updated successfully"), persistent notifications for long-running jobs.

---

### Reference #28: react-joyride (Onboarding Tours)
**Score**: 78/100

**What is Excellent**: Step-by-step guided tours, spotlight on target elements, tooltip with navigation controls, multiple beacon styles, keyboard navigation.

**What is Good**: Supports React 18+ and Next.js, customizable theme.

**Enterprise ideas worth extracting**: First-use onboarding for new dashboard users, feature announcement tours for new billing modules.

**How MeterVerse can evolve beyond it**: Add contextual help (question mark icon → popover with explanation for each metric).

---

### Reference #29: react-pdf
**Score**: 75/100

**What is Excellent**: Display PDFs in React apps, page navigation, zoom controls, text layer for selection, annotations.

**What is Good**: Client-side rendering, no server needed, good performance.

**Enterprise ideas worth extracting**: Inline invoice PDF preview in billing section, meter reading report preview.

**How MeterVerse can evolve beyond it**: Add annotation support for invoice review (approve/reject with comments on specific line items).

---

### Reference #30: AG Grid
**Score**: 91/100

**What is Excellent**: Enterprise data grid with virtualization (handles millions of rows), server-side row model, cell editing, custom cell renderers, charting integration, export to CSV/Excel, row grouping, aggregation.

**What is Good**: React integration, TypeScript, accessibility, theming.

**Enterprise ideas worth extracting**: Virtual scrolling for large reading datasets (100K+), server-side sorting/filtering/grouping, aggregated footer rows for billing totals.

**How MeterVerse can evolve beyond it**: AG Grid is the gold standard for enterprise data grids. Use its architectural patterns (virtualization + server-side data) even if we use TanStack Table.

---

### References #31-59: Additional Libraries (Collective Score)
**Score**: 70/100 (aggregate)

**Key Extractions**:
- React Hook Form + Zod → Form validation for all MeterVerse forms
- react-dropzone → CSV file upload for bulk readings
- recharts → Energy consumption charts
- react-markdown → Documentation/help pages
- react-loadable → Code splitting for heavy pages

---

## PART 2: REFERENCE RANKINGS

### Tier S++ (Essential — Must Integrate)
| Rank | Reference | Score | Reason |
|------|-----------|-------|--------|
| 1 | shadcn/ui + Radix UI | 97 | Our foundation. Data Table, Chart, Command, Sidebar |
| 2 | Energy Management Figma | 95 | Energy flow, radial gauges, alert feed |
| 3 | TanStack Table + Recharts | 94 | Universal data grid + charting |
| 4 | Smart Energy Figma | 93 | Hierarchical drill-down, status indicators |
| 5 | Abady001/Meter- | 98 | Our canonical codebase |
| 6 | AG Grid | 91 | Gold standard for enterprise data grids |

### Tier S+ (Highly Recommended)
| Rank | Reference | Score | Reason |
|------|-----------|-------|--------|
| 7 | Kirllos360/Meter | 91 | JasperReports, RabbitMQ, deployment |
| 8 | Lindgo Fintech Figma | 88 | Animated KPI, glass-morphism, sparklines |
| 9 | React Aria (Adobe) | 88 | Accessible date picker, combobox, table |
| 10 | Ant Design Pro | 87 | ProTable, ProLayout, Tour, Watermark |

### Tier S (Recommended)
| Rank | Reference | Score | Reason |
|------|-----------|-------|--------|
| 11 | Mantine | 86 | Spotlight, hooks, notifications |
| 12 | MUI X / MUI | 85 | Data grid virtualization, theme system |
| 13 | Tailwind Plus/Catalyst | 84 | UI blocks, Combobox, Pagination |
| 14 | Sonner/Toast | 83 | Promise toasts for billing |
| 15 | daisyUI | 82 | Radial Progress, Steps, Stat |

### Tier A (Good to Know)
| Rank | Reference | Score | Reason |
|------|-----------|-------|--------|
| 16 | PrimeReact | 80 | TreeTable, FileUpload, Timeline |
| 17 | cmdk | 89 | Command palette for meter search |
| 18 | react-joyride | 78 | Onboarding tours |
| 19 | Figma .make files | 76 | Icon sets, design tokens |

### Tier B (Reference Only)
| Rank | Reference | Score | Reason |
|------|-----------|-------|--------|
| 20 | react-pdf | 75 | Invoice preview |
| 21 | react-dropzone | 74 | CSV upload |

### Tier C (Skip)
| Rank | Reference | Score | Reason |
|------|-----------|-------|--------|
| 22 | React Bootstrap | 60 | Outdated (Bootstrap 5, not Tailwind) |
| 23 | react-native-ui-lib | 50 | React Native only |

---

## PART 3: METERVERSE DNA v2 — Complete Design System

---

### NAVIGATION DNA

1. **Sidebar-as-OS**: The sidebar is not a menu — it's the primary operating system shell. Every app in the registry is a "program" that can be launched, not a "page" to navigate to.
2. **Category-first browsing**: Navigation is organized by domain category (Executive, CRM, Billing, Meters, Readings, Operations, Finance, Reports, Monitoring, IoT, Admin, Security, AI, Settings, Developer). Each category is a "program group."
3. **Hierarchical drill-down**: Multi-area → Zone → Building → Floor → Unit → Meter. Each level filters the next. Breadcrumb shows the path.
4. **Favorites + Recent + Pinned**: Users pin frequently used meters/areas. Recent tracks navigation history. Favorites are cross-session.
5. **Keyboard-first**: All navigation items have keyboard shortcuts. `G + C` = go to customers, `G + M` = go to meters.
6. **Command palette as primary navigation**: Cmd+K is faster than clicking. The command palette searches across ALL registry items, commands, and recently accessed entities.
7. **Tab-based multitasking**: Each "program" opens in a tab. Tabs persist across sessions. Users can have multiple contexts open simultaneously.

### EXPLORER DNA

1. **Tree explorer**: Hierarchical file-system-like explorer for areas → zones → buildings → floors → units → meters.
2. **Context-aware**: Right-click on any node shows actions (Add Meter, Assign Customer, View Readings, Generate Invoice).
3. **Search-within-explorer**: Type to filter the tree. Fuzzy match on names, codes, serial numbers.
4. **Multi-select**: Shift+click for range, Ctrl+click for individual. Bulk operations on selected nodes.
5. **Drag-and-drop**: Move meters between units, reassign customers, reorganize zones.
6. **Visual density**: Compact mode for power users, comfortable mode for managers.

### WORKSPACE DNA

1. **Programs, not pages**: Every registered app is a "program" that runs in a workspace tab. Programs have lifecycle (launch, run, suspend, close).
2. **Persistent sessions**: Tabs, their state, and their scroll position persist across browser sessions (Zustand persist middleware).
3. **Multi-window**: Programs can be torn out of tabs into separate windows (Popout pattern).
4. **Layout presets**: Users save/load workspace layouts (e.g., "Billing Focus" = open invoices + payments + reports tabs).
5. **Context-aware toolbar**: The toolbar changes contextually based on the active program. Reading toolbar shows reading-specific actions.
6. **Universal search bar**: Always visible in toolbar. Searches across programs, entities, commands, and help docs.

### CONTEXT PANEL DNA

1. **Inspector, not sidebar**: The right panel is an "inspector" that shows details of the selected entity, NOT another navigation panel.
2. **Entity-type-aware**: When a meter is selected, the inspector shows meter properties, readings, history, invoices. When a customer is selected, it shows customer details, assigned meters, balance, statements.
3. **Plugin-based sections**: Each section in the inspector is a plugin that registers for entity types. Third-party plugins can add sections.
4. **Collapsible sections**: Properties, Readings, History, Invoices — each section can be collapsed/expanded independently.
5. **Inline editing**: Click any property value to edit inline. Save on blur or Enter.
6. **Quick actions**: Each entity type has contextual actions in the inspector header (Assign Meter, Add Reading, Generate Invoice).

### DASHBOARD DNA

1. **KPI-first**: Top row = 4-6 key performance indicators (Total Energy, Active Meters, Collection Rate, Anomalies). Each KPI has an animated count-up on load.
2. **Real-time energy flow**: Animated SVG visualization showing energy sources (import, export) flowing to combined consumption. Live-updating with WebSocket.
3. **Time-series charts**: Consumption over time (day/week/month/quarter/year). Area fill with gradient. Comparison overlay for previous period.
4. **Status grid**: Grid of all areas with their current status (Live=green pulse, Warning=amber, Offline=red, No Data=gray).
5. **Alert feed**: Recent anomalies/events sorted by severity. Auto-dismiss acknowledged alerts.
6. **Quick actions**: "+" buttons for common tasks (Add Reading, Generate Invoice, Assign Meter).

### CHART DNA

1. **Recharts-native**: All charts use Recharts with consistent MeterVerse styling (colors, fonts, grid lines).
2. **Energy-specific color palette**: Import=amber(#F59E0B), Export=blue(#3B82F6), Combined=teal(#00BFA5), Consumption=emerald(#10B981).
3. **Time-series line charts** with gradient area fill. Comparison mode overlays multiple series.
4. **Bar charts** for period-over-period comparison (this month vs last month).
5. **Doughnut charts** for distribution (energy source mix, meter status distribution).
6. **Radial gauges** for per-meter load percentage (circular progress).
7. **Composed charts** (line + bar) for consumption vs target comparison.
8. **Interactive tooltips**: Show exact values, timestamps, and status on hover.

### TABLE DNA

1. **TanStack Table-based**: Every data grid uses TanStack Table for consistency.
2. **Column visibility toggle**: Users show/hide columns per table.
3. **Sortable columns**: Click header to sort. Shift+click for multi-column sort.
4. **Filterable**: Column-based filters (text input, dropdown, date range, numeric range).
5. **Server-side pagination**: Large datasets paginate server-side. 25/50/100 rows per page.
6. **Row selection**: Checkbox column for multi-select. Bulk actions bar appears when rows selected.
7. **Inline sparklines**: Mini trend charts in table cells (consumption trend, payment history).
8. **Status badges**: Color-coded badges in status columns (Active=green, Warning=amber, Error=red).
9. **Export**: CSV/Excel/PDF export from table toolbar.
10. **Row actions**: Each row has a dropdown menu (View, Edit, Delete, Assign Meter, etc.).

### GRID DNA

1. **Card-based layout**: 3 columns × 5 rows = 15 cards per view.
2. **Status-colored accents**: Each card has a left border/top bar colored by status.
3. **Heart-rate pulse**: A subtle pulsing bar animation at the bottom of each card reflecting data freshness.
4. **Staggered entrance**: Cards animate in with stagger (50ms delay per card).
5. **Hover elevation**: Card lifts on hover (shadow increase + slight scale).
6. **Quick status dot**: Top-right pulsing dot (green=live, amber=warning, red=error).
7. **Entity icon**: First letter of entity type in a colored circle.
8. **Compact data display**: 2-column grid inside each card showing key-value pairs.

### CARD DNA

1. **Glass-morphism background**: `rgba(255,255,255,0.7)` in light mode, `var(--surface-raised)` in dark mode.
2. **1px status border**: Left accent or full border colored by status.
3. **Subtle shadow**: `0 1px 3px rgba(0,0,0,0.05)` default, increases on hover to `0 8px 25px rgba(0,191,165,0.15)`.
4. **Breathing border**: Inactive cards have a subtle border color animation (3s cycle).
5. **Status bar**: A 2px bottom bar with heart-rate pulse animation (color matches status).
6. **Content padding**: 16px standard, 12px compact, 20px comfortable.

### ANIMATION DNA

1. **Spring physics for UI**: Buttons, cards, panels use spring transitions (stiffness: 200-400, damping: 15-30).
2. **Count-up for numbers**: KPI values animate from 0 to target using `requestAnimationFrame` with cubic easing.
3. **Staggered entrance**: Lists and grids stagger children at 40-50ms intervals.
4. **Page transitions**: Fade + slide up + slight scale (0.97→1) + blur(4px→0) on route/tab change.
5. **Skeleton shimmer**: Loading skeletons use shimmer animation (background-position slide).
6. **Toast slide-in**: Notifications slide in from right (LTR) or left (RTL).
7. **Hover 3D tilt**: Cards tilt slightly toward cursor on hover (parallax).
8. **Notification pulse**: Badge dots pulse 1.5s cycle (scale 1→1.15→1).
9. **Border snake light**: Small bright dot slides along active element border (conic-gradient animation).
10. **Progress fill**: Radial/circular progress animates fill from 0 to target.

### MOTION DNA

1. **Centralized tokens**: All animation durations, easings, and transitions in `@/design-system/motion.ts`.
2. **Duration scale**: micro(80ms), fast(120ms), normal(200ms), slow(300ms), slower(500ms), glacial(1s).
3. **Easing presets**: default `[0.4,0,0.2,1]`, entrance `[0.16,1,0.3,1]`, exit `[0.4,0,1,1]`, spring `[0.34,1.56,0.64,1]`, emphasized `[0.2,0,0,1]`.
4. **Motion presets**: fadeIn, fadeInUp, scaleIn, slideInLeft, slideInRight, scalePress, staggerContainer, staggerItem.
5. **Futuristic presets**: glowPulse (3s), neonGlow (2s), morphBorder, waveButton, pageEntrance, cardHover, shimmer, rotateIcon, bounceIn, progressGlow, notificationPulse.

### WINDOW DNA

1. **Tab-as-window**: Each tab behaves like an OS window — can be minimized, maximized, closed, reordered, duplicated.
2. **Popout support**: Tabs can be "torn out" into separate browser windows (Window.open + postMessage sync).
3. **Split view**: Drag a tab to split the workspace horizontally or vertically (VS Code pattern).
4. **Window manager**: Zustand store tracks all open windows (tabs + popouts), their state, position, size.
5. **Session persistence**: Window state persists across browser sessions (localStorage).

### DOCK DNA

1. **Mini-sidebar mode**: Sidebar collapses to an icon dock. Icons show first letter of app with tooltip.
2. **Hover to expand**: Hovering over dock shows tooltip immediately, clicking opens the app.
3. **Auto-hide**: Dock can be set to auto-hide, appearing only when mouse moves to edge.
4. **Drag reorder**: Users drag dock items to reorder favorites.

### TOOLBAR DNA

1. **Context-sensitive**: The toolbar shows actions relevant to the active tab/program.
2. **Breadcrumb on left**: Shows current location path (Workspace → Area → Zone → Meter).
3. **Global search in center**: The smart search bar is always visible, central in toolbar.
4. **System controls on right**: Inspector toggle, view mode toggle, notifications, theme, language.
5. **Dynamic actions**: Programs can register custom toolbar buttons when active.
6. **Command palette button**: A dedicated button or keyboard shortcut (Cmd+K) opens command palette.

### INSPECTOR DNA

1. **Right panel, not sidebar**: Inspector opens from the right edge with spring animation.
2. **Entity context**: Shows details of whatever is selected/focused.
3. **Plugin sections**: Each section is a plugin registered for an entity type.
4. **Collapsible**: Sections can be collapsed. Inspector can be minimized to just a thin bar.
5. **Resizable**: Drag left edge to resize (280px min, 512px max).
6. **Inline editing**: Click to edit property values. Changes are auto-saved.
7. **Action buttons**: Header shows contextual actions (Edit, Delete, Assign, etc.).

### LOGIN DNA

1. **Gradient split layout**: Left=brand panel (dark green/teal with brand story), Right=login form.
2. **Animated brand panel**: Logo + testimonials + feature list animate in sequentially.
3. **Form validation**: Email format, password strength indicator, lockout after 5 attempts.
4. **MFA-ready**: Architecture supports TOTP-based multi-factor authentication.
5. **Session remember**: "Remember this device" checkbox sets longer session cookie.
6. **CSRF protection**: Token-based CSRF for all auth requests.
7. **Rate limiting**: Progressive delay on failed attempts (100ms → 500ms → 2s → 5s → lockout).
8. **Persistence**: Session survives browser restart (refresh token in httpOnly cookie).

### ADMIN DNA

1. **Separate identity**: Red accent theme (not green/teal), dark background (#050505).
2. **Separate navigation**: Admin-specific sidebar (Dashboard, Users, Roles, Monitoring, Logs, Audit, Security, Settings).
3. **System-focused**: Admin shows system health (CPU, Memory, Requests, Error Rate, Queue Depth, Cache Hit).
4. **Service status**: Up/down indicators for each microservice with latency.
5. **User management**: CRUD for admin users, role assignment, permission matrix.
6. **Audit log viewer**: Searchable, filterable audit log with integrity verification.
7. **Monitoring dashboard**: Real-time system metrics, alert history, incident timeline.

### DEVELOPER DNA

1. **API Explorer**: Interactive API documentation (Swagger UI wrapper) with "Try it" functionality.
2. **Runtime Inspector**: Component tree viewer, state inspector, performance profiler.
3. **Log viewer**: Real-time log stream with filter, search, severity highlight.
4. **Environment info**: Node version, Next.js version, build time, environment variables (masked).
5. **Feature flags**: Toggle features on/off for testing.
6. **GraphQL playground**: If GraphQL is used, built-in GraphiQL interface.

### MONITORING DNA

1. **Service health dashboard**: Grid of services with status indicators (Live, Degraded, Down).
2. **Latency sparkline**: Mini chart for each service showing response time over last 5 minutes.
3. **Alert history**: Table of recent alerts with severity, timestamp, acknowledgment status.
4. **System metrics**: CPU, Memory, Disk, Network — real-time updated.
5. **Queue monitoring**: Job queue depth, processing rate, error rate, dead letter queue.
6. **Error tracking**: Recent errors grouped by type with stack trace and context.

### AI DNA

1. **AI Assistant**: Chat interface in the context panel (right side) for natural language queries about energy data.
2. **Anomaly detection**: ML-powered detection of unusual consumption patterns. Highlighted on charts with explanation.
3. **Predictive analytics**: Forecast consumption, revenue, and maintenance needs.
4. **Natural language search**: "Show me meters with abnormal readings this month" → filtered results.
5. **Smart alerts**: AI determines alert severity based on context (time of day, historical patterns, weather).

### COMMAND PALETTE DNA

1. **Cmd+K everywhere**: Command palette opens with Cmd+K (Mac) / Ctrl+K (Windows/Linux).
2. **Fuzzy search**: Search across all commands, apps, entities, and settings.
3. **Categories**: Commands grouped by category (Navigation, Actions, Search, Settings).
4. **Keyboard shortcuts**: Each command shows its keyboard shortcut.
5. **Recent commands**: Recently used commands appear at top.
6. **Breadcrumb**: Shows current location and available actions.
7. **Search entities**: Type a meter serial or customer name → navigate directly.
8. **Actions**: "Add reading", "Generate invoice", "Assign meter" — execute from command palette.

### NOTIFICATION DNA

1. **Toast system**: Sonner-based toasts for operation feedback (success/error/info/warning).
2. **Stacking**: Multiple toasts stack vertically. Newest on top.
3. **Auto-dismiss**: Success/info toasts auto-dismiss after 4s. Error/warning persist until dismissed.
4. **Promise toasts**: Loading → success/error flow for async operations.
5. **Notification center**: Bell icon in toolbar opens notification drawer. Shows all alerts grouped by severity.
6. **Pulse badge**: Unread count badge on bell icon with pulse animation.
7. **Notification types**: System alerts, billing notifications, meter status changes, reading anomalies.
8. **Mark as read**: Single and bulk mark-as-read. Filter by read/unread.

### THEME DNA

1. **Multi-theme system**: 10 themes (vercel, claude, supabase, mono, notebook, light-green, zen, astro-vista, whatsapp, neobrutualism).
2. **Dark/Light/System modes**: Cycle button in toolbar. System follows OS preference.
3. **CSS variable-based**: All colors, spacing, fonts through CSS variables. Any theme can be dark or light.
4. **Brand colors fixed**: `--brand-primary: #00BFA5` stays the same across all themes (MeterVerse identity).
5. **Surface variables**: `--surface-base`, `--surface-raised`, `--surface-sunken` define card/panel hierarchy.
6. **Text hierarchy**: `--text-primary` (headings), `--text-secondary` (body), `--text-tertiary` (meta/labels).
7. **Status colors**: `--status-success`, `--status-warning`, `--status-error`, `--status-pending` — consistent across themes.
8. **Font system**: `--font-sans` (Inter for English, Cairo for Arabic), `--font-mono` (JetBrains Mono).

### ACCESSIBILITY DNA

1. **WAI-ARIA compliance**: All interactive elements have proper roles, states, and labels.
2. **Keyboard navigation**: Tab order follows visual order. All actions accessible via keyboard.
3. **Screen reader support**: Alt text on images, aria-labels on icon-only buttons, aria-live for dynamic content.
4. **Focus indicators**: Visible focus ring on all interactive elements (custom `:focus-visible` style).
5. **Color contrast**: All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text).
6. **Reduced motion**: `prefers-reduced-motion` disables non-essential animations.
7. **RTL support**: Full RTL layout for Arabic. Mirror margins, paddings, transforms.
8. **Zoom support**: Layout works up to 200% zoom without horizontal scroll.

### PERFORMANCE DNA

1. **Code splitting**: Each workspace tab loads its code lazily. Initial bundle is ~200KB.
2. **Virtual scrolling**: Tables with 1000+ rows use virtualization (only render visible rows).
3. **Image optimization**: Next.js Image component with lazy loading and WebP format.
4. **Bundle analysis**: Regular `next build --analyze` to track bundle size regressions.
5. **Memoization**: React.memo, useMemo, useCallback for expensive components and computations.
6. **Debounced search**: Search inputs debounce at 300ms to avoid excessive filtering.
7. **Caching**: TanStack Query caches API responses. Stale time = 30s, GC time = 5min.
8. **Lazy loading**: Images and charts load when they enter viewport (IntersectionObserver).

### PLUGIN DNA

1. **Plugin registry**: Context panel sections are plugins registered by entity type.
2. **SDK for plugins**: `@meterverse/plugin-sdk` provides hooks for custom sections, actions, and widgets.
3. **Lifecycle hooks**: Plugins have `onActivate`, `onDeactivate`, `onData`, `onError` lifecycle.
4. **Settings per plugin**: Plugins can expose settings UI.
5. **Third-party support**: External developers can build plugins for MeterVerse.

### SD DNA (System Design)

1. **Registry-first architecture**: All apps, navigation items, permissions, and plugins are registered (not hardcoded).
2. **Metadata-driven**: UI renders from metadata (app registry, entity configs, column definitions).
3. **Runtime-aware**: Components check runtime permissions, feature flags, and area context before rendering.
4. **Event-driven**: Cross-component communication via event bus (not prop drilling).
5. **State persistence**: UI state persists across sessions via Zustand persist middleware.
6. **Error boundaries**: Each workspace tab has an error boundary. One tab crashing doesn't affect others.
7. **Graceful degradation**: If API is unavailable, show cached data with "stale" indicator.

### INTERACTION DNA

1. **Hover states**: All clickable elements have hover states — scale (1.02-1.05), shadow increase, color shift, or border glow.
2. **Active/pressed states**: Click feedback — scale(0.97-0.98), shadow decrease.
3. **Focus states**: Custom focus ring (2px brand color + 2px offset) on keyboard focus.
4. **Micro-interactions**: Small animations on: row hover (background highlight), button hover (wave border), card hover (elevation), tab switch (underline slide), sort toggle (arrow flip), expand/collapse (chevron rotate).
5. **Loading states**: Skeleton shimmer for initial loads. Spinner for in-page actions. Progress bar for long operations.
6. **Empty states**: Friendly illustration + message + CTA when no data exists.
7. **Error states**: Error icon + message + retry button. Toast for background errors.
8. **Success states**: Brief checkmark animation on successful operations.

### ENTERPRISE DNA

1. **Role-based access control**: 7 roles (SUPER_ADMIN, ADMIN, OPERATOR, TECHNICIAN, FINANCE, SUPPORT, CUSTOMER).
2. **Multi-tenancy**: Area isolation via database schemas (sim_system, core, features, area).
3. **Audit trail**: Append-only audit log for all mutations. Integrity verification with SHA-256 hashes.
4. **Idempotency**: Idempotency-Key header prevents duplicate mutations.
5. **Rate limiting**: 100 requests/minute global. Configurable per-route.
6. **Correlation IDs**: Every request gets a correlation ID for tracing across services.
7. **Comprehensive logging**: Structured JSON logging (pino) with log levels, request context.
8. **Health checks**: `/health` endpoint for load balancer. Deep health checks for dependencies (DB, Redis, API).
9. **Graceful shutdown**: SIGTERM handling — finish in-flight requests, close connections.
10. **Disaster recovery**: DB backups, migration rollback plan, restore points.

---

## PART 4: ARCHITECTURE RECOMMENDATIONS

### Immediate (Next Phase — Phase 16a)
1. Add Recharts for energy consumption charts
2. Add TanStack Table for all data grids
3. Implement virtual scrolling for large tables
4. Add command palette (cmdk)
5. Add onboarding tour (react-joyride)

### Short-term (Phase 16b-17)
6. AI-powered anomaly detection on consumption data
7. Real-time WebSocket for live meter readings
8. Plugin architecture for context panel sections
9. Inspector minimize/collapse toggle
10. Multi-window support (popout tabs)

### Medium-term (Phase 18-19)
11. Predictive analytics dashboard
12. Natural language query interface
13. Third-party plugin SDK
14. Self-healing architecture
15. Offline-first with sync

### Long-term (Phase 20+)
16. Customer-facing portal
17. Mobile app (React Native)
18. Voice-controlled interface
19. Digital twin visualization (3D building with meter locations)
20. AI-driven energy optimization recommendations

---

*End of METERVERSE DNA v2 — Architecture Documentation*
