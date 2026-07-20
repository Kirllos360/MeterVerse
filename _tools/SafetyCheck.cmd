@echo off
:: ─── SAFETY CHECK ─────────────────────────────────────────────────────────────
::  Prevents dangerous commands from ever running in MeterVerse tools.
::  Called by MainControl.cmd and Start.cmd at startup.
:: ───────────────────────────────────────────────────────────────────────────────

:: Block: Check if THIS file contains any dangerous kill-all-node commands
findstr /B /I "taskkill" "%~f0" | findstr /I "node.exe" >nul 2>nul
if %errorlevel%==0 (
    echo.
    echo ╔══════════════════════════════════════════════╗
    echo ║  ⚠ DANGEROUS CODE DETECTED                  ║
    echo ║  This file contains a kill-all-node command  ║
    echo ║  that would crash Windows. REFUSING TO RUN.  ║
    echo ╚══════════════════════════════════════════════╝
    pause
    exit /b 1
)

:: Verify all .cmd files in tools folder are safe
set DANGER=0
for %%f in ("%~dp0*.cmd") do (
    findstr /B /I "taskkill" "%%f" 2>nul | findstr /I "node.exe" >nul 2>nul
    if !errorlevel!==0 (
        echo ⚠ WARNING: %%~nf contains a kill-all-node command!
        set DANGER=1
    )
)

if "%DANGER%"=="1" (
    echo.
    echo ⚠ Kill-all-node commands found in tool files.
    echo   These can crash Windows. Use FixTool.cmd to repair.
    echo.
    pause
)

exit /b 0
