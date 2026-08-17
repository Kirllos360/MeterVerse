@echo off
:: P13.5 - Admin Backend launcher (detached node via WMI + start, session-independent)
:: Launched by Runtime.cmd / directly. node runs in background of the spawned cmd.
set JWT_SECRET=dev_secret_meter_pulse_2026
set DATABASE_URL=postgresql://postgres:postgres@localhost:5433/meter_pulse
set PORT=3131
set CORS_ORIGIN=http://localhost:3535
cd /d D:\meter\backend
start "MeterVerse-AdminAPI" /b "C:\Program Files\nodejs\node.exe" src/server.js
