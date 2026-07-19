# MeterVerse Domain Model

**Date:** 2026-07-19  
**Version:** 8.0.0-RC1  

---

## Existing Models (6)

### User
| Field | Type | Status |
|-------|------|--------|
| id | UUID | ✅ |
| email | String (unique) | ✅ |
| password | String (hashed) | ✅ |
| name | String | ✅ |
| role | String (admin/operator/viewer) | ✅ |
| area, project, tenant, language, theme | String | ✅ |
| mfaEnabled | Boolean | ✅ |
| createdAt, updatedAt | DateTime | ✅ |

**Missing:** avatar, phone, status, lastLogin, permissions[], groups[]

### Customer
| Field | Type | Status |
|-------|------|--------|
| id | UUID | ✅ |
| name, email, phone, address | String | ✅ |
| status | String | ✅ |
| area | String | ✅ |
| createdAt, updatedAt | DateTime | ✅ |
| meters[] | Relation | ✅ |
| invoices[] | Relation | ✅ |

**Missing:** notes, tags[], groupId, contractId, avatar, documents[], history[]

### Meter
| Field | Type | Status |
|-------|------|--------|
| id | UUID | ✅ |
| serial | String (unique) | ✅ |
| type, location, status, area | String | ✅ |
| customerId | String? | ✅ |
| readings[] | Relation | ✅ |

**Missing:** zoneId, installDate, lastReading, model, firmware, simCardId, gatewayId

### Reading
| Field | Type | Status |
|-------|------|--------|
| id | UUID | ✅ |
| meterId | String | ✅ |
| value | Float | ✅ |
| unit | String | ✅ |
| timestamp | DateTime | ✅ |
| source, status | String | ✅ |

**Missing:** validatedBy, validationDate, estimated, anomalyScore, correctionId

### Invoice
| Field | Type | Status |
|-------|------|--------|
| id | UUID | ✅ |
| number | String (unique) | ✅ |
| customerId | String | ✅ |
| amount | Float | ✅ |
| status | String | ✅ |
| dueDate, issuedAt, paidAt | DateTime? | ✅ |
| payments[] | Relation | ✅ |

**Missing:** taxAmount, discountAmount, notes, items[], pdfPath, tariffId, billCycleId, charges[]

### Payment
| Field | Type | Status |
|-------|------|--------|
| id | UUID | ✅ |
| invoiceId | String | ✅ |
| amount | Float | ✅ |
| method, status | String | ✅ |
| paidAt | DateTime | ✅ |

**Missing:** reference, gatewayResponse, feeAmount, receiptPath

---

## Missing Models (37)

### Customer Groups
**Purpose:** Organize customers into groups for billing, reporting, permissions  
**Dependencies:** Customer  
**Fields:** id, name, description, parentId, createdAt, updatedAt

### Organizations
**Purpose:** Multi-tenant organization hierarchy  
**Dependencies:** none (root entity)  
**Fields:** id, name, code, address, logo, phone, email, status, createdAt

### Projects
**Purpose:** Group meters and customers by project/phase  
**Dependencies:** Organization  
**Fields:** id, name, organizationId, startDate, endDate, status, area, budget

### Areas
**Purpose:** Geographic/administrative zones  
**Dependencies:** Project  
**Fields:** id, name, projectId, city, region, coordinates, status

### Buildings
**Purpose:** Physical building locations  
**Dependencies:** Area  
**Fields:** id, name, areaId, address, type, floors, units, coordinates

### Units
**Purpose:** Individual apartments/offices within buildings  
**Dependencies:** Building  
**Fields:** id, buildingId, unitNumber, floor, type, area, occupant, status

### Contracts
**Purpose:** Customer service agreements  
**Dependencies:** Customer, Tariff  
**Fields:** id, customerId, tariffId, startDate, endDate, status, meterIds[], deposit, terms

### Meter Types
**Purpose:** Categorize meters by utility type  
**Dependencies:** none (reference data)  
**Fields:** id, name, code, utility (water/electricity/gas), unit, multiplier

### Meter Assignments
**Purpose:** Track meter installation history at locations  
**Dependencies:** Meter, Contract, Building/Unit  
**Fields:** id, meterId, contractId, locationId, installDate, removeDate, status

### Main Water Meters
**Purpose:** Primary water meters for building complexes  
**Dependencies:** Meter  
**Fields:** id, meterId, buildingId, connectionSize, zone

### Child Water Meters
**Purpose:** Sub-metered units under main water meters  
**Dependencies:** MainWaterMeter  
**Fields:** id, meterId, mainMeterId, unitId, ratio

