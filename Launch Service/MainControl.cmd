@echo off
title MeterVerse Main Control
cd /d "%~dp0.."
setlocal enabledelayedexpansion

:: ─── CONFIG ───────────────────────────────────────────────────────────────────
set BE_PORT=3001
set FE_PORT=7400
set LOG_DIR=%~dp0logs
:: ───────────────────────────────────────────────────────────────────────────────

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set LOG_FILE=%LOG_DIR%\main.log
set ERROR_LOG=%LOG_DIR%\errors.log

echo [%DATE% %TIME%] === MeterVerse Main Control STARTED === >> %LOG_FILE%

:MENU
cls
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║        MeterVerse Main Control v3.0          ║
echo  ║        "The Brain" — Controls Everything     ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo   [1] START All Services (same window)
echo   [2] STOP All Services
echo   [3] Git Push to GitHub
echo   [4] View Error Log
echo   [5] Service Status
echo   [6] Run Git Push + Start (auto-sequence)
echo   [7] EXIT
echo.
set /p choice="Select (1-7): "
if "%choice%"=="1" goto START_ALL
if "%choice%"=="2" goto STOP_ALL
if "%choice%"=="3" goto GIT_PUSH
if "%choice%"=="4" goto VIEW_LOG
if "%choice%"=="5" goto STATUS
if "%choice%"=="6" goto AUTO
if "%choice%"=="7" exit
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  START ALL — runs everything in THIS window
:: ═══════════════════════════════════════════════════════════════════════════════
:START_ALL
cls
echo.
echo ════════════════════════════════════════
echo   Starting MeterVerse Services
echo ════════════════════════════════════════
echo.

:: Kill old processes
echo [PREP] Cleaning old processes...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
taskkill /F /IM node.exe 2>nul >nul
timeout /t 2 /nobreak >nul
echo   Done.

:: ─── STEP 1: Start Backend ──────────────────────────────────────────────────
echo.
echo [1/3] Starting Backend (port %BE_PORT%)...
echo [%DATE% %TIME%] Starting Backend >> %LOG_FILE%

:: start /b = same window, no new window
start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LOG_DIR%\backend.log" 2>&1

:: Wait for backend (up to 60s)
echo   Waiting for backend...
set WAIT=0
:WAIT_BE
timeout /t 3 /nobreak >nul
set /a WAIT+=3

PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}}catch{exit 1}" 2>nul
if %errorlevel%==0 (
    echo   ✅ Backend ready! (%WAIT%s)
    echo [%DATE% %TIME%] Backend ready (%WAIT%s) >> %LOG_FILE%
) else (
    if %WAIT% LSS 60 goto WAIT_BE
    echo   ⚠ Backend did not respond within 60s
    echo [%DATE% %TIME%] Backend FAILED to start >> %ERROR_LOG%
)

:: ─── STEP 2: Start Frontend ─────────────────────────────────────────────────
echo.
echo [2/3] Starting Frontend (port %FE_PORT%)...
echo [%DATE% %TIME%] Starting Frontend >> %LOG_FILE%

if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LOG_DIR%\frontend.log" 2>&1
) else (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LOG_DIR%\frontend.log" 2>&1
)

echo   Frontend starting (check logs)...

:: ─── STEP 3: Start Monitor ──────────────────────────────────────────────────
echo.
echo [3/3] Starting Monitor...
echo.
echo ════════════════════════════════════════
echo   Services launched. Monitor active.
echo   Press Q to quit monitoring.
echo ════════════════════════════════════════
echo.
echo [%DATE% %TIME%] Monitor started >> %LOG_FILE%

:: ─── MONITOR LOOP ─────────────────────────────────────────────────────────────
:MONITOR
cls
echo.
echo ╔══════════════════════════════════════════════╗
echo ║        MeterVerse — Running in This Window    ║
echo ╠══════════════════════════════════════════════╣
echo ║                                              ║
echo ║  Admin: http://localhost:%FE_PORT%/admin        ║
echo ║  Login: admin@meterverse.com / Admin@123      ║
echo ║                                              ║
echo ║  Auto-refresh every 30 seconds                ║
echo ║  Press Ctrl+C to return to menu               ║
echo ║                                              ║
echo ╚══════════════════════════════════════════════╝
echo.

:: Check health silently (no PowerShell in echo)
set BE_OK=0
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( set BE_OK=1 )

set FE_OK=0
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( set FE_OK=1 )

