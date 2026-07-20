@echo off
title MeterVerse
cd /d "%~dp0.."

:: Safety check — prevents dangerous commands
call "%~dp0SafetyCheck.cmd" >nul 2>nul

:: SAFE — only kills MeterVerse windows, NOT system-wide node.exe
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
timeout /t 2 /nobreak >nul

start "MeterVerse-Backend" cmd /c "cd /d %~dp0backend && node src/server.js"
echo Backend started

if exist "%~dp0Frontend\.next\BUILD_ID" (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0Frontend && npx next start -p 7400"
) else (
    start "MeterVerse-Frontend" cmd /c "cd /d %~dp0Frontend && npx next dev -p 7400"
)
echo Frontend started
echo http://localhost:7400/admin
echo admin@meterverse.com / Admin@123
pause
