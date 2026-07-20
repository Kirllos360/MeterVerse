@echo off
title MeterVerse Launcher
cd /d "%~dp0.."
setlocal enabledelayedexpansion

:: ─── CONFIG ───────────────────────────────────────────────────────────────────
set BACKEND_DIR=backend
set FRONTEND_DIR=Frontend
set BE_PORT=3001
set FE_PORT=7400
set LOG_DIR=%~dp0logs
set MAX_RESTART=10
:: ───────────────────────────────────────────────────────────────────────────────

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set LOG_FILE=%LOG_DIR%\launcher.log

echo [%DATE% %TIME%] === MeterVerse Launcher Started === >> %LOG_FILE%
echo.
echo ========================================
echo    MeterVerse Service Launcher
echo ========================================
echo.
echo  Starting all services...
echo  Log: %LOG_FILE%
echo.

:: Start Backend
echo  [1] Starting Backend...
start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js"
timeout /t 4 /nobreak >nul
echo  [2] Starting Frontend...
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%"
) else (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%"
)
timeout /t 3 /nobreak >nul

echo.
echo  Services launched. Monitor starting...
echo  Press Ctrl+C to stop.
echo.

:: ═══════════════════════════════════════════════════════════════════════════════
::  MAIN MONITOR LOOP — never exits
:: ═══════════════════════════════════════════════════════════════════════════════
:LOOP
set BE_RUNNING=0
set FE_RUNNING=0
set NEED_FIX=0

:: Check Backend
tasklist /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul | findstr /I "node.exe" >nul 2>nul
if %errorlevel%==0 ( set BE_RUNNING=1 )

:: Check Frontend
tasklist /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul | findstr /I "node.exe" >nul 2>nul
if %errorlevel%==0 ( set FE_RUNNING=1 )

:: If all running, just wait
if !BE_RUNNING!==1 if !FE_RUNNING!==1 (
    timeout /t 15 /nobreak >nul
    goto LOOP
)

:: ─── Service recovery ────────────────────────────────────────────────────────
if !BE_RUNNING!==0 (
    echo [%DATE% %TIME%] Backend DOWN - restarting... >> %LOG_FILE%
    echo  [RESTART] Backend was down. Restarting...
    taskkill /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
    start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js"
    set /a NEED_FIX=!NEED_FIX!+1
    timeout /t 3 /nobreak >nul
)

if !FE_RUNNING!==0 (
    echo [%DATE% %TIME%] Frontend DOWN - restarting... >> %LOG_FILE%
    echo  [RESTART] Frontend was down. Restarting...
    taskkill /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
    if exist "%~dp0..\Frontend\.next\BUILD_ID" (
        start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%"
    ) else (
        start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%"
    )
    set /a NEED_FIX=!NEED_FIX!+1
    timeout /t 3 /nobreak >nul
)

:: ─── Error logging ───────────────────────────────────────────────────────────
call "%~dp0ErrorLog.cmd" "Service restarted" "Backend=!BE_RUNNING! Frontend=!FE_RUNNING!"

:: ─── Auto-fix attempt ────────────────────────────────────────────────────────
if !NEED_FIX! GEQ 1 (
    call "%~dp0AutoFix.cmd" "!BE_RUNNING!" "!FE_RUNNING!"
)

:: ─── Wait before next check ──────────────────────────────────────────────────
timeout /t 15 /nobreak >nul
goto LOOP
