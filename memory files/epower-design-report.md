# ePower Design System & Visual Experience Report

**Site:** https://epower.com.eg/en  
**Built with:** Next.js (React)  
**Target:** Extract theme keys for ChatGPT vision alignment

---

## 1. Is This the Company We're Building For?

**Yes.** ePower provides the exact energy/metering/utility solutions that our backend system manages. Our system's domain:
- Meter management (electricity, water, solar, gas, chilled water)
- Billing & invoicing (with water-difference policies, tariffs)
- Reading management & water balance
- KPI dashboards & project management

Their site offers "Metering Solutions" as a core service — integrated smart/prepaid meter deployment, management platforms, consumption analytics. Our backend is the engine behind that.

---

## 2. Full Site Structure (All Pages)

| # | Page | URL |
|---|------|-----|
| 1 | Home (hero with video slider) | /en |
| 2 | About | /en/about |
| 3 | Services Overview | /en/services |
| 4 | Contracting Services | /en/services/contracting-services |
| 5 | **Metering Solutions** ⬅ our domain | /en/services/metering-solutions |
| 6 | Utility Services | /en/services/Utility-Services |
| 7 | Facility Management | /en/services/facility-management |
| 8 | Sectors Overview | /en/sectors |
| 9 | Governmental Entities | /en/sectors/governmental-entities |
| 10 | Real Estate Developers | /en/sectors/developers |
| 11 | Industrial & Commercial | /en/sectors/industrial-commercial |
| 12 | EV Charging | /en/charging |
| 13 | Careers | /en/careers |
| 14 | Blog | /en/blog |
| 15 | Contact | /en/contact |
| 16 | Projects (portfolio) | /en/projects |
| 17 | Project: Caesar | /en/projects/caesar |
| 18 | Project: Uvenues | /en/projects/uvenues |
| 19 | Project: Badya | /en/projects/Badya |
| 20 | New Customer (contract) | /en/contract |
| 21 | My Account | /en/my-account |
| 22 | FAQs | /en/faqs |
| 23 | Privacy Policy | /en/privacy |
| 24 | Terms of Service | /en/terms |
| 25 | Cookie Policy | /en/cookies |

---

## 3. Brand Color Palette (Theme Tokens for ChatGPT)

```json
{
  "brand": {
    "primary":       "#1e3a8a",  // Deep navy blue
    "lime":          "#aace38",  // Signature lime green
    "electric-blue": "#3b82f6",  // Electric/action blue
    "sky-blue":      "#60a5fa",  // Light accent blue
    "destructive":   "#ef4446",  // Red for errors
    "success":       "#22c55e",  // Green for positive metrics
    "warning":       "#facc15",  // Amber/yellow
    "chart-1":       "#1e3a8a",
    "chart-2":       "#3b82f6",
    "chart-3":       "#facc15",
    "chart-4":       "#22c55e",
    "chart-5":       "#60a5fa"
  },
  "grays": {
    "50":  "#f8fafc",
    "100": "#f1f5f9",
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a",
    "950": "#020617"
  },
  "surfaces": {
    "background":  "#ffffff",
    "foreground":  "#0f172a",
    "card":        "#ffffff",
    "card-border": "#e2e8f0",
    "muted":       "#f1f5f9",
    "muted-text":  "#64748b",
    "popover":     "#ffffff",
    "input":       "#e2e8f0",
    "ring":        "#3b82f6",
    "radius":      "0.625rem"
  },
  "sidebar": {
    "background": "#f8fafc",
    "foreground": "#0f172a",
    "primary":    "#1e3a8a",
    "accent":     "#eff6ff"
  }
}
```

---

## 4. Gradient Definitions

