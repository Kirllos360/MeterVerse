@echo off
title MeterVerse Platform Launcher
cd /d "%~dp0"

echo ========================================
echo    MeterVerse Platform Launcher v2
echo ========================================
echo.
echo [1] Start All Services (recommended)
echo [2] Start Frontend Only (port 7400)
echo [3] Start Backend Only (port 3001)
echo [4] Stop All Services
echo [5] Exit
echo.
choice /c 12345 /n /m "Select option (1-5): "

if errorlevel 5 goto :eof
if errorlevel 4 goto stop_all
if errorlevel 3 goto start_be
if errorlevel 2 goto start_fe
if errorlevel 1 goto start_all

:start_all
echo.
echo Starting Backend on http://localhost:3001 ...
start "MeterVerse Backend" cmd /c "cd /d "%~dp0backend" && node src/server.js"
timeout /t 3 /nobreak >nul

echo Starting Frontend on http://localhost:7400 ...
cd /d "%~dp0Frontend"
if exist ".next\BUILD_ID" (
  start "MeterVerse Frontend" cmd /c "npx next start -p 7400"
) else (
  start "MeterVerse Frontend" cmd /c "npx next dev -p 7400"
)
echo.
echo Both services starting. Access:
echo   Frontend: http://localhost:7400
echo   Backend:  http://localhost:3001
echo   Login:    admin@meterverse.com / Admin@123
echo.
echo Close the server windows to stop, or run option 4.
pause
goto :eof

:start_fe
echo.
echo Starting Frontend on http://localhost:7400 ...
cd /d "%~dp0Frontend"
if exist ".next\BUILD_ID" (
  start "MeterVerse Frontend" cmd /c "npx next start -p 7400 & pause"
) else (
  start "MeterVerse Frontend" cmd /c "npx next dev -p 7400 & pause"
)
goto :eof

:start_be
echo.
echo Starting Backend on http://localhost:3001 ...
start "MeterVerse Backend" cmd /c "cd /d "%~dp0backend" && node src/server.js & pause"
goto :eof

:stop_all
echo.
echo Stopping all MeterVerse services...
taskkill /F /FI "WINDOWTITLE eq MeterVerse*" 2>nul
taskkill /F /IM node.exe 2>nul
echo Done.
timeout /t 2 /nobreak >nul
goto :eof
