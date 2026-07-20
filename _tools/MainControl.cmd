@echo off
title MeterVerse System
cd /d "%~dp0.."
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════════════════════
::  CONFIG
:: ═══════════════════════════════════════════════════════════════════════════════
set BE_PORT=3001
set FE_PORT=7400
set LD=%~dp0logs
set LM=%LD%\main.log
set LE=%LD%\errors.log
set LB=%LD%\backend.log
set LF=%LD%\frontend.log
set LR=%LD%\report.log

if not exist "%LD%" mkdir "%LD%"

:: Service state
set BE_ATTEMPT=0
set FE_ATTEMPT=0
set BE_SLEEP=0
set FE_SLEEP=0
set MAX_ATTEMPT=10

:: Init logs
echo ═══════════════════════════════════════ > "%LM%"
echo [%DATE% %TIME%] MeterVerse System v5 STARTED >> "%LM%"
echo ═══════════════════════════════════════ >> "%LM%"
echo [%DATE% %TIME%] [SYS] Started > "%LE%"

:: ─── AUTO-START IF ARGUMENT ─────────────────────────────────────────────────
if not "%1"=="" if "%1"=="1" goto START

:MENU
cls
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║      MeterVerse System v5                ║
echo  ║      "Self-Healing Engine"               ║
echo  ╠══════════════════════════════════════════╣
echo  ║                                          ║
echo  ║  1. START All Services + Monitor         ║
echo  ║  2. View Status                          ║
echo  ║  3. Git Push to GitHub                   ║
echo  ║  4. View Error Report                    ║
echo  ║  5. View Full Log                        ║
echo  ║  6. Stop All Services                    ║
echo  ║  7. Exit                                 ║
echo  ║                                          ║
echo  ╚══════════════════════════════════════════╝
echo.
set /p ch="Select: "
if "%ch%"=="1" goto START
if "%ch%"=="2" goto STATUS
if "%ch%"=="3" goto GIT
if "%ch%"=="4" goto REPORT
if "%ch%"=="5" goto VIEWLOG
if "%ch%"=="6" goto STOP
if "%ch%"=="7" exit
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  START → MONITOR (never exits)
:: ═══════════════════════════════════════════════════════════════════════════════
:START
cls
echo.
echo ═══════════════════════════════════════
echo  Starting MeterVerse Services
echo ═══════════════════════════════════════
echo.

:: Clean
call :LOG "SYS" "Cleaning old processes..."
taskkill /F /IM node.exe 2>nul >nul
timeout /t 2 /nobreak >nul

:: ─── Start Backend ───────────────────────────────────────────────────────────
echo [1/2] Starting Backend...
call :LOG "BE" "Launching on port %BE_PORT%"
start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1
call :LOG "BE" "Process launched, waiting..."

:: Wait up to 30s
set READY=0
for /l %%i in (1,1,10) do (
    timeout /t 3 /nobreak >nul
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
    if !errorlevel!==0 set READY=1 & goto BE_OK
)
:BE_OK
if !READY!==1 (
    echo   ✅ Backend ready
    call :LOG "BE" "Ready"
) else (
    echo   ❌ Backend failed
    call :ERR "BE" "Failed to start"
)

:: ─── Start Frontend ──────────────────────────────────────────────────────────
echo [2/2] Starting Frontend...
call :LOG "FE" "Launching on port %FE_PORT%"
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1
    call :LOG "FE" "Production mode"
) else (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1
    call :LOG "FE" "Dev mode"
)

echo.
echo  📍 http://localhost:%FE_PORT%/admin
echo  🔑 admin@meterverse.com / Admin@123
echo.
call :LOG "SYS" "=== MONITOR STARTED ==="

:: ═══════════════════════════════════════════════════════════════════════════════
::  MONITOR LOOP — NEVER EXITS
:: ═══════════════════════════════════════════════════════════════════════════════
:MONITOR
cls
echo.
echo ╔══════════════════════════════════════════════╗
echo ║     MeterVerse — Self-Healing Monitor        ║
echo ╠══════════════════════════════════════════════╣
echo ║                                              ║
echo ║  📍 http://localhost:%FE_PORT%/admin            ║
echo ║  🔑 admin@meterverse.com / Admin@123           ║
echo ║                                              ║
echo ║  Backend : !BE_SLEEP! attempts=!BE_ATTEMPT!    ║
echo ║  Frontend: !FE_SLEEP! attempts=!FE_ATTEMPT!    ║
echo ║                                              ║
echo ║  [G] Git Push   [R] View Report              ║
echo ║  [S] Status     [Q] Stop Monitoring          ║
echo ║  (Ctrl+C to stop monitoring anytime)          ║
echo ╚══════════════════════════════════════════════╝
echo.

