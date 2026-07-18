# Canonical Runtime Map — Meter Verse (MVEOS)

**Date:** 2026-07-03  

---

## Enterprise Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            BROWSER                                     │
│              http://localhost:3000 or http://localhost:6262              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 16 FRONTEND                              │
│  Path: D:\meter\Meter\Frontend                                          │
│  Port: 3000 (dev) / 6262 (control center)                              │
│                                                                         │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐  │
│  │   AppShell (main)  │  │ Control Center (11)│  │  Auth Pages      │  │
│  │  Customers, Meters,│  │ Dashboard, Runtime,│  │  /login          │  │
│  │  Billing, Payments,│  │ Services, Worksp., │  │  /register       │  │
│  │  Readings, Reports │  │ Events, Deploy,    │  │  /portal         │  │
│  │  etc.              │  │ Intelligence,      │  │                  │  │
│  │                    │  │ Graph, Security,   │  │                  │  │
│  │                    │  │ Config, Gateway    │  │                  │  │
│  └────────┬───────────┘  └─────────┬──────────┘  └──────────────────┘  │
│           │                        │                                    │
│           └──────────┬─────────────┘                                    │
│                      │                                                  │
│              ┌───────▼────────┐                                         │
│              │ Runtime Gateway│  (src/lib/runtime/gateway-client.ts)     │
│              │ Client         │                                         │
│              └───────┬────────┘                                         │
└──────────────────────┼──────────────────────────────────────────────────┘
                       │ HTTP /api/v1
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         NESTJS 10 BACKEND                                │
│  Path: D:\meter\Meter\backend                                           │
│  Port: 3001                                                             │
│                                                                         │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐  │
│  │  Controllers (45)  │  │  Services (106)    │  │  Modules (43)    │  │
│  │  REST endpoints    │  │  Business logic    │  │  NestJS modules   │  │
│  └────────┬───────────┘  └────────┬───────────┘  └──────────────────┘  │
│           │                       │                                     │
│           ▼                       ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              ENTERPRISE RUNTIME ARCHITECTURE                      │  │
│  │                                                                   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │  │
│  │  │ Runtime  │ │  Event   │ │ Runtime  │ │ Enterprise         │  │  │
│  │  │ Gateway  │ │   Bus    │ │  Graph   │ │ Pipeline           │  │  │
│  │  │ CQRS,    │ │ 30 types │ │ 28 nodes │ │ 6-stage execution  │  │  │
│  │  │ RateLim, │ │ 4 provid │ │ 26 edges │ │ Validation→Policy→ │  │  │
│  │  │ Idempot. │ │ DLQ,Retry│ │ 4 export │ │ Tx→Events→Audit→   │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ │ Metrics              │  │  │
│  │                                          └────────────────────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │  │
│  │  │ Runtime  │ │  Intell. │ │Compliance│ │ Operation          │  │  │
│  │  │ Manifest │ │  Engine  │ │ Engine   │ │ Registry (46 ops)  │  │  │
│  │  │ 6 comps  │ │ RCA,Risk │ │ 17 rules │ │                    │  │  │
│  │  └──────────┘ │ Rec,Pred │ │ 0 block  │ └────────────────────┘  │  │
│  │               └──────────┘ └──────────┘                          │  │
│  │  ┌──────────────────────────────────────────────────────────┐    │  │
│  │  │   Registries: Capability (12), Navigation (28),          │    │  │
│  │  │               UI Manifest (11 screens), Operations (46)   │    │  │
│  │  └──────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                            │
│           ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   SERVICE / REPOSITORY LAYER                     │  │
│  │                                                                   │  │
│  │  Areas     │  Users    │  Payments  │  Meters    │  Customers    │  │
│  │  (ES)      │  (ES)     │  (ES+Repo) │  (ES+Repo) │  (ES+Repo)    │  │
│  │                                                                   │  │
│  │  Readings  │  Billing  │  Projects  │  Auth      │  Notifications│  │
│  │  (ES+Repo) │           │            │            │               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                            │
│           ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     REPOSITORY LAYER                             │  │
│  │  Only 4 modules use repository pattern (readings, payments,      │  │
│  │  meters, customers). All others access PrismaService directly.    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                            │
│           ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     PRISMA ORM (multi-schema)                     │  │
│  │      sim_system (41) | core (19) | features (36) | area (42)     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                     │
│                                                                         │
│  ┌────────────────────────────────┐   ┌──────────────────────────────┐ │
│  │  PostgreSQL 16 (NATIVE)        │   │  Remote SQL Servers (VPN)   │ │
│  │  Host: 127.0.0.1:5433          │   │  10.50.30.2: PalmHills_Oct │ │
│  │  DB: meter_pulse               │   │  10.50.30.2: PalmHills_NC  │ │
│  │  User: meter_pulse             │   │  10.50.30.2: SODIC          │ │
│  │  Schema: sim_system            │   │  10.50.30.4: ABRAJ_Uvinus  │ │
│  └────────────────────────────────┘   └──────────────────────────────┘ │
│                                                                         │
│  ┌────────────────────────────────┐                                    │
│  │  Redis (Native)                │                                    │
│  │  Host: 127.0.0.1:6380         │                                    │
│  │  Service: redisratelimit       │                                    │
│  └────────────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js + React + Tailwind | 16 / 19 / v4 |
| Backend | NestJS + TypeScript | 10 / 5.9 |
| ORM | Prisma | 6.19 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7.x |
| Auth | JWT + Passport | — |
| API | REST (JSON) | — |

---

*Canonical runtime map — 2026-07-03*
