# Reading Domain

**File:** `01_CORE_DOMAINS/reading/DOMAIN.md`
**Domain ID:** MV-DOM-002
**Priority:** P0 — Critical Path
**Status:** Draft — Enterprise Planning Phase

---

## Business Purpose
The Reading domain manages the acquisition, validation, storage, and retrieval of all meter reading data. Readings are the primary input for consumption calculation, billing, and analytics.

## Business Owner
Chief Operations Officer / Meter Data Management Director

## Capabilities

| Capability | Sub-capabilities | Status |
|-----------|------------------|--------|
| Reading Ingestion | Manual entry, Bulk import, AMI push, Gateway relay | ✅ Live |
| Reading Validation | Spike detection, Drop detection, Zero check, Threshold check | ✅ Live |
| Reading Approval | Auto-approve, Manual review, Reject | ✅ Live |
| Reading Retrieval | By meter, By period, By status, Interval data | ✅ Live |
| Reading Export | CSV, Excel, API | ✅ Live |
| Reading Correction | Replace, Adjust, Annotate | 🔲 Planned |
| Reading Reconciliation | Gap detection, Duplicate detection, Missing data alerts | 🔲 Planned |

## Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| RDG-001 | Reading value must be non-negative | Application validation |
| RDG-002 | Spike detection: value > 3x previous = flag | Application rule |
| RDG-003 | Drop detection: value < 0.1x previous = flag | Application rule |
| RDG-004 | Duplicate detection: same meter + timestamp = reject | Application rule |
| RDG-005 | Readings cannot be deleted after billing (immutable) | Soft delete guard |
| RDG-006 | Billable readings must be in "valid" status | Workflow rule |

## Lifecycle States
```
PENDING → VALIDATED → APPROVED → BILLED → ARCHIVED
                      → REJECTED
```

## Dependencies
| Domain | Type | Description |
|--------|------|-------------|
| Meter | Required | Reading belongs to a meter |
| Validation | Required | Rules determine reading quality |
| Billing | Dependent | Billing consumes approved readings |

## API Endpoints
| Method | Path | Status |
|--------|------|--------|
| GET | `/api/readings` | ✅ Live |
| GET | `/api/readings/:id` | ✅ Live |
| POST | `/api/readings` | ✅ Live |
| POST | `/api/readings/bulk` | ✅ Live |
| PUT | `/api/readings/:id` | ✅ Live |
| DELETE | `/api/readings/:id` | ✅ Live |
| POST | `/api/readings/:id/approve` | ✅ Live |
| POST | `/api/readings/:id/reject` | ✅ Live |
| GET | `/api/readings/review-queue` | ✅ Live |

**Priority:** P0 — Critical | **Wave:** 01 | **Sessions:** 8
