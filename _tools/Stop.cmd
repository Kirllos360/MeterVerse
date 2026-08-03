@echo off
title MeterVerse OS - Stop
setlocal enabledelayedexpansion
cd /d "%~dp0.."
call "%~dp0config.cmd"

echo [%DATE% %TIME%] [SYS] Stop invoked >> "%LM%"

:: SAFE — only kills MeterVerse OS windows, NOT system-wide node.exe
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminAPI" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminConsole" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalAPI" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalConsole" 2>nul >nul

:: Free the canonical ports if any process still holds them
for %%P in (%ADMIN_BE_PORT% %ADMIN_FE_PORT% %PORTAL_BE_PORT% %PORTAL_FE_PORT%) do (
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%%P "') do (
        if not "%%p"=="0" taskkill /F /PID %%p 2>nul >nul
    )
)

echo [%DATE% %TIME%] [SYS] Services stopped >> "%LM%"
echo MeterVerse OS services stopped (Admin :%ADMIN_FE_PORT% + Portal :%PORTAL_FE_PORT%).
pause
