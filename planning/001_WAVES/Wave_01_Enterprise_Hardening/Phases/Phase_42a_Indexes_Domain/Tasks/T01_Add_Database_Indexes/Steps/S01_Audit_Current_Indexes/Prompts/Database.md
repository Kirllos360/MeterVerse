# Database.md — Index Audit

## Objective
Audit all 78 Prisma models for existing indexes and identify missing performance indexes.

## Requirements
1. Check every model for indexes on: FK columns, status fields, createdAt, composite query patterns
2. Identify minimum 20 missing indexes
3. Prioritize by query frequency: Reading > Invoice > Customer > AuditEntry > Meter
4. Document each missing index with: table, columns, type, reason

## Query Patterns to Optimize
- Find readings by meterId ordered by timestamp DESC
- Find invoices by customerId filtered by status
- Count customers by status
- Find audit entries by action ordered by createdAt DESC
- Find meters by customerId

## Files Affected
- ackend/prisma/schema.prisma (add @@index directives)

## Quality Gates
- [ ] All 78 models checked
- [ ] Minimum 20 indexes identified
- [ ] Report generated at planning/001_WAVES/Wave_01/Phases/Phase_42a/Tasks/T01/INDEX_AUDIT_REPORT.md
- [ ] Evidence committed

## Execution
1. Read current schema index patterns (look for @@index, @@unique)
2. For each model, identify query patterns from backend routes
3. Generate CREATE INDEX statements
4. Verify with EXPLAIN ANALYZE patterns
5. Document report
