# MeterVerse Command Runtime
**Date:** 2026-07-17 | **Status:** Draft

---

## Architecture

The Command Runtime powers Ctrl+K global search. Every application, action, setting, and AI command registers into it.

## CommandAction

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier |
| `label` | string | Display label |
| `labelAr` | string | Arabic label |
| `description` | string | Description |
| `icon` | string | Icon reference |
| `shortcut` | string | Keyboard shortcut |
| `keywords` | string[] | Search keywords |
| `category` | enum | navigation, action, settings, app, ai |
| `appId` | string | Source application |
| `action` | () => void | Execute callback |

## Features

- Search across label, Arabic, keywords, description
- Recent commands (last 10)
- Pinned/favorite commands
- History (last 50)
- Category grouping
- Keyboard navigation (↑↓ arrows, Enter)
- Fuzzy matching
