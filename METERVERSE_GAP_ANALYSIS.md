# MeterVerse Gap Analysis & Improvement Roadmap

**Compiled**: July 2026  
**Methodology**: Compared MeterVerse (current state) against all 59 analyzed references (shadcn/ui, Radix, Ant Design, Mantine, daisyUI, PrimeReact, Figma energy/fintech designs, GitHub repos, component libraries)  
**Scale**: 0-100 per subsystem  

---

## Navigation

| Metric | Value |
|--------|-------|
| **Current Score** | 62 |
| **Target Score** | 95 |
| **Benchmark** | shadcn Sidebar, Ant Design ProLayout, Radix Tabs |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Keyboard shortcuts for all nav items (G+C → Customers) | High | Medium | 4h | App registry refactor | Low |
| Favorites + Recent navigation | High | Medium | 6h | Local storage, store | Low |
| Drag-reorder sidebar categories | Medium | Hard | 8h | DnD kit | Medium |
| Nested collapsible categories (Area → Zone → Meter) | High | Hard | 12h | Tree component | Medium |
| Command palette as primary navigation (Cmd+K) | High | Medium | 6h | cmdk install | Low |
| Tab tear-out to new window | Low | Very Hard | 20h | Window manager | High |
| Breadcrumb with clickable ancestors | Medium | Easy | 3h | Path metadata | Low |
| Right-click context menu on nav items | Medium | Medium | 5h | Radix ContextMenu | Low |

**Improvement Plan**:
1. Add Cmd+K command palette (cmdk) — 6h
2. Add keyboard shortcuts registry — 4h
3. Add favorites/recent via local storage — 6h
4. Add nested categories with tree — 12h
5. Add breadcrumb navigation — 3h
6. Add drag-reorder — 8h
7. Add context menus — 5h
8. Add tab tear-out — 20h

---

## Workspace

| Metric | Value |
|--------|-------|
| **Current Score** | 65 |
| **Target Score** | 92 |
| **Benchmark** | VS Code, Linear, shadcn Workspace |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Program lifecycle (mount→activate→render→deactivate) | High | Medium | 8h | Tab manager refactor | Medium |
| Layout presets (save/load workspace layouts) | Medium | Medium | 6h | Store, serialization | Low |
| Split view (two programs side by side) | Medium | Hard | 16h | Panel manager | High |
| Tab tear-out to separate window | Low | Very Hard | 20h | Window manager | High |
| Persistent scroll position per tab | Medium | Easy | 3h | Store extension | Low |
| Tab dirty indicator with unsaved changes prompt | High | Easy | 2h | Already in store | Low |
| Drag tabs between windows | Low | Very Hard | 24h | Cross-window IPC | High |

**Improvement Plan**:
1. Add dirty indicator prompt on close — 2h
2. Add per-tab scroll persistence — 3h
3. Add program lifecycle — 8h
4. Add layout presets — 6h
5. Add split view — 16h
6. Add tab tear-out — 20h

---

## Explorer

| Metric | Value |
|--------|-------|
| **Current Score** | 45 |
| **Target Score** | 88 |
| **Benchmark** | VS Code Explorer, PrimeReact TreeTable, Ant Design Tree |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Tree explorer (Area→Zone→Building→Floor→Unit→Meter) | High | Hard | 16h | Tree component | Medium |
| Lazy-loading tree nodes | High | Medium | 8h | Async tree data | Low |
| Right-click context menu on tree nodes | High | Medium | 5h | Radix ContextMenu | Low |
| Multi-select with bulk operations | High | Medium | 8h | Selection state | Medium |
| Search within tree (filter visible nodes) | High | Medium | 4h | Fuzzy search | Low |
| Drag-and-drop to reorganize | Medium | Hard | 12h | DnD kit | High |
| Expand/collapse all | Medium | Easy | 1h | State toggle | Low |

