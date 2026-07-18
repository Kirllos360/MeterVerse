---
name: Lumina Utility OS
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#434654'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f3'
  on-secondary-container: '#5e6572'
  tertiary: '#7b2600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a33500'
  on-tertiary-container: '#ffc6b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#dce2f3'
  secondary-fixed-dim: '#c0c7d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404754'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
  financial-green: '#10B981'
  collection-amber: '#F59E0B'
  danger-red: '#EF4444'
  monitoring-purple: '#8B5CF6'
  surface-glass-light: rgba(255, 255, 255, 0.7)
  surface-glass-dark: rgba(15, 23, 42, 0.6)
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for the high-stakes environment of enterprise utility management. It balances the rigor of industrial monitoring with the premium feel of a modern SaaS workspace. The brand personality is **Precise, Empowering, and Resilient**. 

The chosen style is **Modern Corporate with Glassmorphic Elevations**. It utilizes multi-layered surfaces and strategic backdrop blurs to organize complex data hierarchies without overwhelming the user. The aesthetic is designed to reduce cognitive load during long-duration operations while maintaining a high-end, futuristic "Utility OS" feel. 

Key design principles include:
- **Atmospheric Depth:** Using glass effects and blurs to denote priority and context.
- **Functional Vitality:** High-contrast functional colors that communicate system health instantly.
- **Industrial Precision:** Leveraging sharp typography and structured grids to ground the fluid surface effects.

## Colors

The color architecture is built around a **Adaptive Theme engine** that preserves brand continuity across five distinct modes:

1.  **Light Mode:** Optimized for "Workspace Brightness." Uses high-reflectance whites and subtle blue-tinted grays to mimic a clean energy laboratory.
2.  **Dark Mode:** "Premium Contrast." Deep slate backgrounds (`#0F172A`) with vibrant glass overlays and elevated card hierarchies.
3.  **Gray Mode:** A neutral, low-chroma palette specifically designed for operators spending 8+ hours on the platform to prevent eye fatigue.
4.  **High Contrast:** Stripped-back surfaces with maximum WCAG 2.1 AAA compliance for critical monitoring.
5.  **Adaptive:** Automatically maps tokens based on system `prefers-color-scheme`.

**Functional Logic:**
- **Primary (Corporate Blue):** Actionable items and brand presence.
- **Financial Green:** Monetary growth and system efficiency.
- **Collection Amber:** Non-critical warnings and pending tasks.
- **Danger Red:** Immediate system failures or negative financial trends.
- **Monitoring Purple:** Data streams, AI insights, and IoT connectivity.

## Typography

This design system uses **Hanken Grotesk** as its primary typeface. It delivers a unique "industrial-modern" hybrid look—clean enough for a tech startup but sturdy enough for a utility enterprise.

**Rules for Use:**
- **Display & Headlines:** Utilize bold weights with tighter letter spacing for a commanding presence in dashboards.
- **Data Tables:** For telemetry and financial digits, fallback to a monospaced font (JetBrains Mono) to ensure tabular alignment and readability.
- **Labels:** Always uppercase with 0.05em tracking when used for category headers or status badges.
- **Localization:** Typography scales must remain consistent across LTR and RTL. In Arabic (RTL) contexts, ensure line-height is increased by 10% to accommodate script descenders.

## Layout & Spacing

The system employs a **12-column Fluid Grid** with a fixed maximum container width for ultra-wide monitors. 

**Grid Dynamics:**
- **Desktop:** 12 columns, 24px gutters, 40px external margins.
- **Tablet:** 8 columns, 16px gutters, 24px external margins.
- **Mobile:** 4 columns, 12px gutters, 16px external margins.

**Spacing Rhythm:**
All spatial relationships are based on a **4px baseline grid**. Padding and margins should always be multiples of 4 (e.g., 4, 8, 12, 16, 24, 32, 48, 64).

**RTL Mirroring:**
- All horizontal layouts (Flex/Grid) must use `logical properties` (`padding-inline-start` instead of `padding-left`).
- Sidebars must flip from the left (LTR) to the right (RTL).
- Progress bars and data charts must fill from right-to-left in Arabic locales.

## Elevation & Depth

Depth is used as a functional tool to separate "Background Infrastructure" from "Active Controls."

- **Level 0 (Base):** Solid theme color (Light/Dark/Gray). No blur.
- **Level 1 (Cards):** Glassmorphism applied. 20px Backdrop Blur, 1px white/transparent border, and a subtle 4px blur shadow.
- **Level 2 (Popups/Dialogs):** 40px Backdrop Blur, higher opacity background, and a "Deep Enterprise Shadow" (0px 20px 50px rgba(0,0,0,0.15)).
- **Shadow Dynamics:** In Dark mode, shadows should include a 5% primary color (Corporate Blue) tint to prevent the UI from looking "muddy." In Light mode, shadows are neutral gray with low opacity.

## Shapes

The shape language is **distinctly rounded** to soften the complexity of the utility data. Large radii create a "containerized" look that feels like a modern OS rather than a legacy spreadsheet.

- **Standard Radius:** 8px (Buttons, Inputs, Small Chips).
- **Large (Default):** 12px (Standard Dashboard Cards, Modals).
- **Extra Large:** 16px (Main Layout Containers, Popovers).
- **Pill:** Used exclusively for Status Badges and toggle switches.

All shapes remain identical across all five color themes to ensure structural brand recognition.

## Components

### Buttons
- **Primary:** Solid Corporate Blue. 12px border radius. White text. Subtle inner glow in Dark mode.
- **Secondary:** Glass-style with a 1px border. High blur background.
- **Destructive:** Solid Danger Red for critical utility shutdowns.

### Cards
Cards are the primary data vessel. They must feature a 1px "Stroke" (Light mode: `#E5E7EB`, Dark mode: `rgba(255,255,255,0.1)`). In Dark and Gray modes, cards utilize the 20px backdrop blur to "float" above the base surface.

### Input Fields
Inputs should be "Soft Geometric." Use Hanken Grotesk Medium for labels. Focus states must use a 2px Corporate Blue ring with a 4px offset.

### Localization (LTR/RTL)
- **Icons:** Directional icons (arrows, back buttons) must be mirrored. Branding-specific icons or clock-related icons remain unmirrored.
- **Form Alignment:** Labels and placeholder text must right-align in RTL.
- **Navigation:** The "Global Sidebar" moves to the right in Arabic mode, with menu items and chevron directions flipped.

### Specialized Utility Components
- **Telemetry Gauge:** Uses a thick stroke with the functional color palette to show real-time load.
- **Status Chips:** High-saturation background with white text for maximum visibility in the "Monitoring" view.