@echo off
:: ============================================================================
:: METERVERSE OS - NATIVE RUNTIME CONTROLLER (P13.5 certified)
:: Repository-owned, session-independent, NO Docker.
:: Uses WMI process creation (survives any shell/session) for services.
::
:: Usage:
::   Runtime.cmd status
::   Runtime.cmd start
::   Runtime.cmd stop
::   Runtime.cmd restart
::   Runtime.cmd health
::   Runtime.cmd doctor
:: ============================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0.."
call "%~dp0config.cmd"

set "ARG=%~1"
if "%ARG%"=="" set "ARG=status"

:: ---- helper: is port listening? (%1=port) returns 0/1 via !PORT_%1! ----
:: (kept simple inline per call)

if /i "%ARG%"=="doctor" goto DOCTOR
if /i "%ARG%"=="status" goto STATUS
if /i "%ARG%"=="start" goto START
if /i "%ARG%"=="stop" goto STOP
if /i "%ARG%"=="restart" goto RESTART
if /i "%ARG%"=="health" goto HEALTH
echo Usage: Runtime.cmd [status^|start^|stop^|restart^|health^|doctor]
exit /b 1

:STATUS
echo [RUNTIME] status:
call :PORTCHECK 5433 "PostgreSQL"
call :PORTCHECK 3131 "Admin Backend"
call :PORTCHECK 3535 "Admin Frontend"
call :PORTCHECK 3003 "Portal Backend"
call :PORTCHECK 3030 "Portal Frontend"
goto :EOF

:START
echo [RUNTIME] start (dependency order: PG -> BE -> FE)
call :PORTCHECK 5433 "PostgreSQL"
if "!PORT_5433!"=="0" (
  echo   [PG] starting...
  call "%~dp0start-native-pg.cmd"
  timeout /t 8 /nobreak >nul
)
call :PORTCHECK 3131 "Admin Backend"
if "!PORT_3131!"=="0" (
  echo   [BE] starting...
  start "MeterVerse-AdminAPI" /min cmd /c "call "%~dp0experiment-be.cmd""
)
call :PORTCHECK 3535 "Admin Frontend"
if "!PORT_3535!"=="0" (
  echo   [FE] starting...
  call "%~dp0start-admin-fe.cmd"
)
goto HEALTH

:STOP
echo [RUNTIME] stop
call :STOPPORT 3131 "Admin Backend"
call :STOPPORT 3003 "Portal Backend"
call :STOPPORT 3535 "Admin Frontend"
call :STOPPORT 3030 "Portal Frontend"
echo [RUNTIME] stop complete (PostgreSQL left running by design - safe native data store)
goto :EOF

:RESTART
call :STOPPORT 3131 "Admin Backend"
call :STOPPORT 3535 "Admin Frontend"
timeout /t 2 /nobreak >nul
call :PORTCHECK 5433 "PostgreSQL"
if "!PORT_5433!"=="0" (
  echo   [PG] starting...
  call "%~dp0start-native-pg.cmd"
  timeout /t 8 /nobreak >nul
)
echo   [BE] starting...
call "%~dp0experiment-be.cmd"
echo   [FE] starting...
call "%~dp0start-admin-fe.cmd"
goto HEALTH

:HEALTH
echo [RUNTIME] health:
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3131/api/health' -TimeoutSec 5 -UseBasicParsing; '  BE /api/health = '+$r.StatusCode+' '+$r.Content.Substring(0,[Math]::Min(40,$r.Content.Length))}catch{'  BE /api/health = DOWN ('+$_.Exception.Message+')'}"
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3535/login' -TimeoutSec 5 -UseBasicParsing; '  FE /login = '+$r.StatusCode}catch{'  FE /login = DOWN'}"
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3535/api/health' -TimeoutSec 5 -UseBasicParsing; '  FE->BE proxy = '+$r.StatusCode}catch{'  FE->BE proxy = DOWN'}"
goto :EOF

:DOCTOR
call "%~dp0Doctor.cmd"
goto :EOF

:PORTCHECK
powershell -NoProfile -Command "$c=Get-NetTCPConnection -State Listen -LocalPort %1 -ErrorAction SilentlyContinue; if($c){'UP'}else{'DOWN'}" > "%LOG_DIR%\rt_port%1.txt" 2>&1
set /p PV=<"%LOG_DIR%\rt_port%1.txt"
if "!PV!"=="UP" (
  echo   [%2] :%1 UP
  set "PORT_%1=1"
) else (
  echo   [%2] :%1 DOWN
  set "PORT_%1=0"
)
exit /b 0

:STOPPORT
powershell -NoProfile -Command "$c=Get-NetTCPConnection -State Listen -LocalPort %1 -ErrorAction SilentlyContinue; if($c){Stop-Process -Id $c.OwningProcess -Force; 'stopped'}else{'none'}" > "%LOG_DIR%\rt_stop%1.txt" 2>&1
set /p SV=<"%LOG_DIR%\rt_stop%1.txt"
echo   [%2] :%1 !SV!
exit /b 0
