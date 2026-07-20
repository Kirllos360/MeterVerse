@echo off
title MeterVerse
cd /d "%~dp0.."
taskkill /F /IM node.exe 2>nul >nul
timeout /t 1 /nobreak >nul
start /b "" cmd /c "cd /d %~dp0..\backend && node src/server.js" > "%~dp0logs\be.log" 2>&1
echo Backend started
if exist "%~dp0..\Frontend\.next\BUILD_ID" (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next start -p 7400" > "%~dp0logs\fe.log" 2>&1
) else (
    start /b "" cmd /c "cd /d %~dp0..\Frontend && npx next dev -p 7400" > "%~dp0logs\fe.log" 2>&1
)
echo Frontend started
echo http://localhost:7400/admin
echo admin@meterverse.com / Admin@123
pause
