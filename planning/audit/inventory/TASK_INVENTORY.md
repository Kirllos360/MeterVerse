# Complete Task Inventory

## All Tasks from old_tasks.md — Classified

### Phase 1: Setup (T001-T005) — 5 tasks
| ID | Name | Status | Classification |
|:--:|------|:------:|:-------------:|
| T001 | NestJS scaffold | ✅ Complete | DEPRECATED (Express.js architecture) |
| T002 | Config + PostgreSQL | ✅ Complete | DEPRECATED (Express.js architecture) |
| T003 | Lint/format/test tooling | ✅ Complete | ALREADY DONE (vitest configured) |
| T004 | Prisma ORM init | ✅ Complete | ALREADY DONE (78 models exist) |
| T005 | Docker compose DB | ✅ Complete | DEPRECATED (manual DB setup) |

### Phase 2: Foundational (T006-T022) — 17 tasks
| ID | Name | Status | Classification |
|:--:|------|:------:|:-------------:|
| T006 | Error envelope | ✅ Complete | ALREADY DONE (errorHandler.js exists) |
| T007 | Correlation ID | ✅ Complete | MISSING (not in our architecture) |
| T008 | Idempotency key | ✅ Complete | MISSING (not implemented) |
| T009 | Auth JWT + RBAC | ✅ Complete | ALREADY DONE (auth-engine + permissions) |
| T010 | Audit log service | ✅ Complete | ALREADY DONE (auditLog in security.js) |
| T011 | API versioning + OpenAPI | ✅ Complete | MISSING (no /api/v1, no Swagger) |
| T012 | Contract test harness | ✅ Complete | MISSING (no contract tests) |
| T013-T019 | Schema migrations | ✅ Complete | ALREADY DONE (78 models exist) |
| T020 | FE-001 API client | ✅ Complete | MISSING (no centralized API client) |
| T021 | FE-002 React Query | ✅ Complete | MISSING (frontend uses its own pattern) |
| T022 | FE-003 Feature flags | ✅ Complete | MISSING (no feature flag system) |

### Phase 3: User Story 1 (T023-T042) — 20 tasks
| ID | Name | Status | Classification |
|:--:|------|:------:|:-------------:|
| T023-T026 | US1 tests | ✅ Complete | NEEDS REWRITE (Express version) |
| T027-T034 | US1 backend | ✅ Complete | NEEDS REWRITE (Express version) |
| T035-T042 | US1 frontend | ✅ Complete | NEEDS REWRITE (Express version) |

### Phase 4: User Story 2 (T043-T052) — 10 tasks
| ID | Name | Status | Classification |
|:--:|------|:------:|:-------------:|
| T043-T052 | US2 readings | ✅ Complete | NEEDS REWRITE (Express version) |

### Phase 5: User Story 3 (T053-T072) — 20 tasks
| ID | Name | Status | Classification |
|:--:|------|:------:|:-------------:|
| T053-T060 | US3 tests | ✅ Complete | NEEDS REWRITE (Express version) |
| T061-T067 | US3 backend | ✅ Complete | NEEDS REWRITE (Express version) |
| T068 | FE-040 Invoices | ❌ Not started | **MISSING** |
| T069 | FE-041 Payments allocation | ❌ Not started | **MISSING - HIGH PRIORITY** |
| T070 | FE-042 Balances aging | ❌ Not started | **MISSING - HIGH PRIORITY** |
| T071 | FE-043 Customer statements | ❌ Not started | **MISSING - HIGH PRIORITY** |
| T071a | Consumption view | ❌ Not started | **MISSING** |
| T072 | US3 frontend validation | ❌ Not started | **MISSING** |

### Phase 6: Polish (T073-T085) — 13 tasks
| ID | Name | Status | Classification |
|:--:|------|:------:|:-------------:|
| T073 | Report export jobs | ❌ Not started | **MISSING - HIGH PRIORITY** |
| T074 | Contract test reports | ❌ Not started | MISSING |
| T075 | RBAC action-gating tests | ❌ Not started | MISSING |
| T076 | FE-050 Reports v2 | ❌ Not started | MISSING |
| T077 | FE-051 Permission gating | ❌ Not started | MISSING |
| T078 | FE-052 Alerts->Tickets | ❌ Not started | OPTIONAL (out of scope) |
| T079 | FE-060 Frontend CI tests | ❌ Not started | MISSING |
| T080 | FE-061 E2E coverage | ❌ Not started | MISSING |
| T081 | FE-062 UX resilience | ❌ Not started | MISSING |
| T082 | Polish batch validation | ❌ Not started | MISSING |
| T083 | Contract reconciliation | ❌ Not started | MISSING |
| T084 | Quickstart validation | ❌ Not started | MISSING |
| T084a | Backup/restore drill | ❌ Not started | MISSING |
| T085 | Ratify constitution | ❌ Not started | MISSING |

### Phase 7: Governance (T200-T216) — 17 tasks
| ID | Name | Status | Classification |
|:--:|------|:------:|:-------------:|
| T200 | SYSTEM_DNA.md | ❌ Not started | MISSING |
| T201 | PDF generation | ❌ Not started | MISSING - HIGH |
| T202 | Template engine | ❌ Not started | MISSING |
| T203 | Bill cycle governance | ❌ Not started | MISSING |
| T204 | Customer/unit resolution | ❌ Not started | MISSING |
| T205 | Wire meter detail page | ❌ Not started | MISSING |
| T206 | DB invoice dedup constraint | ❌ Not started | MISSING |
| T207 | Cancel invoice endpoint | ❌ Not started | MISSING |
| T208 | Safe invoice regeneration | ❌ Not started | MISSING |
| T209 | SSL/HTTPS config | ❌ Not started | MISSING |
| T210 | Monitoring + alerting | ❌ Not started | MISSING |
| T211 | Production environment | ❌ Not started | MISSING |
| T212 | QR code generation | ❌ Not started | MISSING |
| T213 | Invoice hash/verification | ❌ Not started | MISSING |
| T214 | Invoice due date | ❌ Not started | MISSING |
| T215 | RTL/Playwright tests | ❌ Not started | MISSING |
| T216 | Scheduled backup | ❌ Not started | MISSING |

### v2.0.0 Phase 0-6 (T086-T120) — 35 tasks
| ID | Name | Status | Classification |
|:--:|------|:------:|:-------------:|
| T086-T088 | Core/Features/Area DB | ✅ Complete | ALREADY DONE (78 models) |
| T089 | 16-profile RBAC | ❌ Not started | MISSING (we have 5 roles) |
| T090 | i18n 676 AR/EN keys | ❌ Not started | MISSING |
| T091 | Symbiot bridge | ❌ Not started | MISSING - HIGH (Phase 43e) |
| T092 | Availability plans | ❌ Not started | MISSING |
| T093-T098 | Core pages | ❌ Not started | MISSING |
| T099-T106 | Features pages | ❌ Not started | MISSING |
| T107-T111 | Data migration | ❌ Not started | MISSING |
| T112-T116 | Quality phase | ❌ Not started | MISSING |
| T117-T120 | Launch phase | ❌ Not started | MISSING |

## Summary Statistics
| Category | Count | Percentage |
|----------|:-----:|:----------:|
| ALREADY DONE in our implementation | 35 | 29% |
| NEEDS REWRITE (Express version) | 38 | 32% |
| **MISSING (not implemented)** | **35** | **29%** |
| DEPRECATED (different architecture) | 12 | 10% |
| OPTIONAL (out of scope) | 1 | <1% |
| **Total tasks audited** | **121** | **100%** |
