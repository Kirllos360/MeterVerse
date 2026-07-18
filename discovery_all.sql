/*==============================================================================
  METERVERSE DISCOVERY SCRIPT
  Run this in SQL Server Management Studio (SSMS) on the server
  Copy/paste each section's results into the gaps in the Bible document

  INSTRUCTIONS:
    1. Connect to the SQL Server instance
    2. Open this file in SSMS
    3. Set Results to Text or Grid (CTRL+T or CTRL+D)
    4. Run one section at a time (select + F5) or run all
    5. Save the output for each section
==============================================================================*/

/*==============================================================================
  SECTION 1: DISCOVER ALL DATABASES
  Run first to find all relevant databases
==============================================================================*/
PRINT '=== SECTION 1: All Databases ===';
SELECT name AS DatabaseName,
       recovery_model_desc,
       state_desc,
       create_date
FROM sys.databases
ORDER BY name;


/*==============================================================================
  SECTION 2: ALL RESULT TYPES PER DATABASE
  For each SCADA database found above, run this:
  Replace {DB_NAME} with actual names (e.g., PalmHills_October, PalmHills_NewCairo, SODIC)
==============================================================================*/
PRINT '=== SECTION 2: ResultTypes ===';

-- Run this for EACH SCADA database:
-- Replace PalmHills_October with your actual DB name

USE PalmHills_October;  -- <<< CHANGE THIS FOR EACH DB >>>
PRINT '--- ResultTypes in PalmHills_October ---';
SELECT PkID, Name, QuantityFk, UnitFk, TariffFk
FROM ResultType
ORDER BY PkID;

-- Repeat for each SCADA database:
-- USE PalmHills_NewCairo;
-- PRINT '--- ResultTypes in PalmHills_NewCairo ---';
-- SELECT PkID, Name, QuantityFk, UnitFk, TariffFk FROM ResultType ORDER BY PkID;

-- USE SODIC;
-- PRINT '--- ResultTypes in SODIC ---';
-- SELECT PkID, Name, QuantityFk, UnitFk, TariffFk FROM ResultType ORDER BY PkID;


/*==============================================================================
  SECTION 3: QUANTITIES
==============================================================================*/
PRINT '=== SECTION 3: Quantities ===';
SELECT PkID, Name, UnitFk FROM Quantity ORDER BY PkID;


/*==============================================================================
  SECTION 4: MPRT DISTRIBUTION
  How many meters are linked to each ResultType?
==============================================================================*/
PRINT '=== SECTION 4: MPRT Distribution ===';
SELECT mprt.ResultTypeFk, rt.Name AS ResultTypeName, COUNT(*) AS MPRT_Count
FROM MeasPointResType mprt
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
GROUP BY mprt.ResultTypeFk, rt.Name
ORDER BY mprt.ResultTypeFk;


/*==============================================================================
  SECTION 5: MEASPOINT TYPES DISTRIBUTION
==============================================================================*/
PRINT '=== SECTION 5: MeasPoint Types ===';
SELECT
    CASE
        WHEN mp.Name LIKE '%LP2%' THEN 'LP2'
        WHEN mp.Name LIKE '%BP1%' THEN 'BP1'
        WHEN mp.Name LIKE '%BP2%' THEN 'BP2'
        WHEN mp.Name LIKE '%Hourly%' THEN 'Hourly'
        WHEN mp.Name LIKE '%W1%' OR mp.Name LIKE '%Water%' THEN 'Water'
        ELSE 'Other'
    END AS MeasPointType,
    COUNT(DISTINCT mp.PkID) AS MeasPointCount,
    COUNT(DISTINCT mp.DeviceFk) AS DeviceCount
FROM MeasPoint mp
GROUP BY
    CASE
        WHEN mp.Name LIKE '%LP2%' THEN 'LP2'
        WHEN mp.Name LIKE '%BP1%' THEN 'BP1'
        WHEN mp.Name LIKE '%BP2%' THEN 'BP2'
        WHEN mp.Name LIKE '%Hourly%' THEN 'Hourly'
        WHEN mp.Name LIKE '%W1%' OR mp.Name LIKE '%Water%' THEN 'Water'
        ELSE 'Other'
    END
