# METERVERSE READING ENGINE — COMPLETE BIBLE

> **Purpose**: Complete reference for building a MeterVerse system that replicates the Symbiot-to-Billing reading pipeline. Covers how meters record data, how channels map to OBIS codes, how triggers create combined values, how billing reads and calculates consumption (solar & non-solar), and how the UI displays readings.

---

## VOLUME 1 — SYSTEM ARCHITECTURE

### 1.1 End-to-End Data Flow

```
Physical Meter (smart meter at customer site)
    │
    │  SEP2 Protocol (DLMS/COSEM)
    ▼
Symbiot SCADA Server
    │
    │  Reads configured OBIS codes at scheduled intervals
    │  Writes readings to Result table (automatic)
    │  Writes manual entries to ResultM table (manual)
    ▼
[dbo].[Result] / [dbo].[ResultM]
    │
    │  AFTER INSERT trigger fires
    │  Calculates Combined = Import + Export
    ▼
[dbo].[Result] (has combined channel now)
    │
    │  Billing Engine (Java) polls at intervals
    │  Reads via SEP_ELECT_RESULT_TYPE config
    ▼
Billing Database
    ├── monthly_reading  (for invoicing)
    ├── invoice          (generated bills)
    └── tariff           (rate plans)
```

### 1.2 Database Topology

Each **Area** has its own pair of databases:

| Area | SCADA Database | Billing Database | Project ID | Status |
|------|---------------|-----------------|------------|--------|
| October | `PalmHills_October` | `PalmHills_Billing` | 1 | ✅ Live |
| New Cairo | `PalmHills_NewCairo` | `PalmHills_Billing_NewCairo` | 2 | ✅ Live |
| SODIC | `SODIC` | `Sodic_billing` | 3 | ✅ Live |
| *Future* | *Any name* | *Any name* | *Any ID* | — |

**Critical rule**: SCADA DB = one per area. Billing DB = can be shared (filtered by `project_id`) or separate per area.

### 1.3 Server Landscape

| Resource | URL / Port |
|----------|-----------|
| Billing UI | `http://10.50.30.2:9999/` |
| October billing engine | `billing_engine_october` (port 8085) |
| New Cairo billing engine | `billing_engine_newcairo` (port 8083) |
| [NEED INFO] Symbiot SCADA server connection details | |
| [NEED INFO] SEP2 communication protocol config | |

---

## VOLUME 2 — HOW METERS RECORD DATA (SYMBIOT)

### 2.1 The Meter → SCADA Pipeline

1. **Physical meter** stores energy registers internally (OBIS codes)
2. **Symbiot** polls the meter via SEP2 protocol at regular intervals (typically every 15 minutes for LP2)
3. For each poll, Symbiot reads the OBIS codes configured in the MPRT `Parameters` column
4. The reading is written to `[Result]` table with:
   - `MPRTFk` → which MeasPointResType (identifies the channel)
   - `ResultTimeStamp` → when the reading was taken
   - `ResultValue` → the numeric value from the meter
   - `Status` → 0 = normal

[NEED INFO] Actual SEP2 polling configuration (schedule table, interval settings)

### 2.2 SEP2 OBIS Code Convention

OBIS codes follow the format: `{A}-{B}:{C}.{D}.{E}*{F}`

| Code | Meaning | Example |
|------|---------|---------|
| 1.8.0 | Positive Active Energy (Import) | Energy consumed from grid |
| 2.8.0 | Negative Active Energy (Export) | Energy sent to grid |
| 5.8.0 | **Combined** (calculated) | Import + Export (our creation) |
| 16.8.0 | Solar Net | Net generation (used in NC, unreliable) |
| 15.8.0 | Other Combined | Pre-existing combined (unused) |

### 2.3 MeasPoint Types

Each device has multiple measpoints. LP2 = Load Profile 2 = 15-minute interval data (standard for billing).

| Type | Suffix | Interval | Used For |
|------|--------|----------|----------|
| **LP2** | `_LP2` | 15 min | **Billing** |
| BP1 | `_BP1` | Block | Backup / verification |
| BP2 | `_BP2` | Block | Backup / verification |
| Hourly | `_Hourly` | 60 min | Historical / analysis |
| W1 | `_W1` | Water | Water meters (not electricity) |
| W4 | `_W4` | Water | Water meters (not electricity) |

**Golden rule**: Only LP2 measpoints are used for billing. Never create combined channels for non-LP2 types.

### 2.4 The Reading Tables

| Table | Data Origin | Usage |
|-------|-------------|-------|
| `Result` | Automatic SCADA reads | Primary — 99% of data |
| `ResultM` | Manual/imported entries | Field uploads, corrections |
| `ObjectResult` | Object-based readings | Alternative schema |
| `ObjectResultM` | Manual object readings | Alternative manual schema |
| `ChangedResult` | Modified results | Audit trail for changes |
| `ChangedObjectResult` | Modified object results | Audit trail for changes |

All share the same schema:
```sql
MPRTFk INT (FK → MeasPointResType.PkID),
ResultTimeStamp DATETIME,
ResultValue FLOAT,
Status INT
```

---

## VOLUME 3 — READING CHANNELS PER AREA

### 3.1 Mapping Table

| OBIS Code | Description | October RT | New Cairo RT | SODIC RT |
|-----------|-------------|------------|--------------|----------|
| **2.8.0** | Export (energy to grid) | **RT=7** | **RT=3** | **RT=5** |
| **1.8.0** | Import (energy from grid) | **RT=8** | **RT=4** | **RT=6** |
| **5.8.0** | **Combined** (Import + Export) | **RT=10** | **RT=25** | **RT=10** |
| 16.8.0 | Solar Net (unreliable) | — | RT=13 | — |
| 15.8.0 | Other Combined (unused) | — | RT=19 | RT=1003 |

**SODIC Note**: SODIC's RT=5 (Export) is named `( 2.8.x ) Negative active energy A-` and RT=6 (Import) is named `( 1.8.x ) Positive active energy A+`. These correspond to the same OBIS codes but have different naming conventions than October/New Cairo. SODIC also has a pre-existing test combined RT=1003 `(15.8.0)Active Energy Combined (I+AI+I-AI)` that was never used (0 data rows).

### 3.2 Why Different RT Numbers Across Areas

ResultType `PkID` values are auto-generated sequences. Each SCADA database has its own independent sequence, so the same OBIS code maps to different RT numbers in different databases.

**Always map by OBIS code name, never by RT number.**

### 3.3 Combined Formula

```
5.8.0 Combined = 1.8.0 Import + 2.8.0 Export
```

For October: `RT=10 = RT=8 + RT=7`
For New Cairo: `RT=25 = RT=4 + RT=3`
For SODIC: `RT=10 = RT=6 + RT=5`

---

## VOLUME 4 — ENTITY CHAIN & DATABASE SCHEMA

### 4.1 The Chain

```
Physical Meter
    ↓  sep_2_w (billing.meter → scada.Device)
Device (SCADA DB)
    ↓  DeviceFk
MeasPoint (SCADA DB) — "DeviceName_LP2"
    ↓  MeasPointFk
MeasPointResType / MPRT (SCADA DB) — links to ResultType
    ↓  MPRTFk
Result / ResultM (SCADA DB) — time-series readings
```

### 4.2 Device Table

```sql
CREATE TABLE [Device] (
    PkID INT PRIMARY KEY,
    Name VARCHAR(255),       -- e.g., "249CT_83550979"
    SerialNo VARCHAR(100),   -- meter serial number
    DeviceID VARCHAR(100),
    IsActive BIT,
    DeviceType VARCHAR(50)
);
```

### 4.3 MeasPoint Table

```sql
CREATE TABLE [MeasPoint] (
    PkID INT PRIMARY KEY,
    DeviceFk INT FOREIGN KEY REFERENCES Device(PkID),
    Name VARCHAR(255),       -- e.g., "249CT_83550979_LP2"
    MeasPointTypeFk INT
);
```