**Improvement Plan**:
1. Add expand/collapse all — 1h
2. Add tree search — 4h
3. Add context menu — 5h
4. Add lazy-loading tree — 8h
5. Add multi-select — 8h
6. Add full tree explorer — 16h
7. Add drag-and-drop — 12h

---

## Inspector (Context Panel)

| Metric | Value |
|--------|-------|
| **Current Score** | 50 |
| **Target Score** | 90 |
| **Benchmark** | VS Code Inspector, Linear Side Panel, Radix Tabs |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Plugin-based sections (register per entity type) | High | Hard | 16h | Plugin SDK | Medium |
| Collapse/expand individual sections | High | Easy | 2h | Local state | Low |
| Inline editing of property values | High | Medium | 8h | Editable fields | Low |
| Minimized state (thin bar on edge) | Medium | Easy | 2h | Animation | Low |
| Entity-type-aware header with contextual actions | High | Medium | 6h | Entity registry | Low |
| Resizable panel (drag edge) | Medium | Medium | 4h | Already partially done | Low |
| Quick action buttons in header | Medium | Easy | 3h | Action registry | Low |

**Improvement Plan**:
1. Add section collapse/expand — 2h
2. Add minimized state — 2h
3. Add quick actions — 3h
4. Add resizable panel (complete existing) — 4h
5. Add entity-aware header — 6h
6. Add inline editing — 8h
7. Add plugin architecture — 16h

---

## Dashboard

| Metric | Value |
|--------|-------|
| **Current Score** | 35 |
| **Target Score** | 90 |
| **Benchmark** | Lindgo Figma, Energy Management Figma, Ant Design Dashboard |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Animated KPI counters (count-up on load) | High | Easy | 3h | AnimatedCounter (exists) | Low |
| Energy flow SVG animation (import→export→combined) | High | Medium | 8h | SVG animation | Low |
| Radial gauges for per-meter load | High | Medium | 6h | Recharts radial | Low |
| Time-series consumption chart with area fill | High | Medium | 6h | Recharts install | Low |
| Alert feed with severity indicators | High | Easy | 4h | Feed component | Low |
| Status grid (all areas live/warning/offline) | High | Easy | 4h | Status grid | Low |
| Real-time WebSocket data updates | High | Hard | 12h | WebSocket setup | Medium |
| Predictive analytics overlay (forecast line) | Medium | Hard | 16h | ML backend | High |
| Comparison mode (period-over-period) | Medium | Medium | 6h | Chart config | Low |
| Export dashboard as PDF | Low | Medium | 8h | Print CSS | Low |

**Improvement Plan**:
1. Connect existing AnimatedCounter to real data — 2h
2. Add status grid (4h) + alert feed (4h) — 8h
3. Install Recharts + build time-series chart — 6h
4. Add radial gauges — 6h
5. Add energy flow SVG — 8h
6. Add period comparison — 6h
7. Add WebSocket — 12h
8. Add predictive analytics — 16h

---

## Charts

| Metric | Value |
|--------|-------|
| **Current Score** | 20 |
| **Target Score** | 88 |
| **Benchmark** | Recharts, Chart.js, Energy Management Figma, Mantine Charts |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Line chart (time-series consumption) | High | Medium | 4h | Recharts | Low |
| Area chart (cumulative with gradient) | High | Medium | 4h | Recharts | Low |
| Bar chart (period comparison) | High | Medium | 4h | Recharts | Low |
| Doughnut chart (energy mix distribution) | High | Medium | 3h | Recharts | Low |
| Radial gauge (load percentage) | High | Medium | 6h | Recharts/daisyUI | Low |
| Composed chart (line + bar combined) | Medium | Medium | 6h | Recharts | Low |
| Sparkline (mini chart in tables/cards) | Medium | Medium | 4h | Recharts sparkline | Low |
| Interactive tooltips with status info | High | Medium | 3h | Recharts tooltip | Low |
| Energy flow SVG animation | High | Medium | 8h | SVG + Framer | Low |
| Zoom and pan on time-series | Medium | Hard | 8h | Recharts zoom plugin | Medium |
| Dark mode chart colors | High | Easy | 2h | CSS vars | Low |
| Chart export (PNG/SVG) | Low | Medium | 4h | html2canvas | Low |

