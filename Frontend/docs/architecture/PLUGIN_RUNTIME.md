# MeterVerse Plugin Runtime
**Date:** 2026-07-17 | **Status:** Draft (Architecture Only)

---

## Architecture

Future plugins will register via `PluginManifest` with permissions, hooks, and components. The runtime handles enable/disable lifecycle.

## PluginManifest

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `version` | string | Semver |
| `description` | string | Description |
| `author` | string | Author |
| `permissions` | string[] | Required permissions |
| `hooks` | string[] | Extension points |
| `components` | Record<string, string> | Component registry |

## Implementation Status

- ✅ Plugin registration/unregistration
- ✅ Enable/disable lifecycle
- ✅ Permission gating
- ⏳ Component injection (Phase 5+)
- ⏳ Hook system (Phase 5+)
- ⏳ Hot reload (Phase 5+)
