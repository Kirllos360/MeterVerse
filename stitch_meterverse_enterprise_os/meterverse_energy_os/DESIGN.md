---
name: MeterVerse Energy OS
colors:
  surface: '#0d1510'
  surface-dim: '#0d1510'
  surface-bright: '#333b35'
  surface-container-lowest: '#08100b'
  surface-container-low: '#151d18'
  surface-container: '#19211c'
  surface-container-high: '#242c26'
  surface-container-highest: '#2e3731'
  on-surface: '#dce5dc'
  on-surface-variant: '#bccac0'
  inverse-surface: '#dce5dc'
  inverse-on-surface: '#2a322c'
  outline: '#87948b'
  outline-variant: '#3d4a42'
  surface-tint: '#68dba9'
  primary: '#68dba9'
  on-primary: '#003825'
  primary-container: '#25a475'
  on-primary-container: '#00311f'
  inverse-primary: '#006c4a'
  secondary: '#95d3ba'
  on-secondary: '#003829'
  secondary-container: '#0b513d'
  on-secondary-container: '#83c2a9'
  tertiary: '#6bd8cb'
  on-tertiary: '#003732'
  tertiary-container: '#29a195'
  on-tertiary-container: '#00302b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#0d1510'
  on-background: '#dce5dc'
  surface-variant: '#2e3731'
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
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
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

The design system is engineered for industrial reliability and high-stakes infrastructure management. It moves away from the ephemeral nature of standard SaaS aesthetics toward a sense of permanent, physical utility. The brand personality is authoritative, stable, and precise, evoking the feeling of a modern command center for national energy grids.

The visual style is **Industrial Modernism with Glassmorphism**. It utilizes heavy structural weights, clear hierarchies, and high-contrast interfaces to ensure legibility in high-stress environments. While the foundation is grounded in solid, architectural shapes, semi-transparent glass surfaces are used strategically for overlays and secondary telemetry data to maintain environmental context without cluttering the primary workflow.

Key principles:
- **Absolute Utility:** Every element must serve a functional purpose; no decorative "fluff."
- **Chromatic Rigor:** A strict exclusion of blue tones to focus entirely on the emerald-to-forest energy spectrum.
- **Infrastructure Weight:** UI elements should feel "heavy" and tactile, suggesting durability.

## Colors

The palette is strictly anchored in the green spectrum, symbolizing sustainable energy and operational "Go" states. Blue is entirely purged from the system to prevent interference with standard energy industry color coding.

- **Primary Axis:** We utilize a transition from Emerald (#059669) for active, energized states to Deep Forest (#064E3B) for structural, foundational elements.
- **Surface Strategy:** In Dark Mode (the default for command centers), surfaces use a "Charcoal-Olive" base (#0B130E) to reduce eye strain while maintaining a thematic connection to the forest-green identity.
- **Domain Indicators:** Specific functional areas are color-coded for instant recognition:
    - **Customer Data:** Deep Forest (Reliability)
    - **Meter Management:** Bright Emerald (Activity)
    - **Import/Grid Flow:** Teal (Movement)
- **Neutrality:** Grays are avoided in favor of "Stealth Greens"—extremely desaturated greens that feel more integrated into the brand than neutral slate or zinc.

## Typography

This design system uses **Hanken Grotesk** exclusively. Its sharp, contemporary geometry provides the "technical" feel required for an OS while remaining highly legible in dense data tables.

- **Weight Usage:** Use Bold (700) for display metrics and SemiBold (600) for section headers. Regular (400) is reserved for body text and description fields to maintain high contrast against dark backgrounds.
- **Labels:** Small labels (`label-sm`) should use Medium or SemiBold weights with slight tracking (letter spacing) to ensure readability at small scales on hardware-adjacent dashboards.
- **Numeric Data:** For meter readings and grid coordinates, ensure the use of tabular figures (monospaced numbers) if available in the font file to prevent "jumping" during real-time data updates.

## Layout & Spacing

The layout philosophy is based on a **Rigid Industrial Grid**. It prioritizes information density and logical grouping over "airy" whitespace.

- **Grid Model:** A 12-column fixed-fluid hybrid grid. On desktop, the sidebar is fixed at 280px, with the main content area expanding to a maximum of 1440px. 
- **Spacing Rhythm:** Based on a 4px baseline. Standard component spacing is 16px (4 units), while larger layout gaps use 24px or 32px.
- **Mobile Adaptation:** On mobile devices, the 12-column grid collapses to a single column with 16px side margins. Cards and data density are maintained by reducing internal paddings rather than removing information.
- **Sidebars:** The sidebar acts as the "anchor" of the OS. In both light and dark modes, it remains deep and dark to signify its role as the permanent control hub.

## Elevation & Depth

Elevation in the design system is communicated through **Tonal Layering and Tactical Glassmorphism**, rather than traditional shadows.

- **Surface Levels:** 
    - **L0 (Background):** The base darkest green-charcoal.
    - **L1 (Cards/Panels):** A slightly lighter shade (#131C16) with a subtle 1px inner border (opacity 10% white) to define edges.
    - **L2 (Popovers/Dialogs):** These use a glassmorphic effect—a dark green semi-transparent fill (80% opacity) with a background blur of 20px. 
- **Borders:** Instead of heavy shadows, use "Ghost Borders"—low-opacity, high-precision strokes that give elements a crisp, machined look.
- **Interactive States:** When an element is lifted (hover), it does not cast a large shadow; instead, its inner border brightness increases, mimicking an LED or backlit physical button.

## Shapes

The shape language balances the "hard" feel of industrial equipment with the "soft" feel of modern software. 

- **Components:** Buttons use a specific **10px** radius—squarer than standard SaaS buttons but softer than pure industrial blocks.
- **Containers:** Dashboard cards use a **16px** radius to create a distinct visual separation from the screen edge.
- **Overlays:** Large dialogs and modals use a **20px** radius to feel more approachable and distinct from the structural background.
- **Icons:** Use thick-stroke (2px) functional icons. Avoid rounded or bubbly icon sets; prefer geometric, straight-edged iconography.

## Components

- **Buttons:** Primary buttons use a solid Emerald (#059669) fill with white text. High-contrast and "thick" appearance. Use 10px roundedness. Secondary buttons should be "Ghost" style with a 1px Emerald border.
- **Input Fields:** Dark-themed inputs with a #080F0B background and a subtle Forest Green border. On focus, the border glows Emerald (#059669) with a 2px outer ring.
- **Cards:** Background color #131C16. Cards must have a 1px stroke of #1B2B21 (slightly lighter than the card itself) to ensure separation on dark backgrounds. 16px corner radius.
- **Status Chips:** Small, condensed labels. Success uses Natural Green (#10B981) with 10% opacity background and 100% opacity text. No rounded pills—use the same 10px radius as buttons.
- **Telemetry Lists:** High-density rows with alternating "zebra" backgrounds (5% opacity difference). Use Hanken Grotesk's tabular numerals for all energy metrics.
- **Glass Dialogs:** Use 20px radius. The backdrop-filter should be set to `blur(12px) saturate(150%)` to ensure that content behind the dialog feels like a "live" grid.
- **Data Gauges:** Radial or linear progress bars should use the Primary-to-Secondary gradient (Emerald to Forest) to show load or capacity.