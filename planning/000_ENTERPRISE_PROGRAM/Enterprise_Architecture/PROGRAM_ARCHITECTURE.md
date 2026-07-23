# Enterprise Program Architecture

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCT LAYER                            │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │  System A (Admin)    │  │  System B (User Workspace) │   │
│  │  53 admin pages      │  │  19 dashboard pages        │   │
│  │  Configuration       │  │  Customer/Meter/Reading    │   │
│  │  Billing Engine      │  │  Invoice/Payment           │   │
│  │  Monitoring          │  │  Tasks/Search/Documents    │   │
│  └─────────┬───────────┘  └─────────────┬───────────────┘   │
└────────────┼────────────────────────────┼───────────────────┘
             │                            │
┌────────────┼────────────────────────────┼───────────────────┐
│            └──────────┬─────────────────┘                   │
│                       ▼                                     │
│              SHARED API LAYER                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  auth-engine.js  │  permissions.js  │  auditLog()   │   │
│  │  notification-engine.js │ billing-engine.js          │   │
│  │  email-engine.js  │  sms-engine.js  │  kpi-engine   │   │
│  │  alert-engine.js  │  validation-engine.js            │   │
│  │  17 route files   │  179+ endpoints                  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         ▼                                   │
│              SHARED DATABASE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 16  │  Prisma ORM  │  78 models          │   │
│  │  68 indexes     │  22 uniques  │  Migration chain    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         ▼                                   │
│              SHARED RUNTIME LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js    │  Next.js 16  │  JWT Auth            │   │
│  │  Redis/Cache   │  WebSocket   │  Rate Limiting       │   │
│  │  Monitoring    │  Logging     │  Health Checks       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Product Boundaries

| Capability | Admin (System A) | User (System B) | Shared |
|-----------|-----------------|-----------------|--------|
| CRUD operations | Full CRUD on all entities | Read + limited create | Validation layer |
| Configuration | Full access | Read-only | Permission enforcement |
| Billing | Create/run bills | View invoices | Billing engine |
| Tariffs | Full CRUD | None | Tariff models |
| Reports | All reports | Personal reports | Report engine |
| Monitoring | Full system monitoring | Personal activity | Monitoring infrastructure |
| Users/Roles | Full management | Personal profile | User model + auth |
| Notifications | Configure templates | Receive + manage | Notification engine |

## Shared Component Catalog

| Component | Owner | Status | Documentation |
|-----------|-------|--------|---------------|
| auth-engine.js | Shared | ✅ Complete | backend/src/services/auth-engine.js |
| permissions.js | Shared | ✅ Complete | backend/src/middleware/security.js |
| auditLog() | Shared | ✅ Complete | backend/src/middleware/security.js |
| notification-engine.js | Shared | ✅ Complete | backend/src/services/notification-engine.js |
| email-engine.js | Shared | ✅ Complete | backend/src/services/email-engine.js |
| sms-engine.js | Shared | ✅ Complete | backend/src/services/sms-engine.js |
| billing-engine.js | Shared | ✅ Complete | backend/src/services/billing-engine.js |
| validation-engine.js | Shared | ✅ Complete | backend/src/services/validation-engine.js |
| alert-engine.js | Shared | ✅ Complete | backend/src/services/alert-engine.js |
| kpi-engine.js | Shared | ✅ Complete | backend/src/services/kpi-engine.js |
| Graphiti | Shared | ✅ Complete | graphiti/index.json |
| SpecKit | Shared | ✅ Complete | speckit/ |

## Enterprise Integration Points

External systems connect through:
1. **REST API** — /api/* endpoints with JWT auth + permission keys
2. **Webhooks** — Event-based push notifications (planned Wave 05)
3. **Import/Export** — CSV pipelines for bulk data (Wave 01 complete)
4. **Mobile API** — system_type: mobile optimized endpoints (planned Wave 06)

## Architecture Invariants (Never Violate)

1. All products use the same authentication engine
2. All products use the same permission model
3. All products use the same database
4. All products use the same Graphiti graph
5. All products use the same SpecKit validation
6. All products use the same Planning OS
7. Admin configures what User executes
8. No product-specific fork of shared components
