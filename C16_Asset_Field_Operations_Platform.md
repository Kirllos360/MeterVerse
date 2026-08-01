<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] Not Started | Certification: [ ] Not Certified | Wave: W5 | Commit: 0b9ae4b0
====================================================================
-->

# C16 â€” Enterprise Asset Lifecycle, Field Operations & Workforce Management Platform
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY â€” GOVERNANCE PLANNING ONLY â€” NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C10 Connectivity, C12 Identity, C13 Financial, C14 Customer, C15 Integration  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Asset & Field Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **Meter** model | `schema.prisma:879` | âœ… Complete | serial, type, status, area, location, lifecycle |
| **MeterType** model | `schema.prisma:865` | âœ… Complete | name, category (electric/water/gas) |
| **MeterAssignment** model | `schema.prisma:1273` | âœ… Complete | meterâ†”customer linking with period |
| **MeterAssignmentHistory** | `schema.prisma:1294` | âœ… Complete | Full assignment change audit |
| **MeterEvent** model | `schema.prisma:1307` | âœ… Complete | type, description, timestamp, severity |
| **ServiceConnection** model | `schema.prisma:907` | âœ… Complete | meterâ†”customerâ†”contract linking |
| **Workflow engine** | `services/workflow-engine.js` | âœ… Basic | Meter states: stockâ†’assignedâ†’installedâ†’readingâ†’maintenanceâ†’retired |
| **SIMCard** model | `schema.prisma:1316` | âœ… Complete | ICCID, operator, lifecycle (availableâ†’in-useâ†’cool-downâ†’available) |
| **SIMAssignment** model | `schema.prisma:1357` | âœ… Complete | SIMâ†”meter linking |
| **Customer** model | `schema.prisma:841` | âœ… Complete | name, type, status, area |
| **Area/Project/Zone/Unit** | `schema.prisma` | âœ… Complete | Full location hierarchy |
| **Supplier** model | None | âŒ Missing | Needs creation |
| **Warehouse** model | None | âŒ Missing | Needs creation |
| **WorkOrder** model | None | âŒ Missing | Needs creation |
| **MaintenanceSchedule** | None | âŒ Missing | Needs creation |
| **Calibration** model | None | âŒ Missing | Needs creation |
| **Warranty** model | None | âŒ Missing | Needs creation |
| **FieldTechnician** | None | âŒ Missing | Needs creation |
| **Inventory** tracking | None | âŒ Missing | Needs creation |
| **Asset health scoring** | None | âŒ Missing | Needs creation |

### 1.2 Existing Meter State Machine (workflow-engine.js)

```
stock â†’ assigned â†’ installed â†’ reading â†’ disconnected â†’ maintenance â†’ retired
```

This is the foundation for the asset lifecycle in C16.

### 1.3 Gap Analysis

| Capability | Current | C16 Target |
|------------|---------|------------|
| **Asset hierarchy** | Meter only | Full hierarchy: Categoryâ†’Typeâ†’Meterâ†’Component |
| **Asset procurement** | âŒ None | Purchase orders, receiving, supplier quality |
| **Warehouse inventory** | âŒ None | Multi-warehouse, stock movements, bin locations |
| **Batch/serial tracking** | Serial on Meter | Full batch lots, serial genealogy |
| **Installation workflow** | Basic status change | Complete install with checklist, photos, docs |
| **Preventive maintenance** | âŒ None | Scheduled maintenance plans |
| **Predictive maintenance** | âŒ None | AI-driven failure prediction |
| **Work order management** | âŒ None | Full WO lifecycle with assignments |
| **Field technician mgmt** | âŒ None | Skills, certifications, scheduling |
| **Calibration management** | âŒ None | Calibration schedules, results tracking |
| **Warranty management** | âŒ None | Warranty periods, claims tracking |
| **Asset health scoring** | âŒ None | 0-100 composite health score |
| **Supplier performance** | âŒ None | Quality metrics, delivery performance |
| **Inventory forecasting** | âŒ None | Demand-based reorder prediction |

---

## PART 2: ASSET LIFECYCLE ARCHITECTURE

