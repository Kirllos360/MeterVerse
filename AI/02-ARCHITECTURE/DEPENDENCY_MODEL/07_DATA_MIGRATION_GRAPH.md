# 07 — Data Migration Graph

**Version:** 1.0.0  
**Purpose:** Migration from legacy systems: SBill, Collection System, Symbiot, Excel imports.

---

## 1. Migration Sources

| Source | Type | Entities | Status | Priority |
|--------|------|----------|--------|----------|
| **SBill Palm Hills** | Legacy billing system | Customers, Meters, Invoices, Payments, Readings | ✅ Documented | High |
| **SBill Estates** | Legacy billing system | Customers, Meters, Invoices, Payments, Readings | ✅ Documented | High |
| **Collection System (Flask)** | Legacy collection system | Customers, Meters, Invoices, Payments, Readings, Users | ✅ Documented | Medium |
| **Symbiot** | External meter data system | Meters, Readings | ✅ Active | High |
| **Excel Templates** | Manual data entry | Customers, Meters, Readings, Payments | ✅ Active | Low |
| **Manual UI** | Direct data entry via forms | All entities | ✅ Active | Low |
| **Bulk Admin UI** | Admin data management | All entities via admin console | ✅ Active | Low |

---

## 2. Entity Migration Rules

| Entity | SBill Rules | Collection Rules | Symbiot Rules | Excel Rules |
|--------|-------------|-----------------|---------------|-------------|
| **Project** | Map project codes. Verify area mapping. | Same as SBill. | — | Must exist before import |
| **Building/Floor/Unit** | Map legacy location hierarchy to 4-level model | Same hierarchy | — | Code + parent code in template |
| **Customer** | Deduplicate by phone+name. Map national ID. | Same dedup. Map customer type. | — | Required template |
| **Meter** | Deduplicate by serial. Map status. | Same dedup. Map 6-status lifecycle. | Primary meter source | Required template |
| **Reading** | Deduplicate by meter+date. Keep all history. | Same dedup. Mark as `imported`. | Primary reading source | Required template |
| **Invoice** | Keep paid invoices as history. Mark as `migrated`. | Same. Do NOT regenerate. | — | Not imported (generated) |
| **Payment** | Keep as history. Match to invoices. | Same. Flag unmatched. | — | Optional template |
| **Tariff** | Map rate structures to 7 charge modes | Same mapping | — | One-time setup |

---

## 3. Validation Rules

| Check | Rule | Severity |
|-------|------|----------|
| Duplicate customer | Same phone + name = duplicate | BLOCK |
| Duplicate meter | Same serial = duplicate | BLOCK |
| Missing project | Entity references non-existent project | BLOCK |
| Missing unit | Customer references non-existent unit | BLOCK |
| Orphan reading | Meter not found | WARN (create meter stub) |
| Orphan invoice | Customer not found | WARN (orphan invoice) |
| Future reading | Date > today | WARN |
| Negative reading | Consumption < 0 | BLOCK |
| Zero consumption | Consumption = 0 | WARN |
| Status mismatch | Legacy status not in target enum | BLOCK (map required) |

---

## 4. Conflict Resolution

| Conflict | Strategy |
|----------|----------|
| Customer exists (same phone) | Update existing, keep newest data |
| Meter exists (same serial) | Update existing, keep newest status |
| Reading exists (same meter+date) | Skip duplicate, log warning |
| Invoice exists (same number) | Skip duplicate, log warning |
| Tariff exists (same name+period) | Skip duplicate |

---

## 5. Migration Phases

| Phase | Source | Duration | Entities | Validation |
|-------|--------|----------|----------|-----------|
| 1 | Symbiot (active sync) | Ongoing | Meters, Readings | Continuous |
| 2 | SBill Palm Hills | 2 weeks | Customers, Meters, Invoices, Payments, Readings | Per-batch |
| 3 | SBill Estates | 2 weeks | Customers, Meters, Invoices, Payments, Readings | Per-batch |
| 4 | Collection System | 3 weeks | All entities | Per-batch |
| 5 | Excel clean-up | 1 week | Remaining data gaps | Per-entity |

---

## 6. Rollback Strategy

| Scenario | Action |
|----------|--------|
| Duplicate import | Skip duplicates, import only new |
| Wrong data imported | Manual correction in UI. Re-import with override flag. |
| Migration script failure | Transaction rollback. Log error. Retry. |
| Data quality issues | Import to staging. Review before promoting to production. |
