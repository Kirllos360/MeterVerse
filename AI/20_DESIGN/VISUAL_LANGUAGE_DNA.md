# MeterVerse Visual Language DNA

**Version:** 2.0.0  
**Authority:** Every visual decision in MeterVerse. Supersedes all previous visual documents.

---

## 1. Spacing Language

**Purpose:** Create consistent rhythm across all surfaces. No page decides its own spacing.

**Base unit:** 4px (space-1). Everything is a multiple of 4.

| Token | Value | Rule |
|-------|-------|------|
| space-1 | 4px | Minimum gap. Icon-to-text. |
| space-2 | 8px | Tight gap. Button icon padding. |
| space-3 | 12px | Standard gap. Between elements in a group. |
| space-4 | 16px | Comfortable gap. Card padding (mobile). |
| space-5 | 20px | Card padding (desktop). |
| space-6 | 24px | Section gap. Between cards in a grid. |
| space-7 | 28px | Large section gap. |
| space-8 | 32px | Page padding (desktop). Major section break. |
| space-9 | 40px | Page section separation. |
| space-10 | 48px | Page-to-page separation. |

**Responsive rule:** Divide all spacing by 1 at desktop, multiply by 0.75 at tablet, multiply by 0.5 at mobile.

---

## 2. Shadow Language

**Purpose:** Communicate depth hierarchy. Higher elevation = closer to user.

| Level | Token | Usage | Hover |
|-------|-------|-------|-------|
| 0 | none | Surface-level content | — |
| 1 | shadow-xs | Cards, sections | level-2 |
| 2 | shadow-sm | Elevated cards | level-3 |
| 3 | shadow-md | Dropdowns, popovers | level-4 |
| 4 | shadow-lg | Dialogs, drawers | — |
| 5 | shadow-xl | Modals | — |
| 6 | shadow-2xl | Toasts, notifications, floating elements | — |

**Rule:** Cards elevate by 1 level on hover. Interactive surfaces have depth. Static surfaces (backgrounds) have no shadow.

---

## 3. Surface Language

| Surface | Purpose | Light | Dark |
|---------|---------|-------|------|
| base | Page background | white | #0e1015 |
| raised | Cards, sidebar | #f8f9fb | #16181e |
| overlay | Dialogs, drawers | #ffffff | #1e2028 |
| sunken | Inputs, table stripes | #e8eaed | #262833 |
| inverse | Inverted text areas | #1a1d23 | #ffffff |
| glass | Navbars, top headers | rgba(255,255,255,0.8) | rgba(14,16,21,0.8) |

---

## 4. Typography Language

| Role | Size | Weight | Line Height | Letter Spacing | Color |
|------|------|--------|-------------|---------------|-------|
| Display | 48px | Bold | 48px | -0.02em | text-primary |
| Hero | 30px | Bold | 36px | -0.01em | text-primary |
| Page Title | 24px | Bold | 32px | -0.01em | text-primary |
| Section Title | 18px | Semibold | 28px | 0 | text-primary |
| Card Title | 14px | Semibold | 20px | 0 | text-primary |
| Body | 14px | Normal | 20px | 0 | text-secondary |
| Data Value | 14-24px | Bold | 1.2em | 0 | text-primary |
| Label | 12px | Medium | 16px | 0.02em | text-tertiary |
| Caption | 11px | Medium | 16px | 0 | text-tertiary |
| Monospace | 13px | Normal | 20px | 0 | text-primary |

**Arabic:** Cairo font. Same sizes. Line height +0.125rem. Weight one level lighter.

---

## 5. Color Semantics (summary)

| Category | Primary Token | Purpose |
|----------|--------------|---------|
| Brand | brand-500 | CTAs, links, active states, primary identity |
| Success | status-active | Paid, completed, healthy, approved |
| Warning | status-pending | Pending, overdue, near deadline, suspicious |
| Error | status-error | Failed, rejected, critical, offline, faulty |
| Neutral | status-inactive | Archived, cancelled, inactive, retired |
| Chart | chart-1 through chart-8 | Data visualization series |

---

## 6. Border Language

| Thickness | Purpose | Usage |
|-----------|---------|-------|
| 0 | No border | Raised surfaces don't need borders |
| 1px | Default | Cards, tables, inputs, sections |
| 2px | Focus | Focus ring on interactive elements |
| 3px+ | Emphasis | Selected state, drag-over indicator |

**Color:** border-default for standard, border-hover for interactive state, brand-500 for focus.

---

## 7. Corner Radius Language

| Radius | Usage | Example |
|--------|-------|---------|
| 0 | Full-bleed content | Images, banners |
| 4px | Inputs, buttons | Text fields, small buttons |
| 6px | Cards, tables | Default card |
| 8px | Dialogs, drawers | Modal containers |
| 12px | Featured cards | Hero sections, highlighted cards |
| 16px | Large containers | Page-level containers |
| 9999px | Badges, pills | Status badges, tags |

---

## 8. Status Language

Every status badge follows: `[icon] [label]` in a pill shape.
- Active (green): Running, healthy, operational
- Pending (amber): Waiting, processing, in-review
- Error (red): Failed, critical, rejected
- Inactive (gray): Archived, cancelled, terminated
- Info (blue): Estimated, informational

---

## 9. Animation Language

| Motion | Duration | Easing | Purpose |
|--------|----------|--------|---------|
| Micro | 150ms | ease-out | Hover, focus, toggle, checkbox |
| Transition | 200ms | ease-out | Sidebar collapse, tab switch |
| Surface | 300ms | ease-out | Dialog open/close, drawer slide |
| Page | 250ms | ease-out | Route transitions |
| Reveal | 500ms | ease-out | Chart draw, KPI count-up |
| Stagger | 50ms | — | Delay between child elements entering |

**Reduced motion:** All durations become 0ms. All transitions become instant.

---

## 10. Icon Language

- Library: Lucide React (outline, 1.5px stroke, 24x24 default)
- Sizes: 12px (inline), 16px (body), 20px (menu), 24px (default), 32px (hero), 40px (KPI)
- Colors: text-primary (default), brand-500 (active), status colors (alerts)
- Every icon has aria-label or aria-hidden
- Directional icons flip in RTL

---

## 11. Chart Language

- Library: Recharts
- All charts have tooltips on hover
- All charts have legends at bottom (clickable to toggle)
- All charts have accessible data tables below
- No 3D charts. No pie charts with >5 slices.
- Chart color sequence: chart-1 through chart-8

---

## 12. Empty State Language

Every empty state contains: **Illustration → Title → Description → Call to Action**

Never: blank white space, "No data", empty table.

---

## 13. Loading Language

- **First paint:** Skeleton layout matching page structure (shimmer animation)
- **Actions:** Button spinner for <3s, progress bar for >3s
- **Tables:** 6 skeleton rows
- **Charts:** Outlined shape with pulse border
