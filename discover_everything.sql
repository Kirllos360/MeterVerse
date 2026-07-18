/*==============================================================================
  METERVERSE — COMPLETE SYSTEM DISCOVERY
  ==============================================================================
  RUN THIS ONCE. It will dynamically find ALL databases and extract everything
  needed to fill the Bible document gaps.

  INSTRUCTIONS:
    1. Connect to your SQL Server instance
    2. Open this file in SSMS
    3. Press F5 (Execute)
    4. Save the entire Results tab output to a text file
    5. Send me the output file
==============================================================================*/

SET NOCOUNT ON;

/*==============================================================================
  PHASE 1 — FIND ALL DATABASES
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 1: ALL DATABASES ON SERVER';
PRINT REPLICATE('=', 120);

SELECT name AS DatabaseName,
       recovery_model_desc,
       state_desc,
       create_date,
       compatibility_level
FROM sys.databases
WHERE state_desc = 'ONLINE'
  AND database_id > 4  -- exclude system DBs
ORDER BY name;

/*==============================================================================
  PHASE 2 — DISCOVER SCHEMAS: For every online user database, extract tables
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 2: ALL TABLES IN EVERY DATABASE';
PRINT REPLICATE('=', 120);

DECLARE @dbname NVARCHAR(128);
DECLARE @sql NVARCHAR(MAX);

DECLARE db_cursor CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor;
FETCH NEXT FROM db_cursor INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    PRINT ''--- Tables in [' + @dbname + '] ---'';
    SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = ''BASE TABLE''
    ORDER BY TABLE_SCHEMA, TABLE_NAME;
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        PRINT 'ERROR on ' + @dbname + ': ' + ERROR_MESSAGE();
    END CATCH

    FETCH NEXT FROM db_cursor INTO @dbname;
END
CLOSE db_cursor;
DEALLOCATE db_cursor;

/*==============================================================================
  PHASE 3 — COLUMN SCHEMAS: Extract schema for key tables in every DB
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 3: COLUMN SCHEMAS FOR KEY TABLES';
PRINT REPLICATE('=', 120);

DECLARE @target_tables TABLE (TableName NVARCHAR(128));
INSERT INTO @target_tables VALUES
    ('Device'), ('MeasPoint'), ('MeasPointResType'), ('ResultType'),
    ('Result'), ('ResultM'), ('ObjectResult'), ('ObjectResultM'),
    ('ChangedResult'), ('ChangedObjectResult'), ('Quantity'),
    ('meter'), ('monthly_reading'), ('invoice'), ('invoice_item'),
    ('tariff'), ('tariff_rate'), ('meter_tariff'),
    ('general_settings'), ('project'), ('reading'),
    ('DerivedReadingRule'), ('MeasPointObis'), ('ObisCode'),
    ('SEP'), ('SEPConfig'), ('Schedule'),
    ('application_setting'), ('system_setting'),
    ('meter_reading'), ('billing_reading'), ('customer'),
    ('subscription'), ('plan'), ('rate');

DECLARE db_cursor2 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor2;
FETCH NEXT FROM db_cursor2 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @tname NVARCHAR(128);
    DECLARE table_cursor CURSOR FOR
    SELECT TableName FROM @target_tables ORDER BY TableName;

    OPEN table_cursor;
    FETCH NEXT FROM table_cursor INTO @tname;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @sql = '
        USE [' + @dbname + '];
        IF OBJECT_ID(''' + @tname + ''') IS NOT NULL
        BEGIN
            PRINT ''--- [' + @dbname + '].[dbo].[' + @tname + '] ---'';
            SELECT COLUMN_NAME, DATA_TYPE,
                   ISNULL(CONVERT(VARCHAR, CHARACTER_MAXIMUM_LENGTH), ''-'') AS MaxLen,
                   IS_NULLABLE,
                   ISNULL(COLUMN_DEFAULT, ''-'') AS DefaultVal
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = ''' + @tname + '''
            ORDER BY ORDINAL_POSITION;
        END
        ';
        BEGIN TRY
            EXEC sp_executesql @sql;
        END TRY
        BEGIN CATCH
            -- Table not found, skip
        END CATCH

        FETCH NEXT FROM table_cursor INTO @tname;
    END
    CLOSE table_cursor;
    DEALLOCATE table_cursor;

    FETCH NEXT FROM db_cursor2 INTO @dbname;
END
CLOSE db_cursor2;
DEALLOCATE db_cursor2;

/*==============================================================================
  PHASE 4 — ALL RESULT TYPES (every database)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 4: ALL RESULTTYPES IN EVERY DATABASE';
PRINT REPLICATE('=', 120);

DECLARE db_cursor3 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor3;
FETCH NEXT FROM db_cursor3 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    IF OBJECT_ID(''ResultType'') IS NOT NULL
    BEGIN
        PRINT ''--- ResultTypes in [' + @dbname + '] ---'';
        SELECT PkID, Name, QuantityFk, UnitFk, TariffFk
        FROM ResultType ORDER BY PkID;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- No ResultType table, skip
    END CATCH

    FETCH NEXT FROM db_cursor3 INTO @dbname;
END
CLOSE db_cursor3;
DEALLOCATE db_cursor3;

/*==============================================================================
  PHASE 5 — MPRT DISTRIBUTION (counts per ResultType per database)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 5: MPRT LINK COUNTS PER RESULTTYPE';
PRINT REPLICATE('=', 120);

DECLARE db_cursor4 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor4;
FETCH NEXT FROM db_cursor4 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    IF OBJECT_ID(''MeasPointResType'') IS NOT NULL AND OBJECT_ID(''ResultType'') IS NOT NULL
    BEGIN
        PRINT ''--- MPRT Distribution in [' + @dbname + '] ---'';
        SELECT mprt.ResultTypeFk, rt.Name AS ResultTypeName, COUNT(*) AS MPRTCount
        FROM MeasPointResType mprt
        JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
        GROUP BY mprt.ResultTypeFk, rt.Name
        ORDER BY mprt.ResultTypeFk;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor4 INTO @dbname;
END
CLOSE db_cursor4;
DEALLOCATE db_cursor4;

/*==============================================================================
  PHASE 6 — MEASPOINT TYPE DISTRIBUTION (per database)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 6: MEASPOINT TYPE DISTRIBUTION';
PRINT REPLICATE('=', 120);

DECLARE db_cursor5 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor5;
FETCH NEXT FROM db_cursor5 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    IF OBJECT_ID(''MeasPoint'') IS NOT NULL
    BEGIN
        PRINT ''--- MeasPoint Types in [' + @dbname + '] ---'';
        SELECT
            CASE
                WHEN Name LIKE ''%LP2%'' THEN ''LP2''
                WHEN Name LIKE ''%BP1%'' THEN ''BP1''
                WHEN Name LIKE ''%BP2%'' THEN ''BP2''
                WHEN Name LIKE ''%Hourly%'' THEN ''Hourly''
                WHEN Name LIKE ''%W1%'' OR Name LIKE ''%Water%'' THEN ''Water''
                ELSE ''Other''
            END AS MeasPointType,
            COUNT(DISTINCT PkID) AS MeasPointCount,
            COUNT(DISTINCT DeviceFk) AS DeviceCount
        FROM MeasPoint
        GROUP BY
            CASE
                WHEN Name LIKE ''%LP2%'' THEN ''LP2''
                WHEN Name LIKE ''%BP1%'' THEN ''BP1''
                WHEN Name LIKE ''%BP2%'' THEN ''BP2''
                WHEN Name LIKE ''%Hourly%'' THEN ''Hourly''
                WHEN Name LIKE ''%W1%'' OR Name LIKE ''%Water%'' THEN ''Water''
                ELSE ''Other''
            END
        ORDER BY MeasPointType;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor5 INTO @dbname;
END
CLOSE db_cursor5;
DEALLOCATE db_cursor5;

/*==============================================================================
  PHASE 7 — ALL TRIGGERS (every database)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 7: ALL TRIGGERS';
PRINT REPLICATE('=', 120);

DECLARE db_cursor6 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor6;
FETCH NEXT FROM db_cursor6 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    PRINT ''--- Triggers in [' + @dbname + '] ---'';
    SELECT
        name AS TriggerName,
        OBJECT_NAME(parent_id) AS TableName,
        is_disabled,
        create_date,
        modify_date
    FROM sys.triggers
    ORDER BY name;

    PRINT ''--- Trigger Code in [' + @dbname + '] ---'';
    SELECT
        name AS TriggerName,
        OBJECT_DEFINITION(object_id) AS TriggerCode
    FROM sys.triggers
    ORDER BY name;
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor6 INTO @dbname;
END
CLOSE db_cursor6;
DEALLOCATE db_cursor6;

/*==============================================================================
  PHASE 8 — SEP CONFIGURATION (any database with general_settings)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 8: SEP CONFIGURATION (general_settings)';
PRINT REPLICATE('=', 120);

DECLARE db_cursor7 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor7;
FETCH NEXT FROM db_cursor7 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    IF OBJECT_ID(''general_settings'') IS NOT NULL
    BEGIN
        PRINT ''--- Settings in [' + @dbname + '] ---'';
        SELECT id, general_settings_key, general_settings_value
        FROM general_settings
        ORDER BY general_settings_key;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor7 INTO @dbname;
END
CLOSE db_cursor7;
DEALLOCATE db_cursor7;

/*==============================================================================
  PHASE 9 — DATA VOLUMES (Result, ResultM row counts per database)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 9: DATA VOLUMES';
PRINT REPLICATE('=', 120);

DECLARE db_cursor8 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor8;
FETCH NEXT FROM db_cursor8 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    PRINT ''--- Data in [' + @dbname + '] ---'';

    IF OBJECT_ID(''Result'') IS NOT NULL
    BEGIN
        DECLARE @rc BIGINT;
        SELECT @rc = COUNT(*) FROM Result;
        PRINT ''Result rows: '' + CAST(@rc AS VARCHAR);
        SELECT @rc = COUNT(DISTINCT MPRTFk) FROM Result;
        PRINT ''Result distinct MPRTFs: '' + CAST(@rc AS VARCHAR);

        -- Date range
        SELECT @rc = COUNT(*) FROM (
            SELECT TOP 1 ResultTimeStamp FROM Result ORDER BY ResultTimeStamp
        ) x;
        IF @rc > 0
        BEGIN
            SELECT MIN(ResultTimeStamp) AS Earliest, MAX(ResultTimeStamp) AS Latest FROM Result;
        END
    END

    IF OBJECT_ID(''ResultM'') IS NOT NULL
    BEGIN
        SELECT @rc = COUNT(*) FROM ResultM;
        PRINT ''ResultM rows: '' + CAST(@rc AS VARCHAR);
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor8 INTO @dbname;
END
CLOSE db_cursor8;
DEALLOCATE db_cursor8;

/*==============================================================================
  PHASE 10 — SOLAR METER CONFIGURATION (from every billing DB)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 10: SOLAR METER CONFIGURATION';
PRINT REPLICATE('=', 120);

DECLARE db_cursor9 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor9;
FETCH NEXT FROM db_cursor9 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    IF OBJECT_ID(''meter'') IS NOT NULL
    BEGIN
        PRINT ''--- Solar Config in [' + @dbname + '] ---'';
        SELECT
            COUNT(*) AS TotalMeters,
            SUM(CASE WHEN is_solar = 1 THEN 1 ELSE 0 END) AS SolarCount,
            SUM(CASE WHEN is_solar = 0 THEN 1 ELSE 0 END) AS NonSolarCount,
            SUM(CASE WHEN is_solar IS NULL THEN 1 ELSE 0 END) AS UnknownCount
        FROM meter;

        PRINT ''--- Sample solar meters (top 20) ---'';
        SELECT TOP 20 id, serial, name, sep_2_w, project_id, status
        FROM meter WHERE is_solar = 1 ORDER BY serial;

        PRINT ''--- Sample non-solar meters (top 20) ---'';
        SELECT TOP 20 id, serial, name, sep_2_w, project_id, status
        FROM meter WHERE is_solar = 0 ORDER BY serial;

        PRINT ''--- Distinct project_id values ---'';
        SELECT DISTINCT project_id FROM meter ORDER BY project_id;

        PRINT ''--- Distinct status values ---'';
        SELECT DISTINCT status FROM meter;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor9 INTO @dbname;
END
CLOSE db_cursor9;
DEALLOCATE db_cursor9;

/*==============================================================================
  PHASE 11 — TARIFF TABLES
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 11: TARIFF CONFIGURATION';
PRINT REPLICATE('=', 120);

DECLARE db_cursor10 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor10;
FETCH NEXT FROM db_cursor10 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    PRINT ''--- Tariff info in [' + @dbname + '] ---'';

    IF OBJECT_ID(''tariff'') IS NOT NULL
    BEGIN
        SELECT * FROM tariff;
    END

    IF OBJECT_ID(''tariff_rate'') IS NOT NULL
    BEGIN
        SELECT * FROM tariff_rate;
    END

    IF OBJECT_ID(''meter_tariff'') IS NOT NULL
    BEGIN
        SELECT TOP 20 * FROM meter_tariff;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor10 INTO @dbname;
END
CLOSE db_cursor10;
DEALLOCATE db_cursor10;

/*==============================================================================
  PHASE 12 — FOREIGN KEY RELATIONSHIPS
  Shows how tables link together
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 12: FOREIGN KEY RELATIONSHIPS';
PRINT REPLICATE('=', 120);

DECLARE db_cursor11 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor11;
FETCH NEXT FROM db_cursor11 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    PRINT ''--- FK Relationships in [' + @dbname + '] ---'';
    SELECT
        OBJECT_NAME(f.parent_object_id) AS TableName,
        COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
        OBJECT_NAME(f.referenced_object_id) AS ReferencedTableName,
        COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumnName
    FROM sys.foreign_keys f
    JOIN sys.foreign_key_columns fc ON fc.constraint_object_id = f.object_id
    WHERE OBJECT_NAME(f.parent_object_id) IN (
        ''Device'', ''MeasPoint'', ''MeasPointResType'', ''ResultType'', ''Quantity'',
        ''Result'', ''ResultM'',
        ''meter'', ''monthly_reading'', ''invoice'', ''tariff'', ''meter_tariff''
    )
    ORDER BY OBJECT_NAME(f.parent_object_id), COL_NAME(fc.parent_object_id, fc.parent_column_id);
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor11 INTO @dbname;
END
CLOSE db_cursor11;
DEALLOCATE db_cursor11;

/*==============================================================================
  PHASE 13 — QUANTITIES (every database)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 13: QUANTITIES';
PRINT REPLICATE('=', 120);

DECLARE db_cursor12 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor12;
FETCH NEXT FROM db_cursor12 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    IF OBJECT_ID(''Quantity'') IS NOT NULL
    BEGIN
        PRINT ''--- Quantities in [' + @dbname + '] ---'';
        SELECT * FROM Quantity ORDER BY PkID;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor12 INTO @dbname;
END
CLOSE db_cursor12;
DEALLOCATE db_cursor12;

/*==============================================================================
  PHASE 14 — ENTITY CHAIN SAMPLE
  Links billing meter → Device → MeasPoint → MPRT → ResultType for each DB pair
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 14: ENTITY CHAIN SAMPLES';
PRINT REPLICATE('=', 120);

-- This section requires knowing which DBs are SCADA vs Billing
-- We'll look for cross-database references or just show within each DB

-- For each database that has Device table, show sample
DECLARE db_cursor14 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor14;
FETCH NEXT FROM db_cursor14 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    IF OBJECT_ID(''Device'') IS NOT NULL AND OBJECT_ID(''MeasPoint'') IS NOT NULL
       AND OBJECT_ID(''MeasPointResType'') IS NOT NULL AND OBJECT_ID(''ResultType'') IS NOT NULL
    BEGIN
        PRINT ''--- Entity Chain Sample in [' + @dbname + '] ---'';
        SELECT TOP 10
            d.PkID AS DevicePkID,
            d.Name AS DeviceName,
            mp.PkID AS MeasPointPkID,
            mp.Name AS MeasPointName,
            mprt.PkID AS MPRTPkID,
            mprt.ResultTypeFk,
            rt.Name AS ResultTypeName,
            LEFT(mprt.Parameters, 200) AS OBISConfig
        FROM Device d
        JOIN MeasPoint mp ON mp.DeviceFk = d.PkID
        JOIN MeasPointResType mprt ON mprt.MeasPointFk = mp.PkID
        JOIN ResultType rt ON rt.PkID = mprt.ResultTypeFk
        WHERE mp.Name LIKE ''%LP2%''
        ORDER BY d.Name, mp.Name, rt.PkID;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor14 INTO @dbname;
END
CLOSE db_cursor14;
DEALLOCATE db_cursor14;

/*==============================================================================
  PHASE 15 — SAMPLE READINGS
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 15: SAMPLE READINGS FROM EACH DATABASE';
PRINT REPLICATE('=', 120);

DECLARE db_cursor15 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor15;
FETCH NEXT FROM db_cursor15 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    IF OBJECT_ID(''Result'') IS NOT NULL
    BEGIN
        PRINT ''--- Latest 5 Results in [' + @dbname + '] ---'';
        SELECT TOP 5 MPRTFk, ResultTimeStamp, ResultValue, Status
        FROM Result ORDER BY ResultTimeStamp DESC;

        PRINT ''--- Sample 5 random results ---'';
        SELECT TOP 5 MPRTFk, ResultTimeStamp, ResultValue, Status
        FROM Result ORDER BY NEWID();
    END

    IF OBJECT_ID(''ResultM'') IS NOT NULL
    BEGIN
        PRINT ''--- Latest 5 ResultM in [' + @dbname + '] ---'';
        SELECT TOP 5 MPRTFk, ResultTimeStamp, ResultValue, Status
        FROM ResultM ORDER BY ResultTimeStamp DESC;
    END
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor15 INTO @dbname;
END
CLOSE db_cursor15;
DEALLOCATE db_cursor15;

/*==============================================================================
  PHASE 16 — MISC TABLES (job schedules, logs, API config)
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'PHASE 16: JOB/SCHEDULE/LOG/API CONFIG TABLES';
PRINT REPLICATE('=', 120);

DECLARE db_cursor16 CURSOR FOR
SELECT name FROM sys.databases
WHERE state_desc = 'ONLINE' AND database_id > 4
ORDER BY name;

OPEN db_cursor16;
FETCH NEXT FROM db_cursor16 INTO @dbname;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = '
    USE [' + @dbname + '];
    PRINT ''--- Misc tables in [' + @dbname + '] ---'';
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = ''BASE TABLE''
      AND (
          TABLE_NAME LIKE ''%job%'' OR TABLE_NAME LIKE ''%schedule%''
          OR TABLE_NAME LIKE ''%task%'' OR TABLE_NAME LIKE ''%cron%''
          OR TABLE_NAME LIKE ''%timer%'' OR TABLE_NAME LIKE ''%log%''
          OR TABLE_NAME LIKE ''%audit%'' OR TABLE_NAME LIKE ''%history%''
          OR TABLE_NAME LIKE ''%api%'' OR TABLE_NAME LIKE ''%endpoint%''
          OR TABLE_NAME LIKE ''%setting%'' OR TABLE_NAME LIKE ''%config%''
          OR TABLE_NAME LIKE ''%event%'' OR TABLE_NAME LIKE ''%notification%''
          OR TABLE_NAME LIKE ''%session%'' OR TABLE_NAME LIKE ''%token%''
          OR TABLE_NAME LIKE ''%role%'' OR TABLE_NAME LIKE ''%permission%''
          OR TABLE_NAME LIKE ''%user%'' OR TABLE_NAME LIKE ''%employee%''
          OR TABLE_NAME LIKE ''%reading%'' OR TABLE_NAME LIKE ''%object%''
          OR TABLE_NAME LIKE ''%changed%''
          OR TABLE_NAME LIKE ''%monthly%'' OR TABLE_NAME LIKE ''%daily%''
          OR TABLE_NAME LIKE ''%obis%'' OR TABLE_NAME LIKE ''%derived%''
          OR TABLE_NAME LIKE ''%register%''
      )
    ORDER BY TABLE_NAME;
    ';
    BEGIN TRY
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Skip
    END CATCH

    FETCH NEXT FROM db_cursor16 INTO @dbname;
END
CLOSE db_cursor16;
DEALLOCATE db_cursor16;

/*==============================================================================
  DONE
==============================================================================*/
PRINT REPLICATE('=', 120);
PRINT 'DISCOVERY COMPLETE';
PRINT 'Please save the entire Results tab output and send it to me.';
PRINT 'I will use this data to fill ALL gaps in the MeterVerse Bible document.';
PRINT REPLICATE('=', 120);
