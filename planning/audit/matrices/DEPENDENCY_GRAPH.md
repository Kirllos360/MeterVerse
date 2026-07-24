# Planning Dependency Graph Specification

## Task Dependency Map

### Critical Path (Longest chain)
Phase 420 Auth → Phase 42e Enterprise Controls → Phase 42f Communication → Phase 00 Tests
    → Phase 42g Control Health → Phase 43d Admin Panels → Phase 44a Tariff
    → Phase 44b Billing → Phase 44c Collections → Phase 44d Compliance
    → Phase 45a Performance → Phase 45b Security → Phase 45f CI/CD

### Dependency Graph Structure
```
Phase 420 (Auth)
  ├── Phase 42a (Indexes)
  │     └── Phase 42e (Enterprise Controls)
  │           ├── Phase 42b (Notifications)
  │           ├── Phase 42c (Detail Pages)
  │           │     └── Phase 42d (QA & Tooling)
  │           │           └── Phase 42f (Communication)
  │           │                 ├── Phase 00 (Tests)
  │           │                 │     └── Phase 42g (Control Health)
  │           │                 │           └── Phase 43c (Documents)
  │           │                 │                 └── Phase 43d (Admin Panels)
  │           │                 │                       └── Phase 44a (Tariff)
  │           │                 │                             └── Phase 44b (Billing)
  │           │                 │                                   └── Phase 44c (Collections)
  │           │                 │                                         └── Phase 44d (Compliance)
  │           │                 │                                               └── Phase 45a (Performance)
  │           │                 │                                                     └── Phase 45b (Security)
  │           │                 │                                                           └── Phase 45f (CI/CD)
  │           │                 │
  │           │                 ├── Phase 43b (Communication) — BLOCKED (external)
  │           │                 └── Phase 43e (SYMBIOT) — BLOCKED (external)
  │           │
  │           ├── Wave 05-10 — LOCKED/FUTURE
  │           └── old_tasks T069-T071, T073, T200-T216 — GAPS
```

### Blocked Tasks
| Task | Blocker | Impact |
|------|---------|--------|
| Phase 43b T06 Email | SMTP credentials | Cannot send emails |
| Phase 43b T07 SMS | Twilio/Vonage account | Cannot send SMS |
| Phase 43b T08 Push | Firebase project | Cannot send push |
| Phase 43e SYMBIOT | API documentation | Cannot integrate meters |

### Independent Tasks (can run in parallel)
| Task | Reason |
|------|--------|
| T037-T040 (Performance) | Changes are isolated |
| T045-T046 (Security audit) | Read-only analysis |
| Documentation updates | No code changes needed |

### Risk Chains
Auth failure → All subsequent phases blocked
Database migration failure → All data-dependent phases blocked
External provider failure (SMTP/Twilio/Firebase) → Communication phase indefinitely blocked
SYMBIOT API docs not provided → Wave 08 indefinitely blocked
