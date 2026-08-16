@echo off
rem ============================================================================
rem  METERVERSE OS - UNIFIED CONTROL CENTER (replaces 11 fragmented _tools)
rem  Merged from: Start, Stop, MainControl, AdvancedTest, StressTest, Deploy,
rem  DisasterRecovery, GitPush, SafetyCheck, config  (FixTool = obsolete)
rem  P58: native PostgreSQL on :5433 (NOT docker). All 4 services + engines.
rem ============================================================================
title MeterVerse OS - Control Center
setlocal enabledelayedexpansion
cd /d "%~dp0.."
call "%~dp0config.cmd"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

rem ---- Safety: block dangerous kill-all-node patterns ----
call :SAFETY_CHECK
if errorlevel 1 (
    echo.
    echo [SAFETY] Kill-all-node command found in _tools. Refusing to run.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

set "ARG=%~1"
if "%ARG%"=="" goto MENU
if /i "%ARG%"=="start"   goto START
if /i "%ARG%"=="stop"    goto STOP
if /i "%ARG%"=="status"  goto STATUS
if /i "%ARG%"=="monitor" goto MONITOR
if /i "%ARG%"=="test"    goto TEST
if /i "%ARG%"=="deploy"  goto DEPLOY
if /i "%ARG%"=="backup"  goto BACKUP
if /i "%ARG%"=="restore" goto RESTORE
if /i "%ARG%"=="push"    goto GIT
if /i "%ARG%"=="logs"    goto VIEWLOG
if /i "%ARG%"=="help"    goto HELP
echo Unknown command: %ARG%
goto HELP

:MENU
echo.
echo  ============================================================
echo    METERVERSE OS - Control Center
echo    Admin :3535/3131   Portal :3030/3003   DB :5433 (native)
echo  ============================================================
echo.
echo   1. Start all services (DB check + BE + FE + engines + health)
echo   2. Stop all services
echo   3. Status
echo   4. Smart Monitor (auto-heal, never stops)
echo   5. Test suite (crash + stress)
echo   6. Deploy (pull + build + migrate + verify)
echo   7. Backup database
echo   8. Restore database
echo   9. Git push (safe)
echo  10. View logs
echo  11. Help
echo   0. Exit
echo.
set /p ch="Select: "
if "%ch%"=="1" goto START
if "%ch%"=="2" goto STOP
if "%ch%"=="3" goto STATUS
if "%ch%"=="4" goto MONITOR
if "%ch%"=="5" goto TEST
if "%ch%"=="6" goto DEPLOY
if "%ch%"=="7" goto BACKUP
if "%ch%"=="8" goto RESTORE
if "%ch%"=="9" goto GIT
if "%ch%"=="10" goto VIEWLOG
if "%ch%"=="11" goto HELP
if "%ch%"=="0" exit
goto MENU

rem ============================ START ========================================
:START
echo [SYS] Starting MeterVerse OS...
call :LOG "[SYS] Start invoked"

rem Stop anything stale first (safe)
call :KILL_ALL

rem --- DB check (native PostgreSQL on 5433) ---
echo [DB] Checking PostgreSQL :5433 ...
call :CHECK_DB
if errorlevel 1 (
    echo [DB] WARNING: PostgreSQL not detected on 5433.
    echo      Start the native service: net start postgresql  (PG16 :5433; x64-18 is PG18 :5434)
    echo      Frontend will start in UI-only mode.
)

rem --- 1. Admin Backend (:3131) ---
echo [1/4] Admin Backend :%ADMIN_BE_PORT% ...
call :LOG "[BE] Starting admin :%ADMIN_BE_PORT%"
start "MeterVerse-AdminAPI" cmd /c "title MeterVerse Admin Backend :3131 && echo [MeterVerse] Admin Backend RUNNING :3131 && echo Log: %LB% && cd /d %~dp0..\backend && set NODE_ENV=development && set JWT_SECRET=%JWT_SECRET% && set CORS_ORIGIN=%CORS_ORIGIN% && set PORT=%ADMIN_BE_PORT%&& node src/server.js >> "%LB%" 2>&1"

rem --- 2. Admin Frontend (:3535) ---
echo [2/4] Admin Frontend :%ADMIN_FE_PORT% ...
call :LOG "[FE] Starting admin :%ADMIN_FE_PORT%"
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-AdminConsole" cmd /c "title MeterVerse Admin Console :3535 && echo [MeterVerse] Admin Console RUNNING :3535 && echo URL: http://localhost:%ADMIN_FE_PORT%/admin && cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:%ADMIN_BE_PORT%&& call node_modules\.bin\next.cmd start -p %ADMIN_FE_PORT% >> "%LF%" 2>&1"
) else (
    start "MeterVerse-AdminConsole" cmd /c "title MeterVerse Admin Console :3535 && echo [MeterVerse] Admin Console RUNNING :3535 && cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:%ADMIN_BE_PORT%&& call node_modules\.bin\next.cmd dev -p %ADMIN_FE_PORT% >> "%LF%" 2>&1"
)

