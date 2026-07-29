# C16 — Enterprise Asset Lifecycle, Field Operations & Workforce Management Platform
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C10 Connectivity, C12 Identity, C13 Financial, C14 Customer, C15 Integration  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Asset & Field Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **Meter** model | `schema.prisma:879` | ✅ Complete | serial, type, status, area, location, lifecycle |
| **MeterType** model | `schema.prisma:865` | ✅ Complete | name, category (electric/water/gas) |
| **MeterAssignment** model | `schema.prisma:1273` | ✅ Complete | meter↔customer linking with period |
| **MeterAssignmentHistory** | `schema.prisma:1294` | ✅ Complete | Full assignment change audit |
| **MeterEvent** model | `schema.prisma:1307` | ✅ Complete | type, description, timestamp, severity |
| **ServiceConnection** model | `schema.prisma:907` | ✅ Complete | meter↔customer↔contract linking |
| **Workflow engine** | `services/workflow-engine.js` | ✅ Basic | Meter states: stock→assigned→installed→reading→maintenance→retired |
| **SIMCard** model | `schema.prisma:1316` | ✅ Complete | ICCID, operator, lifecycle (available→in-use→cool-down→available) |
| **SIMAssignment** model | `schema.prisma:1357` | ✅ Complete | SIM↔meter linking |
| **Customer** model | `schema.prisma:841` | ✅ Complete | name, type, status, area |
| **Area/Project/Zone/Unit** | `schema.prisma` | ✅ Complete | Full location hierarchy |
| **Supplier** model | None | ❌ Missing | Needs creation |
| **Warehouse** model | None | ❌ Missing | Needs creation |
| **WorkOrder** model | None | ❌ Missing | Needs creation |
| **MaintenanceSchedule** | None | ❌ Missing | Needs creation |
| **Calibration** model | None | ❌ Missing | Needs creation |
| **Warranty** model | None | ❌ Missing | Needs creation |
| **FieldTechnician** | None | ❌ Missing | Needs creation |
| **Inventory** tracking | None | ❌ Missing | Needs creation |
| **Asset health scoring** | None | ❌ Missing | Needs creation |

### 1.2 Existing Meter State Machine (workflow-engine.js)

```
stock → assigned → installed → reading → disconnected → maintenance → retired
```

This is the foundation for the asset lifecycle in C16.

### 1.3 Gap Analysis

| Capability | Current | C16 Target |
|------------|---------|------------|
| **Asset hierarchy** | Meter only | Full hierarchy: Category→Type→Meter→Component |
| **Asset procurement** | ❌ None | Purchase orders, receiving, supplier quality |
| **Warehouse inventory** | ❌ None | Multi-warehouse, stock movements, bin locations |
| **Batch/serial tracking** | Serial on Meter | Full batch lots, serial genealogy |
| **Installation workflow** | Basic status change | Complete install with checklist, photos, docs |
| **Preventive maintenance** | ❌ None | Scheduled maintenance plans |
| **Predictive maintenance** | ❌ None | AI-driven failure prediction |
| **Work order management** | ❌ None | Full WO lifecycle with assignments |
| **Field technician mgmt** | ❌ None | Skills, certifications, scheduling |
| **Calibration management** | ❌ None | Calibration schedules, results tracking |
| **Warranty management** | ❌ None | Warranty periods, claims tracking |
| **Asset health scoring** | ❌ None | 0-100 composite health score |
| **Supplier performance** | ❌ None | Quality metrics, delivery performance |
| **Inventory forecasting** | ❌ None | Demand-based reorder prediction |

---

## PART 2: ASSET LIFECYCLE ARCHITECTURE

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│            ENTERPRISE ASSET LIFECYCLE, FIELD OPERATIONS & WORKFORCE MANAGEMENT PLATFORM                  │
│                                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │  ASSET INTELLIGENCE LAYER                                                                        │       │
│  │                                                                                                  │       │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐              │       │
│  │  │ Asset Hierarchy  │ │ Asset Health    │ │ Failure Mode    │ │ Warranty &       │              │       │
│  │  │ & Taxonomy       │ │ Scoring (0-100) │ │ Library         │ │ Claim Tracking   │              │       │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────────┘              │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │  ASSET LIFECYCLE LAYER                                                                          │       │
│  │                                                                                                  │       │
│  │  PROCUREMENT → WAREHOUSE → INSTALL → OPERATE → MAINTAIN → REPAIR → RETIRE → DISPOSE            │       │
│  │                                                                                                  │       │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────┐ │       │
│  │  │ Purchase  │ │ Goods     │ │ Install   │ │ Operate   │ │ Preventive│ │ Corrective│ │Retire│ │       │
│  │  │ Order     │ │ Receipt   │ │ Work Order│ │ (monitor) │ │ Maint     │ │ Maint     │ │      │ │       │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └──────┘ │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │  FIELD OPERATIONS LAYER                                                                         │       │
│  │                                                                                                  │       │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐              │       │
│  │  │ Work Order      │ │ Technician      │ │ Route Planning  │ │ Inspection       │              │       │
│  │  │ Lifecycle       │ │ Scheduling      │ │ (web-based)     │ │ Checklists       │              │       │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────────┘              │       │
│  │                                                                                                  │       │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                                    │       │
│  │  │ Calibration     │ │ Safety & Permit │ │ Contractor      │                                    │       │
│  │  │ Management      │ │ to Work         │ │ Management      │                                    │       │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘                                    │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │  WORKFORCE MANAGEMENT LAYER                                                                      │       │
│  │                                                                                                  │       │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐              │       │
│  │  │ Technician      │ │ Skill & Cert    │ │ Time &          │ │ Contractor SLA   │              │       │
│  │  │ Profile         │ │ Management      │ │ Attendance      │ │ Management       │              │       │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────────┘              │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │  AI MAINTENANCE INTELLIGENCE AGENT                                                               │       │
│  │                                                                                                  │       │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐              │       │
│  │  │ Failure         │ │ Maintenance     │ │ Spare Parts     │ │ Technician       │              │       │
│  │  │ Prediction      │ │ Optimization    │ │ Forecasting     │ │ Recommendation   │              │       │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────────┘              │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │  DASHBOARDS                                                                                     │       │
│  │                                                                                                  │       │
│  │  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ┌──────────────────┐  │       │
│  │  │ Executive Asset     │ │ Operations         │ │ Warehouse           │ │ Maintenance      │  │       │
│  │  │ Dashboard           │ │ Dashboard           │ │ Dashboard           │ │ Dashboard        │  │       │
│  │  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ └──────────────────┘  │       │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Asset Hierarchy

