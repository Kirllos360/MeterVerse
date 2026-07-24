# Sprint Mapping — Logical Sprint Order

## Sprint 1-2: Foundation
| Task | Priority | Complexity | Dependencies |
|------|:--------:|:----------:|:------------:|
| Auth engine (JWT + bcrypt) | P0 | M | None |
| RBAC + permission keys | P0 | M | Auth engine |
| Prisma schema (78 models) | P0 | H | None |
| Audit middleware | P0 | L | Auth engine |

## Sprint 3-4: Core Services
| Task | Priority | Complexity | Dependencies |
|------|:--------:|:----------:|:------------:|
| Workflow engine (3 state machines) | P1 | M | Auth |
| WebSocket gateway | P1 | M | Auth |
| Notification engine | P1 | M | Auth |
| Export service | P1 | L | Prisma |

## Sprint 5-7: Testing & Hardening
| Task | Priority | Complexity | Dependencies |
|------|:--------:|:----------:|:------------:|
| Unit tests (71 tests) | P0 | H | All services |
| API tests (14 tests) | P0 | M | All routes |
| Playwright tests (24 specs) | P0 | M | Frontend |
| Pagination caps | P1 | L | Routes |
| MFA with speakeasy | P0 | M | Auth engine |
| CI pipeline | P0 | M | All tests |

## Sprint 8-10: Billing
| Task | Priority | Complexity | Dependencies |
|------|:--------:|:----------:|:------------:|
| Tariff CRUD + calculate | P0 | M | Prisma |
| Bill run lifecycle | P0 | H | Tariff |
| Invoice generation | P0 | H | Bill run, readings |
| Payment allocation | P0 | H | Invoice |
| Statements + aging | P0 | M | Payment |

## Sprint 11-12: Platform
| Task | Priority | Complexity | Dependencies |
|------|:--------:|:----------:|:------------:|
| Circuit breaker | P1 | L | None |
| Cache engine | P1 | L | None |
| Export streaming | P1 | L | Export service |
| Deployment pipeline | P1 | M | CI |
| Graphiti validation | P1 | L | CI |