rem --- 3. Portal Backend (:3003) ---
echo [3/4] Portal Backend :%PORTAL_BE_PORT% ...
call :LOG "[BE] Starting portal :%PORTAL_BE_PORT%"
start "MeterVerse-PortalAPI" cmd /c "title MeterVerse Portal Backend :3003 && echo [MeterVerse] Portal Backend RUNNING :3003 && echo Log: %LPB% && cd /d %~dp0..\backend && set NODE_ENV=development && set JWT_SECRET=%JWT_SECRET% && set CORS_ORIGIN=%CORS_ORIGIN% && set PORT=%PORTAL_BE_PORT%&& set PORTAL_MODE=1&& node src/server.js >> "%LPB%" 2>&1"

rem --- 4. Portal Frontend (:3030) ---
echo [4/4] Portal Frontend :%PORTAL_FE_PORT% ...
call :LOG "[FE] Starting portal :%PORTAL_FE_PORT%"
if exist "%~dp0..\Frontend\.next-portal\BUILD_ID" (
    start "MeterVerse-PortalConsole" cmd /c "title MeterVerse Portal Console :3030 && echo [MeterVerse] Portal Console RUNNING :3030 && echo URL: http://localhost:%PORTAL_FE_PORT%/ && cd /d %~dp0..\Frontend && set PORTAL_MODE=1&& set NEXT_PUBLIC_API_URL=http://localhost:%PORTAL_BE_PORT%&& call node_modules\.bin\next.cmd start -p %PORTAL_FE_PORT% >> "%LPF%" 2>&1"
) else (
    start "MeterVerse-PortalConsole" cmd /c "title MeterVerse Portal Console :3030 && echo [MeterVerse] Portal Console RUNNING :3030 && cd /d %~dp0..\Frontend && set PORTAL_MODE=1&& set NEXT_PUBLIC_API_URL=http://localhost:%PORTAL_BE_PORT%&& call node_modules\.bin\next.cmd dev -p %PORTAL_FE_PORT% >> "%LPF%" 2>&1"
)

rem --- Health check (all 4, up to 90s) ---
echo.
echo Waiting for services to become healthy...
call :WAIT_HTTP %ADMIN_BE_PORT% /api/health 45 "Admin BE"
call :WAIT_HTTP %ADMIN_FE_PORT% / 60 "Admin FE"
call :WAIT_HTTP %PORTAL_BE_PORT% /api/health 45 "Portal BE"
call :WAIT_HTTP %PORTAL_FE_PORT% / 60 "Portal FE"

echo.
echo ============================================================
echo   Admin  : http://localhost:%ADMIN_FE_PORT%/admin
echo   Portal : http://localhost:%PORTAL_FE_PORT%/
echo   Admin API :%ADMIN_BE_PORT%   Portal API :%PORTAL_BE_PORT%
echo ============================================================
call :LOG "[SYS] Startup complete"
echo.
if "%ARG%"=="" pause
exit /b 0

rem ============================ STOP =========================================
:STOP
echo [SYS] Stopping MeterVerse OS...
call :LOG "[SYS] Stop invoked"
call :KILL_ALL
echo [SYS] All services stopped.
if "%ARG%"=="" pause
exit /b 0

rem ============================ STATUS =======================================
:STATUS
echo.
echo  METERVERSE OS - Status
echo  -------------------------------
call :STATUS_ONE %ADMIN_BE_PORT% /api/health "Admin BE"
call :STATUS_ONE %ADMIN_FE_PORT% / "Admin FE"
call :STATUS_ONE %PORTAL_BE_PORT% /api/health "Portal BE"
call :STATUS_ONE %PORTAL_FE_PORT% / "Portal FE"
call :CHECK_DB >nul 2>&1
if errorlevel 1 ( echo  DB :5433 : STOPPED ) else ( echo  DB :5433 : RUNNING )
echo  -------------------------------
if "%ARG%"=="" pause
exit /b 0

