# MeterVerse Implementation Rules

**Defines how every frontend feature must be implemented. No page may deviate from these standards.**

---

## 1. Implementation Standards

| Rule | Description |
|------|-------------|
| TypeScript strict | All code must pass `tsc --noEmit` with strict mode |
| No raw values | Colors, spacing, typography via CSS custom properties only |
| Component composition | Pages composed from existing primitives, not custom HTML |
| State management | Zustand for client state, React Query for server state |
| Form validation | Zod schemas for all form validation |
| Error handling | Every API call wrapped in try/catch with user feedback |
| Loading states | Every data fetch has loading skeleton or spinner |
| Empty states | Every list/data view has empty state component |
| Responsive | Every page works at desktop, tablet, mobile breakpoints |
| Accessible | Every interactive element has ARIA attributes |
| Performance | No unnecessary re-renders, memoize where beneficial |
| File naming | kebab-case for files, PascalCase for components, camelCase for hooks |

## 2. File Structure

```
src/
├── app/                         # Next.js App Router pages
│   ├── [domain]/               # Page routes
│   │   ├── page.tsx            # Page component
│   │   └── layout.tsx          # Page layout (if needed)
├── components/
│   ├── ui/                     # Design primitives (Button, Input, etc.)
│   ├── layout/                 # Layout components (AppShell, Sidebar, etc.)
│   ├── shared/                 # Shared business components (SmartTable, etc.)
│   └── [domain]/               # Domain-specific components
├── hooks/                      # Custom React hooks
│   ├── use-[entity].ts         # Data fetching hooks (React Query)
│   └── use-[feature].ts        # Feature hooks
├── lib/
│   ├── api/                    # API client
│   ├── design-tokens/          # Design token definitions
│   ├── i18n/                   # Internationalization
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types
```

## 3. Code Standards

| Standard | Rule |
|----------|------|
| Components | Functional components with hooks, no class components |
| Props | TypeScript interface, destructured with defaults |
| Exports | Named exports only (no default exports) |
| Imports | Absolute imports via `@/` path alias |
| Hooks | Custom hooks for all data fetching and business logic |
| CSS | Tailwind utility classes + CSS custom properties |
| Comments | NOT FOUND IN REPOSITORY — no explanatory comments in code |

## 4. Data Fetching Pattern

```typescript
// All data fetching uses TanStack React Query
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';

export function useCustomersList(projectId: string) {
  return useQuery({
    queryKey: ['customers', projectId],
    queryFn: () => apiGet(`/api/v1/projects/${projectId}/customers`),
    staleTime: 30_000, // 30 seconds
  });
}
```

## 5. State Management Pattern

```typescript
// Client state uses Zustand
import { create } from 'zustand';

interface PageStore {
  currentPage: string;
  navigate: (page: string) => void;
}

export const usePageStore = create<PageStore>((set) => ({
  currentPage: 'dashboard',
  navigate: (page) => set({ currentPage: page }),
}));
```

## 6. Form Validation Pattern

```typescript
// Forms use Zod schemas
import { z } from 'zod';

export const readingSchema = z.object({
  meterId: z.string().uuid(),
  value: z.number().positive(),
  date: z.date(),
  source: z.enum(['manual', 'automated']),
  notes: z.string().optional(),
});
```

## 7. Component Pattern

```typescript
// Components use class-variance-authority for variants
import { cva } from 'class-variance-authority';

const buttonVariants = cva('inline-flex items-center justify-center rounded-md', {
  variants: {
    variant: {
      primary: 'bg-brand-500 text-white hover:bg-brand-600',
      secondary: 'bg-surface-raised text-text-primary border-border-default',
      ghost: 'hover:bg-surface-raised text-text-primary',
    },
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
```
