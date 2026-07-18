/*==============================================================================
  REVERSE ENGINEER — Full System Structure Extraction
  ==============================================================================
  Run these queries ONE AT A TIME. Each shows a specific piece of the system.
  Read the comments before each query to understand WHAT you're looking at
  and HOW to use this info to build your MeterVerse system.

  HOW TO USE:
    1. Connect to your SQL Server
    2. Open this file in SSMS
    3. Highlight a single query section (from the comment to the semicolon)
    4. Press F5 to run just that section
    5. Study the output
    6. Move to the next section
==============================================================================*/

/*==============================================================================
  SET 1: FIND ALL DATABASES — Shows you every database on the server
  ==============================================================================
  Why: You need to know which databases exist before you can explore them.
       SCADA DBs contain Device/MeasPoint/Result tables.
       Billing DBs contain meter/monthly_reading/invoice tables.
==============================================================================*/
SELECT name AS DatabaseName,
       recovery_model_desc,
       state_desc,
       create_date
FROM sys.databases
WHERE database_id > 4  -- excludes system databases
ORDER BY name;


/*==============================================================================
  SET 2: SCHEMA EXPORT — This generates CREATE TABLE statements for every table
  ==============================================================================
  Why: You can run these OUTPUT statements to get the exact DDL needed to
       recreate ALL tables in your MeterVerse system. Just copy/paste the
       output into a new SQL file and run it in your target database.

  Note: Change USE [PalmHills_October] to YOUR database name
==============================================================================*/
USE PalmHills_October;  -- <<< CHANGE THIS TO YOUR SCADA DB NAME

-- Get exact CREATE TABLE for every table you need
-- Run EACH of these separately to see the full schema
SELECT 'CREATE TABLE [dbo].[' + TABLE_NAME + '] ('  FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
UNION ALL
SELECT 
    '    [' + COLUMN_NAME + '] ' + 
    DATA_TYPE + 
    CASE 
        WHEN DATA_TYPE IN ('varchar', 'nvarchar', 'char', 'nchar') THEN '(' + CASE WHEN CHARACTER_MAXIMUM_LENGTH = -1 THEN 'MAX' ELSE CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) END + ')'
        WHEN DATA_TYPE IN ('decimal', 'numeric') THEN '(' + CAST(NUMERIC_PRECISION AS VARCHAR) + ',' + CAST(NUMERIC_SCALE AS VARCHAR) + ')'
        ELSE ''
    END +
    CASE WHEN IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END +
    CASE WHEN COLUMN_DEFAULT IS NOT NULL THEN ' DEFAULT ' + COLUMN_DEFAULT ELSE '' END +
    ','
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY ORDINAL_POSITION;

-- Alternative: Just get column names and types in a readable table
PRINT '=== Device Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE, 
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Device'
ORDER BY ORDINAL_POSITION;

PRINT '=== MeasPoint Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'MeasPoint'
ORDER BY ORDINAL_POSITION;

PRINT '=== MeasPointResType Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'MeasPointResType'
ORDER BY ORDINAL_POSITION;

PRINT '=== ResultType Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ResultType'
ORDER BY ORDINAL_POSITION;

PRINT '=== Result Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Result'
ORDER BY ORDINAL_POSITION;

PRINT '=== ResultM Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ResultM'
ORDER BY ORDINAL_POSITION;

PRINT '=== Quantity Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Quantity'
ORDER BY ORDINAL_POSITION;


/*==============================================================================
  SET 3: BILLING DATABASE SCHEMAS
  ==============================================================================
  Why: Shows the exact structure of billing tables so you can recreate them
==============================================================================*/
USE PalmHills_Billing;  -- <<< CHANGE THIS TO YOUR BILLING DB NAME

PRINT '=== meter Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'meter'
ORDER BY ORDINAL_POSITION;

PRINT '=== monthly_reading Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'monthly_reading'
ORDER BY ORDINAL_POSITION;

