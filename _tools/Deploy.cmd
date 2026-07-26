@echo off
title MeterVerse Deployment
cd /d "%~dp0.."
setlocal enabledelayedexpansion
call "%~dp0config.cmd"

set LOG=%LOG_DIR%\deploy.log
echo [%DATE% %TIME%] === DEPLOYMENT STARTED === > %LOG%

:MENU
cls
echo.
echo  ===== MeterVerse Deployment =====
echo.
echo  1. Full Production Deploy
echo  2. Build Frontend Only
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
echo === Full Production Deploy ===
echo [%DATE% %TIME%] Starting deploy >> %LOG%

:: Step 1: Pull latest
echo [1/6] Pulling latest code...
git pull %GIT_REMOTE% %GIT_BRANCH% 2>>%LOG%
echo [%DATE% %TIME%] Git pull done >> %LOG%

:: Step 2: Backup
echo [2/6] Backing up database...
call :BACKUP_DB
echo [%DATE% %TIME%] Backup done >> %LOG%

:: Step 3: Backend deps
echo [3/6] Backend dependencies...
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

:: Step 5: DB migration
echo [5/6] Database migration...
cd /d "%~dp0..\backend"
call npx prisma db push 2>>%LOG%
cd /d "%~dp0.."
echo [%DATE% %TIME%] Migration done >> %LOG%

:: Step 6: Verify
echo [6/6] Verifying...
call :VERIFY

echo [%DATE% %TIME%] Deploy complete >> %LOG%
pause
goto MENU

:BUILD
cls
cd /d "%~dp0..\Frontend"
call npm install --silent
call npx next build
if %errorlevel%==0 (echo Build OK) else (echo Build FAILED)
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
echo Available backups:
dir /b "%~dp0..\backups\*.sql" 2>nul || echo (no backups found)
set /p file="Enter backup filename: "
if exist "%~dp0..\backups\%file%" (
    docker exec -i %CONTAINER_DB% psql -U %DB_USER% %DB_NAME% < "%~dp0..\backups\%file%" 2>nul
    if %errorlevel%==0 (echo Restore OK) else (echo Restore FAILED)
    echo [%DATE% %TIME%] Restore: %file% >> %LOG%
) else (echo File not found)
pause
goto MENU

:PERF
cls
echo Running performance tests...
echo [%DATE% %TIME%] Performance test >> %LOG%
set TOTAL=0
for /l %%i in (1,1,10) do (
    for /f %%t in ('PowerShell -Command "(Measure-Command {try{Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop}catch{}).TotalMilliseconds"') do set /a TOTAL+=%%t
)
set /a AVG=TOTAL/10
echo  Backend avg: %AVG%ms
echo Backend: %AVG%ms avg >> %LOG%
pause
goto MENU

:STATUS
cls
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; Write-Host ('BE: '+$r.StatusCode)}catch{Write-Host 'BE: DOWN'}"
docker ps --filter "name=%CONTAINER_DB%" --format "DB: {{.Status}}" 2>nul
echo Log: %LOG%
pause
goto MENU

:BACKUP_DB
if not exist "%~dp0..\backups" mkdir "%~dp0..\backups"
set FILE=backups\meterverse_%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.sql
docker exec %CONTAINER_DB% pg_dump -U %DB_USER% %DB_NAME% > "%~dp0..\%FILE%" 2>nul
if %errorlevel%==0 (echo Backup: %FILE%) else (echo Backup FAILED)
echo [%DATE% %TIME%] Backup: %FILE% >> %LOG%
exit /b

:VERIFY
PowerShell -Command "try{$r=Invoke-WebRequest -Uri 'http://localhost:%BE_PORT%/api/health' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; exit 0}catch{exit 1}" 2>nul
if %errorlevel%==0 (echo BE: OK) else (echo BE: DOWN)
if exist "%~dp0..\Frontend\.next\BUILD_ID" (echo FE Build: OK) else (echo FE Build: MISSING)
exit /b
