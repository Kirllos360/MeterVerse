@echo off
title MeterVerse
cd /d "%~dp0.."
setlocal enabledelayedexpansion

set BE_PORT=3001
set FE_PORT=7400
set LD=%~dp0logs
set LM=%~dp0logs\main.log
set LE=%~dp0logs\errors.log
set LB=%~dp0logs\backend.log
set LF=%~dp0logs\frontend.log
set LX=%~dp0logs\fix.log

if not exist "%~dp0logs" mkdir "%~dp0logs"

echo [%DATE% %TIME%] [MAIN] Started >> "%LM%"
echo [%DATE% %TIME%] [MAIN] Started >> "%LE%"

if not "%1"=="" (
    if "%1"=="1" goto SS
    if "%1"=="2" goto SP
    if "%1"=="3" goto GP
)
goto MN

:MN
cls
echo.
echo  ===== MeterVerse Control =====
echo.
echo  1. Start Services
echo  2. Stop Services
echo  3. Git Push
echo  4. Status
echo  5. View Errors
echo  6. Exit
echo.
set /p ch="Select: "
if "%ch%"=="1" goto SS
if "%ch%"=="2" goto SP
if "%ch%"=="3" goto GP
if "%ch%"=="4" goto ST
if "%ch%"=="5" goto VL
if "%ch%"=="6" exit
goto MN

:SS
cls
echo Starting...
echo [%DATE% %TIME%] [MAIN] Starting services >> "%LM%"
taskkill /F /IM node.exe 2>nul >nul
timeout /t 2 /nobreak >nul

echo [1] Backend...
echo [%DATE% %TIME%] [BE] Launching >> "%LM%"
start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1

echo Waiting (10s)...
timeout /t 10 /nobreak >nul

echo [2] Frontend...
echo [%DATE% %TIME%] [FE] Launching >> "%LM%"
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1
) else (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1
)

echo.
echo Admin: http://localhost:%FE_PORT%/admin
echo Login: admin@meterverse.com / Admin@123
echo.
echo [%DATE% %TIME%] [MAIN] Launched >> "%LM%"
echo.

:ML
echo ??? Monitor ???
set B=0&set F=0
PowerShell -Command "try{=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( set B=1 & echo BE: OK ) else ( echo BE: DOWN - restarting & start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%LB%" 2>&1 & echo [%DATE% %TIME%] [BE] Auto-restart >> "%LM%" & echo [%DATE% %TIME%] [BE] Auto-restart >> "%LE%" )

PowerShell -Command "try{=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 ( set F=1 & echo FE: OK ) else ( echo FE: DOWN - restarting & if exist "%~dp0..\Frontend\.next\BUILD_ID" (start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%" > "%LF%" 2>&1) else (start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%" > "%LF%" 2>&1) & echo [%DATE% %TIME%] [FE] Auto-restart >> "%LM%" & echo [%DATE% %TIME%] [FE] Auto-restart >> "%LE%" )

echo 30s pause (Ctrl+C to stop)...
ping -n 31 127.0.0.1 >nul 2>nul
goto ML

:SP
cls
echo Stopping...
taskkill /F /IM node.exe 2>nul >nul
echo [%DATE% %TIME%] [MAIN] Stopped >> "%LM%"
echo Done.
pause
goto MN

:GP
cls
echo Pushing to GitHub...
git add -A 2>nul
git commit -m "Update %DATE% %TIME%" 2>nul
git push origin clean-main:main 2>nul
if %errorlevel%==0 (echo OK) else (echo FAIL)
echo [%DATE% %TIME%] [GIT] Push >> "%LM%"
pause
goto MN

:ST
cls
PowerShell -Command "try{=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo BE: RUNNING) else (echo BE: STOPPED)
PowerShell -Command "try{=Invoke-WebRequest -Uri 'http://localhost:%FE_PORT%' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo FE: RUNNING) else (echo FE: STOPPED)
pause
goto MN

:VL
cls
type "%LE%" 2>nul | more
if %errorlevel%==1 echo (no errors)
echo.
echo Full: %LM%
pause
goto MN
