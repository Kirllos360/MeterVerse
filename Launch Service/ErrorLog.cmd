@echo off
:: ErrorLog.cmd — Called by Launch.cmd when errors are detected
:: Logs the error details with timestamp
set ERROR_MSG=%1
set ERROR_DETAIL=%2

set LOG_DIR=%~dp0logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set LOG_FILE=%LOG_DIR%\errors.log

echo ────────────────────────────────────── >> %LOG_FILE%
echo [%DATE% %TIME%] %ERROR_MSG% >> %LOG_FILE%
echo Detail: %ERROR_DETAIL% >> %LOG_FILE%

:: Capture recent backend error output
if exist "%~dp0..\backend\.server.log" (
    type "%~dp0..\backend\.server.log" >> %LOG_FILE% 2>nul
)

:: Log system info
systeminfo | findstr /C:"Total Physical Memory" /C:"Available Physical Memory" >> %LOG_FILE% 2>nul

echo ────────────────────────────────────── >> %LOG_FILE%

exit /b 0
