@echo off
title MeterVerse Launch
cd /d "%~dp0.."
setlocal enabledelayedexpansion

:: ─── CONFIG ───────────────────────────────────────────────────────────────────
set BE_PORT=3001
set FE_PORT=7400
set LOG_DIR=%~dp0logs
:: ───────────────────────────────────────────────────────────────────────────────

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set LOG_FILE=%LOG_DIR%\launch.log

echo [%DATE% %TIME%] === Launch === >> %LOG_FILE%

cls
echo.
echo ════════════════════════════════════════
echo   MeterVerse Launcher (same window)
echo ════════════════════════════════════════
echo.

:: Kill old
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
taskkill /F /IM node.exe 2>nul >nul
timeout /t 2 /nobreak >nul

:: Start Backend (same window, background)
echo [1] Starting Backend...
start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LOG_DIR%\backend.log" 2>&1
echo   PID: %!pid! (see task manager)
echo   Log: %LOG_DIR%\backend.log

:: Wait for backend ready
echo   Waiting for backend (up to 30s)...
set WAIT=0
:WAIT_BE
timeout /t 3 /nobreak >nul
set /a WAIT+=3
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   ✅ Backend ready! ) else ( if %WAIT% LSS 30 goto WAIT_BE )

:: Start Frontend (same window, background)
echo [2] Starting Frontend...
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LOG_DIR%\frontend.log" 2>&1
) else (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LOG_DIR%\frontend.log" 2>&1
)
echo   Log: %LOG_DIR%\frontend.log
echo   (frontend takes 30-60s to compile first time)
echo.
echo   Admin: http://localhost:%FE_PORT%/admin
echo   Login: admin@meterverse.com / Admin@123
echo.
echo   Backend log:  type "%LOG_DIR%\backend.log"
echo   Frontend log: type "%LOG_DIR%\frontend.log"
echo.
echo [%DATE% %TIME%] Launched >> %LOG_FILE%
echo.
echo  Press any key to close this window (services keep running in background)
pause >nul
