# Enterprise System Master Knowledge — Meter Verse (MVEOS)

**Version:** 1.0  
**Date:** 2026-07-03  
**Authority:** Chief Enterprise AI Architect  
**Purpose:** Permanent source of truth for all future implementation  

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| Name | Meter Verse (MVEOS) |
| Domain | Utility metering & billing (electricity, water, solar, chilled water) |
| Scale | 50,000 meters, 15 areas, Egypt |
| Repository | `https://github.com/Kirllos360/Meter` |
| Author | Kirllos Hany <kirllos.hany@epower.com.eg> |
| Root | `D:\meter\` |
| Main source | `D:\meter\Meter\` |

---

## 2. System Architecture Overview

### 2.1 Three-Application Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    METER VERSE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  APPLICATION 1: NESTJS BACKEND (Modern Runtime)                 │
│  ├── Path: D:\meter\Meter\backend                               │
│  ├── Framework: NestJS 10 + TypeScript 5.9                      │
│  ├── Port: 3001 (NOT currently running)                         │
│  ├── Start: npm run start:dev (dev) or node dist/src/main.js    │
│  ├── ORM: Prisma 6.19 + PostgreSQL multi-schema                 │
│  ├── Auth: JWT (Passport), RBAC, 7+ roles                       │
│  └── Key modules: 45+ src modules, 30+ test suites              │
│                                                                 │
│  APPLICATION 2: NEXT.JS FRONTEND (Customer + Admin UI)          │
│  ├── Path: D:\meter\Meter\Frontend                              │
│  ├── Framework: Next.js 16 + React 19 + Tailwind v4             │
│  ├── Port: 3000 (RUNNING — PID 18532)                           │
│  ├── Start: bun run dev or npx next dev -p 3000                 │
│  ├── State: React Query (TanStack)                              │
│  ├── i18n: Arabic/English (RTL layout)                          │
│  └── Routes: / (AppShell), /login, /register, /portal,          │
│              /control-center (11 Enterprise pages)               │
│                                                                 │
│  APPLICATION 3: EXPRESS ADMIN PORTAL (Legacy — Port 6262)       │
│  ├── Path: D:\meter\Meter\backend\admin-portal                  │
│  ├── Framework: Express.js (standalone, no NestJS)              │
│  ├── Port: 6262 (RUNNING — PID 15696)                           │
│  ├── Start: node src/server.js from admin-portal/               │
│  ├── Auth: JWT + bcrypt (custom, NOT Passport)                  │
│  ├── Frontend: Vanilla JS in public/index.html (inline)         │
│  └── Routes: /api/areas, /api/projects, /api/users, etc.        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    SUPPORTING INFRASTRUCTURE                     │
│                                                                 │
│  DATABASE — Dual PostgreSQL instances                            │
│  ├── Native PG16 ─── PID 6624 ─── Port 5433                     │
│  │   └── Service: PostgreSQL Server 16 (Windows)                │
│  ├── Docker PG16 ─── PID 7120 ─── Port 5434                     │
│  │   └── Container: meter-verse-db (postgres:16-alpine)         │
│  └── Database: meter_pulse / schema: sim_system                 │
│                                                                 │
│  REDIS                                                          │
│  └── Native Redis ─── PID 4920 ─── Port 6380                    │
│      └── Service: redisratelimit (Windows service)              │
│                                                                 │
│  DOCKER                                                         │
│  ├── meter-verse-db  (postgres:16-alpine, port 5433→5432)       │
│  └── portainer       (portainer/portainer-ce, port 9000)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Key Port Mapping

| Port | Application | Status | PID |
|------|------------|--------|-----|
| 3000 | Next.js Frontend | ✅ RUNNING | 18532 |
| 3001 | NestJS Backend (expected) | ❌ NOT RUNNING | — |
| 3001 | Odoo MCP (actually occupies) | ⚠️ WRONG PROCESS | 19084 |
| 5433 | PostgreSQL 16 (native) | ✅ RUNNING | 6624 |
| 5434 | PostgreSQL 16 (Docker) | ✅ RUNNING | 7120 |
| 6262 | Legacy Express Admin Portal | ✅ RUNNING | 15696 |
| 6380 | Redis (native) | ✅ RUNNING | 4920 |
| 9000 | Portainer (Docker UI) | ✅ RUNNING | — |

---

## 3. Critical Discovery Findings

### 3.1 NestJS Backend is NOT Running

The NestJS backend (`dist/src/main.js` on port 3001) is not started. The start-all.bat references it but the process is absent. Port 3001 is occupied by an Odoo MCP AI tool server instead.

**Impact:** The Runtime Dashboard API (`/api/v1/dashboard/*`), Runtime Gateway, and all NestJS services are unavailable. The Control Center frontend pages will show errors when trying to fetch data.

### 3.2 Legacy Express App Controls Port 6262

Port 6262 is served by `backend/admin-portal/src/server.js` — a standalone Express app with its own routes, auth, and database connections. It is NOT connected to the NestJS runtime or Next.js frontend.

**Impact:** All control center work done in Phase-07/08 is correct but served on port 3000/control-center, not on port 6262.

### 3.3 Two PostgreSQL Instances

Two PostgreSQL 16 instances are running simultaneously — one native (port 5433) and one Docker (port 5434). Both serve the same database `meter_pulse` with schema `sim_system`.

**Impact:** Potential confusion about which instance is authoritative. The .env references port 5433 but Docker compose defines port 5434.

---

## 4. Module Inventory

### 4.1 Backend Source Modules (43 directories)

| Module | Purpose | Files | Status |
|--------|---------|-------|--------|
| audit/ | Append-only audit logging | 4+ | ✅ |
| auth/ | JWT authentication, RBAC, guards | 10+ | ✅ |
| bill-cycle/ | Billing cycle governance | 2+ | ✅ |
| billing/ | Invoice generation, tariffs, periods | 15+ | ✅ |
| chilled-water/ | BTU metering & billing | 3+ | ✅ |
| collections/ | Collection management | 2+ | ✅ |
| common/ | Shared: config, database, errors, events, http, logging, validation, secrets, tenant, redis, workers | 40+ | ✅ |
| customers/ | Customer management + 360 view | 8+ | ✅ |
| domain/ | Events (22), policies (8), exceptions (13), context | 10+ | ✅ |
| downloads/ | File download | 2+ | ✅ |
| enterprise/ | Pipeline (6-stage), OperationIntegrator, EnterpriseService | 5+ | ✅ |
| gas/ | Gas metering | 2+ | ✅ |
| infrastructure/ | PlatformDetector, Bootstrap, Service/Workspace Registry | 8 | ✅ |
| invoices/ | Invoice rendering, templates | 5+ | ✅ |
| meters/ | Meter CRUD, lifecycle, state | 6+ | ✅ |
| payments/ | Payment recording, reversal, receipts | 5+ | ✅ |
| readings/ | Golden Slice — Repository pattern reference | 13+ | ✅ |
| runtime/ | Coordinator, MetricsEngine, HealthEngine, Lifecycle | 7 | ✅ |
| runtime-api/ | Runtime API facade (35+ endpoints) | 3 | ⚠️ |
| runtime-capabilities/ | 12 capabilities, 28 navigation items | 5 | ✅ |
| runtime-dashboard/ | Port 6262 controller (20 endpoints) | 3 | ✅ |
| runtime-event-bus/ | 30 typed events, 4 providers, DLQ, Retry, EventStore | 13 | ✅ |
| runtime-gateway/ | CQRS, RateLimiter, Idempotency, Plugins | 5+ | ✅ |
| runtime-graph/ | 28 node types, 26 edge types, 4 exporters | 4 | ✅ |
| runtime-intelligence/ | Root cause, risk, recommendations, predictions | 7 | ✅ |
| runtime-manifest/ | 6 manifests with full metadata | 4 | ✅ |
| runtime-operations/ | 46 operations registered | 4 | ✅ |
| runtime-ui/ | LayoutEngine, WidgetEngine, ScreenRenderer, Context | 10+ | ✅ |
| runtime-ui/dashboard/ | Composer, Shell, Navigation, Filters, State | 17 | ✅ |
| runtime-ui-manifest/ | 11 screens, 30+ widgets, 11 layouts | 4 | ✅ |
| users/ | User management | 2+ | ✅ |

### 4.2 Test Suites (30+ directories)

| Suite | Tests | Status |
|-------|-------|--------|
| compliance/ | 18 | ✅ PASS |
| deployment/ | 23 | ✅ PASS |
| orchestrator/ | 28 | ✅ PASS |
| runtime-api/ | 28 | ✅ PASS |
| runtime-capabilities/ | 17 | ✅ PASS |
| runtime-dashboard/ | 26 | ✅ PASS |
| runtime-event-bus/ | 47 | ✅ PASS |
| runtime-graph/ | 26 | ✅ PASS |
| runtime-intelligence/ | 15 | ✅ PASS |
| runtime-manifest/ | 23 | ✅ PASS |
| runtime-operations/ | 23 | ✅ PASS |
| runtime-ui/ (3 suites) | 122 | ✅ PASS |
| runtime-ui-manifest/ | 13 | ✅ PASS |
| unit/readings/ | 14 | ✅ PASS |

---

## 5. Database Architecture

### 5.1 Connection

| Property | Value |
|----------|-------|
| Host | 127.0.0.1 |
| Port | 5433 (native) or 5434 (Docker) |
| Database | meter_pulse |
| User | meter_pulse |
| Schema | sim_system (multi-schema: core, features, area) |
| ORM | Prisma 6.19 |
| Connection string (from .env) | `postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5433/meter_pulse?schema=sim_system` |

### 5.2 Schema Architecture (4 schemas)

| Schema | Models | Purpose |
|--------|--------|---------|
| sim_system | 41 | Shared enums + core reference data |
| core | 19 | Auth, users, roles, permissions, tenants |
| features | 36 | Billing, invoices, payments, reports |
| area | 42 | Per-tenant: customers, meters, readings |

### 5.3 Known External Databases (Read Only)

| Area | Host | Database | Access |
|------|------|----------|--------|
| October | 10.50.30.2 | PalmHills_October | Read Only |
| New Cairo | 10.50.30.2 | PalmHills_NewCairo | Read Only |
| SODIC | 10.50.30.2 | SODIC | Read Only |
| Uvinus Mall | 10.50.30.4 | ABRAJ_Uvinus | Read Only |

---

## 6. Legacy Systems

| System | Path | Status | Notes |
|--------|------|--------|-------|
| Express Admin Portal | `backend/admin-portal/` | ✅ RUNNING (Port 6262) | Legacy — should be replaced by Control Center |
| Express Admin Console | `backend/admin-console/` | ❌ NOT RUNNING | Legacy — port 4002 |
| Flask Collection System | `reference/collection-system/` | REFERENCE | Python/Pyramid — reference only |
| SBill | `reference/sbill/` | REFERENCE | Business reference |
| Symbiot | `reference/symbiot/` | REFERENCE | Meter communication protocol |
| Old Dashboard | `Frontend/src/components/dashboard/` | NOT CONNECTED | 6 legacy dashboards (Billing, Collections, Executive, Operations, Solar, Utility) |

---

## 7. Current Running State

| Component | Status | Port | Notes |
|-----------|--------|------|-------|
| Next.js Frontend | ✅ RUNNING | 3000 | Full business UI + Control Center |
| NestJS Backend | ❌ NOT RUNNING | 3001 | **Must be started for runtime APIs** |
| Legacy Admin Portal | ✅ RUNNING | 6262 | Serves old MV Admin UI |
| PostgreSQL (native) | ✅ RUNNING | 5433 | Main database |
| PostgreSQL (Docker) | ✅ RUNNING | 5434 | Secondary instance |
| Redis | ✅ RUNNING | 6380 | Session/queue/rate-limit |

---

## 8. Architecture Score

| Dimension | Score | Status |
|-----------|-------|--------|
| Overall Enterprise Architecture | 82/100 | ✅ |
| Controller Purity | 98/100 | ✅ |
| EnterpriseService Adoption | 6/106 (6%) | ⚠️ |
| Repository Adoption | 4 modules | ⚠️ |
| Compliance (blocking violations) | 0 | ✅ |
| Technical Debt Items | 47 remaining | ⚠️ |

---

*Master knowledge document — 2026-07-03*
*Verified from source code, process inspection, and network analysis*
