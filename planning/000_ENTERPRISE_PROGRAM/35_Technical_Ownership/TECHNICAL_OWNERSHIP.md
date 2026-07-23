# Technical Ownership

## Directory Ownership Map

| Directory | Business Owner | Technical Owner | Architecture Owner | DB Owner | Frontend Owner | Backend Owner | Testing Owner | Docs Owner |
|-----------|:------------:|:--------------:|:-----------------:|:--------:|:-------------:|:------------:|:------------:|:---------:|
| /backend/src/models/ | EOX Operations | EOX Engineering | EOX Engineering | EOX Engineering | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /backend/src/routes/ | EOX Operations | EOX Engineering | EOX Engineering | - | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /backend/src/services/ | EOX Operations | EOX Engineering | EOX Engineering | EOX Engineering | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /backend/src/middleware/ | - | EOX Engineering | EOX Engineering | - | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /backend/prisma/ | EOX Operations | EOX Engineering | EOX Engineering | EOX Engineering | - | EOX Engineering | - | EOX Documentation |
| /frontend/src/components/ | EOX Operations | EOX Engineering | EOX Engineering | - | EOX Engineering | - | EOX Engineering | EOX Documentation |
| /frontend/src/pages/ | EOX Operations | EOX Engineering | EOX Engineering | - | EOX Engineering | - | EOX Engineering | EOX Documentation |
| /frontend/src/lib/ | - | EOX Engineering | EOX Engineering | - | EOX Engineering | - | EOX Engineering | EOX Documentation |
| /planning/ | EOX Management | EOX Engineering | EOX Engineering | - | - | - | - | EOX Documentation |
| /scripts/ | - | EOX Engineering | EOX Engineering | - | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /configs/ | - | EOX Engineering | EOX Engineering | - | - | EOX Engineering | - | EOX Documentation |
| /docs/ | EOX Management | EOX Documentation | EOX Engineering | - | - | - | - | EOX Documentation |
| /docs/screenshots/ | - | EOX Engineering | - | - | EOX Engineering | EOX Engineering | EOX Engineering | EOX Documentation |
| /docs/reviews/ | EOX Management | EOX Engineering | EOX Engineering | - | - | - | - | EOX Documentation |

## Component Ownership

| Component | Business Owner | Technical Owner | Architecture | Notes |
|-----------|:------------:|:--------------:|:------------:|-------|
| Permission Engine | EOX Operations | EOX Engineering | EOX Engineering | 57 keys, 5 roles |
| Audit Engine | EOX Operations | EOX Engineering | EOX Engineering | All write operations |
| Workflow Engine | EOX Operations | EOX Engineering | EOX Engineering | State machines |
| AI Engine | EOX Management | EOX Engineering | EOX Engineering | Phase 46a |
| Billing Engine | EOX Finance | EOX Engineering | EOX Engineering | Phase 44a-d |
| Tariff Engine | EOX Finance | EOX Engineering | EOX Engineering | Phase 44a |
| Sync Engine | EOX Operations | EOX Engineering | EOX Engineering | SYMBIOT Phase 49a |
| Reporting Engine | EOX Management | EOX Engineering | EOX Engineering | Phase 46b |
| Notification Engine | EOX Operations | EOX Engineering | EOX Engineering | Email/SMS/Push |
| WebSocket Gateway | - | EOX Engineering | EOX Engineering | Phase 43b |

## Ownership Rules
1. Business Owner decides priority and scope
2. Technical Owner implements and maintains
3. Architecture Owner approves design decisions
4. Sub-owners can be delegated per component
5. All owners default to "TBD" until explicitly assigned

---
*Last updated: 2026-07-23*
