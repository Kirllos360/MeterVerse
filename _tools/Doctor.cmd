@echo off
:: ============================================================================
:: METERVERSE OS - DOCTOR (P13.3 native runtime diagnostic)
:: Diagnoses: PostgreSQL, database identity, backend, frontend, ports, RAM,
:: orphan processes. Reports PROBLEM / EVIDENCE / ROOT CAUSE / SAFE ACTION.
:: Safe: never kills unrelated processes (no blanket taskkill /IM node.exe).
:: Usage:  Doctor.cmd           (full diagnostic)
:: ============================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0.."
call "%~dp0config.cmd"

echo ============================================================
echo   METERVERSE OS - DOCTOR
echo ============================================================

rem ---- RAM (FreePhysicalMemory is KB -> /1024 for MB) ----
set "RAM_FREE="
for /f %%a in ('powershell -NoProfile -Command "[math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)"') do set RAM_FREE=%%a
if "%RAM_FREE%"=="" set RAM_FREE=0
echo [RAM] Free ~%RAM_FREE% MB
if %RAM_FREE% LSS 300 goto RAM_LOW
echo   [RAM] OK
goto RAM_DONE
:RAM_LOW
echo   PROBLEM: Insufficient RAM for PostgreSQL (need ~300MB free)
echo   ROOT CAUSE: browser/OpenCode/other apps hold memory
echo   SAFE ACTION: close apps or restart Windows, then rerun
:RAM_DONE

rem ---- PostgreSQL service ----
sc query postgresql >nul 2>&1
if errorlevel 1 goto PG_NOTINST
sc query postgresql | findstr /C:"RUNNING" >nul
if errorlevel 1 goto PG_STOPPED
echo [PG]  PostgreSQL service RUNNING
goto PG_DONE
:PG_NOTINST
echo [PG]  PROBLEM: service 'postgresql' NOT INSTALLED
echo   EVIDENCE: sc query postgresql failed
echo   SAFE ACTION: verify PG16 install (C:\Program Files\PostgreSQL\16)
goto PG_DONE
:PG_STOPPED
echo [PG]  PROBLEM: PostgreSQL service STOPPED
echo   ROOT CAUSE: see RAM above (memory ceiling) or manual stop
echo   SAFE ACTION: net start postgresql (elevated) after freeing RAM
:PG_DONE

rem ---- Port 5433 ----
powershell -NoProfile -Command "$c=Get-NetTCPConnection -State Listen -LocalPort 5433 -ErrorAction SilentlyContinue; if($c){'LISTENING'}else{'DOWN'}" > "%LOG_DIR%\doctor_port.txt" 2>&1
set /p PORT5433=<"%LOG_DIR%\doctor_port.txt"
echo [PORT] 5433 (PG): %PORT5433%
if not "%PORT5433%"=="LISTENING" (
  echo   PROBLEM: PostgreSQL not listening on :5433
  echo   ROOT CAUSE: service stopped / RAM / port conflict
  echo   SAFE ACTION: net start postgresql after freeing RAM
)

rem ---- Database identity (if PG reachable) ----
powershell -NoProfile -Command "try{$c=New-Object System.Net.Sockets.TcpClient;$c.Connect('127.0.0.1',5433);$c.Close();'REACHABLE'}catch{'UNREACHABLE'}" > "%LOG_DIR%\doctor_db.txt" 2>&1
set /p DBREACH=<"%LOG_DIR%\doctor_db.txt"
echo [DB]  :5433 = %DBREACH%
if "%DBREACH%"=="REACHABLE" (
  "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -p 5433 -U postgres -d meter_pulse -tAc "SELECT count(*) FROM \"Customer\";" > "%LOG_DIR%\doctor_count.txt" 2>&1
  set /p CUSTCOUNT=<"%LOG_DIR%\doctor_count.txt"
  echo [DB]  Customer count: %CUSTCOUNT%  (expected ~223)
)

rem ---- Admin backend :3131 ----
powershell -NoProfile -Command "$c=Get-NetTCPConnection -State Listen -LocalPort 3131 -ErrorAction SilentlyContinue; if($c){'LISTENING'}else{'DOWN'}" > "%LOG_DIR%\doctor_be.txt" 2>&1
set /p PORT3131=<"%LOG_DIR%\doctor_be.txt"
echo [BE]  3131 (Admin API): %PORT3131%
if "%PORT3131%"=="LISTENING" (
  powershell -NoProfile -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3131/api/health' -TimeoutSec 5 -UseBasicParsing; 'OK'}catch{'UNHEALTHY'}" > "%LOG_DIR%\doctor_beh.txt" 2>&1
  set /p BEHEALTH=<"%LOG_DIR%\doctor_beh.txt"
  echo [BE]  /api/health = %BEHEALTH%
)

rem ---- Admin frontend :3535 ----
powershell -NoProfile -Command "$c=Get-NetTCPConnection -State Listen -LocalPort 3535 -ErrorAction SilentlyContinue; if($c){'LISTENING'}else{'DOWN'}" > "%LOG_DIR%\doctor_fe.txt" 2>&1
set /p PORT3535=<"%LOG_DIR%\doctor_fe.txt"
echo [FE]  3535 (Admin UI): %PORT3535%

rem ---- Orphan node processes (informational, NO kill) ----
powershell -NoProfile -Command "Get-Process node -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count" > "%LOG_DIR%\doctor_node.txt" 2>&1
set /p NODECOUNT=<"%LOG_DIR%\doctor_node.txt"
echo [PROC] node processes: %NODECOUNT% (informational - not killed)

echo ============================================================
echo   DOCTOR COMPLETE - logs in %LOG_DIR%
echo ============================================================
exit /b 0
