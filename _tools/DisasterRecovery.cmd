@echo off
title MeterVerse Disaster Recovery
cd /d "%~dp0.."
setlocal enabledelayedexpansion
call "%~dp0config.cmd"cd /d "%~dp0.."
setlocal enabledelayedexpansion

:: â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
::  MeterVerse Disaster Recovery Plan
::  Run this when the system is down and needs emergency recovery
:: â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

set LOG=_tools\logs\dr_recovery.log
echo [%DATE% %TIME%] === DISASTER RECOVERY STARTED === > %LOG%

cls
echo.
echo â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
echo â•‘     MeterVerse Disaster Recovery             â•‘
â•‘     Emergency System Restoration                 â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
echo.

:: â”€â”€â”€ STEP 1: Kill all â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo [1/6] Stopping all services...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
echo [%DATE% %TIME%] Kill complete >> %LOG%
echo   Done.

:: â”€â”€â”€ STEP 2: Check Docker / Database â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo [2/6] Checking database...
docker ps --filter "name=meter-postgres" --format "{{.Status}}" 2>nul | findstr "Up" >nul 2>nul
if %errorlevel%==0 (
    echo   âœ… Database is running
) else (
    echo   âš  Database not running. Attempting to start...
    docker compose up -d postgres 2>nul
    timeout /t 10 /nobreak >nul
    docker ps --filter "name=meter-postgres" --format "{{.Status}}" 2>nul | findstr "Up" >nul 2>nul
    if !errorlevel!==0 ( echo   âœ… Database started ) else ( echo   âŒ Database failed to start. Check Docker. )
)
echo [%DATE% %TIME%] DB check complete >> %LOG%

:: â”€â”€â”€ STEP 3: Rebuild backend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo [3/6] Rebuilding backend...
cd /d "%~dp0..\backend"
call npm install --silent 2>>%LOG%
call npx prisma generate 2>>%LOG%
echo [%DATE% %TIME%] Backend deps done >> %LOG%
echo   Done.

:: â”€â”€â”€ STEP 4: Rebuild frontend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo [4/6] Rebuilding frontend...
cd /d "%~dp0..\Frontend"
call npm install --silent 2>>%LOG%
call npx next build 2>>%LOG%
if %errorlevel%==0 ( echo   âœ… Frontend built ) else ( echo   âŒ Frontend build failed )
echo [%DATE% %TIME%] Frontend build: %errorlevel% >> %LOG%

:: â”€â”€â”€ STEP 5: Start services â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo [5/6] Starting services...
cd /d "%~dp0.."
call "%~dp0config.cmd"
start "MeterVerse-AdminAPI" cmd /c "cd /d %~dp0..\backend && set PORT=3131&& node src/server.js >> "%LB%" 2>&1"
timeout /t 5 /nobreak >nul
start "MeterVerse-AdminConsole" cmd /c "cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:3131&& call node_modules\.bin\next.cmd start -p 3535 >> "%LF%" 2>&1"
echo   Services launching...
echo [%DATE% %TIME%] Services launched >> %LOG%

:: â”€â”€â”€ STEP 6: Verify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo [6/6] Verifying recovery...
timeout /t 15 /nobreak >nul
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3131/api/health' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   âœ… Admin API: RUNNING ) else ( echo   âŒ Admin API: DOWN )
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3535' -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   âœ… Admin Console: RUNNING ) else ( echo   âŒ Admin Console: DOWN (may need compile time) )

echo.
echo â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
echo  Recovery Status
echo â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
echo  Log: %CD%\%LOG%
echo  Login: admin@meterverse.com / Admin@123
echo  http://localhost:3535/admin
echo â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
echo.
echo [%DATE% %TIME%] Recovery complete >> %LOG%
pause

