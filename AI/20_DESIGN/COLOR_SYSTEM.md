# MeterVerse Color System

**Semantic color system for the MeterVerse Enterprise UI. All colors are defined as CSS custom properties and must be referenced by semantic token, never by raw value.**

---

## 1. Color Architecture

```
Brand Colors (primary identity)
    ├── Brand 50-950 (blue-based)
    └── Brand 50-950 accent (teal-based, 10% usage)

Neutral Colors (structural)
    ├── Neutral 50-950
    └── Transparent variants

Semantic Colors (meaning)
    ├── Success (green)
    ├── Warning (amber)
    ├── Error (red)
    ├── Info (blue)
    └── Neutral (gray)

Chart Colors (data visualization)
    ├── 8-color categorical palette
    ├── Sequential palette for gradients
    └── Diverging palette for heat maps
```

## 2. Brand Color: Primary (Blue)

| Token | Hex | Usage |
|-------|-----|-------|
| brand-50 | #eff6ff | Background tint |
| brand-100 | #dbeafe | Hover background |
| brand-200 | #bfdbfe | Selected background |
| brand-300 | #93c5fd | Interactive hover |
| brand-400 | #60a5fa | Interactive |
| brand-500 | #3b82f6 | PRIMARY — buttons, links, active |
| brand-600 | #2563eb | Hover state |
| brand-700 | #1d4ed8 | Active state |
| brand-800 | #1e40af | Text on light |
| brand-900 | #1e3a8a | Text dark emphasis |
| brand-950 | #172554 | Background emphasis dark |

## 3. Status Colors

| Status | Background | Border | Text | Icon |
|--------|-----------|--------|------|------|
| Success | #f0fdf4 / #052e16 | #bbf7d0 / #166534 | #16a34a / #4ade80 | CheckCircle |
| Warning | #fffbeb / #451a03 | #fde68a / #a16207 | #d97706 / #fbbf24 | AlertTriangle |
| Error | #fef2f2 / #450a0a | #fecaca / #dc2626 | #dc2626 / #f87171 | XCircle |
| Info | #eff6ff / #172554 | #bfdbfe / #2563eb | #2563eb / #60a5fa | Info |
| Neutral | #f9fafb / #1f2937 | #e5e7eb / #4b5563 | #6b7280 / #9ca3af | Minus |

## 4. Chart Colors (8-color palette)

| Color | Hex (Light) | Usage Sequence |
|-------|-------------|---------------|
| Chart-1 | #3b82f6 | Primary series |
| Chart-2 | #10b981 | Secondary series |
| Chart-3 | #f59e0b | Tertiary series |
| Chart-4 | #ef4444 | Attention series |
| Chart-5 | #8b5cf6 | Distinct series |
| Chart-6 | #06b6d4 | Additional series |
| Chart-7 | #f97316 | Additional series |
| Chart-8 | #84cc16 | Additional series |

## 5. Color Usage Rules

| Element | Token Pattern |
|---------|--------------|
| Button primary | bg-brand-500 text-white hover:bg-brand-600 |
| Button secondary | bg-surface-raised text-text-primary border-border-default |
| Link | text-brand-600 hover:text-brand-700 underline |
| Error text | text-status-error-text |
| Success badge | bg-status-success-bg text-status-success-text border-status-success-border |
| Input focus | ring-2 ring-brand-500 border-brand-500 |
| Disabled | opacity-50 cursor-not-allowed text-text-tertiary |
| Selected row | bg-brand-50 |

## 6. Dark Mode Adjustments

In dark mode:
- Brand colors shift lighter (brand-400 replaces brand-600 for text)
- Surface colors invert (dark backgrounds, lighter text)
- Shadows use white with lower opacity
- Status colors shift to lighter variants for readability on dark backgrounds
- Chart colors remain distinguishable but shift saturation