**Improvement Plan**:
1. Install Recharts — 1h
2. Add dark mode colors — 2h
3. Add doughnut chart — 3h
4. Add interactive tooltips — 3h
5. Add line + area + bar charts — 8h
6. Add sparklines — 4h
7. Add radial gauge — 6h
8. Add composed chart — 6h
9. Add energy flow SVG — 8h
10. Add zoom/pan — 8h

---

## Data Tables

| Metric | Value |
|--------|-------|
| **Current Score** | 30 |
| **Target Score** | 92 |
| **Benchmark** | TanStack Table, AG Grid, Ant Design ProTable, PrimeReact DataTable |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| TanStack Table integration | High | Medium | 8h | @tanstack/react-table | Medium |
| Server-side pagination (25/50/100) | High | Medium | 6h | TanStack Table | Low |
| Column visibility toggle | High | Easy | 3h | TanStack feature | Low |
| Column-based filters (text, dropdown, date) | High | Medium | 8h | Filter components | Medium |
| Multi-column sort | High | Easy | 2h | TanStack feature | Low |
| Row selection with checkbox | High | Medium | 4h | TanStack feature | Low |
| Bulk action bar | High | Medium | 4h | Selection state | Low |
| Export to CSV/Excel | Medium | Medium | 6h | Export utilities | Low |
| Virtual scrolling for 100K+ rows | High | Hard | 12h | @tanstack/react-virtual | Medium |
| Column resize | Medium | Medium | 4h | TanStack feature | Low |
| Inline cell editing | Medium | Medium | 8h | Editable cells | Medium |
| Row grouping with aggregation | Low | Hard | 12h | TanStack grouping | Medium |
| Column reorder (drag) | Medium | Hard | 8h | DnD + TanStack | High |

**Improvement Plan**:
1. Install @tanstack/react-table — 2h
2. Add basic table with sort — 4h
3. Add column visibility — 3h
4. Add row selection + bulk actions — 6h
5. Add server-side pagination — 6h
6. Add column filters — 8h
7. Add CSV/Excel export — 6h
8. Add virtual scrolling — 12h
9. Add inline editing — 8h
10. Add column reorder + resize — 10h

---

## Forms

| Metric | Value |
|--------|-------|
| **Current Score** | 25 |
| **Target Score** | 85 |
| **Benchmark** | React Hook Form + Zod, Ant Design Forms, Mantine use-form |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| React Hook Form integration | High | Medium | 6h | react-hook-form | Low |
| Zod validation schemas | High | Medium | 6h | zod | Low |
| Inline field validation with error messages | High | Medium | 4h | RHF + Zod | Low |
| Dependent fields (show/hide based on value) | Medium | Medium | 6h | Watch API | Low |
| Dynamic form sections (add/remove) | Medium | Medium | 8h | useFieldArray | Medium |
| File upload with progress | Medium | Medium | 6h | react-dropzone | Low |
| Date picker with range | High | Medium | 6h | React Aria DatePicker | Medium |
| Auto-save on blur | Medium | Medium | 4h | Debounce save | Low |
| Form state persistence (draft recovery) | Low | Medium | 6h | localStorage | Low |

**Improvement Plan**:
1. Install RHF + Zod — 2h
2. Create form field components (input, select, textarea) — 6h
3. Add validation schemas — 6h
4. Add inline errors — 4h
5. Add dependent fields — 6h
6. Add date picker — 6h
7. Add file upload — 6h
8. Add dynamic sections — 8h

---

## Login & Authentication

