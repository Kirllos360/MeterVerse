# Migration Catalog

**Purpose:** Every migration is documented with rollback and validation.

| Migration | From | To | Status | Rollback | Validation |
|-----------|------|----|--------|----------|-----------|
| M01: Init Schema | Empty | 78 models | ✅ Applied | Drop all tables | Schema valid, server starts |
| M02: Add Indexes | No indexes | 68 indexes | ✅ Applied | Remove indexes | EXPLAIN ANALYZE shows index scans |
| M03: User Auth Fields | No lockout | loginAttempts, lockedUntil | ✅ Applied | Remove columns | Lockout works after 5 failures |

### Migration Policy
1. All migrations are versioned and timestamped
2. Rollback script must exist before migration runs
3. Validation step must pass before marking complete
4. Data integrity check required for data migrations