### Electricity
**Purpose:** Electricity-specific meter data  
**Dependencies:** Meter  
**Fields:** id, meterId, phase, voltage, amperage, powerFactor, tariffType

### SIM Cards
**Purpose:** IoT connectivity for smart meters  
**Dependencies:** Meter  
**Fields:** id, iccid, imei, operator, phoneNumber, status, dataPlan, expiryDate

### Gateways
**Purpose:** Data collection gateways for meter networks  
**Dependencies:** Area  
**Fields:** id, serial, name, areaId, ipAddress, firmware, status, lastSeen

### Reading Validation
**Purpose:** Validation rules and results for readings  
**Dependencies:** Reading  
**Fields:** id, readingId, validator, rules[], results[], status, timestamp

### Reading Corrections
**Purpose:** Adjust erroneous readings  
**Dependencies:** Reading  
**Fields:** id, originalReadingId, correctedValue, reason, approvedBy, timestamp

### Tariffs
**Purpose:** Pricing structures per meter type/consumption  
**Dependencies:** MeterType  
**Fields:** id, name, meterTypeId, tiers[], rates[], effectiveDate, status

### Tariff Versions
**Purpose:** Track tariff changes over time  
**Dependencies:** Tariff  
**Fields:** id, tariffId, version, effectiveDate, tiers[], rates[], createdBy

### Bill Cycles
**Purpose:** Billing period schedules  
**Dependencies:** Customer, Meter  
**Fields:** id, name, customerId, frequency, startDay, endDay, lastRun, nextRun

### Charges
**Purpose:** Individual line items on invoices  
**Dependencies:** Invoice, Tariff  
**Fields:** id, invoiceId, description, tariffId, meterId, consumption, rate, amount

### Credit Notes
**Purpose:** Adjustments and refunds  
**Dependencies:** Invoice  
**Fields:** id, invoiceId, amount, reason, approvedBy, status, createdAt

### Receipts
**Purpose:** Payment confirmation documents  
**Dependencies:** Payment  
**Fields:** id, paymentId, receiptNumber, pdfPath, sentAt, status

### Ledger
**Purpose:** General ledger for accounting  
**Dependencies:** Invoice, Payment, CreditNote  
**Fields:** id, entityType, entityId, debit, credit, balance, period, description

### Bank Accounts
**Purpose:** Company bank accounts for payment reconciliation  
**Dependencies:** Organization  
**Fields:** id, organizationId, bankName, accountNumber, iban, swift, currency, status

### Payment Centers
**Purpose:** Physical payment collection points  
**Dependencies:** Area  
**Fields:** id, name, areaId, address, phone, operatingHours, status

### Reports
**Purpose:** Stored report definitions and history  
**Dependencies:** none  
**Fields:** id, name, type, parameters, schedule, lastRun, format, createdBy

### Notifications
**Purpose:** System notifications for users  
**Dependencies:** User  
**Fields:** id, userId, type, title, body, read, actionUrl, createdAt

### Files / Attachments
**Purpose:** Document storage for entities  
**Dependencies:** any entity (polymorphic)  
**Fields:** id, entityType, entityId, fileName, filePath, mimeType, size, uploadedBy

### Activities
**Purpose:** Activity feed / timeline entries  
**Dependencies:** any entity  
**Fields:** id, entityType, entityId, action, description, userId, timestamp

### Audit Logs
**Purpose:** Compliance and security audit trail  
**Dependencies:** User  
**Fields:** id, userId, action, entityType, entityId, oldValue, newValue, ipAddress, timestamp

---

## Entity Relationship Diagram (Conceptual)

```
Organization 1──* Project 1──* Area 1──* Building 1──* Unit
                                            │
Customer 1──* Contract 1──* MeterAssignment 1──* Meter
                │                                ├── MainWaterMeter 1──* ChildWaterMeter
                ├── Tariff                        ├── Electricity
                │   └── TariffVersion             ├── SIMCard
                └── BillCycle                     └── Gateway
                                                       │
Meter 1──* Reading 1──0..1 ReadingValidation
                │        └── ReadingCorrection
                │
Invoice 1──* Charge
    │       └── Tariff
    ├── CreditNote
    └── Payment 1──* Receipt
                    │
Ledger ←─── Invoice, Payment, CreditNote
```

---

## Coverage Summary

| Category | Total | Existing | Missing | Coverage |
|----------|-------|----------|---------|----------|
| Core Business | 8 | 4 | 4 | 50% |
| Metering | 10 | 1 | 9 | 10% |
| Billing | 10 | 2 | 8 | 20% |
| Financial | 5 | 0 | 5 | 0% |
| Infrastructure | 10 | 0 | 10 | 0% |
| **Total** | **43** | **6** | **37** | **14%** |
