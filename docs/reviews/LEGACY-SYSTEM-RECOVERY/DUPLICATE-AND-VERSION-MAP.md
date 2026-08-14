# DUPLICATE AND VERSION MAP

**Reconstructing lineage between the three archives and current MeterVerse.**

---

## 1. Duplicate / Overlap Analysis

| Content | Appears In | Overlap Type |
|---------|-----------|--------------|
| Billing/payment domain | Collection System, SBill, Energy360, IMS, MeterVerse | **Heavy conceptual duplication** (same domain, 4+ implementations) |
| Customer/Meter/Invoice/Reading/Tariff UI pages | IMS, Collection templates, SBill Angular, MeterVerse | Duplicate UI concepts |
| Readings domain | Collection, SBill, Symbiot (MDM), MeterVerse | Duplicate domain |
| Fawry payment integration | Energy360, (MeterVerse gateway) | Duplicate integration concept |
| Solar wallet | Collection System only | **Unique to Collection** |
| Chilled water | Collection System only | **Unique to Collection** |
| Cheque/POS | Collection System only | **Unique to Collection** |
| 25+ meter protocols | Symbiot only | **Unique to Symbiot** |

## 2. Version / Generation Lineage (evidence-based reconstruction)

```
LEGACY VERSION A  SBill / October Billing (Spring Boot JARs, Angular, SQL Server)
     ↓  (same domain, different impl)
LEGACY VERSION B  Energy 360 (.NET Core 2.2 portal + admin, Fawry, Firebase)
     ↓  (converging domain)
LEGACY VERSION C  Collection Tracker v1.2.1 (Flask + PostgreSQL, 2026-06-12 rules)
     ↓  (adds solar wallet, chilled water, cheque/POS)
LEGACY VERSION D  Symbiot AMI/MDM (Iskraemeco 3.16.302.1 — device/protocol layer)
     ↓  (currently being re-implemented as web app)
CURRENT METERVERSE (Node/Next.js/NestJS + PostgreSQL 16, 200+ models, tenancy)
```

**Key inference (evidence-based, not assumed):** The archives are NOT versions of each other — they are **four parallel systems covering overlapping domains** with distinct implementations:
- SBill/October + Energy360 = the billing/portal generation (SQL Server).
- Collection Tracker = the operational collection generation (Flask/PG) — newest of the "business" systems.
- Symbiot = the meter-communication/MDM layer (protocols).
- MeterVerse = the unified modern successor.

## 3. What Is NOT Duplicated (MeterVerse-only)

AI/revenue-assurance · Governance · Workflow/approvals engine · Financial accounting (GL, budgets, IFRS) · Documents · SLA/escalations · Tenancy/RBAC · 5.8.0 combined energy channels.

## 4. Implication

No blind merge. The four legacy systems are **source material for 5 concrete clone/adapt targets** (solar wallet, settlements, cheque/POS, chilled water, Symbiot protocols) plus **1 data-migration source** (SBill SQL Server → MeterVerse). Everything else is reference or obsolete.
