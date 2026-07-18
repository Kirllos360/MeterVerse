# MeterVerse Icon System

**Defines icon usage, selection, sizing, and accessibility rules.**

---

## 1. Icon Library

- **Primary:** Lucide React (already in dependency tree)
- **Style:** Outline, 1.5px stroke, 24x24 default size
- **No custom SVG icons** unless absolutely necessary (brand logo, utility-specific symbols)
- **No third-party icon libraries** — Lucide covers all enterprise use cases

## 2. Icon Sizes

| Size | Pixels | Usage |
|------|--------|-------|
| xs | 12px | Inline with small text, badges |
| sm | 16px | Inline with body text |
| md | 20px | Menu items, button icons |
| lg | 24px | DEFAULT — standalone icons, section headers |
| xl | 32px | Navigation icons, empty state illustrations |
| 2xl | 40px | Dashboard metric icons |

## 3. Icon Color

| Color | Usage |
|-------|-------|
| text-text-primary | Default icon color |
| text-text-secondary | Secondary icon, muted |
| text-text-tertiary | Disabled, placeholder |
| text-brand-500 | Active, selected, brand highlight |
| text-status-success/* | Status indicators |
| text-white | On brand backgrounds |

## 4. Icon Rules

- Every icon must have an aria-label for screen readers
- Decorative icons (purely visual) use `aria-hidden="true"`
- Interactive icons (buttons, toggles) have visible labels or tooltips
- Icons in buttons have space-2 gap between icon and text
- Navigation icons are always lg (24px)
- Status icons match their status color
- Never animate icons unless providing feedback (spinner for loading, check for success)

## 5. Utility-Specific Symbols

For utility types that need distinct visual identity:
- Electricity: Zap
- Water: Droplets
- Solar: Sun
- Chilled Water: Thermometer
- Gas: Flame
- These use Lucide icons with utility-specific brand colors

## 6. Brand Logo

The MeterVerse logo is the "MV" monogram:
- Used in sidebar header and login page
- Always displayed in brand-500
- Minimum 32px height
- No alternate versions (no icon-only, no full name lockup)