| Usage | Gradient |
|-------|----------|
| **Text gradient** (headings) | `linear-gradient(to right in oklab, #1e3a8a, #3b82f6, #60a5fa)` |
| **Animated text gradient** | `linear-gradient(90deg, #aace38, #3b82f6, #60a5fa, #aace38, #3b82f6)` — flows left-to-right |
| **Brand bar** (bottom of cards) | `linear-gradient(to right, #1e3a8a, #aace38)` |
| **Dark section bg** | `linear-gradient(to bottom, #020617, #0f172a, #020617)` |
| **Card gradient overlay** | `linear-gradient(to bottom right, rgba(30,58,138,0.05), transparent, rgba(170,206,56,0.05))` |
| **Progress bar** (top of page) | `linear-gradient(90deg, #aace38, #3b82f6, #60a5fa)` |
| **Icon bg** | `linear-gradient(to bottom right, rgba(170,206,56,0.2), rgba(59,130,246,0.1))` |
| **Grid pattern** (dark sections) | `linear-gradient(rgba(180,212,41,0.1) 1px, transparent 1px)` repeated |
| **Vertical accent lines** | Transparent → lime/electric → transparent |

---

## 5. Typography

- **Primary font:** `Inter` (loaded as variable font)
- **Fallback stack:** `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`
- **Serif:** `"Times New Roman"` (limited use)

**Font size scale:**
| Token | Size | Line Height |
|-------|------|-------------|
| xs | 0.75rem | 1 |
| sm | 0.875rem | 1.25 |
| base | 1rem | 1.5 |
| lg | 1.125rem | 1.75 |
| xl | 1.25rem | 1.75 |
| 2xl | 1.5rem | 2 |
| 3xl | 1.875rem | 2.25 |
| 4xl | 2.25rem | 2.5 |
| 5xl | 3rem | 1 |
| 6xl | 3.75rem | 1 |
| 7xl | 4.5rem | 1 |
| 8xl | 6rem | 1 |

**Font weights:** light(300), medium(500), semibold(600), bold(700), black(900)

**Letter spacing:** tighter(-0.05em), tight(-0.025em), normal, wide(0.025em), wider(0.05em), widest(0.1em)

**Gradient text headings** — large headings use the blue-to-sky gradient with `background-clip: text; -webkit-text-fill-color: transparent` for a premium polished look.

---

## 6. Animations & Micro-interactions

### CSS Keyframe Animations

| Name | Duration | Timing | Purpose |
|------|----------|--------|---------|
| `spin` | 1s | linear infinite | Loading spinners |
| `ping` | 1s | cubic-bezier(0,0,0.2,1) infinite | Radar pulse on active indicators (live status dots) |
| `pulse` | 2s | cubic-bezier(0.4,0,0.6,1) infinite | Soft opacity pulse for "live" badges |
| `gradient-flow` | 4s | linear infinite | Animated gradient sweep across text |

### Hover & Transition Effects

- **Cards:** `transition-all duration-500` — smooth 500ms on hover
- **Card hover:** border color shifts to `epower-lime/30`, box shadow grows with green glow
- **Card icon:** `group-hover:scale-110` — icon scales up on hover
- **Card overlay:** gradient overlay fades in (`opacity-0 → opacity-100`, 500ms)
- **Buttons:** background color transitions, arrow icons slide on hover
- **Accent bar at card bottom:** persists as brand indicator line

### Entrance Animations (Scroll-based)

- Sections fade and slide up as they enter the viewport (via Intersection Observer)
- Stats counters animate from 0 to their target value
- Partner logos scroll in a continuous marquee/carousel

### Hero Section

- Full-width video background with gradient overlay
- Carousel slider with slide counter ("01/01")
- Pause/unmute controls for the video
- Scroll indicator (animated down arrow) at bottom of hero

### Navigation

- Mobile: hamburger menu with slide-out drawer
- Desktop: dropdown menus for Services and Developers with smooth opening
- Active page indicator: gradient bar (blue → lime) under nav items
- Fixed header on scroll with backdrop blur

### Utility Elements

- **Top progress bar:** Fixed 3px bar at top of page that fills from left to right as user scrolls
- **Scroll-to-top button:** Appears at bottom-right on scroll, with backdrop blur
- **WhatsApp floating button:** Fixed bottom-right, opens WhatsApp chat
- **Badges:** Section labels with `backdrop-blur-md`, `rounded-full`, `bg-white/10`

---

## 7. Glassmorphism / Transparency / Backdrop Blur

