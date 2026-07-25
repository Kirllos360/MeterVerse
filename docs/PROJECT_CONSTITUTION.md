# MeterVerse — Project Constitution

## Mission
Enterprise utility metering and billing platform for multi-area, multi-utility management.

## Principles
1. **Quality First**: Every commit must pass tsc + vitest
2. **Schema-Driven**: All data models defined in Prisma schema before any route
3. **Secure by Default**: Every route requires authentication + authorization
4. **Auditable**: Every mutation is logged with before/after snapshots
5. **Idempotent**: All mutations support idempotency keys
6. **Tested**: 100% route coverage via integration tests
7. **Documented**: OpenAPI specs + AGENTS.md + SYSTEM_DNA.md

## Decision Records
- Express.js over NestJS (lightweight, team expertise)
- Prisma over TypeORM (type safety, migration tooling)
- JWT over sessions (stateless, multi-service)
- next.config.ts rewrites over CORS (BFF pattern)
- SPA-in-Next.js over separate React app (deployment simplicity)
