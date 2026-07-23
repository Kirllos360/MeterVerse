# Shared Standards

## API Standards

| Standard | Rule | Enforced By |
|----------|------|-------------|
| Response format | `{ [entity]: data, total, page, limit }` | Code review |
| Error format | `{ error: string, details?: array }` | errorHandler.js |
| Auth | `Authorization: Bearer <token>` | authenticate middleware |
| System type | `system_type: admin | user | mobile` in login | auth-engine.js |
| Permission keys | `{entity}.{action}` (e.g., `customers.read`) | security.js |
| Pagination | `page` and `limit` query params, cap at 100 | All list endpoints |
| HTTP methods | GET=list, GET/:id=read, POST=create, PUT=update, DELETE=delete | Convention |

## Database Standards

| Standard | Rule | Enforced By |
|----------|------|-------------|
| Model naming | PascalCase, singular | Prisma schema |
| Field naming | camelCase | Prisma schema |
| IDs | UUID v4 | @default(uuid()) |
| Timestamps | createdAt, updatedAt | @default(now()), @updatedAt |
| Soft delete | archivedAt: DateTime? | Convention on core entities |
| Indexes | @@index on all foreign keys | Prisma schema |
| Migrations | Named, timestamped | Prisma Migrate |

## Frontend Standards

| Standard | Rule | Enforced By |
|----------|------|-------------|
| Framework | Next.js 16 App Router | package.json |
| Styling | Tailwind CSS | tailwind.config |
| Admin pages | GenericAdminPage where possible | page-configs.ts |
| Detail pages | [id]/page.tsx pattern | Convention |
| Data fetching | apiClient function | lib/api-client.ts |
| UI components | shadcn/ui | components/ui/ |

## Code Standards

| Standard | Rule |
|----------|------|
| Language | TypeScript (frontend), JavaScript ES modules (backend) |
| Linting | ESLint + Prettier |
| Testing | Vitest (unit), Playwright (E2E) |
| Git | Conventional commits, feature branches |
| CI/CD | GitHub Actions — build, test, security scan |

## Documentation Standards

| Standard | Location |
|----------|----------|
| Architecture docs | docs/architecture/ |
| Planning OS | planning/ |
| API docs | (planned Wave 05 — OpenAPI/Swagger) |
| Knowledge graph | graphiti/index.json |
| Project status | docs/MASTER_KNOWLEDGE_CHECKLIST.md |
| AI memory | .ai/memory/ |

## Standards Enforcement

Standards are enforced through:
1. **GATE_CHECK** — `scripts/gate-check.mjs` validates step completeness
2. **SpecKit** — `speckit/validator.mjs` validates spec compliance
3. **Graphiti Compare** — `graph-compare.mjs` validates architecture alignment
4. **T99 Audit** — Phase-end verification of all dimensions
5. **CI Pipeline** — Automated build + test + security on every push
