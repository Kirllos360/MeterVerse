# MeterVerse Window Manager
**Date:** 2026-07-17 | **Status:** Draft

---

## Architecture

The Window Manager controls all floating UI elements: dialogs, drawers, modals, floating panels, inspectors, and split screens. Everything is managed through one Zustand store.

## Window Types

| Type | Behavior |
|------|----------|
| `dialog` | Centered, modal backdrop |
| `drawer` | Slides from edge |
| `modal` | Full modal with focus trap |
| `floating` | Free-floating, draggable |
| `inspector` | Right-side panel |
| `panel` | Dockable panel |

## Features

- Auto-incrementing z-index (windows track stacking order)
- Minimize, maximize, restore
- Drag to move, drag handles for resize
- Close all, focus tracking
- Unique window IDs