| Metric | Value |
|--------|-------|
| **Current Score** | 55 |
| **Target Score** | 90 |
| **Benchmark** | Clerk, Auth0, Keycloak, Ant Design Pro Login |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| MFA (TOTP) support | High | Hard | 16h | speakeasy, qrcode | Medium |
| SSO/SAML integration | Medium | Very Hard | 24h | SAML library | High |
| Password strength indicator | High | Easy | 3h | zxcvbn | Low |
| "Remember this device" with long session | Medium | Medium | 4h | JWT refresh | Low |
| Session management UI (active sessions list) | Medium | Medium | 6h | API endpoint | Low |
| Rate limiting with progressive delay | High | Medium | 4h | Throttler | Low |
| CSRF token in auth forms | High | Easy | 2h | Middleware | Low |
| OAuth2 social login (Google, Microsoft) | Low | Medium | 8h | Passport strategies | Low |

**Improvement Plan**:
1. Add CSRF tokens — 2h
2. Add password strength — 3h
3. Add progressive rate limiting — 4h
4. Add remember-device — 4h
5. Add session management — 6h
6. Add MFA/TOTP — 16h
7. Add SSO — 24h

---

## Admin Platform (Port 7500)

| Metric | Value |
|--------|-------|
| **Current Score** | 50 |
| **Target Score** | 88 |
| **Benchmark** | Ant Design Pro Admin, PrimeReact Admin |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| System health dashboard with live metrics | High | Medium | 8h | Metrics widgets | Low |
| Service status grid (up/down/degraded) | High | Easy | 4h | Status grid | Low |
| User CRUD with role assignment | High | Medium | 8h | User management | Low |
| Permission matrix editor | High | Hard | 12h | Permission tree | Medium |
| Audit log viewer with search/filter | High | Medium | 8h | Log viewer | Low |
| System configuration editor | Medium | Medium | 8h | Settings forms | Low |
| Plugin management UI | Medium | Hard | 12h | Plugin registry | Medium |
| Theme manager (upload custom themes) | Low | Hard | 16h | Theme compiler | High |
| Backup/restore UI | Medium | Medium | 8h | Backup API | Low |
| Email template editor | Low | Hard | 12h | Template engine | Medium |

**Improvement Plan**:
1. Add service status grid — 4h
2. Add system health dashboard — 8h
3. Add user CRUD — 8h
4. Add audit log viewer — 8h
5. Add settings editor — 8h
6. Add permission matrix — 12h
7. Add plugin management — 12h
8. Add backup/restore — 8h

---

## Animation & Motion

| Metric | Value |
|--------|-------|
| **Current Score** | 55 |
| **Target Score** | 90 |
| **Benchmark** | Framer Motion, Lindgo Figma, Energy Management Figma |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Page transitions on tab switch | High | Easy | 3h | AnimatePresence (exists) | Low |
| Staggered card entrance (50ms intervals) | High | Easy | 2h | Variants (exists) | Low |
| Skeleton shimmer loading | High | Easy | 3h | Skeleton component (exists) | Low |
| Count-up animation for KPI numbers | High | Easy | 2h | AnimatedCounter (exists) | Low |
| Energy flow lines (SVG animate) | High | Medium | 8h | SVG + Framer | Low |
| Hover 3D tilt on cards | Medium | Easy | 3h | useSpring | Low |
| Micro-interactions (sort arrow flip, chevron rotate) | Medium | Easy | 2h | rotate animation | Low |
| Notification slide-in + stack | High | Easy | 3h | Toast component (exists) | Low |
| Progress fill animation (gauges) | High | Medium | 4h | SVG animation | Low |
| Border snake light (active nav items) | High | Medium | 4h | Conic-gradient mask (exists) | Low |
| Reduced motion support | Medium | Easy | 1h | prefers-reduced-motion | Low |

**Improvement Plan**:
1. Add reduced motion support — 1h
2. Add micro-interactions — 2h
3. Connect existing animation components — 3h
4. Add page transitions — 3h
5. Add 3D tilt — 3h
6. Add progress fill — 4h
7. Add border snake light (connect AnimatedBorder to sidebar) — 4h
8. Add energy flow SVG — 8h

