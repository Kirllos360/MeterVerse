# MeterVerse Theme System

**Defines the four official themes, theme switching behavior, and implementation requirements.**

---

## 1. Official Themes

| Theme | Purpose | Default | CSS Class |
|-------|---------|---------|-----------|
| MeterVerse Light | Primary daytime theme | YES | `.light` (default, no class) |
| MeterVerse Dark | Low-light environments | System preference | `.dark` |
| MeterVerse Gray | Reduced distraction | Optional | `.gray` |
| MeterVerse Adaptive | Follows system preference | Optional | `.adaptive` |

## 2. Theme Architecture

```
CSS Custom Properties (single source of truth)
    ├── :root (Light) — default values
    ├── .dark — dark overrides
    ├── .gray — gray desaturated overrides
    └── .adaptive — follows prefers-color-scheme
```

## 3. Light Theme (Default)

- White/off-white surfaces
- Dark text (#111827)
- Brand-500 blue accents
- Subtle shadows (light opacity)
- High contrast between surface levels

## 4. Dark Theme

- Near-black surfaces (#0f1117 base)
- Light text (#f3f4f6)
- Brand-400 blue accents (lighter than light theme)
- Shadows use white with low opacity
- Slightly reduced contrast between surface levels
- All tokens defined in `.dark` class

## 5. Gray Theme

A desaturated variant of Light/Dark for focused work:
- Reduces brand color saturation by 50%
- Replaces status colors with neutral grays
- Use for: data review sessions, audit trails, bulk operations
- Not the default for any user — opt-in only

## 6. Adaptive Theme

Follows system `prefers-color-scheme`:
- Light mode on light system preference
- Dark mode on dark system preference
- No user choice needed — follows OS
- Ideal for users who switch between environments

## 7. Theme Switching

- Theme toggle in TopNav (Sun/Moon icon)
- Supported themes: Light, Dark, System (Adaptive)
- Persisted to localStorage under key `meter-verse-theme`
- No page reload required — CSS class switching only
- Smooth transition between themes (150ms color transitions)
- Theme choice applies globally to all pages

## 8. Implementation Requirements

| Requirement | Implementation |
|-------------|---------------|
| CSS custom properties | All colors defined as --color-* tokens |
| Class-based switching | Theme class on `<html>` element |
| No hardcoded colors | Zero raw hex/hsl in component CSS |
| Reduced motion | Respects prefers-reduced-motion |
| Print theme | Inverted (white background, black text) |

## 9. RTL Support

- `dir="rtl"` on `<html>` for Arabic
- `dir="ltr"` for English
- Theme switching is independent of direction
- All layouts must work in both directions
- Use logical CSS properties (margin-inline-start, padding-inline-end) where possible
- Icons that imply direction (arrows, chevrons) flip automatically with dir attribute