Convention: `{DeviceName}_{MeasPointType}` — e.g., `249CT_83550979_LP2`, `249CT_83550979_BP1`, `249CT_83550979_Hourly`

### 4.4 MeasPointResType (MPRT) — THE CRITICAL JUNCTION

```sql
CREATE TABLE [MeasPointResType] (
    PkID INT PRIMARY KEY,
    MeasPointFk INT FOREIGN KEY REFERENCES MeasPoint(PkID),
    ResultTypeFk INT FOREIGN KEY REFERENCES ResultType(PkID),
    Period INT DEFAULT 1,
    PeriodUnit INT DEFAULT 4,
    CorrectionFactor INT DEFAULT 1,
    Class VARCHAR(50) DEFAULT 'SEP2RegisterProfile',
    Instance VARCHAR(50) DEFAULT '99.2.0',
    MethodType INT DEFAULT 2,
    Method VARCHAR(50) DEFAULT 'Read',
    ParametersType INT DEFAULT 16,
    Parameters VARCHAR(MAX),   -- XML with OBIS codes
    Type INT DEFAULT 0
);
```

This table is the junction that:
- Links a specific measpoint (meter + LP2) to a specific ResultType (channel)
- Defines which OBIS codes SEP2 should read from the meter
- Controls the SEP2 communication parameters

### 4.5 ResultType Table

```sql
CREATE TABLE [ResultType] (
    PkID INT PRIMARY KEY,
    Name VARCHAR(255),       -- e.g., "5.8.0 Energy Combined"
    QuantityFk INT FOREIGN KEY REFERENCES Quantity(PkID),
    UnitFk INT,              -- 3 = Energy
    TariffFk INT
);
```

### 4.6 Result & ResultM Tables

```sql
CREATE TABLE [Result] (
    MPRTFk INT FOREIGN KEY REFERENCES MeasPointResType(PkID),
    ResultTimeStamp DATETIME,
    ResultValue FLOAT,
    Status INT               -- 0 = normal
    -- No PK — duplicate timestamps can exist
);
CREATE TABLE [ResultM] (
    MPRTFk INT FOREIGN KEY REFERENCES MeasPointResType(PkID),
    ResultTimeStamp DATETIME,
    ResultValue FLOAT,
    Status INT
);
```

### 4.7 Billing Database — Meter Table

```sql
CREATE TABLE [meter] (
    id INT PRIMARY KEY,
    serial VARCHAR(100),
    name VARCHAR(255),        -- Should match Device.Name
    number VARCHAR(100),
    sep_2_w INT,              -- → Device.PkID (critical link!)
    is_solar BIT,             -- 1 = solar, 0 = non-solar
    project_id INT,           -- 1 = October, 2 = New Cairo
    status VARCHAR(20),       -- 'ACTIVE', 'INACTIVE'
    balance FLOAT,
    last_reading_date DATETIME
);
```

### 4.8 Billing Database — General Settings

```sql
CREATE TABLE [general_settings] (
    id INT PRIMARY KEY,
    general_settings_key VARCHAR(255),   -- 'SEP_ELECT_RESULT_TYPE', etc.
    general_settings_value VARCHAR(255)  -- e.g., '10', '25'
);
```

This table controls the billing engine behavior entirely.

---

## VOLUME 5 — MPRT PARAMETERS (OBIS CODE CONFIGURATION)

### 5.1 For Import/Export Channels (read directly from meter via SEP2)

```xml
<array>
  <string>1-0:1.8.0*255</string>
  <string>1-0:2.8.0*255</string>
</array>
<datetime>@from</datetime>
<datetime>@to</datetime>
```

- `1-0:1.8.0*255` = Import (Positive Active Energy)
- `1-0:2.8.0*255` = Export (Negative Active Energy)
- `255` = standard tariff (unidirectional)
- `@from` / `@to` = defines the time range for SEP2 to query

### 5.2 For Combined Channel (calculated, NOT read from meter)

```xml
<array>
  <string>1-0:5.8.0*255</string>
</array>
<datetime>@from</datetime>
<datetime>@to</datetime>
<boolean>@demand</boolean>
```

- `1-0:5.8.0*255` = Combined (our custom channel)
- Single OBIS code because this is a calculated channel, not a physical meter register
- `@demand` = indicates this is a demand register

### 5.3 SQL to Create Combined MPRT Links

```sql
INSERT INTO MeasPointResType (MeasPointFk, ResultTypeFk, Period, PeriodUnit,
    CorrectionFactor, Class, Instance, MethodType, Method, ParametersType, Parameters, Type)
SELECT
    mp.PkID, {Combined_RT}, 1, 4, 1,
    'SEP2RegisterProfile', '99.2.0',
    2, 'Read', 16,
    '<array><string>1-0:5.8.0*255</string></array><datetime>@from</datetime><datetime>@to</datetime><boolean>@demand</boolean>',
    0
FROM MeasPoint mp
WHERE mp.Name LIKE '%LP2%'
  AND EXISTS (SELECT 1 FROM MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = {Export_RT})
  AND EXISTS (SELECT 1 FROM MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = {Import_RT})
  AND NOT EXISTS (SELECT 1 FROM MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = {Combined_RT})
  AND mp.DeviceFk IN (SELECT sep_2_w FROM {BillingDB}.dbo.meter WHERE is_solar = 0);
```

### 5.4 Create ResultType + Quantity (if not exists)

```sql
-- Ensure Quantity exists
IF NOT EXISTS (SELECT 1 FROM Quantity WHERE Name = 'Energy')
    INSERT INTO Quantity (PkID, Name, UnitFk) VALUES ({QuantityID}, 'Energy', 3);

-- Create ResultType
IF NOT EXISTS (SELECT 1 FROM ResultType WHERE PkID = {Combined_RT})
    INSERT INTO ResultType (PkID, Name, QuantityFk, UnitFk, TariffFk)
    VALUES ({Combined_RT}, '5.8.0 Energy Combined', {QuantityID}, 3, 1);
```

---

## VOLUME 6 — V3 TRIGGERS (AUTO-CREATE COMBINED CHANNEL)

### 6.1 Critical Design Rules

1. **NO `IF @@NESTLEVEL > 1 RETURN`** — This guard blocks the trigger when Symbiot writes via stored procedure (NESTLEVEL > 1). Use `NOT EXISTS` to prevent duplicates.
2. **CROSS APPLY** with exact `ResultTimeStamp` matching — NOT `OUTER APPLY TOP 1 ORDER BY DESC` (which only picks the latest timestamp, creating wrong values).
3. **Process every row** in `inserted` — the trigger fires once per INSERT statement, which may contain multiple rows (batch import).
4. **Both `Result` and `ResultM` need triggers** — manual uploads go to `ResultM`, not `Result`.
5. **October pattern**: ResultM trigger must **dual-write** to both `ResultM` (for UI) and `Result` (for billing engine).

### 6.2 Trigger on Result (for automatic SCADA readings)

```sql
CREATE TRIGGER [dbo].[trg_Result_Combine_{AreaName}] ON [dbo].[Result] AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [dbo].[Result] (MPRTFk, ResultTimeStamp, ResultValue, Status)
    SELECT c.PkID, i.ResultTimeStamp,
           ISNULL(i.ResultValue, 0) + ISNULL(e.ResultValue, 0), 0
    FROM inserted i
    JOIN [dbo].[MeasPointResType] mprt ON mprt.PkID = i.MPRTFk
    JOIN [dbo].[MeasPointResType] c ON c.MeasPointFk = mprt.MeasPointFk
        AND c.ResultTypeFk = {Combined_RT}
    CROSS APPLY (
        SELECT ResultValue FROM [dbo].[Result]
        WHERE MPRTFk IN (
            SELECT PkID FROM [dbo].[MeasPointResType]
            WHERE MeasPointFk = mprt.MeasPointFk AND ResultTypeFk = {Export_RT}
        )
        AND ResultTimeStamp = i.ResultTimeStamp
    ) e
    WHERE mprt.ResultTypeFk = {Import_RT}
      AND NOT EXISTS (
        SELECT 1 FROM [dbo].[Result] r2
        WHERE r2.MPRTFk = c.PkID AND r2.ResultTimeStamp = i.ResultTimeStamp
    );
END;
```

