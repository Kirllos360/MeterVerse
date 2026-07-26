@echo off
title GitPush
cd /d "%~dp0.."
call "%~dp0config.cmd"

echo Pushing to %GIT_REMOTE%/%GIT_BRANCH%...
git add -A
git commit -m "Update %DATE% %TIME%"
git push %GIT_REMOTE% %GIT_BRANCH%
if %errorlevel%==0 (echo OK) else (echo FAIL)
pause