PRINT '=== invoice Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'invoice'
ORDER BY ORDINAL_POSITION;

PRINT '=== general_settings Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'general_settings'
ORDER BY ORDINAL_POSITION;

PRINT '=== tariff Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tariff'
ORDER BY ORDINAL_POSITION;

PRINT '=== tariff_rate Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tariff_rate'
ORDER BY ORDINAL_POSITION;

PRINT '=== meter_tariff Table Schema ===';
SELECT COLUMN_NAME, DATA_TYPE,
       CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) ELSE '-' END AS MaxLen,
       IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'meter_tariff'
ORDER BY ORDINAL_POSITION;


/*==============================================================================
  SET 4: ALL RESULT TYPES — The core channel definitions
  ==============================================================================
  Why: This is the MOST IMPORTANT query. It shows you every reading channel
       (OBIS code) in your system and its numeric ID. You need this to:
       - Know which ResultType numbers are Import (1.8.0), Export (2.8.0), Combined (5.8.0)
       - Create the same channels in your MeterVerse
       - Map billing configuration to the right channels

  Run this for EACH SCADA database you found in SET 1.
==============================================================================*/
USE PalmHills_October;  -- <<< CHANGE FOR EACH SCADA DB

PRINT '=== ALL RESULT TYPES ===';
SELECT 
    PkID AS ResultTypeID,
    Name AS OBIS_Code_And_Description,
    QuantityFk,
    UnitFk,
    TariffFk
FROM ResultType
ORDER BY PkID;

-- This shows you what each RT number means:
-- Look for "1.8.0" in Name = Import channel
-- Look for "2.8.0" in Name = Export channel
-- Look for "5.8.0" in Name = Combined channel (our creation)


/*==============================================================================
  SET 5: MPRT LINKS — How many meters are connected to each channel
  ==============================================================================
  Why: Shows you how the measpoints are linked to ResultTypes. This is the
       "wiring diagram" of your system. You can see:
       - How many meters have Import, Export, and Combined channels
       - The distribution of channel types
==============================================================================*/
PRINT '=== MPRT DISTRIBUTION (how many measpoints per channel) ===';
SELECT 
    mprt.ResultTypeFk,
    rt.Name AS ChannelName,
    COUNT(*) AS NumberOfMeasPointsLinked
FROM MeasPointResType mprt
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
GROUP BY mprt.ResultTypeFk, rt.Name
ORDER BY mprt.ResultTypeFk;


/*==============================================================================
  SET 6: MEASPOINT TYPES — Understanding LP2 vs other types
  ==============================================================================
  Why: Shows you the different measpoint types (LP2, BP1, Hourly, etc.)
       and how many of each exist. LP2 is the only type used for billing.
==============================================================================*/
PRINT '=== MEASPOINT TYPE BREAKDOWN ===';
SELECT 
    CASE
        WHEN Name LIKE '%LP2%' THEN 'LP2 (Load Profile - 15min - FOR BILLING)'
        WHEN Name LIKE '%BP1%' THEN 'BP1 (Block Profile 1)'
        WHEN Name LIKE '%BP2%' THEN 'BP2 (Block Profile 2)'
        WHEN Name LIKE '%Hourly%' THEN 'Hourly (60min interval)'
        WHEN Name LIKE '%W1%' OR Name LIKE '%Water1%' THEN 'W1 (Water)'
		WHEN Name LIKE '%W4%' THEN 'W4 (Water)'
        ELSE 'Other: ' + Name
    END AS MeasPointCategory,
    COUNT(*) AS Count
FROM MeasPoint
GROUP BY
    CASE
        WHEN Name LIKE '%LP2%' THEN 'LP2 (Load Profile - 15min - FOR BILLING)'
        WHEN Name LIKE '%BP1%' THEN 'BP1 (Block Profile 1)'
        WHEN Name LIKE '%BP2%' THEN 'BP2 (Block Profile 2)'
        WHEN Name LIKE '%Hourly%' THEN 'Hourly (60min interval)'
        WHEN Name LIKE '%W1%' OR Name LIKE '%Water1%' THEN 'W1 (Water)'
		WHEN Name LIKE '%W4%' THEN 'W4 (Water)'
        ELSE 'Other: ' + Name
    END
