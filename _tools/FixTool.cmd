@echo off
title MeterVerse Fix Tool
cd /d "%~dp0"
setlocal enabledelayedexpansion

cls
echo.
echo ===== MeterVerse Safety Fix Tool =====
echo.
echo Scans and repairs dangerous kill-all-node commands.
echo.

set FIXED=0
set SAFE=0

for %%f in ("%~dp0*.cmd") do (
    set NAME=%%~nxf
    set FILE=%%f
    
    :: Check for the exact dangerous command pattern
    findstr /C:"taskkill /F /IM node.exe" "%%f" >nul 2>nul
    if !errorlevel!==0 (
        echo [REPAIRING] !NAME!
        call :REPAIR "%%f"
        set /a FIXED+=1
    ) else (
        echo [OK] !NAME!
        set /a SAFE+=1
    )
)

echo.
echo ===== Complete =====
echo Files repaired: %FIXED%
echo Files safe:     %SAFE%
echo.
if %FIXED% GTR 0 echo ✅ Dangerous commands have been replaced.
if %FIXED%==0 echo ✅ All tools are already safe.
echo.
pause
goto :EOF

:REPAIR
set FILE=%~1
set TEMP=%FILE%.safe

:: Read the file line by line, replace the dangerous pattern
(
    for /f "usebackq delims=" %%a in ("%FILE%") do (
        set LINE=%%a
        set LINE=!LINE:taskkill /F /IM node.exe 2^>nul =taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2^>nul !
        set LINE=!LINE:taskkill /F /IM node.exe 2^>nul=taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2^>nul!
        set LINE=!LINE:taskkill /F /IM node.exe =taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" !
        echo !LINE!
    )
) > "%TEMP%"

:: Only replace if the fix worked
findstr /C:"taskkill /F /IM node.exe" "%TEMP%" >nul 2>nul
if !errorlevel!==1 (
    move /Y "%TEMP%" "%FILE%" >nul
    echo   ✅ Fixed
) else (
    echo   ❌ Fix failed — pattern still present
    del "%TEMP%" 2>nul
)
exit /b