if !BE_OK!==1 ( echo  ✅ Backend: HEALTHY ) else ( echo  ❌ Backend: DOWN )
if !FE_OK!==1 ( echo  ✅ Frontend: HEALTHY ) else ( echo  ❌ Frontend: DOWN )

:: Auto-restart if down (without blocking)
if !BE_OK!==0 (
    echo  ⚠ Backend down at %DATE% %TIME% >> "%LOG_DIR%\errors.log"
    start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LOG_DIR%\backend.log" 2>&1
    echo  → Restart issued
)
if !FE_OK!==0 (
    echo  ⚠ Frontend down at %DATE% %TIME% >> "%LOG_DIR%\errors.log"
    if exist "%~dp0..\Frontend\.next\BUILD_ID" (
        start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LOG_DIR%\frontend.log" 2>&1
    ) else (
        start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LOG_DIR%\frontend.log" 2>&1
    )
    echo  → Restart issued
)

echo.
echo  Next check in 30 seconds...
echo  (Ctrl+C to return to menu)
echo.
:: Safe wait — no choice, no PowerShell, just ping
ping -n 31 127.0.0.1 >nul 2>nul
goto MONITOR

:RESTART_BE
echo [%DATE% %TIME%] Auto-restart Backend >> %LOG_FILE%
echo  ⚠ Restarting Backend...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LOG_DIR%\backend.log" 2>&1
timeout /t 3 /nobreak >nul
exit /b

:RESTART_FE
echo [%DATE% %TIME%] Auto-restart Frontend >> %LOG_FILE%
echo  ⚠ Restarting Frontend...
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend*" 2>nul >nul
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LOG_DIR%\frontend.log" 2>&1
) else (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LOG_DIR%\frontend.log" 2>&1
)
timeout /t 3 /nobreak >nul
exit /b

:STATUS_NOW
cls
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; Write-Host ('Backend: HEALTHY - ' + $r.Content)}catch{Write-Host 'Backend: DOWN'}" 2>nul
echo.
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; Write-Host ('Frontend: HTTP ' + $r.StatusCode)}catch{Write-Host 'Frontend: DOWN'}" 2>nul
echo.
pause
goto MONITOR

:VIEW_NOW
cls
echo.
echo ═══ Main Log ═══
type "%LOG_DIR%\main.log" 2>nul | findstr /v "^$" | more
echo.
echo ═══ Error Log ═══
type "%LOG_DIR%\errors.log" 2>nul | more
echo.
pause
goto MONITOR

:GIT_NOW
cls
call :GIT_FUNC
pause
goto MONITOR

:: ═══════════════════════════════════════════════════════════════════════════════
::  GIT PUSH
:: ═══════════════════════════════════════════════════════════════════════════════
:GIT_PUSH
cls
call :GIT_FUNC
pause
goto MENU

:GIT_FUNC
echo.
echo ════════════════════════════════════════
echo   Pushing to GitHub
echo ════════════════════════════════════════
echo.
echo  Repository: Kirllos360/MeterVerse
echo.
git add -A 2>nul
git commit -m "Update %DATE% %TIME%" 2>nul
echo  Pushing...
git push origin clean-main:main 2>nul
if %errorlevel%==0 ( echo   ✅ Push successful ) else ( echo   ❌ Push failed )
echo.
exit /b

:: ═══════════════════════════════════════════════════════════════════════════════
::  STOP ALL
:: ═══════════════════════════════════════════════════════════════════════════════
:STOP_ALL
cls
echo.
echo Stopping...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
taskkill /F /IM node.exe 2>nul >nul
echo [%DATE% %TIME%] All services stopped >> %LOG_FILE%
echo  Done.
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  VIEW LOG
:: ═══════════════════════════════════════════════════════════════════════════════
:VIEW_LOG
cls
echo.
type "%LOG_DIR%\errors.log" 2>nul | more
if %errorlevel%==1 echo (no errors logged)
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  STATUS
:: ═══════════════════════════════════════════════════════════════════════════════
:STATUS
cls
echo.
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo  Backend : RUNNING ) else ( echo  Backend : STOPPED )
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo  Frontend: RUNNING ) else ( echo  Frontend: STOPPED )
echo.
git status --short 2>nul || echo Git: clean
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  AUTO SEQUENCE (Git Push + Start)
:: ═══════════════════════════════════════════════════════════════════════════════
:AUTO
cls
echo.
echo ════════════════════════════════════════
echo   Auto-Sequence: Push + Start
echo ════════════════════════════════════════
echo.
call :GIT_FUNC
echo.
echo  Starting services...
timeout /t 2 /nobreak >nul
goto START_ALL