### 2.1 High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            ENTERPRISE ASSET LIFECYCLE, FIELD OPERATIONS & WORKFORCE MANAGEMENT PLATFORM                  â”‚
â”‚                                                                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚  ASSET INTELLIGENCE LAYER                                                                        â”‚       â”‚
â”‚  â”‚                                                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚       â”‚
â”‚  â”‚  â”‚ Asset Hierarchy  â”‚ â”‚ Asset Health    â”‚ â”‚ Failure Mode    â”‚ â”‚ Warranty &       â”‚              â”‚       â”‚
â”‚  â”‚  â”‚ & Taxonomy       â”‚ â”‚ Scoring (0-100) â”‚ â”‚ Library         â”‚ â”‚ Claim Tracking   â”‚              â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚                                                                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚  ASSET LIFECYCLE LAYER                                                                          â”‚       â”‚
â”‚  â”‚                                                                                                  â”‚       â”‚
â”‚  â”‚  PROCUREMENT â†’ WAREHOUSE â†’ INSTALL â†’ OPERATE â†’ MAINTAIN â†’ REPAIR â†’ RETIRE â†’ DISPOSE            â”‚       â”‚
â”‚  â”‚                                                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”‚       â”‚
â”‚  â”‚  â”‚ Purchase  â”‚ â”‚ Goods     â”‚ â”‚ Install   â”‚ â”‚ Operate   â”‚ â”‚ Preventiveâ”‚ â”‚ Correctiveâ”‚ â”‚Retireâ”‚ â”‚       â”‚
â”‚  â”‚  â”‚ Order     â”‚ â”‚ Receipt   â”‚ â”‚ Work Orderâ”‚ â”‚ (monitor) â”‚ â”‚ Maint     â”‚ â”‚ Maint     â”‚ â”‚      â”‚ â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚                                                                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚  FIELD OPERATIONS LAYER                                                                         â”‚       â”‚
â”‚  â”‚                                                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚       â”‚
â”‚  â”‚  â”‚ Work Order      â”‚ â”‚ Technician      â”‚ â”‚ Route Planning  â”‚ â”‚ Inspection       â”‚              â”‚       â”‚
â”‚  â”‚  â”‚ Lifecycle       â”‚ â”‚ Scheduling      â”‚ â”‚ (web-based)     â”‚ â”‚ Checklists       â”‚              â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚       â”‚
â”‚  â”‚                                                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                    â”‚       â”‚
â”‚  â”‚  â”‚ Calibration     â”‚ â”‚ Safety & Permit â”‚ â”‚ Contractor      â”‚                                    â”‚       â”‚
â”‚  â”‚  â”‚ Management      â”‚ â”‚ to Work         â”‚ â”‚ Management      â”‚                                    â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                    â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚                                                                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚  WORKFORCE MANAGEMENT LAYER                                                                      â”‚       â”‚
â”‚  â”‚                                                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚       â”‚
â”‚  â”‚  â”‚ Technician      â”‚ â”‚ Skill & Cert    â”‚ â”‚ Time &          â”‚ â”‚ Contractor SLA   â”‚              â”‚       â”‚
â”‚  â”‚  â”‚ Profile         â”‚ â”‚ Management      â”‚ â”‚ Attendance      â”‚ â”‚ Management       â”‚              â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚                                                                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚  AI MAINTENANCE INTELLIGENCE AGENT                                                               â”‚       â”‚
â”‚  â”‚                                                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚       â”‚
â”‚  â”‚  â”‚ Failure         â”‚ â”‚ Maintenance     â”‚ â”‚ Spare Parts     â”‚ â”‚ Technician       â”‚              â”‚       â”‚
â”‚  â”‚  â”‚ Prediction      â”‚ â”‚ Optimization    â”‚ â”‚ Forecasting     â”‚ â”‚ Recommendation   â”‚              â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚                                                                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚  DASHBOARDS                                                                                     â”‚       â”‚
â”‚  â”‚                                                                                                  â”‚       â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚       â”‚
â”‚  â”‚  â”‚ Executive Asset     â”‚ â”‚ Operations         â”‚ â”‚ Warehouse           â”‚ â”‚ Maintenance      â”‚  â”‚       â”‚
â”‚  â”‚  â”‚ Dashboard           â”‚ â”‚ Dashboard           â”‚ â”‚ Dashboard           â”‚ â”‚ Dashboard        â”‚  â”‚       â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Asset Hierarchy

```
Level 0: UTILITY
  â”œâ”€â”€ Electric
  â”œâ”€â”€ Water
  â”œâ”€â”€ Gas
  â””â”€â”€ Solar

Level 1: AREA (October, New Cairo, SODIC)

Level 2: PROJECT (within area)

Level 3: SITE / ZONE (physical location within project)

Level 4: ASSET CATEGORY
  â”œâ”€â”€ Meter
  â”‚   â”œâ”€â”€ Electric Meter (single-phase, three-phase, smart)
  â”‚   â”œâ”€â”€ Water Meter (domestic, bulk, fire)
  â”‚   â””â”€â”€ Gas Meter (domestic, industrial)
  â”œâ”€â”€ Gateway / Concentrator
  â”œâ”€â”€ SIM Card
  â”œâ”€â”€ Communication Module
  â””â”€â”€ Spare Part

Level 5: INDIVIDUAL ASSET (serial-numbered)
  â””â”€â”€ Meter: MTR-4512 (with sub-components: comm module, battery, sensor)

Level 6: COMPONENT (replaceable parts within an asset)
```

### 2.3 Meter Lifecycle States (Enhanced from existing)

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚  ORDERED â”‚  Purchase order placed with supplier
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
                         â”‚
                    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
                    â”‚  RECEIVED  â”‚  Goods received at warehouse
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
                    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”
                    â”‚ STOCK   â”‚  In warehouse, available for assignment
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”˜
                         â”‚
                    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
                    â”‚ ASSIGNED  â”‚  Linked to customer/contract
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
                    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚ INSTALLED   â”‚  Physically installed at site
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
                    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
                    â”‚  ACTIVE   â”‚  Producing readings â”€â”€â”€ normal operation
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
               â”‚         â”‚          â”‚
          â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â” â”Œâ”€â”€â–¼â”€â”€â”€â” â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
          â”‚MAINTE-  â”‚ â”‚DISCONâ”‚ â”‚ SUSPENDED â”‚
          â”‚ NANCE   â”‚ â”‚NECTEDâ”‚ â”‚           â”‚
          â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”¬â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
               â”‚         â”‚          â”‚
               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
                    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
                    â”‚ RETIRED    â”‚  End of operational life
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
                    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚DECOMMISSION â”‚  Removed from site
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
               â”‚         â”‚          â”‚
          â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â” â”Œâ”€â”€â–¼â”€â”€â”€â” â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
          â”‚SCRAPPED â”‚ â”‚SOLD  â”‚ â”‚RETURNED  â”‚
          â”‚         â”‚ â”‚      â”‚ â”‚TO SUPPL  â”‚
          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 Asset (NEW â€” base asset entity)

**Purpose:** Base asset record for all physical assets (meters, gateways, SIMs, components).

