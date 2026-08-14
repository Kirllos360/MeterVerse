# ARCHIVE COMPARISON — THREE RAR ARCHIVES vs EXTRACTED SOURCES

---

## 1. Archive Summary

| Archive | Size | Encrypted | Extracted Source | Match Confidence |
|---------|------|-----------|------------------|------------------|
| `D:\Collection System.rar` | 3,362 MB | YES | `reference\collection-system\` (560 files) | HIGH (README name "Collection Tracker v1.2.1" matches; alembic/DBS evidence) |
| `D:\IMS.rar` | 4,921 MB | YES | `reference\ims\` + nested `IMS\IMS.rar` (unencrypted, listable, 25 files) | HIGH (nested IMS.rar fully listable with matching page set) |
| `D:\New folder (2).rar` | 834 MB | YES | `reference\all-last-update\` + `reference\sbill\` + `reference\symbiot\` | MEDIUM (mixed archive; on-disk "New folder (2)" matches; sys_n README matches Symbiot resource) |

## 2. Cross-Archive Comparison

| Dimension | Collection System | IMS | New folder (2) |
|-----------|------------------|-----|----------------|
| Backend | Flask (full) | Express static only | SBill Spring Boot + Symbiot .NET + Energy360 .NET |
| Frontend | Jinja2 templates (79) | Static HTML (8 pages) | Angular (SBill), Angular (Energy360) |
| Database | PostgreSQL + SQLite stubs | none | SQL Server (PalmHills_Billing, Energy360_V4) |
| Business rules | **High value** (solar, settlement, charges) | none | Tax rules + protocols |
| Reusable code | charge_engine.py (portable) | none | none (binary/JAR/DLL) |
| Data migration source | possible (PG/SQLite) | none | **Yes — SQL Server → MeterVerse** |

## 3. Key Differentiators

- **Collection System is the ONLY one with solar wallet + settlement + cheque/POS** — the primary recovery target.
- **Symbiot (in New folder 2) is the ONLY meter-protocol/MDM inventory** — informs the SEP bridge.
- **SBill (in New folder 2) is the ONLY historical billing data source** (SQL Server) for migration.
- **IMS is redundant** (UI only, MeterVerse superior).

## 4. OBIS / Measurement Model Conflict

- Collection solar readings use **1.8.0 (import/consumption) + 2.8.0 (export/production)** OBIS codes.
- MeterVerse uses **5.8.0 combined = Import + Export** (per AGENTS.md, MPRTFk schema).
- **CONFLICTING BUSINESS MEANING — flagged.** Any solar-wallet clone must map legacy 1.8.0/2.8.0 semantics onto MeterVerse's 5.8.0 combined model with explicit business sign-off.

## 5. Fidelity Note

Direct archive-vs-extracted byte comparison was NOT possible (archives encrypted). If the user supplies the RAR password, a follow-up can verify archive fidelity. This does not block the discovery conclusions, which rest on the extracted sources.