```
Level 0: UTILITY
  ├── Electric
  ├── Water
  ├── Gas
  └── Solar

Level 1: AREA (October, New Cairo, SODIC)

Level 2: PROJECT (within area)

Level 3: SITE / ZONE (physical location within project)

Level 4: ASSET CATEGORY
  ├── Meter
  │   ├── Electric Meter (single-phase, three-phase, smart)
  │   ├── Water Meter (domestic, bulk, fire)
  │   └── Gas Meter (domestic, industrial)
  ├── Gateway / Concentrator
  ├── SIM Card
  ├── Communication Module
  └── Spare Part

Level 5: INDIVIDUAL ASSET (serial-numbered)
  └── Meter: MTR-4512 (with sub-components: comm module, battery, sensor)

Level 6: COMPONENT (replaceable parts within an asset)
```

### 2.3 Meter Lifecycle States (Enhanced from existing)

```
                    ┌──────────┐
                    │  ORDERED │  Purchase order placed with supplier
                    └────┬─────┘
                         │
                    ┌────▼──────┐
                    │  RECEIVED  │  Goods received at warehouse
                    └────┬──────┘
                         │
                    ┌────▼───┐
                    │ STOCK   │  In warehouse, available for assignment
                    └────┬───┘
                         │
                    ┌────▼──────┐
                    │ ASSIGNED  │  Linked to customer/contract
                    └────┬──────┘
                         │
                    ┌────▼───────┐
                    │ INSTALLED   │  Physically installed at site
                    └────┬───────┘
                         │
                    ┌────▼──────┐
                    │  ACTIVE   │  Producing readings ─── normal operation
                    └────┬──────┘
                         │
               ┌─────────┼──────────┐
               │         │          │
          ┌────▼────┐ ┌──▼───┐ ┌───▼──────┐
          │MAINTE-  │ │DISCON│ │ SUSPENDED │
          │ NANCE   │ │NECTED│ │           │
          └────┬────┘ └──┬───┘ └────┬──────┘
               │         │          │
               └─────────┼──────────┘
                         │
                    ┌────▼──────┐
                    │ RETIRED    │  End of operational life
                    └────┬──────┘
                         │
                    ┌────▼───────┐
                    │DECOMMISSION │  Removed from site
                    └────┬───────┘
                         │
               ┌─────────┼──────────┐
               │         │          │
          ┌────▼────┐ ┌──▼───┐ ┌───▼──────┐
          │SCRAPPED │ │SOLD  │ │RETURNED  │
          │         │ │      │ │TO SUPPL  │
          └─────────┘ └──────┘ └──────────┘
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 Asset (NEW — base asset entity)

**Purpose:** Base asset record for all physical assets (meters, gateways, SIMs, components).

```
Asset
├── id: String (UUID, PK)
├── assetType: String                    ← METER | GATEWAY | SIM | COMM_MODULE | SPARE_PART
├── categoryId: String (FK → AssetCategory)
├── serialNumber: String (UNIQUE)
├── batchNumber: String?
├── manufacturer: String?
├── model: String?
├── firmwareVersion: String?
├── yearOfManufacture: Int?
├── supplierId: String? (FK → Supplier)
├── purchaseOrder: String?
├── purchaseDate: DateTime?
├── receivedDate: DateTime?
├── warrantyExpiry: DateTime?
├── lifecycleStatus: String              ← ORDERED|RECEIVED|STOCK|ASSIGNED|INSTALLED|ACTIVE|
│                                           MAINTENANCE|DISCONNECTED|SUSPENDED|RETIRED|DECOMMISSIONED|SCRAPPED
├── operationalStatus: String            ← NORMAL | WARNING | CRITICAL | OFFLINE
├── locationType: String?                ← WAREHOUSE | SITE | TRANSIT | SUPPLIER
├── warehouseId: String? (FK → Warehouse)
├── warehouseBin: String?
├── siteId: String?                      ← FK → Zone/Unit (where installed)
├── areaId: String? (FK → Area)
├── projectId: String? (FK → Project)
├── currentCustomerId: String? (FK → Customer)
├── commissionDate: DateTime?
├── lastMaintenanceDate: DateTime?
├── nextMaintenanceDate: DateTime?
├── healthScore: Float?                  ← 0-100 computed
├── metadata: String (JSON)?
├── createdAt, archivedAt, updatedAt

Indexes:
  @@index([serialNumber])
  @@index([assetType, lifecycleStatus])
  @@index([warehouseId, lifecycleStatus])
  @@index([areaId, lifecycleStatus])
  @@index([supplierId])
  @@index([healthScore])
```

### 3.2 AssetCategory (NEW)

```
AssetCategory
├── id, name (UNIQUE), parentId (self), assetType, description
├── expectedLifespanMonths: Int?
├── calibrationIntervalDays: Int?
├── maintenanceIntervalDays: Int?
├── active, createdAt, archivedAt

Hierarchy: Meter → Electric Meter → Single-phase Smart Meter
```

### 3.3 Supplier (NEW)

```
Supplier
├── id, name (UNIQUE), code, contactPerson, email, phone
├── address, taxId, paymentTerms
├── status: ACTIVE | INACTIVE | BLACKLISTED
├── qualityRating: Float?               ← 0-100
├── onTimeDeliveryRate: Float?          ← 0-100
├── averageLeadTimeDays: Int?
├── active, createdAt, archivedAt, updatedAt