```
Asset
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ assetType: String                    â† METER | GATEWAY | SIM | COMM_MODULE | SPARE_PART
â”œâ”€â”€ categoryId: String (FK â†’ AssetCategory)
â”œâ”€â”€ serialNumber: String (UNIQUE)
â”œâ”€â”€ batchNumber: String?
â”œâ”€â”€ manufacturer: String?
â”œâ”€â”€ model: String?
â”œâ”€â”€ firmwareVersion: String?
â”œâ”€â”€ yearOfManufacture: Int?
â”œâ”€â”€ supplierId: String? (FK â†’ Supplier)
â”œâ”€â”€ purchaseOrder: String?
â”œâ”€â”€ purchaseDate: DateTime?
â”œâ”€â”€ receivedDate: DateTime?
â”œâ”€â”€ warrantyExpiry: DateTime?
â”œâ”€â”€ lifecycleStatus: String              â† ORDERED|RECEIVED|STOCK|ASSIGNED|INSTALLED|ACTIVE|
â”‚                                           MAINTENANCE|DISCONNECTED|SUSPENDED|RETIRED|DECOMMISSIONED|SCRAPPED
â”œâ”€â”€ operationalStatus: String            â† NORMAL | WARNING | CRITICAL | OFFLINE
â”œâ”€â”€ locationType: String?                â† WAREHOUSE | SITE | TRANSIT | SUPPLIER
â”œâ”€â”€ warehouseId: String? (FK â†’ Warehouse)
â”œâ”€â”€ warehouseBin: String?
â”œâ”€â”€ siteId: String?                      â† FK â†’ Zone/Unit (where installed)
â”œâ”€â”€ areaId: String? (FK â†’ Area)
â”œâ”€â”€ projectId: String? (FK â†’ Project)
â”œâ”€â”€ currentCustomerId: String? (FK â†’ Customer)
â”œâ”€â”€ commissionDate: DateTime?
â”œâ”€â”€ lastMaintenanceDate: DateTime?
â”œâ”€â”€ nextMaintenanceDate: DateTime?
â”œâ”€â”€ healthScore: Float?                  â† 0-100 computed
â”œâ”€â”€ metadata: String (JSON)?
â”œâ”€â”€ createdAt, archivedAt, updatedAt

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
â”œâ”€â”€ id, name (UNIQUE), parentId (self), assetType, description
â”œâ”€â”€ expectedLifespanMonths: Int?
â”œâ”€â”€ calibrationIntervalDays: Int?
â”œâ”€â”€ maintenanceIntervalDays: Int?
â”œâ”€â”€ active, createdAt, archivedAt

Hierarchy: Meter â†’ Electric Meter â†’ Single-phase Smart Meter
```

### 3.3 Supplier (NEW)

```
Supplier
â”œâ”€â”€ id, name (UNIQUE), code, contactPerson, email, phone
â”œâ”€â”€ address, taxId, paymentTerms
â”œâ”€â”€ status: ACTIVE | INACTIVE | BLACKLISTED
â”œâ”€â”€ qualityRating: Float?               â† 0-100
â”œâ”€â”€ onTimeDeliveryRate: Float?          â† 0-100
â”œâ”€â”€ averageLeadTimeDays: Int?
â”œâ”€â”€ active, createdAt, archivedAt, updatedAt

Relations:
  assets â†’ Asset[]
  purchaseOrders â†’ PurchaseOrder[]
```

### 3.4 Warehouse (NEW)

```
Warehouse
â”œâ”€â”€ id, name (UNIQUE), code, type: CENTRAL | REGIONAL | SITE
â”œâ”€â”€ address, manager, contactPhone
â”œâ”€â”€ areaId: String? (FK â†’ Area)
â”œâ”€â”€ capacity: Int?
â”œâ”€â”€ active, createdAt, archivedAt

Relations:
  bins â†’ WarehouseBin[]
  stock â†’ InventoryStock[]
```

### 3.5 WarehouseBin (NEW)

```
WarehouseBin
â”œâ”€â”€ id, warehouseId (FK), code, zone, maxCapacity
â”œâ”€â”€ currentCount: Int, active, createdAt
```

### 3.6 InventoryStock (NEW)

```
InventoryStock
â”œâ”€â”€ id, warehouseId (FK), assetCategoryId (FK)
â”œâ”€â”€ quantity: Int, reservedQuantity: Int @default(0)
â”œâ”€â”€ availableQuantity: Int (computed)
â”œâ”€â”€ reorderPoint: Int?, reorderQuantity: Int?
â”œâ”€â”€ unitCost: Float?, currency: String @default("EGP")
â”œâ”€â”€ lastCountedAt: DateTime?, active, createdAt, updatedAt

Indexes:
  @@unique([warehouseId, assetCategoryId])
```

### 3.7 InventoryMovement (NEW)

```
InventoryMovement
â”œâ”€â”€ id, fromWarehouseId?, toWarehouseId?, assetCategoryId
â”œâ”€â”€ referenceType: String               â† PURCHASE_RECEIPT | INSTALL | RETURN | TRANSFER | ADJUSTMENT
â”œâ”€â”€ referenceId: String?
â”œâ”€â”€ quantity: Int (positive=in, negative=out)
â”œâ”€â”€ unitCost: Float?, totalCost: Float?
â”œâ”€â”€ reason: String?, performedBy: String?
â”œâ”€â”€ createdAt
```

### 3.8 PurchaseOrder (NEW)

```
PurchaseOrder
â”œâ”€â”€ id, poNumber (UNIQUE), supplierId (FK)
â”œâ”€â”€ status: DRAFT | SUBMITTED | ACKNOWLEDGED | SHIPPED | PARTIAL | RECEIVED | CANCELLED
â”œâ”€â”€ orderDate, expectedDate, receivedDate
â”œâ”€â”€ items: String (JSON) â€” [{ assetCategoryId, quantity, unitPrice, received }]
â”œâ”€â”€ totalAmount, currency
â”œâ”€â”€ notes, createdBy, approvedBy, createdAt, archivedAt, updatedAt
```

### 3.9 WorkOrder (NEW)

**Purpose:** Central work order for all field operations.

