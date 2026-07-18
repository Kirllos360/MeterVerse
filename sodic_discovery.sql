/*==============================================================================
  SODIC — DISCOVERY QUERIES (completed — kept for reference)
  ==============================================================================
  This discovery was already completed and SODIC is LIVE.
  See Volume 17 of PALMHILLS_ENERGY_SYSTEM_COMPLETE_REFERENCE.md for results.
  
  Keep this file for the NEXT area — use it as a template for discovery:
    1. Change database names at the top
    2. Run ONE query at a time in SSMS
    3. Map ResultTypes to find Import/Export/Combined RT numbers
  
  SODIC confirmed results (for reference):
    SCADA  = SODIC  |  Billing = Sodic_billing
    Export RT = 5   |  Import RT = 6  |  Combined RT = 10
==============================================================================*/


/*==============================================================================
  STEP 1 — Confirm databases exist
==============================================================================*/
PRINT '=== STEP 1: Databases ===';
SELECT name FROM sys.databases
WHERE name LIKE '%SODIC%' OR name LIKE '%Sodic%' OR name LIKE '%sodic%'
ORDER BY name;


/*==============================================================================
  STEP 2 — List ALL tables in SODIC database to confirm it's the SCADA DB
==============================================================================*/
USE SODIC;  -- change if different

PRINT '=== STEP 2: Tables in SODIC ===';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;


/*==============================================================================
  STEP 3 — All ResultTypes (THIS IS THE KEY OUTPUT)
  ==============================================================================
  Shows every reading channel. Look for:
    - "1.8.0" in Name → Import channel
    - "2.8.0" in Name → Export channel
    - "5.8.0" in Name → Combined channel (may not exist yet)
==============================================================================*/
PRINT '=== STEP 3: All ResultTypes ===';
SELECT PkID, Name, QuantityFk, UnitFk, TariffFk
FROM ResultType
ORDER BY PkID;


/*==============================================================================
  STEP 4 — MPRT Distribution (how many measpoints per channel)
  ==============================================================================
  Shows which ResultTypes are actually in use and how many measpoints link to each
==============================================================================*/
PRINT '=== STEP 4: MPRT Counts per ResultType ===';
SELECT mprt.ResultTypeFk, rt.Name, COUNT(*) AS MPRT_Count
FROM MeasPointResType mprt
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
GROUP BY mprt.ResultTypeFk, rt.Name
ORDER BY mprt.ResultTypeFk;


/*==============================================================================
  STEP 5 — MeasPoint type breakdown
==============================================================================*/
PRINT '=== STEP 5: MeasPoint Type Distribution ===';
SELECT
    CASE
        WHEN Name LIKE '%LP2%' THEN 'LP2'
        WHEN Name LIKE '%BP1%' THEN 'BP1'
        WHEN Name LIKE '%BP2%' THEN 'BP2'
        WHEN Name LIKE '%Hourly%' THEN 'Hourly'
        WHEN Name LIKE '%W1%' OR Name LIKE '%Water%' OR Name LIKE '%LP2_W%' THEN 'Water'
        WHEN Name LIKE '%W4%' THEN 'Water'
        ELSE 'Other'
    END AS Type,
    COUNT(*) AS Count
FROM MeasPoint
GROUP BY
    CASE
        WHEN Name LIKE '%LP2%' THEN 'LP2'
        WHEN Name LIKE '%BP1%' THEN 'BP1'
        WHEN Name LIKE '%BP2%' THEN 'BP2'
        WHEN Name LIKE '%Hourly%' THEN 'Hourly'
        WHEN Name LIKE '%W1%' OR Name LIKE '%Water%' OR Name LIKE '%LP2_W%' THEN 'Water'
        WHEN Name LIKE '%W4%' THEN 'Water'
        ELSE 'Other'
    END
ORDER BY Type;


/*==============================================================================
  STEP 6 — Existing triggers
==============================================================================*/
PRINT '=== STEP 6: Triggers ===';
SELECT name, OBJECT_NAME(parent_id) AS TableName,
       is_disabled, create_date, modify_date
FROM sys.triggers
ORDER BY name;

