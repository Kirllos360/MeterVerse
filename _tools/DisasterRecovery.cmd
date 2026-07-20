@echo off
title MeterVerse Disaster Recovery
cd /d "%~dp0.."
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════════════════════
::  MeterVerse Disaster Recovery Plan
::  Run this when the system is down and needs emergency recovery
:: ═══════════════════════════════════════════════════════════════════════════════

set LOG=_tools\logs\dr_recovery.log
echo [%DATE% %TIME%] === DISASTER RECOVERY STARTED === > %LOG%

cls
echo.
echo ╔══════════════════════════════════════════════╗
echo ║     MeterVerse Disaster Recovery             ║
║     Emergency System Restoration                 ║
╚══════════════════════════════════════════════╝
echo.

:: ─── STEP 1: Kill all ────────────────────────────────────────────────────────
echo [1/6] Stopping all services...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
echo [%DATE% %TIME%] Kill complete >> %LOG%
echo   Done.

:: ─── STEP 2: Check Docker / Database ─────────────────────────────────────────
echo [2/6] Checking database...
docker ps --filter "name=meter-postgres" --format "{{.Status}}" 2>nul | findstr "Up" >nul 2>nul
if %errorlevel%==0 (
    echo   ✅ Database is running
) else (
    echo   ⚠ Database not running. Attempting to start...
    docker compose up -d postgres 2>nul
    timeout /t 10 /nobreak >nul
    docker ps --filter "name=meter-postgres" --format "{{.Status}}" 2>nul | findstr "Up" >nul 2>nul
    if !errorlevel!==0 ( echo   ✅ Database started ) else ( echo   ❌ Database failed to start. Check Docker. )
)
echo [%DATE% %TIME%] DB check complete >> %LOG%

:: ─── STEP 3: Rebuild backend ─────────────────────────────────────────────────
echo [3/6] Rebuilding backend...
cd /d "%~dp0..\backend"
call npm install --silent 2>>%LOG%
call npx prisma generate 2>>%LOG%
echo [%DATE% %TIME%] Backend deps done >> %LOG%
echo   Done.

:: ─── STEP 4: Rebuild frontend ────────────────────────────────────────────────
echo [4/6] Rebuilding frontend...
cd /d "%~dp0..\Frontend"
call npm install --silent 2>>%LOG%
call npx next build 2>>%LOG%
if %errorlevel%==0 ( echo   ✅ Frontend built ) else ( echo   ❌ Frontend build failed )
echo [%DATE% %TIME%] Frontend build: %errorlevel% >> %LOG%

:: ─── STEP 5: Start services ──────────────────────────────────────────────────
echo [5/6] Starting services...
cd /d "%~dp0.."
start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js"
timeout /t 5 /nobreak >nul
start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p 7400"
echo   Services launching...
echo [%DATE% %TIME%] Services launched >> %LOG%

:: ─── STEP 6: Verify ─────────────────────────────────────────────────────────
echo [6/6] Verifying recovery...
timeout /t 15 /nobreak >nul
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   ✅ Backend: RUNNING ) else ( echo   ❌ Backend: DOWN )
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:7400' -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo   ✅ Frontend: RUNNING ) else ( echo   ❌ Frontend: DOWN (may need compile time) )

echo.
echo ══════════════════════════════════════════════════════════════
echo  Recovery Status
echo ══════════════════════════════════════════════════════════════
echo  Log: %CD%\%LOG%
echo  Login: admin@meterverse.com / Admin@123
echo  http://localhost:7400/admin
echo ══════════════════════════════════════════════════════════════
echo.
echo [%DATE% %TIME%] Recovery complete >> %LOG%
pause