ORDER BY MeasPointCategory;

-- See actual examples of device names and their measpoints
PRINT '=== SAMPLE: Device Name + MeasPoint Names ===';
SELECT TOP 20
    d.Name AS DeviceName,
    mp.Name AS MeasPointName
FROM Device d
JOIN MeasPoint mp ON mp.DeviceFk = d.PkID
ORDER BY d.Name, mp.Name;


/*==============================================================================
  SET 7: TRIGGER DEFINITIONS — The automation engine
  ==============================================================================
  Why: Shows you the EXACT trigger code currently running on your system.
       This is the brain of the combined channel automation.
       You can copy these triggers directly into your MeterVerse.
==============================================================================*/
PRINT '=== ALL TRIGGERS ===';
SELECT 
    name AS TriggerName,
    OBJECT_NAME(parent_id) AS TableName,
    CASE WHEN is_disabled = 0 THEN 'ENABLED' ELSE 'DISABLED' END AS Status,
    create_date,
    modify_date
FROM sys.triggers
ORDER BY name;

PRINT '=== FULL TRIGGER CODE ===';
SELECT 
    name AS TriggerName,
    OBJECT_DEFINITION(object_id) AS TriggerCode
FROM sys.triggers
ORDER BY name;

-- Copy the TriggerCode output — this is your trigger logic.


/*==============================================================================
  SET 8: SEP CONFIGURATION — How billing knows what to read
  ==============================================================================
  Why: This is the CONFIGURATION that tells the billing engine which ResultType
       to read for each meter type. This is how you configure your MeterVerse
       billing engine to work the same way.
==============================================================================*/
USE PalmHills_Billing;  -- <<< CHANGE FOR EACH BILLING DB

PRINT '=== SEP CONFIGURATION (Controls billing behavior) ===';
SELECT 
    general_settings_key AS SettingName,
    general_settings_value AS SettingValue
FROM general_settings
WHERE general_settings_key LIKE 'SEP_%'
ORDER BY general_settings_key;

-- HOW TO INTERPRET THIS:
-- SEP_ELECT_RESULT_TYPE      = The channel the billing engine reads for non-solar meters
-- SEP_SOLAR_RESULT_TYPE       = The Export channel for solar meters
-- SEP_ELECT_SOLAR_RESULT_TYPE = The Import channel for solar meters
-- SEP_ELECT_MEAS_POINT        = Which measpoint suffix to use (_LP2)


/*==============================================================================
  SET 9: SOLAR VS NON-SOLAR METER BREAKDOWN
  ==============================================================================
  Why: Shows how solar meters are configured differently from non-solar.
       This is critical for your MeterVerse billing logic.
==============================================================================*/
PRINT '=== METER BREAKDOWN ===';
SELECT 
    is_solar,
    CASE WHEN is_solar = 1 THEN 'SOLAR' WHEN is_solar = 0 THEN 'NON-SOLAR' ELSE 'UNKNOWN' END AS MeterType,
    COUNT(*) AS Count,
    COUNT(CASE WHEN sep_2_w IS NOT NULL THEN 1 END) AS LinkedToSCADA,
    COUNT(CASE WHEN sep_2_w IS NULL THEN 1 END) AS NotLinkedToSCADA
FROM meter
GROUP BY is_solar;

PRINT '=== SAMPLE: Solar meters ===';
SELECT TOP 10 
    id, serial, name, sep_2_w, project_id, status
FROM meter
WHERE is_solar = 1
ORDER BY serial;

PRINT '=== SAMPLE: Non-solar meters ===';
SELECT TOP 10 
    id, serial, name, sep_2_w, project_id, status