Relations:
  assets → Asset[]
  purchaseOrders → PurchaseOrder[]
```

### 3.4 Warehouse (NEW)

```
Warehouse
├── id, name (UNIQUE), code, type: CENTRAL | REGIONAL | SITE
├── address, manager, contactPhone
├── areaId: String? (FK → Area)
├── capacity: Int?
├── active, createdAt, archivedAt

Relations:
  bins → WarehouseBin[]
  stock → InventoryStock[]
```

### 3.5 WarehouseBin (NEW)

```
WarehouseBin
├── id, warehouseId (FK), code, zone, maxCapacity
├── currentCount: Int, active, createdAt
```

### 3.6 InventoryStock (NEW)

```
InventoryStock
├── id, warehouseId (FK), assetCategoryId (FK)
├── quantity: Int, reservedQuantity: Int @default(0)
├── availableQuantity: Int (computed)
├── reorderPoint: Int?, reorderQuantity: Int?
├── unitCost: Float?, currency: String @default("EGP")
├── lastCountedAt: DateTime?, active, createdAt, updatedAt

Indexes:
  @@unique([warehouseId, assetCategoryId])
```

### 3.7 InventoryMovement (NEW)

```
InventoryMovement
├── id, fromWarehouseId?, toWarehouseId?, assetCategoryId
├── referenceType: String               ← PURCHASE_RECEIPT | INSTALL | RETURN | TRANSFER | ADJUSTMENT
├── referenceId: String?
├── quantity: Int (positive=in, negative=out)
├── unitCost: Float?, totalCost: Float?
├── reason: String?, performedBy: String?
├── createdAt
```

### 3.8 PurchaseOrder (NEW)

```
PurchaseOrder
├── id, poNumber (UNIQUE), supplierId (FK)
├── status: DRAFT | SUBMITTED | ACKNOWLEDGED | SHIPPED | PARTIAL | RECEIVED | CANCELLED
├── orderDate, expectedDate, receivedDate
├── items: String (JSON) — [{ assetCategoryId, quantity, unitPrice, received }]
├── totalAmount, currency
├── notes, createdBy, approvedBy, createdAt, archivedAt, updatedAt
```

### 3.9 WorkOrder (NEW)

**Purpose:** Central work order for all field operations.

```
WorkOrder
├── id, woNumber (UNIQUE)
├── type: String                        ← INSTALL | REPLACE | REMOVE | MAINTENANCE_PREVENTIVE |
│                                           MAINTENANCE_CORRECTIVE | CALIBRATION | INSPECTION | REPAIR
├── priority: String                    ← LOW | MEDIUM | HIGH | CRITICAL
├── status: String                      ← OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | VERIFIED | CANCELLED
├── assetId: String? (FK → Asset)
├── assetSerial: String?
├── customerId: String? (FK → Customer)
├── siteId: String?                     ← FK → Zone/Unit
├── areaId: String? (FK → Area)
├── description: String
├── scheduledDate: DateTime?
├── startedAt: DateTime?
├── completedAt: DateTime?
├── durationMinutes: Int?
├── technicianId: String? (FK → FieldTechnician)
├── teamId: String? (FK → TechnicianTeam)
├── checklistId: String? (FK → InspectionChecklist)
├── checklistResults: String (JSON)?
├── partsUsed: String (JSON)?           ← [{ partId, quantity, cost }]
├── resolution: String?
├── customerSignature: Boolean @default(false)
├── beforePhotoUrl: String?
├── afterPhotoUrl: String?
├── linkedIncidentId: String?           ← FK → Incident (C12)
├── linkedRcaCaseId: String?            ← FK → RCACase (C12-W07)
├── permitRequired: Boolean @default(false)
├── permitId: String? (FK → SafetyPermit)
├── createdAt, archivedAt, updatedAt

Indexes:
  @@index([type, status])
  @@index([technicianId, status])
  @@index([assetId])
  @@index([areaId, scheduledDate])
```

### 3.10 FieldTechnician (NEW)

```
FieldTechnician
├── id, userId (FK → User, nullable)
├── employeeCode: String (UNIQUE)
├── name, email, phone
├── status: ACTIVE | INACTIVE | ON_LEAVE | TERMINATED
├── type: EMPLOYEE | CONTRACTOR
├── contractorCompany: String?
├── skills: String (JSON)               ← ["electric_meter_install", "water_meter_repair", ...]
├── certifications: String (JSON)       ← [{ name, issuedBy, expiryDate }]
├── maxWorkOrdersPerDay: Int @default(6)
├── currentWorkload: Int @default(0)
├── areaId: String? (FK → Area)
├── latitude: Float?, longitude: Float?
├── active, createdAt, archivedAt, updatedAt

Indexes:
  @@index([status, areaId])
  @@index([status, currentWorkload])
