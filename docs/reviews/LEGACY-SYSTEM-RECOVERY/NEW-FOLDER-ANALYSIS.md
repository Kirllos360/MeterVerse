# LEGACY "NEW FOLDER (2)" — ANALYSIS

**User archive:** `D:\New folder (2).rar` (834.87 MB, 2026-07-04)
**Extracted sources found on disk:**
- `D:\meter\Meter\reference\all-last-update\` (incl. `sys_n\` = Symbiot reimplementation resource)
- `D:\meter\Meter\reference\sbill\` (SBill / October Billing / Energy360)
- `D:\meter\Meter\reference\symbiot\`, `D:\meter\Meter\reference\energy-360\`

---

## 1. What Does "New folder (2)" Actually Contain?

The archive is a **mixed collection** (the name is non-descriptive — matches the on-disk "New folder"/"New folder (2)" structure in `all-last-update\`). Evidence-based contents:

| Sub-system | Evidence | Stack |
|-----------|----------|-------|
| **Symbiot AMI/MDM reimplementation resource** | `sys_n\README.md`: "Reverse-engineered the Iskraemeco Symbiot 3.16.302.1 AMI/MDM desktop system... 5,952 files, 1.7 GB" | .NET (SymbiotMonitorAPI, SymbiotOperatorAPI), WCF, 25+ meter protocols |
| **SBill / October Billing** | `reference\sbill\` — full reverse-engineering package (architecture, database-analysis, OctBilling-Complete) | Spring Boot JARs, Angular, SQL Server (`PalmHills_Billing`/`Energy360_V4`), JasperReports |
| **Energy 360** (customer portal + admin) | `reference\sbill\` (Energy360_V4), `reference\energy-360\meter-pulse\` | .NET Core 2.2 + Angular, Fawry payments, Firebase |
| Debug snapshots | `all-last-update\New folder (2)\opencode-debug-20260528T032501.zip` | — |

## 2. Symbiot System Detail (the core of this archive)

- **Purpose:** Advanced Metering Infrastructure (AMI) / Meter Data Management (MDM); communicates with electricity/water/gas meters via **25+ protocols**, schedules reads, validates data, aggregates results, real-time monitoring.
- **Components:** 01_Installation (895 files), Drivers (55+ meter protocol DLLs), Plugins (9), Agents (9), Devices (11 comm channel DLLs), ProtocolDrivers.
- **Relationship to MeterVerse:** MeterVerse has a `symbiot` integration + SEP (Symbiot/Smart Energy Protocol) modules; this resource documents the **underlying device/protocol layer** that the SEP bridge talks to.
- **Reuse classification:** **B/C — ADAPTABLE / CLONE.** The protocol inventory and MDM behavior are reference gold; reimplementation into the MeterVerse Symbiot bridge is already planned (`symbiot_web_reimplementation_plan.zip`).

## 3. SBill / October Billing Detail

- **Purpose:** Palm Hills / Estates billing engine (utility billing: readings, consumption, invoices, payments, taxes labour 15% / tax 1% / VAT 14%).
- **DB:** SQL Server — `PalmHills_Billing` + `Energy360_V4`.
- **Reuse:** The migration-plan + database-analysis docs already map SBill→MeterVerse; **D. REFERENCE** (data migration source) + **B. ADAPTABLE** for tax/fee rules.

## 4. Reuse Classification

| Capability | Source | Classification |
|-----------|--------|---------------|
| Symbiot protocol/MDM inventory | New folder (2) | **B. ADAPTABLE** (informs MeterVerse Symbiot bridge) |
| SBill billing tax rules (15%/1%/14%) | New folder (2) | **B. ADAPTABLE** (MeterVerse has tariff/tax engine) |
| SBill historical data | New folder (2) | **A/D — migration source + reference** |
| Energy360 portal patterns | New folder (2) | **D. REFERENCE** |

## 5. Conclusion

"New folder (2)" is a **resource/analysis archive**, not a single coherent codebase. Its highest-value asset is the **Symbiot AMI/MDM reimplementation resource** (protocol inventory + behavior), which directly supports MeterVerse's Symbiot SEP bridge work.