```
WorkOrder
â”œâ”€â”€ id, woNumber (UNIQUE)
â”œâ”€â”€ type: String                        â† INSTALL | REPLACE | REMOVE | MAINTENANCE_PREVENTIVE |
â”‚                                           MAINTENANCE_CORRECTIVE | CALIBRATION | INSPECTION | REPAIR
â”œâ”€â”€ priority: String                    â† LOW | MEDIUM | HIGH | CRITICAL
â”œâ”€â”€ status: String                      â† OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | VERIFIED | CANCELLED
â”œâ”€â”€ assetId: String? (FK â†’ Asset)
â”œâ”€â”€ assetSerial: String?
â”œâ”€â”€ customerId: String? (FK â†’ Customer)
â”œâ”€â”€ siteId: String?                     â† FK â†’ Zone/Unit
â”œâ”€â”€ areaId: String? (FK â†’ Area)
â”œâ”€â”€ description: String
â”œâ”€â”€ scheduledDate: DateTime?
â”œâ”€â”€ startedAt: DateTime?
â”œâ”€â”€ completedAt: DateTime?
â”œâ”€â”€ durationMinutes: Int?
â”œâ”€â”€ technicianId: String? (FK â†’ FieldTechnician)
â”œâ”€â”€ teamId: String? (FK â†’ TechnicianTeam)
â”œâ”€â”€ checklistId: String? (FK â†’ InspectionChecklist)
â”œâ”€â”€ checklistResults: String (JSON)?
â”œâ”€â”€ partsUsed: String (JSON)?           â† [{ partId, quantity, cost }]
â”œâ”€â”€ resolution: String?
â”œâ”€â”€ customerSignature: Boolean @default(false)
â”œâ”€â”€ beforePhotoUrl: String?
â”œâ”€â”€ afterPhotoUrl: String?
â”œâ”€â”€ linkedIncidentId: String?           â† FK â†’ Incident (C12)
â”œâ”€â”€ linkedRcaCaseId: String?            â† FK â†’ RCACase (C12-W07)
â”œâ”€â”€ permitRequired: Boolean @default(false)
â”œâ”€â”€ permitId: String? (FK â†’ SafetyPermit)
â”œâ”€â”€ createdAt, archivedAt, updatedAt

Indexes:
  @@index([type, status])
  @@index([technicianId, status])
  @@index([assetId])
  @@index([areaId, scheduledDate])
```

### 3.10 FieldTechnician (NEW)

```
FieldTechnician
â”œâ”€â”€ id, userId (FK â†’ User, nullable)
â”œâ”€â”€ employeeCode: String (UNIQUE)
â”œâ”€â”€ name, email, phone
â”œâ”€â”€ status: ACTIVE | INACTIVE | ON_LEAVE | TERMINATED
â”œâ”€â”€ type: EMPLOYEE | CONTRACTOR
â”œâ”€â”€ contractorCompany: String?
â”œâ”€â”€ skills: String (JSON)               â† ["electric_meter_install", "water_meter_repair", ...]
â”œâ”€â”€ certifications: String (JSON)       â† [{ name, issuedBy, expiryDate }]
â”œâ”€â”€ maxWorkOrdersPerDay: Int @default(6)
â”œâ”€â”€ currentWorkload: Int @default(0)
â”œâ”€â”€ areaId: String? (FK â†’ Area)
â”œâ”€â”€ latitude: Float?, longitude: Float?
â”œâ”€â”€ active, createdAt, archivedAt, updatedAt

Indexes:
  @@index([status, areaId])
  @@index([status, currentWorkload])
```

### 3.11 TechnicianTeam (NEW)

```
TechnicianTeam
â”œâ”€â”€ id, name, leadId (FK â†’ FieldTechnician)
â”œâ”€â”€ areaId, status, active
â”œâ”€â”€ members String (JSON)
```

### 3.12 MaintenancePlan (NEW)

```
MaintenancePlan
â”œâ”€â”€ id, assetCategoryId (FK)
â”œâ”€â”€ name, description
â”œâ”€â”€ type: PREVENTIVE | PREDICTIVE | CONDITION_BASED
â”œâ”€â”€ frequencyType: DAYS | WEEKS | MONTHS | METER_READING
â”œâ”€â”€ frequencyValue: Int
â”œâ”€â”€ estimatedDuration: Int (minutes)
â”œâ”€â”€ requiresShutdown: Boolean @default(false)
â”œâ”€â”€ checklistId: String? (FK â†’ InspectionChecklist)
â”œâ”€â”€ active, createdAt, archivedAt
```

### 3.13 MaintenanceSchedule (NEW â€” generated from plans)

```
MaintenanceSchedule
â”œâ”€â”€ id, maintenancePlanId (FK)
â”œâ”€â”€ assetId: String? (FK â†’ Asset)
â”œâ”€â”€ scheduledDate: DateTime
â”œâ”€â”€ status: PENDING | IN_PROGRESS | COMPLETED | SKIPPED
â”œâ”€â”€ workOrderId: String? (FK â†’ WorkOrder)
â”œâ”€â”€ completedAt: DateTime?, completedBy: String?
â”œâ”€â”€ notes: String?, createdAt
```

### 3.14 CalibrationRecord (NEW)

```
CalibrationRecord
â”œâ”€â”€ id, assetId (FK), assetSerial, performedBy
â”œâ”€â”€ calibrationDate, nextCalibrationDate
â”œâ”€â”€ standardUsed, results: String (JSON)
â”œâ”€â”€ status: PASS | FAIL | CONDITIONAL
â”œâ”€â”€ adjustmentMade: Boolean @default(false)
â”œâ”€â”€ certificateNumber: String?
â”œâ”€â”€ certificateFileUrl: String?
â”œâ”€â”€ notes, createdAt
```

### 3.15 WarrantyClaim (NEW)

```
WarrantyClaim
â”œâ”€â”€ id, assetId (FK), assetSerial, supplierId (FK)
â”œâ”€â”€ claimNumber (UNIQUE), claimDate
â”œâ”€â”€ defectType, description
â”œâ”€â”€ status: SUBMITTED | APPROVED | REPLACED | REJECTED | CREDITED
â”œâ”€â”€ resolution: String?
â”œâ”€â”€ replacementAssetId: String? (FK â†’ Asset)
â”œâ”€â”€ costCovered: Float?, costRejected: Float?
â”œâ”€â”€ approvedBy, approvedAt, createdAt, archivedAt
```

### 3.16 SafetyPermit (NEW)

```
SafetyPermit
â”œâ”€â”€ id, permitNumber (UNIQUE), workOrderId (FK)
â”œâ”€â”€ type: ELECTRICAL_WORK | HEIGHT_WORK | CONFINED_SPACE | HOT_WORK
â”œâ”€â”€ description, riskAssessment: String (JSON)
â”œâ”€â”€ requiredPPE: String (JSON)
â”œâ”€â”€ issuedBy, issuedAt, validFrom, validTo
â”œâ”€â”€ status: ACTIVE | EXPIRED | CANCELLED
â”œâ”€â”€ signedByTechnician: Boolean @default(false)
â”œâ”€â”€ signedBySupervisor: Boolean @default(false)
â”œâ”€â”€ createdAt, archivedAt
```

### 3.17 InspectionChecklist (NEW)