```

### 3.11 TechnicianTeam (NEW)

```
TechnicianTeam
├── id, name, leadId (FK → FieldTechnician)
├── areaId, status, active
├── members String (JSON)
```

### 3.12 MaintenancePlan (NEW)

```
MaintenancePlan
├── id, assetCategoryId (FK)
├── name, description
├── type: PREVENTIVE | PREDICTIVE | CONDITION_BASED
├── frequencyType: DAYS | WEEKS | MONTHS | METER_READING
├── frequencyValue: Int
├── estimatedDuration: Int (minutes)
├── requiresShutdown: Boolean @default(false)
├── checklistId: String? (FK → InspectionChecklist)
├── active, createdAt, archivedAt
```

### 3.13 MaintenanceSchedule (NEW — generated from plans)

```
MaintenanceSchedule
├── id, maintenancePlanId (FK)
├── assetId: String? (FK → Asset)
├── scheduledDate: DateTime
├── status: PENDING | IN_PROGRESS | COMPLETED | SKIPPED
├── workOrderId: String? (FK → WorkOrder)
├── completedAt: DateTime?, completedBy: String?
├── notes: String?, createdAt
```

### 3.14 CalibrationRecord (NEW)

```
CalibrationRecord
├── id, assetId (FK), assetSerial, performedBy
├── calibrationDate, nextCalibrationDate
├── standardUsed, results: String (JSON)
├── status: PASS | FAIL | CONDITIONAL
├── adjustmentMade: Boolean @default(false)
├── certificateNumber: String?
├── certificateFileUrl: String?
├── notes, createdAt
```

### 3.15 WarrantyClaim (NEW)

```
WarrantyClaim
├── id, assetId (FK), assetSerial, supplierId (FK)
├── claimNumber (UNIQUE), claimDate
├── defectType, description
├── status: SUBMITTED | APPROVED | REPLACED | REJECTED | CREDITED
├── resolution: String?
├── replacementAssetId: String? (FK → Asset)
├── costCovered: Float?, costRejected: Float?
├── approvedBy, approvedAt, createdAt, archivedAt
```

### 3.16 SafetyPermit (NEW)

```
SafetyPermit
├── id, permitNumber (UNIQUE), workOrderId (FK)
├── type: ELECTRICAL_WORK | HEIGHT_WORK | CONFINED_SPACE | HOT_WORK
├── description, riskAssessment: String (JSON)
├── requiredPPE: String (JSON)
├── issuedBy, issuedAt, validFrom, validTo
├── status: ACTIVE | EXPIRED | CANCELLED
├── signedByTechnician: Boolean @default(false)
├── signedBySupervisor: Boolean @default(false)
├── createdAt, archivedAt
```

### 3.17 InspectionChecklist (NEW)

```
InspectionChecklist
├── id, name, assetCategoryId (FK)
├── items: String (JSON)               ← [{ order, question, type: BOOL | TEXT | PHOTO | VALUE }]
├── active, createdAt, archivedAt
```

### 3.18 AssetHealthScore (NEW — periodic snapshots)

```
AssetHealthScore
├── id, assetId (FK), score: Float (0-100)
├── components: String (JSON)          ← [{ dimension: "age", score: 80, weight: 0.3 }]
├── computedAt: DateTime
├── computedBy: String (SYSTEM | MANUAL)
├── createdAt

Index:
  @@index([assetId, computedAt])
```

### 3.19 FailureMode (NEW)

```
FailureMode
├── id, assetCategoryId (FK)
├── code, name, description
├── severity: LOW | MEDIUM | HIGH | CRITICAL
├── probability: LOW | MEDIUM | HIGH
├── detectability: EASY | MODERATE | DIFFICULT
├── rpn: Int (computed = severity × probability × detectability)
├── typicalCauses: String (JSON)
├── typicalRemedies: String (JSON)
├── active, createdAt, archivedAt
```

### 3.20 New Models Summary

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | Asset | ~34 | Base asset entity (extends Meter concept) |
| 2 | AssetCategory | ~12 | Asset type taxonomy |
| 3 | Supplier | ~14 | Vendor/supplier management |
| 4 | Warehouse | ~12 | Physical warehouse locations |
| 5 | WarehouseBin | ~8 | Bin locations within warehouse |
| 6 | InventoryStock | ~14 | Stock levels and reorder points |
| 7 | InventoryMovement | ~12 | Stock movement audit trail |
| 8 | PurchaseOrder | ~16 | Procurement lifecycle |
| 9 | WorkOrder | ~30 | Central field operations document |
| 10 | FieldTechnician | ~16 | Technician profiles and skills |
| 11 | TechnicianTeam | ~8 | Team grouping |
| 12 | MaintenancePlan | ~14 | Preventive/predictive plan definition |
| 13 | MaintenanceSchedule | ~12 | Generated maintenance events |
| 14 | CalibrationRecord | ~14 | Calibration tracking |
| 15 | WarrantyClaim | ~14 | Warranty claims |
| 16 | SafetyPermit | ~14 | Permit-to-work |
| 17 | InspectionChecklist | ~10 | Digital checklists |
| 18 | AssetHealthScore | ~10 | Periodic health snapshots |
| 19 | FailureMode | ~12 | Failure mode library |
| **Total** | **19 new models** | **~280 lines** | |

---

## PART 4: WORK ORDER LIFECYCLE

### 4.1 Work Order States

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  OPEN    │────→│ ASSIGNED │────→│ IN_PROGRESS │────→│ COMPLETED│────→│ VERIFIED │────→│ CANCELLED│
│ (auto or │     │ (tech)   │     │ (started)   │     │ (done)   │     │ (check)  │     │ (anytime)│
│  manual) │     └──────────┘     └────────────┘     └────┬─────┘     └────┬─────┘     └──────────┘
└──────────┘                                               │               │
                                                            │               │
                                                            ▼               ▼
                                                     ┌──────────┐   ┌──────────┐
                                                     │ COMPLETED │   │ REOPENED │
                                                     │ (if no    │   │ (if issue │
                                                     │  issues)  │   │  remains) │
                                                     └──────────┘   └──────────┘
```

### 4.2 Work Order Creation Flows

```
AUTO-CREATE (Preventive Maintenance):
  MaintenanceSchedule.run():
    → FOR each MaintenancePlan:
        → FOR each asset matching plan criteria:
            → IF asset.nextMaintenanceDate <= today + 7 days:
                → CREATE WorkOrder {
                    type: "MAINTENANCE_PREVENTIVE",
                    assetId, priority: "MEDIUM",
                    description: `Scheduled: ${plan.name}`,
                    scheduledDate: plan.date,
                  }

AUTO-CREATE (Predictive — via AI Agent):
  AI Agent detects anomaly (health score drop, failure probability > threshold):
    → CREATE WorkOrder {
        type: "MAINTENANCE_CORRECTIVE",
        assetId, priority: "HIGH",
        description: `AI-predicted failure: ${failureMode.name} — probability ${pct}%`,
      }

MANUAL CREATE (Any trigger — customer call, meter event, inspection):
  User or system triggers:
    → CREATE WorkOrder { type, assetId, customerId, description }
```