### 6.3 Trigger on ResultM (for manual readings)

**Single-write** (most areas — writes combined to Result for billing):

```sql
CREATE TRIGGER [dbo].[trg_ResultM_Combine_{AreaName}] ON [dbo].[ResultM] AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [dbo].[Result] (MPRTFk, ResultTimeStamp, ResultValue, Status)
    SELECT c.PkID, i.ResultTimeStamp,
           ISNULL(i.ResultValue, 0) + ISNULL(e.ResultValue, 0), 0
    FROM inserted i
    JOIN [dbo].[MeasPointResType] mprt ON mprt.PkID = i.MPRTFk
    JOIN [dbo].[MeasPointResType] c ON c.MeasPointFk = mprt.MeasPointFk
        AND c.ResultTypeFk = {Combined_RT}
    CROSS APPLY (
        SELECT ResultValue FROM [dbo].[ResultM]
        WHERE MPRTFk IN (
            SELECT PkID FROM [dbo].[MeasPointResType]
            WHERE MeasPointFk = mprt.MeasPointFk AND ResultTypeFk = {Export_RT}
        )
        AND ResultTimeStamp = i.ResultTimeStamp
    ) e
    WHERE mprt.ResultTypeFk = {Import_RT}
      AND NOT EXISTS (
        SELECT 1 FROM [dbo].[ResultM] r2
        WHERE r2.MPRTFk = c.PkID AND r2.ResultTimeStamp = i.ResultTimeStamp
    );
END;
```

**Dual-write** (October pattern — writes to both ResultM for UI + Result for billing):

```sql
CREATE TRIGGER [dbo].[trg_ResultM_CombineImportExport] ON [dbo].[ResultM] AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Write to ResultM (for Symbiot UI display)
    INSERT INTO [dbo].[ResultM] (MPRTFk, ResultTimeStamp, ResultValue, Status)
    SELECT DISTINCT c.PkID, i.ResultTimeStamp,
           ISNULL(i.ResultValue, 0) + ISNULL(e.ResultValue, 0), 0
    FROM inserted i
    JOIN [dbo].[MeasPointResType] imp_mprt ON imp_mprt.PkID = i.MPRTFk
        AND imp_mprt.ResultTypeFk = {Import_RT}
    JOIN [dbo].[MeasPointResType] c ON c.MeasPointFk = imp_mprt.MeasPointFk
        AND c.ResultTypeFk = {Combined_RT}
    CROSS APPLY (
        SELECT ResultValue FROM [dbo].[ResultM]
        WHERE MPRTFk IN (
            SELECT PkID FROM [dbo].[MeasPointResType]
            WHERE MeasPointFk = imp_mprt.MeasPointFk AND ResultTypeFk = {Export_RT}
        )
        AND ResultTimeStamp = i.ResultTimeStamp
    ) e
    WHERE NOT EXISTS (
        SELECT 1 FROM [dbo].[ResultM] r2
        WHERE r2.MPRTFk = c.PkID AND r2.ResultTimeStamp = i.ResultTimeStamp
    );

    -- Write to Result (for billing engine)
    INSERT INTO [dbo].[Result] (MPRTFk, ResultTimeStamp, ResultValue, Status)
    SELECT DISTINCT c.PkID, i.ResultTimeStamp,
           ISNULL(i.ResultValue, 0) + ISNULL(e.ResultValue, 0), 0
    FROM inserted i
    JOIN [dbo].[MeasPointResType] imp_mprt ON imp_mprt.PkID = i.MPRTFk
        AND imp_mprt.ResultTypeFk = {Import_RT}
    JOIN [dbo].[MeasPointResType] c ON c.MeasPointFk = imp_mprt.MeasPointFk
        AND c.ResultTypeFk = {Combined_RT}
    CROSS APPLY (
        SELECT ResultValue FROM [dbo].[ResultM]
        WHERE MPRTFk IN (
            SELECT PkID FROM [dbo].[MeasPointResType]
            WHERE MeasPointFk = imp_mprt.MeasPointFk AND ResultTypeFk = {Export_RT}
        )
        AND ResultTimeStamp = i.ResultTimeStamp
    ) e
    WHERE NOT EXISTS (
        SELECT 1 FROM [dbo].[Result] r2
        WHERE r2.MPRTFk = c.PkID AND r2.ResultTimeStamp = i.ResultTimeStamp
    );
END;
```

### 6.4 Trigger Design Evolution (Why V3 Is Correct)

| Aspect | V1/V2 (Buggy) | V3 (Correct) |
|--------|---------------|--------------|
| Timestamp matching | `OUTER APPLY TOP 1 ORDER BY DESC` — picks latest, not matching timestamp | `CROSS APPLY` with `ResultTimeStamp = i.ResultTimeStamp` — exact match |
| NESTLEVEL guard | `IF @@NESTLEVEL > 1 RETURN` — blocks trigger on stored procedure writes | Removed entirely; `NOT EXISTS` prevents duplicates safely |
| Row processing | Subquery on `inserted` → limited to certain rows | Direct join on `inserted`, processes every row in batch |
| Export existence | `OUTER APPLY` allows NULL → creates combined without export data | `CROSS APPLY` requires both Import AND Export at same timestamp |

### 6.5 Why NOT EXISTS Works (No Infinite Loop)

When the trigger inserts into `Result`, that insert has `MPRTFk = combined_channel_PkID`. The `WHERE` clause filters:
```sql
WHERE mprt.ResultTypeFk = {Import_RT}
```

Since the new combined row has `ResultTypeFk = {Combined_RT}` (not Import), it is filtered OUT and the trigger does NOT fire again. **No infinite loop.**

---

## VOLUME 7 — SOLAR CONFIGURATION DEEP DIVE

### 7.1 Solar Billing Concept

Solar meters have **two energy flows**:
- Import (from grid) — positive when consuming from grid
- Export (to grid) — positive when generating surplus

The billing engine calculates **net consumption**:
```
Net = (Import_current - Import_previous) + (Export_current - Export_previous)
```

### 7.2 Why Solar Cannot Use the Combined Channel

The combined channel = Import + Export. For solar:
- If Import = 100 (used from grid) and Export = -30 (sent back), Combined = 70 ✓
- But the billing engine needs Import and Export **separately** for:
  - Net metering tariffs (different rates for consumption vs generation)
  - Tracking generation credits
  - Regulatory reporting

### 7.3 SEP Configuration for Solar

```ini
; Non-solar meters (use combined channel)
SEP_ELECT_RESULT_TYPE       = {Combined_RT}
SEP_ELECT_MEAS_POINT        = _LP2

; Solar meters (read both channels separately)
SEP_SOLAR_RESULT_TYPE        = {Export_RT}
SEP_ELECT_SOLAR_RESULT_TYPE  = {Import_RT}
SEP_SOLAR_MEAS_POINT         = _LP2
```

### 7.4 Billing Engine Decision Logic

```
For each meter in the billing cycle:
    IF meter.is_solar = 1 THEN
        import_val  = Query Result WHERE MPRTFk = meter's Import MPRT
        export_val  = Query Result WHERE MPRTFk = meter's Export MPRT
        net_current = import_val + export_val  (algebraic sum)
        net_previous = (previous import + previous export)
        consumption = net_current - net_previous
    ELSE
        combined_val = Query Result WHERE MPRTFk = meter's Combined MPRT
        consumption = combined_val - previous_combined_val
    END IF
```

