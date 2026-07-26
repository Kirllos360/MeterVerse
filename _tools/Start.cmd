@echo off
title MeterVerse
cd /d "%~dp0.."
call "%~dp0config.cmd"

:: Set development environment
set NODE_ENV=development
set JWT_SECRET=dev-secret-for-local

call "%~dp0SafetyCheck.cmd" >nul 2>nul

:: Kill any existing processes on our ports
echo Stopping any existing services...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%BE_PORT% "') do (
  if not "%%p"=="0" taskkill /F /PID %%p 2>nul >nul
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%FE_PORT% "') do (
  if not "%%p"=="0" taskkill /F /PID %%p 2>nul >nul
)
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 3 /nobreak >nul

:: Check PostgreSQL
docker ps --filter "name=%CONTAINER_DB%" --format "{{.Status}}" 2>nul | findstr "Up" >nul 2>nul
if %errorlevel%==0 (
    echo Database: RUNNING
) else (
    echo Database: STARTING via Docker...
    docker compose up -d postgres 2>nul
    timeout /t 8 /nobreak >nul
)

:: Start Backend
start "MeterVerse-Backend" cmd /c "set NODE_ENV=development && set JWT_SECRET=dev-secret && cd /d %~dp0..\backend && node src/server.js"
echo Backend starting on port %BE_PORT%

:: Start Frontend (production if build exists, dev otherwise)
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%"
    echo Frontend starting on port %FE_PORT% (production mode)
) else (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%"
    echo Frontend starting on port %FE_PORT% (dev mode)
)

echo.
echo http://localhost:%FE_PORT%/admin
echo.
pause