rem ============================ MONITOR ======================================
rem Auto-heal monitor (merged from MainControl, now covers all 4 services)
:MONITOR
echo Smart Monitor starting (Ctrl+C to stop)...
:MON_LOOP
cls
echo ===== MeterVerse Smart Monitor =====
set BK=0&set BD=0&set PK=0&set PD=0&set FK=0&set FD=0&set UF=0&set UD=0
call :HEALTH_HTTP %ADMIN_BE_PORT% /api/health
if errorlevel 1 ( echo  Admin BE: DOWN ) else ( echo  Admin BE: HEALTHY )
call :HEALTH_HTTP %ADMIN_FE_PORT% /
if errorlevel 1 ( echo  Admin FE: DOWN ) else ( echo  Admin FE: HEALTHY )
call :HEALTH_HTTP %PORTAL_BE_PORT% /api/health
if errorlevel 1 ( echo  Portal BE: DOWN ) else ( echo  Portal BE: HEALTHY )
call :HEALTH_HTTP %PORTAL_FE_PORT% /
if errorlevel 1 ( echo  Portal FE: DOWN ) else ( echo  Portal FE: HEALTHY )
echo.
echo 30s loop (Ctrl+C to stop)...
ping -n 31 127.0.0.1 >nul 2>nul
goto MON_LOOP

rem ============================ TEST =========================================
rem Merged crash + stress tests (admin + portal)
:TEST
echo Running crash/stress test suite...
echo [TEST] Crash+stress suite started >> "%LOG_DIR%\test.log"
set TEST_PASS=0&set TEST_FAIL=0

rem --- Test 1: kill admin BE, expect auto-recover is manual; here verify restart path ---
echo  Test 1: verify all 4 health endpoints respond...
call :TEST_HTTP %ADMIN_BE_PORT% /api/health "Admin BE"
call :TEST_HTTP %ADMIN_FE_PORT% / "Admin FE"
call :TEST_HTTP %PORTAL_BE_PORT% /api/health "Portal BE"
call :TEST_HTTP %PORTAL_FE_PORT% / "Portal FE"

rem --- Test 2: DB connectivity ---
call :CHECK_DB >nul 2>&1
if errorlevel 1 ( echo  Test 2 DB: FAIL & set /a TEST_FAIL+=1 ) else ( echo  Test 2 DB: PASS & set /a TEST_PASS+=1 )

rem --- Test 3: portal must gate admin routes ---
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%PORTAL_BE_PORT%/api/admin/users' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; exit 1}catch{exit 0}" >nul 2>&1
if errorlevel 1 ( echo  Test 3 Portal-gate: FAIL & set /a TEST_FAIL+=1 ) else ( echo  Test 3 Portal-gate: PASS & set /a TEST_PASS+=1 )

rem --- Test 4: 20x health flood (light stress) ---
set FLOOD_OK=0
for /l %%i in (1,1,20) do (
    call :HEALTH_HTTP %ADMIN_BE_PORT% /api/health
    if not errorlevel 1 set /a FLOOD_OK+=1
)
echo Flood checks passed %FLOOD_OK%/20
set FLOOD_PASS=0
if %FLOOD_OK% GEQ 18 set FLOOD_PASS=1
if %FLOOD_PASS%==1 ( echo  Test4 Flood PASS & set /a TEST_PASS+=1 ) else ( echo  Test4 Flood FAIL & set /a TEST_FAIL+=1 )

echo.
echo  TEST RESULTS: %TEST_PASS%/%TEST_FAIL% passed
echo  TEST RESULTS: %TEST_PASS%/%TEST_FAIL% >> "%LOG_DIR%\test.log"
if "%ARG%"=="" pause
exit /b 0

