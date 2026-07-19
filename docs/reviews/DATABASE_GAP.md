# Phase D: Database Gap Analysis

**Date:** 2026-07-19  
**Schema:** PostgreSQL via Prisma  

---

## Existing Models (6)

| Model | Fields | Missing Fields |
|-------|--------|---------------|
| User | id, email, password, name, role, area, project, tenant, language, theme, mfaEnabled | avatar, phone, status, lastLogin, permissions[], groups[] |
| Customer | id, name, email, phone, address, status, area | notes, tags[], groupId, contractId, avatar, documents[], history[] |
| Meter | id, serial, type, location, status, area, customerId | zoneId, installDate, lastReading, model, firmware, simCardId |
| Reading | id, meterId, value, unit, timestamp, source, status | validatedBy, validationDate, estimated, anomalyScore |
| Invoice | id, number, customerId, amount, status, dueDate, issuedAt, paidAt | taxAmount, discountAmount, notes, items[], pdfPath |
| Payment | id, invoiceId, amount, method, status, paidAt | reference, gatewayResponse, feeAmount |

---

## Missing Models (Enterprise)

| Model | Priority | Purpose |
|-------|----------|---------|
| **Contract** | 🔴 Critical | Customer contracts, terms, start/end dates |
| **Tariff** | 🔴 Critical | Pricing rules, tiers, rates per meter type |
| **AuditLog** | 🔴 Critical | All system actions with actor, timestamp, details |
| **Notification** | 🟡 High | Notification records, read status, type |
| **Role** | 🟡 High | Role definitions |
| **Permission** | 🟡 High | Permission definitions |
| **FeatureFlag** | 🟡 Medium | Toggle features |
| **Webhook** | 🟡 Medium | External integration endpoints |
| **ApiKey** | 🟡 Medium | Developer API keys |
| **Backup** | 🟡 Medium | Backup records |
| **Job** | 🟢 Low | Scheduled job records |
| **Document** | 🟢 Low | Uploaded documents |
| **ContractMeter** | 🟢 Low | Meter assignment to contracts |

---

## Schema Issues

| Issue | Location | Impact |
|-------|----------|--------|
| No indexes on foreign keys | All models | Performance degradation at scale |
| Missing timestamps on Reading | No updatedAt | Can't track modifications |
| No soft delete | All models | Data loss on delete |
| No audit columns | All models | Can't track who created/updated |
| String IDs (UUID) without indexes | All models | Slow joins at scale |
| No enum types | Status fields | Data inconsistency risk |

---

## Summary

| Metric | Value |
|--------|-------|
| Existing models | 6 |
| Missing models (Critical) | 3 |
| Missing models (High) | 5 |
| Missing models (Medium) | 4 |
| Missing models (Low) | 3 |
| Schema issues found | 6 |
