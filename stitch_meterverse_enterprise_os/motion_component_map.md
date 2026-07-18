# MOTION_COMPONENT_MAP.md
**Project:** MeterVerse MVEOS

| Component Class | Entrance Animation | Interaction Motion | Exit Animation |
| :--- | :--- | :--- | :--- |
| **Modals** | Scale-in (0.95 -> 1.0) | Drag (Physics-based) | Scale-out + Fade |
| **KPIs** | Fade-up (10px) | Hover Glow Expansion | N/A |
| **Tables** | Row-by-row Fade (Sequential) | Row Elevate (1px) | Fade-out |
| **Charts** | Path Draw / Bar Growth | Tooltip Follow (0ms lag) | Fade-out |
| **Sidebar** | Width Slide (250ms) | Icon Shift (4px) | Width Collapse |
| **Toasts** | Slide from Bottom (300ms) | Hover Pause | Slide to Right |

---
**Physics Rules:**
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for all structural entrances.
- **Timing:** Never exceed 450ms; Never drop below 120ms.
- **Accessibility:** `prefers-reduced-motion` replaces all transforms with simple Opacity Fades.