```
InspectionChecklist
â”œâ”€â”€ id, name, assetCategoryId (FK)
â”œâ”€â”€ items: String (JSON)               â† [{ order, question, type: BOOL | TEXT | PHOTO | VALUE }]
â”œâ”€â”€ active, createdAt, archivedAt
```

### 3.18 AssetHealthScore (NEW â€” periodic snapshots)

```
AssetHealthScore
â”œâ”€â”€ id, assetId (FK), score: Float (0-100)
â”œâ”€â”€ components: String (JSON)          â† [{ dimension: "age", score: 80, weight: 0.3 }]
â”œâ”€â”€ computedAt: DateTime
â”œâ”€â”€ computedBy: String (SYSTEM | MANUAL)
â”œâ”€â”€ createdAt

Index:
  @@index([assetId, computedAt])
```

### 3.19 FailureMode (NEW)

```
FailureMode
â”œâ”€â”€ id, assetCategoryId (FK)
â”œâ”€â”€ code, name, description
â”œâ”€â”€ severity: LOW | MEDIUM | HIGH | CRITICAL
â”œâ”€â”€ probability: LOW | MEDIUM | HIGH
â”œâ”€â”€ detectability: EASY | MODERATE | DIFFICULT
â”œâ”€â”€ rpn: Int (computed = severity Ã— probability Ã— detectability)
â”œâ”€â”€ typicalCauses: String (JSON)
â”œâ”€â”€ typicalRemedies: String (JSON)
â”œâ”€â”€ active, createdAt, archivedAt
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  OPEN    â”‚â”€â”€â”€â”€â†’â”‚ ASSIGNED â”‚â”€â”€â”€â”€â†’â”‚ IN_PROGRESS â”‚â”€â”€â”€â”€â†’â”‚ COMPLETEDâ”‚â”€â”€â”€â”€â†’â”‚ VERIFIED â”‚â”€â”€â”€â”€â†’â”‚ CANCELLEDâ”‚
â”‚ (auto or â”‚     â”‚ (tech)   â”‚     â”‚ (started)   â”‚     â”‚ (done)   â”‚     â”‚ (check)  â”‚     â”‚ (anytime)â”‚
â”‚  manual) â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                               â”‚               â”‚
                                                            â”‚               â”‚
                                                            â–¼               â–¼
                                                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                                     â”‚ COMPLETED â”‚   â”‚ REOPENED â”‚
                                                     â”‚ (if no    â”‚   â”‚ (if issue â”‚
                                                     â”‚  issues)  â”‚   â”‚  remains) â”‚
                                                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.2 Work Order Creation Flows

```
AUTO-CREATE (Preventive Maintenance):
  MaintenanceSchedule.run():
    â†’ FOR each MaintenancePlan:
        â†’ FOR each asset matching plan criteria:
            â†’ IF asset.nextMaintenanceDate <= today + 7 days:
                â†’ CREATE WorkOrder {
                    type: "MAINTENANCE_PREVENTIVE",
                    assetId, priority: "MEDIUM",
                    description: `Scheduled: ${plan.name}`,
                    scheduledDate: plan.date,
                  }

AUTO-CREATE (Predictive â€” via AI Agent):
  AI Agent detects anomaly (health score drop, failure probability > threshold):
    â†’ CREATE WorkOrder {
        type: "MAINTENANCE_CORRECTIVE",
        assetId, priority: "HIGH",
        description: `AI-predicted failure: ${failureMode.name} â€” probability ${pct}%`,
      }

MANUAL CREATE (Any trigger â€” customer call, meter event, inspection):
  User or system triggers:
    â†’ CREATE WorkOrder { type, assetId, customerId, description }
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
     score = baseMatch Ã— workloadFactor Ã— proximityFactor Ã— skillMatch
     baseMatch = 1.0
     workloadFactor = 1 - (currentWorkload / maxWorkOrdersPerDay) Ã— 0.5
     proximityFactor = if technician has location â†’ proximityScore
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
**Autonomy:** âš¡ Semi-autonomous  

| Capability | Autonomy | Approval |
|------------|----------|----------|
| Failure prediction | âœ… Full | None (alert only) |
| Maintenance optimization | âš¡ Semi | Required for schedule changes |
| Spare parts forecasting | âœ… Full | None (read-only) |
| Technician recommendation | âš¡ Semi | Recommended assignment |

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
    
    forecastQty = monthlyAvg Ã— seasonalityFactor Ã— growthFactor Ã— safetyStock
    
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
| **Age** | 25% | `MAX(0, 100 Ã— (1 - ageMonths / expectedLifespanMonths))` |
| **Maintenance** | 20% | `MAX(0, 100 Ã— (1 - daysSinceLastMaint / maintIntervalDays))` |
| **Event Count** | 20% | `MAX(0, 100 - eventsLast90Days Ã— 10)` |
| **Reading Quality** | 15% | `% of valid readings in last 30 days` |
| **Calibration** | 10% | `daysUntilNextCal / calibrationInterval Ã— 100` |
| **Operational Stability** | 10% | `1 - (downtimeHours / totalHours) Ã— 100` |

### 6.2 Health Score Calculation

```
computeAssetHealth(assetId):
  asset = Asset.findUnique(assetId)
  category = AssetCategory.findUnique(asset.categoryId)
  events = MeterEvent.findMany({ meterId: assetId, createdAt: { gte: 90 days } })
  readings = Reading.findMany({ meterId: assetId, createdAt: { gte: 30 days } })
  
  ageScore = MAX(0, 100 Ã— (1 - assetAgeMonths / category.expectedLifespanMonths))
  maintScore = asset.lastMaintenanceDate
    ? MAX(0, 100 Ã— (1 - daysSinceLastMaint / category.maintenanceIntervalDays))
    : 50  // no maintenance record â€” assume average
  eventScore = MAX(0, 100 - events.length Ã— 10)
  readingScore = (validReadings / totalReadings) Ã— 100
  calScore = asset.lastCalibrationDate
    ? (daysUntilNextCal / category.calibrationIntervalDays) Ã— 100
    : 30  // no calibration â€” assume poor
  stabilityScore = 100 - (downtimeHours / (90 Ã— 24)) Ã— 100
  
  healthScore =
    ageScore Ã— 0.25 +
    maintScore Ã— 0.20 +
    eventScore Ã— 0.20 +
    readingScore Ã— 0.15 +
    calScore Ã— 0.10 +
    stabilityScore Ã— 0.10
  
  AssetHealthScore.create({ assetId, score: healthScore, components })
  Asset.update(assetId, { healthScore })
  
  RETURN { score, ageScore, maintScore, eventScore, readingScore, calScore, stabilityScore }
```

