/*==============================================================================
  SODIC — CORRECT FINAL IMPLEMENTATION
  ==============================================================================
  THIS IS THE CANONICAL implementation that was actually used.
  It differs from October/New Cairo in important ways:
    - Uses MPRTFk-based linking (same schema as October/NC)
    - Uses CROSS-joins timestamp matching (no MeterFk/ChannelFk columns)
    - NO DeviceSumConfig filter (all LP2 meters, matching New Cairo pattern)
  
  ⚠️ DO NOT assume October/New Cairo patterns apply directly to SODIC.
     Always verify schema first (see sodic_discovery.sql).
  
  Confirm these RT numbers before running:
    Export RT = 5   (SEP_SOLAR_RESULT_TYPE)
    Import RT = 6   (SEP_ELECT_RESULT_TYPE)
    Combined RT = 10 (newly created, unused before)
==============================================================================*/

USE SODIC;
GO


/*==============================================================================
  PHASE 1 — Create Quantity & ResultType for Combined (5.8.0)
  ==============================================================================*/
PRINT '=== PHASE 1: Create Quantity & ResultType ===';

-- Quantity must use SET IDENTITY_INSERT to ensure PkID=10
SET IDENTITY_INSERT SODIC.dbo.Quantity ON;
IF NOT EXISTS (SELECT 1 FROM SODIC.dbo.Quantity WHERE PkID = 10)
    INSERT INTO SODIC.dbo.Quantity (PkID, Name, Medium, QuanType, UnitFk, MeasMethod, MeasRegion, MeasType, EDIS)
    VALUES (10, '5.8.0 Energy Combined', 0, 0, 3, 0, 0, 1, '5.8.0');
SET IDENTITY_INSERT SODIC.dbo.Quantity OFF;

-- ResultType must use SET IDENTITY_INSERT to ensure PkID=10
SET IDENTITY_INSERT SODIC.dbo.ResultType ON;
IF NOT EXISTS (SELECT 1 FROM SODIC.dbo.ResultType WHERE PkID = 10)
    INSERT INTO SODIC.dbo.ResultType (PkID, Name, QuantityFk, UnitFk, TariffFk)
    VALUES (10, '5.8.0 Energy Combined', 10, 3, 1);
SET IDENTITY_INSERT SODIC.dbo.ResultType OFF;

PRINT 'Quantity/ResultType PkID=10 created.';


/*==============================================================================
  PHASE 2 — Drop old destructive trigger (if exists)
  ==============================================================================
  The old trigger trg_Result_AutoSum180_280 does an UPDATE (not INSERT) of
  RT=6 in-place, which DESTROYS the original Import data. Must drop it.
==============================================================================*/
PRINT '=== PHASE 2: Drop old trigger ===';

IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_Result_AutoSum180_280')
BEGIN
    DROP TRIGGER trg_Result_AutoSum180_280;
    PRINT 'Dropped old destructive trigger trg_Result_AutoSum180_280.';
END;


/*==============================================================================
  PHASE 3 — Create V3 triggers (no DeviceSumConfig filter)
  ==============================================================================
  Key design choices:
  1. No DeviceSumConfig join — all LP2 meters get combined (matching NC pattern)
  2. Subqueries read from Result table (not Inserted) — handles staggered arrival
  3. NOT EXISTS check — prevents duplicates on re-upload
  4. Status = 1 (not 0) — matches October/New Cairo V3 pattern
==============================================================================*/
PRINT '=== PHASE 3: Create triggers ===';

-- Drop existing if re-running
DROP TRIGGER IF EXISTS trg_Result_Sum180_280_5_8_0;
DROP TRIGGER IF EXISTS trg_ResultM_Sum180_280_5_8_0;
GO

