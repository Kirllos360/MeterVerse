@echo off
title MeterVerse Deployment
cd /d "%~dp0.."
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════════════════════
::  MeterVerse Deployment Script
::  Builds, backs up, deploys, and verifies all services
:: ═══════════════════════════════════════════════════════════════════════════════

set LOG=%~dp0..\deploy.log
echo [%DATE% %TIME%] === DEPLOYMENT STARTED === > %LOG%

:MENU
cls
echo.
echo  ===== MeterVerse Deployment =====
echo.
echo  1. Full Production Deploy
echo  2. Build Only
echo  3. Backup Database
echo  4. Restore Database
echo  5. Performance Test
echo  6. Status Check
echo  7. Exit
echo.
set /p ch="Select: "
if "%ch%"=="1" goto DEPLOY
if "%ch%"=="2" goto BUILD
if "%ch%"=="3" goto BACKUP
if "%ch%"=="4" goto RESTORE
if "%ch%"=="5" goto PERF
if "%ch%"=="6" goto STATUS
if "%ch%"=="7" exit
goto MENU

:DEPLOY
cls
echo.
echo ═══ Full Production Deploy ═══
echo.
echo [%DATE% %TIME%] Starting deploy >> %LOG%

:: Step 1: Git pull latest
echo [1/6] Pulling latest code...
git pull origin clean-main:main 2>>%LOG%
echo [%DATE% %TIME%] Git pull done >> %LOG%

:: Step 2: Backup database
echo [2/6] Backing up database...
call :BACKUP_DB
echo [%DATE% %TIME%] Backup done >> %LOG%

:: Step 3: Install backend deps
echo [3/6] Installing backend dependencies...
cd /d "%~dp0..\backend"
call npm install --silent 2>>%LOG%
cd /d "%~dp0.."
echo [%DATE% %TIME%] Backend deps done >> %LOG%

:: Step 4: Build frontend
echo [4/6] Building frontend...
cd /d "%~dp0..\Frontend"
call npm install --silent 2>>%LOG%
call npx next build 2>>%LOG%
cd /d "%~dp0.."
echo [%DATE% %TIME%] Frontend build done >> %LOG%

:: Step 5: Database migration
echo [5/6] Running database migrations...
cd /d "%~dp0..\backend"
call npx prisma db push 2>>%LOG%
cd /d "%~dp0.."
echo [%DATE% %TIME%] Migrations done >> %LOG%

:: Step 6: Verify
echo [6/6] Verifying deployment...
call :VERIFY

echo.
echo [%DATE% %TIME%] Deploy complete >> %LOG%
echo  ✅ Deployment complete.
echo.
pause
goto MENU

:BUILD
cls
echo Building frontend...
cd /d "%~dp0..\Frontend"
call npm install --silent
call npx next build
cd /d "%~dp0.."
if %errorlevel%==0 (echo ✅ Build successful) else (echo ❌ Build failed)
echo [%DATE% %TIME%] Build: %errorlevel% >> %LOG%
pause
goto MENU

:BACKUP
cls
call :BACKUP_DB
pause
goto MENU

:RESTORE
cls
echo.
echo Available backups:
dir /b "%~dp0..\backups\*.sql" 2>nul || echo (no backups found)
echo.
set /p file="Enter backup filename: "
if exist "%~dp0..\backups\%file%" (
    echo Restoring %file%...
    docker exec -i meter-postgres-1 psql -U postgres meter_pulse < "%~dp0..\backups\%file%" 2>nul
    if %errorlevel%==0 (echo ✅ Restore complete) else (echo ❌ Restore failed)
    echo [%DATE% %TIME%] Restore: %file% >> %LOG%
) else (
    echo File not found
)
pause
goto MENU

:PERF
cls
echo Running performance tests...
echo [%DATE% %TIME%] Performance test >> %LOG%

:: Test backend response time
echo Testing backend response...
set TOTAL=0
for /l %%i in (1,1,10) do (
    for /f %%t in ('PowerShell -Command "(Measure-Command {try{Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop}catch{}).TotalMilliseconds"') do set /a TOTAL+=%%t
)
set /a AVG=TOTAL/10
echo  Backend avg response: %AVG%ms
echo Backend: %AVG%ms avg >> %LOG%

:: Test frontend response
set TOTAL=0
for /l %%i in (1,1,10) do (
    for /f %%t in ('PowerShell -Command "(Measure-Command {try{Invoke-WebRequest -Uri 'http://localhost:7400' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop}catch{}).TotalMilliseconds"') do set /a TOTAL+=%%t
)
set /a AVG=TOTAL/10
echo  Frontend avg response: %AVG%ms
echo Frontend: %AVG%ms avg >> %LOG%

echo [%DATE% %TIME%] Performance test done >> %LOG%
pause
goto MENU

:STATUS
cls
echo.
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; Write-Host ('BE: '+$r.StatusCode+' - '+(ConvertFrom-Json $r.Content).status)}catch{Write-Host 'BE: DOWN'}"
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:7400' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; Write-Host ('FE: '+$r.StatusCode)}catch{Write-Host 'FE: DOWN'}"
echo.
echo Backend log: %~dp0..\backend\.server.log
echo Deploy log: %LOG%
echo.
pause
goto MENU

:BACKUP_DB
if not exist "%~dp0..\backups" mkdir "%~dp0..\backups"
set FILE=backups\meterverse_%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.sql
echo Backing up to %FILE%...
docker exec meter-postgres-1 pg_dump -U postgres meter_pulse > "%~dp0..\%FILE%" 2>nul
if %errorlevel%==0 (
    echo ✅ Backup saved: %FILE%
    echo [%DATE% %TIME%] Backup: %FILE% (%errorlevel%) >> %LOG%
) else (
    echo ❌ Backup failed (Docker not running?)
    echo [%DATE% %TIME%] Backup FAILED >> %LOG%
)
exit /b

:VERIFY
echo.
echo ═══ Verification ═══
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo ✅ Backend reachable) else (echo ❌ Backend not reachable)

PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:7400' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo ✅ Frontend reachable) else (echo ❌ Frontend not reachable)

if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    echo ✅ Frontend build exists
) else (
    echo ❌ Frontend build missing
)
exit /b