PRINT '--- Trigger code ---';
SELECT name, OBJECT_DEFINITION(object_id) AS TriggerCode
FROM sys.triggers
ORDER BY name;


/*==============================================================================
  STEP 7 — Entity chain sample
  ==============================================================================
  Shows billing meters linked to Devices with their MeasPoints and MPRT links
==============================================================================*/
PRINT '=== STEP 7: Entity Chain (billing meter → Device → MeasPoint → MPRT) ===';
SELECT TOP 30
    bm.id AS BillingMeterID, bm.serial, bm.name AS MeterName,
    CASE WHEN bm.is_solar = 1 THEN 'SOLAR' ELSE 'NON-SOLAR' END AS MeterType,
    d.PkID AS DeviceID, d.Name AS DeviceName,
    mp.PkID AS MeasPointID, mp.Name AS MeasPointName,
    mprt.PkID AS MPRT_ID, mprt.ResultTypeFk, rt.Name AS ChannelName
FROM Sodic_billing.dbo.meter bm
JOIN SODIC.dbo.Device d ON d.PkID = bm.sep_2_w
JOIN SODIC.dbo.MeasPoint mp ON mp.DeviceFk = d.PkID
JOIN SODIC.dbo.MeasPointResType mprt ON mprt.MeasPointFk = mp.PkID
JOIN SODIC.dbo.ResultType rt ON rt.PkID = mprt.ResultTypeFk
WHERE bm.status = 'ACTIVE'
ORDER BY bm.serial, mp.Name, mprt.ResultTypeFk;


/*==============================================================================
  STEP 8 — Meter stats from billing
==============================================================================*/
USE Sodic_billing;  -- change if different

PRINT '=== STEP 8: Meter Stats ===';
SELECT
    COUNT(*) AS TotalMeters,
    SUM(CASE WHEN is_solar = 1 THEN 1 ELSE 0 END) AS Solar,
    SUM(CASE WHEN is_solar = 0 THEN 1 ELSE 0 END) AS NonSolar,
    SUM(CASE WHEN sep_2_w IS NOT NULL THEN 1 ELSE 0 END) AS LinkedToSCADA,
    SUM(CASE WHEN sep_2_w IS NULL THEN 1 ELSE 0 END) AS NotLinked
FROM meter;

SELECT DISTINCT project_id FROM meter;
SELECT DISTINCT status FROM meter;


/*==============================================================================
  STEP 9 — Confirm Import/Export RT numbers
  ==============================================================================
  Based on SEP config: SEP_ELECT_RESULT_TYPE=6, SEP_SOLAR_RESULT_TYPE=5
  We expect: Import=RT6, Export=RT5
  This query shows which LP2 measpoints have RT=5 and RT=6
==============================================================================*/
USE SODIC;

PRINT '=== STEP 9: LP2 meters with RT=5 (likely Export) ===';
SELECT COUNT(*) AS LP2_With_RT5
FROM MeasPointResType mprt
JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk AND mp.Name LIKE '%LP2%'
WHERE mprt.ResultTypeFk = 5;

PRINT '=== LP2 meters with RT=6 (likely Import) ===';
SELECT COUNT(*) AS LP2_With_RT6
FROM MeasPointResType mprt
JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk AND mp.Name LIKE '%LP2%'
WHERE mprt.ResultTypeFk = 6;

PRINT '=== LP2 meters with BOTH RT=5 AND RT=6 ===';
SELECT COUNT(DISTINCT mp.DeviceFk) AS MetersWithBoth
FROM MeasPointResType mprt5
JOIN MeasPoint mp5 ON mp5.PkID = mprt5.MeasPointFk AND mp5.Name LIKE '%LP2%'
JOIN MeasPointResType mprt6 ON mprt6.MeasPointFk = mp5.PkID AND mprt6.ResultTypeFk = 6
WHERE mprt5.ResultTypeFk = 5;

PRINT '=== Sample: Device names with both RT=5 and RT=6 ===';
SELECT TOP 20 d.Name, d.PkID
FROM Device d
WHERE EXISTS (SELECT 1 FROM MeasPointResType mprt JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
              WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = 5)
  AND EXISTS (SELECT 1 FROM MeasPointResType mprt JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
              WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = 6)
  AND NOT EXISTS (SELECT 1 FROM MeasPointResType mprt JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
              WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = 10)
