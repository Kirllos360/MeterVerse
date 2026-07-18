# VISUAL_BEHAVIOR_GUIDE.md
**Project:** MeterVerse MVEOS  
**Philosophy:** "The Lighting Metaphor"

### 1. THE GEOMETRY OF STABILITY
- **Rounding Mandate:**
  - Buttons/Inputs: 10px.
  - Cards/Widgets: 16px.
  - Modals/Drawers: 20px.
  - Sidebar Inner: 20px.
- **Border Mandate:**
  - Always 1px Solid.
  - Light Mode: Neutral-200 tint (#D1D5DB).
  - Dark Mode: Surface-Variant at 10% opacity.

### 2. THE DEPTH SCALE
- **Level 0 (Flat):** Tables, Base background.
- **Level 1 (Subtle):** Cards, Filter Bars (2px lift).
- **Level 2 (Active):** Hovered Cards, Active Dropdowns (4px lift).
- **Level 3 (Overlay):** Modals, Command Palette, Toasts (20px-50px spread).

### 3. THE LIGHTING METAPHOR (THEME RULES)
- **Transition:** 350ms Linear interpolation for ALL color properties.
- **Light Theme:** "Sunny Office" — High contrast, crisp shadows, paper-white surfaces.
- **Dark Theme:** "Control Room" — Low fatigue, glowing accents, charcoal-green surfaces.
- **Gray Theme:** "Financial Ledger" — Zero saturation, maximized legibility.

### 4. MICRO-INTERACTION PHYSICS
- **Scale:** 98% Scale-down on all interactive elements to communicate "Click Pressure."
- **Focus:** 2px Offset Emerald Ring; Never use default browser focus.
- **Hover:** "Ambient Glow" — Box-shadows inherit a 5% tint of the primary color (Emerald Green).

---
**END OF GUIDE**