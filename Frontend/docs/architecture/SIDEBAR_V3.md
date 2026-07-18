# MeterVerse Sidebar V3
**Date:** 2026-07-17 | **Status:** Draft

---

## Architecture

The sidebar is the signature visual identity of MeterVerse. It supports 4 modes, all using Phase 02 design tokens.

## Modes

| Mode | Width | Behavior | Best For |
|------|-------|----------|----------|
| Expanded | 256px (resizable 48-480px) | Full labels, all sections | Desktop work |
| Collapsed | 64px | Icons only | Small screens |
| Dock | 48px | Floating rounded pill | Distraction-free |
| Floating | 256px | Glass overlay | Demos, temporary |

## Design Tokens Used

All values from `src/design-system/sidebar.ts`:
- `sidebar.width.*` — all widths
- `sidebar.item.*` — item height, padding, gap, icon size, font size, radius
- `sidebar.dock.*` — dock width, item size, border radius

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `Sidebar` | `Sidebar.tsx` | Main container, resize handle, mode switching |
| `SidebarDock` | `SidebarDock.tsx` | Floating pill with spring hover animations |
| `SidebarSection` | `SidebarSection.tsx` | Section label + item group with stagger animation |
| `SidebarItem` | `SidebarItem.tsx` | Active state with glow indicator, badge, icon |
| `SidebarWorkspaceSelector` | `SidebarWorkspaceSelector.tsx` | Area selector |
| `SidebarSearch` | `SidebarSearch.tsx` | Cmd+K trigger |

## Animations

- Mode switch: `smoothTransition` (250ms ease-entrance)
- Hover: `fastTransition` (120ms) + scale 1.02
- Active indicator: `springTransition` with layoutId
- Items stagger: `staggerContainer` + `staggerItem`
- Dock hover: `elasticTransition` (spring 200/15, scale 1.15)
- Dock tap: scale 0.92
