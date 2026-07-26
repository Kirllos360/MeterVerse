# MeterVerse Frontend Governance

## Enterprise Frontend Architecture Governance

**Target Quality:** Microsoft Azure Portal, SAP Fiori, Linear, Apple Human Interface Guidelines
**Platform Type:** Enterprise Utility Management
**Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5.7

---

## 1. Architecture Principles

### 1.1 Separation by Scope
- **Admin Portal** — Full CRUD, system configuration, user management, audit
- **User Workspace** — Task-oriented, limited scope, guided workflows  
- **Executive Portal** — KPIs, dashboards, high-level metrics
- **Operations Portal** — Real-time monitoring, alerts, ticketing

### 1.2 Component Hierarchy
```
app/                          # Next.js App Router pages
├── admin/                    # Admin SPA (32 nav items)
├── dashboard/                # User workspace
├── api/                      # BFF route handlers
components/
├── ui/                       # shadcn/ui primitives (50+)
├── layout/                   # Sidebar, header, shell
├── forms/                    # Form field wrappers
├── themes/                   # Theme system
├── effects/                  # Error boundaries, animations
features/                     # Feature-based modules
├── auth/                     # Authentication
├── overview/                 # Dashboard analytics
├── products/                 # Product management
```

### 1.3 Data Flow
```
Pages → Service Layer → API Client → Next.js Rewrites → Express Backend → Prisma → PostgreSQL
        ↕
   React Query Cache (30s stale, 5min gc)
```

---

## 2. Component Creation Rules

### 2.1 When to Create a Component
- **DO** create when a UI pattern appears 2+ times
- **DO** create when the pattern has independent state/logic
- **DO NOT** create for single-use layouts (inline is acceptable)
- **DO NOT** nest beyond 4 levels of abstraction

### 2.2 Component Structure
```typescript
// 1. Imports (grouped: React → Libraries → Internal)
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

// 2. Types (exported if used elsewhere)
export interface MeterCardProps {
  meterId: string
  serial: string
  status: "active" | "inactive" | "retired"
}

// 3. Component (function declaration, not arrow)
export function MeterCard({ meterId, serial, status }: MeterCardProps) {
  // 4. Hooks at top
  const [open, setOpen] = useState(false)
  
  // 5. Early returns for loading/error/empty
  if (!meterId) return <Skeleton />
  
  // 6. Render
  return <div>{/* JSX */}</div>
}
```

### 2.3 Naming Conventions
| Element | Convention | Example |
|:--------|:-----------|:--------|
| Components | PascalCase | `MeterCard`, `CustomerTable` |
| Hooks | camelCase, use prefix | `useMeterData`, `useDebounce` |
| Functions | camelCase | `formatCurrency`, `validateEmail` |
| CSS classes | kebab-case | `meter-card`, `customer-table` |
| Files | kebab-case | `meter-card.tsx`, `api-client.ts` |

---

## 3. Styling Rules

### 3.1 CSS Architecture
```
Level 1: Tailwind utility classes (preferred for 90% of cases)
Level 2: CSS custom properties for theme tokens (--mv-*)
Level 3: shadcn/ui component styles (never modify directly)
Level 4: Module CSS for complex layouts (last resort)
```

### 3.2 Prohibited Patterns
```tsx
// ❌ BAD — hardcoded colors
<div style={{ color: '#16A34A', background: '#F8FAF8' }}>

// ❌ BAD — inline styles for layout
<div style={{ marginLeft: '16px', paddingTop: '8px' }}>

// ✅ GOOD — Tailwind utilities
<div className="text-green-600 bg-gray-50">

// ✅ GOOD — CSS variables
<div className="text-[--mv-primary] bg-[--mv-bg]">
```

### 3.3 Spacing Scale
Use Tailwind's spacing scale exclusively: `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px). Never use arbitrary values.

---

## 4. Theme Rules

