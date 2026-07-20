@echo off
:: AutoFix.cmd — Called by Launch.cmd when a service fails
:: Tries common fixes automatically
cd /d "%~dp0.."
set BE_STATUS=%1
set FE_STATUS=%2

set LOG_DIR=%~dp0logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set FIX_LOG=%LOG_DIR%\autofix.log

echo [%DATE% %TIME%] AutoFix: BE=%BE_STATUS% FE=%FE_STATUS% >> %FIX_LOG%

:: Fix 1: Kill orphaned node processes (zombie processes)
tasklist /FI "WINDOWTITLE eq MeterVerse*" 2>nul | findstr /I "node.exe" >nul 2>nul
if %errorlevel%==1 (
    taskkill /F /IM node.exe 2>nul >nul
    timeout /t 2 /nobreak >nul
    echo [%DATE% %TIME%] Fix1: Killed orphaned node processes >> %FIX_LOG%
)

:: Fix 2: Check disk space
dir %~dp0.. 2>nul | findstr "bytes free" >nul 2>nul

:: Fix 3: Clear temp cache if frontend is down
if "%FE_STATUS%"=="0" (
    if exist "%~dp0..\Frontend\.next\cache" (
        rmdir /s /q "%~dp0..\Frontend\.next\cache" 2>nul >nul
        echo [%DATE% %TIME%] Fix3: Cleared Next.js cache >> %FIX_LOG%
    )
)

exit /b 0
