@echo off
title MeterVerse Advanced Crash Test
cd /d D:\meter
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════════════════════
::  ADVANCED CRASH TEST — Tests 5 different failure modes
::  Run this directly by double-clicking (not from PowerShell)
:: ═══════════════════════════════════════════════════════════════════════════════

set LOG=_tools\logs\advanced_test.log
set PASS=0&set FAIL=0&set PHASE=0

echo ══════════════════════════════════════════════════════════════ > %LOG%
echo ADVANCED CRASH TEST - %DATE% %TIME% >> %LOG%
echo Tests 5 different failure modes >> %LOG%
echo ══════════════════════════════════════════════════════════════ >> %LOG%

:: Clean start
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Conflict" 2>nul >nul
timeout /t 3 /nobreak >nul

:: Start services
echo Starting services...
start "MeterVerse-Backend" cmd /c "cd /d %~dp0backend && node src/server.js"
start "MeterVerse-Frontend" cmd /c "cd /d %~dp0Frontend && npx next start -p 7400"
echo Waiting 20s for startup...
timeout /t 20 /nobreak >nul

:: Verify
call :CHECK_BE
if %BE_UP%==0 ( echo Backend failed to start! & pause & exit /b 1 )
echo Starting tests...

:: ═══════════════════════════════════════════════════════════════════════════════
::  TEST 1: Standard window kill (single service, standard recovery)
:: ═══════════════════════════════════════════════════════════════════════════════
set /a PHASE+=1
echo.
echo ═══ TEST !PHASE! — Standard BE kill ═══
call :LOG "TEST !PHASE!: Standard window kill"
timeout /t 15 /nobreak >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
echo  Killed BE. Waiting 35s...
timeout /t 35 /nobreak >nul
call :CHECK_BE
if !BE_UP!==1 ( call :PASS ) else ( call :FAIL )
echo.

:: ═══════════════════════════════════════════════════════════════════════════════
::  TEST 2: Both services killed simultaneously
:: ═══════════════════════════════════════════════════════════════════════════════
set /a PHASE+=1
echo ═══ TEST !PHASE! — Both killed simultaneously ═══
call :LOG "TEST !PHASE!: Both simultaneous kill"
timeout /t 15 /nobreak >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
echo  Killed BOTH. Waiting 45s...
timeout /t 45 /nobreak >nul
call :CHECK_BE & call :CHECK_FE
if !BE_UP!==1 ( call :PASS ) else ( call :FAIL )
if !FE_UP!==1 ( call :PASS ) else ( call :FAIL )
echo.

:: ═══════════════════════════════════════════════════════════════════════════════
::  TEST 3: Frontend killed twice rapidly (5s apart — tests rapid recovery)
:: ═══════════════════════════════════════════════════════════════════════════════
set /a PHASE+=1
echo ═══ TEST !PHASE! — Rapid double FE kill ═══
call :LOG "TEST !PHASE!: Rapid double kill"
timeout /t 15 /nobreak >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 5 /nobreak >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
echo  Killed FE x2. Waiting 40s...
timeout /t 40 /nobreak >nul
call :CHECK_FE
if !FE_UP!==1 ( call :PASS ) else ( call :FAIL )
echo.

:: ═══════════════════════════════════════════════════════════════════════════════
::  TEST 4: Alternating rapid kills (5 cycles, 8s apart)
:: ═══════════════════════════════════════════════════════════════════════════════
set /a PHASE+=1
echo ═══ TEST !PHASE! — Alternating rapid kills (5 cycles) ═══
call :LOG "TEST !PHASE!: Alternating rapid kills"
timeout /t 15 /nobreak >nul
for /l %%i in (1,1,5) do (
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
    timeout /t 2 /nobreak >nul
    taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
    timeout /t 6 /nobreak >nul
)
echo  Alternating kills done. Waiting 50s...
timeout /t 50 /nobreak >nul
call :CHECK_BE
if !BE_UP!==1 ( call :PASS ) else ( call :FAIL )
call :CHECK_FE
if !FE_UP!==1 ( call :PASS ) else ( call :FAIL )
echo.

:: ═══════════════════════════════════════════════════════════════════════════════
::  TEST 5: Flood HTTP requests while killing (stress + crash combined)
:: ═══════════════════════════════════════════════════════════════════════════════
set /a PHASE+=1
echo ═══ TEST !PHASE! — HTTP flood + crash ═══
call :LOG "TEST !PHASE!: HTTP flood + kill"
:: Start HTTP flood in background
start /b "" cmd /c "for /l %%i in (1,1,50) do (PowerShell -Command \"try{Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop}catch{}\" 2^>nul >nul)"
timeout /t 5 /nobreak >nul
:: Kill while under load
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
timeout /t 3 /nobreak >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 40 /nobreak >nul
call :CHECK_BE
if !BE_UP!==1 ( call :PASS ) else ( call :FAIL )
call :CHECK_FE
if !FE_UP!==1 ( call :PASS ) else ( call :FAIL )

:: ═══════════════════════════════════════════════════════════════════════════════
::  RESULTS
:: ═══════════════════════════════════════════════════════════════════════════════
echo.
echo ══════════════════════════════════════════════════════════════
echo  RESULTS
echo ══════════════════════════════════════════════════════════════
set /a TOTAL=PASS+FAIL
echo  Tests: %PASS%/%TOTAL% passed
echo.
echo ══════════════════════════════════════════════════════════════ >> %LOG%
echo FINAL: %PASS%/%TOTAL% >> %LOG%
echo ══════════════════════════════════════════════════════════════ >> %LOG%

:: Cleanup
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Conflict" 2>nul >nul
echo.
pause

:: ─── HELPERS ──────────────────────────────────────────────────────────────────
:CHECK_BE
set BE_UP=0
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" 2>nul
if %errorlevel%==0 set BE_UP=1
exit /b

:CHECK_FE
set FE_UP=0
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:7400' -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" 2>nul
if %errorlevel%==0 set FE_UP=1
exit /b

:LOG
echo [%DATE% %TIME%] %* >> %LOG%
exit /b

:PASS
set /a PASS+=1
echo  ✅ PASS
echo [%DATE% %TIME%] PASS >> %LOG%
exit /b

:FAIL
set /a FAIL+=1
echo  ❌ FAIL
echo [%DATE% %TIME%] FAIL >> %LOG%
exit /b
