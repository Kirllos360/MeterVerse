@echo off
title MeterVerse System
cd /d "%~dp0.."
setlocal enabledelayedexpansion

call "%~dp0SafetyCheck.cmd"
if %errorlevel%==1 exit /b 1

set BE_PORT=3001
set FE_PORT=7400
set LD=%~dp0logs
set LM=%LD%\main.log
set LE=%LD%\errors.log
set LB=%LD%\backend.log
set LF=%LD%\frontend.log

if not exist "%LD%" mkdir "%LD%"
set BE_ATT=0&set FE_ATT=0
set BE_SLP=0&set FE_SLP=0
set BE_DGR=0&set FE_DGR=0
set MAX_ATT=15
set SLEEP_WAIT=30

echo [%DATE% %TIME%] [SYS] MeterVerse System v6 STARTED >> "%LM%"
if not "%1"=="" if "%1"=="1" goto START

:MENU
cls
echo.
echo  ===== MeterVerse System v6 =====
echo.
echo  1. Start Services + Smart Monitor
echo  2. Stop Services
echo  3. Git Push
echo  4. Status
echo  5. View Logs
echo  6. Exit
echo.
set /p ch="Select: "
if "%ch%"=="1" goto START
if "%ch%"=="2" goto STOP
if "%ch%"=="3" goto GIT
if "%ch%"=="4" goto STATUS
if "%ch%"=="5" goto VIEWLOG
if "%ch%"=="6" exit
goto MENU

:START
cls
echo Starting MeterVerse services...

:: Safe kill
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 2 /nobreak >nul

:: Launch Backend
echo [1] Starting Backend...
echo [%DATE% %TIME%] [BE] Starting >> "%LM%"
start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1

:: Wait for backend HTTP health (up to 30s)
set READY=0
for /l %%i in (1,1,10) do (
    timeout /t 3 /nobreak >nul
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" 2>nul
    if !errorlevel!==0 set READY=1 & goto BE_READY
)
:BE_READY
if !READY!==1 ( echo   Backend ready ) else ( echo   Backend may not be ready )

:: Launch Frontend
echo [2] Starting Frontend...
echo [%DATE% %TIME%] [FE] Starting >> "%LM%"
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1
) else (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1
)

echo.
echo http://localhost:%FE_PORT%/admin
echo admin@meterverse.com / Admin@123
echo.
echo [%DATE% %TIME%] [SYS] Launched >> "%LM%"
echo Monitor starting (never stops)...

:: ═══════════════════════════════════════════════════════════════════════════════
::  SMART MONITOR — checks health, detects degraded, auto-heals, SLEEP recovery
:: ═══════════════════════════════════════════════════════════════════════════════
:MONITOR
cls
echo.
echo ===== MeterVerse Smart Monitor =====
echo.

:: ─── CHECK BACKEND ───────────────────────────────────────────────────────────
set BK=0&set BD=0
if !BE_SLP!==0 (
    :: Check 1: Window exists?
    tasklist /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul | findstr /I "node.exe" >nul 2>nul
    if !errorlevel!==0 (
        :: Check 2: HTTP health?
        PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" 2>nul
        if !errorlevel!==0 ( set BK=1 & set BE_ATT=0 & echo BE: HEALTHY ) else ( set BD=1 & set /a BE_ATT+=1 & echo BE: DEGRADED x!BE_ATT! )
    ) else (
        set /a BE_ATT+=1 & echo BE: DOWN x!BE_ATT!
    )
) else (
    echo BE: SLEEPING (auto-recovery in !SLEEP_WAIT!s)
    set /a SLEEP_WAIT-=30
    if !SLEEP_WAIT! LEQ 0 ( set BE_SLP=0 & set BE_ATT=0 & set SLEEP_WAIT=30 & echo BE: WAKING UP... )
)

:: ─── CHECK FRONTEND ──────────────────────────────────────────────────────────
set FK=0&set FD=0
if !FE_SLP!==0 (
    tasklist /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul | findstr /I "node.exe" >nul 2>nul
    if !errorlevel!==0 (
        PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" 2>nul
        if !errorlevel!==0 ( set FK=1 & set FE_ATT=0 & echo FE: HEALTHY ) else ( set FD=1 & set /a FE_ATT+=1 & echo FE: DEGRADED x!FE_ATT! )
    ) else (
        set /a FE_ATT+=1 & echo FE: DOWN x!FE_ATT!
    )
) else (
    echo FE: SLEEPING (auto-recovery in !SLEEP_WAIT!s)
)