### 7.5 Solar Verification Queries

```sql
-- Verify no solar meters have combined channel
SELECT COUNT(*) AS solar_in_combined
FROM MeasPointResType mprt
JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
JOIN Device d ON d.PkID = mp.DeviceFk
WHERE mprt.ResultTypeFk = {Combined_RT}
  AND d.PkID IN (SELECT sep_2_w FROM {BillingDB}.dbo.meter WHERE is_solar = 1);
-- Expected: 0

-- List all solar meters with their config
SELECT m.serial, m.name, m.sep_2_w,
    (SELECT TOP 1 ResultTypeFk FROM MeasPointResType mprt
     JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
     WHERE mp.DeviceFk = m.sep_2_w AND mp.Name LIKE '%LP2%'
       AND mprt.ResultTypeFk = {Import_RT}) AS has_import,
    (SELECT TOP 1 ResultTypeFk FROM MeasPointResType mprt
     JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
     WHERE mp.DeviceFk = m.sep_2_w AND mp.Name LIKE '%LP2%'
       AND mprt.ResultTypeFk = {Combined_RT}) AS has_combined
FROM {BillingDB}.dbo.meter m
WHERE m.is_solar = 1;
-- Expected: has_combined = NULL for all solar meters
```

[NEED INFO] How does the billing engine determine which tariff applies to solar vs non-solar?
[NEED INFO] Is there a separate `monthly_reading_solar` table or is it all in `monthly_reading`?

---

## VOLUME 8 — BILLING ENGINE

### 8.1 How the Billing Engine Reads Data

The billing engine is a Java/Spring service that:
1. Polls the SCADA `Result` table at configurable intervals
2. Reads the `general_settings` to determine which ResultType to read
3. For each meter in its billing cycle, queries the reading and calculates consumption
4. Writes the result to `monthly_reading` in the billing database

### 8.2 SEP Configuration Reference

| Setting | Purpose | Example (Oct) | Example (NC) |
|---------|---------|--------------|--------------|
| `SEP_ELECT_RESULT_TYPE` | Non-solar: which RT to read | `10` | `25` |
| `SEP_SOLAR_RESULT_TYPE` | Solar: Export RT | `7` | `3` |
| `SEP_ELECT_SOLAR_RESULT_TYPE` | Solar: Import RT | `8` | `4` |
| `SEP_ELECT_MEAS_POINT` | Non-solar measpoint suffix | `_LP2` | `_LP2` |
| `SEP_SOLAR_MEAS_POINT` | Solar measpoint suffix | `_LP2` | `_LP2` |

### 8.3 Billing Formulas

| Area | Mode | Formula |
|------|------|---------|
| October | **Diff-based** | `consumption = current_reading - previous_reading` |
| New Cairo | **Value-based** | `consumption = current_value - start_value` |

[NEED INFO] Is the formula controlled by another config setting or hard-coded per area?
[NEED INFO] Where does `start_value` come from for New Cairo? Is it stored in `meter` table or elsewhere?

### 8.4 Billing Engine Management

```powershell
# List billing engine services
Get-Service | Where-Object {$_.Name -like '*billing*' -or $_.Name -like '*newcairo*'}

# Check port usage
netstat -ano | findstr :8083
netstat -ano | findstr :8085

# Kill a stale process
Stop-Process -Id <PID> -Force

# Restart the service
Restart-Service -Name billing_engine_newcairo

# View logs
Get-Content -Path "C:\Path\To\Logs\billing_engine.log" -Tail 100
```

---

## VOLUME 9 — METER READING UI

### 9.1 How the UI Displays Readings

The billing UI at `http://10.50.30.2:9999/` shows meter readings. The UI reads from the billing database, NOT directly from the SCADA database.

[NEED INFO] Which table does the UI query for meter readings?
[NEED INFO] Does the UI show the raw Result values or processed monthly_reading values?
[NEED INFO] Is there an API endpoint that the UI calls? What's the REST path?
[NEED INFO] Does the UI show combined or individual Import/Export values?
[NEED INFO] Screenshot or description of the meter reading page layout

### 9.2 UI → Database Data Flow (Inferred)

```
User opens meter reading page in browser
    ↓
Browser → HTTP GET to billing API (port 9999)
    ↓
API queries billing database
    ↓
Billing DB returns: monthly_reading values, meter info
    ↓
API formats JSON response
    ↓
Browser renders the readings in the UI grid/table
```

### 9.3 UI Features (Observed)

- Tariff management page: `http://10.50.30.2:9999/#/tariff`
- Pagination: `?page=1&size=10&sort=id,asc`
- Shows meter serial numbers, reading values, dates

---

## VOLUME 10 — TARIFF ENGINE

### 10.1 How Tariffs Work

Tariffs determine how much a customer pays per kWh. Each tariff defines:
- **Name** (e.g., "Standard Residential", "Solar Net Metering")
- **Rate** per kWh (flat or tiered rates)
- **Applicable meters** (non-solar vs solar)

### 10.2 Tariff → ResultType Relationship

The tariff engine reads the same ResultType that's configured in `SEP_ELECT_RESULT_TYPE`. For solar meters, it reads both Import and Export.

### 10.3 Checking Tariff Configuration

```sql
-- All tariffs
SELECT * FROM tariff;

-- Rates for a specific tariff
SELECT * FROM tariff_rate WHERE tariff_id = {TariffID};

-- Which tariff applies to a meter
SELECT m.name, m.is_solar, t.name AS tariff
FROM meter m
JOIN meter_tariff mt ON mt.meter_id = m.id
JOIN tariff t ON t.id = mt.tariff_id
WHERE m.serial = '{MeterSerial}';
```

### 10.4 Tariff → Billing Pipeline

```
Meter reading is fetched (via SEP_ELECT_RESULT_TYPE)
    ↓
Billing engine applies formula (diff-based or value-based)
    ↓
Gross consumption calculated
    ↓
Tariff rate applied
    ↓
Invoice generated
```

---

## VOLUME 11 — BACKFILL QUERIES

### 11.1 From Result (automatic readings)

```sql
INSERT INTO [Result] (MPRTFk, ResultTimeStamp, ResultValue, Status)
SELECT
    m_combined.PkID, imp.ResultTimeStamp,
    ISNULL(imp.ResultValue, 0) + ISNULL(exp.ResultValue, 0), 0
FROM MeasPointResType m_combined
JOIN MeasPointResType m_import ON m_import.MeasPointFk = m_combined.MeasPointFk
    AND m_import.ResultTypeFk = {Import_RT}
JOIN MeasPointResType m_export ON m_export.MeasPointFk = m_combined.MeasPointFk
    AND m_export.ResultTypeFk = {Export_RT}
JOIN [Result] imp ON imp.MPRTFk = m_import.PkID
JOIN [Result] exp ON exp.MPRTFk = m_export.PkID
    AND exp.ResultTimeStamp = imp.ResultTimeStamp
WHERE m_combined.ResultTypeFk = {Combined_RT}
  AND NOT EXISTS (
    SELECT 1 FROM [Result] r WHERE r.MPRTFk = m_combined.PkID AND r.ResultTimeStamp = imp.ResultTimeStamp
  );
```

### 11.2 From ResultM (manual readings) — to Result