ORDER BY MeasPointType;


/*==============================================================================
  SECTION 6: EXISTING TRIGGERS
==============================================================================*/
PRINT '=== SECTION 6: Triggers ===';
SELECT
    name AS TriggerName,
    OBJECT_SCHEMA_NAME(parent_id) AS SchemaName,
    OBJECT_NAME(parent_id) AS TableName,
    is_disabled,
    create_date,
    modify_date
FROM sys.triggers
ORDER BY name;

PRINT '--- Trigger Definitions ---';
SELECT
    name AS TriggerName,
    OBJECT_DEFINITION(object_id) AS TriggerCode
FROM sys.triggers
ORDER BY name;


/*==============================================================================
  SECTION 7: SEP CONFIGURATION (Billing DB)
  Run for EACH billing database
==============================================================================*/
PRINT '=== SECTION 7: SEP Config ===';

-- Replace PalmHills_Billing with your actual billing DB name
USE PalmHills_Billing;  -- <<< CHANGE THIS FOR EACH BILLING DB >>>
PRINT '--- SEP Config in PalmHills_Billing ---';
SELECT id, general_settings_key, general_settings_value
FROM general_settings
WHERE general_settings_key LIKE 'SEP_%'
ORDER BY general_settings_key;

-- Repeat for each billing database:
-- USE PalmHills_Billing_NewCairo;
-- PRINT '--- SEP Config in PalmHills_Billing_NewCairo ---';
-- SELECT id, general_settings_key, general_settings_value
-- FROM general_settings WHERE general_settings_key LIKE 'SEP_%' ORDER BY general_settings_key;

USE Sodic_billing;
PRINT '--- SEP Config in Sodic_billing ---';
SELECT id, general_settings_key, general_settings_value
FROM general_settings WHERE general_settings_key LIKE 'SEP_%' ORDER BY general_settings_key;


/*==============================================================================
  SECTION 8: BILLING DATABASE TABLES & SCHEMA
==============================================================================*/
PRINT '=== SECTION 8: Billing DB Tables ===';

-- List all tables in the billing database
SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_SCHEMA, TABLE_NAME;

-- Schema of specific billing tables (run one at a time)
-- Uncomment the table you want to inspect:

-- PRINT '--- meter table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
--        IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'meter'
-- ORDER BY ORDINAL_POSITION;

-- PRINT '--- monthly_reading table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
--        IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'monthly_reading'
-- ORDER BY ORDINAL_POSITION;

-- PRINT '--- invoice table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
--        IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'invoice'
-- ORDER BY ORDINAL_POSITION;

-- PRINT '--- tariff table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
--        IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'tariff'
-- ORDER BY ORDINAL_POSITION;

-- PRINT '--- tariff_rate table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
--        IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'tariff_rate'
-- ORDER BY ORDINAL_POSITION;

-- PRINT '--- general_settings table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
--        IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'general_settings'
-- ORDER BY ORDINAL_POSITION;

-- PRINT '--- meter_tariff table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
--        IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'meter_tariff'
-- ORDER BY ORDINAL_POSITION;

-- PRINT '--- project table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH,
--        IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'project'
-- ORDER BY ORDINAL_POSITION;


/*==============================================================================
  SECTION 9: SCADA DATABASE TABLE SCHEMAS
==============================================================================*/
PRINT '=== SECTION 9: SCADA DB Tables ===';

-- List all tables in SCADA database
SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_SCHEMA, TABLE_NAME;

-- Schema of key SCADA tables:
-- Uncomment to inspect:

-- PRINT '--- Device table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Device' ORDER BY ORDINAL_POSITION;

-- PRINT '--- MeasPoint table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MeasPoint' ORDER BY ORDINAL_POSITION;

-- PRINT '--- MeasPointResType table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MeasPointResType' ORDER BY ORDINAL_POSITION;

-- PRINT '--- Result table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Result' ORDER BY ORDINAL_POSITION;

-- PRINT '--- ResultM table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ResultM' ORDER BY ORDINAL_POSITION;

-- PRINT '--- ResultType table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ResultType' ORDER BY ORDINAL_POSITION;

