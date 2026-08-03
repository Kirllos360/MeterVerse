@echo off
:: MeterVerse Tool Configuration â€” Shared settings for all tools
:: Edit this file to change ports, paths, and repo settings

set BE_PORT=3131
set FE_PORT=3535
set DB_PORT=5432
set DB_USER=meter_pulse
set DB_PASS=meter_pulse_dev
set DB_NAME=meter_pulse
set CONTAINER_DB=meter-postgres-1
set GIT_REMOTE=origin
set GIT_BRANCH=clean-main
set LOG_DIR=%~dp0logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
