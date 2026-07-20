@echo off
title MeterVerse STRESS TEST
cd /d D:\meter\_tools
setlocal enabledelayedexpansion

set LOG=logs\stresstest.log
set PASS=0
set FAIL=0
set CYCLE=0
set START_TIME=%TIME%

echo ══════════════════════════════════════════════════════════════ > %LOG%
echo 15-MINUTE STRESS TEST - %DATE% %TIME% >> %LOG%
echo ══════════════════════════════════════════════════════════════ >> %LOG%
echo.

echo ╔══════════════════════════════════════════════╗
echo ║     15-MINUTE STRESS TEST                    ║
║     Testing Fix Engine Behavior                  ║
╚══════════════════════════════════════════════╝
echo.

:: Kill old
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
timeout /t 3 /nobreak >nul

:: Start services
echo [SETUP] Starting services...
call ..\MainControl.cmd 1 > nul 2>&1
timeout /t 15 /nobreak >nul

:: Verify services are up
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo [OK] Backend running ) else ( echo [FAIL] Backend not running & exit /b 1 )
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:7400' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( echo [OK] Frontend running ) else ( echo [WARN] Frontend not running yet )

echo.
echo Starting random crash cycles...
echo.

:: ─── TEST LOOP (15 minutes) ─────────────────────────────────────────────────
:LOOP
set /a CYCLE+=1

:: Random delay 20-50s
set /a DELAY=!RANDOM! %% 31 + 20
echo ═══ Cycle !CYCLE! — waiting !DELAY!s ═══ >> %LOG%
timeout /t !DELAY! /nobreak >nul

:: Random crash scenario (0=BE, 1=FE, 2=BOTH)
set /a SCENARIO=!RANDOM! %% 3

if !SCENARIO!==0 (
    echo [CYCLE !CYCLE!] Killing BACKEND only
    echo [CYCLE !CYCLE!] Scenario: Kill BACKEND >> %LOG%
    for /f "tokens=2 delims== " %%a in ('wmic process where "name='node.exe'" get ProcessId /format:list 2^>nul ^| findstr "ProcessId"') do (
        wmic process where "ProcessId=%%a and CommandLine like '%%server.js%%'" delete 2>nul
    )
    taskkill /F /FI "WINDOWTITLE eq cmd" 2>nul
)

if !SCENARIO!==1 (
    echo [CYCLE !CYCLE!] Killing FRONTEND only
    echo [CYCLE !CYCLE!] Scenario: Kill FRONTEND >> %LOG%
    for /f "tokens=2 delims== " %%a in ('wmic process where "name='node.exe'" get ProcessId /format:list 2^>nul ^| findstr "ProcessId"') do (
        wmic process where "ProcessId=%%a and CommandLine like '%%next%%'" delete 2>nul
    )
)

if !SCENARIO!==2 (
    echo [CYCLE !CYCLE!] Killing BOTH
    echo [CYCLE !CYCLE!] Scenario: Kill BOTH >> %LOG%
    taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul >nul
)

:: Wait for recovery (30-60s)
set /a WAIT=!RANDOM! %% 31 + 30
echo  Waiting !WAIT!s for fix engine...
timeout /t !WAIT! /nobreak >nul

:: Check recovery
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
set BE_UP=%errorlevel%

PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:7400' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
set FE_UP=%errorlevel%

:: Score
if !BE_UP!==0 ( set /a PASS+=1 & echo  ✅ BE recovered ) else ( set /a FAIL+=1 & echo  ❌ BE DOWN )
if !FE_UP!==0 ( set /a PASS+=1 & echo  ✅ FE recovered ) else ( set /a FAIL+=1 & echo  ❌ FE DOWN )

echo [CYCLE !CYCLE!] Result: BE=!BE_UP! FE=!FE_UP! >> %LOG%

:: Check time
set NOW=%TIME%
if "!NOW!" LSS "!START_TIME!" set START_TIME=00:00:00.00

:: Simple time check — stop after ~15 min
if !CYCLE! GEQ 15 goto END
goto LOOP

:END
echo.
echo ══════════════════════════════════════════════════════════════
echo  STRESS TEST COMPLETE
echo ══════════════════════════════════════════════════════════════
echo.
set /a TOTAL=!PASS!+!FAIL!
echo  Cycles: !CYCLE!
echo  Pass:   !PASS!
echo  Fail:   !FAIL!
echo  Rate:   !PASS! / !TOTAL!
echo.
echo  Results logged to: %LOG%
echo.
echo ══════════════════════════════════════════════════════════════ >> %LOG%
echo Total: !PASS!/!TOTAL! passes >> %LOG%
echo ══════════════════════════════════════════════════════════════ >> %LOG%

pause

