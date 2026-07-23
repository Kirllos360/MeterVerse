# Technical Debt Register

**Purpose:** Track all known technical debt with priority and fix wave.

| ID | Debt | Priority | Created | Impact | Fix Wave | Owner |
|----|------|----------|---------|--------|---------|-------|
| TD01 | page-configs.ts (45KB, 758 lines) | High | Wave 01 | 1.79GB dev server memory | Wave 02 | Frontend |
| TD02 | requirePermission only on 5/17 routes | High | Wave 01 | Permission gaps | Wave 02 | Backend |
| TD03 | Zero unit tests | Critical | Wave 01 | No regression safety | Wave 02 | QA |
| TD04 | Zero enums in Prisma schema | Medium | Wave 01 | String-based status fields | Wave 03 | Database |
| TD05 | Email/SMS not actually sending | High | Wave 01 | Stub implementation | Wave 02 | Backend |
| TD06 | No user-facing BFF API | Medium | Wave 01 | Dashboard uses admin API | Wave 02 | Backend |
| TD07 | No WebSocket for real-time | Medium | Wave 01 | No live updates | Wave 02 | Backend |
| TD08 | Meter/ 267K files unresolved | Medium | Wave 01 | Repository bloat | Wave 02 | DevOps |