### 4.3 Technician Assignment

```
AssignmentEngine.assignWorkOrder(workOrder):
  1. FIND candidates:
     technicians = FieldTechnician.findMany({
       status: "ACTIVE",
       areaId: workOrder.areaId,
       skills: { hasSome: requiredSkills(workOrder.type) },
       currentWorkload: { lt: maxWorkOrdersPerDay },
     })
  
  2. SCORE each candidate:
     score = baseMatch × workloadFactor × proximityFactor × skillMatch
     baseMatch = 1.0
     workloadFactor = 1 - (currentWorkload / maxWorkOrdersPerDay) × 0.5
     proximityFactor = if technician has location → proximityScore
     skillMatch = matchingSkills / requiredSkills
  
  3. ASSIGN to highest scorer:
     WorkOrder.technicianId = bestTechnician.id
     FieldTechnician.currentWorkload += 1
  
  4. NOTIFY technician (in-app + SMS)
```

---

## PART 5: AI MAINTENANCE INTELLIGENCE AGENT

### 5.1 Agent Design

**Agent Name:** Maintenance Intelligence Agent  
**Framework:** C12-W07 Operational Intelligence  
**Autonomy:** ⚡ Semi-autonomous  

| Capability | Autonomy | Approval |
|------------|----------|----------|
| Failure prediction | ✅ Full | None (alert only) |
| Maintenance optimization | ⚡ Semi | Required for schedule changes |
| Spare parts forecasting | ✅ Full | None (read-only) |
| Technician recommendation | ⚡ Semi | Recommended assignment |

### 5.2 Failure Prediction

```
ALGORITHM: predictFailures():
  FOR each ACTIVE asset:
    factors = {
      age_months: monthsSinceCommission(asset),
      last_maintenance_days: daysSince(asset.lastMaintenanceDate),
      meter_events_30d: count(MeterEvent, 30 days),
      health_score_trend: getHealthScoreTrend(asset, 90 days),
      reading_anomalies_30d: count(anomalous readings),
      temperature_stress: getTemperatureExposure(asset),  // future
    }
    
    riskScore = WEIGHTED_SUM(factors)   // 0-100
    
    IF riskScore > 80 AND asset.healthScore < 50:
      // Schedule corrective maintenance
      CREATE WorkOrder { type: "MAINTENANCE_CORRECTIVE", priority: "HIGH" }
      CREATE ExecutiveInsight { type: "RISK", title: "Failure predicted", severity: "HIGH" }
    
    IF riskScore > 60 AND asset.nextMaintenanceDate > 30 days:
      // Reschedule maintenance earlier
      RESCHEDULE asset.nextMaintenanceDate
      CREATE ExecutiveInsight { type: "RECOMMENDATION", title: "Maintenance advance recommended" }
```

### 5.3 Spare Parts Forecasting

```
ALGORITHM: forecastSpareParts():
  FOR each assetCategory:
    historicalUsage = InventoryMovement.findMany({
      referenceType: "INSTALL" or "REPAIR",
      date: { gte: 12 months ago },
    })
    
    monthlyAvg = AVG(historicalUsage, quantity per month)
    seasonalityFactor = getSeasonality(assetCategory)
    growthFactor = getInstallationGrowthRate()
    
    forecastQty = monthlyAvg × seasonalityFactor × growthFactor × safetyStock
    
    CREATE InventoryForecast {
      assetCategoryId,
      month: next 6 months,
      recommendedStock,
      currentStock,
      reorderRecommended: currentStock < recommendedStock,
    }
```

---

## PART 6: ASSET HEALTH SCORING

### 6.1 Health Score Dimensions

| Dimension | Weight | Calculation |
|-----------|--------|-------------|
| **Age** | 25% | `MAX(0, 100 × (1 - ageMonths / expectedLifespanMonths))` |
| **Maintenance** | 20% | `MAX(0, 100 × (1 - daysSinceLastMaint / maintIntervalDays))` |
| **Event Count** | 20% | `MAX(0, 100 - eventsLast90Days × 10)` |
| **Reading Quality** | 15% | `% of valid readings in last 30 days` |
| **Calibration** | 10% | `daysUntilNextCal / calibrationInterval × 100` |
| **Operational Stability** | 10% | `1 - (downtimeHours / totalHours) × 100` |

### 6.2 Health Score Calculation

```
computeAssetHealth(assetId):
  asset = Asset.findUnique(assetId)
  category = AssetCategory.findUnique(asset.categoryId)
  events = MeterEvent.findMany({ meterId: assetId, createdAt: { gte: 90 days } })
  readings = Reading.findMany({ meterId: assetId, createdAt: { gte: 30 days } })
  
  ageScore = MAX(0, 100 × (1 - assetAgeMonths / category.expectedLifespanMonths))
  maintScore = asset.lastMaintenanceDate
    ? MAX(0, 100 × (1 - daysSinceLastMaint / category.maintenanceIntervalDays))
    : 50  // no maintenance record — assume average
  eventScore = MAX(0, 100 - events.length × 10)
  readingScore = (validReadings / totalReadings) × 100
  calScore = asset.lastCalibrationDate
    ? (daysUntilNextCal / category.calibrationIntervalDays) × 100
    : 30  // no calibration — assume poor
  stabilityScore = 100 - (downtimeHours / (90 × 24)) × 100
  
  healthScore =
    ageScore × 0.25 +
    maintScore × 0.20 +
    eventScore × 0.20 +
    readingScore × 0.15 +
    calScore × 0.10 +
    stabilityScore × 0.10
  
  AssetHealthScore.create({ assetId, score: healthScore, components })
  Asset.update(assetId, { healthScore })
  
  RETURN { score, ageScore, maintScore, eventScore, readingScore, calScore, stabilityScore }
```

