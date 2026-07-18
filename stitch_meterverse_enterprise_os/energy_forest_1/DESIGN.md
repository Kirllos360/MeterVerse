---
name: Energy Forest
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4dd'
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
  surface-variant: '#dde4dd'
  sidebar-light: '#064e3b'
  background-dark: '#0d1510'
  card-dark: '#16221a'
  financial-gold: '#fbbf24'
  industrial-red: '#ef4444'
  water-cyan: '#06b6d4'
  electric-orange: '#f97316'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 24px
  gutter: 16px
  sidebar-expanded: 260px
  sidebar-collapsed: 72px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system embodies the "Energy Forest" narrative—an evolution of enterprise utility into a modern, sustainable ecosystem. It balances high-stakes industrial precision with an organic, refreshing visual language. The personality is authoritative yet vibrant, prioritizing long-term visual comfort (anti-fatigue) for professional users managing complex energy grids.

The style is **Corporate / Modern** with a **Tactile** twist. It utilizes layered surfaces and a strict "Lighting Metaphor," where theme transitions mimic shifts in ambient environmental light rather than a structural rebrand. The aesthetic is clean, professional, and built for 24/7 operational monitoring, supporting both LTR and RTL layouts with full structural mirroring.

## Colors
The palette is rooted in functional emeralds and deep forest greens, departing from traditional corporate blues to emphasize the renewable energy focus.

### Light Mode
- **Surface**: A sophisticated layering of whites and cool grays (#F8F9FF) to create depth without glare.
- **Primary Accent**: Emerald Green (#10b981) for actions and key status indicators.
- **Sidebar**: Deep Forest Green (#064e3b) to provide a grounded, high-contrast anchor for navigation.

### Dark Mode
- **Background**: Very dark olive/charcoal (#0d1510) to minimize eye strain.
- **Cards**: Dark green-charcoal (#16221a) providing subtle separation from the background.
- **Accents**: Emerald Green remains the primary driver, optimized for high legibility against dark surfaces.

Semantic colors (Water Cyan, Electric Orange, Financial Gold) are reserved strictly for data visualization and specific utility metrics to maintain systematic clarity.

## Typography
The system uses **Hanken Grotesk** for its sharp, contemporary professional feel, ensuring high legibility in dense data environments. For technical readouts and utility labels, **JetBrains Mono** is employed to provide a precise, developer-friendly aesthetic.

The type scale is optimized for WCAG 2.1 Level AA compliance. Headlines are bold and authoritative, while body copy maintains generous line heights to prevent cognitive fatigue during long shifts. For RTL (Arabic) support, font weights are preserved, while the directional flow of line-endings and tracking is mirrored.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model for the main canvas, ensuring data visualization integrity across different monitor sizes.

- **Sidebar Structure**: A high-contrast vertical anchor that supports four states: Expanded (260px), Collapsed (72px), Tablet Peek, and Mobile Drawer. In RTL mode, the sidebar moves to the right.
- **Metric Flow**: A strict vertical hierarchy consisting of Global Header > Workspace Hero > KPI Strip > Main Content Area.
- **Breakpoints**: 
  - Desktop: 1200px+ (12 columns, 24px margins)
  - Tablet: 768px - 1199px (8 columns, 16px margins)
  - Mobile: < 768px (4 columns, 12px margins)
- **Transition**: All layout shifts and theme toggles must use a **300ms ease-in-out** transition to maintain user orientation.

## Elevation & Depth
Elevation is used to communicate the hierarchy of "Energy Forest" modules.

- **Light Mode (Tonal Layers)**: Soft, multi-layered "Linear" shadows. Objects closer to the user have a 4px-8px vertical offset with a wide, low-opacity spread.
- **Dark Mode (Ambient Glow)**: "Apple-style" elevation where raised elements (cards/dialogs) feature a subtle emerald-tinted inner glow and backdrop blur rather than traditional black shadows.
- **Interactive Depth**: Cards utilize a **4px Hover Lift** with a 120ms transition. 
- **Modals**: Use a 12px backdrop blur with a 60% opacity overlay to isolate tasks.

## Shapes
The "Rounded Mandate" is a core accessibility feature designed to reduce visual "hardness" in data-heavy screens.
- **10px Radius**: Standard for buttons, inputs, and selection controls.
- **16px Radius**: Standard for content cards and dashboard widgets.
- **20px Radius**: Reserved for large surface containers like dialogs, popups, and the inner corners of the sidebar.
- **Borders**: 1px solid universal borders are used throughout to define structure without adding visual weight.

## Components
- **Buttons**: Primary buttons are Emerald Green with white text. They feature a 95% scale-down micro-interaction on "Active" state.
- **Cards**: In Dark Mode, cards use a subtle green-charcoal fill (#16221a). In Light Mode, they are pure white with a 1px cool-gray border.
- **Inputs**: Use a 10px radius with 1px borders. Focus states use a 2px Emerald ring.
- **Sidebar**: The deep forest green background remains consistent across modes to maintain brand identity. Icons are monochromatic with an emerald "active" state indicator.
- **KPI Cards**: Floating widgets with a specific 16px radius, housing a large numeric value and a trend sparked line.
- **Data Tables**: Features sticky headers, row-level fade-in animations on load, and high-contrast row separation.
- **Theme Switcher**: A prominent toggle in the global header with a 300ms smooth transition between "Forest Light" and "Deep Forest Dark."