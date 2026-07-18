# ECG-01R-001 — Fix SQL Injection in Admin Service

**Platform:** Security (OWASP A03:2021)  
**Priority:** P0  
**Estimated Effort:** 3-4 days  
**Depends on:** None  

## Objective

Remove SQL injection vulnerabilities from `admin.service.ts` and `admin.controller.ts`.

## Scope

### File: `src/admin/admin.service.ts`

Replace all 6 `$queryRawUnsafe` / `$executeRawUnsafe` calls with Prisma's parameterized API.

**Line 15-20** — Table listing with project filter:
- Current: `$queryRawUnsafe(`SELECT * FROM sim_system."${table}"${projectFilter} ...`)`
- Fix: Use `prisma.$queryRaw` template literal with `$table` sanitized via allowlist + `$1`, `$2` bindings

**Line 50** — Record lookup by field:
- Current: `$queryRawUnsafe(`SELECT id FROM ${ref.table} WHERE ${ref.field} = '${recordId}' LIMIT 10`)`
- Fix: Use Prisma model accessor or parameterized raw query

**Lines 59-66** — INSERT:
- Current: String concatenation for column names and values
- Fix: Use `prisma.$executeRaw` with template literals

**Lines 69-75** — UPDATE:
- Current: String concatenation for column names and values
- Fix: Use `prisma.$executeRaw` with template literals

**Line 82** — DELETE:
- Current: `$executeRawUnsafe(`DELETE FROM ... WHERE id = '${id}'`)`
- Fix: Use Prisma `.delete()` or parameterized `$executeRaw`

### File: `src/admin/admin.controller.ts`

**Lines 74-95** — SQL query endpoint:
- Current: Blocklist-based security (trivially bypassable)
- Fix: Replace with Prisma's typed query builder. If raw SQL must remain, add: strict allowlist validation, query timeout, max rows limit, read-only connection

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint --quiet .` — 0 errors
- Admin endpoints return expected results
- No `$queryRawUnsafe` calls remain in `src/admin/`
