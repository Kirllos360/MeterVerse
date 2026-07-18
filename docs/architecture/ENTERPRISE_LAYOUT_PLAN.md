# MeterVerse Enterprise Layout Plan
**Date:** 2026-07-17 | **Status:** Draft

---

## Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TOPBAR (48px)                                                          │
│  [☰ Menu] [Workspace ▼] [Breadcrumb]                    [🔍] [🔔] [🌙] │
│                           [Locale: EN/AR]                    [👤 John] │
├──────────────┬────────────────────────────────┬──────────────────────────┤
│              │                                │                          │
│  SIDEBAR     │     MAIN WORKSPACE             │  INSPECTOR PANEL         │
│  (Dynamic)   │                                │  (Context-aware)         │
│              │                                │                          │
│  ┌────────┐  │  ┌──────────────────────────┐  │  ┌──────────────────┐   │
│  │ Logo   │  │  │ Page Title + Actions     │  │  │ Context Header   │   │
│  ├────────┤  │  ├──────────────────────────┤  │  ├──────────────────┤   │
│  │        │  │  │                          │  │  │ Properties       │   │
│  │ Area   │  │  │     CONTENT AREA         │  │  │ Metadata         │   │
│  │ Org    │  │  │                          │  │  │ Relationships    │   │
│  │ Proj   │  │  │  DataTables              │  │  │ Activity         │   │
│  ├────────┤  │  │  Charts                  │  │  │ Timeline         │   │
│  │        │  │  │  Forms                   │  │  │                  │   │
│  │ Search │  │  │  Kanban                  │  │  │                  │   │
│  │        │  │  │  Detail Views            │  │  │                  │   │
│  │ Nav 1  │  │  │                          │  │  │                  │   │
│  │ Nav 2  │  │  │                          │  │  │                  │   │
│  │ Nav 3  │  │  │                          │  │  │                  │   │
│  │        │  │  │                          │  │  │                  │   │
│  ├────────┤  │  │                          │  │  │                  │   │
│  │ AI     │  │  │                          │  │  │                  │   │
│  ├────────┤  │  │                          │  │  │                  │   │
│  │ Theme  │  │  │                          │  │  │                  │   │
│  ├────────┤  │  │                          │  │  │                  │   │
│  │ Notif  │  │  │                          │  │  │                  │   │
│  │ User   │  │  │                          │  │  │                  │   │
│  │ ▼ Coll │  │  │                          │  │  │                  │   │
│  └────────┘  │  │                          │  │  │                  │   │
│              │  │                          │  │  │                  │   │
│  Width:      │  │                          │  │  │ Width:           │   │
│  256/64/48px│  │     Flex: 1               │  │  │ 0/320/480px     │   │
│              │  │                          │  │  │                  │   │
└──────────────┴────────────────────────────────┴──────────────────────────┘
│                                                                         │
└─────────────────────────── BOTTOM STATUS BAR (32px) ─────────────────────┘
 [API Status: 🟢] [Area: October] [Last Sync: 2m ago] [Version: 8.0.0]
