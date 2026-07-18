# MeterVerse Inspector System
**Date:** 2026-07-17 | **Status:** Draft

---

## Architecture

The inspector is a right-side panel that shows context-aware properties, history, activity, and metadata for the currently selected entity.

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `InspectorShell` | `shell/inspector/InspectorShell.tsx` | Container with resize handle |

## Design Tokens

- Width: `workspace.panels.inspector` (default 360, min 280, max 512)
- Background: `colors.surface.raised`
- Border: `colors.border.default`

## States

| State | Width | Behavior |
|-------|-------|----------|
| Hidden | 0 | Collapsed, no content |
| Compact | 320px | Properties + metadata |
| Full | 480px | All tabs visible |