Used extensively for a modern, premium feel:

| Element | Effect |
|---------|--------|
| Section labels/badges | `backdrop-blur-md` (12px) on `bg-white/10` |
| Dark section cards | `backdrop-blur-sm` (8px) on gradient backgrounds |
| Fixed header on scroll | `backdrop-blur-sm` |
| Hero video controls | `backdrop-blur-sm` on `bg-white/10` buttons |
| Scroll-to-top button | `backdrop-blur-sm` on `bg-epower-gray-800/90` |
| Partner logo containers | translucent backgrounds with blur |

**Opacity tokens used:** `/5`, `/10`, `/20`, `/30`, `/50`, `/60`, `/75`, `/80`, `/90`

---

## 8. Layout System

- **Container widths:** xs(20rem), sm(24rem), md(28rem), lg(32rem), xl(36rem), 2xl(42rem), 3xl(48rem), 4xl(56rem), 5xl(64rem), 6xl(72rem), 7xl(80rem)
- **Spacing unit:** 0.25rem (4px base)
- **Border radius:** default 0.625rem (10px), xs(0.125rem), card containers use `rounded-2xl`
- **Shadows:** `shadow-sm` on cards, hover states use `shadow-[0_20px_60px_-15px_rgba(180,212,41,0.15)]` (green glow)

---

## 9. Page Component Patterns (Reusable in Our System)

1. **Hero Section** — Full-width dark gradient with video/image + headline + CTA buttons
2. **Stats Counter Section** — Animated numbers with icons (savings, customers, projects, MW)
3. **Service Cards** — 3-column grid, card with icon, heading, description, "Learn more" link, gradient bottom bar
4. **Sector Cards** — Image card with overlay text + "Explore Sector" CTA
5. **Features Grid** — 4-column icon+text feature highlights
6. **CTA Section** — Dark themed with feature tags + "Start a Conversation" / "Learn About Us" buttons
7. **Project Cards** — Image background + project badge (year, type) + dark overlay
8. **Partner Logo Carousel** — Infinite scroll logos
9. **Footer** — 5-column layout (Brand+Social, Services, Company, Resources, Contact)
10. **Testimonial/Trust Bar** — "Trusted by Industry Leaders" with partner logos

---

## 10. Instructions to Feed ChatGPT

> We're building the UI for **epower's meter management & billing platform** (a B2B SaaS system for utility management). The epower corporate website at https://epower.com.eg/en defines the brand. Use these design tokens as the foundation for the admin dashboard UI:
>
> **Brand colors:** Primary=#1e3a8a, Lime=#aace38, Electric Blue=#3b82f6, Sky Blue=#60a5fa. Use the blue-to-lime gradient (#1e3a8a → #aace38) for brand accents and bars. Use blue spectrum gradient (#1e3a8a → #3b82f6 → #60a5fa) for text gradients and progress indicators.
>
> **Typography:** Inter font family. Gradient text effect on large headings (background-clip: text). Headings: bold(700)/black(900). Body: medium(500).
>
> **Glassmorphism:** Apply backdrop-blur-sm/md on cards, badges, navigation, and overlays. Use translucent backgrounds (white/5 → white/20 range).
>
> **Animations:** 500ms transitions on all interactive elements. Hover effects: scale-110 on icons, border color shifts to lime/30, green glow shadows. Use ping animation for "live" status indicators. Pulse for active badges.
>
> **Card design:** rounded-2xl (16px border radius), gradient overlay on hover, brand accent bar at bottom (blue→lime gradient), backdrop blur on dark variants.
>
> **Layout:** Fixed header with backdrop blur. Progress bar at top (same blue→lime→sky gradient) that fills on scroll. Dark sections alternate with white. Container max-width 80rem.
>
> **Dashboard-specific:** Apply the same dark gradient backgrounds (#020617 → #0f172a → #020617) for sidebar/menus. Use the lime green (#aace38) for success states and active indicators. Keep the same grid pattern overlay for empty states.
>
> The goal: ensure the meter management admin UI feels like a seamless extension of the epower brand website — same visual language, same level of professionalism.
