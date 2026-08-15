@echo off
:: ============================================================================
:: METERVERSE OS - BOOT (verified launcher)
:: Real status only: probes each service BEFORE saying RUNNING. No fake banners.
:: Usage:  Boot.cmd          (starts all + verifies + opens browser)
:: ============================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0.."
call "%~dp0config.cmd"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ============================================================
echo   METERVERSE OS - BOOT
echo   Native DB :5433   (NOT Docker)
echo ============================================================

rem --- DB check ---
call :CHECK_DB
rem P60.1: the :5433 MeterVerse DB is PG16 service "postgresql" (NOT postgresql-x64-18 which is PG18 on :5434).
if errorlevel 1 ( echo  [DB] :5433 ................ FAIL  - start: net start postgresql  ^(PG16 :5433; x64-18 is PG18 :5434^) ) else ( echo  [DB] :5433 ................ OK )

rem --- Stop stale then start all 4 detached ---
call :KILL_ALL
timeout /t 3 /nobreak >nul

echo  Starting services (detached)...

start "MeterVerse-AdminAPI" /min cmd /c "cd /d %~dp0..\backend && set PORT=3131 && node src/server.js >> "%LB%" 2>&1"
start "MeterVerse-PortalAPI" /min cmd /c "cd /d %~dp0..\backend && set PORT=3003 && set PORTAL_MODE=1 && node src/server.js >> "%LPB%" 2>&1"
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-AdminConsole" /min cmd /c "cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:3131 && call node_modules\.bin\next.cmd start -p 3535 >> "%LF%" 2>&1"
) else (
    echo  [FE] admin build missing - run: cd Frontend ^&^& npx next build
)
if exist "%~dp0..\Frontend\.next-portal\BUILD_ID" (
    start "MeterVerse-PortalConsole" /min cmd /c "cd /d %~dp0..\Frontend && set PORTAL_MODE=1 && set NEXT_PUBLIC_API_URL=http://localhost:3003 && call node_modules\.bin\next.cmd start -p 3030 >> "%LPF%" 2>&1"
) else (
    echo  [FE] portal build missing - run: cd Frontend ^&^& set PORTAL_MODE=1 ^&^& npx next build
)

rem --- VERIFY (real probes, up to 60s) ---
echo.
echo  Verifying services (waiting up to 60s)...
call :WAIT_OK 3131 /api/health 60 "Admin BE :3131"
call :WAIT_OK 3535 / 60 "Admin FE :3535"
call :WAIT_OK 3003 /api/health 60 "Portal BE :3003"
call :WAIT_OK 3030 / 60 "Portal FE :3030"

echo.
echo ============================================================
echo   METERVERSE OS - BOOT RESULT
echo   Admin:  http://localhost:3535/admin
echo   Portal: http://localhost:3030/
echo   API:    3131 (admin)  3003 (portal)   DB: 5433 (native)
echo   Logs:   %LOG_DIR%
echo ============================================================
rem Open both in browser if they responded
if "%ADMINOK%"=="1" start "" http://localhost:3535/admin
if "%PORTALOK%"=="1" start "" http://localhost:3030/
if not "%ADMINOK%"=="1" echo  [WARN] Admin FE did NOT respond - check %LF%
if not "%PORTALOK%"=="1" echo  [WARN] Portal FE did NOT respond - check %LPF%
exit /b 0

:CHECK_DB
PowerShell -Command "try{$s=New-Object System.Net.Sockets.TcpClient;$s.Connect('127.0.0.1',5433);$s.Close();exit 0}catch{exit 1}" >nul 2>&1
exit /b

:WAIT_OK
setlocal
set "WP=%~1"
set "WX=%~2"
set "WMAX=%~3"
set "WN=%~4"
set /a N=0
:WLOOP
set /a N+=1
if !N! GTR %WMAX% (
    echo   [%WN%] FAIL - http://localhost:!WP!!WX!
    endlocal & exit /b 1
)
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:!WP!!WX!' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; if($r.StatusCode -lt 500){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
if !errorlevel!==0 (
    echo   [%WN%] OK
    if "%WN%"=="Admin FE :3535" endlocal & set "ADMINOK=1" & exit /b 0
    if "%WN%"=="Portal FE :3030" endlocal & set "PORTALOK=1" & exit /b 0
    endlocal & exit /b 0
)
timeout /t 2 /nobreak >nul
goto WLOOP

:KILL_ALL
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminAPI" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminConsole" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalAPI" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalConsole" >nul 2>&1
for %%P in (3131 3535 3003 3030) do (
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%%P "') do (
        if not "%%p"=="0" taskkill /F /PID %%p >nul 2>&1
    )
)
exit /b
