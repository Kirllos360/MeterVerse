# Frontend Map

## Architecture Overview
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7 (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand 5 + TanStack React Query 5
- **Auth**: Clerk (multi-tenant)
- **Charts**: Recharts
- **DnD**: dnd-kit
- **Icons**: @tabler/icons-react

## Directory Structure
```
src/
├── app/                    # Next.js App Router (112 page.tsx files)
│   ├── admin/              # Admin SPA (25 nav items)
│   ├── dashboard/          # User workspace
│   ├── api/                # BFF route handlers (119 route.ts files)
│   ├── auth/               # Authentication pages
│   └── layout.tsx          # Root layout
├── components/             # 125 components
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Sidebar, header
│   ├── forms/              # Form components
│   ├── themes/             # Theme system
│   └── effects/            # ErrorBoundary, animations
├── features/               # 11 feature modules
│   ├── auth/
│   ├── overview/
│   ├── products/
│   ├── users/
│   └── ...
├── lib/                    # Shared utilities
├── stores/                 # Zustand stores
├── hooks/                  # Custom hooks
├── config/                 # Navigation, feature flags
├── styles/                 # Global CSS + themes
└── types/                  # TypeScript definitions
```

## Data Flow
```
Browser → Next.js → Route Handler (BFF) → Express Backend → Prisma → PostgreSQL
                  ↕                          ↕
            React Query Cache          next.config.ts rewrites
```

## Key Libraries
- `@clerk/nextjs` — Authentication
- `@tanstack/react-query` — Server state
- `@tanstack/react-table` — Data tables
- `@tanstack/react-form` — Forms
- `zustand` — Client state
- `recharts` — Charts
- `framer-motion` — Animations
- `sonner` — Toasts
- `date-fns` — Date formatting
- `class-variance-authority` — Component variants