```

---

## 2. Region Definitions

### TOPBAR (48px fixed)

| Section | Content | Behavior |
|---------|---------|----------|
| Left | Menu toggle, Workspace dropdown, Breadcrumb | Responsive: collapse breadcrumb on small screens |
| Center | (empty — page title is in content area) | — |
| Right | Search (cmd+K), Notifications bell, Theme toggle, Locale switcher, User avatar | Icons only on mobile |

### SIDEBAR (Dynamic width)

| Mode | Width | Behavior |
|------|-------|----------|
| Expanded | 256px | Full labels, all sections visible. Default for 1280px+ |
| Collapsed | 64px | Icons only. Hover = temporary expand. Default 1024-1280px |
| Dock | 48px | Floating pill. Glass effect. MacOS-style. User preference |
| Floating | 256px (overlay) | Glass overlay. Backdrop blur. Floating anywhere on screen |

### MAIN WORKSPACE (Flex: 1)

| Section | Height | Content |
|---------|--------|---------|
| Page Header | Auto | Title, breadcrumb, action buttons |
| Content Area | Flex: 1 | Data tables, charts, forms, detail views |
| (Optional) Bottom Panel | Resizable | Logs, debug, additional data |

### INSPECTOR PANEL (Optional, context-aware)

| Width | State | Content |
|-------|-------|---------|
| 0px | Hidden | Default state — no selection |
| 320px | Compact | Properties + metadata |
| 480px | Full | Properties + metadata + activity + relationships |

### BOTTOM STATUS BAR (32px fixed)

Not always visible. Shows:
- API connection status (🟢/🟡/🔴)
- Current area (October, New Cairo, SODIC)
- Last sync time
- System version
- Background job status

---

## 3. Panel Resize Behavior

| Divider | Between | Min Left | Max Left | Min Right |
|---------|---------|----------|----------|-----------|
| Sidebar ↔ Main | Sidebar / Content | 48px | 480px | 400px |
| Main ↔ Inspector | Content / Inspector | 400px | — | 280px |

**Implementation:** Use `react-resizable-panels` (already in template? No — use PanelGroup from `react-resizable-panels` or shadcn `resizable`)

---

## 4. Layout Modes

| Mode | Sidebar | Inspector | Topbar | Status Bar | Use Case |
|------|---------|-----------|--------|------------|----------|
| Full | Expanded (256px) | Open (320px) | Visible | Hidden | Data entry, detail views |
| Data | Collapsed (64px) | Hidden | Visible | Hidden | Data tables, monitoring |
| Focus | Hidden | Hidden | Hidden | Hidden | Distraction-free |
| Presentation | Dock (48px) | Hidden | Hidden | Hidden | Demos, read-only |
| Debug | Expanded (256px) | Full (480px) | Visible | Visible | Development |

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Sidebar | Inspector | Layout |
|------------|-------|---------|-----------|--------|
| 2XL | > 1536px | Expanded | Open | 3-column |
| XL | > 1280px | Expanded | Open | 3-column |
| LG | > 1024px | Collapsed | Collapsed (hover) | 2-column |
| MD | > 768px | Dock | Hidden | 1-column + floating |
| SM | < 768px | Floating overlay | Hidden | 1-column |

---

## 6. Floating Panels

Panels that can float independently of the layout grid:

| Panel | Trigger | Position | Size |
|-------|---------|----------|------|
| Command Palette | Cmd+K | Center | 560px × 480px |
| AI Assistant | Click AI button | Right side | 400px × full height |
| Quick Actions | Click + button | Near cursor | 280px auto |
| Inspector | Selection or click | Right | 320-480px |
| Notifications | Click bell | Top-right | 380px × 500px |

---

## 7. Workspace Types

| Type | Layout | Best For |
|------|--------|----------|
| Dashboard | Full with WidgetGrid | Executive, KPIs, overviews |
| Explorer | Sidebar + Main + Inspector | Customers, Meters, Invoices |
| Detail | Main + Inspector | Single entity focus |
| List | Main only (full width) | Reports, logs |
| Studio | Main centered (max 900px) | Tariff designer, form-heavy |

---

## 8. Page Container Component

```
<PageContainer
  title="Customers"
  description="Manage customer accounts and relationships"
  actions={<Button>Add Customer</Button>}
  isLoading={false}
  access={{ action: "read", resource: "customers" }}
>
  <DataTableRuntime ... />
</PageContainer>
```

The `PageContainer` component (already in the template) provides:
- Title + description
- Action buttons (top right)
- Loading state
- Error state
- Access control (RBAC gate)
- Breadcrumb integration

---

## 9. Migration from Current Layout

The template's current `dashboard/layout.tsx` has:
- Sidebar (shadcn sidebar component)
- Header
- Content area
- InfoSidebar

**Changes needed:**
1. Replace shadcn sidebar with SidebarV2
2. Add sidebar mode state (expanded/collapsed/dock/floating)
3. Add resizable panels (react-resizable-panels)
4. Add inspector panel
5. Make topbar configurable (workspace selector, locale)
6. Implement floating panel system
7. Add responsive breakpoints
8. Add bottom status bar
