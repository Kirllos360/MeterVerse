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

:: Write to log
call :LOG "═══════════════════════════════════════════════"
call :LOG "  MeterVerse Control Center v2.0"
call :LOG "═══════════════════════════════════════════════"

:MENU
cls
echo.
echo ╔══════════════════════════════════════════════╗
echo ║        MeterVerse Control Center v2.0         ║
echo ╠══════════════════════════════════════════════╣
echo ║                                              ║
echo ║  1. Start All Services                       ║
echo ║     (Backend + Frontend + Monitor)           ║
echo ║                                              ║
echo ║  2. Git Push to GitHub                       ║
echo ║     (Auto-add, commit, push)                 ║
echo ║                                              ║
echo ║  3. View Logs                                ║
echo ║                                              ║
echo ║  4. Service Status                           ║
echo ║                                              ║
echo ║  5. Stop All Services                        ║
echo ║                                              ║
echo ║  6. Run All (Start + Push)                   ║
echo ║                                              ║
echo ║  7. Exit                                     ║
echo ║                                              ║
echo ╚══════════════════════════════════════════════╝
echo.
set /p choice="Select (1-7): "

if "%choice%"=="1" goto START_SERVICES
if "%choice%"=="2" goto GIT_PUSH
if "%choice%"=="3" goto VIEW_LOGS
if "%choice%"=="4" goto SERVICE_STATUS
if "%choice%"=="5" goto STOP_ALL
if "%choice%"=="6" goto RUN_ALL
if "%choice%"=="7" goto :EOF
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  1. START ALL SERVICES
:: ═══════════════════════════════════════════════════════════════════════════════
:START_SERVICES
cls
call :LOG "--- Starting Services ---"

:: Check if already running
call :CHECK_PORTS
if %BE_RUNNING%==1 (
    echo.
    echo ⚠ Services may already be running. Stop them first (option 5).
    echo.
    pause
    goto MENU
)

:: Kill any orphaned processes
echo Stopping any existing processes...
taskkill /F /FI "WINDOWTITLE eq MeterVerse Backend*" 2>nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse Frontend*" 2>nul
timeout /t 2 /nobreak >nul

:: Step 1: Start Backend
echo.
echo [1/4] Starting Backend (port %BE_PORT%)...
call :LOG "Starting Backend on port %BE_PORT%"
start "MeterVerse Backend" cmd /c "cd /d %~dp0backend && node src/server.js"
timeout /t 4 /nobreak >nul

:: Wait for backend health
echo Waiting for backend...
set /a BE_READY=0
for /l %%i in (1,1,15) do (
    timeout /t 2 /nobreak >nul
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}}catch{}exit 1" && set /a BE_READY=1
    if !BE_READY!==1 (
        echo   ✅ Backend ready!
        call :LOG "Backend started successfully"
        goto FE_START
    )
    echo   Waiting... (%%i/15)
)
if !BE_READY!==0 (
    call :LOG "⚠ Backend failed to start" "RED"
    echo   ⚠ Backend may not have started. Check logs.
)

:FE_START
:: Step 2: Start Frontend
echo.
echo [2/4] Starting Frontend (port %FE_PORT%)...
call :LOG "Starting Frontend on port %FE_PORT%"

if exist "%~dp0Frontend\.next\BUILD_ID" (
    start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next start -p %FE_PORT%"
) else (
    start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next dev -p %FE_PORT%"
)

:: Wait for frontend
echo Waiting for frontend (this may take 30-60s first time)...
set /a FE_READY=0
for /l %%i in (1,1,20) do (
    timeout /t 3 /nobreak >nul
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}}catch{}exit 1" && set /a FE_READY=1
    if !FE_READY!==1 (
        echo   ✅ Frontend ready!
        call :LOG "Frontend started successfully"
        goto MONITOR_LOOP
    )
    if %%i==5 echo   Still compiling... (~15s)
    if %%i==10 echo   Almost there... (~30s)
)
if !FE_READY!==0 (
    call :LOG "⚠ Frontend failed to start" "RED"
)