FROM meter
WHERE is_solar = 0
ORDER BY serial;


/*==============================================================================
  SET 10: ENTITY CHAIN — The complete path from billing meter to reading
  ==============================================================================
  Why: Shows you how a billing meter → links to a SCADA Device → has
       MeasPoints → which have MPRT links → to ResultTypes → with readings.
       This is the FULL PATH you need to implement in MeterVerse.

  Note: Change both database names to match your setup
==============================================================================*/
PRINT '=== ENTITY CHAIN: billing meter → Device → MeasPoint → MPRT → ResultType ===';
SELECT TOP 30
    bm.id AS BillingMeterID,
    bm.serial AS MeterSerial,
    bm.name AS MeterName,
    CASE WHEN bm.is_solar = 1 THEN 'SOLAR' ELSE 'NON-SOLAR' END AS MeterType,
    d.PkID AS DeviceID,
    d.Name AS DeviceName,
    mp.PkID AS MeasPointID,
    mp.Name AS MeasPointName,
    mprt.PkID AS MPRT_ID,
    rt.PkID AS ResultTypeID,
    rt.Name AS ChannelName,
    LEFT(mprt.Parameters, 150) AS OBIS_Config
FROM PalmHills_Billing.dbo.meter bm  -- <<< CHANGE BILLING DB
JOIN PalmHills_October.dbo.Device d ON d.PkID = bm.sep_2_w  -- <<< CHANGE SCADA DB
JOIN PalmHills_October.dbo.MeasPoint mp ON mp.DeviceFk = d.PkID
JOIN PalmHills_October.dbo.MeasPointResType mprt ON mprt.MeasPointFk = mp.PkID
JOIN PalmHills_October.dbo.ResultType rt ON rt.PkID = mprt.ResultTypeFk
WHERE bm.status = 'ACTIVE'
ORDER BY bm.serial, mp.Name, rt.PkID;


/*==============================================================================
  SET 11: MPRT PARAMETERS — The OBIS code configuration
  ==============================================================================
  Why: Shows you the exact Parameters XML that tells SEP2 what OBIS codes to
       read from the meter. You need this exact XML in your MeterVerse MPRT.
==============================================================================*/
PRINT '=== SAMPLE MPRT PARAMETERS (OBIS code configs) ===';
SELECT TOP 20
    mp.Name AS MeasPointName,
    rt.Name AS ChannelName,
    mprt.Class,
    mprt.Instance,
    mprt.MethodType,
    mprt.Method,
    mprt.ParametersType,
    mprt.Parameters AS OBIS_XML_Config
FROM MeasPointResType mprt
JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
WHERE mp.Name LIKE '%LP2%'
ORDER BY rt.PkID, mp.Name;

-- Show the distinct Parameters patterns used (deduplicated)
PRINT '=== DISTINCT PARAMETER PATTERNS ===';
SELECT DISTINCT
    rt.Name AS ChannelName,
    LEFT(mprt.Parameters, 300) AS ParametersPattern
FROM MeasPointResType mprt
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
ORDER BY rt.Name;