---

## SDK & Developer Experience

| Metric | Value |
|--------|-------|
| **Current Score** | 10 |
| **Target Score** | 80 |
| **Benchmark** | shadcn/ui (copy-paste model), Mantine hooks, Radix primitives |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Plugin SDK (@meterverse/plugin-sdk) | High | Very Hard | 40h | Architecture | High |
| Component generator (scaffold new components) | Medium | Medium | 8h | Plop/yeoman | Low |
| Storybook for component development | High | Medium | 12h | Storybook 8 | Low |
| API client SDK (@meterverse/api-client) | Medium | Medium | 16h | API types | Medium |
| Hook library (@meterverse/hooks) | Medium | Medium | 12h | Extract from code | Low |
| Design token documentation | High | Easy | 4h | Token list | Low |
| Component documentation | High | Medium | 16h | Storybook MDX | Low |
| Example apps / templates | Low | Medium | 16h | Template repo | Low |

**Improvement Plan**:
1. Document design tokens — 4h
2. Create component generator — 8h
3. Extract reusable hooks — 12h
4. Add Storybook — 12h
5. Document components — 16h
6. Create API client SDK — 16h
7. Create plugin SDK — 40h

---

## Runtime

| Metric | Value |
|--------|-------|
| **Current Score** | 40 |
| **Target Score** | 85 |
| **Benchmark** | VS Code Extension Host, Figma Plugin Runtime, Linear |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Plugin registration system | High | Hard | 16h | Plugin SDK | Medium |
| Entity type registry | High | Medium | 8h | Registry pattern | Low |
| Action registry (contextual actions) | High | Medium | 8h | Registry pattern | Low |
| Panel registry (context panel sections) | High | Medium | 8h | Registry pattern | Low |
| Widget registry (dashboard widgets) | Medium | Medium | 8h | Registry pattern | Low |
| Command registry (command palette items) | High | Medium | 6h | Registry pattern | Low |
| Permission registry | High | Medium | 6h | Backend sync | Low |
| Feature flag system | Medium | Medium | 8h | Flag evaluation | Low |

**Improvement Plan**:
1. Create entity registry — 8h
2. Create action registry — 8h
3. Create panel registry — 8h
4. Create command registry — 6h
5. Create permission registry — 6h
6. Create widget registry — 8h
7. Add feature flags — 8h
8. Create plugin registration — 16h

---

## Performance

| Metric | Value |
|--------|-------|
| **Current Score** | 45 |
| **Target Score** | 88 |
| **Benchmark** | AG Grid, TanStack Virtual, Next.js best practices |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Code splitting per workspace tab | High | Medium | 8h | dynamic imports | Medium |
| Virtual scrolling for tables | High | Hard | 12h | TanStack Virtual | Medium |
| Bundle analysis (next build --analyze) | Medium | Easy | 2h | @next/bundle-analyzer | Low |
| Image optimization (Next.js Image component) | Medium | Easy | 4h | Migrate img tags | Low |
| Memoization audit (React.memo, useMemo) | Medium | Medium | 8h | Code audit | Low |
| Debounced search inputs | High | Easy | 1h | useDebounce | Low |
| Lazy loading for heavy components | High | Medium | 6h | dynamic/lazy | Low |
| React Query cache optimization | Medium | Medium | 6h | staleTime/gcTime tuning | Low |
| Lighthouse score target (90+) | Medium | Medium | 12h | Various fixes | Medium |

**Improvement Plan**:
1. Add debounced search — 1h
2. Add bundle analyzer — 2h
3. Optimize images — 4h
4. Add lazy loading — 6h
5. Tune React Query cache — 6h
6. Add code splitting — 8h
7. Memoization audit — 8h
8. Add virtual scrolling — 12h
9. Lighthouse optimization — 12h

---

## Accessibility