-- PRINT '--- Quantity table schema ---';
-- SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Quantity' ORDER BY ORDINAL_POSITION;


/*==============================================================================
  SECTION 10: DATA DISTRIBUTION
  How much data exists in each reading table?
==============================================================================*/
PRINT '=== SECTION 10: Data Distribution ===';

PRINT '--- Result table row count ---';
SELECT COUNT(*) AS Result_RowCount FROM Result;

PRINT '--- ResultM table row count ---';
SELECT COUNT(*) AS ResultM_RowCount FROM ResultM;

PRINT '--- Result rows by ResultType ---';
SELECT rt.PkID, rt.Name, COUNT(*) AS RowCount
FROM Result r
JOIN MeasPointResType mprt ON mprt.PkID = r.MPRTFk
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
GROUP BY rt.PkID, rt.Name
ORDER BY rt.PkID;

PRINT '--- Result date range ---';
SELECT MIN(ResultTimeStamp) AS EarliestReading,
       MAX(ResultTimeStamp) AS LatestReading
FROM Result;

PRINT '--- Meters with data ---';
SELECT COUNT(DISTINCT mp.DeviceFk) AS MetersWithData
FROM Result r
JOIN MeasPointResType mprt ON mprt.PkID = r.MPRTFk
JOIN MeasPoint mp ON mp.PkID = mprt.MeasPointFk;


/*==============================================================================
  SECTION 11: SOLAR METERS CONFIGURATION
==============================================================================*/
PRINT '=== SECTION 11: Solar Meter Config ===';

-- Run in the billing database context
-- USE PalmHills_Billing;  -- <<< CHANGE ME >>>

PRINT '--- Solar meter count ---';
SELECT COUNT(*) AS SolarMeterCount
FROM meter WHERE is_solar = 1;

PRINT '--- Solar meter list (sample 20) ---';
SELECT TOP 20 id, serial, name, sep_2_w, project_id, status
FROM meter
WHERE is_solar = 1
ORDER BY serial;

PRINT '--- Non-solar meter count ---';
SELECT COUNT(*) AS NonSolarMeterCount
FROM meter WHERE is_solar = 0;

PRINT '--- Solar meter sep_2_w linked to SCADA? ---';
SELECT COUNT(*) AS SolarWithSCADALink
FROM meter m
JOIN PalmHills_October.dbo.Device d ON d.PkID = m.sep_2_w
WHERE m.is_solar = 1;

-- Do solar meters have combined channel? (should be 0)
PRINT '--- Solar meters with combined (should be 0) ---';
SELECT COUNT(*) AS SolarWithCombined
FROM meter m
JOIN PalmHills_October.dbo.Device d ON d.PkID = m.sep_2_w
JOIN PalmHills_October.dbo.MeasPoint mp ON mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%'
JOIN PalmHills_October.dbo.MeasPointResType mprt ON mprt.MeasPointFk = mp.PkID
    AND mprt.ResultTypeFk = 10  -- Combined RT for October
WHERE m.is_solar = 1;


/*==============================================================================
  SECTION 12: SAMPLE READING DATA
  Shows what actual readings look like
==============================================================================*/
PRINT '=== SECTION 12: Sample Readings ===';

PRINT '--- Sample 10 readings from Result (all columns) ---';
SELECT TOP 10 * FROM Result ORDER BY ResultTimeStamp DESC;

PRINT '--- Sample 10 from ResultM ---';
SELECT TOP 10 * FROM ResultM ORDER BY ResultTimeStamp DESC;

PRINT '--- Sample device with its measpoints ---';
SELECT TOP 5 d.PkID, d.Name AS DeviceName, mp.PkID AS MeasPointPkID,
       mp.Name AS MeasPointName, mprt.PkID AS MPRTPkID,
       mprt.ResultTypeFk, rt.Name AS ResultTypeName,
       mprt.Parameters
FROM Device d
JOIN MeasPoint mp ON mp.DeviceFk = d.PkID
JOIN MeasPointResType mprt ON mprt.MeasPointFk = mp.PkID
JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
WHERE d.PkID = (SELECT TOP 1 sep_2_w FROM PalmHills_Billing.dbo.meter WHERE is_solar = 0 AND sep_2_w IS NOT NULL)
ORDER BY mp.Name, mprt.ResultTypeFk;


