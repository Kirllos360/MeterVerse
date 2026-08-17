@echo off
rem P13.4 - Native Admin Backend (direct exec, env set here, survives tool session)
set JWT_SECRET=dev_secret_meter_pulse_2026
set DATABASE_URL=postgresql://postgres:postgres@localhost:5433/meter_pulse
set PORT=3131
set CORS_ORIGIN=http://localhost:3535
cd /d D:\meter\backend
node src/server.js