-- Trigger on Result (automatic readings)
CREATE TRIGGER trg_Result_Sum180_280_5_8_0 ON Result
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Result (MPRTFk, ResultTimeStamp, ResultValue, Status)
    SELECT DISTINCT
        mpr10.PkID,
        i.ResultTimeStamp,
        ISNULL((SELECT r5.ResultValue FROM Result r5
                JOIN MeasPointResType mpr5 ON mpr5.PkID = r5.MPRTFk AND mpr5.ResultTypeFk = 5
                WHERE mpr5.MeasPointFk = mpr.MeasPointFk AND r5.ResultTimeStamp = i.ResultTimeStamp), 0)
        +
        ISNULL((SELECT r6.ResultValue FROM Result r6
                JOIN MeasPointResType mpr6 ON mpr6.PkID = r6.MPRTFk AND mpr6.ResultTypeFk = 6
                WHERE mpr6.MeasPointFk = mpr.MeasPointFk AND r6.ResultTimeStamp = i.ResultTimeStamp), 0),
        1
    FROM Inserted i
    JOIN MeasPointResType mpr ON mpr.PkID = i.MPRTFk AND mpr.ResultTypeFk IN (5, 6)
    JOIN MeasPoint mp ON mp.PkID = mpr.MeasPointFk
    JOIN MeasPointResType mpr10 ON mpr10.MeasPointFk = mpr.MeasPointFk AND mpr10.ResultTypeFk = 10
    WHERE EXISTS (SELECT 1 FROM Result r5
                  JOIN MeasPointResType mpr5 ON mpr5.PkID = r5.MPRTFk AND mpr5.ResultTypeFk = 5
                  WHERE mpr5.MeasPointFk = mpr.MeasPointFk AND r5.ResultTimeStamp = i.ResultTimeStamp)
    AND EXISTS (SELECT 1 FROM Result r6
                JOIN MeasPointResType mpr6 ON mpr6.PkID = r6.MPRTFk AND mpr6.ResultTypeFk = 6
                WHERE mpr6.MeasPointFk = mpr.MeasPointFk AND r6.ResultTimeStamp = i.ResultTimeStamp)
    AND NOT EXISTS (SELECT 1 FROM Result r10
                    JOIN MeasPointResType mpr10x ON mpr10x.PkID = r10.MPRTFk AND mpr10x.ResultTypeFk = 10
                    WHERE mpr10x.MeasPointFk = mpr.MeasPointFk AND r10.ResultTimeStamp = i.ResultTimeStamp);
END;
GO

PRINT 'Trigger trg_Result_Sum180_280_5_8_0 created.';

-- Trigger on ResultM (manual readings)
CREATE TRIGGER trg_ResultM_Sum180_280_5_8_0 ON ResultM
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ResultM (MPRTFk, ResultTimeStamp, ResultValue, Status)
    SELECT DISTINCT
        mpr10.PkID,
        i.ResultTimeStamp,
        ISNULL((SELECT r5.ResultValue FROM ResultM r5
                JOIN MeasPointResType mpr5 ON mpr5.PkID = r5.MPRTFk AND mpr5.ResultTypeFk = 5
                WHERE mpr5.MeasPointFk = mpr.MeasPointFk AND r5.ResultTimeStamp = i.ResultTimeStamp), 0)
        +
        ISNULL((SELECT r6.ResultValue FROM ResultM r6
                JOIN MeasPointResType mpr6 ON mpr6.PkID = r6.MPRTFk AND mpr6.ResultTypeFk = 6
                WHERE mpr6.MeasPointFk = mpr.MeasPointFk AND r6.ResultTimeStamp = i.ResultTimeStamp), 0),
        1
    FROM Inserted i
    JOIN MeasPointResType mpr ON mpr.PkID = i.MPRTFk AND mpr.ResultTypeFk IN (5, 6)
    JOIN MeasPoint mp ON mp.PkID = mpr.MeasPointFk
    JOIN MeasPointResType mpr10 ON mpr10.MeasPointFk = mpr.MeasPointFk AND mpr10.ResultTypeFk = 10
    WHERE EXISTS (SELECT 1 FROM ResultM r5
                  JOIN MeasPointResType mpr5 ON mpr5.PkID = r5.MPRTFk AND mpr5.ResultTypeFk = 5
                  WHERE mpr5.MeasPointFk = mpr.MeasPointFk AND r5.ResultTimeStamp = i.ResultTimeStamp)
    AND EXISTS (SELECT 1 FROM ResultM r6
                JOIN MeasPointResType mpr6 ON mpr6.PkID = r6.MPRTFk AND mpr6.ResultTypeFk = 6
                WHERE mpr6.MeasPointFk = mpr.MeasPointFk AND r6.ResultTimeStamp = i.ResultTimeStamp)
    AND NOT EXISTS (SELECT 1 FROM ResultM r10
                    JOIN MeasPointResType mpr10x ON mpr10x.PkID = r10.MPRTFk AND mpr10x.ResultTypeFk = 10
                    WHERE mpr10x.MeasPointFk = mpr.MeasPointFk AND r10.ResultTimeStamp = i.ResultTimeStamp);
END;
GO

PRINT 'Trigger trg_ResultM_Sum180_280_5_8_0 created.';


/*==============================================================================
  PHASE 4 — Create MPRT Links for Combined (RT=10)
  ==============================================================================
  Links RT=10 to every LP2 meter that has BOTH RT=5 (Export) AND RT=6 (Import).
  No solar exclusion (same as New Cairo — solar meters don't have LP2 anyway).
==============================================================================*/
PRINT '=== PHASE 4: Create MPRT Links ===';

