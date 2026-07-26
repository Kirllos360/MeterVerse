@echo off
title MeterVerse
cd /d "%~dp0.."
call "%~dp0config.cmd"

call "%~dp0SafetyCheck.cmd" >nul 2>nul

:: SAFE — only kills MeterVerse windows
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 2 /nobreak >nul

:: Check PostgreSQL
docker ps --filter "name=%CONTAINER_DB%" --format "{{.Status}}" 2>nul | findstr "Up" >nul 2>nul
if %errorlevel%==0 (
    echo Database: RUNNING
) else (
    echo Database: STARTING via Docker...
    docker compose up -d postgres 2>nul
    timeout /t 8 /nobreak >nul
)

start "MeterVerse-Backend" cmd /c "cd /d %~dp0..\backend && node src/server.js"
echo Backend starting on port %BE_PORT%

if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next start -p %FE_PORT%"
) else (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p %FE_PORT%"
)
echo Frontend starting on port %FE_PORT%
echo.
echo http://localhost:%FE_PORT%/admin
echo.
pause
