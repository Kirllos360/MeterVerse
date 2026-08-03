@echo off
title MeterVerse OS - Start
cd /d "%~dp0.."
call "%~dp0config.cmd"

:: Set development environment
set NODE_ENV=development
set JWT_SECRET=dev-secret-for-local
set CORS_ORIGIN=http://localhost:3030,http://localhost:3535

:: Stop any existing services on our ports
echo Stopping any existing services...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%BE_PORT% "') do (
  if not "%%p"=="0" taskkill /F /PID %%p 2>nul >nul
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%FE_PORT% "') do (
  if not "%%p"=="0" taskkill /F /PID %%p 2>nul >nul
)
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminAPI" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminConsole" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalAPI" 2>nul >nul
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

:: Start Admin Backend (:3131)
start "MeterVerse-AdminAPI" cmd /c "cd /d %~dp0..\backend && set NODE_ENV=development && set JWT_SECRET=%JWT_SECRET% && set CORS_ORIGIN=%CORS_ORIGIN% && set PORT=%BE_PORT% && node src/server.js"
echo Admin API starting on port %BE_PORT%

:: Start Admin Frontend (:3535) â€” production if build exists, dev otherwise
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-AdminConsole" cmd /c "cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:%BE_PORT% && call node_modules\.bin\next.cmd start -p %FE_PORT%"
    echo Admin Console starting on port %FE_PORT% (production mode)
) else (
    start "MeterVerse-AdminConsole" cmd /c "cd /d %~dp0..\Frontend && set NEXT_PUBLIC_API_URL=http://localhost:%BE_PORT% && call node_modules\.bin\next.cmd dev -p %FE_PORT%"
    echo Admin Console starting on port %FE_PORT% (dev mode)
)

echo.
echo MeterVerse OS:
echo   Admin Console : http://localhost:%FE_PORT%/admin   (Admin API :%BE_PORT%)
echo   Portal API    : http://localhost:3003/api/health   (run portal:backend)
echo.
pause