| Metric | Value |
|--------|-------|
| **Current Score** | 55 |
| **Target Score** | 92 |
| **Benchmark** | React Aria, Radix UI, WAI-ARIA guidelines |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Keyboard navigation for all interactive elements | High | Medium | 12h | Focus management | Medium |
| Screen reader testing (VoiceOver/NVDA) | High | Medium | 8h | Testing setup | Low |
| Focus trap in modals/dialogs | High | Easy | 3h | FocusTrap | Low |
| aria-live regions for dynamic content | High | Easy | 4h | Live regions | Low |
| Color contrast audit (WCAG AA) | Medium | Medium | 6h | Contrast checker | Low |
| Focus order audit (Tab order matches visual) | Medium | Medium | 8h | DOM audit | Low |
| Skip-to-content link | Medium | Easy | 1h | Skip link | Low |
| Reduced motion support | Medium | Easy | 1h | Media query | Low |
| Touch target size (44px minimum) | Medium | Medium | 4h | Size audit | Low |

**Improvement Plan**:
1. Add skip-to-content — 1h
2. Add reduced motion — 1h
3. Add focus trap — 3h
4. Add aria-live — 4h
5. Fix touch targets — 4h
6. Color contrast audit — 6h
7. Screen reader testing — 8h
8. Focus order audit — 8h
9. Full keyboard navigation — 12h

---

## AI & Intelligence

| Metric | Value |
|--------|-------|
| **Current Score** | 5 |
| **Target Score** | 75 |
| **Benchmark** | GitHub Copilot, Linear AI, Notion AI |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| AI Assistant (chat in context panel) | High | Very Hard | 40h | LLM API, backend | High |
| Anomaly detection on consumption data | High | Hard | 24h | ML model, backend | High |
| Natural language search ("show meters with anomalies") | Medium | Hard | 16h | NLU pipeline | High |
| Predictive consumption forecasting | Medium | Hard | 24h | Time-series model | High |
| Smart alert severity classification | Medium | Hard | 16h | ML classifier | High |
| AI-generated report summaries | Low | Hard | 20h | LLM + templates | Medium |

**Improvement Plan**:
1. Create anomaly detection backend — 24h
2. Add AI chat interface in context panel — 16h
3. Add natural language search — 16h
4. Add smart alerts — 16h
5. Add predictive forecasting — 24h
6. Add report summaries — 20h

---

## Monitoring

| Metric | Value |
|--------|-------|
| **Current Score** | 30 |
| **Target Score** | 85 |
| **Benchmark** | Grafana, Datadog, PrimeReact Monitoring |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Service health dashboard | High | Medium | 8h | Metrics API | Low |
| Real-time log stream | High | Hard | 12h | WebSocket | Medium |
| System metrics (CPU, Memory, Disk) | High | Medium | 6h | Backend metrics | Low |
| Queue monitoring dashboard | Medium | Medium | 8h | Queue API | Low |
| Error tracking aggregation | High | Medium | 8h | Error grouping | Low |
| Uptime monitoring | Medium | Medium | 6h | Ping service | Low |
| Incident timeline | Medium | Medium | 6h | Event log | Low |
| Alert configuration UI | Medium | Hard | 12h | Alert rules | Medium |

**Improvement Plan**:
1. Add system metrics display — 6h
2. Add uptime monitoring — 6h
3. Add incident timeline — 6h
4. Add service health dashboard — 8h
5. Add error aggregation — 8h
6. Add queue monitoring — 8h
7. Add real-time logs — 12h
8. Add alert configuration — 12h

---

## Localization (i18n)

