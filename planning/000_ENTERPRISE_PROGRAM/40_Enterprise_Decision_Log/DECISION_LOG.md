# Enterprise Decision Log

## Purpose
Record WHY decisions were made. Future developers should never need to ask "why did we do it this way?"

## Format
| Date | Decision | Context | Alternatives | Chosen | Impact | Links |
|------|----------|---------|-------------|--------|--------|-------|

| 2026-07-23 | MeterAssignment instead of ServiceConnection | Needed to link meters to customers with date ranges | Direct FK, ServiceConnection model | MeterAssignment with start/end dates | Supports move-in/move-out, historical tracking | Schema: CustomerMeter model |
| 2026-Q1 | React Query for data fetching | Consistent server state management | Redux, SWR, RTK Query | TanStack React Query | Built-in caching, refetching, optimistic updates | Frontend: /src/lib |
| 2026-Q1 | Next.js 16 for frontend | Full-stack React framework with SSR | CRA, Vite, Remix | Next.js 16 | SSR, file-based routing, API routes, middleware | Frontend: package.json |
| 2026-Q1 | PostgreSQL 16 for database | Relational integrity for financial data | MongoDB, MySQL, SQLite | PostgreSQL 16 | ACID compliance, JSON support, Prisma ecosystem | Backend: prisma/schema |
| 2026-Q1 | Express with modular structure | Organized backend without NestJS overhead | Plain Express, NestJS | Express with routes/services pattern | Familiar middleware model, no NestJS overhead | Backend: /src |
| 2026-Q1 | RBAC permission model | Role-based access control | ABAC, ReBAC | RBAC with 5 roles, 57 permissions | Simple, well-understood, sufficient | Models: Role, Permission |
| 2026-Q1 | Arabic language support | All business documents are Arabic | English-only, bilingual | Arabic primary, English secondary | Mirrored UI, RTL layout support | Knowledge Base Doc 03 |
| 2026-Q1 | SYMBIOT as meter data source | Physical meters use SYMBIOT | Custom firmware, manual entry | SYMBIOT API integration | External dependency, meters already deployed | Knowledge Base Doc 12 |
| 2026-Q2 | Socket.IO for real-time | Push notifications, live updates | Polling, SSE, raw WebSocket | Socket.IO with JWT auth rooms | Auto-reconnect, rooms, fallback | websocket-gateway.js |
| 2026-Q2 | GenericAdminPage pattern | 53 admin pages would be too many | Per-page components | Single reusable page with config | 46/53 pages built from config | Frontend components |
| 2026-Q2 | Planning OS v2.0 freeze | Prevent scope creep | Continuous planning | Frozen at 30 layers (+10 v2.1) | Disciplined scope management | planning/VERSION |
| 2026-Q2 | AI Execution Contract | Ensure every task justifies itself | No contract, simple checklist | Mandatory contract answering WHY/WHAT/HOW | Prevents aimless implementation | AI_EXECUTION_CONTRACT.md |
| 2026-Q2 | Graphiti knowledge graphs | Codebase understanding for AI agents | Text docs only | Graphiti persistent knowledge graphs | Enables BFS/DFS query across codebase | graphify skill |

## Future Decisions (to be logged when decided)
| Decision | Context | Options | Priority |
|----------|---------|---------|:--------:|
| Accounting method | Double-entry vs single-entry | Double-entry vs Single-entry | HIGH |
| SYMBIOT auth method | How to connect to SYMBIOT | API key, OAuth, Basic Auth | HIGH |
| Mobile platform | Native vs PWA for field ops | React Native, Flutter, PWA | MEDIUM |
| Customer portal auth | How customers log in | OTP, password, SSO | MEDIUM |
| Payment gateway | Online payment provider | Fawry, Paymob, Stripe | MEDIUM |
| AI model hosting | Where to run ML models | On-prem, AWS SageMaker, Google AI | LOW |
| File storage | Document attachment storage | S3, local FS, DB blob | LOW |

---
*Last updated: 2026-07-23*
