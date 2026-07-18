# MeterVerse Design DNA

**The authoritative visual language for MeterVerse. No component may define its own colors, spacing, typography, animation, or elevation.**

---

## 1. Design Identity

MeterVerse is an Enterprise Utility Operating System. The visual identity communicates:
- **Professional** — Clean lines, generous whitespace, structured layouts
- **Intelligent** — Data-dense but readable, charts and KPIs at a glance
- **Reliable** — Consistent patterns, predictable interactions, stable grids
- **Modern** — Subtle motion, semantic color, accessible by default

## 2. Brand Elements

| Element | Specification |
|---------|---------------|
| Logo | Geometric MV monogram in brand-500 |
| Tagline | "Enterprise Utility Intelligence" |
| Voice | Professional, clear, concise |
| Primary color family | Blue-based (trust, technology, utility) |
| Secondary color family | Teal-based (growth, sustainability, solar) |

## 3. Design Principles

| Principle | Application |
|-----------|-------------|
| **Data-first** | Design for data density. Tables, charts, and lists are primary. Whitespace supports readability. |
| **Semantic everywhere** | Every color, spacing, and typography choice has meaning. Nothing is decorative. |
| **Consistency over creativity** | Use existing patterns. Do not invent new ones for each page. |
| **Accessibility by default** | High contrast, clear typography, keyboard navigation, screen reader support. |
| **Performance matters** | Animations are 150-300ms. No jank. No layout shift. TTI <3s. |

## 4. Visual Hierarchy

| Level | Treatment |
|-------|-----------|
| Page title | text-2xl, font-bold, text-text-primary |
| Section heading | text-lg, font-semibold, text-text-primary |
| Card title | text-base, font-semibold, text-text-primary |
| Body text | text-sm, font-normal, text-text-secondary |
| Caption/label | text-xs, font-medium, text-text-tertiary |
| Data value | text-lg or text-xl, font-semibold, text-text-primary |
| Metric/stat | text-2xl or text-3xl, font-bold, brand or status color |

## 5. Layout Principles

- **Max content width:** 1440px (with 32px padding on each side)
- **Sidebar:** 280px expanded, 64px collapsed
- **Top nav:** 64px fixed
- **Content padding:** 32px (desktop), 24px (tablet), 16px (mobile)
- **Card padding:** 24px (desktop), 16px (mobile)
- **Grid:** 12-column responsive grid — sm:1, md:2, lg:3, xl:4
