@echo off
:: ============================================================================
:: METERVERSE OS - START ALL (detached, windowless, survives closing this)
:: Launches DB-check + 4 services as hidden background processes so the
:: system keeps running even after this window closes. Native PostgreSQL only.
:: Usage: StartAll.cmd   (then open http://localhost:3535/admin in browser)
:: ============================================================================
setlocal
cd /d "%~dp0.."
call "%~dp0config.cmd"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ============================================================
echo   METERVERSE OS - Starting all services (detached)
echo   Native DB :5433  (NOT Docker)
echo ============================================================

rem --- DB check ---
echo [DB] Checking PostgreSQL :5433 ...
PowerShell -Command "try{$s=New-Object System.Net.Sockets.TcpClient;$s.Connect('127.0.0.1',5433);$s.Close();exit 0}catch{exit 1}" >nul 2>&1
if errorlevel 1 (
    echo [DB] WARNING: PostgreSQL not detected on :5433.
    echo      Start the native service: net start postgresql-x64-18
    echo      Frontend will start in UI-only mode.
)

rem --- 1. Admin Backend :3131 (hidden, detached) ---
echo [1/4] Admin Backend :3131 ...
start "MeterVerse-AdminAPI" /min cmd /c "title MeterVerse Admin Backend :3131 && cd /d %~dp0..\backend && set NODE_ENV=development && set PORT=3131 && node src/server.js >> "%LB%" 2>&1"

rem --- 2. Admin Frontend :3535 (hidden, detached) ---
echo [2/4] Admin Frontend :3535 ...
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-AdminConsole" /min cmd /c "title MeterVerse Admin Console :3535 && cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:3131 && call node_modules\.bin\next.cmd start -p 3535 >> "%LF%" 2>&1"
) else (
    echo      [warn] Admin build missing (.next/BUILD_ID). Run: cd Frontend ^&^& npx next build
    start "MeterVerse-AdminConsole" /min cmd /c "title MeterVerse Admin Console :3535 && cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:3131 && call node_modules\.bin\next.cmd dev -p 3535 >> "%LF%" 2>&1"
)

rem --- 3. Portal Backend :3003 (hidden, detached) ---
echo [3/4] Portal Backend :3003 ...
start "MeterVerse-PortalAPI" /min cmd /c "title MeterVerse Portal Backend :3003 && cd /d %~dp0..\backend && set NODE_ENV=development && set PORT=3003 && set PORTAL_MODE=1 && node src/server.js >> "%LPB%" 2>&1"

rem --- 4. Portal Frontend :3030 (hidden, detached) ---
echo [4/4] Portal Frontend :3030 ...
if exist "%~dp0..\Frontend\.next-portal\BUILD_ID" (
    start "MeterVerse-PortalConsole" /min cmd /c "title MeterVerse Portal Console :3030 && cd /d %~dp0..\Frontend && set PORTAL_MODE=1 && set NEXT_PUBLIC_API_URL=http://localhost:3003 && call node_modules\.bin\next.cmd start -p 3030 >> "%LPF%" 2>&1"
) else (
    echo      [warn] Portal build missing (.next-portal/BUILD_ID). Run: cd Frontend ^&^& set PORTAL_MODE=1 ^&^& npx next build
    start "MeterVerse-PortalConsole" /min cmd /c "title MeterVerse Portal Console :3030 && cd /d %~dp0..\Frontend && set PORTAL_MODE=1 && set NEXT_PUBLIC_API_URL=http://localhost:3003 && call node_modules\.bin\next.cmd dev -p 3030 >> "%LPF%" 2>&1"
)

echo.
echo Waiting up to 90s for services...
PowerShell -Command "$n=0; while($n -lt 60){ try{$r=Invoke-WebRequest -Uri 'http://localhost:3131/api/health' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; if($r.StatusCode -eq 200){break}}catch{}; Start-Sleep -s 2; $n++}"
echo.
echo ============================================================
echo   METERVERSE OS - ALL SERVICES STARTED (detached)
echo   Admin:   http://localhost:3535/admin
echo   Portal:  http://localhost:3030/
echo   API:     3131 (admin)  3003 (portal)   DB: 5433 (native)
echo   Logs:    %LOG_DIR%
echo   These windows may be minimized; services keep running.
echo ============================================================
exit /b 0
