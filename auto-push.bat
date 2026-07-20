@echo off
title MeterVerse Auto-Push
cd /d "%~dp0"

echo ========================================
echo    MeterVerse Auto-Push to GitHub
echo ========================================
echo.
echo Adding all changes...
git add -A

echo.
echo Committing with auto timestamp...
git commit -m "Auto-update %DATE% %TIME%"

echo.
echo Pushing to origin clean-main:main...
git push origin clean-main:main

echo.
echo ========================================
if %errorlevel% equ 0 (
    echo    PUSH SUCCESSFUL
) else (
    echo    PUSH FAILED - Check errors above
)
echo ========================================
echo.
pause
