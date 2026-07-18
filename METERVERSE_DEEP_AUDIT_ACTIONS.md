# MeterVerse — Deep Codebase Audit & Action Plan

---

## PART 1: CODE CLEANUP — DELETE NOW

### Dead Files (15 files, ~1,300 lines — zero imports)
| File | Reasoning |
|------|-----------|
| `components/effects/FuturisticEffects.tsx` | Never imported — GlowBorder/WaveButton/PageTransition/ShimmerCard all unused |
| `components/effects/Skeleton.tsx` | Never imported — SkeletonCard/SkeletonTable/SkeletonChart all unused |
| `components/effects/StatusBorder.tsx` | Never imported |
| `components/shell/layout/ShellOrchestrator.tsx` | V2 shell — replaced by V3 workspace |
| `components/shell/sidebar/Sidebar.tsx` | V2 — replaced by SidebarContent.tsx |
| `components/shell/statusbar/StatusBar.tsx` | V2 — replaced by StatusBarContent.tsx |
| `components/shell/inspector/InspectorShell.tsx` | V2 — replaced by ContextPanel.tsx |
| `components/shell/workspace/WorkspaceShell.tsx` | V2 — replaced by WorkspaceLayout.tsx |
| `components/shell/header/TopHeader.tsx` | V2 — replaced by ToolbarContent.tsx |
| `workspace/components/InspectorContent.tsx` | Dead — replaced by ContextPanel.tsx |
| `enterprise/tree/TreeExplorer.tsx` | Never imported |
| `enterprise/timeline/Timeline.tsx` | Never imported |
| `components/enterprise/data-table/DataTableRuntime.tsx` | Only imported by component-lab |
| `components/enterprise/forms/FormRuntime.tsx` | Only imported by component-lab |
| `components/enterprise/charts/ChartsRuntime.tsx` | Only imported by component-lab |

**Action**: Delete all 15 files. Save `~1,300 lines` and eliminate confusion.

---

## PART 2: DUPLICATE CONSOLIDATION

### 2a. Two Toast Systems → Keep ONE
| System | Usage | Recommendation |
|--------|-------|----------------|
| `sonner` (`components/ui/sonner.tsx`) | 10 feature files + root layout | **KEEP** — wider usage |
| Custom `Toast` (`components/effects/Toast.tsx`) | Only `page.tsx` + `admin/layout.tsx` | **DELETE** — migrate to sonner |

### 2b. Three Search Components → Keep ONE
| Component | Usage | Recommendation |
|-----------|-------|----------------|
| `GlobalSearch.tsx` | Toolbar header | **KEEP** — rename to `SearchBar.tsx` |
| `SmartSearch.tsx` | WorkspaceContent pages | **MERGE** into GlobalSearch with configurable `compact` prop |
| `SearchInput.tsx` | `components/layout/header.tsx` | **DELETE** — use GlobalSearch instead |

### 2c. All Raw `<button>` Elements → Use shadcn Button
**189 inline styles in workspace components** should use `@/components/ui/button` or at minimum shared CSS variables.

---

## PART 3: HARDCODED COLORS — FIX NOW

### 3a. `#00BFA5` — Replace with `var(--brand-primary)` 
Found **50+ hardcoded instances** in:
- `WorkspaceContent.tsx` (12+ instances)
- `WorkspaceHome.tsx` (6 instances)
- `ToolbarContent.tsx` (8 instances)
- `SidebarContent.tsx` (5 instances)
- All effect components

### 3b. `#064E3B` (sidebar bg) — Replace with CSS variable
Found in `WorkspaceLayout.tsx`, `ContextPanel.tsx`, `InspectorContent.tsx`, `SidebarContent.tsx`

### 3c. Components with ZERO design tokens
| Component | Problem |
|-----------|---------|
| `ContextPanel.tsx` | 100% hardcoded rgba — no CSS variables |
| `InspectorContent.tsx` | 100% hardcoded rgba — no CSS variables |