```sql
INSERT INTO [Result] (MPRTFk, ResultTimeStamp, ResultValue, Status)
SELECT
    c.PkID, i.ResultTimeStamp,
    ISNULL(i.ResultValue, 0) + ISNULL(e.ResultValue, 0), 0
FROM MeasPointResType imp_mprt
JOIN MeasPointResType c ON c.MeasPointFk = imp_mprt.MeasPointFk
    AND c.ResultTypeFk = {Combined_RT}
JOIN MeasPointResType exp_mprt ON exp_mprt.MeasPointFk = imp_mprt.MeasPointFk
    AND exp_mprt.ResultTypeFk = {Export_RT}
JOIN [ResultM] i ON i.MPRTFk = imp_mprt.PkID
JOIN [ResultM] e ON e.MPRTFk = exp_mprt.PkID AND e.ResultTimeStamp = i.ResultTimeStamp
WHERE imp_mprt.ResultTypeFk = {Import_RT}
  AND NOT EXISTS (
    SELECT 1 FROM [Result] r WHERE r.MPRTFk = c.PkID AND r.ResultTimeStamp = i.ResultTimeStamp
  );
```

### 11.3 From ResultM (manual readings) — to ResultM (dual-write)

```sql
INSERT INTO [ResultM] (MPRTFk, ResultTimeStamp, ResultValue, Status)
SELECT
    c.PkID, i.ResultTimeStamp,
    ISNULL(i.ResultValue, 0) + ISNULL(e.ResultValue, 0), 0
FROM MeasPointResType imp_mprt
JOIN MeasPointResType c ON c.MeasPointFk = imp_mprt.MeasPointFk
    AND c.ResultTypeFk = {Combined_RT}
JOIN MeasPointResType exp_mprt ON exp_mprt.MeasPointFk = imp_mprt.MeasPointFk
    AND exp_mprt.ResultTypeFk = {Export_RT}
JOIN [ResultM] i ON i.MPRTFk = imp_mprt.PkID
JOIN [ResultM] e ON e.MPRTFk = exp_mprt.PkID AND e.ResultTimeStamp = i.ResultTimeStamp
WHERE imp_mprt.ResultTypeFk = {Import_RT}
  AND NOT EXISTS (
    SELECT 1 FROM [ResultM] r WHERE r.MPRTFk = c.PkID AND r.ResultTimeStamp = i.ResultTimeStamp
  );
```

---

## VOLUME 12 — VERIFICATION QUERIES

### 12.1 Find Meters Missing Combined at Latest Timestamp

```sql
WITH latest_import AS (
    SELECT mprt.MeasPointFk, MAX(r.ResultTimeStamp) AS LastTS
    FROM Result r
    JOIN MeasPointResType mprt ON mprt.PkID = r.MPRTFk
    WHERE mprt.ResultTypeFk = {Import_RT}
    GROUP BY mprt.MeasPointFk
)
SELECT COUNT(*) AS MissingCombined_AtLatest
FROM latest_import li
JOIN MeasPointResType mprt_imp ON mprt_imp.MeasPointFk = li.MeasPointFk
    AND mprt_imp.ResultTypeFk = {Import_RT}
JOIN Result imp ON imp.MPRTFk = mprt_imp.PkID AND imp.ResultTimeStamp = li.LastTS
JOIN MeasPoint mp ON mp.PkID = li.MeasPointFk AND mp.Name LIKE '%LP2%'
CROSS APPLY (
    SELECT ResultValue FROM Result
    WHERE MPRTFk IN (SELECT PkID FROM MeasPointResType
        WHERE MeasPointFk = li.MeasPointFk AND ResultTypeFk = {Export_RT})
      AND ResultTimeStamp = li.LastTS
) exp
LEFT JOIN (
    SELECT 1 AS found FROM Result r
    JOIN MeasPointResType mprt ON mprt.PkID = r.MPRTFk
    WHERE mprt.MeasPointFk = li.MeasPointFk AND mprt.ResultTypeFk = {Combined_RT}
      AND r.ResultTimeStamp = li.LastTS
) comb ON 1=1
WHERE comb.found IS NULL;
```

### 12.2 Spot-Check Combined = Import + Export

```sql
SELECT TOP 10
    mp.Name,
    exp.ResultValue AS [2.8.0_Export],
    imp.ResultValue AS [1.8.0_Import],
    comb.ResultValue AS [5.8.0_Combined],
    ISNULL(exp.ResultValue, 0) + ISNULL(imp.ResultValue, 0) AS Expected
FROM MeasPointResType mprt_comb
JOIN MeasPoint mp ON mp.PkID = mprt_comb.MeasPointFk
JOIN MeasPointResType mprt_imp ON mprt_imp.MeasPointFk = mp.PkID
    AND mprt_imp.ResultTypeFk = {Import_RT}
JOIN MeasPointResType mprt_exp ON mprt_exp.MeasPointFk = mp.PkID
    AND mprt_exp.ResultTypeFk = {Export_RT}
CROSS APPLY (
    SELECT TOP 1 ResultTimeStamp, ResultValue FROM Result
    WHERE MPRTFk = mprt_comb.PkID ORDER BY ResultTimeStamp DESC
) comb
CROSS APPLY (
    SELECT ResultValue FROM Result
    WHERE MPRTFk = mprt_imp.PkID AND ResultTimeStamp = comb.ResultTimeStamp
) imp
CROSS APPLY (
    SELECT ResultValue FROM Result
    WHERE MPRTFk = mprt_exp.PkID AND ResultTimeStamp = comb.ResultTimeStamp
) exp
WHERE mprt_comb.ResultTypeFk = {Combined_RT}
  AND comb.ResultValue != ISNULL(imp.ResultValue, 0) + ISNULL(exp.ResultValue, 0);
```

### 12.3 Verify No Solar in Combined

```sql
SELECT COUNT(*) AS solar_in_combined
FROM MeasPointResType mprt
JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
JOIN Device d ON d.PkID = mp.DeviceFk
WHERE mprt.ResultTypeFk = {Combined_RT}
  AND d.PkID IN (SELECT sep_2_w FROM {BillingDB}.dbo.meter WHERE is_solar = 1);
-- Expected: 0
```

### 12.4 Verify Only LP2 Has Combined

```sql
SELECT mp.Name, COUNT(*)
FROM MeasPointResType mprt
JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
WHERE mprt.ResultTypeFk = {Combined_RT}
GROUP BY mp.Name;
-- Expected: only rows with '%LP2%'
```

### 12.5 Count Total Records

```sql
SELECT COUNT(*) AS total_combined_records
FROM Result
WHERE MPRTFk IN (SELECT PkID FROM MeasPointResType WHERE ResultTypeFk = {Combined_RT});
```

---

## VOLUME 13 — INVESTIGATION & DISCOVERY QUERIES

### 13.1 Find Databases

```sql
SELECT name FROM sys.databases
WHERE name LIKE '%NewCairo%' OR name LIKE '%October%' OR name LIKE '%SODIC%' OR name LIKE '%Billing%';
```

### 13.2 Check Existing Triggers

```sql
SELECT name, create_date, modify_date, is_disabled
FROM sys.triggers
WHERE name LIKE '%Combine%' OR name LIKE '%ImportExport%';

-- View full trigger definition
SELECT name, OBJECT_DEFINITION(object_id) AS TriggerCode
FROM sys.triggers
WHERE name LIKE '%Combine%' OR name LIKE '%ImportExport%';
```

### 13.3 Check SEP Configuration

```sql
SELECT * FROM general_settings WHERE general_settings_key LIKE 'SEP_%';
```

### 13.4 Check Result Types

```sql
SELECT PkID, Name, QuantityFk, UnitFk FROM ResultType ORDER BY PkID;
```

### 13.5 Cross-DB Mapping Check

```sql
-- Total linked meters
SELECT COUNT(*) AS linked_meters
FROM {BillingDB}.dbo.meter bm
JOIN {SCADADB}.dbo.Device d ON d.PkID = bm.sep_2_w;

-- Meters with LP2 measpoints
SELECT COUNT(DISTINCT d.PkID) AS meters_with_lp2
FROM {BillingDB}.dbo.meter bm
JOIN {SCADADB}.dbo.Device d ON d.PkID = bm.sep_2_w
JOIN {SCADADB}.dbo.MeasPoint mp ON mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%';
```