/*==============================================================================
  SET 12: FOREIGN KEYS — How tables relate to each other
  ==============================================================================
  Why: Shows you exactly how tables are connected. Critical for understanding
       the database relationships in your MeterVerse.
==============================================================================*/
PRINT '=== ALL FOREIGN KEY RELATIONSHIPS ===';
SELECT 
    OBJECT_NAME(f.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_NAME(f.referenced_object_id) AS ReferencedTable,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumn
FROM sys.foreign_keys f
JOIN sys.foreign_key_columns fc ON fc.constraint_object_id = f.object_id
ORDER BY OBJECT_NAME(f.parent_object_id), COL_NAME(fc.parent_object_id, fc.parent_column_id);


/*==============================================================================
  SET 13: SAMPLE ACTUAL READINGS — See what data looks like
  ==============================================================================
  Why: Shows you what real readings look like in the system. You need to
       understand the data format to create matching data in MeterVerse.
==============================================================================*/
PRINT '=== LATEST 10 READINGS (Result table) ===';
SELECT TOP 10
    r.MPRTFk,
    rt.Name AS Channel,
    r.ResultTimeStamp,
    r.ResultValue,
    r.Status
FROM Result r
JOIN MeasPointResType mprt ON mprt.PkID = r.MPRTFk
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
ORDER BY r.ResultTimeStamp DESC;

PRINT '=== READING COUNTS PER CHANNEL ===';
SELECT 
    rt.Name AS Channel,
    COUNT(*) AS ReadingCount,
    MIN(r.ResultTimeStamp) AS Earliest,
    MAX(r.ResultTimeStamp) AS Latest
FROM Result r
JOIN MeasPointResType mprt ON mprt.PkID = r.MPRTFk
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
GROUP BY rt.Name
ORDER BY rt.Name;

PRINT '=== SAMPLE: Combined = Import + Export verification ===';
-- Pick one meter and verify combined = import + export at same timestamp
SELECT TOP 5
    d.Name AS Device,
    imp.ResultValue AS Import_Value,
    exp.ResultValue AS Export_Value,
    comb.ResultValue AS Combined_Value,
    ISNULL(imp.ResultValue, 0) + ISNULL(exp.ResultValue, 0) AS Expected_Combined
FROM Device d
JOIN MeasPoint mp ON mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%'
JOIN MeasPointResType mprt_comb ON mprt_comb.MeasPointFk = mp.PkID
    AND mprt_comb.ResultTypeFk IN (SELECT PkID FROM ResultType WHERE Name LIKE '%5.8.0%')
JOIN Result comb ON comb.MPRTFk = mprt_comb.PkID
JOIN MeasPointResType mprt_imp ON mprt_imp.MeasPointFk = mp.PkID
    AND mprt_imp.ResultTypeFk IN (SELECT PkID FROM ResultType WHERE Name LIKE '%1.8.0%')
JOIN Result imp ON imp.MPRTFk = mprt_imp.PkID AND imp.ResultTimeStamp = comb.ResultTimeStamp
JOIN MeasPointResType mprt_exp ON mprt_exp.MeasPointFk = mp.PkID
    AND mprt_exp.ResultTypeFk IN (SELECT PkID FROM ResultType WHERE Name LIKE '%2.8.0%')
JOIN Result exp ON exp.MPRTFk = mprt_exp.PkID AND exp.ResultTimeStamp = comb.ResultTimeStamp
WHERE d.PkID IN (SELECT TOP 1 sep_2_w FROM PalmHills_Billing.dbo.meter WHERE is_solar = 0 AND sep_2_w IS NOT NULL)
ORDER BY comb.ResultTimeStamp DESC;


/*==============================================================================
  SET 14: BILLING TABLES DATA — See what billing looks like
  ==============================================================================
  Why: Shows you how billing data is structured (monthly readings, invoices)
==============================================================================*/
USE PalmHills_Billing;  -- <<< CHANGE TO YOUR BILLING DB

PRINT '=== SAMPLE monthly_reading data ===';
SELECT TOP 10 *
FROM monthly_reading
ORDER BY reading_date DESC;

PRINT '=== SAMPLE invoice data ===';
SELECT TOP 10 *
FROM invoice
ORDER BY id DESC;

PRINT '=== SAMPLE tariff data ===';
SELECT * FROM tariff;

PRINT '=== SAMPLE tariff_rate data ===';
SELECT * FROM tariff_rate;

PRINT '=== SAMPLE meter_tariff data ===';
SELECT TOP 20 * FROM meter_tariff;


/*==============================================================================
  SET 15: UNITS AND QUANTITIES
  ==============================================================================
  Why: Shows what measurement units are used (kWh, etc.)
==============================================================================*/
PRINT '=== Quantities ===';
SELECT * FROM Quantity ORDER BY PkID;

-- If Unit table exists
IF OBJECT_ID('Unit') IS NOT NULL
BEGIN
    PRINT '=== Units ===';
    SELECT * FROM Unit ORDER BY PkID;
END


/*==============================================================================
  SET 16: ALL OTHER TABLES — Find anything else useful
  ==============================================================================
  Why: Shows you any other tables in the database you might have missed
==============================================================================*/
PRINT '=== ALL TABLES IN THIS DATABASE ===';
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;


/*==============================================================================
  SET 17: HOW TO BUILD THE SAME STRUCTURE — Template Generator
  ==============================================================================
  Run this to generate the CREATE TABLE statements for your MeterVerse.
  The output is SQL you can run directly to recreate every table.
==============================================================================*/
PRINT '=== GENERATED CREATE TABLE STATEMENTS ===';
PRINT '-- Copy these and run in your MeterVerse database --';
PRINT '';

-- Generate CREATE TABLE for each table
SELECT 
    '-- Table: ' + TABLE_NAME,
    'IF OBJECT_ID(''[' + TABLE_NAME + ']'') IS NOT NULL DROP TABLE [' + TABLE_NAME + '];',
    'CREATE TABLE [dbo].[' + TABLE_NAME + '] ('
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'

UNION ALL

SELECT 
    '    [' + COLUMN_NAME + '] ' + 
    DATA_TYPE + 
    CASE 
        WHEN DATA_TYPE IN ('varchar', 'nvarchar', 'char', 'nchar') 
            THEN '(' + CASE WHEN CHARACTER_MAXIMUM_LENGTH = -1 THEN 'MAX' ELSE CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) END + ')'
        WHEN DATA_TYPE IN ('decimal', 'numeric', 'float', 'real') 
            THEN '(' + CAST(ISNULL(NUMERIC_PRECISION, 18) AS VARCHAR) + ',' + CAST(ISNULL(NUMERIC_SCALE, 0) AS VARCHAR) + ')'
        ELSE ''
    END +
    CASE WHEN IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END +
    CASE WHEN COLUMN_DEFAULT IS NOT NULL THEN ' DEFAULT ' + COLUMN_DEFAULT ELSE '' END +
    CASE WHEN ORDINAL_POSITION = (SELECT MAX(ORDINAL_POSITION) FROM INFORMATION_SCHEMA.COLUMNS c2 
                                  WHERE c2.TABLE_NAME = c.TABLE_NAME AND c2.TABLE_SCHEMA = c.TABLE_SCHEMA)
         THEN '' ELSE ',' END
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME, ORDINAL_POSITION

