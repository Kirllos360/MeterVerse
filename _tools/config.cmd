@echo off
:: MeterVerse Tool Configuration — Shared settings for all tools
:: Edit this file to change ports, paths, and repo settings
:: P54: Admin (:3535) and Portal (:3030) are SEPARATE standalone apps.

set ADMIN_BE_PORT=3131
set ADMIN_FE_PORT=3535
set PORTAL_BE_PORT=3003
set PORTAL_FE_PORT=3030

set DB_PORT=5433
set DB_USER=meter_pulse
set DB_PASS=meter_pulse_dev
set DB_NAME=meter_pulse
set CONTAINER_DB=meter-postgres-1
set GIT_REMOTE=origin
set GIT_BRANCH=clean-main

set LOG_DIR=%~dp0logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set LM=%LOG_DIR%\main.log
set LE=%LOG_DIR%\errors.log
set LB=%LOG_DIR%\backend.log
set LF=%LOG_DIR%\frontend.log
set LPF=%LOG_DIR%\portal-fe.log
set LPB=%LOG_DIR%\portal-be.log

:: Backward-compat aliases
set BE_PORT=%ADMIN_BE_PORT%
set FE_PORT=%ADMIN_FE_PORT%
