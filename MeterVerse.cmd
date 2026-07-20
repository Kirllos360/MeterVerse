@echo off
title MeterVerse
cd /d "%~dp0"
setlocal enabledelayedexpansion

:: ─── CONFIG ───────────────────────────────────────────────────────────────────
set BE_PORT=3001
set FE_PORT=7400
set LOG_FILE=.mv.log
:: ───────────────────────────────────────────────────────────────────────────────

:MENU
cls
echo.
echo  ╔══════════════════════════════════╗
echo  ║     MeterVerse Control Center    ║
echo  ╠══════════════════════════════════╣
echo  ║                                  ║
echo  ║  1. Start All Services           ║
echo  ║  2. Git Push                     ║
echo  ║  3. Stop All Services            ║
echo  ║  4. Status                       ║
echo  ║  5. Exit                         ║
echo  ║                                  ║
echo  ╚══════════════════════════════════╝
echo.
set /p choice="Select (1-5): "
if "%choice%"=="1" goto START
if "%choice%"=="2" goto GIT
if "%choice%"=="3" goto STOP
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" exit
goto MENU

:START
cls
echo.
echo Starting MeterVerse services...
echo.

:: Kill old processes
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul

:: Start backend
echo [1] Starting Backend...
start "MeterVerse Backend" cmd /c "cd /d %~dp0backend && node src/server.js"
timeout /t 5 /nobreak >nul

:: Start frontend
echo [2] Starting Frontend...
if exist "%~dp0Frontend\.next\BUILD_ID" (
    start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next start -p %FE_PORT%"
) else (
    start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next dev -p %FE_PORT%"
)

:: Simple check
echo [3] Checking...
timeout /t 10 /nobreak >nul
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   Backend: OK ) else ( echo   Backend: FAIL - check backend )
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   Frontend: OK ) else ( echo   Frontend: FAIL - check frontend )

echo.
echo   Admin: http://localhost:%FE_PORT%/admin
echo   Login: admin@meterverse.com / Admin@123
echo.
echo [%DATE% %TIME%] Started >> %LOG_FILE%
echo   Log: %~dp0%LOG_FILE%
echo.
pause
goto MENU

:GIT
cls
echo.
echo Pushing to GitHub...
git add -A 2>nul
git commit -m "Auto-update %DATE% %TIME%" 2>nul
git push origin clean-main:main 2>nul
if %errorlevel%==0 (echo   Done) else (echo   Failed)
echo.
pause
goto MENU

:STOP
cls
echo Stopping...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
taskkill /F /IM node.exe 2>nul >nul
echo [%DATE% %TIME%] Stopped >> %LOG_FILE%
echo   Stopped.
echo.
pause
goto MENU

:STATUS
cls
echo.
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   Backend : RUNNING ) else ( echo   Backend : STOPPED )
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   Frontend: RUNNING ) else ( echo   Frontend: STOPPED )
echo.
pause
goto MENU
