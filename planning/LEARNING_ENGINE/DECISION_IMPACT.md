# Decision Impact

**Purpose:** Track the actual impact of decisions over time. Did the choice work?
**Updates:** After each Wave, review past decisions.

| Date | Decision | Expected Impact | Actual Impact | Verdict | Links |
|------|----------|:---------------:|:-------------:|:-------:|-------|
| 2026-Q1 | React Query for data fetching | Built-in caching, refetching, optimistic updates | Confirmed. 60s staleTime works well. Caching reduces API calls by ~40%. | ✅ CORRECT | Frontend src/lib |
| 2026-Q1 | PostgreSQL with Prisma | ACID compliance, type-safe queries | Confirmed. No data integrity issues. Migration tooling robust. | ✅ CORRECT | Backend prisma/ |
| 2026-Q1 | RBAC permission model | Simple, well-understood, sufficient | Partially confirmed. 57 keys defined but only 8/21 routes enforce them. Migration incomplete. | ⚠️ RIGHT MODEL, NEEDS EXECUTION | T17 |
| 2026-Q1 | SYMBIOT integration | External dependency for meter data | Cannot yet evaluate. No SYMBIOT integration built. | ❓ UNTESTED | W08 |
| 2026-Q1 | Arabic language support | Mirrored UI, RTL layout support | Frontend has RTL capability but Arabic content not verified. | ⚠️ UNVERIFIED | Knowledge Base 03 |
| 2026-Q2 | GenericAdminPage pattern | 53 admin pages from config | Confirmed. 46/53 pages built from config. 7 detail pages for complex entities. | ✅ CORRECT | Frontend admin/ |
| 2026-Q2 | Planning OS freeze | Prevent scope creep | Confirmed. No scope creep despite 70 gaps found. Planning stayed stable. | ✅ CORRECT | planning/VERSION |