**Action**: Add CSS variable support to both. At minimum:
```css
--sidebar-bg: #064E3B;  /* define in theme */
--sidebar-text: rgba(255,255,255,0.6);
--sidebar-text-muted: rgba(255,255,255,0.35);
```

---

## PART 4: MISSING FEATURES FROM REFERENCE LINKS

### From GitHub Repositories
| Repo | Feature to Steal | Apply To |
|------|-----------------|----------|
| `Abady001/Meter-` | Security audit patterns, test agent | Admin → Security audit module |
| `Abady001/Meter-` | Knowledge graph (graphify) | Already partial — complete integration |
| `Kirllos360/Meter` | JasperReports PDF/Arabic RTL | Billing → Invoice PDF generation |
| `Kirllos360/Meter` | RabbitMQ bulk processing | Admin → Queue monitor |

### From Component Libraries
| Library | Component to Implement | MeterVerse Location |
|---------|----------------------|-------------------|
| **Ant Design** | Tour/Onboarding guide | First-time user experience |
| **Ant Design** | Watermark for staging | Admin → Security |
| **daisyUI** | Radial Progress (circular gauge) | Dashboard → Meter load |
| **daisyUI** | Diff (comparison slider) | Dashboard → Import/Export |
| **React Aria** | DatePicker with calendar | Forms → Reading date filter |
| **Mantine** | Spotlight (Cmd+K alternative) | Already have cmdk — keep cmdk |
| **PrimeReact** | TreeTable (hierarchical) | Sidebar → Area/Zone/Meter tree |
| **PrimeReact** | FileUpload with progress | Readings → CSV upload |
| **shadcn** | Chart (Recharts wrapper) | Dashboard → Install & configure |
| **AG Grid** | Server-side row model | Large data tables (virtual scroll) |

### From Figma Files
| Figma Design | Pattern | Apply To |
|-------------|---------|----------|
| Lindgo Fintech | Glass-morphism sidebar active states | Sidebar (already partial) |
| Energy Management | Radial gauges, energy flow animation | Dashboard (not started) |
| Smart Energy | Hierarchical drill-down (Area→Zone→Meter) | Sidebar Explorer (not started) |
| Enterprise OS | Button wave animation | All buttons (not started) |

---

## PART 5: NEW FEATURES TO BUILD — PRIORITY ORDER

### 🔴 Phase 18 — Critical (Do First)

| # | Feature | Effort | Reference |
|---|---------|--------|-----------|
| 1 | **Delete 15 dead files** | 1h | Audit Part 1 |
| 2 | **Consolidate toast → keep sonner** | 2h | Audit Part 2a |
| 3 | **Consolidate search → keep GlobalSearch** | 3h | Audit Part 2b |
| 4 | **Add `--sidebar-bg` CSS variable** | 1h | Audit Part 3 |
| 5 | **Fix ContextPanel/InspectorContent — use CSS vars** | 2h | Audit Part 3c |
| 6 | **Fix color contrast in sidebar/inspector** | 2h | WCAG AA compliance |
| 7 | **Add loading skeletons to WorkspaceContent** | 4h | daisyUI Skeleton |

### 🟡 Phase 19 — High Priority

| # | Feature | Effort | Reference |
|---|---------|--------|-----------|
| 8 | **Page transitions (AnimatePresence)** | 4h | Framer Motion |
| 9 | **Right-click context menus** | 6h | Radix ContextMenu |
| 10 | **Keyboard shortcut cheat sheet (Cmd+/)** | 4h | cmdk + Radix Dialog |
| 11 | **Drag-and-drop tab reorder** | 8h | dnd-kit |
| 12 | **Implement shoelace-style DatePicker** | 6h | React Aria |
| 13 | **Implement FileUpload with progress** | 6h | PrimeReact / react-dropzone |
| 14 | **Remove duplicate `useTranslation` imports** | 1h | Code cleanup |