UNION ALL

SELECT 
    ');',
    '',
    ''
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;


/*==============================================================================
  SET 18: SODIC-SPECIFIC QUERIES
  ==============================================================================
  SODIC uses the MPRTFk-based schema (same as October/New Cairo) but has
  some unique features:
    - DeviceSumConfig table (controls which devices participate in sum)
    - No MeterFk/ChannelFk/ResultTypeFk columns in Result table (MPRTFk only)
    - Trigger-driven combination uses CROSS-JOIN pattern (not GROUP BY)
  
  Run these against the SODIC database specifically.
==============================================================================*/

-- 18a: Check if DeviceSumConfig table exists
USE SODIC;
PRINT '=== 18a: DeviceSumConfig (SODIC-specific table) ===';
IF OBJECT_ID('DeviceSumConfig') IS NOT NULL
    SELECT * FROM DeviceSumConfig;
ELSE
    PRINT 'DeviceSumConfig table does not exist in this database.';

-- 18b: Find all meters NOT in DeviceSumConfig (excluded from old trigger)
PRINT '=== 18b: Meters excluded from DeviceSumConfig ===';
SELECT d.PkID, d.Name AS DeviceName
FROM SODIC.dbo.Device d
WHERE d.PkID NOT IN (SELECT DeviceFk FROM SODIC.dbo.DeviceSumConfig)
  AND EXISTS (SELECT 1 FROM SODIC.dbo.MeasPoint WHERE DeviceFk = d.PkID);