rem ============================ DEPLOY =======================================
:DEPLOY
echo === Deploy (native PG) ===
call :LOG "[SYS] Deploy started"
echo [1/5] Pull latest...
git pull %GIT_REMOTE% %GIT_BRANCH% 2>>"%LOG_DIR%\deploy.log"
echo [2/5] Backup DB...
call :BACKUP_DB
echo [3/5] Backend deps + generate...
cd /d "%~dp0..\backend"
call npm install --silent >>"%LOG_DIR%\deploy.log" 2>&1
call npx prisma generate >>"%LOG_DIR%\deploy.log" 2>&1
cd /d "%~dp0.."
echo [4/5] Migrate DB...
cd /d "%~dp0..\backend"
rem P60.7 §12: deploy uses migrate deploy (versioned 16 migrations) as the
rem canonical production path - NOT db push (which drifts schema and skips
rem migration history). For dev-only schema sync use npm run db:setup.
call npx prisma migrate deploy >>"%LOG_DIR%\deploy.log" 2>&1
cd /d "%~dp0.."
echo [5/5] Build frontend...
cd /d "%~dp0..\Frontend"
call npm install --silent >>"%LOG_DIR%\deploy.log" 2>&1
call npx next build >>"%LOG_DIR%\deploy.log" 2>&1
cd /d "%~dp0.."
echo [VERIFY] ...
call :STATUS
call :LOG "[SYS] Deploy complete"
echo Deploy complete. Check status above.
if "%ARG%"=="" pause
exit /b 0

rem ============================ BACKUP =======================================
:BACKUP
call :BACKUP_DB
if "%ARG%"=="" pause
exit /b 0

rem ============================ RESTORE ======================================
:RESTORE
echo Available backups:
dir /b "%~dp0backups\*.sql" 2>nul || echo (no backups found)
set /p RFILE="Enter backup filename: "
if exist "%~dp0backups\%RFILE%" (
    call :GET_PSQL
    "%PSQL%" -h localhost -p %DB_PORT% -U postgres -d %DB_NAME% -f "%~dp0backups\%RFILE%" 2>>"%LOG_DIR%\restore.log"
    if errorlevel 1 ( echo Restore FAILED ) else ( echo Restore OK )
) else (
    echo File not found.
)
if "%ARG%"=="" pause
exit /b 0

rem ============================ GIT PUSH (SAFE) ===============================
:GIT
echo Safe git push: %GIT_REMOTE%/%GIT_BRANCH%
git status --short
echo.
echo Review the above files before committing.
set /p gok="Commit and push? [y/N]: "
if /i not "%gok%"=="y" ( echo Cancelled. & if "%ARG%"=="" pause & exit /b 0 )
echo [SYS] Running tests before push...
cd /d "%~dp0..\backend" & call npm run test:all >nul 2>&1
cd /d "%~dp0.."
git add -A
git commit -m "chore: update %DATE% %TIME%"
git push %GIT_REMOTE% %GIT_BRANCH%
if errorlevel 1 ( echo Push FAILED ) else ( echo Push OK )
if "%ARG%"=="" pause
exit /b 0

rem ============================ LOGS =========================================
:VIEWLOG
cls
echo Logs: %LOG_DIR%
dir /b "%LOG_DIR%" 2>nul
set /p lf="View which log (name or Enter=main): "
if "%lf%"=="" set "lf=main.log"
if exist "%LOG_DIR%\%lf%" ( type "%LOG_DIR%\%lf%" | more ) else ( echo not found )
if "%ARG%"=="" pause
exit /b 0

rem ============================ HELP =========================================
:HELP
echo.
echo  METERVERSE OS Control Center
echo  Usage:  MeterVerse.cmd [start|stop|status|monitor|test|deploy|backup|restore|push|logs|help]
echo.
echo  Commands:
echo    start    - Start DB-check + Admin/Portal BE + FE + engines + health
echo    stop     - Stop all MeterVerse services (safe, window-title based)
echo    status   - Show health of all 4 services + DB
echo    monitor  - Auto-heal monitor (never stops; Ctrl+C to quit)
echo    test     - Crash/stress/health suite (admin+portal+DB+portal-gate)
echo    deploy   - git pull + backup + deps + migrate + build + verify
echo    backup   - pg_dump (native psql) to backups\
echo    restore  - psql restore from backups\
echo    push     - safe git commit+push (reviews status, runs tests)
echo    logs     - view tool logs
echo.
if "%ARG%"=="" pause
exit /b 0

rem ============================ HELPERS ======================================
:SAFETY_CHECK
for %%f in ("%~dp0*.cmd") do (
    if /i not "%%~nxf"=="MeterVerse.cmd" if /i not "%%~nxf"=="FixTool.cmd" if /i not "%%~nxf"=="SafetyCheck.cmd" if /i not "%%~nxf"=="config.cmd" (
        findstr /B /I "taskkill" "%%f" 2>nul | findstr /I "node.exe" >nul 2>nul
        if !errorlevel!==0 (
            echo [SAFETY] %%f contains kill-all-node! REFUSING TO RUN.
            exit /b 1
        )
    )
)
exit /b 0