:: ═══════════════════════════════════════════════════════════════════════════════
::  Monitor Loop (self-healing)
:: ═══════════════════════════════════════════════════════════════════════════════
:MONITOR_LOOP
cls
echo ╔══════════════════════════════════════════════╗
echo ║     MeterVerse — Running (Press for menu)    ║
echo ╠══════════════════════════════════════════════╣
echo ║                                              ║
echo ║  Backend  : %~dp0backend\src\server.js
echo ║  Frontend : %~dp0Frontend
echo ║                                              ║
echo ║  📍 http://localhost:%FE_PORT%/admin
echo ║  🔑 admin@meterverse.com / Admin@123
echo ║                                              ║
echo ║  🟢 [1] Backend Health                       ║
echo ║  🟢 [2] Frontend Check                       ║
echo ║  📤 [3] Git Push & Continue                  ║
echo ║  📋 [4] View Recent Log                      ║
echo ║  🛑 [5] Stop All Services                    ║
echo ║  🔙 [M] Main Menu                            ║
echo ║                                              ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Press a key (will timeout after 15s of inactivity)...
echo.

:: Check health and show status
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" && (
    echo  ✅ Backend: HEALTHY
    set BE_OK=1
) || (
    echo  ❌ Backend: DOWN
    set BE_OK=0
)

PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" && (
    echo  ✅ Frontend: HEALTHY
    set FE_OK=1
) || (
    echo  ❌ Frontend: DOWN
    set FE_OK=0
)

:: Self-healing: if down, try restart
if !BE_OK!==0 (
    echo.
    echo ⚠ Backend is DOWN. Attempting restart...
    call :LOG "Backend DOWN, restarting..."
    taskkill /F /FI "WINDOWTITLE eq MeterVerse Backend*" 2>nul
    timeout /t 2 /nobreak >nul
    start "MeterVerse Backend" cmd /c "cd /d %~dp0backend && node src/server.js"
    timeout /t 4 /nobreak >nul
)

if !FE_OK!==0 (
    echo.
    echo ⚠ Frontend is DOWN. Attempting restart...
    call :LOG "Frontend DOWN, restarting..."
    taskkill /F /FI "WINDOWTITLE eq MeterVerse Frontend*" 2>nul
    timeout /t 2 /nobreak >nul
    if exist "%~dp0Frontend\.next\BUILD_ID" (
        start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next start -p %FE_PORT%"
    ) else (
        start "MeterVerse Frontend" cmd /c "cd /d %~dp0Frontend && npx next dev -p %FE_PORT%"
    )
    timeout /t 8 /nobreak >nul
)

:: Wait for keypress with timeout
echo.
echo Press: 1=Health  2=Frontend  3=Git Push  4=Log  5=Stop  M=Menu
choice /c 12345M /n /t 15 /d M >nul
set KEY=%errorlevel%

if %KEY%==1 (
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; Write-Host ($r.Content | ConvertFrom-Json | ConvertTo-Json)}catch{Write-Host 'Backend not responding'}"
    echo.
    pause
)
if %KEY%==2 (
    PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; Write-Host ('Frontend: HTTP ' + $r.StatusCode + ' - ' + $r.Content.Length + ' bytes')}catch{Write-Host 'Frontend not responding'}"
    echo.
    pause
)
if %KEY%==3 goto GIT_PUSH_MONITOR
if %KEY%==4 goto VIEW_LOG_MONITOR
if %KEY%==5 goto STOP_ALL
if %KEY%==6 goto MENU

goto MONITOR_LOOP

:GIT_PUSH_MONITOR
call :GIT_PUSH_FUNC
goto MONITOR_LOOP

:VIEW_LOG_MONITOR
type %LOG_FILE% | more
pause
goto MONITOR_LOOP

:: ═══════════════════════════════════════════════════════════════════════════════
::  2. GIT PUSH
:: ═══════════════════════════════════════════════════════════════════════════════
:GIT_PUSH
cls
call :GIT_PUSH_FUNC
echo.
pause
goto MENU