### 4.1 Token Architecture
```css
:root, [data-theme="green-light"] {
  --mv-primary: #16A34A;
  --mv-primary-strong: #15803D;
  --mv-bg: #F8FAF8;
  --mv-surface: #FFFFFF;
  --mv-card: #FFFFFF;
  --mv-border: #D1D5DB;
  --mv-text: #111827;
  --mv-text-muted: #6B7280;
  --mv-success: #22C55E;
  --mv-warning: #F59E0B;
  --mv-danger: #DC2626;
}

[data-theme="green-dark"] {
  --mv-bg: #071A12;
  --mv-surface: #0B2418;
  --mv-card: #102E20;
  --mv-primary: #22C55E;
  --mv-text: #F8FAFC;
  --mv-text-muted: #94A3B8;
  --mv-border: #1F3D2E;
}

[data-theme="red-light"] {
  --mv-primary: #DC2626;
  --mv-bg: #FAFAFA;
  --mv-surface: #FFFFFF;
  --mv-text: #111827;
}

[data-theme="red-dark"] {
  --mv-bg: #170808;
  --mv-surface: #240D0D;
  --mv-card: #321111;
  --mv-primary: #EF4444;
  --mv-text: #F8FAFC;
  --mv-border: #4A1D1D;
}
```

### 4.2 Theme Switching Rules
- Theme preference stored in `localStorage` key `mv-theme`
- Apply via `data-theme` attribute on `<html>` element
- Transition: `transition-colors duration-300` for smooth switching
- Default: `green-light` for admin portal
- `red-dark` automatically activates during critical alerts/incidents

---

## 5. Accessibility Rules

| Standard | Requirement | Tool |
|:---------|:-----------|:-----|
| WCAG 2.1 AA | Mandatory | axe-core, Lighthouse |
| Color contrast | 4.5:1 minimum | Contrast checker |
| Keyboard nav | All interactive elements | Tab key testing |
| Screen readers | ARIA labels on all inputs | NVDA/VoiceOver |
| Focus indicators | Visible focus ring | Tailwind `focus-visible:ring-2` |
| Reduced motion | Respect `prefers-reduced-motion` | Framer Motion `useReducedMotion` |

### 5.1 Prohibited Patterns
```tsx
// ❌ BAD — missing ARIA
<button onClick={handleClick}><Icon /></button>

// ❌ BAD — keyboard inaccessible
<div onClick={handleClick}>Click me</div>

// ✅ GOOD
<button onClick={handleClick} aria-label="Delete meter">
  <Icon />
</button>

// ✅ GOOD — keyboard accessible
<div onClick={handleClick} onKeyDown={handleKey} tabIndex={0} role="button">
  Click me
</div>
```

---

## 6. Responsive Rules

### 6.1 Breakpoint Strategy
```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Wide desktop */
2xl: 1536px /* Ultra-wide */
```

### 6.2 Admin Layout Responsiveness
```tsx
// Sidebar: collapsible on mobile
<div className="flex">
  <Sidebar className="hidden lg:flex w-60" />
  <main className="flex-1 px-4 md:px-6 lg:px-8">
    {children}
  </main>
</div>

// Cards: stack on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {cards.map(card => <Card key={card.id}>{card.content}</Card>)}
</div>
```

### 6.3 Table Responsiveness
- Desktop: Full table with all columns
- Tablet: Hide less important columns via `hidden md:table-cell`
- Mobile: Card view instead of table rows

---

## 7. AI Modification Rules

### 7.1 Allowed Operations
- ✅ Add CSS variables for theming
- ✅ Create ThemeProvider + ThemeSwitcher components
- ✅ Migrate Tailwind colors to CSS variables
- ✅ Add accessibility attributes
- ✅ Add responsive breakpoints
- ✅ Create new feature components following existing patterns
- ✅ Fix TypeScript errors

### 7.2 Prohibited Operations
- ❌ Rewrite entire frontend architecture
- ❌ Replace Next.js App Router
- ❌ Remove existing business logic
- ❌ Break API integration layer
- ❌ Replace authentication system
- ❌ Remove permission checks
- ❌ Change database schema
- ❌ Modify backend routes

### 7.3 Review Requirements
Every AI change must pass:
1. `npx tsc --noEmit` — Zero type errors
2. `npm run lint` — Zero warnings
3. `npm run build` — Successful build
4. Playwright visual regression — No UI breaks
5. Accessibility (axe-core) — No violations

---

## 8. Code Ownership

| Module | Owner | Review Required |
|:-------|:------|:----------------|
| `app/admin/` | Admin Team | Always |
| `app/dashboard/` | UX Team | Always |
| `components/ui/` | Platform Team | Never modify (shadcn) |
| `components/layout/` | Platform Team | Major changes |
| `features/` | Feature Teams | Per feature |
| `lib/` | Platform Team | Always |
| `styles/` | Design System | Always |