/*==============================================================================
  SECTION 13: TARIFF CONFIGURATION
==============================================================================*/
PRINT '=== SECTION 13: Tariffs ===';

-- Run in billing database context
-- USE PalmHills_Billing;

-- Check if tariff tables exist
IF OBJECT_ID('tariff') IS NOT NULL
BEGIN
    PRINT '--- All tariffs ---';
    SELECT * FROM tariff;
END
ELSE
    PRINT '--- tariff table not found ---';

IF OBJECT_ID('tariff_rate') IS NOT NULL
BEGIN
    PRINT '--- Tariff rates ---';
    SELECT * FROM tariff_rate;
END
ELSE
    PRINT '--- tariff_rate table not found ---';

IF OBJECT_ID('meter_tariff') IS NOT NULL
BEGIN
    PRINT '--- Meter-tariff mappings ---';
    SELECT TOP 20 * FROM meter_tariff;
END
ELSE
    PRINT '--- meter_tariff table not found ---';


/*==============================================================================
  SECTION 14: PROJECTS
==============================================================================*/
PRINT '=== SECTION 14: Projects ===';
IF OBJECT_ID('project') IS NOT NULL
BEGIN
    SELECT * FROM project;
END
ELSE
BEGIN
    SELECT DISTINCT project_id AS ProjectID FROM meter ORDER BY project_id;
END


/*==============================================================================
  SECTION 15: ENTITY CHAIN VERIFICATION
  Shows one full path from meter → billing
==============================================================================*/
PRINT '=== SECTION 15: Entity Chain Sample ===';
SELECT TOP 10
    m.id AS BillingMeterID,
    m.serial AS MeterSerial,
    m.name AS MeterName,
    m.is_solar,
    d.PkID AS DevicePkID,
    d.Name AS DeviceName,
    mp.PkID AS MeasPointPkID,
    mp.Name AS MeasPointName,
    mprt.PkID AS MPRTPkID,
    rt.PkID AS ResultTypePkID,
    rt.Name AS ResultTypeName,
    mprt.Parameters AS OBISConfig
FROM PalmHills_Billing.dbo.meter m  -- <<< CHANGE BILLING DB >>>
JOIN PalmHills_October.dbo.Device d ON d.PkID = m.sep_2_w  -- <<< CHANGE SCADA DB >>>
JOIN PalmHills_October.dbo.MeasPoint mp ON mp.DeviceFk = d.PkID AND mp.Name LIKE '%LP2%'
JOIN PalmHills_October.dbo.MeasPointResType mprt ON mprt.MeasPointFk = mp.PkID
JOIN PalmHills_October.dbo.ResultType rt ON rt.PkID = mprt.ResultTypeFk
WHERE m.status = 'ACTIVE'
ORDER BY m.serial, mp.Name, rt.PkID;


/*==============================================================================
  SECTION 16: UI / API DISCOVERY
  Look for any API-related tables or config
==============================================================================*/
PRINT '=== SECTION 16: API / UI Config ===';

-- Look for any settings that might reference UI or API endpoints
SELECT * FROM general_settings
WHERE general_settings_key NOT LIKE 'SEP_%'
ORDER BY general_settings_key;

-- Look for any job/scheduler tables
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%job%' OR TABLE_NAME LIKE '%schedule%' OR TABLE_NAME LIKE '%task%'
   OR TABLE_NAME LIKE '%cron%' OR TABLE_NAME LIKE '%timer%';

-- Look for any log tables
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%log%' OR TABLE_NAME LIKE '%audit%' OR TABLE_NAME LIKE '%history%';


/*==============================================================================
  SECTION 17: READING TABLES COMPREHENSIVE LIST
  Find all reading-related tables in SCADA DB
==============================================================================*/
PRINT '=== SECTION 17: All Reading-Related Tables ===';
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%Result%' OR TABLE_NAME LIKE '%Reading%' OR TABLE_NAME LIKE '%Object%'
ORDER BY TABLE_NAME;

/*==============================================================================
  DONE — Now copy all output and provide it to fill the gaps in the Bible
==============================================================================*/
