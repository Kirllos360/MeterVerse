# Pattern Library

**Purpose:** Document successful patterns so they are reused, not reinvented.
**Updates:** When a reusable pattern is identified.

| Pattern | Category | Description | Used In | Best For |
|---------|----------|-------------|---------|----------|
| GenericAdminPage | Frontend | Single config-driven admin page for 53+ entities | admin/tables/ | CRUD admin interfaces |
| requirePermission | Backend | Glob-pattern permission matching with super_admin bypass | middleware/permissions.js | Authorization |
| auditLog | Backend | Structured audit logging with user/action/resource/diff | middleware/security.js | Mutation tracking |
| Math.min(100, limit) | Backend | Pagination cap pattern | 9 route files | Preventing OOM |
| business-engine pipeline | Backend | 6-step pipeline: validate→calculate→apply→generate→assemble→post | services/business-engine.js | Complex business workflows |
| React Query + Zod | Frontend+Backend | TanStack Query on frontend, Zod validation on backend | All routes + components | End-to-end type safety |
| Soft Delete | Database | archivedAt timestamp instead of DELETE | Multiple models | Data retention |
| Workspace Runtime | Frontend | Zustand-based runtime engine with tabs, persistence, window management | src/runtime/ | Complex UI state |
