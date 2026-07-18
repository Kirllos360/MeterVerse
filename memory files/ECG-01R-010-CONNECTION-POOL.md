# ECG-01R-010 — Configure Prisma Connection Pool

**Platform:** Performance  
**Priority:** P1  
**Estimated Effort:** 1 day  
**Depends on:** None  

## Objective

Configure database connection pooling to prevent connection exhaustion under load.

## Scope

### File: `prisma/schema.prisma`

**Line 5-9** — Datasource configuration:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  schemas   = ["sim_system", "core", "features", "area"]
}
```

Add `connection_limit` to the `DATABASE_URL` or configure via Prisma's `pool` settings:
- Add `?connection_limit=20` or appropriate value based on expected concurrent requests
- Add `pool_timeout=30` (seconds to wait for a connection from the pool)

### File: `src/common/database/prisma.service.ts`

**Line 14** — PrismaClient constructor:
```typescript
constructor(...) {
  super({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: [...],
    // Add pool configuration
    connectionLimit: 20,
    poolTimeout: 30,
  });
}
```

Alternatively, set via `DATABASE_URL` query parameters: `postgresql://user:pass@host:5432/db?schema=sim_system&connection_limit=20`

### Production recommendation

Add `PgBouncer` as a sidecar for production deployments — this allows efficient connection multiplexing and reduces PostgreSQL connection overhead.

## Verification

- Application starts and connects successfully
- Concurrent requests share connection pool within configured limit
- No "too many clients" errors under load
- `npx tsc --noEmit` — 0 errors