### 13.6 Find Wrong sep_2_w Mapping

```sql
SELECT m.id, m.serial, m.name, m.sep_2_w, d.Name AS actual_device_name
FROM {BillingDB}.dbo.meter m
LEFT JOIN {SCADADB}.dbo.Device d ON d.PkID = m.sep_2_w
WHERE m.sep_2_w IS NOT NULL
  AND (d.Name IS NULL OR d.Name != m.name)
ORDER BY m.name;
```

### 13.7 Find Duplicate Meter Names

```sql
SELECT name, COUNT(*) AS cnt
FROM {BillingDB}.dbo.meter
GROUP BY name
HAVING COUNT(*) > 1;
```

### 13.8 Find Qualifying Non-Solar LP2 Meters

```sql
SELECT COUNT(*) AS qualifying_meters
FROM Device d
WHERE d.PkID IN (SELECT sep_2_w FROM {BillingDB}.dbo.meter WHERE is_solar = 0)
  AND EXISTS (SELECT 1 FROM MeasPointResType mprt JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
    WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = {Import_RT})
  AND EXISTS (SELECT 1 FROM MeasPointResType mprt JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
    WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = {Export_RT})
  AND NOT EXISTS (SELECT 1 FROM MeasPointResType mprt JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
    WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = {Combined_RT});
```

---

## VOLUME 14 — IMPLEMENTATION CHECKLIST

### Phase 1 — Discovery & Mapping
- [ ] Identify SCADA DB name and billing DB name for the area
- [ ] Find Import and Export ResultType IDs (search by OBIS code in ResultType.Name)
- [ ] Count qualifying non-solar LP2 meters (both channels exist, combined missing)
- [ ] Check if triggers already exist
- [ ] Verify billing meter `sep_2_w` links to correct SCADA Device
- [ ] Document the SEP configuration (current settings)

### Phase 2 — Create Combined Channel Infrastructure
- [ ] Create Quantity row if needed (`Name = 'Energy'`)
- [ ] Create ResultType row for combined (OBIS code 5.8.0)
- [ ] Create V3 trigger on `Result` table
- [ ] Create V3 trigger on `ResultM` table (dual-write if needed)
- [ ] Create MPRT links for all qualifying non-solar LP2 meters

### Phase 3 — Backfill Historical Data
- [ ] Backfill from `Result` (automatic readings)
- [ ] Backfill from `ResultM` (manual readings)
- [ ] Monitor execution time (millions of rows may take hours)

### Phase 4 — Update Billing Configuration
- [ ] Change `SEP_ELECT_RESULT_TYPE` from Import RT to Combined RT
- [ ] Ensure `SEP_SOLAR_RESULT_TYPE` and `SEP_ELECT_SOLAR_RESULT_TYPE` remain unchanged
- [ ] Restart billing engine if required

### Phase 5 — Verification
- [ ] 0 meters missing combined at latest timestamp
- [ ] Spot-check: combined = import + export for multiple meters
- [ ] No negative combined values
- [ ] 0 solar meters linked to combined
- [ ] 0 non-LP2 meters linked to combined
- [ ] Live test: insert a sample reading, confirm trigger creates combined row

---

## VOLUME 15 — ROLLBACK PROCEDURES

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trg_Result_Combine_{AreaName};
DROP TRIGGER IF EXISTS trg_ResultM_Combine_{AreaName};

-- Delete MPRT links
DELETE FROM MeasPointResType WHERE ResultTypeFk = {Combined_RT};

-- Restore SEP config
UPDATE general_settings
SET general_settings_value = {Original_Import_RT}
WHERE general_settings_key = 'SEP_ELECT_RESULT_TYPE';

-- Delete backfilled combined records
DELETE FROM Result WHERE MPRTFk IN (
    SELECT PkID FROM MeasPointResType WHERE ResultTypeFk = {Combined_RT}
);
DELETE FROM ResultM WHERE MPRTFk IN (
    SELECT PkID FROM MeasPointResType WHERE ResultTypeFk = {Combined_RT}
);
```

---

## VOLUME 16 — METERVERSE DESIGN GUIDANCE

### 16.1 Database Architecture Recommendations

For MeterVerse, implement:
- **One SCADA database per area** (isolated, independent sequences)
- **One Billing database** (shared, with `project_id` to filter per area)
- **Consistent table schemas** — Device, MeasPoint, MeasPointResType, ResultType, Result, ResultM identical across all databases
- **`general_settings` table** in each billing database for SEP configuration
- **Entity naming conventions**: `{MeterID}_{Serial}` for devices, `{DeviceName}_LP2` for measpoints

### 16.2 Entity Design Patterns

- **Device Name**: `{meter_number}_{serial}` (e.g., `249CT_83550979`)
- **MeasPoint Name**: `{DeviceName}_{type}` where type = LP2, BP1, BP2, Hourly, W1, W4
- **LP2 = Load Profile 2** — 15-minute interval data (the standard for billing)
- **BP1/BP2 = Block Profile** — aggregated block data (backup)
- **Hourly** — hourly interval data (analysis)

### 16.3 Trigger Architecture

- Always create triggers on **both** `Result` and `ResultM`
- **CROSS APPLY** with exact `ResultTimeStamp` matching
- **No `NESTLEVEL` guard** — `NOT EXISTS` is sufficient for deduplication
- **Process every row** in `inserted` — batch-safe
- **Dual-write** to `ResultM` + `Result` when the UI reads from `ResultM`

### 16.4 SEP Configuration Pattern

| Setting | Non-Solar | Solar |
|---------|-----------|-------|
| ResultType to read | `SEP_ELECT_RESULT_TYPE` = Combined_RT | `SEP_SOLAR_RESULT_TYPE` = Export_RT, `SEP_ELECT_SOLAR_RESULT_TYPE` = Import_RT |
| MeasPoint filter | `SEP_ELECT_MEAS_POINT` = `_LP2` | `SEP_SOLAR_MEAS_POINT` = `_LP2` |

### 16.5 Common Pitfalls

| # | Pitfall | Impact | Prevention |
|---|---------|--------|------------|
| 1 | Trigger only on Result | Manual uploads miss combined | Always create both Result + ResultM triggers |
| 2 | NESTLEVEL > 1 guard | Blocks trigger on SP writes | Remove NESTLEVEL; use NOT EXISTS |
| 3 | OUTER APPLY TOP 1 | Creates combined at wrong timestamp | Use CROSS APPLY with exact match |
| 4 | Linking combined to solar | Double-counts in billing | Filter by `is_solar = 0` |
| 5 | Linking combined to non-LP2 | Data for wrong channel | Filter by `Name LIKE '%LP2%'` |
| 6 | Wrong MPRT Parameters | SEP2 reads wrong OBIS code | Use `5.8.0` for combined |
| 7 | Wrong sep_2_w mapping | Meter reads wrong device data | Verify `meter.name = Device.Name` |
| 8 | Water meters not excluded | Creates useless channels | Filter out names with 'Water' or '_Water1' |

### 16.6 Reverse Engineering Approach for New Databases

When approaching a new area/database, follow this sequence:

```
Step 1: Find the database
    SELECT name FROM sys.databases WHERE name LIKE '%{AreaName}%';

Step 2: Check what tables exist
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';

Step 3: Map ResultTypes to OBIS codes
    SELECT PkID, Name FROM ResultType ORDER BY PkID;
    → Look for patterns: "1.8.0" = Import, "2.8.0" = Export

Step 4: Find existing triggers
    SELECT name FROM sys.triggers WHERE name LIKE '%Combine%' OR name LIKE '%Result%';

Step 5: Check billing DB SEP config
    SELECT * FROM general_settings WHERE general_settings_key LIKE 'SEP_%';

Step 6: Count qualifying meters
    Run the qualifying meters query (Section 13.8)