PRINT 'Note: These meters were excluded from the old combined trigger.';

-- 18c: MPRTFk-based trigger pattern verification
PRINT '=== 18c: Sample cross-join trigger logic (read-only) ===';
-- This query shows what the trigger does: for each import reading,
-- find matching export at same timestamp, sum them
SELECT TOP 10
    mp.Name,
    rt5.Name AS ExportChannel,
    r5.ResultValue AS ExportValue,
    rt6.Name AS ImportChannel,
    r6.ResultValue AS ImportValue,
    r6.ResultTimeStamp,
    (ISNULL(r5.ResultValue, 0) + ISNULL(r6.ResultValue, 0)) AS CombinedValue
FROM SODIC.dbo.Result r6
JOIN SODIC.dbo.MeasPointResType mpr6 ON mpr6.PkID = r6.MPRTFk AND mpr6.ResultTypeFk = 6
JOIN SODIC.dbo.MeasPoint mp ON mp.PkID = mpr6.MeasPointFk
JOIN SODIC.dbo.MeasPointResType mpr5 ON mpr5.MeasPointFk = mp.PkID AND mpr5.ResultTypeFk = 5
JOIN SODIC.dbo.Result r5 ON r5.MPRTFk = mpr5.PkID AND r5.ResultTimeStamp = r6.ResultTimeStamp
JOIN SODIC.dbo.ResultType rt5 ON rt5.PkID = 5
JOIN SODIC.dbo.ResultType rt6 ON rt6.PkID = 6
WHERE mp.Name LIKE '%LP2%'
ORDER BY r6.ResultTimeStamp DESC;

-- 18d: Old trigger pattern vs new trigger pattern comparison
PRINT '=== 18d: Old trigger approach (UPDATE-based, destructive) ===';
PRINT 'The old trigger trg_Result_AutoSum180_280 used:'
PRINT '  UPDATE SODIC.dbo.Result SET ResultValue = exp.value + imp.value'
PRINT '  WHERE EXISTS (same timestamp match)'
PRINT 'This OVERWROTE the original Import (RT=6) value with the sum.'
PRINT '';
PRINT 'The new trigger uses:'
PRINT '  INSERT INTO SODIC.dbo.Result (MPRTFk, ResultTimeStamp, ResultValue, Status)'
PRINT '  SELECT ... combined value ... WHERE NOT EXISTS (same timestamp for RT=10)'
PRINT 'This PRESERVES the original RT=5 and RT=6 readings.';

-- 18e: Chiller meters in SODIC (example of non-LP2 meters with combined data)
PRINT '=== 18e: Chiller meters (initially excluded from DeviceSumConfig) ===';
SELECT d.PkID AS DevicePkID, d.Name AS DeviceName
FROM SODIC.dbo.Device d
WHERE d.Name LIKE '%Chiller%'
ORDER BY d.Name;


/*==============================================================================
  SUMMARY — What you now know to build MeterVerse:
  ==============================================================================
  1. All database names and their purpose (SCADA vs Billing)
  2. All table schemas (column names, types, nullability)
  3. All foreign key relationships (how tables link)
  4. All ResultTypes (the channel definitions)
  5. All trigger code (the automation logic)
  6. SEP configuration (billing engine settings)
  7. Solar vs non-solar configuration
  8. MPRT parameters (OBIS code XML configs)
  9. Sample data (what readings look like)
  10. Entity chain (how everything connects)
  11. Billing data structure (monthly readings, invoices, tariffs)
  12. Complete CREATE TABLE statements ready to use
  13. SODIC-specific queries (DeviceSumConfig, MPRTFk-only schema, chiller meters)
==============================================================================*/