INSERT INTO SODIC.dbo.MeasPointResType (MeasPointFk, ResultTypeFk, Period, PeriodUnit,
    CorrectionFactor, Class, Instance, MethodType, Method, ParametersType, Parameters, Type)
SELECT
    mp.PkID, 10, 1, 3, 1,
    'SEP2RegisterProfile', '99.2.0',
    2, 'Read', 16,
    '<array><string>1-0:5.8.0*255</string></array><datetime>@from</datetime><datetime>@to</datetime><boolean>@demand</boolean>',
    0
FROM SODIC.dbo.MeasPoint mp
WHERE mp.Name LIKE '%LP2%'
  AND EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 5)
  AND EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 6)
  AND NOT EXISTS (SELECT 1 FROM SODIC.dbo.MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 10);

PRINT 'MPRT links created: ' + CAST(@@ROWCOUNT AS NVARCHAR(20)) + ' (expected ~227)';


/*==============================================================================
  PHASE 5 — Backfill Historical Data
  ==============================================================================
  Runs AFTER MPRT links exist so triggers won't double-fire on old data.
  Two separate queries: one from Result, one from ResultM.
==============================================================================*/
PRINT '=== PHASE 5: Backfill ===';

-- 5a. From Result (automatic readings, 15-min intervals)
INSERT INTO SODIC.dbo.Result (MPRTFk, ResultTimeStamp, ResultValue, Status)
SELECT DISTINCT
    mpr10.PkID,
    imp.ResultTimeStamp,
    ISNULL(imp.ResultValue, 0) + ISNULL(exp.ResultValue, 0),
    1
FROM SODIC.dbo.MeasPointResType mpr10
JOIN SODIC.dbo.MeasPointResType mpr5 ON mpr5.MeasPointFk = mpr10.MeasPointFk AND mpr5.ResultTypeFk = 5
JOIN SODIC.dbo.MeasPointResType mpr6 ON mpr6.MeasPointFk = mpr10.MeasPointFk AND mpr6.ResultTypeFk = 6
JOIN SODIC.dbo.MeasPoint mp ON mp.PkID = mpr10.MeasPointFk
JOIN SODIC.dbo.Result imp ON imp.MPRTFk = mpr6.PkID
JOIN SODIC.dbo.Result exp ON exp.MPRTFk = mpr5.PkID AND exp.ResultTimeStamp = imp.ResultTimeStamp
WHERE mpr10.ResultTypeFk = 10
  AND NOT EXISTS (SELECT 1 FROM SODIC.dbo.Result r
                  WHERE r.MPRTFk = mpr10.PkID AND r.ResultTimeStamp = imp.ResultTimeStamp);

PRINT 'Result backfill: ' + CAST(@@ROWCOUNT AS NVARCHAR(20)) + ' rows';

-- 5b. From ResultM (manual readings, e.g. chiller starts)
INSERT INTO SODIC.dbo.ResultM (MPRTFk, ResultTimeStamp, ResultValue, Status)
SELECT DISTINCT
    mpr10.PkID,
    imp.ResultTimeStamp,
    ISNULL(imp.ResultValue, 0) + ISNULL(exp.ResultValue, 0),
    1
FROM SODIC.dbo.MeasPointResType mpr10
JOIN SODIC.dbo.MeasPointResType mpr5 ON mpr5.MeasPointFk = mpr10.MeasPointFk AND mpr5.ResultTypeFk = 5
JOIN SODIC.dbo.MeasPointResType mpr6 ON mpr6.MeasPointFk = mpr10.MeasPointFk AND mpr6.ResultTypeFk = 6
JOIN SODIC.dbo.MeasPoint mp ON mp.PkID = mpr10.MeasPointFk
JOIN SODIC.dbo.ResultM imp ON imp.MPRTFk = mpr6.PkID
JOIN SODIC.dbo.ResultM exp ON exp.MPRTFk = mpr5.PkID AND exp.ResultTimeStamp = imp.ResultTimeStamp
WHERE mpr10.ResultTypeFk = 10
  AND NOT EXISTS (SELECT 1 FROM SODIC.dbo.ResultM r
                  WHERE r.MPRTFk = mpr10.PkID AND r.ResultTimeStamp = imp.ResultTimeStamp);

PRINT 'ResultM backfill: ' + CAST(@@ROWCOUNT AS NVARCHAR(20)) + ' rows';


/*==============================================================================
  PHASE 6 — Verification Queries
  ==============================================================================*/
PRINT '=== PHASE 6: Verification ===';

-- 6a. MPRT count (should be ~227 = all LP2 meters with both RT=5 and RT=6)
SELECT COUNT(*) AS MPRT_Combined_Count
FROM SODIC.dbo.MeasPointResType WHERE ResultTypeFk = 10;

