# MeterVerse Header System
**Date:** 2026-07-17 | **Status:** Draft

---

## Architecture

The header is a glass sticky bar at the top of the workspace. It contains navigation controls, breadcrumbs, search, and quick actions.

```
┌─────────────────────────────────────────────────────────────────────┐
│ [☰] [Breadcrumbs...]              [🔍 Cmd+K] [🔔] [🌙] [🌐] [👤] │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `TopHeader` | `shell/header/TopHeader.tsx` | Glass sticky container with 3 slots |
| `Breadcrumbs` | `shell/header/Breadcrumbs.tsx` | Dynamic path-based breadcrumb |

## Design Tokens

- Height: `workspace.topbar.height` (48px)
- Background: `colors.surface.topbar` with `glass.blur` (16px)
- Border: `colors.border.default`

## States

| State | Behavior |
|-------|----------|
| Default | Stickied at top, glass backdrop |
| Mobile | Compact height, hidden labels |
| Scrolled | Adds bottom shadow/elevation |
