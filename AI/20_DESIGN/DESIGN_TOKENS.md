# MeterVerse Design Tokens

**Complete design token reference. All values are defined as CSS custom properties in `globals.css` and must be referenced by their semantic name, not their raw value.**

---

## 1. Surface Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --color-surface-base | white | #0f1117 | Page background |
| --color-surface-raised | #f8f9fa | #1a1d27 | Card, sidebar, elevated sections |
| --color-surface-overlay | #ffffff | #232734 | Dialog, drawer, popover |
| --color-surface-sunken | #f0f1f3 | #0a0c12 | Input background, table row hover |
| --color-surface-brand | Brand-50 | Brand-950 | Brand highlight areas |

## 2. Text Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --color-text-primary | #111827 | #f3f4f6 | Headings, body, primary content |
| --color-text-secondary | #4b5563 | #9ca3af | Secondary content, descriptions |
| --color-text-tertiary | #9ca3af | #6b7280 | Placeholders, captions, disabled |
| --color-text-inverse | #ffffff | #111827 | Text on brand/surface-brand backgrounds |
| --color-text-link | Brand-600 | Brand-400 | Links, clickable text |
| --color-text-error | #dc2626 | #f87171 | Error messages |

## 3. Border Tokens

| Token | Value | Usage |
|-------|-------|-------|
| --color-border-default | Neutral-200 / Neutral-700 | Card borders, dividers |
| --color-border-hover | Neutral-300 / Neutral-600 | Hover state borders |
| --color-border-focus | Brand-500 | Focus ring |
| --color-border-error | #dc2626 | Error state borders |

## 4. Brand Color Scale

| Weight | Token |
|--------|-------|
| 50 | --color-brand-50 |
| 100 | --color-brand-100 |
| 200 | --color-brand-200 |
| 300 | --color-brand-300 |
| 400 | --color-brand-400 |
| 500 | --color-brand-500 (primary) |
| 600 | --color-brand-600 |
| 700 | --color-brand-700 |
| 800 | --color-brand-800 |
| 900 | --color-brand-900 |

## 5. Status Tokens

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Success | --color-status-success-bg | --color-status-success-text | --color-status-success-border |
| Warning | --color-status-warning-bg | --color-status-warning-text | --color-status-warning-border |
| Error | --color-status-error-bg | --color-status-error-text | --color-status-error-border |
| Info | --color-status-info-bg | --color-status-info-text | --color-status-info-border |
| Neutral | --color-status-neutral-bg | --color-status-neutral-text | --color-status-neutral-border |

## 6. Elevation Tokens

| Token | Light Shadow | Dark Shadow | Usage |
|-------|-------------|-------------|-------|
| --shadow-xs | 0 1px 2px rgba(0,0,0,0.05) | 0 1px 2px rgba(0,0,0,0.3) | Subtle separation |
| --shadow-sm | 0 1px 3px rgba(0,0,0,0.1) | 0 1px 3px rgba(0,0,0,0.4) | Card default |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.1) | 0 4px 6px rgba(0,0,0,0.4) | Elevated card |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.1) | 0 10px 15px rgba(0,0,0,0.4) | Dialog, drawer |
| --shadow-xl | 0 20px 25px rgba(0,0,0,0.15) | 0 20px 25px rgba(0,0,0,0.5) | Modal overlay |
| --shadow-2xl | 0 25px 50px rgba(0,0,0,0.25) | 0 25px 50px rgba(0,0,0,0.6) | Topmost elements |

## 7. Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| --radius-none | 0 | Flat surfaces |
| --radius-sm | 4px | Input fields, small elements |
| --radius-md | 6px | Cards, buttons |
| --radius-lg | 8px | Dialogs, drawers |
| --radius-xl | 12px | Large containers, modals |
| --radius-2xl | 16px | Page-level containers |
| --radius-full | 9999px | Badges, pills, avatars |