-- 6b. LP2 meters MISSING combined (should be 0)
SELECT mp.PkID, mp.Name
FROM SODIC.dbo.MeasPoint mp
WHERE mp.Name LIKE '%LP2%'
  AND EXISTS (SELECT 1 FROM MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 5)
  AND EXISTS (SELECT 1 FROM MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 6)
  AND NOT EXISTS (SELECT 1 FROM MeasPointResType WHERE MeasPointFk = mp.PkID AND ResultTypeFk = 10)
ORDER BY mp.Name;

-- 6c. Top 5: combined = import + export arithmetic check
SELECT TOP 5
    mp.Name,
    exp.ResultValue AS Export,
    imp.ResultValue AS Import,
    comb.ResultValue AS Combined,
    ISNULL(imp.ResultValue, 0) + ISNULL(exp.ResultValue, 0) AS ExpectedCombined
FROM SODIC.dbo.MeasPointResType mpr10
JOIN SODIC.dbo.MeasPoint mp ON mp.PkID = mpr10.MeasPointFk
JOIN SODIC.dbo.MeasPointResType mpr5 ON mpr5.MeasPointFk = mp.PkID AND mpr5.ResultTypeFk = 5
JOIN SODIC.dbo.MeasPointResType mpr6 ON mpr6.MeasPointFk = mp.PkID AND mpr6.ResultTypeFk = 6
CROSS APPLY (SELECT TOP 1 ResultTimeStamp, ResultValue FROM SODIC.dbo.Result
             WHERE MPRTFk = mpr10.PkID ORDER BY ResultTimeStamp DESC) comb
CROSS APPLY (SELECT ResultValue FROM SODIC.dbo.Result
             WHERE MPRTFk = mpr5.PkID AND ResultTimeStamp = comb.ResultTimeStamp) exp
CROSS APPLY (SELECT ResultValue FROM SODIC.dbo.Result
             WHERE MPRTFk = mpr6.PkID AND ResultTimeStamp = comb.ResultTimeStamp) imp
WHERE mpr10.ResultTypeFk = 10
  AND comb.ResultValue != ISNULL(imp.ResultValue, 0) + ISNULL(exp.ResultValue, 0);

-- 6d. Data rows in Result by result type
SELECT mprt.ResultTypeFk, rt.Name, COUNT(*) AS RowCount
FROM SODIC.dbo.Result r
JOIN SODIC.dbo.MeasPointResType mprt ON mprt.PkID = r.MPRTFk
JOIN SODIC.dbo.ResultType rt ON rt.PkID = mprt.ResultTypeFk
WHERE mprt.ResultTypeFk IN (5, 6, 10)
GROUP BY mprt.ResultTypeFk, rt.Name
ORDER BY mprt.ResultTypeFk;


/*==============================================================================
  PHASE 7 — Update SEP Configuration (run in billing DB)
  ==============================================================================
  ⚠️ Only run this AFTER all verification passes.
  Old value: SEP_ELECT_RESULT_TYPE = 6 (Import)
  New value: SEP_ELECT_RESULT_TYPE = 10 (Combined)
==============================================================================*/
PRINT '=== PHASE 7: SEP Config Update ===';

-- USE Sodic_billing;
-- UPDATE general_settings SET general_settings_value = '10'
-- WHERE general_settings_key = 'SEP_ELECT_RESULT_TYPE';

PRINT '-- Uncomment the UPDATE above in Sodic_billing after verification --';
PRINT '-- Then restart billing: Restart-Service -Name billing_engine_sodic --';


/*==============================================================================
  ROLLBACK (if needed)
  ==============================================================================
  DROP TRIGGER trg_Result_Sum180_280_5_8_0;
  DROP TRIGGER trg_ResultM_Sum180_280_5_8_0;
  DELETE FROM SODIC.dbo.MeasPointResType WHERE ResultTypeFk = 10;
  DELETE FROM SODIC.dbo.Result WHERE MPRTFk IN (SELECT PkID FROM MeasPointResType WHERE ResultTypeFk = 10);
  DELETE FROM SODIC.dbo.ResultM WHERE MPRTFk IN (SELECT PkID FROM MeasPointResType WHERE ResultTypeFk = 10);
  DELETE FROM SODIC.dbo.ResultType WHERE PkID = 10;
  DELETE FROM SODIC.dbo.Quantity WHERE PkID = 10;
  USE Sodic_billing; UPDATE general_settings SET general_settings_value = '6' WHERE general_settings_key = 'SEP_ELECT_RESULT_TYPE';
==============================================================================*/
