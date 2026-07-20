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
set BE_ATTEMPT=0
set FE_ATTEMPT=0
set BE_SLEEP=0
set FE_SLEEP=0
set MAX_ATTEMPT=10

echo [%DATE% %TIME%] [SYS] MeterVerse System STARTED >> "%LM%"
echo [%DATE% %TIME%] [SYS] MeterVerse System STARTED >> "%LE%"

if not "%1"=="" if "%1"=="1" goto START

:MENU
cls
echo.
echo  ===== MeterVerse System =====
echo.
echo  1. Start Services
echo  2. Stop Services
echo  3. Git Push
echo  4. Status
echo  5. View Error Log
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
echo Starting...

:: SAFE kill — only MeterVerse windows, never node.exe system-wide
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 2 /nobreak >nul

echo [1] Backend...
echo [%DATE% %TIME%] [BE] Starting on port %BE_PORT% >> "%LM%"
:: Each service gets its OWN window with UNIQUE title — safe to kill individually
start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1
timeout /t 8 /nobreak >nul

:: Verify backend started safely (no system-wide node kill)
tasklist /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul | findstr /I "node.exe" >nul 2>nul
if !errorlevel!==0 ( echo   Backend started ) else ( echo   Backend may not have started )

echo [2] Frontend...
echo [%DATE% %TIME%] [FE] Starting on port %FE_PORT% >> "%LM%"
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1
) else (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1
)

echo.
echo Admin: http://localhost:%FE_PORT%/admin
echo Login: admin@meterverse.com / Admin@123
echo.
echo [%DATE% %TIME%] [SYS] Services launched >> "%LM%"

:MONITOR
cls
echo.
echo ===== MeterVerse Running =====
echo.
echo Backend attempts: !BE_ATTEMPT!/%MAX_ATTEMPT%  Sleep: !BE_SLEEP!
echo Frontend attempts: !FE_ATTEMPT!/%MAX_ATTEMPT%  Sleep: !FE_SLEEP!
echo.
echo [G] Git Push   [R] Report   [S] Stop   [Q] Menu
echo (Ctrl+C to stop monitoring)
echo.

:: Check health — ONLY check if not sleeping
set BK=0&set FK=0
if !BE_SLEEP!==0 (
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
    if !errorlevel!==0 ( set BK=1 & set BE_ATTEMPT=0 & echo BE: OK ) else ( set /a BE_ATTEMPT+=1 & echo BE: DOWN x!BE_ATTEMPT! )
) else ( echo BE: SLEEPING )
if !FE_SLEEP!==0 (
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
    if !errorlevel!==0 ( set FK=1 & set FE_ATTEMPT=0 & echo FE: OK ) else ( set /a FE_ATTEMPT+=1 & echo FE: DOWN x!FE_ATTEMPT! )
) else ( echo FE: SLEEPING )

:: Fix engine — targeted restart by window title, NEVER system-wide node kill
if !BK!==0 if !BE_SLEEP!==0 (
    call :FIX_BE
)
if !FK!==0 if !FE_SLEEP!==0 (
    call :FIX_FE
)

echo [%DATE% %TIME%] [MON] BE=%BK% FE=%FK% >> "%LM%"
echo.
echo Next check in 30s...
ping -n 31 127.0.0.1 >nul 2>nul
goto MONITOR

:FIX_BE
echo Fixing BE (attempt !BE_ATTEMPT!/%MAX_ATTEMPT%)...
echo [%DATE% %TIME%] [BE] Fix attempt !BE_ATTEMPT! >> "%LE%"

if !BE_ATTEMPT! GEQ %MAX_ATTEMPT% (
    echo [%DATE% %TIME%] [BE] SLEEP MODE — max attempts reached >> "%LE%"
    echo  → SLEEP MODE. Check errors.log
    set BE_SLEEP=1
    goto :EOF
)

:: Kill ONLY MeterVerse-Backend window
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
timeout /t 3 /nobreak >nul

:: Restart
start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1
echo [%DATE% %TIME%] [BE] Restarted >> "%LE%"
timeout /t 5 /nobreak >nul
goto :EOF

:FIX_FE
echo Fixing FE (attempt !FE_ATTEMPT!/%MAX_ATTEMPT%)...
echo [%DATE% %TIME%] [FE] Fix attempt !FE_ATTEMPT! >> "%LE%"

if !FE_ATTEMPT! GEQ %MAX_ATTEMPT% (
    echo [%DATE% %TIME%] [FE] SLEEP MODE — max attempts reached >> "%LE%"
    echo  → SLEEP MODE. Check errors.log
    set FE_SLEEP=1
    goto :EOF
)

:: Kill ONLY MeterVerse-Frontend window  
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 3 /nobreak >nul

:: Clear cache
if exist "%~dp0..\Frontend\.next\cache" rmdir /s /q "%~dp0..\Frontend\.next\cache" 2>nul >nul

:: Restart
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1
) else (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1
)
echo [%DATE% %TIME%] [FE] Restarted >> "%LE%"
timeout /t 8 /nobreak >nul
goto :EOF

:: ─── MENU ACTIONS ────────────────────────────────────────────────────────────
:GIT
cls
echo Pushing to GitHub...
git add -A 2>nul
git commit -m "Auto-update %DATE% %TIME%" 2>nul
git push origin clean-main:main 2>nul
if %errorlevel%==0 (echo OK) else (echo FAIL)
echo [%DATE% %TIME%] [GIT] Push done >> "%LM%"
pause & goto MENU

:STATUS
cls
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

:STOP
cls
echo Stopping...
:: SAFE — only kills MeterVerse windows, never system-wide
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
echo [%DATE% %TIME%] [SYS] Services stopped >> "%LM%"
echo Done.
pause & goto MENU
