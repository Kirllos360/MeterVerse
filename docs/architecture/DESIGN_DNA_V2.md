# MeterVerse Design DNA v2
**Date:** 2026-07-17 | **Status:** Draft | **Inspired by:** ClickUp (40%), Apple VisionOS (20%), Azure Portal (15%), Linear (10%), Atlassian (10%), MeterVerse Legacy (5%)

---

## Design Philosophy

MeterVerse is an enterprise utility operating system. Its visual language serves **information density**, **clarity**, and **professionalism**. The design is inspired by the best enterprise tools without copying any of them.

Every pixel has a job. Every animation has a reason. Every spacing creates hierarchy.

---

## 1. Colors

### Brand Palette

| Token | Hex | Usage | Light/Dark |
|-------|-----|-------|------------|
| `brand.50` | `#E0F7F4` | Light backgrounds, badges | Light only |
| `brand.100` | `#B3EBE3` | Hover on brand bg | Both |
| `brand.200` | `#80DED2` | Borders, dividers | Both |
| `brand.300` | `#4DD0C0` | Disabled brand elements | Both |
| `brand.400` | `#26C3B1` | Hover state | Both |
| `brand.500` | `#00BFA5` | **Primary brand** — CTAs, links, active states | Both |
| `brand.600` | `#00A88F` | Pressed state | Both |
| `brand.700` | `#00917A` | Active tab indicator | Both |
| `brand.800` | `#007A66` | High-contrast brand | Both |
| `brand.900` | `#006351` | Darkest brand | Both |

**Why teal:** Energy industry + financial clarity + professional distinctiveness

### Surface Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `surface.base` | `#FAFAFA` | `#0A0A0A` | Page background |
| `surface.raised` | `#FFFFFF` | `#171717` | Cards, panels |
| `surface.overlay` | `#FFFFFF` | `#1F1F1F` | Modals, drawers |
| `surface.sunken` | `#F0F0F0` | `#000000` | Input fields |
| `surface.inverse` | `#0A0A0A` | `#FAFAFA` | Text inversion |
| `surface.sidebar` | `#064E3B` | `#021A14` | Sidebar background |
| `surface.topbar` | `#FFFFFF` | `#141414` | Top bar |

### Text Palette

| Token | Light | Dark | WCAG |
|-------|-------|------|------|
| `text.primary` | `#0A0A0A` | `#FAFAFA` | AAA |
| `text.secondary` | `#737373` | `#A3A3A3` | AA+ |
| `text.tertiary` | `#A3A3A3` | `#525252` | AA (large only) |
| `text.link` | `#00BFA5` | `#4DD0C0` | AAA |
| `text.inverse` | `#FFFFFF` | `#0A0A0A` | AAA |

### Status Palette

| Token | Light | Dark | Meaning |
|-------|-------|------|---------|
| `status.active` | `#059669` | `#34D399` | Running, connected, success |
| `status.pending` | `#D97706` | `#FBBF24` | Warning, in-progress |
| `status.error` | `#DC2626` | `#F87171` | Failed, critical |
| `status.inactive` | `#9CA3AF` | `#6B7280` | Offline, stopped |

### Chart Palette

| Token | Hex | Use |
|-------|-----|-----|
| `chart.1` | `#00BFA5` | Primary series |
| `chart.2` | `#6366F1` | Secondary series |
| `chart.3` | `#F59E0B` | Tertiary / alerts |
| `chart.4` | `#EC4899` | Comparative |
| `chart.5` | `#8B5CF6` | Distribution |
| `chart.6` | `#14B8A6` | Positive variance |
| `chart.7` | `#F97316` | Negative variance |
| `chart.8` | `#06B6D4` | Forecast |

---

## 2. Typography

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| Display | Inter | 700 | 32px | 1.15 |
| Heading XL | Inter | 600 | 24px | 1.2 |
| Heading L | Inter | 600 | 20px | 1.25 |
| Heading M | Inter | 600 | 16px | 1.4 |
| Body | Inter | 400 | 14px | 1.6 |
| Body Small | Inter | 400 | 13px | 1.5 |
| Caption | Inter | 400 | 12px | 1.5 |
| Label | Inter | 500 | 11px | 1.2 |
| Mono | JetBrains Mono | 400 | 13px | 1.6 |
| Arabic | Cairo | 400 | 14px | 1.6 |

**Fonts:** Inter (sans), JetBrains Mono (code), Cairo (Arabic) — 3 families total  
**Performance:** Preconnect to Google Fonts, subset Latin + Arabic, `font-display: swap`

---

## 3. Spacing

**Base grid:** 8px (4px in compact mode)

