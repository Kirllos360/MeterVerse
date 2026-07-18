@echo off
cd /d "%~dp0Frontend"
echo Starting MeterVerse Admin Platform on port 7500...
echo Access at: http://localhost:7500/admin
npx next dev -p 7500
pause
