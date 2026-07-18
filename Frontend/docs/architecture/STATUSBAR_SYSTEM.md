# MeterVerse StatusBar System
**Date:** 2026-07-17 | **Status:** Draft

---

## Architecture

The status bar is a desktop-application-style bottom bar showing connection status, environment info, and quick settings.

## Components

| Component | File | Purpose |
|-----------|------|---------|
| `StatusBar` | `shell/statusbar/StatusBar.tsx` | Bottom bar with slots |

## Design Tokens

- Height: `workspace.statusbar.height` (32px)
- Font size: `typography.fontSize.caption` (12px)
- Background: `colors.surface.base`
- Border top: `colors.border.default`

## Content

| Section | Left/Center/Right | Content |
|---------|-------------------|---------|
| Left | Left | Connection status (green dot + label) |
| Center | Left | Language indicator |
| Right | Right | Current area, version |
