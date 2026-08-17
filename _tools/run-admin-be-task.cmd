@echo off
rem P13.4 - Admin BE task wrapper (absolute node path for Task Scheduler)
set JWT_SECRET=dev_secret_meter_pulse_2026
set DATABASE_URL=postgresql://postgres:postgres@localhost:5433/meter_pulse
set PORT=3131
set CORS_ORIGIN=http://localhost:3535
cd /d D:\meter\backend
"C:\Program Files\nodejs\node.exe" src/server.js
