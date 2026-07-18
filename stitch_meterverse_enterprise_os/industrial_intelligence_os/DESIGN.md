---
name: Industrial Intelligence OS
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e5e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#46464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76767e'
  outline-variant: '#c6c6ce'
  surface-tint: '#575d78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141a32'
  on-primary-container: '#7c839f'
  inverse-primary: '#bfc5e4'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2c1603'
  on-tertiary-container: '#a17d61'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#bfc5e4'
  on-primary-fixed: '#141a32'
  on-primary-fixed-variant: '#3f465f'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#e8be9f'
  on-tertiary-fixed: '#2c1603'
  on-tertiary-fixed-variant: '#5e4029'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e5e2e4'
  success-emerald: '#10B981'
  warning-amber: '#F59E0B'
  error-red: '#EF4444'
  info-cyan: '#06B6D4'
  monitoring-purple: '#8B5CF6'
  utility-lime: '#AACE38'
  neutral-gray-surface: '#F9FAFB'
  neutral-gray-border: '#E5E7EB'
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
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
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
  grid-margin: 24px
  gutter: 16px
  section-gap: 32px
  compact-row: 8px
---

## Brand & Style

The design system is engineered for high-stakes utility management, where precision meets industrial scale. It projects a brand personality of **authoritative reliability, technical sophistication, and operational clarity**. The target audience includes grid operators, utility executives, and field engineers who require a "cockpit" experience that balances massive data density with effortless cognitive load management.

The visual style is **Corporate / Modern** with a **Tactile** edge. It utilizes a sophisticated layering system reminiscent of modern OS environments (Stripe, Apple, Linear). By combining high-density information grids with subtle glassmorphism and soft premium shadows, the design system transforms complex utility data into a manageable, professional interface. It is designed to feel like a high-performance instrument—coldly efficient yet refined and approachable.

## Colors

The palette is anchored by **Corporate Blue (#0A1128)**, a deep, trustworthy navy that provides the professional weight required for an enterprise utility OS. This is supported by an energetic **Action Blue (#3B82F6)** for primary interactions. 

For functional status monitoring—critical for water, gas, and electricity—we employ a semantic spectrum:
- **Financial Green**: For positive flow, billing health, and active status.
- **Monitoring Purple**: Specifically for analytical overlays and secondary data streams.
- **Utility Lime**: A nod to industrial energy sectors, used for highlighting renewable energy (solar) or high-efficiency metrics.

The system supports four distinct modes: **Light** (clean, paper-like), **Dark** (low-eye-strain for NOC environments), **Gray** (low-contrast for high-density data entry), and **Adaptive** (system-matching). Surface colors use subtle blue tints in their gray values to maintain brand cohesion across all neutral tiers.

## Typography

This design system uses a tri-font strategy to optimize for different data types. **Hanken Grotesk** serves as the display face, offering a sharp, contemporary "tech-industrial" feel for headlines. **Inter** handles the bulk of the interface, chosen for its exceptional legibility in dense SaaS environments and its neutral, professional tone.

Crucially, **JetBrains Mono** is introduced for labels, meter readings, and technical data points. The monospaced nature ensures that fluctuating numerical values (kilowatts, cubic meters, flow rates) do not cause horizontal layout shifts, providing a stable visual environment for real-time monitoring.

For RTL support, font weights are preserved, while line heights are increased by 10% to accommodate Arabic script descenders without sacrificing density.

## Layout & Spacing

The layout philosophy is a **Hybrid Fluid-Fixed Grid**. Dashboards utilize a 12-column fluid grid to maximize screen real estate on ultra-wide monitors used in control rooms, while sidebars and utility panels are fixed-width to ensure tool consistency.

A **4px base unit** creates a rigorous spacing rhythm. For high-density data views (like meter logs), we use "Compact Mode" spacing (8px padding). For strategic overviews (executive dashboards), we transition to "Spacious Mode" (24px padding). 

**Breakpoints:**
- **Desktop (1440px+):** Full 12-column visibility with permanent side navigation.
- **Tablet (768px - 1439px):** Content reflows to 2 columns; side navigation collapses to an icon bar.
- **Mobile (Under 767px):** Single column flow; card-based data summaries; bottom-sheet navigation for primary OS actions.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Subtle Glassmorphism**. The base application surface is the lowest tier (Level 0).
- **Level 1 (Cards/Sidebar):** Slightly elevated using a subtle 1px border (#E5E7EB) or a faint backdrop blur (12px) in dark mode.
- **Level 2 (Popovers/Dropdowns):** Utilizes "Ambient Shadows"—soft, diffused shadows with a 15% opacity of the primary navy (#0A1128) to create depth without visual clutter.
- **Level 3 (Modals):** High-contrast outlines combined with a backdrop dimming effect (scrim) to focus the operator's attention on critical tasks.

In Dark Mode, elevation is communicated by increasing the lightness of the surface color rather than increasing shadow opacity, maintaining a clean, modern aesthetic.

## Shapes

The design system utilizes a **Rounded** shape language (8px to 12px) to soften the industrial nature of the data. 
- **Standard UI Elements (Buttons, Inputs):** 8px (0.5rem) provides a modern, professional look.
- **Containers & Cards:** 16px (1rem) creates a distinct "OS" feel, separating functional zones.
- **Status Tags/Chips:** Pill-shaped (fully rounded) to differentiate them from interactive buttons.

This geometric approach ensures that while the system is high-density, it feels approachable and modern rather than dated or overly rigid.

## Components

### Buttons & Inputs
Buttons use high-contrast fills for primary actions (Action Blue) and ghost-style borders for secondary actions. Inputs feature a 2px focus ring in Action Blue to ensure accessibility. Input labels use `label-md` (JetBrains Mono) to emphasize their technical nature.

### Cards & Monitoring Tiles
The "Utility Tile" is a custom component designed for this system. It features a top-aligned status indicator (sparkline) and a large-format numerical reading using `headline-md`. Tiles use a 1px internal border to define space within the grid.

### Lists & Data Tables
Tables are the heart of the system. They feature:
- Sticky headers for long logs.
- Zebra striping using a 2% tint of Corporate Blue.
- Hover states that elevate the row slightly using a subtle shadow to help eye-tracking.

### Interactive Elements
Checkboxes and radio buttons are slightly oversized (20px) to facilitate easy clicking in field environments. All navigation elements feature a 200ms "Linear-inspired" transition, moving smoothly between active and inactive states with a slight vertical translation on hover.

### Floating Action Center
A unique "Global Monitoring" component sits at the bottom right of the screen, using a glassmorphic background blur and high-saturation status icons to provide real-time alerts for gas/water/electricity leaks or surges across the entire grid.