Step 7: Verify sep_2_w mapping
    Run the wrong mapping query (Section 13.6)
```

### 16.7 Area Parameter Reference

| Parameter | October | New Cairo | SODIC |
|-----------|---------|-----------|-------|
| SCADA DB | `PalmHills_October` | `PalmHills_NewCairo` | `SODIC` |
| Billing DB | `PalmHills_Billing` | `PalmHills_Billing_NewCairo` | `Sodic_billing` |
| Import RT (1.8.0) | **8** | **4** | **6** |
| Export RT (2.8.0) | **7** | **3** | **5** |
| Combined RT (5.8.0) | **10** | **25** | **10** |
| Quantity PkID (5.8.0) | 6 | 6 | **10** (created as `5.8.0 Energy Combined`) |
| Billing Mode | DIFF | VALUE | DIFF |
| Meter Filter | `%LP2%` | `%LP2%` | `%LP2%` |
| Solar exclusion | `is_solar = 0` | `is_solar = 0` | `is_solar = 0` |
| Project ID | **1** | **2** | **3** (inferred) |
| Trigger suffix | `ImportExport` | `NC` | `Sum180_280_5_8_0` |
| DeviceSumConfig filter | No | No | Removed (was present initially) |
| Result table schema | MPRTFk-based | MPRTFk-based | MPRTFk-based |
| SEP_ELECT_RESULT_TYPE old | 8 | 4 | **6** |
| SEP_ELECT_RESULT_TYPE new | 10 | 25 | **10** |
| SEP_SOLAR_RESULT_TYPE | 7 | 3 | **5** (unchanged) |
| SEP_ELECT_SOLAR_RESULT_TYPE | 8 | 4 | **6** (unchanged) |

---

## VOLUME 17 — SODIC IMPLEMENTATION EXPERIENCE (FULL CASE STUDY)

### 17.1 Discovery Phase

**Databases:**
- SCADA: `SODIC` (1,583,371 Result rows, 133,040 ResultM rows)
- Billing: `Sodic_billing`
- Additional: `Energy360_SODIC` (not relevant — contains aggregated data)

**Initial guess (from YAML config):**
- Export RT = 5 (SEP_SOLAR_RESULT_TYPE)
- Import RT = 6 (SEP_ELECT_RESULT_TYPE)
- Combined RT = 10 (unused)

**Discovery confirmed:**
- RT=5: `( 2.8.x ) Negative active energy A-` → Export (227 MPRT links)
- RT=6: `( 1.8.x ) Positive active energy A+` → Import (227 MPRT links)
- RT=1003: `(15.8.0)Active Energy Combined (I+AI+I-AI)` → old test combined (0 data rows)
- Existing trigger: `trg_Result_AutoSum180_280` on Result — **UPDATES** RT=6 in-place (destructive, overwrites original Import data)

**436 meters total (1 solar, 435 non-solar), 306 qualify for combined.**

### 17.2 Schema Differences from October/New Cairo

**SODIC uses the same MPRTFk-based schema** as October/New Cairo (not the alternative MeterFk/ChannelFk schema). All three areas share:

```sql
Result (MPRTFk INT, ResultTimeStamp DATETIME, ResultValue FLOAT, Status INT)
ResultM (same)
```

**Key difference**: SODIC has a `DeviceSumConfig` table that controls which devices participate in the combined sum. The old trigger used `INNER JOIN DeviceSumConfig` to restrict which meters get combined.

### 17.3 Failed Attempts (Lessons Learned)

**❌ Attempt 1: Applied October/New Cairo V3 trigger template incorrectly**

The first trigger attempt copied the October pattern using `MeterFk`, `ChannelFk`, and `ResultTypeFk` — columns that don't exist in SODIC's `Result` table. This caused "Invalid column name" errors.

**Root cause**: Assumed all areas have identical column structure. SODIC uses the same MPRTFk-based schema as October/NC, so the trigger pattern was actually correct in syntax but wrong in approach (see Attempt 2).

**❌ Attempt 2: GROUP BY ChannelFk in trigger (wrong for SODIC)**

The second trigger wrote:
```sql
GROUP BY i.MeterFk, i.ChannelFk, i.[Timestamp]
HAVING COUNT(DISTINCT i.ResultTypeFk) = 2
```

This assumed Import and Export share the same ChannelFk. In SODIC, Import (RT=6) has ChannelFk=6 and Export (RT=5) has ChannelFk=5. Since they're on different channels, the `GROUP BY ChannelFk` would never find both RTs in the same group → trigger would never fire.

**❌ Attempt 3: Dynamic SQL with multi-line EXEC()**

The trigger creation used `EXEC('CREATE TRIGGER ...')` with multi-line strings. SSMS rejected this with "Incorrect syntax near" errors because line breaks inside EXEC() are not allowed.

**✅ Fix**: Created triggers with straight `CREATE TRIGGER` statements separated by `GO` batch separators.

**❌ Attempt 4: Quantity auto-assigned wrong PkID**

Creating `Quantity` without specifying PkID resulted in `PkID=1005` instead of the desired `PkID=10`. Had to delete and re-insert with `SET IDENTITY_INSERT ON`.

**✅ Fix**: Always use `SET IDENTITY_INSERT Quantity ON` and specify PkID explicitly.

**❌ Attempt 5: DeviceSumConfig filter excluded chillers**

The first correct trigger included `JOIN DeviceSumConfig dsc ON dsc.DeviceFk = mp.DeviceFk`. This matched the old trigger's behavior but excluded meters NOT in DeviceSumConfig — including the 4 chillers (Chiller1-4) which have data but no combined.

The user decided to follow the New Cairo pattern (no DeviceSumConfig filter), so the trigger was recreated without it and backfill was re-run.

### 17.4 Correct SODIC Implementation Steps

#### Step 1 — Create Quantity PkID=10

```sql
SET IDENTITY_INSERT SODIC.dbo.Quantity ON;
INSERT INTO SODIC.dbo.Quantity (PkID, Name, Medium, QuanType, UnitFk, MeasMethod, MeasRegion, MeasType, EDIS)
VALUES (10, '5.8.0 Energy Combined', 0, 0, 3, 0, 0, 1, '5.8.0');
SET IDENTITY_INSERT SODIC.dbo.Quantity OFF;
```

#### Step 2 — Create ResultType PkID=10

```sql
SET IDENTITY_INSERT SODIC.dbo.ResultType ON;
INSERT INTO SODIC.dbo.ResultType (PkID, Name, QuantityFk, UnitFk, TariffFk)
VALUES (10, '5.8.0 Energy Combined', 10, 3, 1);
SET IDENTITY_INSERT SODIC.dbo.ResultType OFF;
```

#### Step 3 — Create MPRT Links for LP2 meters

```sql
INSERT INTO SODIC.dbo.MeasPointResType (MeasPointFk, ResultTypeFk, Period, PeriodUnit, CorrectionFactor, 
       Class, Instance, MethodType, Method, ParametersType, Parameters, Type)
SELECT mp.PkID, 10, 1, 3, 1, 'SEP2RegisterProfile', '99.2.0', 2, 'Read', 16,
       '<array><string>1-0:5.8.0*255</string></array><datetime>@from</datetime><datetime>@to</datetime><boolean>@demand</boolean>', 0
FROM SODIC.dbo.MeasPoint mp
WHERE mp.Name LIKE '%LP2%'
  AND EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 5)
  AND EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 6)
  AND NOT EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 10);
```

Result: **227 MPRT entries** created (all LP2, no solar filter — all LP2 meters with both RT=5 and RT=6).

#### Step 4 — Drop old destructive trigger

```sql
IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_Result_AutoSum180_280')
    DROP TRIGGER trg_Result_AutoSum180_280;