---

## PART 7: DASHBOARDS

### 7.1 Executive Asset Dashboard (`/admin/assets/executive`)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ EXECUTIVE ASSET DASHBOARD                                                                      │
│                                                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Total Assets │ │ Active       │ │ In           │ │ Health       │ │ Avg Age      │        │
│ │    245,000   │ │    212,000   │ │ Maintenance  │ │ Score        │ │     4.2 yrs  │        │
│ │              │ │              │ │       3,200  │ │     78/100   │ │              │        │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                                                               │
│ ┌────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ ASSETS BY CATEGORY                           │ HEALTH SCORE DISTRIBUTION                 │   │
│ │                                               │                                           │   │
│ │ Electric Meters   ████████████████████  142K  │ ██ 90-100 (Excellent)        42%         │   │
│ │ Water Meters      ████████████           82K  │ ██ 70-89  (Good)             35%         │   │
│ │ Gas Meters        ████                   12K  │ ██ 50-69  (Fair)             15%         │   │
│ │ Gateways          ███                    9K   │ ██ < 50   (Poor)              8%         │   │
│ │ SIM Cards         █████████████████████████   │                                           │   │
│ └───────────────────────────────────────────────┴───────────────────────────────────────────┘   │
│                                                                                               │
│ ┌────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ OPEN WORK ORDERS (1,245)                              │ PREDICTIVE ALERTS (12)          │   │
│ │ ┌──────────┬────────┬──────┬────────┬──────────────┐  │                                 │   │
│ │ │ Priority │ Type   │ Age  │ Tech   │ Site         │  │ ⚠ MTR-4512 — Failure risk 87% │   │
│ │ │ CRITICAL │ REPAIR │ 2d   │ Ahmed  │ October-A2   │  │ ⚠ MTR-8912 — Health score 32  │   │
│ │ │ HIGH     │ INSTALL│ 5d   │ Sara   │ New Cairo-B1 │  │ ⚠ GW-3341 — Comms offline 3d  │   │
│ │ │ MEDIUM   │ CALIB  │ 8d   │ Mariam │ SODIC-C3     │  │ 🔔 Warranty expiring: 45 units│   │
│ │ └──────────┴────────┴──────┴────────┴──────────────┘  │                                 │   │
│ └────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Operations Dashboard (`/admin/assets/operations`)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ OPERATIONS DASHBOARD                                                                           │
│                                                                                               │
│ ┌─── WORK ORDERS TODAY ─────────────────────────────────────────────────────────────────┐    │
│ │ ┌──────────┬────────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐  │    │
│ │ │ WO #     │ Type       │ Asset    │ Site     │ Tech     │ Status   │ ETA          │  │    │
│ │ │ WO-2026- │ REPAIR     │ MTR-4512 │ Oct A2   │ Ahmed    │ IN_PROG  │ 30 min       │  │    │
│ │ │ 0789     │            │          │          │          │          │              │  │    │
│ │ │ WO-2026- │ INSTALL    │ MTR-8912 │ NC B1    │ Sara     │ ASSIGNED │ 2 hours      │  │    │
│ │ │ 0790     │            │          │          │          │          │              │  │    │
│ │ │ WO-2026- │ MAINT-PREV │ GW-3341  │ SOD C3   │ Mariam   │ OPEN     │ Not assigned │  │    │
│ │ │ 0791     │            │          │          │          │          │              │  │    │
│ │ └──────────┴────────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘  │    │
│ └────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                               │
│ ┌─────────────────────────┐ ┌────────────────────────────────────────────────────────────┐   │
│ │ TECHNICIAN WORKLOAD       │ │ UPCOMING MAINTENANCE (Next 7 Days)                         │   │
│ │                          │ │                                                             │   │
│ │ Ahmed ██████████████ 6/6 │ │ Mon: 12 WOs │ Tue: 15 WOs │ Wed: 10 WOs │ Thu: 8 WOs     │   │
│ │ Sara  ████████████ 4/6   │ │                                                             │   │
│ │ Mariam████████████ 5/6   │ │ PM Schedule: 12 Planned | 8 Predictive | 5 Calibration    │   │
│ │ Omar  ██████ 3/6         │ │ Technician availability: 6/8                               │   │
│ │ Khaled████ 2/6           │ │                                                             │   │
│ └─────────────────────────┘ └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Warehouse Dashboard (`/admin/assets/warehouse`)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ WAREHOUSE DASHBOARD                                                                           │
│                                                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Warehouses   │ │ Total Stock  │ │ Reserved     │ │ Low Stock    │ │ Pending      │        │
│ │         3    │ │     45,000   │ │      3,200   │ │ Items  12    │ │ Receipts  5  │        │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                                                               │
│ ┌─── INVENTORY LEVELS ──────────────────────────────────────────────────────────────────┐    │
│ │ ┌──────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬────────────┐  │    │
│ │ │ Item         │ Warehouse│ In Stock │ Reserved │ Available│ Reorder  │ Status     │  │    │
│ │ │ Smart Meter  │ Central  │ 2,500    │ 300      │ 2,200    │ 500      │ ✅ OK      │  │    │
│ │ │ Water Meter  │ Central  │ 1,800    │ 200      │ 1,600    │ 400      │ ✅ OK      │  │    │
│ │ │ Comm Module  │ Regional │ 200      │ 50       │ 150      │ 200      │ ⚠ LOW      │  │    │
│ │ │ SIM Card     │ Central  │ 5,000    │ 500      │ 4,500    │ 1,000    │ ✅ OK      │  │    │
│ │ │ Battery Pack │ Regional │ 50       │ 10       │ 40       │ 100      │ 🔴 CRITICAL│  │    │
│ │ └──────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴────────────┘  │    │
│ └────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                               │
│ [ Create PO ] [ Receive Stock ] [ Transfer Between Warehouses ] [ Count Stock ]               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 8: INTEGRATION STRATEGY