ORDER BY d.Name;


/*==============================================================================
  STEP 10 — Check SEP config in billing DB
==============================================================================*/
USE Sodic_billing;

PRINT '=== STEP 10: Full SEP Config ===';
SELECT id, general_settings_key, general_settings_value
FROM general_settings
WHERE general_settings_key LIKE 'SEP_%'
ORDER BY general_settings_key;

-- Also show other non-SEP settings for context
PRINT '=== Other settings ===';
SELECT id, general_settings_key, general_settings_value
FROM general_settings
WHERE general_settings_key NOT LIKE 'SEP_%'
ORDER BY general_settings_key;


/*==============================================================================
  STEP 11 — Check if billing tables exist
==============================================================================*/
PRINT '=== STEP 11: Billing Tables ===';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;


/*==============================================================================
  STEP 12 — Data volumes
==============================================================================*/
USE SODIC;

PRINT '=== STEP 12: Data Volumes ===';
SELECT 'Result' AS TableName, COUNT(*) AS RowCount FROM Result
UNION ALL
SELECT 'ResultM', COUNT(*) FROM ResultM;

PRINT '--- Result date range ---';
SELECT MIN(ResultTimeStamp) AS Earliest, MAX(ResultTimeStamp) AS Latest
FROM Result;

PRINT '--- Result rows per ResultType ---';
SELECT mprt.ResultTypeFk, rt.Name, COUNT(*) AS RowCount
FROM Result r
JOIN MeasPointResType mprt ON mprt.PkID = r.MPRTFk
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
GROUP BY mprt.ResultTypeFk, rt.Name
ORDER BY mprt.ResultTypeFk;

PRINT '--- MPRT Parameters sample (LP2 only) ---';
SELECT DISTINCT TOP 10
    rt.Name AS ChannelName,
    LEFT(mprt.Parameters, 200) AS Parameters
FROM MeasPointResType mprt
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
WHERE mp.Name LIKE '%LP2%';


/*==============================================================================
  STEP 13 — Count qualifying meters for combined channel
  ==============================================================================
  These are non-solar LP2 meters that have Import+Export but NO combined yet
==============================================================================*/
PRINT '=== STEP 13: Qualifying non-solar LP2 meters ===';
SELECT COUNT(*) AS QualifyingForCombined
FROM Sodic_billing.dbo.meter bm
JOIN SODIC.dbo.Device d ON d.PkID = bm.sep_2_w
WHERE bm.is_solar = 0
  AND EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType mprt
              JOIN SODIC.dbo.MeasPoint mp ON mp.PkID = mprt.MeasPointFk
              WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = 5)
  AND EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType mprt
              JOIN SODIC.dbo.MeasPoint mp ON mp.PkID = mprt.MeasPointFk
              WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = 6)
  AND NOT EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType mprt
              JOIN SODIC.dbo.MeasPoint mp ON mp.PkID = mprt.MeasPointFk
              WHERE mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%' AND mprt.ResultTypeFk = 10);
-- (Assuming combined RT will be 10 — change if you pick a different number)


/*==============================================================================
  SUMMARY — After running all queries, you'll know:
  ==============================================================================
  1. ✓ Database names confirmed
  2. ✓ All tables exist and match expected schema
  3. ✓ All ResultTypes mapped (Import=RT?, Export=RT?, Combined=NEW RT)
  4. ✓ MPRT distribution (how many meters per channel)
  5. ✓ Existing triggers (probably none for combined)
  6. ✓ Entity chain (meters → devices → measpoints)
  7. ✓ Solar vs non-solar meter counts
  8. ✓ SEP configuration
  9. ✓ Data volumes
  10. ✓ Qualifying meters count

  Based on YAML config, I expect:
    - Import RT = 6    (SEP_ELECT_RESULT_TYPE = 6, SEP_ELECT_SOLAR_RESULT_TYPE = 6)
    - Export RT = 5    (SEP_SOLAR_RESULT_TYPE = 5)
    - Combined RT = TBD (need to pick an unused number, e.g., 10)
==============================================================================*/
