# MeterVerse — System DNA

## Architecture

MeterVerse is a utility metering platform with a **Node.js/Express backend** (Prisma ORM, PostgreSQL) and a **Next.js 16 frontend** (shadcn/ui, TanStack Query). The backend serves REST APIs at `/api/*` with JWT auth + RBAC. The frontend uses a SPA-within-Next.js pattern with GenericAdminPage for CRUD and dedicated pages for workflows.

## Core Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Express.js (not NestJS) | Lightweight, full control, matches team expertise |
| ORM | Prisma | Type-safe, auto-generated client, migration tooling |
| API Versioning | `mount()` helper → `/api` + `/api/v1` | Backward-compatible evolution |
| Auth | JWT + RBAC + area middleware | Multi-tenant area isolation |
| Idempotency | Idempotency-Key header | Safe retries on payment/creation |
| Audit | Append-only audit log with before/after snapshots | Compliance, traceability |
| Frontend | Next.js SPA with zustand store | Rapid admin page construction |
| API Proxy | next.config.ts rewrites → Express backend | BFF pattern, no CORS issues |

## Database

86 tables, 57 FK relationships. Key domains: Metering (Meter, SIMCard, Reading), Billing (Tariff, Invoice, Payment), Customers (Customer, Project, Zone, Unit), Security (User, Role, Permission, AuditEntry).

## Key Flows

1. **Meter → Assignment → Consumption → Invoice → Payment**: Core revenue cycle
2. **SIM → Assign → Release → Cooldown → Reassign**: SIM lifecycle
3. **Reading → Validation → Flag → Review**: Data quality pipeline

## Governance

- AI_BIBLE.md: 4 non-contradictory rules (Tool Compliance, Task Lifecycle, Engineering Standards, Verification Gates)
- All changes require pre-flight checklist (RULE 0)
- Tool usage logged in configs/tool-usage-log.json
- STATUS.yaml files track planning progress