### 🟢 Phase 20 — Medium Priority

| # | Feature | Effort | Reference |
|---|---------|--------|-----------|
| 15 | **TreeTable for Area→Zone→Meter** | 12h | PrimeReact / custom |
| 16 | **Radial gauges for meter load** | 6h | daisyUI / Recharts |
| 17 | **Comparison slider (Import vs Export)** | 4h | daisyUI Diff |
| 18 | **Sparkline charts in table cells** | 4h | Recharts sparkline |
| 19 | **Watermark for staging environment** | 2h | Ant Design Watermark |
| 20 | **Onboarding tour for new users** | 8h | Ant Design Tour / react-joyride |
| 21 | **Install and configure Recharts** | 4h | Recharts docs |

### 🔵 Phase 21 — Lower Priority

| # | Feature | Effort | Reference |
|---|---------|--------|-----------|
| 22 | **Confetti on successful billing** | 2h | react-confetti |
| 23 | **3D card tilt on hover** | 3h | Framer Motion + daisyUI |
| 24 | **Pull-to-refresh on mobile** | 3h | Custom gesture |
| 25 | **Auto-save indicator** | 1h | Custom toast |
| 26 | **NocoDB integration for DB management** | 20h | nocodb/nocodb |
| 27 | **Grist-core for spreadsheet view** | 20h | gristlabs/grist-core |

---

## PART 6: ACCESSIBILITY FIXES — MANDATORY

| Issue | Location | Fix |
|-------|----------|-----|
| 3-dot menu keyboard trap | `WorkspaceContent.tsx` (grid+list) | Replace `classList.toggle` with React state + focus trap |
| Custom dropdown keyboard | `WorkspaceContent.tsx` (sort) | Add Arrow/Enter/Escape handlers |
| Reminder popup keyboard | `ToolbarContent.tsx` | Add focus trap + Escape handler |
| User menu keyboard | `ToolbarContent.tsx` | Add focus trap + Escape handler |
| Color contrast | `ContextPanel.tsx`, `SidebarContent.tsx` | Increase rgba opacity values |

---

## PART 7: WHAT TO KEEP VS DELETE SUMMARY

### DELETE (15 files, ~1,300 lines)
All files from Part 1 that are never imported or replaced by V3.

### CONSOLIDATE (4 merges)
- Toast: sonner wins, custom Toast loses
- Search: GlobalSearch wins, SmartSearch+SearchInput lose
- Shell: V3 workspace wins, V2 shell loses
- DataTable: shadcn data-table wins, enterprise runtime loses

### KEEP (core files)
- All `workspace/components/*.tsx` (but refactor inline styles)
- All `enterprise-apps/*` (but remove AI from main)
- All `runtime/*`, `registry/*`, `event-bus/*`, `data-engine/*`, `workflow/*`
- All `admin/*` (move AI here)
- All `components/effects/AmbientBackground.tsx`, `AnimatedBorder.tsx`, `AnimatedText.tsx`, `AnimatedCounter.tsx`

---

## PART 8: REFERENCE INTEGRATION STATUS

| Reference | Status | What's Left |
|-----------|--------|-------------|
| 59 links analyzed | ✅ Done | Documented in `ref-repo.md` |
| NocoDB for DB management | ⏳ Planned | Needs integration into admin portal |
| Grist-core spreadsheet | ⏳ Planned | Needs integration into admin portal |
| shadcn Chart component | ⏳ Not installed | Need `npx shadcn add chart` |
| AG Grid virtualization | ⏳ Not installed | Need `npm install ag-grid-react` |
| React Aria DatePicker | ⏳ Not implemented | Need `npm install react-aria-components` |
| Ant Design Tour | ⏳ Not implemented | Need `npm install @ant-design/react-tour` |
| PrimeReact TreeTable | ⏳ Not implemented | Need to evaluate vs custom |