| Metric | Value |
|--------|-------|
| **Current Score** | 40 |
| **Target Score** | 92 |
| **Benchmark** | Ant Design i18n, React-Intl, next-intl |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Complete Arabic translation (all 78 app names) | High | Easy | 4h | Translator needed | Low |
| RTL layout mirroring (all components) | High | Medium | 12h | CSS audit | Medium |
| Arabic number formatting (Hindi numerals) | Medium | Medium | 4h | Intl.NumberFormat | Low |
| Arabic date formatting (Islamic calendar) | Low | Hard | 8h | Date library | Low |
| Locale detection from browser | Medium | Easy | 2h | navigator.language | Low |
| Locale persistence (remember user choice) | Medium | Easy | 1h | localStorage | Low |
| Translation key audit (all UI strings covered) | High | Medium | 8h | String scan | Low |
| LTR ↔ RTL transition animation | Medium | Easy | 2h | CSS transition | Low |

**Improvement Plan**:
1. Add locale persistence — 1h
2. Add locale detection — 2h
3. Add RTL transition — 2h
4. Translate remaining app names — 4h
5. Add Arabic numerals — 4h
6. Full string audit — 8h
7. RTL CSS audit — 12h

---

## Theme System

| Metric | Value |
|--------|-------|
| **Current Score** | 55 |
| **Target Score** | 90 |
| **Benchmark** | Mantine Theme, daisyUI Themes, shadcn Themes |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Dark mode CSS variable completeness | High | Medium | 8h | CSS audit | Low |
| 10 themes with proper light+dark variants | Medium | Medium | 16h | Theme files | Low |
| User theme preference persistence | Medium | Easy | 2h | localStorage | Low |
| System theme detection (prefers-color-scheme) | High | Easy | 1h | Media query | Low |
| Theme switcher UI in settings | Medium | Medium | 4h | Theme selector | Low |
| Custom theme creation UI | Low | Hard | 16h | Theme builder | Medium |
| CSS variable documentation | Medium | Easy | 3h | Token list | Low |

**Improvement Plan**:
1. Add system theme detection — 1h
2. Add persistence — 2h
3. Add CSS variable docs — 3h
4. Add theme switcher — 4h
5. Complete dark mode CSS — 8h
6. Add theme variants — 16h

---

## Dark Mode

| Metric | Value |
|--------|-------|
| **Current Score** | 40 |
| **Target Score** | 92 |
| **Benchmark** | shadcn Dark Mode, Mantine Dark Mode, daisyUI Themes |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| All components visually tested in dark mode | High | Medium | 12h | Visual audit | Low |
| Dark mode chart colors | High | Easy | 2h | Chart config | Low |
| Dark mode map style | Medium | Easy | 2h | Map style | Low |
| Dark mode form inputs | High | Easy | 3h | Input styles | Low |
| Dark mode tables (header, row, hover) | High | Easy | 3h | Table styles | Low |
| Dark mode cards (glass effect) | High | Easy | 2h | CSS vars (done) | Low |
| Dark mode scrollbars | Medium | Easy | 1h | Scrollbar CSS | Low |
| Dark mode skeleton loaders | Medium | Easy | 1h | Skeleton CSS | Low |

**Improvement Plan**:
1. Add dark scrollbars — 1h
2. Add dark skeletons — 1h
3. Add dark map style — 2h
4. Add dark chart colors — 2h
5. Add dark card glass — 2h
6. Add dark inputs — 3h
7. Add dark tables — 3h
8. Full visual audit — 12h

---

## Enterprise Features

| Metric | Value |
|--------|-------|
| **Current Score** | 50 |
| **Target Score** | 90 |
| **Benchmark** | Our own backend (security controls), Ant Design Pro, AG Grid Enterprise |

| Missing Feature | Priority | Difficulty | Est. Time | Dependencies | Risk |
|----------------|----------|------------|-----------|--------------|------|
| Append-only audit log viewer in frontend | High | Medium | 8h | Audit API | Low |
| Idempotency UI (retry with same key) | Medium | Medium | 6h | Idempotency API | Low |
| Rate limit status display | Medium | Easy | 3h | Rate limit headers | Low |
| Correlation ID display (for support) | Medium | Easy | 2h | Response headers | Low |
| Multi-tenant area switcher UI | High | Medium | 6h | Area registry | Low |
| Feature flag admin UI | Medium | Medium | 8h | Feature flags | Low |
| Export audit log (CSV/JSON) | Medium | Easy | 4h | Export utilities | Low |
| Bulk operations with progress tracking | High | Medium | 8h | Bulk API | Medium |
| Row-level security display | Low | Medium | 6h | Permission model | Low |
| Webhook management UI | Low | Hard | 12h | Webhook registry | Medium |