### 8.1 Cross-Program Integration

| Source | Integration | C16 Consumer |
|--------|-------------|--------------|
| **C12 Identity** | Auth, RBAC, audit | Tech login, work order audit |
| **C12-W07 OI** | RCA cases, LearnedPattern | Failure mode ↔ RCA linkage |
| **C12-W07 AI Rec** | AI recommendations | Maintenance Intelligence Agent |
| **C13 Inventory** | Asset costing, depreciation | Asset value tracking |
| **C14 Customer** | Customer ticketing | Service request → Work Order |
| **C15 Integration** | GIS connector | Site location mapping |
| **Meter Reading** | Reading quality data | Health score dimension |
| **MeterEvent** | Event data | Failure mode detection |
| **Existing Meter** | Core asset record | Base asset hierarchy |

### 8.2 Event Integration

| Event | Publisher | C16 Subscriber |
|-------|-----------|----------------|
| `meter.event.raised` | MeterEvent | Create corrective WorkOrder |
| `meter.reading.anomaly` | Reading Validation | Flag asset health |
| `customer.service.request` | C14 Portal | Create WorkOrder from request |
| `invoice.generated` | C13 Billing | No direct — asset ops |
| `supplier.delivery.received` | C16 Receiving | Update InventoryStock |
| `work.order.completed` | C16 WorkOrder | Update asset health, schedule next PM |

---

## PART 9: TESTING STRATEGY — C16 (150 Tests)

### 9.1 Asset Lifecycle Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Create asset → status ORDERED | Correct initial |
| 2 | Receive asset → status RECEIVED | Transition |
| 3 | Move to stock → status STOCK | Transition |
| 4 | Install asset → status INSTALLED | Transition |
| 5 | Retire asset → status RETIRED | End state |
| 6 | Scrap asset → status SCRAPPED | Disposal |
| 7 | Invalid transition → rejected | State guard |
| 8 | Asset serial duplicate → rejected | Unique |

### 9.2 Work Order Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Create WO → status OPEN | Initial |
| 2 | Assign technician → status ASSIGNED | Transition |
| 3 | Start work → status IN_PROGRESS | Transition |
| 4 | Complete work → status COMPLETED | Transition |
| 5 | Verify work → status VERIFIED | Final |
| 6 | Cancel work → status CANCELLED | Anytime |
| 7 | Complete without parts → no parts recorded | Optional |
| 8 | Complete with parts → inventory deducted | Stock update |
| 9 | Check technician workload before assign | Capacity check |
| 10 | WO with photos → attachments stored | Evidence |

### 9.3 Inventory Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Receive PO → stock increases | Correct qty |
| 2 | Install asset → stock decreases | Correct qty |
| 3 | Transfer between warehouses → both updated | Movement |
| 4 | Stock below reorder → alert | Threshold |
| 5 | Stock count adjustment → corrected | Inventory |
| 6 | Reserved stock → not available | Reservation |
| 7 | Negative stock → prevented | Guard |
| 8 | Multiple warehouses → independent | Isolation |
| 9 | Batch tracking → full genealogy | Traceability |
| 10 | Movement audit → all movements logged | Audit trail |

### 9.4 Field Technician Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create technician → active | Correct status |
| 2 | Assign WO to qualified tech → skill check | Skills matched |
| 3 | Assign WO to unqualified tech → rejected | Missing skill |
| 4 | Max workload reached → cannot assign | Capacity |
| 5 | Technician on leave → not assignable | Status check |
| 6 | Certification expired → flag | Cert check |
| 7 | Team assignment → all members eligible | Team logic |

### 9.5 Maintenance Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Create maintenance plan → active | Created |
| 2 | Generate schedule from plan → correct dates | Scheduled |
| 3 | Preventive WO auto-created at due date | Auto-create |
| 4 | Complete maintenance → next date computed | Rescheduled |
| 5 | Skip maintenance → logged, not rescheduled | Skip |
| 6 | Predictive maintenance AI → WO created | AI trigger |
| 7 | Calibration due → notification | Alert |
| 8 | Calibration failed → asset flagged | Status |

### 9.6 Asset Health Score Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | New asset → health 100 | Perfect |
| 2 | Old asset → health declining | Age factor |
| 3 | Frequent events → lower health | Event factor |
| 4 | Recent maintenance → health improved | Maint factor |
| 5 | No readings → lower health | Reading factor |
| 6 | Health score range 0-100 | Range check |
| 7 | Health score recomputed on event | Refresh |
| 8 | Historical snapshots stored | Time series |

### 9.7 Supplier & Procurement Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create supplier → active | Created |
| 2 | Create PO → DRAFT | Initial |
| 3 | Submit PO → SUBMITTED | Transition |
| 4 | Receive partial shipment → PARTIAL | Partial |
| 5 | Receive full → RECEIVED | Complete |
| 6 | Supplier quality rating → computed | Avg score |
| 7 | Supplier on-time delivery → tracked | Metric |
| 8 | Blacklist supplier → cannot create PO | Guard |

### 9.8 Safety & Permit Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Create safety permit → ACTIVE | Initial |
| 2 | Work requires permit → permit created | Auto-create |
| 3 | Expired permit → work blocked | Guard |
| 4 | Both signatures required → completed | Dual sign |
| 5 | Permit cancelled → work order flagged | Cascade |

### 9.9 AI Agent Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Failure prediction → WO created | Correct trigger |
| 2 | Normal asset → no prediction | No false positive |
| 3 | Maintenance optimization → schedule adjusted | Correct |
| 4 | Spare parts forecast → quantities reasonable | Forecast |
| 5 | Technician recommendation → best match | Scoring |
| 6 | All AI actions audited | Audit trail |
| 7 | Health score trend logged | Time series |

---

## PART 10: C16 DEFINITION OF DONE

