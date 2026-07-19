# MeterVerse — Architecture Rules for AI Agents

## Project Structure
```
Frontend/         → Next.js 16 App Router (all frontend code)
backend/          → Express + Prisma + PostgreSQL
docs/             → Architecture, design system, reviews, screenshots
.ai/              → AI memory, prompts, reviews
.github/workflows/ → CI/CD pipeline
```

## Frontend Architecture

### BFF Pattern (Backend-For-Frontend)
1. Frontend NEVER calls backend directly
2. All API calls go through `src/app/api/*` route handlers
3. Route handlers call `apiBackend()` which checks `NEXT_PUBLIC_API_URL`
4. If backend is available → proxy to real backend
5. If backend is unavailable → fall back to mock data

### Service Layer Pattern
```
features/*/api/
  types.ts      → Type contracts (response shapes, filters, payloads)
  service.ts    → Data access functions (swap for your backend)
  queries.ts    → React Query options + key factories
```

### Component Architecture
```
Runtime Kernel → Registry → Event Bus → Data Engine → Workflow
    ↓
Workspace Engine (sidebar, toolbar, inspector, tabs)
    ↓
Custom Components (enterprise, effects)
    ↓
shadcn/ui Components (Button, Input, Dialog, etc.)
    ↓
Design Tokens (--brand, --surface, --text, --border, etc.)
```

### State Management
- Zustand for local UI state (workspace store)
- React Query for server state (data fetching, caching)
- URL search params for filter/sort/page state

## Backend Architecture

### API Routes
```
POST /api/auth/login       → JWT authentication
POST /api/auth/register    → User registration
GET  /api/auth/me          → Session validation

GET/POST /api/customers    → Customer CRUD
GET/POST /api/meters       → Meter CRUD
GET/POST /api/readings     → Readings with filters
GET/POST /api/invoices     → Invoice CRUD
GET/POST /api/payments     → Payment CRUD
```

### Middleware
- `helmet()` — security headers (X-Frame-Options, CSP, etc.)
- `cors()` — cross-origin resource sharing
- `express-rate-limit` — 100 req/15min per IP
- JWT authentication via `authenticate` middleware
- Zod validation for request bodies

## CI/CD Pipeline
```
Push/PR → Build → Tests → Screenshots → Visual Regression → AI Review → Reports
```

1. TypeScript check (`tsc --noEmit`)
2. Lint (`oxlint`)
3. Build (`next build`)
4. Playwright E2E tests
5. Screenshot capture (57 screenshots)
6. Visual regression comparison
7. Final audit
8. Enterprise AI review (8 reports)
9. DeepSeek code review
10. PR summary comment

## Documentation
- `docs/` — generated reports, screenshots, reviews
- `.ai/` — AI memory, prompts, sprint tracking
- `README.md` — project overview
- `AGENTS.md` — AI coding agent reference
- `PRD.md` — product requirements
- `ROADMAP.md` — development plan
- `CHANGELOG.md` — version history
