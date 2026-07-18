# MeterVerse Spacing System

**Defines the spacing scale, grid system, and layout rules.**

---

## 1. Spacing Scale

| Token | Pixels | Rem | Usage |
|-------|--------|-----|-------|
| space-0 | 0 | 0 | None |
| space-1 | 4px | 0.25rem | Fine adjustment, icon gap |
| space-2 | 8px | 0.5rem | Input padding, small gap |
| space-3 | 12px | 0.75rem | Button padding, card gap |
| space-4 | 16px | 1rem | Standard gap, card padding (mobile) |
| space-5 | 20px | 1.25rem | Section gap |
| space-6 | 24px | 1.5rem | Card padding (desktop), list gap |
| space-7 | 28px | 1.75rem | Large section gap |
| space-8 | 32px | 2rem | Page padding (desktop), major sections |
| space-9 | 40px | 2.5rem | Page section separation |
| space-10 | 48px | 3rem | Page-to-page separation |

## 2. Grid System

| Breakpoint | Width | Columns | Gutter | Padding |
|-----------|-------|---------|--------|---------|
| Mobile | <640px | 4 | 16px | 16px |
| Tablet | 640-1023px | 8 | 24px | 24px |
| Desktop | 1024-1279px | 12 | 24px | 32px |
| Wide | 1280-1535px | 12 | 32px | 32px |
| Ultra-wide | >1536px | 12 | 32px | Centered, max 1440px |

## 3. Layout Spacing

| Element | Spacing |
|---------|---------|
| Page padding | space-8 (desktop), space-4 (mobile) |
| Card padding | space-6 (desktop), space-4 (mobile) |
| Section margin | space-8 (between page sections) |
| Stack gap | space-4 (between stacked elements) |
| Inline gap | space-3 (between inline elements) |
| Table cell padding | space-2 vertical, space-4 horizontal |
| Form field gap | space-5 (between form fields) |
| Button icon gap | space-2 (between icon and text) |
| List item gap | space-3 (between list items) |

## 4. Responsive Spacing Rules

- **Page padding:** 32px desktop → 24px tablet → 16px mobile
- **Content max-width:** 1440px, centered with auto margins
- **Cards:** 3-column grid on desktop, 2 on tablet, 1 on mobile
- **Tables:** Horizontally scrollable on mobile with frozen first column
- **Sidebar:** 280px expanded, 64px collapsed (icons only on mobile)
- **Top nav:** 64px fixed height on all breakpoints
