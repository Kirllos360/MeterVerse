@echo off
title MeterVerse OS - Start (Admin :3535 + Portal :3030)
setlocal enabledelayedexpansion
cd /d "%~dp0.."
call "%~dp0config.cmd"

:: Set development environment
set NODE_ENV=development
set JWT_SECRET=dev-secret-for-local
set CORS_ORIGIN=http://localhost:3030,http://localhost:3535

echo [%DATE% %TIME%] [SYS] Start invoked >> "%LM%"

:: Stop any existing services on our ports
echo Stopping any existing services...
call "%~dp0Stop.cmd" >nul 2>&1
timeout /t 3 /nobreak >nul

:: Check PostgreSQL
docker ps --filter "name=%CONTAINER_DB%" --format "{{.Status}}" 2>nul | findstr "Up" >nul 2>nul
if %errorlevel%==0 (
    echo [DB] RUNNING
    echo [%DATE% %TIME%] [DB] Running >> "%LM%"
) else (
    echo [DB] STARTING via Docker...
    echo [%DATE% %TIME%] [DB] Starting via docker >> "%LM%"
    docker compose up -d postgres 2>> "%LE%" >> "%LM%"
    timeout /t 8 /nobreak >nul
)

:: ─── 1. ADMIN BACKEND (:3131) ─────────────────────────────────────────────
echo [1/4] Starting Admin API (:%ADMIN_BE_PORT%)...
echo [%DATE% %TIME%] [ADMIN-BE] Starting >> "%LM%"
start "MeterVerse-AdminAPI" cmd /c "cd /d %~dp0..\backend && set NODE_ENV=development&& set JWT_SECRET=%JWT_SECRET%&& set CORS_ORIGIN=%CORS_ORIGIN%&& set PORT=%ADMIN_BE_PORT%&& node src/server.js >> "%LB%" 2>&1"

:: ─── 2. ADMIN FRONTEND (:3535) — standalone (own .next) ──────────────────
echo [2/4] Starting Admin Console (:%ADMIN_FE_PORT%)...
echo [%DATE% %TIME%] [ADMIN-FE] Starting >> "%LM%"
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-AdminConsole" cmd /c "cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:%ADMIN_BE_PORT%&& call node_modules\.bin\next.cmd start -p %ADMIN_FE_PORT% >> "%LF%" 2>&1"
    echo   Admin Console production mode
) else (
    start "MeterVerse-AdminConsole" cmd /c "cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:%ADMIN_BE_PORT%&& call node_modules\.bin\next.cmd dev -p %ADMIN_FE_PORT% >> "%LF%" 2>&1"
    echo   Admin Console dev mode
)

:: ─── 3. PORTAL BACKEND (:3003) ─────────────────────────────────────────────
echo [3/4] Starting Portal API (:%PORTAL_BE_PORT%)...
echo [%DATE% %TIME%] [PORTAL-BE] Starting >> "%LM%"
start "MeterVerse-PortalAPI" cmd /c "cd /d %~dp0..\backend && set NODE_ENV=development&& set JWT_SECRET=%JWT_SECRET%&& set CORS_ORIGIN=%CORS_ORIGIN%&& set PORT=%PORTAL_BE_PORT%&& set PORTAL_MODE=1&& node src/server.js >> "%LPB%" 2>&1"

:: ─── 4. PORTAL FRONTEND (:3030) — standalone (own .next-portal) ──────────
echo [4/4] Starting Portal Console (:%PORTAL_FE_PORT%)...
echo [%DATE% %TIME%] [PORTAL-FE] Starting >> "%LM%"
if exist "%~dp0..\Frontend\.next-portal\BUILD_ID" (
    start "MeterVerse-PortalConsole" cmd /c "cd /d %~dp0..\Frontend && set PORTAL_MODE=1&& set NEXT_PUBLIC_API_URL=http://localhost:%PORTAL_BE_PORT%&& call node_modules\.bin\next.cmd start -p %PORTAL_FE_PORT% >> "%LPF%" 2>&1"
    echo   Portal Console production mode
) else (
    start "MeterVerse-PortalConsole" cmd /c "cd /d %~dp0..\Frontend && set PORTAL_MODE=1&& set NEXT_PUBLIC_API_URL=http://localhost:%PORTAL_BE_PORT%&& call node_modules\.bin\next.cmd dev -p %PORTAL_FE_PORT% >> "%LPF%" 2>&1"
    echo   Portal Console dev mode
)

echo.
echo Waiting for services to become healthy (up to 90s)...
echo [%DATE% %TIME%] [SYS] Waiting for health >> "%LM%"

:: ─── HEALTH CHECKS ────────────────────────────────────────────────────────
set ALL_OK=1

call :WAIT_HTTP "%ADMIN_BE_PORT%" /api/health 45 ADMIN-BE
call :WAIT_HTTP "%ADMIN_FE_PORT%" / 60 ADMIN-FE
call :WAIT_HTTP "%PORTAL_BE_PORT%" /api/health 45 PORTAL-BE
call :WAIT_HTTP "%PORTAL_FE_PORT%" / 60 PORTAL-FE

echo.
echo =====================================================================
echo  MeterVerse OS — TWO STANDALONE VERSIONS
echo    Admin  : http://localhost:%ADMIN_FE_PORT%/admin   (Admin API :%ADMIN_BE_PORT%)
echo    Portal : http://localhost:%PORTAL_FE_PORT%/       (Portal API :%PORTAL_BE_PORT%)
echo =====================================================================
echo.
echo Logs: %LOG_DIR%  (errors.log for failures)
echo [%DATE% %TIME%] [SYS] Startup complete >> "%LM%"
pause
exit /b 0

:: ─── HELPER: wait for HTTP with timeout, log failures ────────────────────
:WAIT_HTTP
setlocal enabledelayedexpansion
set "PORT=%~1"
set "PATHX=%~2"
set "MAX=%~3"
set "NAME=%~4"
set N=0
:WAIT_LOOP
set /a N+=1
if !N! GTR %MAX% (
    echo   [!NAME!] FAILED — http://localhost:!PORT!!PATHX! not reachable after %MAX%s
    echo [%DATE% %TIME%] [!NAME!] FAILED after %MAX%s >> "%LE%"
    endlocal & exit /b 0
)
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:!PORT!!PATHX!' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -lt 500){exit 0}else{exit 1}}catch{exit 1}" 2>nul
if !errorlevel!==0 (
    echo   [!NAME!] OK — http://localhost:!PORT!!PATHX!
    echo [%DATE% %TIME%] [!NAME!] Healthy >> "%LM%"
    endlocal & exit /b 0
)
timeout /t 2 /nobreak >nul
goto WAIT_LOOP