| Token | px | Name |
|-------|----|------|
| `space.1` | 4 | Micro |
| `space.2` | 8 | Base unit |
| `space.3` | 12 | Form gap |
| `space.4` | 16 | Card padding |
| `space.5` | 20 | Dialog padding |
| `space.6` | 24 | Section margin |
| `space.8` | 32 | Page gap |
| `space.10` | 40 | Panel margin |
| `space.12` | 48 | Page padding |
| `space.16` | 64 | Section break |

---

## 4. Radius

| Token | px | Usage |
|-------|----|-------|
| `radius.sm` | 4 | Badges |
| `radius.md` | 6 | Buttons, inputs |
| `radius.lg` | 8 | Cards, panels |
| `radius.xl` | 12 | Dialogs, modals |
| `radius.2xl` | 16 | Drawers, sheets |
| `radius.full` | 9999 | Pills, avatars |

---

## 5. Elevation

| Level | Light Shadow | Dark Shadow | Usage |
|-------|-------------|-------------|-------|
| 0 | none | none | Base |
| 1 | `0 1px 2px rgba(0,0,0,0.04)` | `0 1px 2px rgba(0,0,0,0.3)` | Hover |
| 2 | `0 2px 8px rgba(0,0,0,0.06)` | `0 2px 8px rgba(0,0,0,0.35)` | Cards |
| 3 | `0 4px 14px rgba(0,0,0,0.06)` | `0 4px 14px rgba(0,0,0,0.4)` | Raised cards |
| 4 | `0 8px 24px rgba(0,0,0,0.08)` | `0 8px 24px rgba(0,0,0,0.45)` | Dialogs |
| 5 | `0 20px 48px rgba(0,0,0,0.1)` | `0 20px 48px rgba(0,0,0,0.5)` | Modals |

---

## 6. Motion

**Duration scale:**
- Micro: 80ms (press, toggle)
- Fast: 120ms (hover, focus)
- Normal: 200ms (default — expand, collapse)
- Slow: 300ms (entrance, appear)

**Curves:**
- `ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` — Apple-inspired deceleration
- `ease-in-out`: `cubic-bezier(0.4, 0, 0.2, 1)` — I/O transitions
- `spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` — Emphasis only

**Patterns:**
- Entrance: opacity 0→1 + translateY(6px→0), 250ms
- Hover: translateY(0→-1px) + shadow, 120ms
- Press: scale(1→0.97), 80ms
- Expand: max-height + opacity, 250ms

---

## 7. Glass Effect

Used for floating panels, dock mode, modals:

| Token | Light | Dark |
|-------|-------|------|
| `glass.bg` | `rgba(255,255,255,0.6)` | `rgba(23,23,23,0.8)` |
| `glass.border` | `rgba(255,255,255,0.18)` | `rgba(255,255,255,0.08)` |
| `glass.blur` | `16px` | `16px` |

---

## 8. Density Modes

| Mode | Base Unit | Font Size | Row Height | Best For |
|------|-----------|-----------|------------|----------|
| Comfortable | 8px | 14px | 44px | Default |
| Compact | 4px | 13px | 36px | Data-heavy views |
| Spacious | 12px | 15px | 52px | Onboarding, empty states |

---

## 9. Dark Mode Rules

1. Luminance inversion: darkest surfaces → lightest text, vice versa
2. Brand shifts to brighter variant for contrast
3. Sidebar gets even darker (`#021A14` vs `#064E3B`) for depth hierarchy
4. Shadows use higher opacity (surfaces are dark, need more shadow to show)
5. Glass effect increases opacity to 80% in dark mode

---

## 10. RTL Rules

1. All layouts use logical CSS properties (`margin-inline`, `padding-inline`)
2. Icons and avatars don't flip (bidirectional)
3. Active indicator (sidebar) flips side based on `dir`
4. Cairo font for Arabic at +2px size for readability parity
5. Text alignment adjusts automatically via `dir="rtl"`

---

## 11. Forbidden Modifications

| Change | Reason |
|--------|--------|
| Change brand from #00BFA5 | Brand identity |
| Change sidebar to light mode | Core navigation marker |
| Remove 8px grid | All spacing depends on it |
| Add more than 3 font families | Performance |
| Increase base font above 14px | Data density |
| Remove keyboard navigation | Accessibility |
| Disable RTL support | Market requirement |
| Add parallax/scroll effects | Distraction in data tool |
| Remove reduced-motion support | Vestibular disorders |

---

## 12. MeterVerse Visual Identity Summary

```
MeterVerse is:
  · Professional teal — not blue, not green, not generic
  · Dark sidebar — the visual anchor of the platform
  · Floating glass — modern, layered, premium
  · Spring animations — responsive, natural, never abrupt
  · High information density — every pixel serves data
  · RTL-first — Arabic and English are equals
  · Accessible — WCAG AAA target, reduced motion respected
  · Consistent — one design language across 150+ pages
```
