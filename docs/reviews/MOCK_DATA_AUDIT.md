# Phase K: Mock Data Audit

## Every Page Uses Mock Data

| Page | Data Source | Real Data? | Notes |
|------|------------|------------|-------|
| Login | AuthRuntime (mock fallback) | ?? Falls back to mock | Real backend works if available |
| WorkspaceHome | Hardcoded JS arrays | ? | All stats, meters, charts are fake |
| Customers | WorkspaceContent (generated) | ? | Fake IDs, names, statuses |
| Meters | WorkspaceContent (generated) | ? | Same template as customers |
| Readings | WorkspaceContent (generated) | ? | Same template |
| Invoices | WorkspaceContent (generated) | ? | Same template |
| Payments | WorkspaceContent (generated) | ? | Same template |
| Admin - Users | Template page | ? | Not connected |
| Admin - Roles | Template page | ? | Not connected |
| Admin - Audit | Template page | ? | Not connected |

## Mock Location
- Frontend/src/workspace/components/WorkspaceContent.tsx — generates fake data in AppPage
- Frontend/src/identity/auth/api/auth-service.ts — MOCK_USERS for auth fallback
- Frontend/src/app/admin/* — Most admin pages are template shells

## Real Data Status
- Backend has real PostgreSQL + Prisma + seed data ?
- Frontend BFF routes proxy to backend when NEXT_PUBLIC_API_URL is set ?
- But frontend components use mock data directly instead of calling APIs ?