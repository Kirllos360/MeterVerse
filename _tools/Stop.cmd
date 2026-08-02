@echo off
title MeterVerse OS - Stop
cd /d "%~dp0.."
call "%~dp0config.cmd"

:: SAFE — only kills MeterVerse OS windows, NOT system-wide node.exe
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminAPI" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-AdminConsole" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalAPI" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-PortalConsole" 2>nul >nul

:: Also free the canonical ports if any process still holds them
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%BE_PORT% "') do (
  if not "%%p"=="0" taskkill /F /PID %%p 2>nul >nul
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%FE_PORT% "') do (
  if not "%%p"=="0" taskkill /F /PID %%p 2>nul >nul
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3003 "') do (
  if not "%%p"=="0" taskkill /F /PID %%p 2>nul >nul
)
echo MeterVerse OS services stopped.
pause