**Improvement Plan**:
1. Add correlation ID display — 2h
2. Add rate limit display — 3h
3. Add audit log export — 4h
4. Add area switcher — 6h
5. Add idempotency UI — 6h
6. Add row-level security — 6h
7. Add bulk operations — 8h
8. Add audit log viewer — 8h
9. Add feature flags UI — 8h

---

## Summary: Score Overview

| Category | Current | Target | Gap | Priority |
|----------|---------|--------|-----|----------|
| Charts | 20 | 88 | 68 | Critical |
| Data Tables | 30 | 92 | 62 | Critical |
| Dashboard | 35 | 90 | 55 | Critical |
| Forms | 25 | 85 | 60 | Critical |
| AI & Intelligence | 5 | 75 | 70 | High |
| Explorer | 45 | 88 | 43 | High |
| SDK & Dev Experience | 10 | 80 | 70 | High |
| Monitoring | 30 | 85 | 55 | High |
| Dark Mode | 40 | 92 | 52 | High |
| Localization | 40 | 92 | 52 | High |
| Inspector | 50 | 90 | 40 | High |
| Runtime | 40 | 85 | 45 | High |
| Performance | 45 | 88 | 43 | High |
| Enterprise Features | 50 | 90 | 40 | High |
| Accessibility | 55 | 92 | 37 | Medium |
| Navigation | 62 | 95 | 33 | Medium |
| Workspace | 65 | 92 | 27 | Medium |
| Animation & Motion | 55 | 90 | 35 | Medium |
| Theme System | 55 | 90 | 35 | Medium |
| Admin Platform | 50 | 88 | 38 | Medium |
| Login & Auth | 55 | 90 | 35 | Medium |

**Overall Current Score**: 41/100  
**Overall Target Score**: 88/100  
**Total Gap**: 47 points  

---

## Roadmap Phases

### Phase 16a — Foundation (Estimated: 2-3 weeks)
**Focus**: Charts, Tables, Dashboard — the three lowest-scoring, highest-impact areas
- Install Recharts + TanStack Table
- Build time-series chart + bar chart + doughnut chart
- Build basic data table with sort, pagination, column visibility
- Add KPI counters + status grid to dashboard

### Phase 16b — Interaction (Estimated: 2-3 weeks)
**Focus**: Forms, Animation, Inspector, Explorer
- Add React Hook Form + Zod
- Add page transitions + staggered entrances + skeleton shimmer
- Complete inspector with collapsible sections + inline editing
- Add tree explorer with lazy loading + context menus

### Phase 17 — Enterprise (Estimated: 3-4 weeks)
**Focus**: Runtime, SDK, Admin, Monitoring
- Build registry system (entity, action, panel, command, widget)
- Build plugin SDK foundation
- Complete admin platform (health, audit, users, config)
- Add monitoring dashboard + log viewer

### Phase 18 — Intelligence (Estimated: 4-6 weeks)
**Focus**: AI, Performance, Accessibility
- Build anomaly detection backend
- Add AI chat interface
- Add virtual scrolling + code splitting
- Full accessibility audit + fixes
- Complete dark mode + theme system

### Phase 19 — Polish (Estimated: 2-3 weeks)
**Focus**: Localization, remaining gaps
- Complete Arabic translation
- Full RTL CSS audit
- All enterprise features
- Performance optimization to Lighthouse 90+

---

**Total estimated effort**: 15-20 weeks  
**Priority order**: Charts → Tables → Dashboard → Forms → Runtime → Admin → AI → Polish  
**No implementation in this document** — this is the roadmap only.
