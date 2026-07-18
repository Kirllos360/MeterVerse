# ECG-01R-009 — Fix Admin Mass Assignment

**Platform:** Security (OWASP A04:2021)  
**Priority:** P1  
**Estimated Effort:** 2 days  
**Depends on:** ECG-01R-001 (SQL injection fix)  

## Objective

Prevent arbitrary column writes in the admin service. Every INSERT/UPDATE must validate which columns are allowed.

## Scope

### File: `src/admin/admin.service.ts`

**`insertRecord(table, data)`** and **`updateRecord(table, id, data)`**:

1. Create per-table column allowlists:
   ```typescript
   const ALLOWED_COLUMNS: Record<string, string[]> = {
     meter: ['serialNumber', 'meterType', 'status', 'projectId', ...],
     customer: ['name', 'phone', 'email', 'status', ...],
     // ... all tables
   };
   ```

2. Before any INSERT/UPDATE, validate:
   - Table name is in allowlist
   - Every key in `data` is in the table's allowed columns list
   - Reject unknown keys with 400 error

3. Add role-based field-level permissions:
   - SUPER_ADMIN: full access to all allowed columns
   - ADMIN: read-only + subset of writeable columns
   - No lower role may use admin service

4. After SQL injection fix (ECG-01R-001 is complete), verify the raw SQL calls are already parameterized. The column allowlist adds defense-in-depth.

## Verification

- `npx tsc --noEmit` — 0 errors
- INSERT with unknown column → 400 error
- UPDATE with unauthorized column → 400 error
- All existing admin workflows continue working
- No `Record<string, any>` flows into raw SQL after both fixes