:: ─── FIX ENGINE — Backend first (dependency), then frontend ──────────────────
if !BE_SLP!==0 if !BK!==0 call :FIX_BE
if !FE_SLP!==0 if !FK!==0 call :FIX_FE

:: ─── FIX ENGINE — Degraded mode (running but unhealthy) ──────────────────────
if !BD!==1 (
    echo  ⚠ Backend degraded — restarting...
    echo [%DATE% %TIME%] [BE] Degraded — restarting >> "%LE%"
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
    timeout /t 2 /nobreak >nul
    start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1
)
if !FD!==1 (
    echo  ⚠ Frontend degraded — restarting...
    echo [%DATE% %TIME%] [FE] Degraded — restarting >> "%LE%"
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
    timeout /t 2 /nobreak >nul
    if exist "%~dp0..\Frontend\.next\BUILD_ID" (
        start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1
    ) else (
        start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1
    )
)

echo [%DATE% %TIME%] [MON] BE=%BK%(%BD%) FE=%FK%(%FD%) >> "%LM%"
echo.
echo 30s loop (Ctrl+C to stop)...
ping -n 31 127.0.0.1 >nul 2>nul
goto MONITOR

:: ═══════════════════════════════════════════════════════════════════════════════
::  FIX: BACKEND
:: ═══════════════════════════════════════════════════════════════════════════════
:FIX_BE
echo Fixing BE (attempt !BE_ATT!/%MAX_ATT%)...
echo [%DATE% %TIME%] [BE] Fix !BE_ATT! >> "%LE%"

if !BE_ATT! GEQ %MAX_ATT% (
    echo  → SLEEP MODE (will retry in 30s)
    echo [%DATE% %TIME%] [BE] SLEEP MODE >> "%LE%"
    set BE_SLP=1&set SLEEP_WAIT=30
    goto :EOF
)

taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
timeout /t 3 /nobreak >nul
start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1
echo [%DATE% %TIME%] [BE] Restarted >> "%LE%"

:: Verify with tasklist
for /l %%i in (1,1,7) do (
    timeout /t 3 /nobreak >nul
    tasklist /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul | findstr /I "node.exe" >nul 2>nul
    if !errorlevel!==0 goto :EOF
)
echo [%DATE% %TIME%] [BE] Warning: window not confirmed >> "%LE%"
goto :EOF

:: ═══════════════════════════════════════════════════════════════════════════════
::  FIX: FRONTEND
:: ═══════════════════════════════════════════════════════════════════════════════
:FIX_FE
echo Fixing FE (attempt !FE_ATT!/%MAX_ATT%)...
echo [%DATE% %TIME%] [FE] Fix !FE_ATT! >> "%LE%"

if !FE_ATT! GEQ %MAX_ATT% (
    echo  → SLEEP MODE (will retry in 30s)
    echo [%DATE% %TIME%] [FE] SLEEP MODE >> "%LE%"
    set FE_SLP=1&set SLEEP_WAIT=30
    goto :EOF
)

taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 3 /nobreak >nul
if exist "%~dp0..\Frontend\.next\cache" rmdir /s /q "%~dp0..\Frontend\.next\cache" 2>nul >nul
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1
) else (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1
)
echo [%DATE% %TIME%] [FE] Restarted >> "%LE%"

for /l %%i in (1,1,7) do (
    timeout /t 3 /nobreak >nul
    tasklist /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul | findstr /I "node.exe" >nul 2>nul
    if !errorlevel!==0 goto :EOF
)
echo [%DATE% %TIME%] [FE] Warning: window not confirmed >> "%LE%"
goto :EOF

:: ═══════════════════════════════════════════════════════════════════════════════
::  MENU
:: ═══════════════════════════════════════════════════════════════════════════════
:STOP
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
set BE_SLP=0&set FE_SLP=0&set BE_ATT=0&set FE_ATT=0
echo [%DATE% %TIME%] [SYS] Stopped >> "%LM%"
echo Done.
pause & goto MENU

:GIT
git add -A 2>nul
git commit -m "Update %DATE% %TIME%" 2>nul
git push origin clean-main:main 2>nul
if %errorlevel%==0 (echo OK) else (echo FAIL)
pause & goto MENU

:STATUS
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo BE: RUNNING) else (echo BE: STOPPED)
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo FE: RUNNING) else (echo FE: STOPPED)
pause & goto MENU

:VIEWLOG
cls
type "%LE%" 2>nul | more
if %errorlevel%==1 echo (no errors)
pause & goto MENU
