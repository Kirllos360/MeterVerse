@echo off
title MeterVerse Git Push
cd /d "%~dp0.."
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    Push to GitHub
echo ========================================
echo.
echo  Repository: origin clean-main ^> main
echo.

git add -A
git commit -m "Update %DATE% %TIME%"

echo.
echo  Pushing...
git push origin clean-main:main

echo.
if %errorlevel%==0 (
    echo  ✅ PUSH SUCCESSFUL
) else (
    echo  ❌ PUSH FAILED
)
echo.
pause
