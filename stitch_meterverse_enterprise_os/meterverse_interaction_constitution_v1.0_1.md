# METERVERSE INTERACTION CONSTITUTION V1.0
**Status:** Permanent Behavioral Mandate  
**Version:** 1.0 (Interaction Stability)  
**Applicability:** All Future MeterVerse Experience Logic (React/Next.js)

---

## 1. THE CORE PHILOSOPHY: "CONFIDENT CALM"
MeterVerse interactions are engineered for precision and reliability. The system never "jumps." It "materializes." Every movement follows a predictable physics-based logic that communicates industrial stability.

- **Non-Abruptness:** No element appears or disappears instantly (0ms).
- **Latency Masking:** Use skeletons and optimistic updates for every network-bound action.
- **Muscle Memory:** Identical spatial relationships across all 100+ pages.

---

## 2. MOTION CHOREOGRAPHY (THE "MVEOS" SCALE)
Motion is a functional tool for hierarchy, not decoration.

| Interaction | Duration | Easing | Visual Behavior |
| :--- | :--- | :--- | :--- |
| **Micro-Interactions** | 120ms | ease-out | Button scale (98%), icon shifts, ripple. |
| **Dialog Appearance** | 200ms | cubic-bezier(0.16, 1, 0.3, 1) | Scale-in (95% to 100%) + Fade. |
| **Page Transitions** | 300ms | ease-in-out | Vertical slide (10px) + cross-fade. |
| **Sidebar Toggle** | 250ms | cubic-bezier(0.4, 0, 0.2, 1) | Smooth width interpolation. |
| **Chart Entrance** | 450ms | custom-bounce | Sequential bar growth or path drawing. |
| **Theme Switch** | 350ms | linear | Smooth color-property interpolation. |

---

## 3. GLOBAL SHELL BEHAVIOR

### 3.1 The "Materialization" Sequence
When the application opens:
1. **Background & Shell:** Renders immediately (Dark Olive/Forest Green).
2. **Skeleton UI:** Primary layout structure appears with shimmer.
3. **Data Hydration:** Numbers "roll" from 0 to final value; Charts animate paths.
4. **Interactive Layer:** Buttons and inputs become enabled.

### 3.2 Navigation & Breadcrumbs
- **Breadcrumbs:** Acting as a "Spatial Anchor." Clicking a parent node triggers a "Zoom Out" transition.
- **Search (Cmd+K):** A centered glass modal that blurs the background. Results are grouped by Category (Customer, Meter, SIM).

---

## 4. WORKFLOW EXPERIENCE

### 4.1 "Small-Action" Popup Mandate
- **No Navigation:** Create/Edit/Delete always happens in a Dialog.
- **Focus:** First input auto-focuses on open.
- **Stacking:** Max 2 levels of dialogs. Level 2 blurs Level 1.
- **Validation:** Real-time inline validation. Errors appear as a "gentle shake" on the field.

### 4.2 Form Behavior
- **Optimistic Fields:** Checkmarks appear instantly on blur for valid data.
- **Unsaved Changes:** Any dirty state triggers a "Floating Action Ribbon" at the bottom: [Discard] [Save Changes].

---

## 5. DATA INTERACTION

### 5.1 The High-Performance Table
- **Sticky Infrastructure:** Headers and ID columns are always pinned.
- **Row Hover:** Entire row elevates 1px with a subtle brand tint highlight.
- **Infinite Scroll:** Used for explorers; Pagination used for financial audits.
- **Column Resize:** Drag handle with a vertical "guide line" across the entire table.

### 5.2 KPI & Chart "Aliveness"
- **KPI Rolling:** Numbers use `tabular-nums` CSS property to prevent jitter during updates.
- **Chart Tooltips:** "Follow-the-mouse" glass tooltips with 0ms lag.
- **Live Monitoring:** The "Live" indicator pulses (2s loop) when data is streaming.

---

## 6. ERROR & LOADING STATES

### 6.1 The "Graceful Failure"
- **Recoverable:** Toast with [Retry] button.
- **Fatal:** Full-page "Industrial Schematic" illustration with clear next steps.
- **Partial Loading:** Only the table blurs during refresh; KPIs and Sidebar remain active.

### 6.2 Skeleton Patterns
- **Cards:** Shimmer follows the natural light direction of the theme (Top-Left to Bottom-Right).

---

## 7. KEYBOARD & ACCESSIBILITY

### 7.1 Power User Shortcuts
- `G` + `D`: Go to Dashboard.
- `G` + `M`: Go to Meters.
- `/`: Focus Global Search.
- `ESC`: Close any open Dialog, Drawer, or Menu.
- `Enter`: Confirm primary action in any dialog.

### 7.2 Accessibility Logic
- **Focus Ring:** 2px solid Emerald Green with 2px offset.
- **Screen Readers:** All decorative icons are `aria-hidden`. Status badges use semantic ARIA labels (e.g., "Status: Online").

---

## 8. MICRO-INTERACTION GLOSSARY
- **Buttons:** 98% scale-down on click; 4px lift on hover.
- **Checkboxes:** Animated "draw" effect for the checkmark.
- **Sidebar Tabs:** Horizontal indicator slides vertically between items.
- **Notification Badges:** "Pulse" effect for Critical priority only.

---

**END OF CONSTITUTION**
*This document defines the behavioral soul of MeterVerse. No implementation should deviate from these physics.*
