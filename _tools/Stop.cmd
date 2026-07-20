@echo off
:: SAFE — only kills MeterVerse windows, NOT system-wide node.exe
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Backend" 2>nul >nul
taskkill /F /FI "WINDOWTITLE eq MeterVerse-Frontend" 2>nul >nul
echo MeterVerse services stopped.
pause
