@echo off
title MeterVerse STRESS TEST
cd /d "%~dp0"
setlocal enabledelayedexpansion
call "%~dp0config.cmd"

set LOG=%LOG_DIR%\stresstest.log
set PASS=0
set FAIL=0
set CYCLE=0

echo === 15-MINUTE STRESS TEST === > %LOG%

echo Killing old services...
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 3 /nobreak >nul

:: Start fresh
start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js"
timeout /t 10 /nobreak >nul

:: Verify startup
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo [OK] Backend running) else (echo [FAIL] Backend not running & exit /b 1)

echo Starting random crash cycles...
echo.

:LOOP
set /a CYCLE+=1
set /a DELAY=!RANDOM! %% 31 + 20
echo === Cycle !CYCLE! — waiting !DELAY!s === >> %LOG%
timeout /t !DELAY! /nobreak >nul

set /a SCENARIO=!RANDOM! %% 3
if !SCENARIO!==0 (
    echo [CYCLE !CYCLE!] Killing BACKEND
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
)
if !SCENARIO!==1 (
    echo [CYCLE !CYCLE!] Killing FRONTEND
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
)
if !SCENARIO!==2 (
    echo [CYCLE !CYCLE!] Killing BOTH
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
)

set /a WAIT=!RANDOM! %% 31 + 30
echo  Recovery wait !WAIT!s...
timeout /t !WAIT! /nobreak >nul

PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if !errorlevel!==0 ( set /a PASS+=1 & echo  BE: RECOVERED ) else ( set /a FAIL+=1 & echo  BE: DOWN )
echo [CYCLE !CYCLE!] PASS=!PASS! FAIL=!FAIL! >> %LOG%

if !CYCLE! GEQ 15 goto END
goto LOOP

:END
echo.
set /a TOTAL=PASS+FAIL
echo  Cycles: !CYCLE!  Pass: !PASS!  Fail: !FAIL!  Rate: !PASS!/!TOTAL!
echo Total: !PASS!/!TOTAL! >> %LOG%
pause
