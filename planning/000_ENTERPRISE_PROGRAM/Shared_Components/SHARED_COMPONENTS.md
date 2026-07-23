# Shared Components

## Frontend Shared Components

| Component | Location | Status | Used By |
|-----------|----------|--------|---------|
| GenericAdminPage | tables/GenericAdminPage.tsx | ✅ Live | 46/53 admin pages |
| Card | ui/card.tsx | ✅ Live | All pages |
| Button | ui/button.tsx | ✅ Live | All pages |
| Badge | ui/badge.tsx | ✅ Live | All pages |
| Skeleton | ui/skeleton.tsx | ✅ Live | All pages |
| Table | ui/table.tsx | ✅ Live | All pages |
| apiClient | lib/api-client.ts | ✅ Live | All pages |

## Backend Shared Components

| Component | Location | Status | Used By |
|-----------|----------|--------|---------|
| auth-engine | services/auth-engine.js | ✅ Live | All routes |
| notification-engine | services/notification-engine.js | ✅ Live | All routes |
| auditLog | middleware/security.js | ✅ Live | All routes |
| trackRequest | middleware/monitor.js | ✅ Live | All routes |
| requirePermission | middleware/security.js | ✅ Live | 5 route files |
| errorHandler | middleware/errorHandler.js | ✅ Live | All routes |

## Shared Standards

| Standard | Location | Status |
|----------|----------|--------|
| API response format | { [entity]: data, total, page, limit } | ✅ Standardized |
| Error format | { error: string, details?: array } | ✅ Standardized |
| Auth header | Authorization: Bearer <token> | ✅ Standardized |
| Permission key format | {entity}.{action} (e.g., customers.read) | ✅ Standardized |
| System type | system_type: admin | user | mobile | ✅ Standardized |
| JWT payload | { sub, email, role, system, scope } | ✅ Standardized |
