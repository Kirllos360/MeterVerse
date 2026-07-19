# MeterVerse Brand Audit Report — Phase 27

**Date:** July 19, 2026  
**Goal:** All colors derive from single `--brand` source (#00BFA5)

---

## Independent Colors Found

| Token | Old Value | New Value | Derives From |
|-------|-----------|-----------|-------------|
| `--brand-hover` | `#00A88F` | `color-mix(in srgb, var(--brand) 85%, black)` | `--brand` |
| `--panel-accent` | `#064E3B` | `color-mix(in srgb, var(--brand) 22%, black)` | `--brand` |
| `--sidebar-background` | `#064E3B` | `color-mix(in srgb, var(--brand) 22%, black)` | `--brand` |
| `--inspector-background` | `#043526` | `color-mix(in srgb, var(--brand) 15%, black)` | `--brand` |

## Brand Color Hierarchy

```
--brand: #00BFA5                    ← LOGO ACCENT (single source of truth)
  ├── --brand-hover                 ← 85% brand + 15% black
  ├── --brand-primary (alias)       ← 100% brand
  ├── --brand-rgb (alias)           ← 0, 191, 165
  ├── --panel-accent                ← 22% brand + 78% black
  ├── --sidebar-background          ← 22% brand + 78% black
  ├── --inspector-background        ← 15% brand + 85% black
  ├── --sidebar-active              ← brand at 15% opacity
  ├── --sidebar-selected            ← 100% brand
  ├── --inspector-tab-active        ← brand at 15% opacity
  └── --inspector-button-bg         ← brand at 20% opacity
```

## Sidebar Color Family (all from `--brand`)

| Token | Derivation |
|-------|-----------|
| `--sidebar-background` | `color-mix(in srgb, var(--brand) 22%, black)` |
| `--sidebar-text` | `#FFFFFF` (white on dark bg) |
| `--sidebar-text-muted` | white at 45% |
| `--sidebar-icon` | white at 40% |
| `--sidebar-active` | brand at 15% opacity |
| `--sidebar-selected` | `var(--brand)` |

## Inspector Color Family (all from `--brand`)

| Token | Derivation |
|-------|-----------|
| `--inspector-background` | `color-mix(in srgb, var(--brand) 15%, black)` |
| `--inspector-text` | `#FFFFFF` |
| `--inspector-tab-active` | brand at 15% opacity |
| `--inspector-button-bg` | brand at 20% opacity |

## Result

✅ All 4 independent colors removed  
✅ All brand tokens now derive from `--brand`  
✅ Changing `--brand` updates entire theme  
✅ Backward compatible — all existing var() references still work  

**To change the entire brand, update one line:**
```css
--brand: #00BFA5;
```