---

## PART 7: DASHBOARDS

### 7.1 Executive Asset Dashboard (`/admin/assets/executive`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ EXECUTIVE ASSET DASHBOARD                                                                      â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚ â”‚ Total Assets â”‚ â”‚ Active       â”‚ â”‚ In           â”‚ â”‚ Health       â”‚ â”‚ Avg Age      â”‚        â”‚
â”‚ â”‚    245,000   â”‚ â”‚    212,000   â”‚ â”‚ Maintenance  â”‚ â”‚ Score        â”‚ â”‚     4.2 yrs  â”‚        â”‚
â”‚ â”‚              â”‚ â”‚              â”‚ â”‚       3,200  â”‚ â”‚     78/100   â”‚ â”‚              â”‚        â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ ASSETS BY CATEGORY                           â”‚ HEALTH SCORE DISTRIBUTION                 â”‚   â”‚
â”‚ â”‚                                               â”‚                                           â”‚   â”‚
â”‚ â”‚ Electric Meters   â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  142K  â”‚ â–ˆâ–ˆ 90-100 (Excellent)        42%         â”‚   â”‚
â”‚ â”‚ Water Meters      â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ           82K  â”‚ â–ˆâ–ˆ 70-89  (Good)             35%         â”‚   â”‚
â”‚ â”‚ Gas Meters        â–ˆâ–ˆâ–ˆâ–ˆ                   12K  â”‚ â–ˆâ–ˆ 50-69  (Fair)             15%         â”‚   â”‚
â”‚ â”‚ Gateways          â–ˆâ–ˆâ–ˆ                    9K   â”‚ â–ˆâ–ˆ < 50   (Poor)              8%         â”‚   â”‚
â”‚ â”‚ SIM Cards         â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ   â”‚                                           â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ OPEN WORK ORDERS (1,245)                              â”‚ PREDICTIVE ALERTS (12)          â”‚   â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚                                 â”‚   â”‚
â”‚ â”‚ â”‚ Priority â”‚ Type   â”‚ Age  â”‚ Tech   â”‚ Site         â”‚  â”‚ âš  MTR-4512 â€” Failure risk 87% â”‚   â”‚
â”‚ â”‚ â”‚ CRITICAL â”‚ REPAIR â”‚ 2d   â”‚ Ahmed  â”‚ October-A2   â”‚  â”‚ âš  MTR-8912 â€” Health score 32  â”‚   â”‚
â”‚ â”‚ â”‚ HIGH     â”‚ INSTALLâ”‚ 5d   â”‚ Sara   â”‚ New Cairo-B1 â”‚  â”‚ âš  GW-3341 â€” Comms offline 3d  â”‚   â”‚
â”‚ â”‚ â”‚ MEDIUM   â”‚ CALIB  â”‚ 8d   â”‚ Mariam â”‚ SODIC-C3     â”‚  â”‚ ðŸ”” Warranty expiring: 45 unitsâ”‚   â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚                                 â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.2 Operations Dashboard (`/admin/assets/operations`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ OPERATIONS DASHBOARD                                                                           â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€ WORK ORDERS TODAY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚ â”‚ â”‚ WO #     â”‚ Type       â”‚ Asset    â”‚ Site     â”‚ Tech     â”‚ Status   â”‚ ETA          â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ WO-2026- â”‚ REPAIR     â”‚ MTR-4512 â”‚ Oct A2   â”‚ Ahmed    â”‚ IN_PROG  â”‚ 30 min       â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ 0789     â”‚            â”‚          â”‚          â”‚          â”‚          â”‚              â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ WO-2026- â”‚ INSTALL    â”‚ MTR-8912 â”‚ NC B1    â”‚ Sara     â”‚ ASSIGNED â”‚ 2 hours      â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ 0790     â”‚            â”‚          â”‚          â”‚          â”‚          â”‚              â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ WO-2026- â”‚ MAINT-PREV â”‚ GW-3341  â”‚ SOD C3   â”‚ Mariam   â”‚ OPEN     â”‚ Not assigned â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ 0791     â”‚            â”‚          â”‚          â”‚          â”‚          â”‚              â”‚  â”‚    â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ TECHNICIAN WORKLOAD       â”‚ â”‚ UPCOMING MAINTENANCE (Next 7 Days)                         â”‚   â”‚
â”‚ â”‚                          â”‚ â”‚                                                             â”‚   â”‚
â”‚ â”‚ Ahmed â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 6/6 â”‚ â”‚ Mon: 12 WOs â”‚ Tue: 15 WOs â”‚ Wed: 10 WOs â”‚ Thu: 8 WOs     â”‚   â”‚
â”‚ â”‚ Sara  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 4/6   â”‚ â”‚                                                             â”‚   â”‚
â”‚ â”‚ Mariamâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 5/6   â”‚ â”‚ PM Schedule: 12 Planned | 8 Predictive | 5 Calibration    â”‚   â”‚
â”‚ â”‚ Omar  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 3/6         â”‚ â”‚ Technician availability: 6/8                               â”‚   â”‚
â”‚ â”‚ Khaledâ–ˆâ–ˆâ–ˆâ–ˆ 2/6           â”‚ â”‚                                                             â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.3 Warehouse Dashboard (`/admin/assets/warehouse`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ WAREHOUSE DASHBOARD                                                                           â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚ â”‚ Warehouses   â”‚ â”‚ Total Stock  â”‚ â”‚ Reserved     â”‚ â”‚ Low Stock    â”‚ â”‚ Pending      â”‚        â”‚
â”‚ â”‚         3    â”‚ â”‚     45,000   â”‚ â”‚      3,200   â”‚ â”‚ Items  12    â”‚ â”‚ Receipts  5  â”‚        â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚                                                                                               â”‚
â”‚ â”Œâ”€â”€â”€ INVENTORY LEVELS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚ â”‚ â”‚ Item         â”‚ Warehouseâ”‚ In Stock â”‚ Reserved â”‚ Availableâ”‚ Reorder  â”‚ Status     â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ Smart Meter  â”‚ Central  â”‚ 2,500    â”‚ 300      â”‚ 2,200    â”‚ 500      â”‚ âœ… OK      â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ Water Meter  â”‚ Central  â”‚ 1,800    â”‚ 200      â”‚ 1,600    â”‚ 400      â”‚ âœ… OK      â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ Comm Module  â”‚ Regional â”‚ 200      â”‚ 50       â”‚ 150      â”‚ 200      â”‚ âš  LOW      â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ SIM Card     â”‚ Central  â”‚ 5,000    â”‚ 500      â”‚ 4,500    â”‚ 1,000    â”‚ âœ… OK      â”‚  â”‚    â”‚
â”‚ â”‚ â”‚ Battery Pack â”‚ Regional â”‚ 50       â”‚ 10       â”‚ 40       â”‚ 100      â”‚ ðŸ”´ CRITICALâ”‚  â”‚    â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                               â”‚
â”‚ [ Create PO ] [ Receive Stock ] [ Transfer Between Warehouses ] [ Count Stock ]               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 8: INTEGRATION STRATEGY

### 8.1 Cross-Program Integration

| Source | Integration | C16 Consumer |
|--------|-------------|--------------|
| **C12 Identity** | Auth, RBAC, audit | Tech login, work order audit |
| **C12-W07 OI** | RCA cases, LearnedPattern | Failure mode â†” RCA linkage |
| **C12-W07 AI Rec** | AI recommendations | Maintenance Intelligence Agent |
| **C13 Inventory** | Asset costing, depreciation | Asset value tracking |
| **C14 Customer** | Customer ticketing | Service request â†’ Work Order |
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
| `invoice.generated` | C13 Billing | No direct â€” asset ops |
| `supplier.delivery.received` | C16 Receiving | Update InventoryStock |
| `work.order.completed` | C16 WorkOrder | Update asset health, schedule next PM |

---

## PART 9: TESTING STRATEGY â€” C16 (150 Tests)

### 9.1 Asset Lifecycle Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Create asset â†’ status ORDERED | Correct initial |
| 2 | Receive asset â†’ status RECEIVED | Transition |
| 3 | Move to stock â†’ status STOCK | Transition |
| 4 | Install asset â†’ status INSTALLED | Transition |
| 5 | Retire asset â†’ status RETIRED | End state |
| 6 | Scrap asset â†’ status SCRAPPED | Disposal |
| 7 | Invalid transition â†’ rejected | State guard |
| 8 | Asset serial duplicate â†’ rejected | Unique |

### 9.2 Work Order Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Create WO â†’ status OPEN | Initial |
| 2 | Assign technician â†’ status ASSIGNED | Transition |
| 3 | Start work â†’ status IN_PROGRESS | Transition |
| 4 | Complete work â†’ status COMPLETED | Transition |
| 5 | Verify work â†’ status VERIFIED | Final |
| 6 | Cancel work â†’ status CANCELLED | Anytime |
| 7 | Complete without parts â†’ no parts recorded | Optional |
| 8 | Complete with parts â†’ inventory deducted | Stock update |
| 9 | Check technician workload before assign | Capacity check |
| 10 | WO with photos â†’ attachments stored | Evidence |

### 9.3 Inventory Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Receive PO â†’ stock increases | Correct qty |
| 2 | Install asset â†’ stock decreases | Correct qty |
| 3 | Transfer between warehouses â†’ both updated | Movement |
| 4 | Stock below reorder â†’ alert | Threshold |
| 5 | Stock count adjustment â†’ corrected | Inventory |
| 6 | Reserved stock â†’ not available | Reservation |
| 7 | Negative stock â†’ prevented | Guard |
| 8 | Multiple warehouses â†’ independent | Isolation |
| 9 | Batch tracking â†’ full genealogy | Traceability |
| 10 | Movement audit â†’ all movements logged | Audit trail |

### 9.4 Field Technician Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create technician â†’ active | Correct status |
| 2 | Assign WO to qualified tech â†’ skill check | Skills matched |
| 3 | Assign WO to unqualified tech â†’ rejected | Missing skill |
| 4 | Max workload reached â†’ cannot assign | Capacity |
| 5 | Technician on leave â†’ not assignable | Status check |
| 6 | Certification expired â†’ flag | Cert check |
| 7 | Team assignment â†’ all members eligible | Team logic |

### 9.5 Maintenance Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Create maintenance plan â†’ active | Created |
| 2 | Generate schedule from plan â†’ correct dates | Scheduled |
| 3 | Preventive WO auto-created at due date | Auto-create |
| 4 | Complete maintenance â†’ next date computed | Rescheduled |
| 5 | Skip maintenance â†’ logged, not rescheduled | Skip |
| 6 | Predictive maintenance AI â†’ WO created | AI trigger |
| 7 | Calibration due â†’ notification | Alert |
| 8 | Calibration failed â†’ asset flagged | Status |

### 9.6 Asset Health Score Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | New asset â†’ health 100 | Perfect |
| 2 | Old asset â†’ health declining | Age factor |
| 3 | Frequent events â†’ lower health | Event factor |
| 4 | Recent maintenance â†’ health improved | Maint factor |
| 5 | No readings â†’ lower health | Reading factor |
| 6 | Health score range 0-100 | Range check |
| 7 | Health score recomputed on event | Refresh |
| 8 | Historical snapshots stored | Time series |

### 9.7 Supplier & Procurement Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create supplier â†’ active | Created |
| 2 | Create PO â†’ DRAFT | Initial |
| 3 | Submit PO â†’ SUBMITTED | Transition |
| 4 | Receive partial shipment â†’ PARTIAL | Partial |
| 5 | Receive full â†’ RECEIVED | Complete |
| 6 | Supplier quality rating â†’ computed | Avg score |
| 7 | Supplier on-time delivery â†’ tracked | Metric |
| 8 | Blacklist supplier â†’ cannot create PO | Guard |

### 9.8 Safety & Permit Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Create safety permit â†’ ACTIVE | Initial |
| 2 | Work requires permit â†’ permit created | Auto-create |
| 3 | Expired permit â†’ work blocked | Guard |
| 4 | Both signatures required â†’ completed | Dual sign |
| 5 | Permit cancelled â†’ work order flagged | Cascade |

### 9.9 AI Agent Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Failure prediction â†’ WO created | Correct trigger |
| 2 | Normal asset â†’ no prediction | No false positive |
| 3 | Maintenance optimization â†’ schedule adjusted | Correct |
| 4 | Spare parts forecast â†’ quantities reasonable | Forecast |
| 5 | Technician recommendation â†’ best match | Scoring |
| 6 | All AI actions audited | Audit trail |
| 7 | Health score trend logged | Time series |

---

## PART 10: C16 DEFINITION OF DONE

```
C16 â€” ASSET LIFECYCLE, FIELD OPERATIONS & WORKFORCE MANAGEMENT
CERTIFICATION CHECKLIST

â–¡ CORE DATA MODELS â€” 19 NEW
   â–¡ Asset (base asset entity with full lifecycle)
   â–¡ AssetCategory (taxonomy hierarchy)
   â–¡ Supplier (vendor management)
   â–¡ Warehouse (locations)
   â–¡ WarehouseBin (bin tracking)
   â–¡ InventoryStock (stock levels)
   â–¡ InventoryMovement (stock audit trail)
   â–¡ PurchaseOrder (procurement)
   â–¡ WorkOrder (central field ops document)
   â–¡ FieldTechnician (profiles, skills, certs)
   â–¡ TechnicianTeam (team grouping)
   â–¡ MaintenancePlan (PM/PRED schedule defs)
   â–¡ MaintenanceSchedule (generated events)
   â–¡ CalibrationRecord (calibration tracking)
   â–¡ WarrantyClaim (claims management)
   â–¡ SafetyPermit (permit-to-work)
   â–¡ InspectionChecklist (digital checklists)
   â–¡ AssetHealthScore (periodic health 0-100)
   â–¡ FailureMode (failure library)

â–¡ ASSET LIFECYCLE â€” 12 STATES
   â–¡ ORDERED â†’ RECEIVED â†’ STOCK â†’ ASSIGNED â†’ INSTALLED â†’
     ACTIVE â†’ MAINTENANCE â†’ DISCONNECTED â†’ RETIRED â†’
     DECOMMISSIONED â†’ SCRAPPED/SOLD/RETURNED
   â–¡ State guards on all transitions
   â–¡ Full serial genealogy

â–¡ WORK ORDER MANAGEMENT
   â–¡ Full lifecycle (OPENâ†’ASSIGNEDâ†’IN_PROGRESSâ†’COMPLETEDâ†’VERIFIED)
   â–¡ 8 work order types
   â–¡ Technician skill-based assignment
   â–¡ Parts consumption tracking
   â–¡ Photo evidence capture
   â–¡ Integration with RCA (C12-W07)

â–¡ INVENTORY & WAREHOUSE
   â–¡ Multi-warehouse with bin locations
   â–¡ Stock in/out/reserved/available tracking
   â–¡ Reorder point alerts
   â–¡ Purchase order lifecycle
   â–¡ Stock movement audit trail
   â–¡ Cycle counting

â–¡ MAINTENANCE MANAGEMENT
   â–¡ Preventive maintenance plans
   â–¡ Predictive maintenance (AI-driven)
   â–¡ Auto-generated work orders
   â–¡ Maintenance schedule calendar
   â–¡ Calibration tracking
   â–¡ Warranty claim management

â–¡ FIELD WORKFORCE
   â–¡ Technician profiles with skills + certs
   â–¡ Skill-based WO assignment
   â–¡ Workload balancing
   â–¡ Team management
   â–¡ Contractor management

â–¡ ASSET HEALTH SCORING
   â–¡ 6-dimension health score (0-100)
   â–¡ Age, maintenance, events, readings, calibration, stability
   â–¡ Periodic snapshots
   â–¡ Trend tracking

â–¡ SAFETY & COMPLIANCE
   â–¡ Permit-to-work system
   â–¡ Digital inspection checklists
   â–¡ Safety risk assessment
   â–¡ Dual-signature permits

â–¡ AI MAINTENANCE INTELLIGENCE AGENT
   â–¡ Failure prediction (risk scoring)
   â–¡ Maintenance optimization
   â–¡ Spare parts forecasting
   â–¡ Technician recommendation
   â–¡ C12 AIRecommendation integration

â–¡ DASHBOARDS
   â–¡ Executive Asset Dashboard
   â–¡ Operations Dashboard
   â–¡ Warehouse Dashboard
   â–¡ Maintenance Dashboard

â–¡ INTEGRATIONS
   â–¡ C12 Identity (auth, audit)
   â–¡ C12-W07 RCA + AI (failure â†” RCA linkage)
   â–¡ C13 Financial (asset costing)
   â–¡ C14 Customer (service request â†’ WO)
   â–¡ C15 GIS (site mapping)
   â–¡ Existing Meter/MeterEvent/Reading (core data)

â–¡ SECURITY
   â–¡ RBAC: Asset Admin, Field Tech, Warehouse, Viewer
   â–¡ Work order + permit segregation
   â–¡ Inventory adjustment requires approval
   â–¡ All mutations audited

â–¡ TESTS â€” 150 PASSING
   â–¡ Asset lifecycle: 20 tests
   â–¡ Work order: 20 tests
   â–¡ Inventory: 20 tests
   â–¡ Field technician: 15 tests
   â–¡ Maintenance: 20 tests
   â–¡ Asset health: 15 tests
   â–¡ Supplier/procurement: 15 tests
   â–¡ Safety/permit: 10 tests
   â–¡ AI agent: 15 tests

C16 STATUS: â–¡ NOT IMPLEMENTED
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
*C16 â€” Asset Lifecycle, Field Operations & Workforce Management. READ ONLY. GOVERNANCE PLANNING ONLY.*