:: ═══ HEALTH CHECK ═══════════════════════════════════════════════════════════
set BK=0
set FK=0

:: Check Backend
if !BE_SLEEP!==0 (
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" 2>nul
    if !errorlevel!==0 ( set BK=1 & set BE_ATTEMPT=0 & echo  ✅ Backend: HEALTHY ) else ( set /a BE_ATTEMPT+=1 & echo  ❌ Backend: FAILED x!BE_ATTEMPT! )
) else (
    echo  💤 Backend: SLEEPING (failed !BE_ATTEMPT! times)
)

:: Check Frontend
if !FE_SLEEP!==0 (
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" 2>nul
    if !errorlevel!==0 ( set FK=1 & set FE_ATTEMPT=0 & echo  ✅ Frontend: HEALTHY ) else ( set /a FE_ATTEMPT+=1 & echo  ❌ Frontend: FAILED x!FE_ATTEMPT! )
) else (
    echo  💤 Frontend: SLEEPING (failed !FE_ATTEMPT! times)
)

:: ═══ FIX ENGINE ════════════════════════════════════════════════════════════

:: Fix Backend
if !BK!==0 if !BE_SLEEP!==0 (
    echo.
    call :FIX "BE"
    if !BE_SLEEP!==1 echo  → Backend moved to SLEEP mode. Check _tools\logs\errors.log
)

:: Fix Frontend
if !FK!==0 if !FE_SLEEP!==0 (
    echo.
    call :FIX "FE"
    if !FE_SLEEP!==1 echo  → Frontend moved to SLEEP mode. Check _tools\logs\errors.log
)

:: ═══ LOG STATUS ═════════════════════════════════════════════════════════════
call :LOG "MON" "BK=%BK% FK=%FK% BEatt=%BE_ATTEMPT% FEatt=%FE_ATTEMPT% BEsleep=%BE_SLEEP% FEsleep=%FE_SLEEP%"

:: ═══ WAIT 30s ══════════════════════════════════════════════════════════════
echo.
echo  Next check in 30 seconds...
echo  (Ctrl+C to stop monitoring — services keep running)
ping -n 31 127.0.0.1 >nul 2>nul
goto MONITOR

:: ═══════════════════════════════════════════════════════════════════════════════
::  FIX ENGINE
:: ═══════════════════════════════════════════════════════════════════════════════
:FIX
set SVC=%1

if /i "%SVC%"=="BE" (
    call :ERR "%SVC%" "Fixing (attempt !BE_ATTEMPT!/%MAX_ATTEMPT%)"
    echo  🔧 Fixing Backend (attempt !BE_ATTEMPT!/%MAX_ATTEMPT%)...

    if !BE_ATTEMPT! GEQ %MAX_ATTEMPT% (
        echo  ⚠ Max attempts reached. Putting Backend to SLEEP.
        call :ERR "%SVC%" "MAX ATTEMPTS REACHED — moved to SLEEP"
        set BE_SLEEP=1
        echo [%DATE% %TIME%] [BE] SLEEP MODE — user intervention needed >> "%LE%"
        goto :EOF
    )

    :: Strategy rotates: 0=restart, 1=kill+restart, 2=force+wait
    set /a STRAT=!BE_ATTEMPT! %% 3

    :: Kill any existing before starting
    taskkill /F /IM node.exe 2>nul >nul
    timeout /t 2 /nobreak >nul

    if !STRAT!==0 (
        call :LOG "%SVC%" "Strategy 0: Soft restart"
    )
    if !STRAT!==1 (
        call :LOG "%SVC%" "Strategy 1: Kill + restart"
        timeout /t 3 /nobreak >nul
    )
    if !STRAT! GEQ 2 (
        call :LOG "%SVC%" "Strategy 2: Full reset"
        taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
        timeout /t 5 /nobreak >nul
        where node >nul 2>nul
        if !errorlevel!==1 ( call :ERR "%SVC%" "node.js not found in PATH!" & set BE_SLEEP=1 & goto :EOF )
    )

    :: Launch
    start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1
    call :LOG "%SVC%" "Launched (strategy !STRAT!)"

    :: Verify process started
    timeout /t 5 /nobreak >nul
    tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr /I "node.exe" >nul 2>nul
    if !errorlevel!==0 ( call :LOG "%SVC%" "Process confirmed running" ) else ( call :ERR "%SVC%" "Process NOT found after launch" )

    call :ERR "%SVC%" "Fix attempt !BE_ATTEMPT! complete (strategy !STRAT!)"
    goto :EOF
)

