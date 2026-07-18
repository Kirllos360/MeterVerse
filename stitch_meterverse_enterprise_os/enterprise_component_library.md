# ENTERPRISE_COMPONENT_LIBRARY.md
**Project:** MeterVerse Enterprise Utility Operating System (MVEOS)  
**Status:** Permanent Component Mandate  
**Version:** 1.0 (Enterprise Stability)  
**Applicability:** All Future MeterVerse Interface Assemblies

---

## 01. BUTTON SYSTEM ("THE ACTION ENGINE")
The interaction backbone for utility operations.

| Variant | Visual Style | Usage |
| :--- | :--- | :--- |
| **Primary** | Industrial Emerald Green (#10B981), 10px Radius, 4px Lift Shadow. | Deploy, Approve, Generate, Save. |
| **Secondary** | Surface-Container-High (#E5E9E6), Subtle Border, No Shadow. | Cancel, Back, Clear, Secondary Actions. |
| **Danger** | Industrial Red (#FC7C78) background or text. | Delete, Reject, Terminate, Rollback. |
| **Ghost** | Transparent, Emerald Text, 120ms Scale (98%) on active. | Table Inline Actions, Tab Switchers. |
| **Utility/Icon** | High-density 32px or 40px square, Soft Green Hover Glow. | Sync, Refresh, Export, Print. |

- **Behavior:** 120ms "Scale-down" on click; 4px elevation increase on hover; "Emerald Pulse" for active streaming sync.
- **RTL:** Icon mirrors to leading edge; label remains centered.

---

## 02. INPUT SYSTEM ("THE DATA ENTRY CONDUIT")
High-precision fields for financial and technical telemetry.

- **Geometries:** 10px Radius, 1px Subtle Neutral Border (#717973), 12px padding.
- **States:**
  - **Focus:** 2px Industrial Emerald ring with 2px offset.
  - **Validation:** Instant Emerald checkmark (Success) or "Gentle Shake" with Red text (Error).
- **Specialized Types:**
  - **Currency/Money:** Sticky prefix ($, KD, AED) using `tabular-nums`.
  - **Consumption:** Unit suffix (kWh, m³, GCal) right-aligned.
  - **Hierarchical Selectors:** "Tree Select" glass modal for Community > Building > Floor > Unit selection.

---

## 03. TABLE SYSTEM ("THE HIGH-DENSITY GRID")
Engineered for auditability and scale (>10k rows).

- **Infrastructure:** Sticky Headers, Frozen ID/Name columns, Resizable Dividers.
- **Visuals:** 
  - **Alternating Rows:** Subtle Surface-Low (#F4FBF4) vs Surface-Container-Lowest (#FFFFFF).
  - **Selection:** Soft Emerald background tint for bulk-selected rows.
- **Features:** "Saved View" selector (e.g., "Meters Offline," "Pending Invoices") in top-right.

---

## 04. KPI SYSTEM ("THE REAL-TIME VITALS")
Standardized metric display for all dashboards.

- **Variants:** Mini (Sidebar), Medium (Standard Page), Hero (Executive Command).
- **Behavior:** 
  - **Rolling Numbers:** 600ms count-up from 0 on load.
  - **Sparklines:** Emerald (Positive) or Red (Negative) 24h trend lines.
  - **Pulse:** Critical alerts trigger a subtle 2s Amber/Red outer glow.

---

## 05. MODAL SYSTEM ("THE POPUP MANDATE")
Zero-navigation workflow containers.

- **Geometry:** 20px Radius, 12px Backdrop Blur (Glass), Deep Shadow (0 20px 50px rgba(6, 78, 59, 0.15)).
- **Layout:**
  - **Glass Header:** Draggable title area with breadcrumbs.
  - **Sticky Footer:** Fixed action bar: [Tertiary/Cancel] | [Secondary] | [Primary/Confirm].
- **Animation:** 200ms "Scale-in" from center (95% -> 100%).

---

## 06. SIDEBAR & TOP BAR ("THE SYSTEM SKELETON")
- **Sidebar:** Dark Forest Green (#064E3B), 20px Inner Radius, Glass separators.
- **Top Bar:** 80% Translucent White/Navy, Blur-XL, Command Palette (Cmd+K) trigger in center.
- **Breadcrumbs:** Acting as "Spatial Anchors"—clicking parent nodes triggers a "Zoom Out" transition.

---

## 07. CHART LIBRARY ("THE ANALYTIC SUITE")
- **Palette:** Map strictly to semantics (Water=Cyan, Electric=Orange, Revenue=Emerald).
- **Interactions:** "Follow-the-mouse" glass tooltips; 450ms "Bounce" entrance animation.
- **Types:** Area (Trends), Gauge (Health Score), Treemap (Resource Allocation).

---

## 08. MOTION & ACCESSIBILITY
- **Motion:** "MVEOS Scale" (120ms Micro, 300ms Global, 450ms Chart).
- **Accessibility:** WCAG AA Contrast, Focus Rings, `prefers-reduced-motion` compliance.

**END OF LIBRARY**
*Every future page implementation MUST be assembled exclusively from these defined behaviors.*