# Section 2 — Official Enterprise Technology Stack

**Status:** FROZEN — No alternative stacks permitted.

---

## Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.2.6 | App Router, SSR, static generation |
| Language | TypeScript | 5.x | Strict mode |
| UI Runtime | React | 19 | Server + Client components |
| Styling | Tailwind CSS | 4 | Utility-first with CSS custom properties |
| Primitives | shadcn/ui | Latest | Accessible Radix UI wrappers |
| Animation | Motion (framer-motion v12) | 12 | Enterprise motion system |
| Client State | Zustand | 5 | Lightweight stores with persistence |
| Server State | TanStack React Query | 5 | Data fetching, caching, mutations |
| Table | TanStack Table (built into SmartTable) | — | Virtualized, sortable, filterable |
| Charts | Recharts | Latest | SVG-based, responsive |
| Forms | React Hook Form + Zod | Latest | Performant forms with schema validation |
| i18n | next-intl | Latest | Internationalization, RTL support |

## Backend Integration

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API | NestJS REST (/api/v1) | All business operations |
| Database ORM | Prisma ORM | Type-safe database access |
| Database | PostgreSQL 16 | Primary data store |
| Reports | JasperReports 7.0.1 | PDF, Excel, CSV generation |
| Report Templates | JRXML | Report design files |
| Excel Import | Custom engine | Bulk data import |
| Excel Export | Custom engine | Table data export |
| Data Format | CSV | Simple data exchange |
| Data Format | PDF | Invoice, report output |
| Legacy Sync | Symbiot Bridge | External meter data integration |
| Legacy Migration | Custom migration engine | SBill, Collection System |
| Billing Engine | Custom tariff engine | Consumption-based billing |
| Message Queue | RabbitMQ (planned) | Async job processing |
| Cache | Redis | Session, rate limiting |

## Prohibited

| Technology | Reason |
|-----------|--------|
| Bootstrap | Not enterprise. Deprecated style. |
| Material UI | Heavy. Not compatible with CSS tokens. |
| Ant Design | Chinese-centric. Poor RTL support. |
| jQuery | Not React. Legacy. |
| Redux | Overkill. Zustand is sufficient. |
| CSS Modules | Tailwind handles all styling. |
| SASS/SCSS | Tailwind + CSS variables cover all needs. |
| Any chart library other than Recharts | Consistency. Single chart ecosystem. |
| Any icon library other than Lucide | Consistency. Single icon ecosystem. |
