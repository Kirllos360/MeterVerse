@echo off
title GitPush
cd /d "%~dp0.."
echo Pushing...
git add -A
git commit -m "Update %DATE% %TIME%"
git push origin clean-main
if %errorlevel%==0 (echo OK) else (echo FAIL)
pause
