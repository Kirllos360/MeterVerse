@echo off
:: MeterVerse Portal BE launcher (PORTAL_MODE on :3003) - session-independent scheduled task
set JWT_SECRET=dev_secret_meter_pulse_2026
set DATABASE_URL=postgresql://postgres:postgres@localhost:5433/meter_pulse
set PORT=3003
set PORTAL_MODE=1
cd /d D:\meter\backend
start "MeterVerse-PortalAPI" /b "C:\Program Files\nodejs\node.exe" src/server.js
