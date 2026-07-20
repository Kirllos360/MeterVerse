@echo off
title MeterVerse Control Center
cd /d "%~dp0"
setlocal enabledelayedexpansion

:: ─── CONFIG ───────────────────────────────────────────────────────────────────
set BE_PORT=3001
set FE_PORT=7400
set LOG_FILE=.mv_control.log
set MAX_RETRIES=5
:: ───────────────────────────────────────────────────────────────────────────────

:: Ensure log file is writable
echo [%DATE% %TIME%] === MeterVerse Started === >> %LOG_FILE% 2>nul

:: ─── MAIN MENU ────────────────────────────────────────────────────────────────
:MENU
cls
echo.
echo ========================================
echo    MeterVerse Control Center v2.0
echo ========================================
echo.
echo  1. Start All Services
echo  2. Git Push to GitHub
echo  3. View Logs
echo  4. Service Status
echo  5. Stop All Services
echo  6. Run All (Push + Start)
echo  7. Exit
echo.
set /p choice="Select (1-7): " || set choice=0

if "%choice%"=="1" goto START_SERVICES
if "%choice%"=="2" goto GIT_PUSH
if "%choice%"=="3" goto VIEW_LOGS
if "%choice%"=="4" goto SERVICE_STATUS
if "%choice%"=="5" goto STOP_ALL
if "%choice%"=="6" goto RUN_ALL
if "%choice%"=="7" exit
echo Invalid choice & timeout /t 2 /nobreak >nul & goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  1. START ALL SERVICES
:: ═══════════════════════════════════════════════════════════════════════════════
:START_SERVICES
cls
echo [%DATE% %TIME%] Starting services... >> %LOG_FILE%

:: Check if already running
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (
    echo.
    echo Services already running! Use option 5 to stop first.
    echo.
    pause & goto MENU
)

:: Kill orphaned processes
echo Stopping old processes...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul
timeout /t 2 /nobreak >nul

:: Start Backend
echo.
echo [1/2] Starting Backend...
start "MeterVerse Backend" cmd /c "cd /d %~dp0backend && node src/server.js"
timeout /t 5 /nobreak >nul

:: Wait for backend (up to 30s)
echo Waiting for backend...
for /l %%i in (1,1,15) do (
    timeout /t 2 /nobreak >nul
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}}catch{}exit 1" 2>nul
    if !errorlevel!==0 (
        echo   Backend ready!
        echo [%DATE% %TIME%] Backend started >> %LOG_FILE%
        goto FE_START
    )
    echo   Waiting... (%%i/15)
)
echo   Warning: Backend may not have started.

:FE_START
:: Start Frontend
echo.
echo [2/2] Starting Frontend...
if exist "%~dp0Frontend\.next\BUILD_ID" (
    start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next start -p %FE_PORT%"
) else (
    start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next dev -p %FE_PORT%"
)

echo Waiting for frontend (30-60s first time)...
for /l %%i in (1,1,20) do (
    timeout /t 3 /nobreak >nul
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}}catch{}exit 1" 2>nul
    if !errorlevel!==0 (
        echo   Frontend ready!
        echo [%DATE% %TIME%] Frontend started >> %LOG_FILE%
        goto MONITOR
    )
)
echo   Warning: Frontend may not have started.

:: ═══════════════════════════════════════════════════════════════════════════════
::  MONITOR LOOP — Never exits, never closes
:: ═══════════════════════════════════════════════════════════════════════════════
:MONITOR
cls
echo.
echo ===== MeterVerse Running =====
echo   Backend  : http://localhost:%BE_PORT%
echo   Frontend : http://localhost:%FE_PORT%/admin
echo   Login    : admin@meterverse.com / Admin@123
echo.
echo  [H] Health check    [G] Git push
echo  [L] View log        [S] Stop services
echo  [M] Main menu       [X] Exit
echo.

:: Check health silently
set BE_OK=0&set FE_OK=0
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}}catch{}exit 1" 2>nul && set BE_OK=1
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}}catch{}exit 1" 2>nul && set FE_OK=1