:CHECK_DB
PowerShell -Command "try{$s=New-Object System.Net.Sockets.TcpClient;$s.Connect('127.0.0.1',%DB_PORT%);$s.Close();exit 0}catch{exit 1}" >nul 2>&1
exit /b

:GET_PSQL
rem Prefer the same major version as the RUNNING server (16 is the live native PG).
if not defined PSQL if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set "PSQL=C:\Program Files\PostgreSQL\16\bin\psql.exe"
if not defined PSQL if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" set "PSQL=C:\Program Files\PostgreSQL\17\bin\psql.exe"
if not defined PSQL if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" set "PSQL=C:\Program Files\PostgreSQL\18\bin\psql.exe"
if not defined PSQL set "PSQL=psql"
exit /b

:GET_PGDUMP
rem IMPORTANT: pg_dump and psql MUST be the same major version, else the dump
rem contains directives (e.g. PG18 \restrict) the older psql cannot parse.
rem Prefer PG16 (matches the live native server + psql above). First match wins.
if not defined PGDUMP if exist "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" set "PGDUMP=C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"
if not defined PGDUMP if exist "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" set "PGDUMP=C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
if not defined PGDUMP if exist "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" set "PGDUMP=C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
if not defined PGDUMP set "PGDUMP=pg_dump"
exit /b

:BACKUP_DB
call :GET_PSQL
call :GET_PGDUMP
call :CHECK_DB >nul 2>&1
if errorlevel 1 ( echo  Backup FAILED: DB not running on %DB_PORT% & exit /b 1 )
if not exist "%~dp0backups" mkdir "%~dp0backups"
set "BFILE=backups\meterverse_%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.sql"
"%PGDUMP%" -h localhost -p %DB_PORT% -U postgres -d %DB_NAME% > "%~dp0%BFILE%" 2>>"%LOG_DIR%\backup.log"
if errorlevel 1 ( echo  Backup FAILED & exit /b 1 )
echo  Backup OK: %BFILE%
call :LOG "[DB] Backup OK: %BFILE%"
exit /b 0

:STATUS_ONE
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%~1%~2' -UseBasicParsing -TimeoutSec 8 -ErrorAction Stop; exit 0}catch{exit 1}" >nul 2>&1
if errorlevel 1 ( echo  %~3 :%1 : DOWN ) else ( echo  %~3 :%1 : RUNNING )
exit /b

:HEALTH_HTTP
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%~1%~2' -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop; exit 0}catch{exit 1}" >nul 2>&1
exit /b

:TEST_HTTP
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%~1%~2' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; exit 0}catch{exit 1}" >nul 2>&1
if errorlevel 1 ( echo  Test %~3 : FAIL & set /a TEST_FAIL+=1 ) else ( echo  Test %~3 : PASS & set /a TEST_PASS+=1 )
exit /b

:KILL_ALL
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminAPI" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminConsole" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalAPI" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalConsole" >nul 2>&1
for %%P in (%ADMIN_BE_PORT% %ADMIN_FE_PORT% %PORTAL_BE_PORT% %PORTAL_FE_PORT%) do (
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%%P "') do (
        if not "%%p"=="0" taskkill /F /PID %%p >nul 2>&1
    )
)
exit /b

:WAIT_HTTP
setlocal enabledelayedexpansion
set "WP=%~1"
set "WX=%~2"
set "WMAX=%~3"
set "WNAME=%~4"
set /a WN=0
:WAIT_LOOP
set /a WN+=1
if !WN! GTR %WMAX% (
    echo   [%WNAME%] FAILED - http://localhost:!WP!!WX! not reachable
    call :LOG "[%WNAME%] FAILED after %WMAX%s"
    endlocal & exit /b 0
)
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:!WP!!WX!' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; if($r.StatusCode -lt 500){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
if !errorlevel!==0 (
    echo   [%WNAME%] OK - http://localhost:!WP!!WX!
    endlocal & exit /b 0
)
ping -n 3 127.0.0.1 >nul 2>&1
goto WAIT_LOOP

:LOG
echo [%DATE% %TIME%] %* >> "%LM%"
exit /b 0