if /i "%SVC%"=="FE" (
    call :ERR "%SVC%" "Fixing (attempt !FE_ATTEMPT!/%MAX_ATTEMPT%)"
    echo  🔧 Fixing Frontend (attempt !FE_ATTEMPT!/%MAX_ATTEMPT%)...

    if !FE_ATTEMPT! GEQ %MAX_ATTEMPT% (
        echo  ⚠ Max attempts reached. Putting Frontend to SLEEP.
        call :ERR "%SVC%" "MAX ATTEMPTS REACHED — moved to SLEEP"
        set FE_SLEEP=1
        echo [%DATE% %TIME%] [FE] SLEEP MODE — user intervention needed >> "%LE%"
        goto :EOF
    )

    set /a STRAT=!FE_ATTEMPT! %% 3

    :: Clear any stuck processes
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend*" 2>nul >nul
    taskkill /F /IM node.exe 2>nul >nul
    timeout /t 2 /nobreak >nul

    if !STRAT!==0 (
        call :LOG "%SVC%" "Strategy 0: Soft restart"
    )
    if !STRAT!==1 (
        call :LOG "%SVC%" "Strategy 1: Clear cache + restart"
        if exist "%~dp0..\Frontend\.next\cache" rmdir /s /q "%~dp0..\Frontend\.next\cache" 2>nul >nul
    )
    if !STRAT! GEQ 2 (
        call :LOG "%SVC%" "Strategy 2: Full reset"
        taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
        timeout /t 5 /nobreak >nul
    )

    :: Launch
    if exist "%~dp0..\Frontend\.next\BUILD_ID" (
        start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1
    ) else (
        start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1
    )
    call :LOG "%SVC%" "Launched (strategy !STRAT!)"

    :: Verify process started
    timeout /t 5 /nobreak >nul
    tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr /I "node.exe" >nul 2>nul
    if !errorlevel!==0 ( call :LOG "%SVC%" "Process confirmed running" ) else ( call :ERR "%SVC%" "Process NOT found after launch" )

    call :ERR "%SVC%" "Fix attempt !FE_ATTEMPT! complete (strategy !STRAT!)"
    goto :EOF
)
goto :EOF

:: ═══════════════════════════════════════════════════════════════════════════════
::  MENU ACTIONS
:: ═══════════════════════════════════════════════════════════════════════════════
:GIT
cls
echo.
call :LOG "GIT" "Push started"
echo Pushing to GitHub...
git add -A 2>nul
git commit -m "Auto-update %DATE% %TIME%" 2>nul
git push origin clean-main:main 2>nul
if %errorlevel%==0 (echo OK & call :LOG "GIT" "Success") else (echo FAIL & call :ERR "GIT" "Push failed")
call :LOG "GIT" "Push done"
pause & goto MENU

:STATUS
cls
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo BE: RUNNING) else (echo BE: STOPPED)
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo FE: RUNNING) else (echo FE: STOPPED)
echo BE attempts: %BE_ATTEMPT%  FE attempts: %FE_ATTEMPT%
echo BE sleep: %BE_SLEEP%  FE sleep: %FE_SLEEP%
pause & goto MENU

:REPORT
cls
echo ═══ Error Report ═══
echo.
if exist "%LE%" (
    type "%LE%" | more
) else (
    echo (no errors)
)
echo.
echo Report file: %LE%
echo Full log: %LM%
pause & goto MENU

:VIEWLOG
cls
type "%LM%" | more
pause & goto MENU

:STOP
cls
echo Stopping...
taskkill /F /IM node.exe 2>nul >nul
set BE_SLEEP=0&set FE_SLEEP=0&set BE_ATTEMPT=0&set FE_ATTEMPT=0
call :LOG "SYS" "Services stopped"
echo Done.
pause & goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  LOGGING
:: ═══════════════════════════════════════════════════════════════════════════════
:LOG
echo [%DATE% %TIME%] [%~1] %~2 >> "%LM%"
exit /b

:ERR
echo ═══ ERROR ═══ >> "%LE%"
echo [%DATE% %TIME%] [%~1] %~2 >> "%LE%"
echo [%DATE% %TIME%] [%~1] %~2 >> "%LM%"
exit /b