if !BE_OK!==1 ( echo   Backend: HEALTHY ) else ( echo   Backend: DOWN - restarting... & start "MeterVerse Backend" cmd /c "cd /d %~dp0backend && node src/server.js" )
if !FE_OK!==1 ( echo   Frontend: HEALTHY ) else ( echo   Frontend: DOWN - restarting... & if exist "%~dp0Frontend\.next\BUILD_ID" (start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next start -p %FE_PORT%") else (start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next dev -p %FE_PORT%") )

echo.
echo  Press a key (or wait 20s to refresh)...
choice /c HGLSMX /n /t 20 /d H >nul 2>nul
set KEY=%errorlevel%

if %KEY%==1 goto HEALTH_DETAIL
if %KEY%==2 goto DO_GIT
if %KEY%==3 goto VIEW_LOG
if %KEY%==4 goto STOP_NOW
if %KEY%==5 goto MENU
if %KEY%==6 exit
goto MONITOR

:HEALTH_DETAIL
cls
echo.
echo --- Backend Health ---
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; Write-Host $r.Content}catch{Write-Host 'Backend not responding'}"
echo.
echo --- Frontend Check ---
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; Write-Host ('Status: '+$r.StatusCode+' - '+$r.Content.Length+' bytes')}catch{Write-Host 'Frontend not responding'}"
echo.
pause & goto MONITOR

:DO_GIT
cls
echo.
echo ===== Git Push to GitHub =====
echo.
git add -A 2>nul
git commit -m "Auto-update %DATE% %TIME%" 2>nul
git push origin clean-main:main 2>nul
if %errorlevel%==0 ( echo   PUSH SUCCESSFUL ) else ( echo   PUSH FAILED - check errors )
echo.
pause & goto MONITOR

:VIEW_LOG
cls
echo.
echo ===== Recent Log =====
echo.
type %LOG_FILE% 2>nul | findstr /v "^$"
if %errorlevel%==1 echo (empty)
echo.
pause & goto MONITOR

:STOP_NOW
cls
echo.
echo Stopping services...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul
taskkill /F /IM node.exe 2>nul
echo  Stopped.
echo [%DATE% %TIME%] Services stopped >> %LOG_FILE%
echo.
pause & goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  2. GIT PUSH
:: ═══════════════════════════════════════════════════════════════════════════════
:GIT_PUSH
cls
echo.
echo ===== Git Push =====
echo.
git add -A 2>nul
git commit -m "Auto-update %DATE% %TIME%" 2>nul
git push origin clean-main:main 2>nul
if %errorlevel%==0 ( echo   PUSH SUCCESSFUL ) else ( echo   PUSH FAILED )
echo.
echo [%DATE% %TIME%] Git push completed >> %LOG_FILE%
pause & goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  3. VIEW LOGS
:: ═══════════════════════════════════════════════════════════════════════════════
:VIEW_LOGS
cls
type %LOG_FILE% 2>nul || echo (log file empty)
echo.
pause & goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  4. SERVICE STATUS
:: ═══════════════════════════════════════════════════════════════════════════════
:SERVICE_STATUS
cls
set BE_OK=0&set FE_OK=0
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul && set BE_OK=1
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul && set FE_OK=1

echo.
echo ===== Service Status =====
if !BE_OK!==1 ( echo   Backend  : RUNNING ) else ( echo   Backend  : STOPPED )
if !FE_OK!==1 ( echo   Frontend : RUNNING ) else ( echo   Frontend : STOPPED )
echo.
echo Git status:
git status --short 2>nul || echo   (clean)
echo.
pause & goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  5. STOP ALL
:: ═══════════════════════════════════════════════════════════════════════════════
:STOP_ALL
cls
echo Stopping...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul
taskkill /F /IM node.exe 2>nul
echo [%DATE% %TIME%] Services stopped >> %LOG_FILE%
echo Done.
echo.
pause & goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  6. RUN ALL
:: ═══════════════════════════════════════════════════════════════════════════════
:RUN_ALL
cls
echo Step 1: Git push...
git add -A 2>nul
git commit -m "Auto-update %DATE% %TIME%" 2>nul
git push origin clean-main:main 2>nul
echo.
echo Step 2: Starting services...
echo.
pause
goto START_SERVICES
