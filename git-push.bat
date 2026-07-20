@echo off
title MeterVerse Auto-Push
cd /d "%~dp0"

echo ========================================
echo    Opening Git Bash for auto-push...
echo ========================================

start "" "C:\Program Files\Git\git-bash.exe" -c "./auto-push.sh; exec bash"
