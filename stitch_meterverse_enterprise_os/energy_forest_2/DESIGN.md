---
name: Energy Forest
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e8'
  surface-container-high: '#e2eae3'
  surface-container-highest: '#dde5dd'
  on-surface: '#161d19'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#2b6954'
  on-secondary: '#ffffff'
  secondary-container: '#adedd3'
  on-secondary-container: '#306d58'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde5dd'
typography:
  display-lg:
    fontFamily: manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: hankenGrotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: hankenGrotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: hankenGrotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: hankenGrotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin: 32px
  sidebar-width: 280px
---

## Brand & Style
The design system is engineered for industrial energy management and enterprise environmental utility. It bridges the gap between high-density data monitoring and ecological stewardship. The aesthetic is **Corporate Modern with a Tactile twist**, utilizing depth and glassmorphism to make complex energy grids feel manageable and organic. 

The system must evoke a sense of precision, growth, and reliability. It avoids the coldness of traditional "blue" enterprise software, opting for a lush, "Forest" inspired palette that signals sustainability without sacrificing professional rigor. The interface uses frosted glass layers for sidebars and high-contrast typography to maintain clarity in high-stakes monitoring environments.

## Colors
The palette is strictly terrestrial, removing all cool blues and cyans in favor of emerald and forest tones. 

- **Primary Action:** Emerald Green (#10B981) is reserved for the most critical actions, interactive highlights, and success states.
- **Surface Deep:** Dark Forest Green (#064E3B) provides the structural foundation for sidebars and headers, creating a "canopy" effect that grounds the UI.
- **Neutrals:** Based on a warm slate (#717973), neutrals avoid sterile grays, leaning into stone and earth tones to complement the greenery.
- **Semantic Logic:** Warning states use a warm, honey-toned Amber to differentiate from the green primary without clashing. Critical states use a soft, high-visibility Coral-Red (#FC7C78).

## Typography
The typographic system balances the geometric precision of **Manrope** for headlines with the exceptional legibility of **Hanken Grotesk** for data-heavy body text. 

Headlines should be set with tight letter spacing to appear authoritative. For numeric data—critical in energy monitoring—use Hanken Grotesk with tabular figures to ensure columns in tables remain perfectly aligned. All labels and overlines should utilize the uppercase `label-md` style with increased tracking for rapid scanning.

## Layout & Spacing
This design system employs a **12-column fluid grid** for dashboard views and a **fixed sidebar** model for navigation. 

- **Sidebar:** A constant 280px container on desktop, collapsing to a 64px icon-rail on smaller screens.
- **Rhythm:** An 8px base grid governs all spatial relationships. 
- **Density:** In data-heavy views (tables/grids), spacing may be reduced to the 4px (xs) increment to maximize information density without sacrificing clarity. 
- **Mobile:** Margins shrink to 16px, and the 12-column grid reflows to a single column with stacked cards.

## Elevation & Depth
Depth is signaled through **Glassmorphism and Ambient Green Shadows**. 

1.  **Level 0 (Floor):** Neutral warm-white or deep charcoal background.
2.  **Level 1 (Cards):** Flat white or dark-gray surfaces with a 1px soft green stroke (#10B981 at 10% opacity).
3.  **Level 2 (Modals/Active Overlays):** Elevated with a "Chlorophyll Shadow"—a diffuse, low-opacity shadow tinted with #064E3B.
4.  **Glass Effect:** Sidebars and utility panels use a backdrop-blur (20px) with a semi-transparent fill of the secondary color (80% opacity) to create a sense of layering and sophisticated depth.

## Shapes
The shape language is **Rounded (0.5rem)**, striking a balance between the friendliness of consumer apps and the structure of enterprise tools. 

- **Primary Buttons:** Use the standard `rounded` (0.5rem) setting.
- **Status Chips:** Use `rounded-xl` (1.5rem) to create a distinct "pill" shape that separates status indicators from actionable buttons.
- **Inputs & Cards:** Follow the 0.5rem standard to maintain a consistent grid-block appearance.

## Components
- **Sidebar:** Use the secondary forest green (#064E3B). Active items should feature a subtle Emerald glow and a left-aligned vertical bar (4px) in #10B981.
- **Tables:** Background rows should alternate with very faint green tints. Hover states use #10B981 at 5% opacity. Selected rows use a solid 10% emerald fill with a 2px left border.
- **Buttons:** Primary buttons are solid #10B981 with white text. Secondary buttons use a #10B981 outline. Danger actions use #FC7C78.
- **Charts:** All blue/cyan is prohibited. Use a gradient ramp from #064E3B to #10B981 for primary datasets. Secondary datasets should use the Warm Amber. Use "Soft Green Ambient Shadows" for line chart dots to give them a glowing, "live" feel.
- **Inputs:** Focus states must use a 2px Emerald ring with a 20% opacity glow. Error states use the Coral-Red for both the stroke and descriptive text.
- **Chips/Badges:** For "Finance" or "Draft" states, use the neutral stone gray. For "Live" or "Active" energy states, use the primary emerald.