:GIT_PUSH_FUNC
echo.
echo ╔══════════════════════════════════════════════╗
echo ║          Pushing to GitHub...                 ║
echo ╚══════════════════════════════════════════════╝
echo.
call :LOG "--- Git Push ---"

echo [1/3] Adding all changes...
git add -A 2>&1
call :LOG "Git: add -A completed"

echo.
echo [2/3] Committing...
set TIMESTAMP=%DATE% %TIME%
git commit -m "Auto-update %TIMESTAMP%" 2>&1
call :LOG "Git: commit completed"

echo.
echo [3/3] Pushing to origin clean-main:main...
git push origin clean-main:main 2>&1
if %errorlevel%==0 (
    echo.
    echo ✅ PUSH SUCCESSFUL
    call :LOG "✅ Git push successful" "GREEN"
) else (
    echo.
    echo ❌ PUSH FAILED — check errors above
    call :LOG "❌ Git push failed" "RED"
)
exit /b 0

:: ═══════════════════════════════════════════════════════════════════════════════
::  3. VIEW LOGS
:: ═══════════════════════════════════════════════════════════════════════════════
:VIEW_LOGS
cls
echo ╔══════════════════════════════════════════════╗
echo ║              System Logs                      ║
echo ╚══════════════════════════════════════════════╝
echo.
if not exist %LOG_FILE% (
    echo No log file found.
) else (
    type %LOG_FILE%
)
echo.
echo ────────────────────────────────────────────
echo Log file: %~dp0%LOG_FILE%
echo ────────────────────────────────────────────
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  4. SERVICE STATUS
:: ═══════════════════════════════════════════════════════════════════════════════
:SERVICE_STATUS
cls
call :CHECK_PORTS
echo ╔══════════════════════════════════════════════╗
echo ║           Service Status                      ║
echo ╚══════════════════════════════════════════════╝
echo.
if %BE_RUNNING%==1 (
    echo  ✅ Backend  (port %BE_PORT%): RUNNING
) else (
    echo  ❌ Backend  (port %BE_PORT%): STOPPED
)
if %FE_RUNNING%==1 (
    echo  ✅ Frontend (port %FE_PORT%): RUNNING
) else (
    echo  ❌ Frontend (port %FE_PORT%): STOPPED
)
echo.
echo Git Status:
git status --short 2>nul
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  5. STOP ALL SERVICES
:: ═══════════════════════════════════════════════════════════════════════════════
:STOP_ALL
cls
echo Stopping all MeterVerse services...
call :LOG "--- Stopping Services ---"
taskkill /F /FI "WINDOWTITLE eq MeterVerse Backend*" 2>nul && echo  ✅ Backend stopped || echo  - Backend not running
taskkill /F /FI "WINDOWTITLE eq MeterVerse Frontend*" 2>nul && echo  ✅ Frontend stopped || echo  - Frontend not running
taskkill /F /IM node.exe 2>nul
call :LOG "Services stopped"
echo.
echo All services stopped.
echo.
pause
goto MENU

:: ═══════════════════════════════════════════════════════════════════════════════
::  6. RUN ALL (Start + Push)
:: ═══════════════════════════════════════════════════════════════════════════════
:RUN_ALL
cls
echo ╔══════════════════════════════════════════════╗
echo ║        Run All: Start + Push to GitHub       ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Step 1: Push latest code to GitHub...
call :GIT_PUSH_FUNC
echo.
echo Step 2: Start services...
echo.
pause
goto START_SERVICES

:: ═══════════════════════════════════════════════════════════════════════════════
::  UTILITY FUNCTIONS
:: ═══════════════════════════════════════════════════════════════════════════════

:CHECK_PORTS
set BE_RUNNING=0
set FE_RUNNING=0
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" && set BE_RUNNING=1
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" && set FE_RUNNING=1
exit /b 0

:LOG
echo [%DATE% %TIME%] %~1 >> %LOG_FILE%
echo [%DATE% %TIME%] %~1
exit /b 0
