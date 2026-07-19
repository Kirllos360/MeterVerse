# MeterVerse — Engineering Agent Instructions

## Project Context

This project implements "combined" (5.8.0 = Import + Export) energy channels across three areas:
- **October**: ✅ Live (RT=10 = RT=8 + RT=7, DB: `PalmHills_October`)
- **New Cairo**: ✅ Live (RT=25 = RT=4 + RT=3, DB: `PalmHills_NewCairo`)
- **SODIC**: ✅ Live (RT=10 = RT=6 + RT=5, DB: `SODIC`)

All areas use the **MPRTFk-based schema** (`Result` = `MPRTFk, ResultTimeStamp, ResultValue, Status`).

## Key Files

| File | Purpose |
|------|---------|
| `PALMHILLS_ENERGY_SYSTEM_COMPLETE_REFERENCE.md` | 17-volume master reference (MeterVerse Bible) |
| `reverse_engineer_system.sql` | Template: generic 18-set reverse engineering queries |
| `discovery_all.sql` | Generic discovery script for any new area |
| `discover_everything.sql` | Automated one-shot discovery (all areas) |
| `sodic_discovery.sql` | SODIC-specific discovery (template for next area) |
| `sodic_implement.sql` | SODIC implementation (canonical pattern) |
| `SODIC_Meter_Analysis.csv` | Per-meter analysis of combined data health |

## Schema Differences Between Areas

**October/New Cairo** and **SODIC** all use identical `Result` schema (MPRTFk-based). No area uses `MeterFk`/`ChannelFk`/`ResultTypeFk` columns in Result.

The only SODIC-specific difference is `DeviceSumConfig` table — controls which devices the old destructive trigger processed. Our V3 triggers do NOT use DeviceSumConfig.

## Common Omissions / Pattern Deviations

### Quantity INSERT requires all NOT NULL columns
```sql
-- WRONG (missing Medium, QuanType):
INSERT INTO Quantity (PkID, Name, UnitFk) VALUES (10, 'Energy', 3);
-- RIGHT:
INSERT INTO Quantity (PkID, Name, Medium, QuanType, UnitFk, MeasMethod, MeasRegion, MeasType, EDIS)
VALUES (10, '5.8.0 Energy Combined', 0, 0, 3, 0, 0, 1, '5.8.0');
```

### Always use SET IDENTITY_INSERT for Quantity and ResultType
```sql
SET IDENTITY_INSERT SODIC.dbo.Quantity ON;
INSERT INTO ... (PkID = 10 ...);
SET IDENTITY_INSERT SODIC.dbo.Quantity OFF;
```
Without this, auto-assigned PkID (e.g., 1005) will not match the target RT number.

### CROSS-JOIN pattern (not GROUP BY by ChannelFk)
SODIC uses MPRTFk-based linking — Import and Export are on different MPRT rows.
The trigger must join via MeasPointFk (through MPRT), not by ChannelFk.
```sql
-- CORRECT pattern:
SELECT ISNULL((SELECT ResultValue FROM Result r5
               JOIN MeasPointResType mpr5 ON mpr5.PkID = r5.MPRTFk AND mpr5.ResultTypeFk = {ExportRT}
               WHERE mpr5.MeasPointFk = mpr.MeasPointFk AND r5.ResultTimeStamp = i.ResultTimeStamp), 0)
       +
       ISNULL((SELECT ResultValue FROM Result r6 ... mpr6.ResultTypeFk = {ImportRT} ...), 0)
```

### V3 Trigger differences from V2

| Aspect | V2 (old Oct/NC pattern) | V3 (new universal pattern) |
|--------|------------------------|---------------------------|
| Source of counterpart reading | `Inserted` only | `Result` table (handles staggered arrival) |
| Update strategy | `CROSS APPLY` | Subqueries with `ISNULL(..., 0)` |
| Guard | `@@NESTLEVEL` | `NOT EXISTS` check for combined RT |
| Filter | `DeviceSumConfig` (SODIC only) | None (all LP2 meters) |
| Status | 0 | 1 |

## AI-Managed Workflow

This project follows an AI-managed (not AI-assisted) workflow:

1. **Every Push/PR** triggers: Build → Tests → Screenshots → Visual Regression → DeepSeek Review → Reports
2. **All reports** commit to `docs/reviews/` and `docs/screenshots/`
3. **`.ai/memory/`** tracks project state, sprints, known issues, design rules
4. **PROJECT_STATE.md** must be updated before any AI agent begins work
5. **DeepSeek** generates 8 reports per PR (architecture, UI, UX, a11y, perf, security, quality, debt)
6. **ChatGPT** conversations start by reading the latest repository state from GitHub

### First Message in a New ChatGPT Chat
```
Review the latest state of MeterVerse from the GitHub repository.
Read PROJECT_STATE.md, CURRENT_SPRINT.md, DESIGN_REVIEW.md, 
ARCHITECTURE_REVIEW.md, ROADMAP.md, recent screenshot galleries, 
and recent review reports. Identify regressions, inconsistencies, 
architectural risks, UI issues, backend issues, and propose the 
next enterprise sprint.
```

## Process for New Area

1. Run `reverse_engineer_system.sql` Sets 1-4 to map databases, schema, ResultTypes
2. Run `discovery_all.sql` for comprehensive discovery
3. Create Quantity + ResultType (use `SET IDENTITY_INSERT`!)
4. Drop any existing destructive trigger on the Combine RT
5. Create MPRT links for the new combined RT
6. Create V3 triggers (both Result + ResultM)
7. Backfill historical data (after MPRT links, so triggers don't double-fire)
8. Update SEP config in billing DB
9. Verify with spot-check queries

## Verification Checklist

- [ ] Combined = Import + Export at matching timestamps
- [ ] All LP2 meters with both Import+Export have combined MPRT link
- [ ] No data loss on original Import/Export RTs
- [ ] SEP config updated
- [ ] Manual readings (ResultM) also produce combined rows in both ResultM and Result
- [ ] Delete + re-upload recalculates combined correctly

## Rule: Know the schema before coding

DO NOT assume column names from one area apply to another. Always run schema discovery first (`reverse_engineer_system.sql` Set 2). The three common patterns seen so far:

1. **MPRTFk-based**: `Result(MPRTFk, ResultTimeStamp, ResultValue, Status)` — October, New Cairo, SODIC
2. **MeterFk/ChannelFk-based**: `Result(MeterFk, ChannelFk, ResultTypeFk, ...)` — hypothetical, not yet seen
3. **Direct FK**: Some other schema — must discover first