```

#### Step 5 — Create V3 trigger on Result

```sql
USE SODIC;
GO
CREATE TRIGGER trg_Result_Sum180_280_5_8_0 ON Result
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Result (MPRTFk, ResultTimeStamp, ResultValue, Status)
    SELECT DISTINCT
        mpr10.PkID,
        i.ResultTimeStamp,
        ISNULL((SELECT r5.ResultValue FROM Result r5 JOIN MeasPointResType mpr5 ON mpr5.PkID = r5.MPRTFk AND mpr5.ResultTypeFk = 5 WHERE mpr5.MeasPointFk = mpr.MeasPointFk AND r5.ResultTimeStamp = i.ResultTimeStamp), 0)
        +
        ISNULL((SELECT r6.ResultValue FROM Result r6 JOIN MeasPointResType mpr6 ON mpr6.PkID = r6.MPRTFk AND mpr6.ResultTypeFk = 6 WHERE mpr6.MeasPointFk = mpr.MeasPointFk AND r6.ResultTimeStamp = i.ResultTimeStamp), 0),
        1
    FROM Inserted i
    JOIN MeasPointResType mpr ON mpr.PkID = i.MPRTFk AND mpr.ResultTypeFk IN (5, 6)
    JOIN MeasPoint mp ON mp.PkID = mpr.MeasPointFk
    JOIN MeasPointResType mpr10 ON mpr10.MeasPointFk = mpr.MeasPointFk AND mpr10.ResultTypeFk = 10
    WHERE EXISTS (SELECT 1 FROM Result r5 JOIN MeasPointResType mpr5 ON mpr5.PkID = r5.MPRTFk AND mpr5.ResultTypeFk = 5 WHERE mpr5.MeasPointFk = mpr.MeasPointFk AND r5.ResultTimeStamp = i.ResultTimeStamp)
    AND EXISTS (SELECT 1 FROM Result r6 JOIN MeasPointResType mpr6 ON mpr6.PkID = r6.MPRTFk AND mpr6.ResultTypeFk = 6 WHERE mpr6.MeasPointFk = mpr.MeasPointFk AND r6.ResultTimeStamp = i.ResultTimeStamp)
    AND NOT EXISTS (SELECT 1 FROM Result r10 JOIN MeasPointResType mpr10x ON mpr10x.PkID = r10.MPRTFk AND mpr10x.ResultTypeFk = 10 WHERE mpr10x.MeasPointFk = mpr.MeasPointFk AND r10.ResultTimeStamp = i.ResultTimeStamp);
END;
```

#### Step 6 — Create V3 trigger on ResultM

Same pattern as Step 5 but targeting `ResultM` table.

#### Step 7 — Backfill historical data

Backfill from `Result`: **66,004 rows**
Backfill from `ResultM`: **66,119 rows**
Total: **132,123 combined rows** across 227 meters with 1,236 distinct timestamps (2023-05-23 to 2026-07-13).

#### Step 8 — Update billing config

```sql
UPDATE Sodic_billing.dbo.general_settings SET general_settings_value = '10'
WHERE general_settings_key = 'SEP_ELECT_RESULT_TYPE';
```

### 17.5 Verification Results

| Check | Result |
|-------|--------|
| All RT=10 MPRTs on LP2 only | ✅ 227/227 |
| LP2 meters missing RT=10 | ✅ 0 missing |
| Meters with perfect data (RT5=RT6=RT10) | ✅ ~140 meters |
| Timestamp mismatch (RT5≠RT6, RT10 follows RT5) | ⚠️ 7 meters (expected — historical mismatch) |
| No SCADA data (RT5=RT6=0) | ⚠️ 68 meters (no action needed — no data to combine) |
| Last timestamps match across all RTs | ✅ All active meters |
| Combined = Import + Export arithmetic | ✅ Verified spot-check |

**6 New Cairo bugs verified as fixed in SODIC:**

| # | Bug (New Cairo) | SODIC Fix | Status |
|---|----------------|-----------|--------|
| 1 | Duplicate Parameters (stored 1.8.0/2.8.0 instead of 5.8.0) | Parameters = `1-0:5.8.0*255` | ✅ |
| 2 | Only last value, not all timestamps | Exact timestamp matching via `CROSS APPLY` | ✅ |
| 3 | Import not calculated in combined | Trigger sums `SELECT RT=5 + SELECT RT=6` | ✅ |
| 4 | 5.8.0 only has last timestamp | Backfill created 132k rows across 1,236 dates | ✅ |
| 5 | Auto readings didn't trigger combined (staggered arrival) | Subqueries read from `Result` table, not `Inserted` only | ✅ |
| 6 | Delete+re-upload didn't recalculate | `NOT EXISTS` check allows re-creation on re-upload | ✅ |

### 17.6 SODIC-Specific Findings

**DeviceSumConfig table**: SODIC has a `DeviceSumConfig` table that the old trigger used to restrict which devices get summed. This was removed from the new triggers to match the October/New Cairo pattern (all LP2 meters).

**Chiller meters**: 4 chillers (Chiller1-4) have 493 matching RT5+RT6 rows each with perfect timestamp alignment. They were initially excluded by `DeviceSumConfig`. After removing the filter, they now correctly have combined data.

**BELTONE anomaly**: BELTONE meter has RT5=428 rows but RT6=1,219 rows. Only 428 matching timestamps produced combined rows. The trigger will fill future pairs automatically.

**68 meters with zero SCADA data**: These meters are registered in the system and have MPRT links for RT=10, but SCADA never sent any readings (RT5=0 and RT6=0). No combined data exists because there's nothing to combine. The trigger will create combined rows if SCADA starts sending data.

### 17.7 SODIC CSV Analysis

A complete analysis was written to `D:\meter\SODIC_Meter_Analysis.csv` containing all 227 LP2 meters with:
- Meter name, DeviceFk, InDeviceSumConfig status
- RT5, RT6, RT10 row counts
- Issue category (No SCADA data / Timestamp mismatch / Excluded from DeviceSumConfig)
- Problem reason in plain English

---

## APPENDIX A — INFORMATION GAPS (NEED YOUR INPUT)

To complete this Bible for MeterVerse, I need the following information. If you can provide database schemas, code, or screenshots, I'll fill these gaps:

### A.1 Symbiot SCADA Configuration
[ ] SEP2 polling schedule — how often does Symbiot read each meter? Where is this configured?
[ ] Device registration process — how are new meters added to Symbiot?
[ ] Protocol configuration — any connection details for SEP2 communication

### A.2 All OBIS Codes / Channels Per Area
[ ] Complete list of all ResultTypes in October DB (query: `SELECT * FROM ResultType`)
[ ] Complete list of all ResultTypes in New Cairo DB
[ ] Any other channels beyond 1.8.0, 2.8.0, 5.8.0, 16.8.0, 15.8.0

### A.3 Billing Engine Details
[ ] Java code or pseudocode for how the billing engine queries SCADA data
[ ] How does the billing engine know which meters to process each cycle?
[ ] Is the billing formula (DIFF vs VALUE) controlled by config or hard-coded?
[ ] Where does `start_value` come from for New Cairo?
[ ] How does the billing engine handle `ChangedResult` / corrections?

### A.4 Meter Reading UI
[ ] Which table/query does the UI use to display readings?
[ ] API endpoint paths for the meter reading page
[ ] Screenshot of the meter reading page (shows columns, layout, filters)
[ ] Does the UI show Import and Export separately, or just the combined value?

### A.5 Solar Billing
[ ] How does the billing engine determine solar tariff vs non-solar tariff?
[ ] Is there a separate `monthly_reading_solar` table?
[ ] How are solar export credits tracked?

### A.6 Billing Database Schema
[ ] Complete schema of `monthly_reading` table
[ ] Complete schema of `invoice` table
[ ] Complete schema of `tariff` and `tariff_rate` tables
[ ] Any other relevant billing tables I might have missed