```
C16 — ASSET LIFECYCLE, FIELD OPERATIONS & WORKFORCE MANAGEMENT
CERTIFICATION CHECKLIST

□ CORE DATA MODELS — 19 NEW
   □ Asset (base asset entity with full lifecycle)
   □ AssetCategory (taxonomy hierarchy)
   □ Supplier (vendor management)
   □ Warehouse (locations)
   □ WarehouseBin (bin tracking)
   □ InventoryStock (stock levels)
   □ InventoryMovement (stock audit trail)
   □ PurchaseOrder (procurement)
   □ WorkOrder (central field ops document)
   □ FieldTechnician (profiles, skills, certs)
   □ TechnicianTeam (team grouping)
   □ MaintenancePlan (PM/PRED schedule defs)
   □ MaintenanceSchedule (generated events)
   □ CalibrationRecord (calibration tracking)
   □ WarrantyClaim (claims management)
   □ SafetyPermit (permit-to-work)
   □ InspectionChecklist (digital checklists)
   □ AssetHealthScore (periodic health 0-100)
   □ FailureMode (failure library)

□ ASSET LIFECYCLE — 12 STATES
   □ ORDERED → RECEIVED → STOCK → ASSIGNED → INSTALLED →
     ACTIVE → MAINTENANCE → DISCONNECTED → RETIRED →
     DECOMMISSIONED → SCRAPPED/SOLD/RETURNED
   □ State guards on all transitions
   □ Full serial genealogy

□ WORK ORDER MANAGEMENT
   □ Full lifecycle (OPEN→ASSIGNED→IN_PROGRESS→COMPLETED→VERIFIED)
   □ 8 work order types
   □ Technician skill-based assignment
   □ Parts consumption tracking
   □ Photo evidence capture
   □ Integration with RCA (C12-W07)

□ INVENTORY & WAREHOUSE
   □ Multi-warehouse with bin locations
   □ Stock in/out/reserved/available tracking
   □ Reorder point alerts
   □ Purchase order lifecycle
   □ Stock movement audit trail
   □ Cycle counting

□ MAINTENANCE MANAGEMENT
   □ Preventive maintenance plans
   □ Predictive maintenance (AI-driven)
   □ Auto-generated work orders
   □ Maintenance schedule calendar
   □ Calibration tracking
   □ Warranty claim management

□ FIELD WORKFORCE
   □ Technician profiles with skills + certs
   □ Skill-based WO assignment
   □ Workload balancing
   □ Team management
   □ Contractor management

□ ASSET HEALTH SCORING
   □ 6-dimension health score (0-100)
   □ Age, maintenance, events, readings, calibration, stability
   □ Periodic snapshots
   □ Trend tracking

□ SAFETY & COMPLIANCE
   □ Permit-to-work system
   □ Digital inspection checklists
   □ Safety risk assessment
   □ Dual-signature permits

□ AI MAINTENANCE INTELLIGENCE AGENT
   □ Failure prediction (risk scoring)
   □ Maintenance optimization
   □ Spare parts forecasting
   □ Technician recommendation
   □ C12 AIRecommendation integration

□ DASHBOARDS
   □ Executive Asset Dashboard
   □ Operations Dashboard
   □ Warehouse Dashboard
   □ Maintenance Dashboard

□ INTEGRATIONS
   □ C12 Identity (auth, audit)
   □ C12-W07 RCA + AI (failure ↔ RCA linkage)
   □ C13 Financial (asset costing)
   □ C14 Customer (service request → WO)
   □ C15 GIS (site mapping)
   □ Existing Meter/MeterEvent/Reading (core data)

□ SECURITY
   □ RBAC: Asset Admin, Field Tech, Warehouse, Viewer
   □ Work order + permit segregation
   □ Inventory adjustment requires approval
   □ All mutations audited

□ TESTS — 150 PASSING
   □ Asset lifecycle: 20 tests
   □ Work order: 20 tests
   □ Inventory: 20 tests
   □ Field technician: 15 tests
   □ Maintenance: 20 tests
   □ Asset health: 15 tests
   □ Supplier/procurement: 15 tests
   □ Safety/permit: 10 tests
   □ AI agent: 15 tests

C16 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: C16 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +280 lines (19 new models) |
| 2 | Migration: asset_management | CREATE | Standard |
| 3 | `backend/src/services/asset-service.js` | **CREATE** | ~200 lines |
| 4 | `backend/src/services/work-order-service.js` | **CREATE** | ~250 lines |
| 5 | `backend/src/services/inventory-service.js` | **CREATE** | ~180 lines |
| 6 | `backend/src/services/warehouse-service.js` | **CREATE** | ~120 lines |
| 7 | `backend/src/services/maintenance-scheduler.js` | **CREATE** | ~150 lines |
| 8 | `backend/src/services/field-technician-service.js` | **CREATE** | ~120 lines |
| 9 | `backend/src/services/asset-health-engine.js` | **CREATE** | ~100 lines |
| 10 | `backend/src/services/supplier-service.js` | **CREATE** | ~80 lines |
| 11 | `backend/src/services/calibration-service.js` | **CREATE** | ~80 lines |
| 12 | `backend/src/services/warranty-service.js` | **CREATE** | ~80 lines |
| 13 | `backend/src/services/safety-permit-service.js` | **CREATE** | ~80 lines |
| 14 | `backend/src/services/maintenance-ai-agent.js` | **CREATE** | ~150 lines |
| 15 | `backend/src/routes/assets.js` | **CREATE** | ~300 lines |
| 16 | `backend/src/routes/work-orders.js` | **CREATE** | ~250 lines |
| 17 | `backend/src/routes/inventory.js` | **CREATE** | ~200 lines |
| 18 | `backend/src/server.js` | MODIFY | +2 lines |
| 19 | `Frontend/src/app/admin/assets/*` | **CREATE** | 4 dashboard pages |

**Total estimated new code:** ~3,500 lines
**Total estimated tests:** 150 tests

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C16 — Asset Lifecycle, Field Operations & Workforce Management. READ ONLY. GOVERNANCE PLANNING ONLY.*
