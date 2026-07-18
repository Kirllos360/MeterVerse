@echo off
title MeterVerse Platform Launcher
cd /d "%~dp0Frontend"

echo ========================================
echo    MeterVerse Platform Launcher
echo ========================================
echo.
echo [1] Start Main System (port 7400)
echo [2] Start Admin Platform (port 7500)
echo [3] Start Both
echo [4] Exit
echo.
choice /c 1234 /n /m "Select option (1-4): "

if errorlevel 4 goto :eof
if errorlevel 3 goto both
if errorlevel 2 goto admin
if errorlevel 1 goto main

:main
echo Starting Main System on http://localhost:7400 ...
start "MeterVerse Main" cmd /c "npx next dev -p 7400 & pause"
goto :eof

:admin
echo Starting Admin Platform on http://localhost:7500/admin/login ...
start "MeterVerse Admin" cmd /c "npx next dev -p 7500 & pause"
goto :eof

:both
echo Starting Main System on http://localhost:7400 ...
start "MeterVerse Main" cmd /c "npx next dev -p 7400"
timeout /t 3 /nobreak >nul
echo Starting Admin Platform on http://localhost:7500/admin/login ...
start "MeterVerse Admin" cmd /c "npx next dev -p 7500"
echo.
echo Both servers starting. Access:
echo   Main:  http://localhost:7400
echo   Admin: http://localhost:7500/admin/login
pause
goto :eof
