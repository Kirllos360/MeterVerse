# METERVERSE VISUAL CONSTITUTION V2.0
**Status:** Permanent Visual Mandate  
**Version:** 2.0 (Enterprise Stability)  
**Applicability:** All Future MeterVerse Screens (Next.js/Tailwind)

---

## 1. VISION & IDENTITY
MeterVerse is a world-class **Enterprise Utility Operating System**. It is designed for longevity (20–25 years) through a "Timeless Enterprise" aesthetic. It balances the industrial energy of a utility provider with the digital precision of a financial platform.

- **Primary Identity:** Corporate Blue (Trust, Energy, Utility).
- **Core Philosophy:** "The Lighting Metaphor." Theme switching (Light to Dark) is a change in room lighting, not a change in architecture.

---

## 2. COLOR SYSTEM (METERVERSE PERMANENT PALETTE)

### 2.1 Primary Brand Color (Corporate Blue)
Extracted from industrial energy standards. Used for Branding, Primary Actions, and Identity elements.
- **Primary 50:** #E6F0FF
- **Primary 100:** #CCE0FF
- **Primary 200:** #99C2FF
- **Primary 300:** #66A3FF
- **Primary 400:** #3385FF
- **Primary 500:** #0052CC (Core Identity)
- **Primary 600:** #0047B3
- **Primary 700:** #003D99
- **Primary 800:** #003380
- **Primary 900:** #002966

### 2.2 Semantic Logic (Functional Colors)
- **Success/Healthy:** Emerald Green (Only for status, never for branding).
- **Executive:** Deep Navy / Obsidian.
- **Finance:** Financial Gold / Amber.
- **Monitoring/Tech:** Electric Purple / Cyan.
- **Warning/Pending:** Collection Amber.
- **Danger/Error:** Industrial Red.

---

## 3. THEME CONSTITUTION
Every screen must support five modes. Switching is handled via a 300ms smooth CSS transition.

| Feature | Light Theme | Dark Theme | Gray Theme |
| :--- | :--- | :--- | :--- |
| **Surface** | Layered Whites (#FFFFFF to #F8F9FF) | Deep Navies/Grays (#0A1128 to #121A2F) | Neutral Slate (#1E293B to #334155) |
| **Shadows** | Soft, multi-layered "Linear" shadows | Ambient, glowing elevation "Apple-style" | Subtle industrial depth |
| **Glass** | White-based backdrop blur (60% op) | Navy-based backdrop blur (40% op) | Slate-based backdrop blur (50% op) |
| **Contrast** | WCAG AA compliant on white | High-legibility on deep dark | Balanced for long working hours |

---

## 4. SIDEBAR SPECIFICATION (UNIVERSAL NAVIGATION)
The sidebar is the system's "Backbone." It must support >100 pages through a hierarchical structure.

### 4.1 Behavior
- **Modes:** Collapsed (Icons only), Expanded (Full labels), Tablet (Peek), Mobile (Drawer).
- **Interactive:** Hover-to-peek in collapsed mode; Animated chevron rotation.
- **Features:** Quick Search (Cmd+K) trigger, Workspace Switcher (Top), User Profile (Bottom).

### 4.2 Permanent Hierarchy
1. **Dashboard** (Global Overview)
2. **Workspace** (Customers, Buildings, Units, Meters, SIM Cards)
3. **Operations** (Readings, Validation)
4. **Financial** (Billing, Invoices, Payments, Collections, Wallet, Ledger, Settlements)
5. **Analytics** (Executive, Financial, Collection, Consumption, Revenue)
6. **Monitoring** (Live Grid, Device Health, Communication, Alerts)
7. **Center** (Import Center, Migration, Jasper Reports)
8. **Admin** (Users, Roles, Permissions, Audit, Settings)

---

## 5. WORKSPACE HIERARCHY (THE "METRIC FLOW")
Every page must follow this top-to-bottom layout without exception:

1. **Global Header:** Search, Notifications, Theme Switcher, Workspace Switcher.
2. **Workspace Hero:** Page Title + Primary Action (e.g., "Add Customer").
3. **Breadcrumb Ribbon:** System > Entity > Current.
4. **KPI Strip:** 3–5 high-level metrics in floating cards.
5. **Toolbar/Filter Bar:** Search within view + Advanced Filtering.
6. **Main Content:** The Table or Chart canvas.
7. **Side Insight Panel:** (Optional) Detail view for selected item.
8. **Footer:** System Status + Legal + Localization Switcher.

---

## 6. COMPONENT GEOMETRY (THE "ROUNDED" MANDATE)
MeterVerse avoids sharp edges to reduce cognitive fatigue during long shifts.

- **Buttons/Inputs/Dropdowns:** 10px Radius.
- **Cards/Widgets:** 16px Radius.
- **Dialogs/Popups:** 20px Radius.
- **Sidebar:** 20px Radius (Inner containers).
- **Borders:** 1px Solid, subtle contrast.

---

## 7. POPUP & DIALOG PHILOSOPHY
Small actions = Zero navigation. Use premium glass dialogs for all create/edit/view operations.
- **Animation:** 200ms "Scale-in" from center.
- **Backdrop:** 12px blur + semi-transparent overlay.
- **Focus:** Auto-focus first input; ESC to close; Keyboard navigable.
- **Footer:** [Cancel] (Tertiary) | [Action] (Primary).

---

## 8. TABLE & CHART STANDARDS

### 8.1 Data Tables
- **Features:** Sticky headers, column pinning, bulk selection, row-level animations (fade-in), horizontal scrolling.
- **Interaction:** Hover state highlights entire row with brand-tint.

### 8.2 Charts
- **Palette:** Colors must map to the semantic logic (e.g., Water = Cyan, Electric = Orange).
- **Polish:** Tooltips use "Glass" style; 400ms smooth animations on load/data change.
- **Types:** Area, Line, Bar, Waterfall, Heatmap, Tree Map, Gauge, Radar.

---

## 9. MOTION & INTERACTION
Motion must be **Calm and Confident**.

- **Global Transitions:** 300ms.
- **Hover Lift:** Cards elevate 4px with increased shadow spread (120ms).
- **Button Micro-scale:** 95% on active.
- **Skeleton:** Premium shimmer with 2s loop.

---

## 10. LOCALIZATION (LTR / RTL MIRRORING)
Mirroring is structural, not just textual. 

- **English (LTR):** Sidebar on Left, Content flows Right.
- **Arabic (RTL):** Sidebar on Right, Content flows Left.
- **Popups:** Animation direction must mirror (Slide from Left vs Slide from Right).
- **Controls:** All pagination, breadcrumbs, and timelines must flip direction.

---

## 11. ACCESSIBILITY RULES
- **Standard:** WCAG 2.1 Level AA.
- **Focus:** Visible ring in Corporate Blue 400.
- **High Contrast:** Dedicated mode for maximum readability.
- **Motion:** Respect `prefers-reduced-motion` media query.

---

**END OF CONSTITUTION**
*Every future implementation turn must reference this document as the source of truth for visual decisions.*
